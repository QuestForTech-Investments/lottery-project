const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function checkPrizes() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  let ticketsData = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && url.includes('tickets') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.tickets && Array.isArray(json.tickets)) {
          ticketsData = json.tickets;
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

    // Check GILBERTO TL (bettingPoolId=10) tickets for 2026-02-01
    console.log('Fetching GILBERTO TL tickets for 2026-02-01...');
    await page.goto('https://la-numbers.apk.lol/#/tickets?date=2026-02-01&bettingPoolId=10', 
      { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Show tickets with prizes
    console.log('\nTickets with prizes (premio > 0):');
    const withPrizes = ticketsData.filter(t => t.prize > 0);
    if (withPrizes.length === 0) {
      console.log('No tickets with prizes found');
      console.log('\nFirst 5 tickets:');
      ticketsData.slice(0, 5).forEach(t => {
        console.log(`  ${t.code}: Amount=${t.amount}, Prize=${t.prize}, Status=${t.status}`);
      });
    } else {
      withPrizes.forEach(t => {
        console.log(`  ${t.code}: Amount=${t.amount}, Prize=${t.prize}, Status=${t.status}`);
      });
    }

    console.log('\nTotal tickets:', ticketsData.length);
    const totalPrizes = ticketsData.reduce((sum, t) => sum + (t.prize || 0), 0);
    console.log('Total prizes:', totalPrizes);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

checkPrizes();
