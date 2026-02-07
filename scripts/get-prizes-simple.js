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

    // Fetch tickets directly
    const data = await page.evaluate(async (t) => {
      const r = await fetch('https://api.lotocompany.com/api/v1/tickets?category=2&date=2026-01-28', {
        headers: { 'Authorization': 'Bearer ' + t }
      });
      return r.json();
    }, token);

    console.log('Tickets:', data.tickets ? data.tickets.length : 0);
    
    const winners = (data.tickets || []).filter(t => t.prize > 0);
    console.log('Winners:', winners.length);

    // Get details for winners
    for (const w of winners.slice(0, 3)) {
      console.log('\n' + w.code + ': $' + w.amount + ' -> $' + w.prize);
      
      const detail = await page.evaluate(async (params) => {
        const r = await fetch('https://api.lotocompany.com/api/v1/tickets/' + params.id + '?category=2', {
          headers: { 'Authorization': 'Bearer ' + params.t }
        });
        return r.json();
      }, { t: token, id: w.ticketId });

      if (detail.plays) {
        detail.plays.filter(p => p.prize > 0).forEach(p => {
          const m = p.prize / p.amount;
          console.log('  ' + p.number + ' (' + (p.playTypeName || p.playType) + '): $' + p.amount + ' -> $' + p.prize + ' = ' + m.toFixed(1) + 'x');
        });
      }
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getPrizes();
