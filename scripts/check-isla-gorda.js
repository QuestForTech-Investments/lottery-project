const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function checkIslaGorda() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  let ticketCount = 0;

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && url.includes('tickets') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.tickets && Array.isArray(json.tickets)) {
          ticketCount = json.tickets.length;
          console.log('Tickets encontrados:', ticketCount);
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

    // Navigate to tickets for ISLA GORDA (bettingPoolId=28) on 2026-02-01
    console.log('Buscando tickets de ISLA GORDA TL (id=28) para 2026-02-01...');
    await page.goto('https://la-numbers.apk.lol/#/tickets?date=2026-02-01&bettingPoolId=28', 
      { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    console.log('Total tickets ISLA GORDA TL:', ticketCount);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

checkIslaGorda();
