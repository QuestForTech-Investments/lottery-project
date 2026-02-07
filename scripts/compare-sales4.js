#!/usr/bin/env node
const { chromium } = require('playwright');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

const BANCAS_12 = {
  'LAN-0001': { id: 28, ref: 'ISLA GORDA TL' },
  'LAN-0010': { id: 37, ref: 'GILBERTO TL' },
  'LAN-0016': { id: 43, ref: 'DOS CHICAS TL' },
  'LAN-0021': { id: 48, ref: 'DANIELA SALON TL' },
  'LAN-0048': { id: 75, ref: 'PAPU TL' },
  'LAN-0052': { id: 79, ref: 'GREEN HOUSE TL' },
  'LAN-0063': { id: 90, ref: 'FELO TL' },
  'LAN-0119': { id: 153, ref: 'EUDDY (GF)' },
  'LAN-0135': { id: 169, ref: 'MORENA D (GF)' },
  'LAN-0150': { id: 184, ref: 'DANNY (GF)' },
  'LAN-0165': { id: 199, ref: 'MANUELL (GF)' },
  'LAN-0182': { id: 216, ref: 'TONA (GF)' }
};

async function getSales() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  let salesData = null;

  // Capture all API responses
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        if (json.bettingPools && Array.isArray(json.bettingPools)) {
          salesData = json;
          console.error(`Captured sales data from: ${url}`);
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

    // Navigate to sales by date page
    console.error('Navigating to sales by date...');
    await page.goto('https://la-numbers.apk.lol/#/reports/sales/by-date', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Set date to 2026-02-01
    console.error('Setting date to 2026-02-01...');
    
    // Find and click the date input
    const dateInput = await page.$('input[type="date"], input.date-input, input[placeholder*="fecha"], .v-date-picker input');
    if (dateInput) {
      await dateInput.fill('2026-02-01');
      await page.waitForTimeout(2000);
    } else {
      // Try clicking a date picker
      await page.click('text=Fecha').catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Look for search/filter button
    await page.click('button:has-text("Buscar"), button:has-text("Filtrar"), button:has-text("Aplicar")').catch(() => {});
    await page.waitForTimeout(3000);

    if (salesData) {
      const refs = Object.values(BANCAS_12).map(b => b.ref);
      
      console.log('\n=== VENTAS SISTEMA VIEJO (2026-02-01) ===');
      console.log('BANCA                  | TICKETS | VENTAS');
      console.log('-'.repeat(50));
      
      let total = { tickets: 0, sales: 0 };
      
      for (const bp of salesData.bettingPools) {
        if (refs.includes(bp.owner)) {
          const tickets = bp.ticketCount || 0;
          const salesStr = bp.totalSales || '$0';
          const sales = parseFloat(salesStr.replace(/[$,]/g, '')) || 0;
          console.log(`${bp.owner.padEnd(22)} | ${String(tickets).padStart(7)} | $${sales.toFixed(2)}`);
          total.tickets += tickets;
          total.sales += sales;
        }
      }
      console.log('-'.repeat(50));
      console.log(`${'TOTAL'.padEnd(22)} | ${String(total.tickets).padStart(7)} | $${total.sales.toFixed(2)}`);
    } else {
      console.error('No sales data captured - taking screenshot...');
      await page.screenshot({ path: 'sales-debug.png' });
      console.error('Screenshot saved to sales-debug.png');
      console.error('Current URL:', page.url());
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSales();
