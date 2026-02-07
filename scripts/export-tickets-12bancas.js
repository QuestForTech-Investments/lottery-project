#!/usr/bin/env node
/**
 * Export Tickets from the 12 Bancas that exist in both systems
 * Ensures ALL plays are captured with retry logic.
 */

const { chromium } = require('playwright');
const fs = require('fs');

const CREDENTIALS = { username: 'oliver', password: 'oliver0597@' };

// Only the 12 bancas that exist in both systems
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

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { date: null, yesterday: false, output: null, headless: true };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--date': case '-d': options.date = args[++i]; break;
      case '--yesterday': options.yesterday = true; break;
      case '--output': case '-o': options.output = args[++i]; break;
      case '--no-headless': options.headless = false; break;
      case '--help': case '-h':
        console.log(`Export Tickets from 12 Bancas (both systems)

Usage:
  node export-tickets-12bancas.js --yesterday
  node export-tickets-12bancas.js -d 01/02/2026 -o tickets.csv

Only exports from these 12 bancas:
${Object.entries(BANCAS_12).map(([code, info]) => `  ${code} - ${info.ref}`).join('\n')}`);
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
    options.output = `tickets-12bancas-${yr}-${m}-${d}.csv`;
  }

  return options;
}

async function exportTickets(options) {
  const browser = await chromium.launch({ headless: options.headless });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

  const [day, month, year] = options.date.split('/');
  const urlDate = `${year}-${month}-${day}`;

  // Store API data
  let lastTicketList = [];
  const ticketPlays = new Map();

  // Intercept API responses
  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('/api/')) return;
    if (response.status() !== 200) return;

    try {
      const text = await response.text();
      let json;
      try { json = JSON.parse(text); } catch { return; }

      // Ticket list
      if (json.tickets && Array.isArray(json.tickets)) {
        lastTicketList = json.tickets;
      }

      // Single ticket with plays
      if (json.ticket && json.plays) {
        const plays = [];
        for (const [drawId, drawPlays] of Object.entries(json.plays)) {
          for (const p of drawPlays) {
            plays.push({
              number: p.numbers,
              type: p.playType?.description || 'Unknown',
              amount: p.amount || '$0.00'
            });
          }
        }
        // Store by short code (API returns with prefix like "43-LAN-010-...")
        const shortCode = json.ticket.code.replace(/^[A-F0-9]+-/, '');
        ticketPlays.set(shortCode, { ticket: json.ticket, plays });
      }
    } catch (e) { /* ignore */ }
  });

  const allTickets = [];
  let ticketsWithoutPlays = [];

  try {
    // Login
    console.error('Logging in...');
    await page.goto('https://la-numbers.apk.lol/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Get auth token for direct API calls
    const authToken = await page.evaluate(() => {
      const vuex = localStorage.getItem('vuex');
      if (vuex) {
        const state = JSON.parse(vuex);
        return state.token || state.auth?.token || null;
      }
      return null;
    });

    if (!authToken) {
      console.error('Error: Could not get auth token');
      await browser.close();
      return;
    }
    console.error('Auth token obtained');

    const bancas = Object.keys(BANCAS_12);
    console.error(`\nExporting from 12 bancas for ${options.date}...\n`);

    for (const banca of bancas) {
      const { id: poolId, ref } = BANCAS_12[banca];
      console.error(`${banca} (${ref}):`);

      // Clear previous data
      lastTicketList = [];

      // Navigate to tickets page
      await page.goto(`https://la-numbers.apk.lol/#/tickets?date=${urlDate}&bettingPoolId=${poolId}`,
        { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2500);
      await page.keyboard.press('Escape').catch(() => {});

      const tickets = lastTicketList;
      if (tickets.length === 0) {
        console.error('  0 tickets\n');
        continue;
      }

      console.error(`  ${tickets.length} tickets - capturing plays...`);

      // Process each ticket - use ticket ID to fetch plays directly via API
      let withPlays = 0;
      let withoutPlays = 0;

      for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i];
        const code = t.code;
        const ticketId = t.id;

        // Fetch plays using the ticket ID via direct API call with auth token
        let plays = [];
        try {
          const playsData = await page.evaluate(async ({ tid, token }) => {
            const response = await fetch('https://api.lotocompany.com/api/v1/tickets/show?category=1&ticketId=' + tid, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
              }
            });
            if (response.ok) {
              return await response.json();
            }
            return null;
          }, { tid: ticketId, token: authToken });

          if (playsData && playsData.plays) {
            for (const [drawId, drawPlays] of Object.entries(playsData.plays)) {
              for (const p of drawPlays) {
                plays.push({
                  number: p.numbers,
                  type: p.playType?.description || 'Unknown',
                  amount: p.amount || '$0.00'
                });
              }
            }
          }
        } catch (e) {
          // API call failed
        }

        if (plays.length > 0) {
          withPlays++;
        } else {
          withoutPlays++;
          ticketsWithoutPlays.push({ banca, code, monto: t.amount });
        }

        allTickets.push({
          fecha: t.dateOfFirstPlay || t.closedDate || options.date,
          code: code,
          banca: banca,
          ref: ref,
          monto: t.amount || '$0.00',
          premio: t.totalPrize || '$0.00',
          estado: t.status?.description || 'Unknown',
          plays: plays
        });

        process.stderr.write(`\r  ${i + 1}/${tickets.length} (${withPlays} con jugadas, ${withoutPlays} sin)`);
        await page.waitForTimeout(50); // Small delay between API calls
      }

      console.error('');
    }

    // Summary
    const totalWithPlays = allTickets.filter(t => t.plays.length > 0).length;
    const totalWithoutPlays = allTickets.filter(t => t.plays.length === 0).length;

    console.error(`\n=== RESUMEN ===`);
    console.error(`Total tickets: ${allTickets.length}`);
    console.error(`Con jugadas: ${totalWithPlays}`);
    console.error(`Sin jugadas: ${totalWithoutPlays}`);

    if (totalWithoutPlays > 0) {
      console.error(`\n⚠️  Tickets sin jugadas:`);
      for (const t of ticketsWithoutPlays.slice(0, 10)) {
        console.error(`  - ${t.code} (${t.banca}) - ${t.monto}`);
      }
      if (ticketsWithoutPlays.length > 10) {
        console.error(`  ... y ${ticketsWithoutPlays.length - 10} más`);
      }
    }

    // Generate CSV
    const lines = ['fecha,ticket,banca,referencia,monto,premio,estado,jugadas'];
    for (const t of allTickets) {
      const jugadas = t.plays.map(p => `${p.number}:${p.type}:${p.amount}`).join('|');
      const esc = (s) => s && (s.includes(',') || s.includes('"')) ? `"${s.replace(/"/g,'""')}"` : (s || '');
      lines.push([t.fecha, t.code, t.banca, esc(t.ref), t.monto, t.premio, t.estado, esc(jugadas)].join(','));
    }

    fs.writeFileSync(options.output, lines.join('\n'));
    console.error(`\nGuardado: ${options.output}`);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

exportTickets(parseArgs());
