const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  const apiResponses = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('/api/')) return;
    if (response.status() !== 200) return;

    try {
      const text = await response.text();
      const json = JSON.parse(text);
      
      // Log all API responses with their structure
      const keys = Object.keys(json);
      if (keys.length < 20) {
        apiResponses.push({ url: url.split('?')[0], keys, sample: JSON.stringify(json).substring(0, 300) });
      }
      
      // If it's a ticket with plays, show the full structure
      if (json.ticket && json.plays) {
        console.log('\n=== TICKET RESPONSE ===');
        console.log('Ticket code:', json.ticket.code);
        console.log('Plays keys (drawIds):', Object.keys(json.plays));
        
        for (const [drawId, plays] of Object.entries(json.plays)) {
          console.log(`\nDraw ${drawId}:`);
          if (plays.length > 0) {
            const p = plays[0];
            console.log('  Full play object keys:', Object.keys(p));
            console.log('  numbers:', p.numbers);
            console.log('  playType:', JSON.stringify(p.playType));
            console.log('  sortition:', JSON.stringify(p.sortition));
            console.log('  amount:', p.amount);
          }
        }
      }
    } catch {}
  });

  try {
    console.log('Logging in...');
    await page.goto('https://la-numbers.apk.lol/');
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', 'oliver');
    await page.fill('input[type="password"]', 'oliver0597@');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    console.log('Going to tickets...');
    await page.goto('https://la-numbers.apk.lol/#/tickets?date=2026-02-01&bettingPoolId=37');
    await page.waitForTimeout(3000);

    console.log('Clicking on winning ticket LAN-010-000061156...');
    await page.evaluate(() => {
      const els = document.querySelectorAll('span');
      for (const el of els) {
        if (el.textContent.trim() === 'LAN-010-000061156') {
          el.click();
          return true;
        }
      }
    });
    await page.waitForTimeout(3000);

    console.log('\n=== API RESPONSES CAPTURED ===');
    apiResponses.slice(-10).forEach(r => {
      console.log(`${r.url}: keys=${r.keys.join(',')}`);
    });

  } finally {
    await browser.close();
  }
}

test();
