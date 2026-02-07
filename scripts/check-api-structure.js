const { chromium } = require('playwright');

async function checkStructure() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  let ticketResponse = null;

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/') && url.includes('ticket') && response.status() === 200) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        if (json.ticket && json.plays) {
          ticketResponse = json;
        }
      } catch {}
    }
  });

  try {
    await page.goto('https://la-numbers.apk.lol/');
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', 'oliver');
    await page.fill('input[type="password"]', 'oliver0597@');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Get a ticket with multiple sorteos - use one from Feb 1 with winning plays
    await page.goto('https://la-numbers.apk.lol/#/tickets?date=2026-02-01&bettingPoolId=37');
    await page.waitForTimeout(3000);

    await page.evaluate(() => {
      const els = document.querySelectorAll('span');
      for (const el of els) {
        if (el.textContent.trim() === 'LAN-010-000061156') {  // Ticket with multiple sorteos
          el.click();
          return true;
        }
      }
    });
    await page.waitForTimeout(3000);

    if (ticketResponse) {
      console.log('=== FULL RESPONSE SAMPLE ===\n');
      console.log('Draw IDs:', Object.keys(ticketResponse.plays));
      
      for (const [drawId, plays] of Object.entries(ticketResponse.plays)) {
        console.log(`\n--- Draw ID ${drawId} (${plays.length} plays) ---`);
        if (plays.length > 0) {
          const p = plays[0];
          console.log('Full play object:', JSON.stringify(p, null, 2));
          break; // Just show first one
        }
      }
    }
  } finally {
    await browser.close();
  }
}

checkStructure();
