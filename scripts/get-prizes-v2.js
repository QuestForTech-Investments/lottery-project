const { chromium } = require('playwright');

async function getPrizes() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1920, height: 1080 } }).then(c => c.newPage());

  let token = null;

  page.on('response', async (response) => {
    if (response.url().includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.token) token = json.token;
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

    console.log('Token:', token ? 'OK' : 'FAIL');

    // Try different API endpoints
    const endpoints = [
      '/api/v1/tickets?date=2026-01-28',
      '/api/v1/tickets?date=2026-01-28&category=2',
      '/api/v1/winning-plays?startDate=2026-01-01&endDate=2026-01-31&category=2',
      '/api/v1/sales/daily?date=2026-01-28&category=2'
    ];

    for (const endpoint of endpoints) {
      console.log('\nTrying:', endpoint);
      const data = await page.evaluate(async (params) => {
        const r = await fetch('https://api.lotocompany.com' + params.ep, {
          headers: { 'Authorization': 'Bearer ' + params.t }
        });
        return r.json();
      }, { t: token, ep: endpoint });

      console.log('Keys:', Object.keys(data).join(', '));
      
      if (data.tickets) console.log('  Tickets:', data.tickets.length);
      if (data.winningPlays) console.log('  WinningPlays:', data.winningPlays.length);
      if (data.bettingPoolSales) console.log('  BettingPoolSales:', data.bettingPoolSales.length);
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getPrizes();
