const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsInVuaXF1ZV9uYW1lIjoiYWRtaW4iLCJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoiYWRtaW4iLCJqdGkiOiI2ZGUyZWQ2MS1mN2FlLTQ5YjAtYjU4YS04Y2FjZjVkNzZjMjYiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbmlzdHJhdG9yIiwiYmV0dGluZ1Bvb2xJZCI6IjkiLCJleHAiOjE3NzAzMjk3MDQsImlzcyI6IkxvdHRlcnlBcGkiLCJhdWQiOiJMb3R0ZXJ5QXBpIn0.Wu6mdxy7a6D9uPmjoa2iI4s7HObd3qFW97vUTRrOW_E';

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== TEST INTENSIVO DE COMISIONES ===\n');

  // Get available draws
  console.log('Obteniendo sorteos disponibles...');
  const drawsRes = await apiRequest('GET', '/api/draws?pageSize=50&isActive=true');
  if (drawsRes.status !== 200) {
    console.error('Error obteniendo sorteos:', drawsRes);
    return;
  }

  const draws = (drawsRes.data.items || drawsRes.data).filter(d => d.isActive);
  console.log('Sorteos activos: ' + draws.length);

  // Get available betting pools
  console.log('Obteniendo bancas disponibles...');
  const bancasRes = await apiRequest('GET', '/api/betting-pools?pageSize=50');
  if (bancasRes.status !== 200) {
    console.error('Error obteniendo bancas:', bancasRes);
    return;
  }

  const bancas = (bancasRes.data.items || bancasRes.data).filter(b => b.isActive);
  console.log('Bancas activas: ' + bancas.length + '\n');

  // Select bancas and draws for testing
  const testBancas = bancas.slice(0, 12); // All 12 bancas
  const testDraws = draws.slice(0, 10); // First 10 draws

  console.log('Bancas a probar:', testBancas.map(b => b.bettingPoolId + ':' + b.bettingPoolCode).join(', '));
  console.log('Sorteos a probar:', testDraws.map(d => d.drawId + ':' + d.drawName).join(', '));
  console.log('\n');

  const results = {
    total: 0,
    success: 0,
    failed: 0,
    zeroCommission: 0,
    errors: [],
    byBanca: {},
    byLottery: {}
  };

  // Create test tickets
  let ticketCount = 0;
  const maxTickets = 120; // Test all 12 bancas x 10 draws

  for (const banca of testBancas) {
    if (ticketCount >= maxTickets) break;

    results.byBanca[banca.bettingPoolCode] = { success: 0, failed: 0, zeroCommission: 0 };

    for (const draw of testDraws) {
      if (ticketCount >= maxTickets) break;

      const betNumber = String(Math.floor(Math.random() * 100)).padStart(2, '0');

      const ticketData = {
        bettingPoolId: banca.bettingPoolId,
        userId: 11, // Admin user
        lines: [{
          drawId: draw.drawId,
          betNumber: betNumber,
          betTypeId: 1, // DIRECTO
          betAmount: 10
        }]
      };

      try {
        const res = await apiRequest('POST', '/api/tickets', ticketData);
        results.total++;
        ticketCount++;

        if (res.status === 201 || res.status === 200) {
          const ticket = res.data;
          const line = ticket.lines[0];
          const commission = line.commissionPercentage || 0;

          results.success++;
          results.byBanca[banca.bettingPoolCode].success++;

          // Track by lottery
          const lotteryName = line.lotteryName || 'Unknown';
          if (!results.byLottery[lotteryName]) {
            results.byLottery[lotteryName] = { success: 0, zeroCommission: 0, commissions: [] };
          }
          results.byLottery[lotteryName].success++;
          results.byLottery[lotteryName].commissions.push(commission);

          if (commission === 0) {
            results.zeroCommission++;
            results.byBanca[banca.bettingPoolCode].zeroCommission++;
            results.byLottery[lotteryName].zeroCommission++;
            console.log('⚠️  COMISIÓN 0% - Banca: ' + banca.bettingPoolCode + ', Sorteo: ' + draw.drawName + ', Lotería: ' + lotteryName);
          } else {
            process.stdout.write('.');
          }
        } else {
          results.failed++;
          results.byBanca[banca.bettingPoolCode].failed++;
          const errMsg = res.data && res.data.message ? res.data.message : JSON.stringify(res.data || 'Unknown error');
          results.errors.push({
            banca: banca.bettingPoolCode,
            draw: draw.drawName,
            error: errMsg,
            status: res.status
          });
          process.stdout.write('X');
        }
      } catch (err) {
        results.failed++;
        results.byBanca[banca.bettingPoolCode].failed++;
        results.errors.push({
          banca: banca.bettingPoolCode,
          draw: draw.drawName,
          error: err.message
        });
        process.stdout.write('E');
      }

      // Delay to respect API rate limit (100 per minute = 600ms between requests)
      await new Promise(r => setTimeout(r, 700));
    }
  }

  console.log('\n\n=== RESULTADOS ===\n');
  console.log('Total tickets creados: ' + results.total);
  console.log('Exitosos: ' + results.success);
  console.log('Fallidos: ' + results.failed);
  console.log('Con comisión 0%: ' + results.zeroCommission);

  console.log('\n--- Por Banca ---');
  for (const [code, stats] of Object.entries(results.byBanca)) {
    const status = stats.zeroCommission > 0 ? '⚠️' : '✅';
    console.log(status + ' ' + code + ': ' + stats.success + ' OK, ' + stats.failed + ' failed, ' + stats.zeroCommission + ' con 0%');
  }

  console.log('\n--- Por Lotería ---');
  for (const [name, stats] of Object.entries(results.byLottery)) {
    const avgCommission = stats.commissions.length > 0
      ? (stats.commissions.reduce((a, b) => a + b, 0) / stats.commissions.length).toFixed(1)
      : 0;
    const status = stats.zeroCommission > 0 ? '⚠️' : '✅';
    console.log(status + ' ' + name + ': ' + stats.success + ' tickets, promedio comisión: ' + avgCommission + '%, con 0%: ' + stats.zeroCommission);
  }

  if (results.errors.length > 0) {
    console.log('\n--- Errores ---');
    results.errors.slice(0, 10).forEach(e => {
      console.log('  ' + e.banca + '/' + e.draw + ' (HTTP ' + e.status + '): ' + e.error);
    });
    if (results.errors.length > 10) {
      console.log('  ... y ' + (results.errors.length - 10) + ' errores más');
    }
  }

  console.log('\n=== FIN DEL TEST ===');

  // Summary
  if (results.zeroCommission === 0 && results.failed === 0) {
    console.log('\n✅ TODAS LAS COMISIONES FUNCIONAN CORRECTAMENTE');
  } else if (results.zeroCommission > 0) {
    console.log('\n⚠️  HAY ' + results.zeroCommission + ' TICKETS CON COMISIÓN 0% - REVISAR CONFIGURACIÓN');
  }
}

runTests().catch(console.error);
