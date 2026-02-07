const { chromium } = require('playwright');

async function compareDailySales() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1920, height: 1080 } }).then(c => c.newPage());

  let token = null;
  const apiResponses = [];

  page.on('response', async (response) => {
    if (response.url().includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.token) token = json.token;
        apiResponses.push({ url: response.url(), data: json });
      } catch (e) {}
    }
  });

  try {
    // Login
    console.log('Logging in to original system...');
    await page.goto('https://la-numbers.apk.lol/');
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', 'oliver');
    await page.fill('input[type="password"]', 'oliver0597@');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape').catch(() => {});

    console.log('Token obtained:', token ? 'Yes' : 'No');

    // Navigate to daily sales page for Feb 1
    console.log('\nNavigating to daily sales page for Feb 1...');
    await page.goto('https://la-numbers.apk.lol/#/sales/daily?date=2026-02-01');
    await page.waitForTimeout(4000);

    // Close any calendar popup by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Take screenshot before extracting data
    await page.screenshot({ path: '/home/jorge/projects/lottery-project/.playwright-mcp/daily-sales-feb01-v2.png' });

    // Look at what API calls have been made
    console.log('\nAPI responses captured:');
    apiResponses.forEach(r => {
      console.log('  -', r.url.substring(0, 80));
    });

    // Extract data from page
    console.log('\nExtracting data from page...');

    const pageData = await page.evaluate(() => {
      const results = {};

      // Get the page text that looks like sales data
      const allText = document.body.innerText;

      // Find the sales table data
      const tables = document.querySelectorAll('table');
      tables.forEach((table, i) => {
        const rows = Array.from(table.querySelectorAll('tr'));
        results['table' + i] = rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          return cells.map(cell => cell.textContent.trim());
        });
      });

      // Look for total/neto values
      const totalMatch = allText.match(/Total:\s*\$?([\d,]+\.?\d*)/);
      const netoMatch = allText.match(/Neto[^:]*:\s*\$?([\d,]+\.?\d*)/);
      const premiosMatch = allText.match(/Premios[^:]*:\s*\$?([\d,]+\.?\d*)/);

      results.totalText = totalMatch ? totalMatch[1] : null;
      results.netoText = netoMatch ? netoMatch[1] : null;
      results.premiosText = premiosMatch ? premiosMatch[1] : null;

      // Get all visible money values
      const moneyElements = [];
      document.querySelectorAll('td, span, div').forEach(el => {
        const text = el.textContent.trim();
        if (text.match(/^\$?\d+[,\d]*\.?\d*$/) && text !== '0' && text !== '0.00') {
          moneyElements.push(text);
        }
      });
      results.moneyValues = [...new Set(moneyElements)].slice(0, 20);

      return results;
    });

    console.log('\nPage data:');
    if (pageData.table0) {
      console.log('Table rows:');
      pageData.table0.forEach((row, i) => {
        if (row.some(cell => cell && cell !== '')) {
          console.log(`  Row ${i}:`, row.join(' | '));
        }
      });
    }
    console.log('\nMoney values found:', pageData.moneyValues);

    // Click on a specific date to load data
    console.log('\nClicking on banca with data to see sales...');

    // Check the "Con Ventas Netas Positivas" tab to find bancas with sales
    const tabs = await page.$$('button, a, div[role="tab"]');
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && text.includes('CON VENTAS NETAS POSITIVAS')) {
        await tab.click();
        await page.waitForTimeout(2000);
        break;
      }
    }

    // Take another screenshot
    await page.screenshot({ path: '/home/jorge/projects/lottery-project/.playwright-mcp/daily-sales-feb01-positive.png' });

    // Now extract data from the positive sales table
    const positiveSalesData = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const result = [];
      tables.forEach((table) => {
        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length > 0) {
            const rowData = cells.map(cell => cell.textContent.trim());
            result.push(rowData);
          }
        });
      });
      return result;
    });

    console.log('\nPositive sales data:');
    positiveSalesData.forEach((row, i) => {
      if (row.some(cell => cell && cell !== '' && cell !== '-')) {
        console.log(`  Row ${i}:`, row.join(' | '));
      }
    });

    // Get summary from page
    const summary = await page.evaluate(() => {
      // Find elements with Total and $ amounts
      const elements = document.querySelectorAll('*');
      const summaryData = {};

      elements.forEach(el => {
        const text = el.textContent;
        if (text && text.includes('Neto') && text.includes('$') && text.length < 50) {
          summaryData.neto = text;
        }
        if (text && text.includes('Total:') && text.includes('$') && text.length < 50) {
          summaryData.total = text;
        }
      });

      // Also get the "Neto (banca/grupos/agentes)" value
      const netoEl = document.evaluate(
        "//*[contains(text(), 'Neto')]",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (netoEl) {
        summaryData.netoElement = netoEl.textContent.substring(0, 100);
      }

      return summaryData;
    });

    console.log('\nSummary:', summary);

    console.log('\n\nScreenshots saved to .playwright-mcp/');

  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    await browser.close();
  }
}

compareDailySales();
