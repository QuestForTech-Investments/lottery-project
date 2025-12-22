/**
 * Lottery Results Scraper
 *
 * This script scrapes lottery results from la-numbers.apk.lol and syncs them
 * to our API using Playwright for browser automation.
 *
 * Usage: node scrape-results.cjs [--date YYYY-MM-DD]
 *
 * Environment variables:
 *   LOTO_USER - Username for la-numbers.apk.lol (default: oliver)
 *   LOTO_PASS - Password for la-numbers.apk.lol (default: oliver0597@)
 *   API_URL - URL of our API (default: http://localhost:5000)
 *   API_USER - API username for authentication (default: admin)
 *   API_PASS - API password for authentication (default: Admin123456)
 */

const { chromium } = require('playwright');

// Configuration
const config = {
  lotoUrl: 'https://la-numbers.apk.lol',
  lotoUser: process.env.LOTO_USER || 'oliver',
  lotoPass: process.env.LOTO_PASS || 'oliver0597@',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  apiUser: process.env.API_USER || 'admin',
  apiPass: process.env.API_PASS || 'Admin123456',
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let date = new Date().toISOString().split('T')[0]; // Today's date

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' && args[i + 1]) {
      date = args[i + 1];
      i++;
    }
  }

  return { date };
}

// Get API token
async function getApiToken() {
  const response = await fetch(`${config.apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: config.apiUser,
      password: config.apiPass,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate with API: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
}

// Scrape results from la-numbers.apk.lol
async function scrapeResults(date) {
  console.log(`[${new Date().toISOString()}] Starting scrape for date: ${date}`);

  const browser = await chromium.launch({
    headless: true, // Set to false for debugging
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    console.log('[STEP 1] Navigating to login page...');
    await page.goto(config.lotoUrl, { waitUntil: 'networkidle' });

    // Check if already logged in or need to login
    const loginButton = await page.$('button:has-text("INICIAR")');
    if (loginButton) {
      console.log('[STEP 2] Logging in...');

      // Fill login form
      await page.fill('input[type="text"]', config.lotoUser);
      await page.fill('input[type="password"]', config.lotoPass);
      await page.click('button:has-text("INICIAR")');

      // Wait for navigation after login
      await page.waitForTimeout(3000);
    }

    // Navigate to results page
    console.log('[STEP 3] Navigating to results page...');
    await page.goto(`${config.lotoUrl}/#/results`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Wait for results table to load
    console.log('[STEP 4] Waiting for results table...');
    await page.waitForSelector('table', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Extract results from table
    console.log('[STEP 5] Extracting results...');
    const results = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const data = [];

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          // Get lottery name from first cell
          const nameCell = cells[0];
          const name = nameCell.textContent?.trim() || '';

          // Skip empty rows
          if (!name) return;

          // Get numbers from next cells
          const num1 = cells[1]?.textContent?.trim() || '';
          const num2 = cells[2]?.textContent?.trim() || '';
          const num3 = cells[3]?.textContent?.trim() || '';

          // Get additional columns if present (Cash3, Play4, Pick5)
          const cash3 = cells[4]?.textContent?.trim() || '';
          const play4 = cells[5]?.textContent?.trim() || '';
          const pick5 = cells[6]?.textContent?.trim() || '';

          data.push({
            name,
            num1,
            num2,
            num3,
            cash3: cash3 || null,
            play4: play4 || null,
            pick5: pick5 || null,
          });
        }
      });

      return data;
    });

    console.log(`[STEP 6] Extracted ${results.length} results`);

    // Log first few results for verification
    if (results.length > 0) {
      console.log('Sample results:');
      results.slice(0, 5).forEach(r => {
        console.log(`  ${r.name}: ${r.num1}-${r.num2}-${r.num3}`);
      });
    }

    await browser.close();
    return results;

  } catch (error) {
    console.error('Error during scraping:', error);
    await browser.close();
    throw error;
  }
}

// Sync results to our API
async function syncResults(results, date, token) {
  console.log(`[SYNC] Syncing ${results.length} results to API...`);

  const response = await fetch(`${config.apiUrl}/api/results/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      date,
      results,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to sync results: ${response.status} - ${text}`);
  }

  const data = await response.json();
  return data;
}

// Main function
async function main() {
  const { date } = parseArgs();

  console.log('='.repeat(60));
  console.log('LOTTERY RESULTS SCRAPER');
  console.log('='.repeat(60));
  console.log(`Date: ${date}`);
  console.log(`Source: ${config.lotoUrl}`);
  console.log(`Target API: ${config.apiUrl}`);
  console.log('='.repeat(60));

  try {
    // Step 1: Get API token
    console.log('\n[AUTH] Authenticating with API...');
    const token = await getApiToken();
    console.log('[AUTH] Successfully authenticated');

    // Step 2: Scrape results
    console.log('\n[SCRAPE] Starting browser scraping...');
    const results = await scrapeResults(date);

    if (results.length === 0) {
      console.log('[WARN] No results found to sync');
      return;
    }

    // Step 3: Sync to API
    console.log('\n[SYNC] Syncing results to API...');
    const syncResult = await syncResults(results, date, token);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total received: ${syncResult.totalReceived}`);
    console.log(`Matched: ${syncResult.matched}`);
    console.log(`Updated: ${syncResult.updated}`);
    console.log(`Created: ${syncResult.created}`);
    console.log(`Skipped: ${syncResult.skipped}`);

    if (syncResult.errors?.length > 0) {
      console.log('\nErrors:');
      syncResult.errors.forEach(e => console.log(`  - ${e}`));
    }

    if (syncResult.details?.length > 0) {
      console.log('\nDetails:');
      syncResult.details.forEach(d => {
        console.log(`  [${d.status.toUpperCase()}] ${d.drawName}`);
        if (d.oldValue && d.newValue) {
          console.log(`    ${d.oldValue} -> ${d.newValue}`);
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log(syncResult.success ? 'SYNC COMPLETED SUCCESSFULLY' : 'SYNC COMPLETED WITH ISSUES');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n[ERROR] Sync failed:', error.message);
    process.exit(1);
  }
}

// Run
main();
