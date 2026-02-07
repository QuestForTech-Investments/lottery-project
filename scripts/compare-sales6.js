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
          console.error('Captured sales data from: ' + url);
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

    // Take screenshot to see menu
    await page.screenshot({ path: 'after-login.png' });
    console.error('After login screenshot saved');

    // Click on Reportes in sidebar
    console.error('Looking for Reportes menu...');
    await page.click('text=Reportes').catch(() => console.error('Could not click Reportes'));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'after-reportes.png' });

    // Click on Ventas por Fecha
    console.error('Looking for Ventas por Fecha...');
    await page.click('text=Ventas por Fecha').catch(async () => {
      console.error('Trying alternative clicks...');
      await page.click('text=Por Fecha').catch(() => {});
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'after-ventas.png' });

    // Now we should be on the sales page - look for date picker
    // The date is probably today, we need to change it to yesterday
    console.error('Looking for date controls...');
    
    // Find buttons or inputs for date
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      console.error('  Button: ' + text.trim().substring(0, 30));
    }

    // Try clicking left arrow or "yesterday" type button
    await page.click('button[aria-label*="anterior"], button:has-text("<"), .mdi-chevron-left').catch(() => {});
    await page.waitForTimeout(1000);

    // Or try to input the date directly
    const dateInput = await page.$('input[type="date"]');
    if (dateInput) {
      await dateInput.fill('2026-02-01');
      await page.waitForTimeout(1000);
    }

    // Click Ver ventas or search button
    console.error('Looking for Ver ventas button...');
    await page.click('button:has-text("Ver ventas")').catch(async () => {
      await page.click('button:has-text("Ver")').catch(async () => {
        await page.click('button:has-text("Buscar")').catch(() => {});
      });
    });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'final-sales.png' });
    console.error('Final screenshot saved');

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
