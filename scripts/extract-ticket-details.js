#!/usr/bin/env node
/**
 * Extract Ticket Details from Original App (la-numbers.apk.lol)
 * Uses network interception to capture API responses directly.
 *
 * Usage:
 *   node extract-ticket-details.js --ticket LAN-010-000061158 --yesterday
 *   node extract-ticket-details.js -t LAN-010-000061198 -d 01/02/2026
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    ticket: null,
    date: null,
    yesterday: false,
    output: null,
    screenshot: false,
    headless: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--ticket':
      case '-t':
        options.ticket = args[++i];
        break;
      case '--date':
      case '-d':
        options.date = args[++i];
        break;
      case '--yesterday':
        options.yesterday = true;
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
Extract Ticket Details from Original App (la-numbers.apk.lol)

Usage:
  node extract-ticket-details.js --ticket LAN-010-000061158 --yesterday
  node extract-ticket-details.js -t LAN-010-000061198 -d 01/02/2026

Options:
  --ticket, -t      Ticket code (e.g., LAN-010-000061158)
  --date, -d        Date in DD/MM/YYYY format
  --yesterday       Use yesterday's date
  --output, -o      Output file path (optional, defaults to stdout)
  --screenshot      Take screenshot of the ticket details
  --no-headless     Run with visible browser
  --help, -h        Show this help message
        `);
        process.exit(0);
    }
  }

  if (!options.ticket) {
    console.error('Error: --ticket is required');
    process.exit(1);
  }

  if (!options.date && !options.yesterday) {
    console.error('Error: Either --date or --yesterday is required');
    process.exit(1);
  }

  const ticketRegex = /^LAN-\d{3}-\d{9}$/;
  if (!ticketRegex.test(options.ticket)) {
    console.error('Error: Invalid ticket format. Expected: LAN-XXX-XXXXXXXXX');
    process.exit(1);
  }

  if (options.yesterday) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    options.date = `${String(yesterday.getDate()).padStart(2, '0')}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${yesterday.getFullYear()}`;
  }

  return options;
}

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

const BANCA_POOL_IDS = {
  'LAN-0010': 37, 'LAN-0016': 43, 'LAN-0021': 48, 'LAN-0048': 75,
  'LAN-0063': 90, 'LAN-0119': 153, 'LAN-0135': 169, 'LAN-0182': 216,
  'LAN-0186': 220, 'LAN-0194': 228, 'LAN-0201': 236, 'LAN-0203': 253,
  'LAN-0230': 317, 'LAN-0254': 6848, 'LAN-0278': 11093, 'LAN-0284': 11099,
  'LAN-0300': 11115, 'LAN-0316': 16274, 'LAN-0318': 16276, 'LAN-0333': 16815
};

async function extractTicketDetails(options) {
  const browser = await chromium.launch({ headless: options.headless });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Extract banca info from ticket code
  const ticketParts = options.ticket.split('-');
  const bancaCode = `LAN-00${ticketParts[1].replace(/^0+/, '') || '0'}`;
  const bettingPoolId = BANCA_POOL_IDS[bancaCode];
  const [day, month, year] = options.date.split('/');
  const urlDate = `${year}-${month}-${day}`;

  const result = {
    ticketCode: options.ticket,
    date: options.date,
    extractedAt: new Date().toISOString(),
    ticket: null,
    apiData: null,
    error: null
  };

  // Store intercepted API responses
  let ticketApiData = null;

  try {
    // Intercept API responses
    page.on('response', async (response) => {
      const url = response.url();
      // Capture ticket-related API calls
      if (url.includes('/api/') && url.includes('ticket')) {
        try {
          const json = await response.json();
          if (json && (json.ticketCode || json.code || json.plays)) {
            ticketApiData = json;
          }
        } catch (e) { /* Not JSON */ }
      }
    });

    // Login
    console.error('Logging in...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Navigate to tickets page
    let ticketUrl = `https://la-numbers.apk.lol/#/tickets?date=${urlDate}`;
    if (bettingPoolId) ticketUrl += `&bettingPoolId=${bettingPoolId}`;
    console.error(`Navigating to tickets...`);
    await page.goto(ticketUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Close dialogs
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(500);

    // Search for ticket
    console.error(`Searching for ${options.ticket}...`);
    const quickFilter = page.locator('input[placeholder*="Filtro"]').first();
    if (await quickFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await quickFilter.fill(options.ticket);
      await page.waitForTimeout(1500);
    }

    // Click on ticket using JavaScript to bypass overlay issues
    const ticketFound = await page.evaluate((ticketCode) => {
      const elements = document.querySelectorAll('span, div');
      for (const el of elements) {
        if (el.textContent.trim() === ticketCode) {
          el.click();
          return true;
        }
      }
      return false;
    }, options.ticket);

    if (ticketFound) {
      console.error('Expanding ticket...');
      await page.waitForTimeout(2500);

      // Verify expansion by checking for details
      const hasDetails = await page.evaluate(() => {
        return document.body.innerText.includes('Número Mágico');
      });

      if (!hasDetails) {
        // Try clicking via locator as fallback
        const ticketLink = page.locator(`text=${options.ticket}`).first();
        await ticketLink.click({ force: true }).catch(() => {});
        await page.waitForTimeout(2000);
      }

      // Screenshot if requested
      if (options.screenshot) {
        const screenshotPath = path.join(__dirname, '..', '.playwright-mcp', `ticket-${options.ticket}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.error(`Screenshot: ${screenshotPath}`);
      }

      // Extract from page text (simpler regex approach)
      const pageData = await page.evaluate(() => {
        const text = document.body.innerText;
        const data = {};

        // Extract key fields with regex
        const patterns = {
          internalId: /([A-F0-9]{2})-LAN-\d{3}-\d{9}/,
          magicNumber: /Número Mágico:\s*([A-F0-9]{32})/,
          ipAddress: /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/,
          totals: /Jugadas\s*\(Monto:\s*\$?([\d,.]+)\)\s*\(Pendientes de pago:\s*\$?([\d,.]+)\s*\)\s*\(Total de premios:\s*([^)]+)\)/,
          firstPlayDate: /Fecha de primera jugada:\s*([^\n]+)/,
          printDate: /Fecha de impresión:\s*([^\n]+)/
        };

        for (const [key, pattern] of Object.entries(patterns)) {
          const match = text.match(pattern);
          if (match) {
            if (key === 'totals') {
              data.totalAmount = parseFloat(match[1].replace(/,/g, '')) || 0;
              data.pendingPayment = parseFloat(match[2].replace(/,/g, '')) || 0;
              data.totalPrizes = match[3].trim() === '-' ? 0 : parseFloat(match[3].replace(/[$,]/g, '')) || 0;
            } else {
              data[key] = match[1].trim();
            }
          }
        }

        // Extract plays from visible structure
        const plays = [];
        const rows = document.querySelectorAll('div');
        let currentDraw = null;

        for (const row of rows) {
          const cells = Array.from(row.children);
          if (cells.length >= 4) {
            const num = cells[0]?.textContent?.trim();
            const type = cells[1]?.textContent?.trim();
            const amount = cells[2]?.textContent?.trim();
            const prize = cells[3]?.textContent?.trim();

            if (num && /^\d{2}(-\d{2})?(-\d{2})?$/.test(num) &&
                ['Directo', 'Pale', 'Tripleta', 'Super Pale', 'Pick 3', 'Pick 4'].includes(type)) {
              plays.push({
                number: num,
                type: type,
                amount: amount,
                prize: prize === '-' ? null : prize.match(/\$[\d,.]+/)?.[0] || null,
                isWinner: prize !== '-' && prize.includes('$')
              });
            }
          }

          // Detect draw names
          if (row.childNodes.length === 1 && row.childNodes[0].nodeType === 3) {
            const t = row.textContent.trim();
            if (t.length > 3 && t.length < 40 && !t.includes('$') && !t.includes('LAN-') &&
                row.nextElementSibling?.textContent?.includes('Tipo de jugada')) {
              currentDraw = t;
            }
          }
        }

        data.plays = plays;
        data.drawName = currentDraw;
        return data;
      });

      // Build result
      result.ticket = {
        code: options.ticket,
        internalId: pageData.internalId || null,
        magicNumber: pageData.magicNumber || null,
        ipAddress: pageData.ipAddress || null,
        firstPlayDate: pageData.firstPlayDate || null,
        printDate: pageData.printDate || null,
        totalAmount: pageData.totalAmount || 0,
        pendingPayment: pageData.pendingPayment || 0,
        totalPrizes: pageData.totalPrizes || 0,
        draws: pageData.drawName ? [{
          name: pageData.drawName,
          plays: pageData.plays || []
        }] : []
      };

      // Include raw API data if captured
      if (ticketApiData) {
        result.apiData = ticketApiData;
      }

      console.error('Extraction complete.');
    } else {
      result.error = `Ticket ${options.ticket} not found for date ${options.date}`;
      console.error(result.error);
    }

  } catch (error) {
    console.error('Error:', error.message);
    result.error = error.message;
  } finally {
    await browser.close();
  }

  return result;
}

async function main() {
  const options = parseArgs();
  const result = await extractTicketDetails(options);
  const json = JSON.stringify(result, null, 2);

  if (options.output) {
    fs.writeFileSync(options.output, json);
    console.error(`Saved to: ${options.output}`);
  } else {
    console.log(json);
  }

  // Summary
  if (result.ticket) {
    console.error('\n=== TICKET ===');
    console.error(`Code: ${result.ticket.code}`);
    console.error(`Amount: $${result.ticket.totalAmount.toFixed(2)}`);
    console.error(`Prizes: $${result.ticket.totalPrizes.toFixed(2)}`);
    if (result.ticket.draws[0]?.plays?.length) {
      console.error(`Plays (${result.ticket.draws[0].plays.length}):`);
      for (const p of result.ticket.draws[0].plays) {
        const w = p.isWinner ? ' ✓ WINNER' : '';
        console.error(`  ${p.number} (${p.type}): ${p.amount} → ${p.prize || '-'}${w}`);
      }
    }
  }
}

main();
