const { chromium } = require('playwright');

async function getConfig() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1920, height: 1080 } }).then(c => c.newPage());

  let token = null;
  const apiData = [];

  page.on('response', async (response) => {
    if (response.url().includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.token) token = json.token;
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

    console.log('Token:', token ? 'Yes' : 'No');

    // Get betting pool details
    const bpData = await page.evaluate(async (t) => {
      const r = await fetch('https://api.lotocompany.com/api/v1/betting-pools/10?category=2', {
        headers: { 'Authorization': 'Bearer ' + t }
      });
      return r.json();
    }, token);

    console.log('\nBetting Pool 10 Config:');
    console.log('Keys:', Object.keys(bpData).join(', '));
    
    if (bpData.bettingPool) {
      const bp = bpData.bettingPool;
      console.log('Name:', bp.name);
      console.log('Has prizes:', bp.prizes ? 'Yes' : 'No');
      console.log('Has playTypePrizes:', bp.playTypePrizes ? 'Yes' : 'No');
      
      if (bp.playTypePrizes) {
        console.log('\nPlay Type Prizes:');
        console.log(JSON.stringify(bp.playTypePrizes, null, 2).substring(0, 2000));
      }
    }

    // Get play types with default prizes
    const ptData = await page.evaluate(async (t) => {
      const r = await fetch('https://api.lotocompany.com/api/v1/play-types?category=2', {
        headers: { 'Authorization': 'Bearer ' + t }
      });
      return r.json();
    }, token);

    console.log('\nPlay Types:');
    console.log('Keys:', Object.keys(ptData).join(', '));
    
    if (ptData.playTypes) {
      console.log('Count:', ptData.playTypes.length);
      ptData.playTypes.slice(0, 5).forEach(pt => {
        console.log('\n  ' + pt.name + ':');
        if (pt.prizes) console.log('    Prizes:', JSON.stringify(pt.prizes));
        if (pt.defaultPrize) console.log('    Default:', pt.defaultPrize);
      });
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getConfig();
