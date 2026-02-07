const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsInVuaXF1ZV9uYW1lIjoiYWRtaW4iLCJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoiYWRtaW4iLCJqdGkiOiI2ZGUyZWQ2MS1mN2FlLTQ5YjAtYjU4YS04Y2FjZjVkNzZjMjYiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbmlzdHJhdG9yIiwiYmV0dGluZ1Bvb2xJZCI6IjkiLCJleHAiOjE3NzAzMjk3MDQsImlzcyI6IkxvdHRlcnlBcGkiLCJhdWQiOiJMb3R0ZXJ5QXBpIn0.Wu6mdxy7a6D9uPmjoa2iI4s7HObd3qFW97vUTRrOW_E';

// Bancas to test (mix of different ones)
const BANCAS = [
  { id: 9, code: 'LB-0001' },
  { id: 28, code: 'LB-0002' },
  { id: 29, code: 'LB-0003' },
  { id: 31, code: 'LB-0005' },
  { id: 33, code: 'LB-0007' },
  { id: 36, code: 'LB-0010' },
  { id: 38, code: 'LB-0012' },
];

// Draws to test (various lotteries including previously problematic ones)
const DRAWS = [
  { id: 119, name: 'FLORIDA AM', lottery: 'Florida Lottery' },
  { id: 121, name: 'GEORGIA-MID AM', lottery: 'Georgia Lottery' },
  { id: 123, name: 'NEW YORK DAY', lottery: 'New York Lottery' },
  { id: 125, name: 'CALIFORNIA AM', lottery: 'California Lottery' },
  { id: 128, name: 'MASS AM', lottery: 'Massachusetts Lottery' },
  { id: 126, name: 'King Lottery AM', lottery: 'King Lottery' },
  { id: 127, name: 'LOTEKA', lottery: 'Loteka' },
];

function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
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
  console.log('=== TEST DE 20 TICKETS - VERIFICACIÓN DE COMISIONES ===\n');

  const results = [];
  let ticketNum = 0;
  let zeroCommissionCount = 0;

  // Create 20 tickets with different combinations
  for (let i = 0; i < 20; i++) {
    const banca = BANCAS[i % BANCAS.length];
    const draw = DRAWS[i % DRAWS.length];
    const betNumber = String(10 + i).padStart(2, '0');

    const ticketData = {
      bettingPoolId: banca.id,
      userId: 11,
      lines: [{
        drawId: draw.id,
        betNumber: betNumber,
        betTypeId: 1, // DIRECTO
        betAmount: 100
      }]
    };

    try {
      const resp = await apiRequest('POST', '/api/tickets', ticketData);

      if (resp.status === 200 || resp.status === 201) {
        ticketNum++;
        const ticket = resp.data;
        const line = ticket.lines[0];
        const commPct = line.commissionPercentage;

        const status = commPct > 0 ? '✅' : '⚠️';
        if (commPct === 0) zeroCommissionCount++;

        console.log(`${status} #${ticketNum} ${ticket.ticketCode} | ${banca.code} | ${draw.name} | $${ticket.totalBetAmount} | Comisión: ${commPct}% ($${line.commissionAmount})`);

        results.push({
          ticketCode: ticket.ticketCode,
          banca: banca.code,
          draw: draw.name,
          lottery: line.lotteryName,
          amount: ticket.totalBetAmount,
          commissionPct: commPct,
          commissionAmt: line.commissionAmount
        });
      } else {
        console.log(`❌ Error creando ticket: ${JSON.stringify(resp.data).substring(0, 100)}`);
      }

      // Small delay
      await new Promise(r => setTimeout(r, 300));

    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  // Summary
  console.log('\n=== RESUMEN ===');
  console.log(`Total tickets creados: ${results.length}`);
  console.log(`Tickets con comisión: ${results.filter(r => r.commissionPct > 0).length}`);
  console.log(`Tickets con 0% comisión: ${zeroCommissionCount}`);

  // Group by lottery
  console.log('\n--- Por Lotería ---');
  const byLottery = {};
  for (const r of results) {
    if (!byLottery[r.lottery]) {
      byLottery[r.lottery] = { count: 0, totalComm: 0, zeroCount: 0 };
    }
    byLottery[r.lottery].count++;
    byLottery[r.lottery].totalComm += r.commissionPct;
    if (r.commissionPct === 0) byLottery[r.lottery].zeroCount++;
  }

  for (const [lottery, data] of Object.entries(byLottery)) {
    const avgComm = (data.totalComm / data.count).toFixed(1);
    const status = data.zeroCount === 0 ? '✅' : '⚠️';
    console.log(`${status} ${lottery}: ${data.count} tickets, promedio ${avgComm}%, con 0%: ${data.zeroCount}`);
  }

  // Group by banca
  console.log('\n--- Por Banca ---');
  const byBanca = {};
  for (const r of results) {
    if (!byBanca[r.banca]) {
      byBanca[r.banca] = { count: 0, totalComm: 0, zeroCount: 0 };
    }
    byBanca[r.banca].count++;
    byBanca[r.banca].totalComm += r.commissionPct;
    if (r.commissionPct === 0) byBanca[r.banca].zeroCount++;
  }

  for (const [banca, data] of Object.entries(byBanca)) {
    const avgComm = (data.totalComm / data.count).toFixed(1);
    const status = data.zeroCount === 0 ? '✅' : '⚠️';
    console.log(`${status} ${banca}: ${data.count} tickets, promedio ${avgComm}%, con 0%: ${data.zeroCount}`);
  }

  if (zeroCommissionCount === 0) {
    console.log('\n🎉 TODAS LAS COMISIONES FUNCIONAN CORRECTAMENTE');
  } else {
    console.log(`\n⚠️  HAY ${zeroCommissionCount} TICKETS CON 0% COMISIÓN`);
  }
}

main().catch(console.error);
