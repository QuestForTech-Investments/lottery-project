#!/usr/bin/env node
/**
 * Results Monitor Script
 *
 * This script monitors lottery results from the lotocompany API and syncs them
 * to the local API every 5 minutes.
 *
 * Usage:
 *   node scripts/results-monitor.js          # Run once
 *   node scripts/results-monitor.js --daemon # Run continuously every 5 minutes
 *
 * Requirements:
 *   npm install playwright (for login to get token)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  sourceUrl: 'https://la-numbers.apk.lol',
  sourceApiUrl: 'https://api.lotocompany.com/api/v1',
  sourceCredentials: {
    username: 'oliver',
    password: 'oliver0597@'
  },
  localApi: {
    baseUrl: 'http://127.0.0.1:5000',
    credentials: {
      username: 'admin',
      password: 'Admin123456'
    }
  },
  tokenFile: path.join(__dirname, '.source-token.json'),
  intervalMinutes: 5,
  headless: true
};

// Logger utility
const log = {
  info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`),
  success: (msg) => console.log(`[${new Date().toISOString()}] SUCCESS: ${msg}`),
  error: (msg) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`),
  warn: (msg) => console.warn(`[${new Date().toISOString()}] WARN: ${msg}`)
};

// Cache for source token
let sourceToken = null;
let sourceTokenExpiry = null;

/**
 * Get authentication token from local API
 */
async function getLocalApiToken() {
  const response = await fetch(`${CONFIG.localApi.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CONFIG.localApi.credentials)
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate with local API: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Read token from file cache
 */
function readTokenFromFile() {
  try {
    if (fs.existsSync(CONFIG.tokenFile)) {
      const data = JSON.parse(fs.readFileSync(CONFIG.tokenFile, 'utf8'));
      if (data.token && data.expiry && Date.now() < data.expiry) {
        return data.token;
      }
    }
  } catch (e) {
    log.warn(`Failed to read token file: ${e.message}`);
  }
  return null;
}

/**
 * Save token to file cache
 */
function saveTokenToFile(token, expiryMs = 30 * 60 * 1000) {
  try {
    const data = {
      token,
      expiry: Date.now() + expiryMs,
      savedAt: new Date().toISOString()
    };
    fs.writeFileSync(CONFIG.tokenFile, JSON.stringify(data, null, 2));
  } catch (e) {
    log.warn(`Failed to save token file: ${e.message}`);
  }
}

/**
 * Get authentication token from source application using Playwright
 */
async function getSourceToken() {
  // Return cached token if still valid
  if (sourceToken && sourceTokenExpiry && Date.now() < sourceTokenExpiry) {
    return sourceToken;
  }

  // Try to read from file cache
  const cachedToken = readTokenFromFile();
  if (cachedToken) {
    log.info('Using cached token from file.');
    sourceToken = cachedToken;
    sourceTokenExpiry = Date.now() + (30 * 60 * 1000);
    return cachedToken;
  }

  log.info('Getting new source API token via Playwright...');
  const browser = await chromium.launch({ headless: CONFIG.headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(CONFIG.sourceUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    // Check if we need to login
    const loginInput = await page.$('input[placeholder="Usuario"]');
    if (loginInput) {
      log.info('Logging in to source application...');
      await page.fill('input[placeholder="Usuario"]', CONFIG.sourceCredentials.username);
      await page.fill('input[placeholder="Contraseña"]', CONFIG.sourceCredentials.password);

      // Click login button using JavaScript
      await page.evaluate(() => {
        const btn = document.getElementById('log-in');
        if (btn) btn.click();
      });

      // Wait for navigation
      await page.waitForTimeout(8000);
    }

    // Get token from Vuex store
    const token = await page.evaluate(() => {
      const vuex = JSON.parse(localStorage.getItem('vuex') || '{}');
      return vuex.token || null;
    });

    if (!token) {
      throw new Error('Could not retrieve token from source application. Please manually save token to .source-token.json');
    }

    // Cache token for 30 minutes
    sourceToken = token;
    sourceTokenExpiry = Date.now() + (30 * 60 * 1000);
    saveTokenToFile(token);

    log.success('Source token retrieved and cached successfully!');
    return token;

  } finally {
    await browser.close();
  }
}

/**
 * Fetch results from source API
 */
async function fetchSourceResults(date) {
  const token = await getSourceToken();
  const currentDate = new Date().toISOString().split('T')[0];

  const url = `${CONFIG.sourceApiUrl}/results?date=${date}&currentDate=${currentDate}&category=1`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    // If token expired, clear cache and retry
    if (response.status === 401) {
      sourceToken = null;
      sourceTokenExpiry = null;
      throw new Error('Token expired, will retry with fresh token');
    }
    throw new Error(`Failed to fetch source results: ${response.status} - ${text}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Transform source API response to sync format
 */
function transformResults(apiResponse) {
  const results = [];

  // Process current day results
  if (apiResponse.resultsInformation) {
    for (const item of apiResponse.resultsInformation) {
      if (!item.isEmpty && item.result) {
        const r = item.result;
        results.push({
          name: item.sortitionInformation.name,
          num1: r.firstNumber?.toString() || '',
          num2: r.secondNumber?.toString() || '',
          num3: r.thirdNumber?.toString() || ''
        });
      }
    }
  }

  return results;
}

/**
 * Sync results to local API
 */
async function syncToLocalApi(results, date) {
  if (results.length === 0) {
    log.warn('No results to sync.');
    return { created: 0, updated: 0, skipped: 0 };
  }

  const token = await getLocalApiToken();

  const payload = {
    date: date,
    results: results
  };

  log.info(`Syncing ${results.length} results for ${date}...`);

  const response = await fetch(`${CONFIG.localApi.baseUrl}/api/results/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to sync results: ${response.status} - ${text}`);
  }

  return await response.json();
}

/**
 * Main monitoring function
 */
async function runMonitor() {
  log.info('Starting results monitor...');
  const today = new Date().toISOString().split('T')[0];

  try {
    // Fetch results from source API
    log.info(`Fetching results for ${today}...`);
    const apiResponse = await fetchSourceResults(today);

    // Transform to sync format
    const results = transformResults(apiResponse);

    if (results.length === 0) {
      log.warn(`No results with data found for ${today}. Skipping sync.`);
      return { synced: 0, date: today };
    }

    // Sync to local API
    const syncResult = await syncToLocalApi(results, today);

    log.success(`Sync completed! Created: ${syncResult.created || 0}, Updated: ${syncResult.updated || 0}, Skipped: ${syncResult.skipped || 0}`);

    return { synced: results.length, date: today, ...syncResult };

  } catch (error) {
    log.error(`Monitor failed: ${error.message}`);
    throw error;
  }
}

/**
 * Run as daemon (continuous monitoring)
 */
async function runDaemon() {
  log.info(`Starting daemon mode. Will run every ${CONFIG.intervalMinutes} minutes.`);

  const run = async () => {
    try {
      await runMonitor();
    } catch (error) {
      log.error(`Monitor cycle failed: ${error.message}`);
    }
  };

  // Run immediately
  await run();

  // Schedule subsequent runs
  setInterval(run, CONFIG.intervalMinutes * 60 * 1000);

  log.info('Daemon running. Press Ctrl+C to stop.');
}

// Main entry point
const isDaemon = process.argv.includes('--daemon');

if (isDaemon) {
  runDaemon().catch(error => {
    log.error(`Daemon failed to start: ${error.message}`);
    process.exit(1);
  });
} else {
  runMonitor()
    .then(result => {
      log.info(`Finished. Results: ${JSON.stringify(result)}`);
      process.exit(0);
    })
    .catch(error => {
      log.error(`Failed: ${error.message}`);
      process.exit(1);
    });
}
