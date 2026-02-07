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
        if (json.bettingPools && Array.isArray(json.bettingPools) && json.bettingPools.length > 0) {
          salesData = json;
          console.error('Captured sales data with ' + json.bettingPools.length + ' bancas');
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
    await page.waitForTimeout(500);

    // Click on VENTAS menu
    console.error('Clicking VENTAS menu...');
    await page.click('text=VENTAS');
    await page.waitForTimeout(1000);

    // Click Ventas por fecha
    console.error('Clicking Ventas por fecha...');
    await page.click('text=Ventas por fecha');
    await page.waitForTimeout(2000);

    // Set date to yesterday (01/02/2026 in DD/MM/YYYY format)
    console.error('Setting date to yesterday...');
    
    // Find and clear the date inputs, then set to yesterday
    const dateInputs = await page.$$('input');
    for (const input of dateInputs) {
      const value = await input.inputValue();
      if (value && value.includes('2026')) {
        console.error('  Found date input with value: ' + value);
        // Clear and set to 01/02/2026
        await input.click({ clickCount: 3 });
        await input.fill('01/02/2026');
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({ path: 'before-ver-ventas.png' });

    // Click VER VENTAS button
    console.error('Clicking VER VENTAS...');
    await page.click('button:has-text("VER VENTAS"), button:has-text("Ver ventas")');
    await page.waitForTimeout(4000);

    await page.screenshot({ path: 'after-ver-ventas.png' });

    if (salesData) {
      console.log('\n=== VENTAS SISTEMA VIEJO (01/02/2026) ===');
      console.log('BANCA                  | TICKETS | VENTAS');
      console.log('-'.repeat(50));
      
      let total = { tickets: 0, sales: 0 };
      let found = 0;
      
      for (const bp of salesData.bettingPools) {
        if (BANCAS_12_REFS.includes(bp.owner)) {
          found++;
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
      console.error('Found ' + found + ' of 12 bancas');
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
