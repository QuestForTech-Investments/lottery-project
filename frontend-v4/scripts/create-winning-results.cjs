// Script to create results that match existing ticket numbers
const http = require('http');

const API_HOST = '127.0.0.1';
const API_PORT = 5000;
const API_BASE = '/api';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: API_BASE + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  console.log('🎯 Creating winning results...\n');

  // 1. Login
  console.log('1. Logging in...');
  const loginRes = await request('POST', '/auth/login', {
    username: 'admin',
    password: 'Admin123456'
  });

  if (loginRes.status !== 200) {
    console.error('Login failed:', loginRes.data);
    return;
  }

  const token = loginRes.data.token;
  console.log('   ✅ Logged in\n');

  // 2. Get recent tickets using PATCH filter endpoint
  console.log('2. Getting recent tickets...');

  // Try multiple dates to find tickets
  let ticketDate = null; // Will store the date where we found tickets
  let tickets = [];
  const datesToTry = [];

  // Add last 7 days
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    datesToTry.push(d.toISOString().split('T')[0]);
  }

  for (const date of datesToTry) {
    const ticketsRes = await request('PATCH', '/tickets', {
      date: date,
      pageSize: 100
    }, token);

    if (ticketsRes.status === 200 && ticketsRes.data.tickets && ticketsRes.data.tickets.length > 0) {
      tickets = ticketsRes.data.tickets;
      ticketDate = date; // Store the date where we found tickets
      console.log(`   Found ${tickets.length} tickets for date ${date}`);
      break;
    }
  }

  if (tickets.length === 0) {
    console.log('   No tickets found in the last 7 days');
    return;
  }

  console.log(`   ✅ Found ${tickets.length} tickets\n`);

  // 3. Collect unique draw/number combinations by fetching each ticket's details
  console.log('3. Analyzing ticket lines (fetching details)...');
  const drawNumbers = new Map(); // drawId -> array of bet info
  const betTypesFound = new Set();

  // Only process first 30 tickets to avoid too many requests
  const ticketsToProcess = tickets.slice(0, 30);
  let processed = 0;

  for (const ticket of ticketsToProcess) {
    // Fetch full ticket details with lines
    const detailRes = await request('GET', `/tickets/${ticket.ticketId}`, null, token);

    if (detailRes.status === 200 && detailRes.data.lines) {
      for (const line of detailRes.data.lines) {
        betTypesFound.add(line.betTypeName);

        // Accept 2-digit numbers - these will be winners in 1st place
        if (line.betNumber && line.betNumber.length === 2) {
          if (!drawNumbers.has(line.drawId)) {
            drawNumbers.set(line.drawId, []);
          }
          drawNumbers.get(line.drawId).push({
            number: line.betNumber,
            drawName: line.drawName,
            ticketCode: ticket.ticketCode,
            amount: line.betAmount,
            betType: line.betTypeName
          });
        }
      }
    }

    processed++;
    if (processed % 10 === 0) {
      console.log(`   Processed ${processed}/${ticketsToProcess.length} tickets...`);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`   Bet types found: ${Array.from(betTypesFound).join(', ')}`);
  console.log(`   ✅ Found ${drawNumbers.size} unique draws with 2-digit bets\n`);

  // 4. Pick some numbers to make winners (first 10 draws)
  console.log('4. Creating results for winning numbers...\n');

  let resultsCreated = 0;
  let resultsError = 0;

  for (const [drawId, betsArray] of drawNumbers) {
    if (resultsCreated >= 15) break; // Create max 15 results

    if (betsArray.length === 0) continue;

    // Pick the first number from this draw to be a winner
    const winnerInfo = betsArray[0];

    // Create result with this number in first position
    // WinningNumber format: "NNNNNN" (first+second+third concatenated, no separators)
    const second = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const third = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const resultData = {
      drawId: drawId,
      resultDate: ticketDate, // Use the same date as the tickets
      winningNumber: `${winnerInfo.number}${second}${third}`
    };

    try {
      const res = await request('POST', '/results', resultData, token);

      if (res.status === 200 || res.status === 201) {
        resultsCreated++;
        console.log(`   ✅ Result #${resultsCreated}: ${winnerInfo.drawName}`);
        console.log(`      Resultado: ${resultData.winningNumber} (1ro: ${winnerInfo.number} ← GANADOR)`);
        console.log(`      Ticket ganador: ${winnerInfo.ticketCode}, Monto: $${winnerInfo.amount}\n`);
      } else {
        resultsError++;
        const errMsg = res.data.message || res.data.title || JSON.stringify(res.data).slice(0, 150);
        console.log(`   ⚠️ ${winnerInfo.drawName}: ${errMsg}`);
      }
    } catch (err) {
      resultsError++;
      console.log(`   ❌ Error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Results created: ${resultsCreated}`);
  console.log(`   ❌ Errors: ${resultsError}`);
  console.log(`\n🎉 Now check the Ticket Monitoring to see winning tickets!`);
}

main().catch(console.error);
