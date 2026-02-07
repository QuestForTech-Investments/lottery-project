const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function learnPrizes() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  const allWinners = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && url.includes('tickets') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.tickets && Array.isArray(json.tickets)) {
          for (const t of json.tickets) {
            if (t.prize > 0) {
              allWinners.push({
                code: t.code,
                amount: t.amount,
                prize: t.prize,
                plays: t.plays || []
              });
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

    // Check multiple dates to find winning tickets
    const dates = ['2026-02-01', '2026-01-31', '2026-01-30', '2026-01-29', '2026-01-28'];
    
    // Check several bancas
    const bancas = [10, 16, 21, 48, 63, 119, 135, 182, 28, 30];

    for (const date of dates) {
      for (const bancaId of bancas) {
        console.log('Checking banca ' + bancaId + ' for ' + date + '...');
        await page.goto('https://la-numbers.apk.lol/#/tickets?date=' + date + '&bettingPoolId=' + bancaId, 
          { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(1500);
      }
      
      if (allWinners.length >= 10) {
        console.log('Found enough winners, stopping search');
        break;
      }
    }

    console.log('\n=== WINNING TICKETS FOUND: ' + allWinners.length + ' ===\n');
    
    for (const w of allWinners) {
      console.log('Ticket: ' + w.code);
      console.log('  Total bet: $' + w.amount + ', Total prize: $' + w.prize);
      if (w.plays && w.plays.length > 0) {
        console.log('  Plays:');
        for (const p of w.plays) {
          if (p.prize > 0) {
            console.log('    ' + p.number + ' (' + p.type + ') $' + p.amount + ' -> Prize: $' + p.prize);
            // Calculate multiplier
            const mult = p.prize / p.amount;
            console.log('      Multiplier: ' + mult.toFixed(2) + 'x');
          }
        }
      }
      console.log('');
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

learnPrizes();
