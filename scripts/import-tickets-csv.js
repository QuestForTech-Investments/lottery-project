#!/usr/bin/env node
/**
 * Import Tickets from CSV to New System via API
 * Reads CSV exported from original app and creates tickets in new database.
 * Skips tickets that already exist (tracks by original code in notes field).
 */

const http = require('http');
const fs = require('fs');

const API_HOST = '127.0.0.1';
const API_PORT = 5000;
const API_BASE = '/api';

const CREDENTIALS = { username: 'admin', password: 'Admin123456' };

// Bet type name to ID mapping (from new system's /api/bet-types)
const BET_TYPE_MAP = {
  'directo': 1,
  'pale': 2,
  'palé': 2,
  'tripleta': 3,
  'cash3 straight': 4,
  'play4 straight': 18,
  'play4 box': 19,
  'super pale': 14,
  'superpale': 14,
  'super palé': 14
};

// Mapping from old banca code to owner name (extracted from old system)
const OLD_BANCA_TO_OWNER = {
  'LAN-0001': 'ISLA GORDA TL',
  'LAN-0010': 'GILBERTO TL',
  'LAN-0016': 'DOS CHICAS TL',
  'LAN-0021': 'DANIELA SALON TL',
  'LAN-0048': 'PAPU TL',
  'LAN-0052': 'GREEN HOUSE TL',
  'LAN-0063': 'FELO TL',
  'LAN-0119': 'EUDDY (GF)',
  'LAN-0135': 'MORENA D (GF)',
  'LAN-0150': 'DANNY (GF)',
  'LAN-0165': 'MANUELL (GF)',
  'LAN-0182': 'TONA (GF)',
  'LAN-0185': 'JUDELAINE (GF)',
  'LAN-0186': 'BOB BALATA GF)',
  'LAN-0194': 'HAITI (GF)',
  'LAN-0198': 'LISSET (GF)',
  'LAN-0201': 'CLOTILDE (GF)',
  'LAN-0203': 'IVAN (GF)',
  'LAN-0230': 'YAN (GF)',
  'LAN-0254': 'DENIS (GF)',
  'LAN-0264': 'WILBEN(GF)',
  'LAN-0278': 'MARINA(GF)',
  'LAN-0279': 'MIKI(GF)',
  'LAN-0284': 'YEIMY(GF)',
  'LAN-0294': 'VARON(GF)',
  'LAN-0300': 'NATIVIDAD (GF)',
  'LAN-0304': 'WANKEL (GF)',
  'LAN-0305': 'NAOMI (GF)',
  'LAN-0316': 'GALÁN (GF)',
  'LAN-0318': 'ESTEFANY (GF)',
  'LAN-0324': 'CARLOTA (GF)',
  'LAN-0327': 'HÉCTOR (GF)',
  'LAN-0328': 'MARVIN (GF)',
  'LAN-0330': 'LUISA (GF)',
  'LAN-0333': 'ALEJANDRO (GF)',
  'LAN-0336': 'YENNIFER (GF)',
  'LAN-0337': 'JHON (GF)',
  'LAN-0338': 'JORDAN (GF)',
  'LAN-0355': 'OMAR (GF)',
  'LAN-0361': 'FRANCIS GF)',
  'LAN-0364': 'DOMINGO (GF)',
  'LAN-0367': 'YARIZA (GF)',
  'LAN-0369': 'YESSICA (GF)',
  'LAN-0371': 'NAIROBI (GF)',
  'LAN-0373': 'REIMO (GF)',
  'LAN-0374': 'ANGELA ÑAÑA  (GF)',
  'LAN-0379': 'CARMEN (GF)',
  'LAN-0380': 'LIDIA (GF)',
  'LAN-0381': 'TURCA (GF)',
  'LAN-0390': 'MIRELI (GF)',
  'LAN-0396': 'MADELEINY (GF)',
  'LAN-0405': 'CLARI (GF)',
  'LAN-0406': 'SOFI (GF)',
  'LAN-0407': 'PRIMA (GF)',
  'LAN-0409': 'LA NEGRA(GF)',
  'LAN-0410': 'YENY (GF)',
  'LAN-0411': 'YENIFER PATRÓNA (GF)',
  'LAN-0412': 'IVI (GF)',
  'LAN-0413': 'MORENA (GF)',
  'LAN-0414': 'MIGUELINA (GF)',
  'LAN-0415': 'YOSELIN (GF)',
  'LAN-0416': 'PAPOTE(GF)',
  'LAN-0417': 'CARLA(GF)',
  'LAN-0418': 'YASMIL (GF)',
  'LAN-0419': 'CIBAO (GF)',
  'LAN-0420': 'LARIZA  (GF)',
  'LAN-0421': 'JOSEFINA (GF)',
  'LAN-0425': 'SARAH (GF)',
  'LAN-0429': 'ANA (GF)',
  'LAN-0432': 'MARITZA (GF)',
  'LAN-0433': 'TEDY (GF)',
  'LAN-0434': 'STEPHANIA (GF)',
  'LAN-0438': 'ANYI(GF)',
  'LAN-0439': 'KIARA (GF)',
  'LAN-0440': 'ROSITO (GF)',
  'LAN-0441': 'YUMEIRY(GF)',
  'LAN-0442': 'LUZ(GF)442',
  'LAN-0444': 'ALBERTO (GF)',
  'LAN-0445': 'CLODY (GF)',
  'LAN-0447': 'CONI (GF)',
  'LAN-0448': 'TIFRE (GF)',
  'LAN-0451': 'EVELIZE(GF)',
  'LAN-0452': 'BALATA (GF)',
  'LAN-0453': 'MICHEL(GF)',
  'LAN-0454': 'PAPO (GF)',
  'LAN-0455': 'GENESIS (GF)',
  'LAN-0456': 'ISABEL(GF)',
  'LAN-0457': 'JAZZ (GF)',
  'LAN-0458': 'ALEXANDRA (GF)',
  'LAN-0459': 'FERNANDOGF)',
  'LAN-0460': 'ROMI (GF)',
  'LAN-0461': 'ROSSY (GF)',
  'LAN-0462': 'CUBA(GF)',
  'LAN-0463': 'MARCO(GF)',
  'LAN-0464': 'MONTJOLY (GF)',
  'LAN-0468': 'TIPA (GF)',
  'LAN-0469': 'LEN (GF)',
  'LAN-0472': 'ARRY(GF)',
  'LAN-0473': 'FRANCO  (GF)',
  'LAN-0474': 'ERICK (GF)',
  'LAN-0475': 'LEIDY(GF)',
  'LAN-0477': 'CLEISI (GF)',
  'LAN-0480': 'BALBARA  (GF)',
  'LAN-0485': 'KATY (GF)',
  'LAN-0486': 'ISNEL (GF)',
  'LAN-0487': 'RAMONITA (GF)',
  'LAN-0488': 'MORENAY(GF)',
  'LAN-0489': 'JOSEH (GF)',
  'LAN-0490': 'SIROH (GF)',
  'LAN-0491': 'YISEL (GF)',
  'LAN-0492': 'YEFREY (GF)',
  'LAN-0493': 'CARMELIO (GF)',
  'LAN-0494': 'ESPERANZA (GF)',
  'LAN-0495': 'CARLOS (GF)',
  'LAN-0496': 'MUNECA (GF)',
  'LAN-0497': 'GINA (GF)',
  'LAN-0498': 'ESNEL (GF)',
  'LAN-0499': 'NICOL (GF)',
  'LAN-0500': 'MIA (GF)',
  'LAN-0501': 'JADEL (GF)',
  'LAN-0502': 'EDLINE (GF)',
  'LAN-0503': 'CLEISY (GF)',
  'LAN-0504': 'SHELO (GF)',
  'LAN-0505': 'LORENY (GF)',
  'LAN-0506': 'IRIS (GF)',
  'LAN-0507': 'ALEJANDRO R (GF)',
  'LAN-0508': 'LEIDY (GF)',
  'LAN-0509': 'ROSSA (GF)',
  'LAN-0510': 'ALTAGRACIA (GF)',
  'LAN-0511': 'ENANA (GF)',
  'LAN-0512': 'MONICA (GF)',
  'LAN-0513': 'KIRSY (GF)',
  'LAN-0514': 'LORAINI(GF)',
  'LAN-0515': 'MIMIN (GF)'
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { input: null, dryRun: false, limit: null };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input': case '-i': options.input = args[++i]; break;
      case '--dry-run': options.dryRun = true; break;
      case '--limit': case '-l': options.limit = parseInt(args[++i]); break;
      case '--help': case '-h':
        console.log(`Import Tickets from CSV to API

Usage:
  node import-tickets-csv.js -i tickets.csv
  node import-tickets-csv.js -i tickets.csv --dry-run
  node import-tickets-csv.js -i tickets.csv --limit 10

Options:
  -i, --input FILE   CSV file to import (required)
  --dry-run          Parse and validate without creating tickets
  --limit N          Only process first N tickets`);
        process.exit(0);
    }
  }

  if (!options.input) {
    console.error('Error: --input required');
    process.exit(1);
  }

  return options;
}

// HTTP request helper
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: API_BASE + path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Convert bet number format: "03-30" → "0330", "03-30-27" → "033027"
function convertBetNumber(number) {
  return number.replace(/-/g, '');
}

// Parse amount: "$1.00" → 1.00
function parseAmount(amount) {
  return parseFloat(amount.replace('$', '').replace(',', ''));
}

// Parse jugadas string into lines array
// Format: "03:Directo:$1.00|30:Directo:$1.00|03-30:Pale:$2.00"
function parseJugadas(jugadasStr, drawId) {
  if (!jugadasStr || jugadasStr.trim() === '') return [];

  const lines = [];
  const plays = jugadasStr.split('|');

  for (const play of plays) {
    const parts = play.split(':');
    if (parts.length < 3) continue;

    const number = parts[0];
    const type = parts[1].toLowerCase();
    const amount = parts[2];

    const betTypeId = BET_TYPE_MAP[type];
    if (!betTypeId) {
      console.error(`  Warning: Unknown bet type "${type}"`);
      continue;
    }

    lines.push({
      drawId: drawId,
      betNumber: convertBetNumber(number),
      betTypeId: betTypeId,
      betAmount: parseAmount(amount),
      multiplier: 1.0
    });
  }

  return lines;
}

// Load imported tickets tracking file
function loadImportedCodes(trackingFile) {
  try {
    if (fs.existsSync(trackingFile)) {
      const content = fs.readFileSync(trackingFile, 'utf-8');
      return new Set(content.split('\n').filter(c => c.trim()));
    }
  } catch (e) {}
  return new Set();
}

// Save imported ticket code to tracking file
function saveImportedCode(trackingFile, code) {
  fs.appendFileSync(trackingFile, code + '\n');
}

async function importTickets(options) {
  const trackingFile = options.input.replace('.csv', '.imported.txt');

  // Read CSV
  console.log(`Reading ${options.input}...`);
  const content = fs.readFileSync(options.input, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length < 2) {
    console.error('CSV file is empty or has no data rows');
    return;
  }

  // Parse header
  const header = parseCSVLine(lines[0]);
  console.log(`Headers: ${header.join(', ')}`);

  // Parse data rows - detect format based on header
  const hasReferencia = header.includes('referencia');
  const jugadasIndex = hasReferencia ? 7 : 6;

  const tickets = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < jugadasIndex + 1) continue;

    tickets.push({
      fecha: fields[0],
      ticketCode: fields[1],
      banca: fields[2],
      monto: hasReferencia ? fields[4] : fields[3],
      premio: hasReferencia ? fields[5] : fields[4],
      estado: hasReferencia ? fields[6] : fields[5],
      jugadas: fields[jugadasIndex]
    });
  }

  console.log(`Found ${tickets.length} tickets in CSV\n`);

  if (options.limit) {
    tickets.splice(options.limit);
    console.log(`Limited to ${tickets.length} tickets\n`);
  }

  // Load already imported codes
  const importedCodes = loadImportedCodes(trackingFile);
  console.log(`Already imported: ${importedCodes.size} tickets\n`);

  if (options.dryRun) {
    console.log('=== DRY RUN MODE ===\n');

    // Show sample parsing
    for (let i = 0; i < Math.min(3, tickets.length); i++) {
      const t = tickets[i];
      console.log(`Ticket ${i + 1}: ${t.ticketCode}`);
      console.log(`  Banca: ${t.banca}`);
      console.log(`  Fecha: ${t.fecha}`);
      console.log(`  Monto: ${t.monto}`);
      console.log(`  Jugadas: ${t.jugadas.substring(0, 80)}...`);

      const lines = parseJugadas(t.jugadas, 1);
      console.log(`  Parsed ${lines.length} lines:`);
      for (const line of lines.slice(0, 3)) {
        console.log(`    - ${line.betNumber} (type ${line.betTypeId}): $${line.betAmount}`);
      }
      if (lines.length > 3) console.log(`    ... and ${lines.length - 3} more`);
      console.log('');
    }

    console.log('Dry run complete. No tickets created.');
    return;
  }

  // Login
  console.log('Logging in...');
  const loginRes = await request('POST', '/auth/login', CREDENTIALS);
  if (loginRes.status !== 200) {
    console.error('Login failed:', loginRes.data);
    return;
  }
  const token = loginRes.data.token;
  const userId = loginRes.data.user?.userId || 11;
  console.log(`Logged in as user ${userId}\n`);

  // Get betting pools and create reference->id map
  console.log('Loading betting pools...');
  const poolsRes = await request('GET', '/betting-pools?pageSize=100', null, token);
  const pools = poolsRes.data.items || poolsRes.data;

  // Create map from reference (normalized) -> bettingPoolId
  const refToPoolId = new Map();
  for (const p of pools) {
    if (p.reference) {
      // Normalize: uppercase, trim, remove extra spaces
      const normalizedRef = p.reference.toUpperCase().trim().replace(/\s+/g, ' ');
      refToPoolId.set(normalizedRef, p.bettingPoolId);
    }
  }
  console.log(`Loaded ${refToPoolId.size} betting pools with references\n`);

  // Function to find new pool ID from old banca code
  function findNewPoolId(oldBancaCode) {
    const owner = OLD_BANCA_TO_OWNER[oldBancaCode];
    if (!owner) return null;

    // Normalize owner name and look up
    const normalizedOwner = owner.toUpperCase().trim().replace(/\s+/g, ' ').replace(/\s*\?\s*$/, '');

    // Try exact match first
    if (refToPoolId.has(normalizedOwner)) {
      return refToPoolId.get(normalizedOwner);
    }

    // Try fuzzy match (without parentheses content, etc.)
    for (const [ref, id] of refToPoolId.entries()) {
      // Compare base names (before parentheses or special chars)
      const ownerBase = normalizedOwner.split('(')[0].trim();
      const refBase = ref.split('(')[0].trim();
      if (ownerBase === refBase) {
        return id;
      }
    }

    return null;
  }

  // Get draws (we'll use a default active draw)
  console.log('Loading draws...');
  const drawsRes = await request('GET', '/draws?pageSize=100', null, token);
  const draws = drawsRes.data.items || drawsRes.data;
  const activeDraws = draws.filter(d => d.isActive);
  if (activeDraws.length === 0) {
    console.error('No active draws found!');
    return;
  }
  // Use first active draw as default
  const defaultDrawId = activeDraws[0].drawId;
  console.log(`Using draw ${defaultDrawId} (${activeDraws[0].drawName}) as default\n`);

  // Import tickets
  console.log('Importing tickets...\n');
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];

    // Skip if already imported
    if (importedCodes.has(t.ticketCode)) {
      skipped++;
      continue;
    }

    // Get betting pool ID by matching owner/reference
    const bettingPoolId = findNewPoolId(t.banca);
    if (!bettingPoolId) {
      const owner = OLD_BANCA_TO_OWNER[t.banca] || 'unknown';
      console.log(`\n  ⚠️  ${t.ticketCode}: No match for "${t.banca}" (owner: ${owner})`);
      errors++;
      continue;
    }

    // Parse jugadas
    const lines = parseJugadas(t.jugadas, defaultDrawId);
    if (lines.length === 0) {
      console.log(`  ❌ ${t.ticketCode}: No valid lines`);
      errors++;
      continue;
    }

    // Create ticket
    const ticketData = {
      bettingPoolId: bettingPoolId,
      userId: userId,
      lines: lines,
      globalMultiplier: 1.0,
      globalDiscount: 0.0,
      notes: `Imported from ${t.ticketCode} (${t.fecha})`
    };

    try {
      const res = await request('POST', '/tickets', ticketData, token);

      if (res.status === 200 || res.status === 201) {
        created++;
        saveImportedCode(trackingFile, t.ticketCode);
        importedCodes.add(t.ticketCode);

        const newCode = res.data.ticketCode || 'OK';
        process.stderr.write(`\r  ${created} created, ${skipped} skipped, ${errors} errors (${i + 1}/${tickets.length})`);
      } else {
        errors++;
        const errMsg = res.data.message || res.data.title || JSON.stringify(res.data).substring(0, 100);
        console.log(`\n  ❌ ${t.ticketCode}: ${errMsg}`);
      }
    } catch (err) {
      errors++;
      console.log(`\n  ❌ ${t.ticketCode}: ${err.message}`);
    }

    // Small delay
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n\n=== Import Complete ===`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already imported): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Tracking file: ${trackingFile}`);
}

importTickets(parseArgs()).catch(console.error);
