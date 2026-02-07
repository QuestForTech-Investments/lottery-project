const { chromium } = require('playwright');

async function getWinningTicketDetails() {
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
    console.log('Logging in...');
    await page.goto('https://la-numbers.apk.lol/');
    await page.waitForTimeout(2000);
    await page.fill('input[type="text"]', 'oliver');
    await page.fill('input[type="password"]', 'oliver0597@');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape').catch(() => {});

    console.log('Token:', token ? 'Yes' : 'No');

    // The 3 winning tickets from GILBERTO TL (bettingPoolId=37 in original)
    const winningTickets = [
      { code: 'LAN-010-000061156', prize: 56.00 },
      { code: 'LAN-010-000061158', prize: 112.00 },
      { code: 'LAN-010-000061171', prize: 8.00 }
    ];

    console.log('\n=== FETCHING WINNING TICKET DETAILS ===\n');

    for (const ticket of winningTickets) {
      console.log(`\n--- Ticket ${ticket.code} (Premio: $${ticket.prize}) ---`);

      // Try to get ticket details via API
      const ticketData = await page.evaluate(async (params) => {
        const { token, ticketCode } = params;
        try {
          // Try different API endpoints
          const endpoints = [
            `https://api.lotocompany.com/api/v1/tickets/${ticketCode}?category=2`,
            `https://api.lotocompany.com/api/v1/tickets?code=${ticketCode}&category=2`,
            `https://api.lotocompany.com/api/v1/tickets/search?code=${ticketCode}&category=2`
          ];

          for (const url of endpoints) {
            try {
              const r = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
              });
              const text = await r.text();
              if (text && text.length > 10 && (text.startsWith('{') || text.startsWith('['))) {
                return { url, data: JSON.parse(text) };
              }
            } catch (e) {}
          }
          return null;
        } catch (e) {
          return { error: e.message };
        }
      }, { token, ticketCode: ticket.code });

      if (ticketData && ticketData.data) {
        console.log('API Response:', JSON.stringify(ticketData.data, null, 2).substring(0, 1500));
      } else {
        console.log('Could not fetch via API, trying UI...');
      }
    }

    // Get results for Feb 1 to understand which numbers won
    console.log('\n\n=== FETCHING FEB 1 RESULTS ===\n');

    const resultsData = await page.evaluate(async (t) => {
      try {
        const r = await fetch('https://api.lotocompany.com/api/v1/results?date=2026-02-01&category=2', {
          headers: { 'Authorization': 'Bearer ' + t }
        });
        return r.json();
      } catch (e) {
        return { error: e.message };
      }
    }, token);

    if (resultsData.results) {
      console.log('Results for Feb 1, 2026:');
      resultsData.results.forEach(r => {
        if (r.first || r.second || r.third) {
          console.log(`  ${r.sortitionName}: ${r.first || '-'}-${r.second || '-'}-${r.third || '-'}`);
        }
      });
    } else if (resultsData.error) {
      console.log('Error:', resultsData.error);
    } else {
      console.log('Results response:', JSON.stringify(resultsData, null, 2).substring(0, 1000));
    }

    // Navigate to tickets page for banca 37 (GILBERTO TL) to get the winning ticket details
    console.log('\n\n=== GETTING TICKET PLAYS FROM UI ===\n');

    // Get plays for the banca on Feb 1
    const playsData = await page.evaluate(async (t) => {
      try {
        const r = await fetch('https://api.lotocompany.com/api/v1/plays?date=2026-02-01&bettingPoolId=37&category=2&winners=true', {
          headers: { 'Authorization': 'Bearer ' + t }
        });
        return r.json();
      } catch (e) {
        return { error: e.message };
      }
    }, token);

    if (playsData.plays) {
      console.log('Winning plays for GILBERTO TL on Feb 1:');
      playsData.plays.forEach(p => {
        console.log(`  Ticket: ${p.ticketCode}, Sorteo: ${p.sortitionName}, Numero: ${p.playNumber}, Tipo: ${p.playTypeName}, Monto: $${p.amount}, Premio: $${p.prize}`);
      });
    } else {
      console.log('Plays response:', JSON.stringify(playsData, null, 2).substring(0, 2000));
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getWinningTicketDetails();
