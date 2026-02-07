const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function findWinners() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  let capturedData = null;

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        capturedData = { url, data: json };
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

    // Go to winning plays page
    console.log('Going to winning plays page...');
    await page.goto('https://la-numbers.apk.lol/#/winning-plays', 
      { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    if (capturedData) {
      console.log('\nCaptured URL:', capturedData.url);
      const dataStr = JSON.stringify(capturedData.data, null, 2);
      console.log('Data:', dataStr.substring(0, 5000));
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

findWinners();
