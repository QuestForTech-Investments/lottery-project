#!/usr/bin/env node
/**
 * Compare sales between old and new systems for the 12 bancas
 */

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

async function getSalesFromOldSystem() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  const date = '2026-02-01';
  const urlDate = date;

  let salesData = null;

  // Intercept API responses
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/v1/reports/sales/by-date') && response.status() === 200) {
      try {
        const data = await response.json();
        salesData = data;
      } catch (e) {}
    }
  });

  try {
    // Login
    console.error('Logging in to old system...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Navigate to sales by date report
    console.error('Getting sales report for ' + date + '...');
    await page.goto(`https://la-numbers.apk.lol/#/reports/sales/by-date?date=${urlDate}`, 
      { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    if (salesData && salesData.bettingPools) {
      console.log('BANCA,TICKETS,VENTAS');
      
      // Filter only our 12 bancas
      const refs = Object.values(BANCAS_12).map(b => b.ref);
      let total = { tickets: 0, sales: 0 };
      
      for (const bp of salesData.bettingPools) {
        if (refs.includes(bp.owner)) {
          const tickets = bp.ticketCount || 0;
          const sales = parseFloat((bp.totalSales || '$0').replace(/[$,]/g, '')) || 0;
          console.log(`${bp.owner},${tickets},${sales.toFixed(2)}`);
          total.tickets += tickets;
          total.sales += sales;
        }
      }
      console.log(`TOTAL,${total.tickets},${total.sales.toFixed(2)}`);
    } else {
      console.error('No sales data captured');
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSalesFromOldSystem();
