#!/usr/bin/env node
/**
 * Extract Banca Information from Original App
 * Gets banca codes and names to create mapping to new system.
 */

const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function extractBancas() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  const bancasInfo = [];

  // Intercept API responses
  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('/api/')) return;
    if (response.status() !== 200) return;

    try {
      const json = await response.json();

      // Look for betting pools data
      if (json.bettingPools && Array.isArray(json.bettingPools)) {
        for (const bp of json.bettingPools) {
          bancasInfo.push({
            id: bp.id,
            code: bp.number,  // LAN-0001, LAN-0010, etc.
            owner: bp.owner,  // ISLA GORDA TL, GILBERTO TL, etc.
            displayName: bp.displayName || ''
          });
        }
      }
    } catch (e) { /* not JSON */ }
  });

  try {
    // Login
    console.error('Logging in...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Navigate to tickets page to trigger bettingPools load
    console.error('Loading bancas data...');
    await page.goto('https://la-numbers.apk.lol/#/tickets', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Output results
    console.error(`\nFound ${bancasInfo.length} bancas:\n`);

    // CSV header
    console.log('old_code,old_id,owner');

    // Sort by code
    bancasInfo.sort((a, b) => (a.code || '').localeCompare(b.code || ''));

    for (const b of bancasInfo) {
      const esc = (s) => s && (s.includes(',') || s.includes('"')) ? `"${s.replace(/"/g,'""')}"` : (s || '');
      console.log(`${b.code},${b.id},${esc(b.owner)}`);
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

extractBancas();
