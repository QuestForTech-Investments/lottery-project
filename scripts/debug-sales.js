#!/usr/bin/env node
const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function getSales() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  let allCapturedData = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        if (json.bettingPools && Array.isArray(json.bettingPools)) {
          allCapturedData.push({ url, data: json });
        }
      } catch (e) {}
    }
  });

  try {
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape').catch(() => {});

    // Click VENTAS menu
    await page.click('text=VENTAS');
    await page.waitForTimeout(500);
    await page.click('text=Ventas por fecha');
    await page.waitForTimeout(2000);

    // Click VER VENTAS to load default data
    await page.click('button:has-text("VER VENTAS")').catch(() => {});
    await page.waitForTimeout(3000);

    // Print first few bancas from captured data
    if (allCapturedData.length > 0) {
      const lastData = allCapturedData[allCapturedData.length - 1];
      console.log('API URL:', lastData.url);
      console.log('\nFirst 15 bancas (owner field):');
      for (let i = 0; i < Math.min(15, lastData.data.bettingPools.length); i++) {
        const bp = lastData.data.bettingPools[i];
        console.log('  ' + bp.owner + ' - tickets: ' + (bp.ticketCount || 0) + ', sales: ' + (bp.totalSales || '$0'));
      }
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSales();
