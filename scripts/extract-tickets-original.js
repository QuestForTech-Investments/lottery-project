#!/usr/bin/env node
/**
 * Extract Tickets from Original App (la-numbers.apk.lol)
 *
 * Usage:
 *   node extract-tickets-original.js --date DD/MM/YYYY --banca BANCA_NAME
 *   node extract-tickets-original.js -d 01/02/2026 -b GILBERTO
 *
 * Options:
 *   --date, -d    Date in DD/MM/YYYY format (required)
 *   --banca, -b   Banca name to filter (required)
 *   --output, -o  Output file path (optional, defaults to stdout as JSON)
 *   --screenshot  Take screenshot of the results page
 *   --headless    Run in headless mode (default: true)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
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
Extract Tickets from Original App (la-numbers.apk.lol)

Usage:
  node extract-tickets-original.js --date DD/MM/YYYY --banca BANCA_NAME

Options:
  --date, -d      Date in DD/MM/YYYY format (required)
  --banca, -b     Banca name to filter (required)
  --output, -o    Output file path (optional, defaults to stdout)
  --screenshot    Take screenshot of the results page
  --no-headless   Run with visible browser
  --help, -h      Show this help message

Examples:
  node extract-tickets-original.js -d 01/02/2026 -b GILBERTO
  node extract-tickets-original.js -d 01/02/2026 -b GILBERTO -o tickets.json --screenshot
        `);
        process.exit(0);
    }
  }

  if (!options.date) {
    console.error('Error: --date is required');
    process.exit(1);
  }

  if (!options.banca) {
    console.error('Error: --banca is required');
    process.exit(1);
  }

  // Validate date format
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(options.date)) {
    console.error('Error: Date must be in DD/MM/YYYY format');
    process.exit(1);
  }

  return options;
}

// Credentials for original app
const CREDENTIALS = {
  username: 'oliver',
  password: 'oliver0597@'
};

async function extractTickets(options) {
  const browser = await chromium.launch({
    headless: options.headless,
    slowMo: options.headless ? 0 : 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const result = {
    date: options.date,
    banca: options.banca,
    extractedAt: new Date().toISOString(),
    summary: {
      totalTickets: 0,
      totalSales: 0,
      totalPrize: 0,
      winners: 0,
      losers: 0,
      pending: 0
    },
    tickets: []
  };

  try {
    console.error('Connecting to original app...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Login
    console.error('Logging in...');
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);

    // Click login button
    const loginBtn = page.locator('button:has-text("LOGIN"), button:has-text("Iniciar"), button[type="submit"]').first();
    await loginBtn.click();
    await page.waitForTimeout(4000);

    // Navigate to ticket monitoring
    console.error('Navigating to ticket monitoring...');
    await page.click('text=Tickets');
    await page.waitForTimeout(1000);
    await page.click('text=Monitoreo');
    await page.waitForTimeout(3000);

    // Set date using JavaScript to directly set the input value
    console.error(`Setting date to ${options.date}...`);

    // Find the date input and clear it, then type the new date
    const dateInput = page.locator('input').first();
    await dateInput.click();
    await page.waitForTimeout(300);

    // Select all and delete
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    // Type the date character by character
    for (const char of options.date) {
      await page.keyboard.type(char);
      await page.waitForTimeout(50);
    }

    // Close any date picker that may have opened
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Click somewhere else to blur
    await page.click('h1, h2, .title, header', { force: true }).catch(() => {});
    await page.waitForTimeout(500);

    // Select banca - need to interact with the autocomplete/combobox
    console.error(`Selecting banca: ${options.banca}...`);

    // The Banca field is the second input
    const bancaInput = page.locator('input').nth(1);
    await bancaInput.click();
    await page.waitForTimeout(500);

    // Clear any existing value
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    // Type the banca name slowly to trigger autocomplete
    for (const char of options.banca) {
      await page.keyboard.type(char);
      await page.waitForTimeout(100);
    }

    // Wait for dropdown to appear
    await page.waitForTimeout(2000);

    // Try to find and click the dropdown item
    // Look for various dropdown patterns
    const dropdownSelectors = [
      `div.v-list-item:has-text("${options.banca}")`,
      `div[role="option"]:has-text("${options.banca}")`,
      `.menuable__content__active .v-list-item`,
      `div.v-menu__content .v-list-item`,
      `[class*="list-item"]:has-text("${options.banca}")`
    ];

    let clicked = false;
    for (const selector of dropdownSelectors) {
      const item = page.locator(selector).first();
      if (await item.isVisible().catch(() => false)) {
        console.error(`Found dropdown item with selector: ${selector}`);
        await item.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      console.error('Dropdown item not found, trying keyboard navigation...');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);
      await page.keyboard.press('Enter');
    }

    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Click FILTRAR button
    console.error('Clicking FILTRAR button...');
    const filtrarBtn = page.locator('button:has-text("FILTRAR")');
    await filtrarBtn.click();
    await page.waitForTimeout(5000);

    // Take screenshot
    if (options.screenshot) {
      const screenshotDir = path.join(__dirname, '..', '.playwright-mcp');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      const screenshotPath = path.join(screenshotDir, `tickets-${options.banca}-${options.date.replace(/\//g, '-')}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error(`Screenshot saved to: ${screenshotPath}`);
    }

    // Extract summary
    console.error('Extracting summary...');
    const summaryText = await page.textContent('body');

    // Parse summary values
    const montoMatch = summaryText.match(/Monto total:\s*\$?([\d,]+\.?\d*)/i);
    const premiosMatch = summaryText.match(/Total de premios:\s*\$?([\d,]+\.?\d*)/i);

    if (montoMatch) {
      result.summary.totalSales = parseFloat(montoMatch[1].replace(/,/g, ''));
    }
    if (premiosMatch) {
      result.summary.totalPrize = parseFloat(premiosMatch[1].replace(/,/g, ''));
    }

    // Parse filter tabs for counts
    const todosMatch = summaryText.match(/TODOS\s*\((\d+)\)/i);
    const ganadoresMatch = summaryText.match(/GANADORES\s*\((\d+)\)/i);
    const pendientesMatch = summaryText.match(/PENDIENTES\s*\((\d+)\)/i);
    const perdedoresMatch = summaryText.match(/PERDEDORES\s*\((\d+)\)/i);

    if (todosMatch) result.summary.totalTickets = parseInt(todosMatch[1]);
    if (ganadoresMatch) result.summary.winners = parseInt(ganadoresMatch[1]);
    if (pendientesMatch) result.summary.pending = parseInt(pendientesMatch[1]);
    if (perdedoresMatch) result.summary.losers = parseInt(perdedoresMatch[1]);

    // Check entries count
    const entriesMatch = summaryText.match(/Mostrando\s+(\d+)\s+entradas/i);
    if (entriesMatch) {
      console.error(`Found ${entriesMatch[1]} entries in table`);
    }

    // Extract ticket rows
    console.error('Extracting ticket details...');

    await page.waitForSelector('table tbody tr', { timeout: 5000 }).catch(() => {
      console.error('No table rows found');
    });

    const tableRows = await page.locator('table tbody tr').all();
    console.error(`Found ${tableRows.length} table rows`);

    for (const row of tableRows) {
      const cells = await row.locator('td').all();
      if (cells.length >= 5) {
        const ticket = {
          ticketCode: '',
          date: '',
          user: '',
          amount: 0,
          prize: 0,
          cancelDate: '',
          status: '',
          rawCells: []
        };

        for (let i = 0; i < cells.length; i++) {
          const text = (await cells[i].textContent() || '').trim();
          ticket.rawCells.push(text);

          switch (i) {
            case 0:
              ticket.ticketCode = text;
              break;
            case 1:
              ticket.date = text;
              break;
            case 2:
              ticket.user = text;
              break;
            case 3:
              ticket.amount = parseFloat(text.replace(/[$,]/g, '')) || 0;
              break;
            case 4:
              ticket.prize = parseFloat(text.replace(/[$,]/g, '')) || 0;
              break;
            case 5:
              ticket.cancelDate = text;
              break;
            case 6:
              ticket.status = text;
              break;
          }
        }

        if (ticket.ticketCode && ticket.ticketCode.includes('-')) {
          result.tickets.push(ticket);
        }
      }
    }

    if (result.tickets.length === 0 && result.summary.totalTickets > 0) {
      console.error(`Table empty but summary shows ${result.summary.totalTickets} tickets`);
    }

    console.error(`Extraction complete. Found ${result.tickets.length} tickets.`);

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

// Main execution
async function main() {
  const options = parseArgs();

  try {
    const result = await extractTickets(options);

    const jsonOutput = JSON.stringify(result, null, 2);

    if (options.output) {
      fs.writeFileSync(options.output, jsonOutput);
      console.error(`Results saved to: ${options.output}`);
    } else {
      console.log(jsonOutput);
    }

    console.error('\n=== SUMMARY ===');
    console.error(`Date: ${result.date}`);
    console.error(`Banca: ${result.banca}`);
    console.error(`Total Tickets: ${result.summary.totalTickets}`);
    console.error(`Total Sales: $${result.summary.totalSales.toFixed(2)}`);
    console.error(`Total Prize: $${result.summary.totalPrize.toFixed(2)}`);
    console.error(`Winners: ${result.summary.winners}`);
    console.error(`Losers: ${result.summary.losers}`);
    console.error(`Pending: ${result.summary.pending}`);
    if (result.tickets.length > 0) {
      console.error(`\nFirst 5 tickets:`);
      result.tickets.slice(0, 5).forEach((t, i) => {
        console.error(`  ${i + 1}. ${t.ticketCode} - $${t.amount} (${t.status})`);
      });
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
