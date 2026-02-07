const { chromium } = require('playwright');

async function getPrizeConfig() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1920, height: 1080 } }).then(c => c.newPage());

  const apiData = [];

  page.on('response', async (response) => {
    if (response.url().includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        apiData.push({ url: response.url(), data: json });
      } catch (e) {}
    }
  });

  try {
    // Login
    await page.goto('https://la-numbers.apk.lol/');
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', 'oliver');
    await page.fill('input[type="password"]', 'oliver0597@');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape').catch(() => {});

    // Go to banca config page (GILBERTO TL = id 10)
    console.log('Going to banca config...');
    await page.goto('https://la-numbers.apk.lol/#/betting-pools/10/edit');
    await page.waitForTimeout(4000);

    // Look for prize configuration data
    console.log('\nCaptured API endpoints:');
    apiData.forEach(d => {
      const url = d.url.split('api.lotocompany.com')[1];
      console.log(url);
      
      // Look for prize/multiplier data
      if (d.data.playTypes || d.data.prizes || d.data.multipliers) {
        console.log('  Found prize data!');
        console.log('  ', JSON.stringify(d.data).substring(0, 500));
      }
      
      if (d.data.bettingPool) {
        console.log('  BettingPool config found');
        const bp = d.data.bettingPool;
        if (bp.prizes || bp.playTypePrizes) {
          console.log('  Prizes:', JSON.stringify(bp.prizes || bp.playTypePrizes).substring(0, 1000));
        }
      }
    });

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getPrizeConfig();
