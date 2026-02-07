#!/usr/bin/env node
/**
 * Export Tickets with Sorteo from Original API
 *
 * Usa la API de lotocompany directamente para obtener tickets con sus jugadas
 * incluyendo el SORTEO de cada jugada.
 *
 * Uso:
 *   node export-tickets-with-sorteo.js --yesterday --banca LAN-0010
 *   node export-tickets-with-sorteo.js -d 2026-02-01 -b LAN-0010 -o tickets.csv
 *
 * Formato CSV:
 *   fecha,ticket,banca,monto,premio,estado,jugadas
 *   donde jugadas = numero:tipo:monto:sorteo|numero:tipo:monto:sorteo|...
 *
 * Historial:
 *   2026-02-03: Creado para solucionar problema de sorteo faltante en importacion
 */

const { chromium } = require('playwright');
const fs = require('fs');

// Mapeo de codigo de banca a bettingPoolId en la API original
const BANCA_POOL_IDS = {
  'LAN-0010': 37,   // GILBERTO TL
  'LAN-0016': 43,   // DOS CHICAS TL
  'LAN-0021': 48,   // DANIELA SALON TL
  'LAN-0048': 75,   // PAPU TL
  'LAN-0052': 79,   // GREEN HOUSE TL
  'LAN-0063': 90,   // FELO TL
  'LAN-0001': 28,   // ISLA GORDA TL
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { date: null, yesterday: false, output: null, banca: null };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--date': case '-d': options.date = args[++i]; break;
      case '--yesterday': options.yesterday = true; break;
      case '--output': case '-o': options.output = args[++i]; break;
      case '--banca': case '-b': options.banca = args[++i]; break;
      case '--help': case '-h':
        console.log(`Export Tickets with Sorteo to CSV

Uso:
  node export-tickets-with-sorteo.js --yesterday --banca LAN-0010
  node export-tickets-with-sorteo.js -d 2026-02-01 -b LAN-0010 -o tickets.csv

Opciones:
  -d, --date      Fecha en formato YYYY-MM-DD
  --yesterday     Usar fecha de ayer
  -b, --banca     Codigo de banca (ej: LAN-0010)
  -o, --output    Archivo de salida CSV

Bancas disponibles:
${Object.entries(BANCA_POOL_IDS).map(([k,v]) => `  ${k}: poolId ${v}`).join('\n')}
`);
        process.exit(0);
    }
  }

  if (!options.date && !options.yesterday) {
    console.error('Error: --date o --yesterday requerido');
    process.exit(1);
  }

  if (!options.banca) {
    console.error('Error: --banca requerido');
    process.exit(1);
  }

  if (options.yesterday) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    options.date = y.toISOString().split('T')[0];
  }

  if (!options.output) {
    options.output = `tickets-${options.banca}-${options.date}.csv`;
  }

  return options;
}

async function exportTickets(options) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1920, height: 1080 } }).then(c => c.newPage());

  let token = null;

  // Interceptar respuestas para obtener el token
  page.on('response', async (response) => {
    if (response.url().includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.token) token = json.token;
      } catch (e) {}
    }
  });

  try {
    // Login
    console.error('Logging in...');
    await page.goto('https://la-numbers.apk.lol/');
    await page.waitForTimeout(2000);
    await page.fill('input[type="text"]', 'oliver');
    await page.fill('input[type="password"]', 'oliver0597@');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape').catch(() => {});

    if (!token) {
      console.error('Error: No se pudo obtener token');
      process.exit(1);
    }
    console.error('Token: OK');

    const poolId = BANCA_POOL_IDS[options.banca];
    if (!poolId) {
      console.error(`Error: Banca ${options.banca} no encontrada en mapeo`);
      process.exit(1);
    }

    // Obtener tickets de la API
    console.error(`\nObteniendo tickets para ${options.banca} (poolId: ${poolId}) fecha ${options.date}...`);

    const ticketsData = await page.evaluate(async (params) => {
      const { token, date, poolId } = params;
      try {
        const url = `https://api.lotocompany.com/api/v1/tickets?date=${date}&bettingPoolId=${poolId}&category=2`;
        const r = await fetch(url, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        return r.json();
      } catch (e) {
        return { error: e.message };
      }
    }, { token, date: options.date, poolId });

    if (ticketsData.error) {
      console.error('Error API:', ticketsData.error);
      process.exit(1);
    }

    if (!ticketsData.tickets || ticketsData.tickets.length === 0) {
      console.error('No se encontraron tickets');
      console.error('Response:', JSON.stringify(ticketsData).substring(0, 500));
      process.exit(1);
    }

    const tickets = ticketsData.tickets;
    console.error(`Encontrados ${tickets.length} tickets`);
    console.error(`Total ventas: $${ticketsData.totalAmount || 0}`);
    console.error(`Total premios: $${ticketsData.totalPrizes || 0}`);

    // Generar CSV
    const csvLines = ['fecha,ticket,banca,monto,premio,estado,jugadas'];

    for (const t of tickets) {
      const fecha = t.dateOfFirstPlay || t.closedDate || options.date;
      const code = t.code;
      const monto = t.amount || 0;
      const premio = t.prize || t.totalPrize || 0;
      const estado = t.status?.description || (t.isWinner ? 'Ganador' : 'Perdedor');

      // Formatear jugadas con SORTEO
      let jugadas = '';
      if (t.plays && t.plays.length > 0) {
        jugadas = t.plays.map(p => {
          const num = p.playNumber || p.numbers || '';
          const tipo = p.playTypeName || p.playType?.description || 'Unknown';
          const monto = p.amount || '$0.00';
          const sorteo = p.sortitionName || p.sortition?.description || 'UNKNOWN';
          return `${num}:${tipo}:${monto}:${sorteo}`;
        }).join('|');
      }

      // Escapar campos con comas
      const esc = (s) => {
        if (!s) return '';
        s = String(s);
        return (s.includes(',') || s.includes('"')) ? `"${s.replace(/"/g,'""')}"` : s;
      };

      csvLines.push([fecha, code, options.banca, `$${monto}`, `$${premio}`, estado, esc(jugadas)].join(','));
    }

    // Guardar CSV
    fs.writeFileSync(options.output, csvLines.join('\n'));
    console.error(`\nGuardado: ${options.output} (${csvLines.length - 1} tickets)`);

    // Mostrar muestra
    console.error('\n=== MUESTRA (primeros 3 tickets) ===');
    for (const t of tickets.slice(0, 3)) {
      console.error(`\n${t.code}: $${t.amount} -> $${t.prize || 0} (${t.status?.description || 'N/A'})`);
      if (t.plays) {
        for (const p of t.plays.slice(0, 5)) {
          const winner = p.isWinner ? ' *** GANADOR ***' : '';
          console.error(`  ${p.sortitionName}: ${p.playNumber} (${p.playTypeName}) $${p.amount}${winner}`);
        }
        if (t.plays.length > 5) console.error(`  ... y ${t.plays.length - 5} jugadas mas`);
      }
    }

    // Mostrar ganadores
    const winners = tickets.filter(t => t.prize > 0 || t.isWinner);
    if (winners.length > 0) {
      console.error(`\n=== TICKETS GANADORES (${winners.length}) ===`);
      for (const t of winners) {
        console.error(`\n${t.code}: $${t.amount} -> $${t.prize}`);
        if (t.plays) {
          const winningPlays = t.plays.filter(p => p.isWinner || p.prize > 0);
          for (const p of winningPlays) {
            console.error(`  ${p.sortitionName}: ${p.playNumber} (${p.playTypeName}) $${p.amount} -> $${p.prize} [${p.winningPosition}]`);
          }
        }
      }
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

const options = parseArgs();
exportTickets(options);
