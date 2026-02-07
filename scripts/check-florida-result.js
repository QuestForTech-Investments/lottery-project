const { chromium } = require('playwright');

async function checkResult() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1920, height: 1080 } }).then(c => c.newPage());

  let token = null;
  let resultsData = null;

  page.on('response', async (response) => {
    if (response.url().includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.token) token = json.token;
        if (json.results || response.url().includes('results')) {
          resultsData = json;
        }
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

    // Go to results page for Feb 1
    console.log('Going to results page for 2026-02-01...');
    await page.goto('https://la-numbers.apk.lol/#/results?date=2026-02-01');
    await page.waitForTimeout(4000);

    // Look for FLORIDA AM result in the page
    const pageContent = await page.content();
    
    // Search for Florida in the visible text
    const floridaText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent && el.textContent.includes('FLORIDA') && el.textContent.includes('AM')) {
          return el.textContent.substring(0, 200);
        }
      }
      return null;
    });
    
    console.log('Florida text found:', floridaText);

    // Try to get results via API
    if (token) {
      const data = await page.evaluate(async (t) => {
        const r = await fetch('https://api.lotocompany.com/api/v1/results?date=2026-02-01&category=2', {
          headers: { 'Authorization': 'Bearer ' + t }
        });
        return r.json();
      }, token);
      
      if (data.results) {
        console.log('\nResults from API:');
        const florida = data.results.find(r => r.sortitionName && r.sortitionName.includes('FLORIDA AM'));
        if (florida) {
          console.log('FLORIDA AM:', JSON.stringify(florida, null, 2));
        } else {
          console.log('FLORIDA AM not found in results');
          console.log('Available sortitions:', data.results.map(r => r.sortitionName).join(', '));
        }
      } else {
        console.log('No results array in response');
        console.log('Keys:', Object.keys(data));
      }
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

checkResult();
