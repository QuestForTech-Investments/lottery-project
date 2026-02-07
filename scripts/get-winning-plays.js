const { chromium } = require('playwright');

async function getWinningPlays() {
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
    console.log('Logging in...');
    await page.goto('https://la-numbers.apk.lol/');
    await page.waitForTimeout(2000);
    await page.fill('input[type="text"]', 'oliver');
    await page.fill('input[type="password"]', 'oliver0597@');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape').catch(() => {});

    console.log('Token:', token ? 'Yes' : 'No');

    // Get tickets with plays for GILBERTO TL
    console.log('\n=== GETTING TICKETS WITH PLAYS ===\n');

    const ticketsData = await page.evaluate(async (t) => {
      try {
        const r = await fetch('https://api.lotocompany.com/api/v1/tickets?date=2026-02-01&bettingPoolId=37&category=2', {
          headers: { 'Authorization': 'Bearer ' + t }
        });
        const text = await r.text();
        if (text && text.startsWith('{')) {
          return JSON.parse(text);
        }
        return { text: text.substring(0, 500) };
      } catch (e) {
        return { error: e.message };
      }
    }, token);

    if (ticketsData.tickets) {
      console.log('Found ' + ticketsData.tickets.length + ' tickets');

      const winners = ticketsData.tickets.filter(t => t.prize > 0 || t.isWinner);
      console.log('Winning tickets: ' + winners.length);

      winners.forEach(t => {
        console.log('\n--- Ticket ' + t.code + ' ---');
        console.log('  Monto: $' + t.amount + ', Premio: $' + t.prize);
        if (t.plays) {
          console.log('  Jugadas ganadoras:');
          t.plays.forEach(p => {
            if (p.isWinner || p.prize > 0) {
              console.log('    Sorteo: ' + p.sortitionName + ', Num: ' + p.playNumber + ', Tipo: ' + p.playTypeName + ', Monto: $' + p.amount + ', Premio: $' + p.prize + ', Pos: ' + p.winningPosition);
            }
          });
        }
      });
    } else {
      console.log('Response:', JSON.stringify(ticketsData, null, 2).substring(0, 1000));
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getWinningPlays();
