const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsInVuaXF1ZV9uYW1lIjoiYWRtaW4iLCJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoiYWRtaW4iLCJqdGkiOiI2ZGUyZWQ2MS1mN2FlLTQ5YjAtYjU4YS04Y2FjZjVkNzZjMjYiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbmlzdHJhdG9yIiwiYmV0dGluZ1Bvb2xJZCI6IjkiLCJleHAiOjE3NzAzMjk3MDQsImlzcyI6IkxvdHRlcnlBcGkiLCJhdWQiOiJMb3R0ZXJ5QXBpIn0.Wu6mdxy7a6D9uPmjoa2iI4s7HObd3qFW97vUTRrOW_E';

// Source: LB-0001 (bettingPoolId=9)
const SOURCE_POOL_ID = 9;

// Target bancas: LB-0002 to LB-0012
const TARGET_POOL_IDS = [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38];

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
  console.log('=== COPIANDO CONFIGURACIONES DE COMISIÓN ===\n');
  console.log('Fuente: LB-0001 (bettingPoolId=' + SOURCE_POOL_ID + ')');
  console.log('Destinos: LB-0002 a LB-0012\n');

  // Get all configs from source
  console.log('Obteniendo configuraciones de LB-0001...');
  const sourceResp = await apiRequest('GET', '/api/betting-pools/' + SOURCE_POOL_ID + '/prizes-commissions');
  const sourceConfigs = sourceResp.data || [];
  console.log('Total configs en LB-0001: ' + sourceConfigs.length + '\n');

  // Group source configs by lotteryId + gameType
  const sourceMap = {};
  for (const config of sourceConfigs) {
    const key = (config.lotteryId || 'null') + '_' + config.gameType;
    sourceMap[key] = config;
  }

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const targetPoolId of TARGET_POOL_IDS) {
    console.log('--- Procesando bettingPoolId=' + targetPoolId + ' ---');

    // Get existing configs for target
    const targetResp = await apiRequest('GET', '/api/betting-pools/' + targetPoolId + '/prizes-commissions');
    const targetConfigs = targetResp.data || [];

    // Create set of existing configs
    const existingKeys = new Set();
    for (const config of targetConfigs) {
      const key = (config.lotteryId || 'null') + '_' + config.gameType;
      existingKeys.add(key);
    }

    let poolCreated = 0;
    let poolSkipped = 0;

    // Copy missing configs
    for (const [key, config] of Object.entries(sourceMap)) {
      if (existingKeys.has(key)) {
        poolSkipped++;
        continue;
      }

      // Create new config for target pool
      const newConfig = {
        lotteryId: config.lotteryId,
        gameType: config.gameType,
        prizePayment1: config.prizePayment1,
        prizePayment2: config.prizePayment2,
        prizePayment3: config.prizePayment3,
        prizePayment4: config.prizePayment4,
        commissionDiscount1: config.commissionDiscount1,
        commissionDiscount2: config.commissionDiscount2,
        commissionDiscount3: config.commissionDiscount3,
        commissionDiscount4: config.commissionDiscount4,
        commission2Discount1: config.commission2Discount1,
        commission2Discount2: config.commission2Discount2,
        commission2Discount3: config.commission2Discount3,
        commission2Discount4: config.commission2Discount4,
        isActive: true
      };

      const createResp = await apiRequest('POST', '/api/betting-pools/' + targetPoolId + '/prizes-commissions', newConfig);

      if (createResp.status === 201 || createResp.status === 200) {
        poolCreated++;
        process.stdout.write('.');
      } else {
        totalErrors++;
        console.log('\n  Error: ' + JSON.stringify(createResp.data));
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 50));
    }

    console.log('\n  Creadas: ' + poolCreated + ', Ya existían: ' + poolSkipped);
    totalCreated += poolCreated;
    totalSkipped += poolSkipped;
  }

  console.log('\n=== RESUMEN ===');
  console.log('Total configs creadas: ' + totalCreated);
  console.log('Total configs que ya existían: ' + totalSkipped);
  console.log('Total errores: ' + totalErrors);
}

main().catch(console.error);
