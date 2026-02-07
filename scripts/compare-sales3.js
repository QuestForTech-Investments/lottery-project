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

  try {
    console.error('Logging in...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

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
    console.error('Got token');

    // Try different date formats and endpoints
    const endpoints = [
      'https://api.lotocompany.com/api/v1/reports/sales/by-date?date=2026-02-01',
      'https://api.lotocompany.com/api/v1/reports/sales/by-date?date=01/02/2026',
      'https://api.lotocompany.com/api/v1/reports/sales?date=2026-02-01',
    ];

    for (const endpoint of endpoints) {
      console.error(`Trying: ${endpoint}`);
      const result = await page.evaluate(async ({ url, token }) => {
        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer ' + token
            }
          });
          return { status: response.status, data: await response.text() };
        } catch (e) {
          return { error: e.message };
        }
      }, { url: endpoint, token: authToken });
      
      console.error(`  Status: ${result.status || result.error}`);
      if (result.data && result.data.length < 500) {
        console.error(`  Data: ${result.data}`);
      } else if (result.data) {
        console.error(`  Data length: ${result.data.length} chars`);
        // Parse and show summary
        try {
          const json = JSON.parse(result.data);
          if (json.bettingPools) {
            console.error(`  Found ${json.bettingPools.length} betting pools`);
            
            const refs = Object.values(BANCAS_12).map(b => b.ref);
            console.log('\n=== VENTAS SISTEMA VIEJO (2026-02-01) ===');
            console.log('BANCA                  | TICKETS | VENTAS');
            console.log('-'.repeat(50));
            
            let total = { tickets: 0, sales: 0 };
            
            for (const bp of json.bettingPools) {
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
            break;
          }
        } catch (e) {
          console.error(`  Parse error: ${e.message}`);
        }
      }
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSales();
