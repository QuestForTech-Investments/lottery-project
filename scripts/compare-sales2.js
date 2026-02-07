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

  let capturedData = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const text = await response.text();
        if (text.includes('bettingPools') || text.includes('totalSales')) {
          capturedData.push({ url, data: JSON.parse(text) });
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

    // Get auth token
    const authToken = await page.evaluate(() => {
      const vuex = localStorage.getItem('vuex');
      if (vuex) {
        const state = JSON.parse(vuex);
        return state.token || null;
      }
      return null;
    });

    if (!authToken) {
      console.error('No auth token');
      await browser.close();
      return;
    }

    // Call API directly for sales by date
    console.error('Fetching sales data via API...');
    const salesData = await page.evaluate(async (token) => {
      const response = await fetch('https://api.lotocompany.com/api/v1/reports/sales/by-date?date=2026-02-01', {
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    }, authToken);

    if (salesData && salesData.bettingPools) {
      const refs = Object.values(BANCAS_12).map(b => b.ref);
      
      console.log('\n=== VENTAS SISTEMA VIEJO (2026-02-01) ===');
      console.log('BANCA                  | TICKETS | VENTAS');
      console.log('-'.repeat(50));
      
      let total = { tickets: 0, sales: 0 };
      
      for (const bp of salesData.bettingPools) {
        if (refs.includes(bp.owner)) {
          const tickets = bp.ticketCount || 0;
          const sales = parseFloat((bp.totalSales || '$0').replace(/[$,]/g, '')) || 0;
          console.log(`${bp.owner.padEnd(22)} | ${String(tickets).padStart(7)} | $${sales.toFixed(2)}`);
          total.tickets += tickets;
          total.sales += sales;
        }
      }
      console.log('-'.repeat(50));
      console.log(`${'TOTAL'.padEnd(22)} | ${String(total.tickets).padStart(7)} | $${total.sales.toFixed(2)}`);
    } else {
      console.error('No sales data found');
      console.error('Captured:', JSON.stringify(capturedData.map(c => c.url), null, 2));
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSales();
