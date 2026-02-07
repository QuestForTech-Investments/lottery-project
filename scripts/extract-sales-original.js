#!/usr/bin/env node
/**
 * Extract Daily Sales from Original App (la-numbers.apk.lol)
 *
 * Usage:
 *   node extract-sales-original.js --date DD/MM/YYYY
 *   node extract-sales-original.js -d 01/02/2026
 *   node extract-sales-original.js --yesterday
 *
 * Options:
 *   --date, -d      Date in DD/MM/YYYY format
 *   --yesterday     Use yesterday's date (simpler, uses built-in button)
 *   --banca, -b     Filter by banca name (optional)
 *   --output, -o    Output file path (optional, defaults to stdout)
 *   --screenshot    Take screenshot of the results page
 *   --no-headless   Run with visible browser
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
    yesterday: false,
    banca: null,
    output: null,
    screenshot: false,
    headless: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--date':
      case '-d':
        options.date = args[++i];
        break;
      case '--yesterday':
        options.yesterday = true;
        break;
      case '--banca':
      case '-b':
        options.banca = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--screenshot':
        options.screenshot = true;
        break;
      case '--no-headless':
        options.headless = false;
        break;
      case '--help':
      case '-h':
        console.log(`
Extract Daily Sales from Original App (la-numbers.apk.lol)

Usage:
  node extract-sales-original.js --date DD/MM/YYYY
  node extract-sales-original.js --yesterday

Options:
  --date, -d      Date in DD/MM/YYYY format
  --yesterday     Use yesterday's date (recommended for recent data)
  --banca, -b     Filter results by banca name (optional)
  --output, -o    Output file path (optional, defaults to stdout)
  --screenshot    Take screenshot of the results page
  --no-headless   Run with visible browser
  --help, -h      Show this help message

Examples:
  node extract-sales-original.js --yesterday
  node extract-sales-original.js -d 01/02/2026
  node extract-sales-original.js -d 01/02/2026 --banca GILBERTO
        `);
        process.exit(0);
    }
  }

  if (!options.date && !options.yesterday) {
    console.error('Error: Either --date or --yesterday is required');
    process.exit(1);
  }

  if (options.date) {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(options.date)) {
      console.error('Error: Date must be in DD/MM/YYYY format');
      process.exit(1);
    }
  }

  return options;
}

const CREDENTIALS = {
  username: 'oliver',
  password: 'oliver0597@'
};

function parseCurrency(str) {
  if (!str || str === '-') return 0;
  const cleaned = str.replace(/[$,]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

function parseIntSafe(str) {
  if (!str || str === '-') return 0;
  return parseInt(str.replace(/,/g, ''), 10) || 0;
}

async function extractSales(options) {
  const browser = await chromium.launch({
    headless: options.headless,
    slowMo: options.headless ? 0 : 50
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const result = {
    date: options.date || 'yesterday',
    extractedAt: new Date().toISOString(),
    totals: {
      pending: 0,
      losers: 0,
      winners: 0,
      totalTickets: 0,
      sales: 0,
      commissions: 0,
      discounts: 0,
      prizes: 0,
      net: 0
    },
    bancas: []
  };

  try {
    // Step 1: Login
    console.error('Connecting to original app...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    console.error('Logging in...');
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);

    // Step 2: Navigate to "Ventas del día"
    console.error('Navigating to Ventas del día...');
    await page.goto('https://la-numbers.apk.lol/#/sales/daily', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Close any notification dialogs that may appear
    console.error('Checking for notification dialogs...');
    const closeButtons = [
      '.swal2-close',
      'button:has-text("Marcar como leída")',
      'button:has-text("Recordarme luego")',
      'button:has-text("CANCELAR")',
      '.modal-close',
      '[aria-label="Close"]'
    ];
    for (const selector of closeButtons) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(500);
        }
      } catch (e) { /* ignore */ }
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(1000);

    // Step 3: Select date
    if (options.yesterday) {
      console.error('Using "Procesar ventas de ayer" button...');
      await page.click('button:has-text("PROCESAR VENTAS DE AYER")');
      await page.waitForTimeout(2000);

      // Handle SweetAlert2 confirmation dialog - click confirm button
      console.error('Confirming SweetAlert dialog...');
      try {
        // SweetAlert2 puts the confirm button with class swal2-confirm
        await page.click('.swal2-confirm, .swal2-styled.swal2-confirm, button.swal2-confirm');
        await page.waitForTimeout(5000);
      } catch (e) {
        console.error('Dialog confirmation failed, trying alternative:', e.message);
        // Try clicking any button with text PROCESAR inside the swal container
        await page.click('.swal2-container button:has-text("PROCESAR")').catch(() => {});
        await page.waitForTimeout(5000);
      }
    } else {
      console.error(`Setting date to ${options.date}...`);
      const [day, month, year] = options.date.split('/').map(Number);

      // Click on date input to open calendar
      const dateInput = page.locator('input[type="text"]').first();
      await dateInput.click();
      await page.waitForTimeout(1000);

      // Type the date directly (clear first)
      await page.keyboard.press('Control+a');
      await page.keyboard.type(options.date);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Click Ver ventas
      await page.click('button:has-text("Ver ventas")');
      await page.waitForTimeout(5000);
    }

    // Step 4: Take screenshot if requested
    if (options.screenshot) {
      const screenshotDir = path.join(__dirname, '..', '.playwright-mcp');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      const dateStr = options.yesterday ? 'yesterday' : options.date.replace(/\//g, '-');
      const screenshotPath = path.join(screenshotDir, `sales-${dateStr}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error(`Screenshot saved to: ${screenshotPath}`);
    }

    // Step 5: Extract data using page.evaluate
    console.error('Extracting sales data...');

    const extractedData = await page.evaluate(() => {
      const data = {
        date: '',
        bancas: [],
        totals: {}
      };

      // Get the displayed date
      const dateInput = document.querySelector('input[type="text"]');
      if (dateInput) {
        data.date = dateInput.value;
      }

      // Find all LAN-XXXX links and extract row data
      const links = document.querySelectorAll('a[href*="bettingPoolId"]');

      links.forEach(link => {
        // Get the row - traverse up to find the container with all cells
        let row = link.parentElement;
        while (row && row.children.length < 10) {
          row = row.parentElement;
        }
        if (!row) return;

        // Get all direct children divs as cells
        const cells = Array.from(row.children);
        const values = cells.map(c => c.textContent.trim());

        // Extract bettingPoolId from URL
        const urlMatch = link.href.match(/bettingPoolId=(\d+)/);
        const bettingPoolId = urlMatch ? parseInt(urlMatch[1]) : null;

        const code = link.textContent.trim();

        // Table columns: Ref(0), Código(1), P(2), L(3), W(4), Total(5), Venta(6), Comisiones(7), Descuentos(8), Premios(9), Neto(10), Caída(11), Final(12), Balance(13), Caída acumulada(14)
        if (code.startsWith('LAN-') && values.length >= 10) {
          data.bancas.push({
            ref: values[0] || '',
            code: code,
            bettingPoolId: bettingPoolId,
            pending: values[2] || '0',
            losers: values[3] || '0',
            winners: values[4] || '0',
            totalTickets: values[5] || '0',
            sales: values[6] || '$0.00',
            commissions: values[7] || '$0.00',
            discounts: values[8] || '$0.00',
            prizes: values[9] || '$0.00',
            net: values[10] || '$0.00',
            drop: values[11] || '$0.00',
            final: values[12] || '$0.00',
            balance: values[13] || '$0.00',
            accumulatedDrop: values[14] || '$0.00'
          });
        }
      });

      // Find totals row
      const totalsText = document.body.innerText;
      const netMatch = totalsText.match(/Neto \(banca\/grupos\/agentes\):\s*(-?\$[\d,]+\.?\d*)/);
      if (netMatch) {
        data.totals.netDisplay = netMatch[1];
      }

      return data;
    });

    // Update result with extracted data
    result.date = extractedData.date || result.date;

    // Parse banca data
    for (const banca of extractedData.bancas) {
      result.bancas.push({
        ref: banca.ref,
        code: banca.code,
        bettingPoolId: banca.bettingPoolId,
        pending: parseIntSafe(banca.pending),
        losers: parseIntSafe(banca.losers),
        winners: parseIntSafe(banca.winners),
        totalTickets: parseIntSafe(banca.totalTickets),
        sales: parseCurrency(banca.sales),
        commissions: parseCurrency(banca.commissions),
        discounts: parseCurrency(banca.discounts),
        prizes: parseCurrency(banca.prizes),
        net: parseCurrency(banca.net),
        drop: parseCurrency(banca.drop),
        final: parseCurrency(banca.final),
        balance: parseCurrency(banca.balance),
        accumulatedDrop: parseCurrency(banca.accumulatedDrop)
      });
    }

    // Calculate totals
    result.totals.pending = result.bancas.reduce((sum, b) => sum + b.pending, 0);
    result.totals.losers = result.bancas.reduce((sum, b) => sum + b.losers, 0);
    result.totals.winners = result.bancas.reduce((sum, b) => sum + b.winners, 0);
    result.totals.totalTickets = result.bancas.reduce((sum, b) => sum + b.totalTickets, 0);
    result.totals.sales = result.bancas.reduce((sum, b) => sum + b.sales, 0);
    result.totals.commissions = result.bancas.reduce((sum, b) => sum + b.commissions, 0);
    result.totals.discounts = result.bancas.reduce((sum, b) => sum + b.discounts, 0);
    result.totals.prizes = result.bancas.reduce((sum, b) => sum + b.prizes, 0);
    result.totals.net = result.bancas.reduce((sum, b) => sum + b.net, 0);

    // Filter by banca if specified
    if (options.banca) {
      const filter = options.banca.toUpperCase();
      result.bancas = result.bancas.filter(b =>
        b.ref.toUpperCase().includes(filter) ||
        b.code.toUpperCase().includes(filter)
      );
    }

    console.error(`Extraction complete. Found ${result.bancas.length} bancas.`);

  } catch (error) {
    console.error('Error during extraction:', error.message);

    const errorScreenshotPath = path.join(__dirname, '..', '.playwright-mcp', 'extraction-error.png');
    await page.screenshot({ path: errorScreenshotPath, fullPage: true }).catch(() => {});
    console.error(`Error screenshot saved to: ${errorScreenshotPath}`);

    result.error = error.message;
  } finally {
    await browser.close();
  }

  return result;
}

async function main() {
  const options = parseArgs();

  try {
    const result = await extractSales(options);

    const jsonOutput = JSON.stringify(result, null, 2);

    if (options.output) {
      fs.writeFileSync(options.output, jsonOutput);
      console.error(`Results saved to: ${options.output}`);
    } else {
      console.log(jsonOutput);
    }

    console.error('\n=== SUMMARY ===');
    console.error(`Date: ${result.date}`);
    console.error(`Total Bancas: ${result.bancas.length}`);
    console.error(`Total Tickets: ${result.totals.totalTickets}`);
    console.error(`  - Pending: ${result.totals.pending}`);
    console.error(`  - Losers: ${result.totals.losers}`);
    console.error(`  - Winners: ${result.totals.winners}`);
    console.error(`Total Sales: $${result.totals.sales.toFixed(2)}`);
    console.error(`Total Commissions: $${result.totals.commissions.toFixed(2)}`);
    console.error(`Total Prizes: $${result.totals.prizes.toFixed(2)}`);
    console.error(`Net: $${result.totals.net.toFixed(2)}`);

    if (result.bancas.length > 0 && result.bancas.length <= 25) {
      console.error('\nBancas:');
      result.bancas.forEach((b, i) => {
        console.error(`  ${i + 1}. ${b.ref} (${b.code}): ${b.totalTickets} tickets, $${b.sales.toFixed(2)} sales, $${b.prizes.toFixed(2)} prizes`);
      });
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
