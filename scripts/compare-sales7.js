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
    await page.waitForTimeout(500);

    // Click on VENTAS menu to expand
    console.error('Clicking VENTAS menu...');
    await page.click('text=VENTAS');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'ventas-expanded.png' });

    // Now look for submenu items
    console.error('Looking for Por Fecha option...');
    await page.click('text=Por Fecha').catch(async () => {
      await page.click('text=Ventas por Fecha').catch(() => {});
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ventas-por-fecha.png' });

    // Now we need to change date to yesterday and click Ver ventas
    // First let's see what's on the page
    console.error('Looking for date picker...');
    
    // Try to find yesterday button or date input
    // Usually there's a calendar or date picker
    await page.click('text=Ayer').catch(() => {});
    await page.waitForTimeout(500);
    
    // Or click left arrow for previous day
    await page.click('.mdi-chevron-left, [class*="chevron-left"], button:has(.mdi-chevron-left)').catch(() => {});
    await page.waitForTimeout(500);

    // Click Ver ventas button
    console.error('Clicking Ver ventas...');
    await page.click('button:has-text("Ver ventas")').catch(async () => {
      await page.click('text=Ver ventas').catch(() => {});
    });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'sales-result.png' });

    if (salesData) {
      console.log('\n=== VENTAS SISTEMA VIEJO ===');
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
