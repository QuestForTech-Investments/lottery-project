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
  // Loterías con 0% comisión en el test
  const problematicLotteries = [
    { id: 10, name: 'New York Lottery' },
    { id: 15, name: 'California Lottery' },
    { id: 23, name: 'Massachusetts Lottery' }
  ];

  console.log('=== VERIFICACIÓN DE LOTERÍAS CON 0% COMISIÓN ===\n');

  // Check LB-0001 (ID 9) - que supuestamente tiene todo
  console.log('--- LB-0001 (ID 9) ---');
  const comm1Resp = await apiRequest('/api/betting-pools/9/prizes-commissions');
  const comm1 = comm1Resp.items || comm1Resp || [];

  for (const lottery of problematicLotteries) {
    const configs = comm1.filter(c => c.lotteryId === lottery.id);
    const generalConfigs = comm1.filter(c => c.lotteryId === null);

    if (configs.length > 0) {
      // Get sample commission for Quiniela (betType 1)
      const quiniela = configs.find(c => c.gameType === 1);
      console.log('  ' + lottery.name + ' (ID ' + lottery.id + '): ' + configs.length + ' configs');
      if (quiniela) {
        console.log('    Quiniela comisión: ' + quiniela.commissionRate1 + '%');
      }
    } else {
      console.log('  ' + lottery.name + ' (ID ' + lottery.id + '): NO TIENE CONFIG ESPECÍFICA');
      // Check if general fallback would apply
      const quinielaGeneral = generalConfigs.find(c => c.gameType === 1);
      if (quinielaGeneral) {
        console.log('    -> Fallback general Quiniela: ' + quinielaGeneral.commissionRate1 + '%');
      }
    }
  }

  // Check LB-0002 (ID 28)
  console.log('\n--- LB-0002 (ID 28) ---');
  const comm2Resp = await apiRequest('/api/betting-pools/28/prizes-commissions');
  const comm2 = comm2Resp.items || comm2Resp || [];

  for (const lottery of problematicLotteries) {
    const configs = comm2.filter(c => c.lotteryId === lottery.id);
    const generalConfigs = comm2.filter(c => c.lotteryId === null);

    if (configs.length > 0) {
      const quiniela = configs.find(c => c.gameType === 1);
      console.log('  ' + lottery.name + ' (ID ' + lottery.id + '): ' + configs.length + ' configs');
      if (quiniela) {
        console.log('    Quiniela comisión: ' + quiniela.commissionRate1 + '%');
      }
    } else {
      console.log('  ' + lottery.name + ' (ID ' + lottery.id + '): NO TIENE CONFIG ESPECÍFICA');
      const quinielaGeneral = generalConfigs.find(c => c.gameType === 1);
      if (quinielaGeneral) {
        console.log('    -> Fallback general Quiniela: ' + quinielaGeneral.commissionRate1 + '%');
      }
    }
  }

  // Verify general/fallback config
  console.log('\n=== VERIFICACIÓN CONFIG GENERAL (lotteryId=null) ===');
  const generalConfigs1 = comm1.filter(c => c.lotteryId === null);
  console.log('LB-0001: ' + generalConfigs1.length + ' tipos de apuesta generales');
  if (generalConfigs1.length > 0) {
    console.log('  Sample (Quiniela): commissionRate1=' + (generalConfigs1.find(c => c.gameType === 1)?.commissionRate1 || 'N/A'));
  }

  const generalConfigs2 = comm2.filter(c => c.lotteryId === null);
  console.log('LB-0002: ' + generalConfigs2.length + ' tipos de apuesta generales');
  if (generalConfigs2.length > 0) {
    console.log('  Sample (Quiniela): commissionRate1=' + (generalConfigs2.find(c => c.gameType === 1)?.commissionRate1 || 'N/A'));
  }
}

main().catch(console.error);
