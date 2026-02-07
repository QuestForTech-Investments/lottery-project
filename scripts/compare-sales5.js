#!/usr/bin/env node
const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

const BANCAS_12_REFS = [
  'ISLA GORDA TL', 'GILBERTO TL', 'DOS CHICAS TL', 'DANIELA SALON TL',
  'PAPU TL', 'GREEN HOUSE TL', 'FELO TL', 'EUDDY (GF)',
  'MORENA D (GF)', 'DANNY (GF)', 'MANUELL (GF)', 'TONA (GF)'
];

async function getSales() {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  let salesData = null;

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        if (json.bettingPools && Array.isArray(json.bettingPools)) {
          salesData = json;
          console.error('Captured sales data!');
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

    // Navigate to dashboard/home first
    console.error('Looking for sales report menu...');
    
    // Click on Reportes menu
    await page.click('text=Reportes').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Click on Ventas por Fecha
    await page.click('text=Ventas por Fecha').catch(async () => {
      // Try alternative
      await page.click('text=Ventas').catch(() => {});
    });
    await page.waitForTimeout(2000);

    // Set date to yesterday (2026-02-01)
    console.error('Setting date to yesterday...');
    
    // Look for date picker and set to 2026-02-01
    const dateInputs = await page.$$('input[type="text"], input[type="date"]');
    for (const input of dateInputs) {
      const placeholder = await input.getAttribute('placeholder');
      const value = await input.inputValue();
      console.error(`  Found input: placeholder="${placeholder}", value="${value}"`);
    }

    // Try to find and fill date input
    await page.fill('input[type="date"]', '2026-02-01').catch(() => {});
    
    // Or click on date picker
    await page.click('.date-picker, [class*="date"], input[placeholder*="Fecha"]').catch(() => {});
    await page.waitForTimeout(1000);

    // Click "Ver ventas" or similar button
    console.error('Clicking Ver ventas...');
    await page.click('button:has-text("Ver"), button:has-text("Buscar"), button:has-text("Consultar")').catch(() => {});
    await page.waitForTimeout(3000);

    // Take screenshot to see current state
    await page.screenshot({ path: 'sales-page.png' });
    console.error('Screenshot saved to sales-page.png');

    if (salesData) {
      console.log('\n=== VENTAS SISTEMA VIEJO (2026-02-01) ===');
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
      console.error('No sales data captured yet');
    }

    // Keep browser open for a bit to see
    await page.waitForTimeout(5000);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSales();
