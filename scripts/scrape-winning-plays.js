const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

async function scrapeWinningPlays() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const allApiData = [];

  // Capture all API responses
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        allApiData.push({ url, data: json });
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

    // Go to tickets page and look for winning tickets
    console.log('\nSearching for winning tickets...');
    
    // Try different dates
    const dates = ['2026-01-28', '2026-01-27', '2026-01-26'];
    
    for (const date of dates) {
      console.log('\nDate:', date);
      
      // Navigate to tickets with winners filter
      await page.goto(`https://la-numbers.apk.lol/#/tickets?date=${date}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2000);
      
      // Check "Solo tickets ganadores" checkbox if available
      try {
        const checkbox = await page.$('input[type="checkbox"]');
        if (checkbox) {
          await checkbox.click();
          await page.waitForTimeout(500);
        }
      } catch (e) {}
      
      // Click filter
      await page.click('button:has-text("Filtrar")').catch(() => {});
      await page.waitForTimeout(3000);
      
      // Look for tickets data
      const ticketData = allApiData.filter(d => d.url.includes('tickets') && d.data.tickets);
      if (ticketData.length > 0) {
        const latest = ticketData[ticketData.length - 1];
        const winners = latest.data.tickets.filter(t => t.prize > 0);
        
        if (winners.length > 0) {
          console.log(`Found ${winners.length} winning tickets!`);
          
          // Get details of first winning ticket
          for (const winner of winners.slice(0, 3)) {
            console.log(`\nTicket ${winner.code}:`);
            console.log(`  Total bet: $${winner.amount}, Prize: $${winner.prize}`);
            
            // Click on ticket to get details
            await page.click(`text="${winner.code}"`).catch(() => {});
            await page.waitForTimeout(2000);
            
            // Look for play details in captured data
            const playData = allApiData.filter(d => 
              d.url.includes('ticket') && 
              d.data.plays
            );
            
            if (playData.length > 0) {
              const plays = playData[playData.length - 1].data.plays;
              const winningPlays = plays.filter(p => p.prize > 0);
              console.log(`  Winning plays: ${winningPlays.length}`);
              
              for (const p of winningPlays) {
                const multiplier = p.prize / p.amount;
                console.log(`    ${p.number} (${p.playType || p.type}): $${p.amount} -> $${p.prize} (${multiplier.toFixed(1)}x)`);
              }
            }
            
            await page.keyboard.press('Escape').catch(() => {});
            await page.waitForTimeout(500);
          }
          
          break; // Found winners, stop searching
        }
      }
    }
    
    // Print summary of all captured API data
    console.log('\n=== API Data Summary ===');
    const uniqueUrls = [...new Set(allApiData.map(d => d.url.split('?')[0]))];
    console.log('Unique endpoints:', uniqueUrls.length);
    uniqueUrls.forEach(u => console.log('  ', u));

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

scrapeWinningPlays();
