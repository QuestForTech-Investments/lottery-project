const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function getSalesReport() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  let salesData = null;

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && url.includes('sales') && response.status() === 200) {
      try {
        const json = await response.json();
        salesData = json;
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

    // Navigate to sales report for 2026-02-01
    console.log('Fetching sales report for 2026-02-01...');
    await page.goto('https://la-numbers.apk.lol/#/sales?date=2026-02-01', 
      { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(4000);

    if (salesData) {
      console.log('\n=== ORIGINAL SYSTEM SALES REPORT ===');
      console.log(JSON.stringify(salesData, null, 2).substring(0, 3000));
    } else {
      console.log('No sales data captured');
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSalesReport();
