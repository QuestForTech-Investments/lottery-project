#!/usr/bin/env node
/**
 * Results Sync Scraper
 * Scrapes lottery results from the original app (la-numbers.apk.lol) using Playwright
 * and syncs them to our local API.
 *
 * Usage: node sync-results-scraper.js
 *
 * Environment variables:
 *   LOTTERY_USERNAME - Username for la-numbers.apk.lol (default: oliver)
 *   LOTTERY_PASSWORD - Password for la-numbers.apk.lol (default: oliver0597@)
 *   API_URL - Local API URL (default: http://localhost:5000)
 *   API_USERNAME - API username (default: admin)
 *   API_PASSWORD - API password (default: Admin123456)
 */

const { chromium } = require('playwright');

// Configuration
const config = {
  originalApp: {
    url: 'https://la-numbers.apk.lol',
    username: process.env.LOTTERY_USERNAME || 'oliver',
    password: process.env.LOTTERY_PASSWORD || 'oliver0597@'
  },
  localApi: {
    url: process.env.API_URL || 'http://localhost:5000',
    username: process.env.API_USERNAME || 'admin',
    password: process.env.API_PASSWORD || 'Admin123456'
  }
};

async function getLocalApiToken() {
  const response = await fetch(`${config.localApi.url}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: config.localApi.username,
      password: config.localApi.password
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to login to local API: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
}

async function getDrawMappings(token) {
  const response = await fetch(`${config.localApi.url}/api/draws?pageSize=200`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to get draws: ${response.status}`);
  }

  const data = await response.json();
  const draws = data.items || data;

  // Create mapping from draw name to draw ID
  const mappings = {};
  draws.forEach(draw => {
    if (draw.isActive) {
      mappings[draw.drawName.toUpperCase()] = draw.drawId;
      // Also add common aliases
      if (draw.abbreviation) {
        mappings[draw.abbreviation.toUpperCase()] = draw.drawId;
      }
    }
  });

  return mappings;
}

async function syncResultToApi(token, drawId, winningNumber, date) {
  // First check if result exists
  const checkResponse = await fetch(
    `${config.localApi.url}/api/results?date=${date}&drawId=${drawId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  const existingResults = await checkResponse.json();
  const existing = (existingResults.items || existingResults).find(r => r.drawId === drawId);

  if (existing) {
    // Update existing result
    if (existing.winningNumber !== winningNumber) {
      const updateResponse = await fetch(
        `${config.localApi.url}/api/results/${existing.resultId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            drawId: drawId,
            winningNumber: winningNumber,
            resultDate: date
          })
        }
      );

      if (updateResponse.ok) {
        console.log(`  ✓ Updated: ${winningNumber}`);
        return 'updated';
      } else {
        console.log(`  ✗ Failed to update: ${updateResponse.status}`);
        return 'error';
      }
    } else {
      console.log(`  - Unchanged: ${winningNumber}`);
      return 'unchanged';
    }
  } else {
    // Create new result
    const createResponse = await fetch(
      `${config.localApi.url}/api/results`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          drawId: drawId,
          winningNumber: winningNumber,
          resultDate: date
        })
      }
    );

    if (createResponse.ok) {
      console.log(`  ✓ Created: ${winningNumber}`);
      return 'created';
    } else {
      console.log(`  ✗ Failed to create: ${createResponse.status}`);
      return 'error';
    }
  }
}

async function scrapeResults() {
  console.log('🎰 Results Sync Scraper');
  console.log('='.repeat(50));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(60000); // 60 seconds timeout

  try {
    // Step 1: Login to original app
    console.log('\n📱 Logging in to original app...');
    await page.goto(config.originalApp.url, { timeout: 60000 });

    // Wait for SPA to load - it redirects to /#/sessions/new
    console.log('  Waiting for SPA to initialize...');
    await page.waitForURL('**/sessions/new', { timeout: 30000 });
    console.log('  On login page');

    // Wait for Vue.js to render the form
    await page.waitForTimeout(3000);

    // Wait for login form with longer timeout
    await page.waitForSelector('input[placeholder="Usuario"]', { timeout: 30000, state: 'visible' });
    console.log('  Login form found');

    // Fill login form
    await page.fill('input[placeholder="Usuario"]', config.originalApp.username);
    await page.fill('input[placeholder="Contraseña"]', config.originalApp.password);
    console.log('  Credentials entered');

    // Click login button using JavaScript (to avoid overlay issues)
    await page.evaluate(() => document.getElementById('log-in').click());
    console.log('  Login button clicked');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    console.log('✓ Logged in successfully');

    // Step 2: Navigate to results page
    console.log('\n📋 Navigating to results page...');
    await page.goto(`${config.originalApp.url}/#/results`, { timeout: 30000 });
    await page.waitForURL('**/results', { timeout: 15000 });

    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✓ On results page');

    // Step 3: Extract results from table
    console.log('\n🔍 Extracting results...');
    const results = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const extracted = [];

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          const name = cells[0]?.textContent?.trim();
          const first = cells[1]?.querySelector('input')?.value || '';
          const second = cells[2]?.querySelector('input')?.value || '';
          const third = cells[3]?.querySelector('input')?.value || '';

          if (name && (first || second || third)) {
            extracted.push({
              name,
              first,
              second,
              third,
              winningNumber: `${first}${second}${third}`
            });
          }
        }
      });

      return extracted;
    });

    console.log(`✓ Found ${results.length} results with data`);

    // Step 4: Get local API token
    console.log('\n🔑 Authenticating with local API...');
    const token = await getLocalApiToken();
    console.log('✓ Got API token');

    // Step 5: Get draw mappings
    console.log('\n📊 Loading draw mappings...');
    const drawMappings = await getDrawMappings(token);
    console.log(`✓ Loaded ${Object.keys(drawMappings).length} draw mappings`);

    // Step 6: Sync results
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n🔄 Syncing results for ${today}...`);

    const stats = { created: 0, updated: 0, unchanged: 0, skipped: 0, errors: 0 };

    for (const result of results) {
      const drawId = drawMappings[result.name.toUpperCase()];

      if (!drawId) {
        console.log(`⚠ No mapping for: ${result.name}`);
        stats.skipped++;
        continue;
      }

      console.log(`\n${result.name} (ID: ${drawId})`);
      const status = await syncResultToApi(token, drawId, result.winningNumber, today);
      stats[status === 'error' ? 'errors' : status]++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📈 Sync Summary:');
    console.log(`   Created:   ${stats.created}`);
    console.log(`   Updated:   ${stats.updated}`);
    console.log(`   Unchanged: ${stats.unchanged}`);
    console.log(`   Skipped:   ${stats.skipped}`);
    console.log(`   Errors:    ${stats.errors}`);
    console.log('='.repeat(50));

    return { success: true, stats, results };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  scrapeResults()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { scrapeResults };
