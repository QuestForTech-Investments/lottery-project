const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1920, height: 1080 } }).then(c => c.newPage());

  let token = null;

  // Intercept requests
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('api.lotocompany.com') && url.includes('tickets') && !url.includes('params')) {
      console.log('\n=== REQUEST ===');
      console.log('URL:', url);
      console.log('Method:', request.method());
      console.log('PostData:', request.postData());
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.token) token = json.token;
      } catch (e) {}
    }
  });

  try {
    console.log('Logging in...');
    await page.goto('https://la-numbers.apk.lol/');
    await page.waitForTimeout(2000);
    await page.fill('input[type="text"]', 'oliver');
    await page.fill('input[type="password"]', 'oliver0597@');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    console.log('Navigating to tickets page...');
    await page.goto('https://la-numbers.apk.lol/#/tickets?date=2026-02-02&bettingPoolId=37');
    await page.waitForTimeout(5000);

  } finally {
    await browser.close();
  }
}

test();
