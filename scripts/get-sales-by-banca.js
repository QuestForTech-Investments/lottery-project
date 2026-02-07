#!/usr/bin/env node
const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

const BANCAS_12_REFS = [
  'ISLA GORDA TL', 'GILBERTO TL', 'DOS CHICAS TL', 'DANIELA SALON TL',
  'PAPU TL', 'GREEN HOUSE TL', 'FELO TL', 'EUDDY (GF)',
  'MORENA D (GF)', 'DANNY (GF)', 'MANUELL (GF)', 'TONA (GF)'
];

async function getSales() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  let salesData = null;

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        // Look for data with banca breakdown
        if (json.bettingPools && Array.isArray(json.bettingPools) && json.bettingPools.length > 0) {
          const first = json.bettingPools[0];
          // Check if this has actual sales data (not just params)
          if (first.totalSales || first.ticketCount) {
            salesData = json;
            console.error('Got sales data: ' + json.bettingPools.length + ' bancas from ' + url);
          }
        }
      } catch (e) {}
    }
  });

  try {
    console.error('Logging in...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape').catch(() => {});

    // Click VENTAS menu
    console.error('Opening VENTAS > Del día...');
    await page.click('text=VENTAS');
    await page.waitForTimeout(500);
    
    // Click "Del día" for daily sales by banca
    await page.click('text=Del día');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'del-dia.png' });

    // We need to change date to yesterday
    // Find date input and change it
    console.error('Changing date to yesterday...');
    const dateInputs = await page.$$('input');
    for (const input of dateInputs) {
      const value = await input.inputValue();
      if (value && value.includes('02/02/2026')) {  // Today's date
        console.error('  Found date: ' + value);
        await input.click({ clickCount: 3 });
        await input.type('01/02/2026');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
      }
    }

    // Click search/filter button
    await page.click('button:has-text("Ver"), button:has-text("Buscar"), button:has-text("Filtrar")').catch(() => {});
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'del-dia-result.png' });

    if (salesData) {
      console.log('\n=== VENTAS SISTEMA VIEJO (01/02/2026) ===');
      console.log('BANCA                  | TICKETS | VENTAS');
      console.log('-'.repeat(50));
      
      let total = { tickets: 0, sales: 0 };
      
      for (const bp of salesData.bettingPools) {
        if (BANCAS_12_REFS.includes(bp.owner)) {
          const tickets = bp.ticketCount || 0;
          const salesStr = bp.totalSales || '$0';
          const sales = parseFloat(salesStr.replace(/[$,]/g, '')) || 0;
          const name = bp.owner.padEnd(22);
          console.log(name + ' | ' + String(tickets).padStart(7) + ' | $' + sales.toFixed(2));
          total.tickets += tickets;
          total.sales += sales;
        }
      }
      console.log('-'.repeat(50));
      console.log('TOTAL'.padEnd(22) + ' | ' + String(total.tickets).padStart(7) + ' | $' + total.sales.toFixed(2));
    } else {
      console.error('No sales data captured');
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSales();
