#!/usr/bin/env node
const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function getSales() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  // Capture ALL API responses
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const text = await response.text();
        if (text.length > 100 && text.length < 50000) {
          console.log('\n=== API Response ===');
          console.log('URL:', url);
          const json = JSON.parse(text);
          console.log('Keys:', Object.keys(json).join(', '));
          if (json.bettingPools) {
            console.log('bettingPools count:', json.bettingPools.length);
            if (json.bettingPools[0]) {
              console.log('First BP keys:', Object.keys(json.bettingPools[0]).join(', '));
              console.log('First BP:', JSON.stringify(json.bettingPools[0]).substring(0, 200));
            }
          }
        }
      } catch (e) {}
    }
  });

  try {
    console.log('Logging in...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape').catch(() => {});

    console.log('\nNavigating to Ventas por fecha...');
    await page.click('text=VENTAS');
    await page.waitForTimeout(500);
    await page.click('text=Ventas por fecha');
    await page.waitForTimeout(2000);

    console.log('\nClicking VER VENTAS...');
    await page.click('button:has-text("VER VENTAS")').catch(() => {});
    await page.waitForTimeout(5000);

    console.log('\nDone.');

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSales();
