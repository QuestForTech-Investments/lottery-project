#!/usr/bin/env node
/**
 * Export All Tickets with Plays to CSV from Original App
 * Uses API interception to capture ALL ticket data.
 *
 * IMPORTANTE: Incluye el SORTEO de cada jugada en el CSV
 * Formato: numero:tipo:monto:sorteo
 *
 * Historial:
 * - 2026-02-03: Agregado soporte para sorteo en cada jugada
 */

const { chromium } = require('playwright');
const fs = require('fs');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { date: null, yesterday: false, output: null, banca: null, headless: true };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--date': case '-d': options.date = args[++i]; break;
      case '--yesterday': options.yesterday = true; break;
      case '--output': case '-o': options.output = args[++i]; break;
      case '--banca': case '-b': options.banca = args[++i]; break;
      case '--no-headless': options.headless = false; break;
      case '--help': case '-h':
        console.log(`Export Tickets with Plays to CSV\n\nUsage:\n  node export-tickets-csv.js --yesterday\n  node export-tickets-csv.js -d 01/02/2026 -o tickets.csv`);
        process.exit(0);
    }
  }

  if (!options.date && !options.yesterday) {
    console.error('Error: --date or --yesterday required');
    process.exit(1);
  }

  if (options.yesterday) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    options.date = `${String(y.getDate()).padStart(2,'0')}/${String(y.getMonth()+1).padStart(2,'0')}/${y.getFullYear()}`;
  }

  if (!options.output) {
    const [d,m,yr] = options.date.split('/');
    options.output = `tickets-${yr}-${m}-${d}.csv`;
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

async function exportTickets(options) {
  const browser = await chromium.launch({ headless: options.headless });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  const [day, month, year] = options.date.split('/');
  const urlDate = `${year}-${month}-${day}`;

  // Store ALL data from API
  let lastTicketList = [];              // Most recent ticket list captured
  const ticketPlays = new Map();        // ticketCode -> plays array
  const drawIdToName = new Map();       // drawId -> sorteo name mapping
  let apiCallCount = 0;

  // Intercept ALL API responses
  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('/api/')) return;
    if (response.status() !== 200) return;

    try {
      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch { return; }

      apiCallCount++;

      // Capture sortitions/draws list for mapping drawId -> name
      if (Array.isArray(json) && json.length > 0 && json[0].sortitionId && json[0].description) {
        for (const s of json) {
          drawIdToName.set(String(s.sortitionId), s.description);
        }
      }

      // Ticket LIST response - check various structures
      if (Array.isArray(json) && json.length > 0 && json[0].code) {
        lastTicketList = json;
      } else if (json.tickets && Array.isArray(json.tickets) && json.tickets.length > 0) {
        lastTicketList = json.tickets;
      } else if (json.items && Array.isArray(json.items) && json.items.length > 0 && json.items[0].code) {
        lastTicketList = json.items;
      } else if (json.data && Array.isArray(json.data) && json.data.length > 0 && json.data[0].code) {
        lastTicketList = json.data;
      }

      // Single ticket with PLAYS response - NOW INCLUDES SORTEO
      if (json.ticket && json.plays) {
        const plays = [];
        for (const [drawId, drawPlays] of Object.entries(json.plays)) {
          // Get sorteo name from mapping or from play data
          let sorteoName = drawIdToName.get(drawId) || `SORTEO_${drawId}`;

          for (const p of drawPlays) {
            // Try to get sorteo name from play object if available
            if (p.sortition?.description) {
              sorteoName = p.sortition.description;
              drawIdToName.set(drawId, sorteoName);  // Cache it
            }

            plays.push({
              number: p.numbers,
              type: p.playType?.description || 'Unknown',
              amount: p.amount || '$0.00',
              sorteo: sorteoName,  // NUEVO: incluye el sorteo
              drawId: drawId       // NUEVO: incluye el drawId para referencia
            });
          }
        }
        // Store by the full code as-is
        ticketPlays.set(json.ticket.code, {
          ticket: json.ticket,
          plays
        });
      }
    } catch (e) { /* ignore */ }
  });

  const allTickets = [];

  try {
    // Login
    console.error('Logging in...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const bancas = options.banca ? [options.banca] : Object.keys(BANCA_POOL_IDS);
    console.error(`Processing ${bancas.length} bancas for ${options.date}...\n`);

    for (const banca of bancas) {
      const poolId = BANCA_POOL_IDS[banca];
      if (!poolId) continue;

      console.error(`${banca}:`);

      // Clear previous captures
      lastTicketList = [];
      apiCallCount = 0;

      // Navigate - this triggers the ticket LIST API call
      await page.goto(`https://la-numbers.apk.lol/#/tickets?date=${urlDate}&bettingPoolId=${poolId}`,
        { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2500);
      await page.keyboard.press('Escape').catch(() => {});

      // Get tickets from API capture
      const tickets = lastTicketList;

      if (tickets.length === 0) {
        console.error('  0 tickets\n');
        continue;
      }

      console.error(`  ${tickets.length} tickets from API - getting plays...`);

      // Now click on each ticket to get plays
      let processed = 0;
      for (const t of tickets) {
        const code = t.code;

        // Click to expand and get plays
        const clicked = await page.evaluate((ticketCode) => {
          const els = document.querySelectorAll('span, div');
          for (const el of els) {
            if (el.textContent.trim() === ticketCode) {
              el.click();
              return true;
            }
          }
          return false;
        }, code);

        if (clicked) {
          await page.waitForTimeout(600);
        }

        // Get plays from API capture (try both full code and variations)
        let playsData = ticketPlays.get(code);
        if (!playsData) {
          // Try to find by any key that ends with the code
          for (const [key, val] of ticketPlays.entries()) {
            if (key.endsWith(code) || key.includes(code)) {
              playsData = val;
              break;
            }
          }
        }
        const plays = playsData?.plays || [];

        // If no API data, try DOM extraction
        if (plays.length === 0 && clicked) {
          const domPlays = await page.evaluate(() => {
            const result = [];
            const rows = document.querySelectorAll('div');
            for (const row of rows) {
              const cells = Array.from(row.children);
              if (cells.length >= 3) {
                const num = cells[0]?.textContent?.trim();
                const type = cells[1]?.textContent?.trim();
                const amount = cells[2]?.textContent?.trim();
                if (num && /^\d{2}(-\d{2})?(-\d{2})?$/.test(num) &&
                    ['Directo', 'Pale', 'Tripleta', 'Super Pale'].includes(type)) {
                  result.push({ number: num, type, amount, sorteo: 'DOM_EXTRACTED' });
                }
              }
            }
            return result;
          });
          plays.push(...domPlays);
        }

        allTickets.push({
          fecha: t.dateOfFirstPlay || t.closedDate || options.date,
          code: code,
          banca: banca,
          monto: t.amount || '$0.00',
          premio: t.totalPrize || '$0.00',
          estado: t.status?.description || 'Unknown',
          plays: plays
        });

        processed++;
        process.stderr.write(`\r  ${processed}/${tickets.length}`);

        // Collapse
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(150);
      }

      console.error('');
    }

    console.error(`\nTotal: ${allTickets.length} tickets`);

    // Generate CSV - NUEVO FORMATO INCLUYE SORTEO
    // Formato jugadas: numero:tipo:monto:sorteo|numero:tipo:monto:sorteo|...
    const lines = ['fecha,ticket,banca,monto,premio,estado,jugadas'];
    for (const t of allTickets) {
      // IMPORTANTE: Ahora incluye el sorteo en cada jugada
      const jugadas = t.plays.map(p => `${p.number}:${p.type}:${p.amount}:${p.sorteo || 'UNKNOWN'}`).join('|');
      const esc = (s) => s && (s.includes(',') || s.includes('"')) ? `"${s.replace(/"/g,'""')}"` : (s || '');
      lines.push([t.fecha, t.code, t.banca, t.monto, t.premio, t.estado, esc(jugadas)].join(','));
    }

    // Log sorteos encontrados
    console.error(`\nSorteos capturados: ${drawIdToName.size}`);
    for (const [id, name] of drawIdToName.entries()) {
      console.error(`  ${id}: ${name}`);
    }

    fs.writeFileSync(options.output, lines.join('\n'));
    console.error(`Saved: ${options.output} (${lines.length - 1} rows)`);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

exportTickets(parseArgs());
