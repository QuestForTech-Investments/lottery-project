const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsInVuaXF1ZV9uYW1lIjoiYWRtaW4iLCJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoiYWRtaW4iLCJqdGkiOiI2ZGUyZWQ2MS1mN2FlLTQ5YjAtYjU4YS04Y2FjZjVkNzZjMjYiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbmlzdHJhdG9yIiwiYmV0dGluZ1Bvb2xJZCI6IjkiLCJleHAiOjE3NzAzMjk3MDQsImlzcyI6IkxvdHRlcnlBcGkiLCJhdWQiOiJMb3R0ZXJ5QXBpIn0.Wu6mdxy7a6D9uPmjoa2iI4s7HObd3qFW97vUTRrOW_E';

function apiRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json'
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // Get lotteries first
  const lotteriesResp = await apiRequest('/api/lotteries');
  const lotteries = lotteriesResp.items || lotteriesResp || [];
  const lotteryMap = {};
  if (Array.isArray(lotteries)) {
    for (const l of lotteries) {
      lotteryMap[l.lotteryId] = l.name;
    }
  }

  console.log('=== COMPARACIÓN DE CONFIGURACIÓN DE COMISIONES ===\n');

  // Check LB-0001 (ID 9)
  console.log('--- LB-0001 (ID 9) ---');
  const comm1Resp = await apiRequest('/api/betting-pools/9/prizes-commissions');
  const comm1 = comm1Resp.items || comm1Resp || [];
  console.log('Total configs:', Array.isArray(comm1) ? comm1.length : 'ERROR');

  const byLottery1 = {};
  if (Array.isArray(comm1)) {
    for (const c of comm1) {
      const key = c.lotteryId || 'general';
      if (!byLottery1[key]) byLottery1[key] = [];
      byLottery1[key].push(c);
    }
  }

  for (const [lottery, configs] of Object.entries(byLottery1)) {
    const name = lottery === 'general' ? 'GENERAL (fallback)' : lotteryMap[lottery] || lottery;
    console.log('  ' + name + ': ' + configs.length + ' bet types');
  }

  // Check LB-0002 (ID 28)
  console.log('\n--- LB-0002 (ID 28) ---');
  const comm2Resp = await apiRequest('/api/betting-pools/28/prizes-commissions');
  const comm2 = comm2Resp.items || comm2Resp || [];
  console.log('Total configs:', Array.isArray(comm2) ? comm2.length : 'ERROR');

  const byLottery2 = {};
  if (Array.isArray(comm2)) {
    for (const c of comm2) {
      const key = c.lotteryId || 'general';
      if (!byLottery2[key]) byLottery2[key] = [];
      byLottery2[key].push(c);
    }
  }

  for (const [lottery, configs] of Object.entries(byLottery2)) {
    const name = lottery === 'general' ? 'GENERAL (fallback)' : lotteryMap[lottery] || lottery;
    console.log('  ' + name + ': ' + configs.length + ' bet types');
  }

  // Identify missing lotteries in LB-0002
  console.log('\n=== LOTERÍAS FALTANTES EN LB-0002 ===');
  const lotteries1 = new Set(Object.keys(byLottery1));
  const lotteries2 = new Set(Object.keys(byLottery2));

  for (const lot of lotteries1) {
    if (!lotteries2.has(lot)) {
      const name = lot === 'general' ? 'GENERAL (fallback)' : lotteryMap[lot] || lot;
      console.log('  FALTA: ' + name);
    }
  }

  // Check if there's a general config
  console.log('\n=== VERIFICACIÓN CONFIG GENERAL ===');
  console.log('LB-0001 tiene config general:', byLottery1['general'] ? 'SÍ (' + byLottery1['general'].length + ' tipos)' : 'NO');
  console.log('LB-0002 tiene config general:', byLottery2['general'] ? 'SÍ (' + byLottery2['general'].length + ' tipos)' : 'NO');
}

main().catch(console.error);
