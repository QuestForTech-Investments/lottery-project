const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function getWinningPlays() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  const apiResponses = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        apiResponses.push({ url, data: json });
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
    await page.waitForTimeout(2000);

    // Set date and click search
    console.log('Setting date and searching...');
    await page.fill('input[type="date"]', '2026-01-28').catch(() => console.log('No date input found'));
    await page.waitForTimeout(500);
    
    // Try clicking search/filter button
    await page.click('button:has-text("Buscar")').catch(() => {});
    await page.click('button:has-text("Ver")').catch(() => {});
    await page.click('button:has-text("Filtrar")').catch(() => {});
    await page.waitForTimeout(3000);

    // Also try selecting a lottery/draw
    const selectElements = await page.$$('select');
    console.log('Found', selectElements.length, 'select elements');
    
    await page.waitForTimeout(2000);

    console.log('\n=== ALL API RESPONSES ===');
    for (const r of apiResponses) {
      console.log('\nURL:', r.url);
      if (typeof r.data === 'object') {
        const keys = Object.keys(r.data);
        console.log('Keys:', keys.join(', '));
        if (r.data.winningPlays) {
          console.log('winningPlays count:', r.data.winningPlays.length);
        }
      }
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getWinningPlays();
