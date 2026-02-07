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
          console.error('Captured: ' + json.bettingPools.length + ' bancas, URL: ' + url.substring(url.indexOf('?')));
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
    await page.click('text=VENTAS');
    await page.waitForTimeout(500);

    // Click Ventas por fecha
    await page.click('text=Ventas por fecha');
    await page.waitForTimeout(2000);

    // Click somewhere in the main content area to close sidebar focus
    await page.click('.main-panel, .content, h4').catch(() => {});
    await page.waitForTimeout(300);

    // Find the date input and change it
    console.error('Looking for date input...');
    const dateInput = await page.$('input[type="text"][class*="date"], input.el-input__inner, .date-picker input');
    if (dateInput) {
      await dateInput.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Control+a');
      await page.keyboard.type('01/02/2026');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
    }

    // Take screenshot to see state
    await page.screenshot({ path: 'date-set.png' });

    // Click VER VENTAS - try multiple selectors
    console.error('Clicking VER VENTAS...');
    const clicked = await page.click('button.btn-info:has-text("VER"), button:has-text("VER VENTAS")').catch(() => false);
    if (!clicked) {
      // Try by position - the button should be in the main area
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text.includes('VER') && text.includes('VENTAS')) {
          await btn.click();
          break;
        }
      }
    }
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'after-click.png' });

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
      console.error('No sales data captured - check screenshots');
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

getSales();
