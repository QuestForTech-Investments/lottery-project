// Script to create 50 random tickets across all betting pools
const http = require('http');

const API_HOST = '127.0.0.1';
const API_PORT = 5000;
const API_BASE = '/api';

// Helper to make HTTP requests
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

// Generate random number based on bet type
function generateBetNumber(betTypeId) {
  switch (betTypeId) {
    case 1: // Directo - 2 digits
      return String(Math.floor(Math.random() * 100)).padStart(2, '0');
    case 2: // Palé - 4 digits
      const n1 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      const n2 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      return n1 + n2;
    case 3: // Tripleta - 6 digits
      const t1 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      const t2 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      const t3 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      return t1 + t2 + t3;
    default:
      return String(Math.floor(Math.random() * 100)).padStart(2, '0');
  }
}

// Random amount between min and max
function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Pick random element from array
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🎰 Creating 50 random tickets...\n');

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
  const userId = loginRes.data.user?.userId || loginRes.data.userId || 11; // Default to admin user ID
  console.log(`   ✅ Logged in as user ${userId}\n`);
  console.log('   Login response:', JSON.stringify(loginRes.data, null, 2).slice(0, 500));

  // 2. Get betting pools
  console.log('2. Getting betting pools...');
  const poolsRes = await request('GET', '/betting-pools?pageSize=100', null, token);
  const pools = poolsRes.data.items.filter(p => p.isActive);
  console.log(`   ✅ Found ${pools.length} active betting pools\n`);

  // 3. Get draws
  console.log('3. Getting draws...');
  const drawsRes = await request('GET', '/draws?pageSize=100', null, token);
  const draws = drawsRes.data.items || drawsRes.data;
  console.log(`   ✅ Found ${draws.length} draws\n`);

  // 4. Get bet types
  console.log('4. Getting bet types...');
  const betTypesRes = await request('GET', '/bet-types', null, token);
  const betTypes = betTypesRes.data;
  console.log(`   ✅ Found ${betTypes.length} bet types\n`);

  // Filter to common bet types (Directo, Palé, Tripleta)
  const commonBetTypes = betTypes.filter(bt => [1, 2, 3].includes(bt.betTypeId));

  // Filter out problematic draws (Super Pale variants)
  const safeDraws = draws.filter(d =>
    !d.lotteryName.toLowerCase().includes('super pale') &&
    !d.lotteryName.toLowerCase().includes('superpale')
  );
  console.log(`   Filtered to ${safeDraws.length} safe draws (excluded Super Pale)\n`);

  // 5. Create tickets
  const TOTAL_TICKETS = 10; // Just 10 more to complete 50 total
  console.log(`5. Creating ${TOTAL_TICKETS} random tickets...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 1; i <= TOTAL_TICKETS; i++) {
    const pool = randomPick(pools);
    const numLines = Math.random() < 0.4 ? 1 : randomAmount(2, 5); // 40% chance of 1 line

    const lines = [];
    for (let j = 0; j < numLines; j++) {
      const draw = randomPick(safeDraws);
      const betType = randomPick(commonBetTypes);

      lines.push({
        drawId: draw.drawId,
        betNumber: generateBetNumber(betType.betTypeId),
        betTypeId: betType.betTypeId,
        betAmount: randomAmount(10, 500),
        multiplier: 1.0
      });
    }

    const ticketData = {
      bettingPoolId: pool.bettingPoolId,
      userId: userId,
      lines: lines,
      globalMultiplier: 1.0,
      globalDiscount: 0.0
    };

    try {
      const res = await request('POST', '/tickets', ticketData, token);

      if (res.status === 200 || res.status === 201) {
        successCount++;
        const totalAmount = lines.reduce((sum, l) => sum + l.betAmount, 0);
        console.log(`   ✅ Ticket ${i}/${TOTAL_TICKETS}: ${res.data.ticketCode || 'created'} - Pool: ${pool.bettingPoolName} - Lines: ${numLines} - Total: $${totalAmount}`);
      } else {
        errorCount++;
        const errDetail = res.data.errors ? JSON.stringify(res.data.errors) : '';
        console.log(`   ❌ Ticket ${i}/${TOTAL_TICKETS} failed: ${res.data.message || res.data.title || ''} ${errDetail.slice(0, 200)}`);
        if (i === 1) {
          console.log('   First ticket payload:', JSON.stringify(ticketData, null, 2));
          console.log('   Full error response:', JSON.stringify(res.data, null, 2).slice(0, 500));
        }
      }
    } catch (err) {
      errorCount++;
      console.log(`   ❌ Ticket ${i}/${TOTAL_TICKETS} error: ${err.message}`);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📈 Total: ${TOTAL_TICKETS}`);
}

main().catch(console.error);
