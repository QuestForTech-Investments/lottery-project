const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

// The 12 bancas we're tracking
const BANCAS = [
  { id: 10, name: 'GILBERTO TL' },
  { id: 16, name: 'RAYMER TL' },
  { id: 21, name: 'ALBERTO TL' },
  { id: 48, name: 'MANZUETA TL' },
  { id: 63, name: 'FELO TL' },
  { id: 119, name: 'MARITZA TL' },
  { id: 135, name: 'TIA TOTA TL' },
  { id: 182, name: 'JUAN CARLOS' }
];

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

    let allPrizes = [];

    for (const banca of BANCAS) {
      ticketsData = [];
      console.log(`\nChecking ${banca.name} (id=${banca.id})...`);
      await page.goto(`https://la-numbers.apk.lol/#/tickets?date=2026-02-01&bettingPoolId=${banca.id}`, 
        { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2000);

      const withPrizes = ticketsData.filter(t => t.prize > 0);
      if (withPrizes.length > 0) {
        console.log(`  Found ${withPrizes.length} tickets with prizes:`);
        withPrizes.forEach(t => {
          console.log(`    ${t.code}: Prize=$${t.prize}`);
          allPrizes.push({ banca: banca.name, code: t.code, prize: t.prize });
        });
      } else {
        console.log(`  No prizes (${ticketsData.length} tickets)`);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log('Total tickets with prizes:', allPrizes.length);
    const totalPrize = allPrizes.reduce((sum, t) => sum + t.prize, 0);
    console.log('Total prize amount:', totalPrize);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

checkPrizes();
