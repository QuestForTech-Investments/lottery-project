const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsInVuaXF1ZV9uYW1lIjoiYWRtaW4iLCJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoiYWRtaW4iLCJqdGkiOiI2ZGUyZWQ2MS1mN2FlLTQ5YjAtYjU4YS04Y2FjZjVkNzZjMjYiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbmlzdHJhdG9yIiwiYmV0dGluZ1Bvb2xJZCI6IjkiLCJleHAiOjE3NzAzMjk3MDQsImlzcyI6IkxvdHRlcnlBcGkiLCJhdWQiOiJMb3R0ZXJ5QXBpIn0.Wu6mdxy7a6D9uPmjoa2iI4s7HObd3qFW97vUTRrOW_E';

// Template lottery: Florida (lotteryId=11) - has 24% commission
const TEMPLATE_LOTTERY_ID = 11;

// Missing lotteries that need to be configured
const MISSING_LOTTERIES = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

// All bancas
const ALL_POOL_IDS = [9, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38];

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
  console.log('=== AGREGANDO CONFIGURACIONES DE LOTERÍAS FALTANTES ===\n');
  console.log('Plantilla: Florida Lottery (lotteryId=' + TEMPLATE_LOTTERY_ID + ')');
  console.log('Loterías a configurar: ' + MISSING_LOTTERIES.join(', '));
  console.log('Bancas: ' + ALL_POOL_IDS.length + ' bancas\n');

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const poolId of ALL_POOL_IDS) {
    console.log('--- Procesando bettingPoolId=' + poolId + ' ---');

    // Get existing configs for this pool
    const existingResp = await apiRequest('GET', '/api/betting-pools/' + poolId + '/prizes-commissions');
    const existingConfigs = existingResp.data || [];

    // Get Florida template configs for this pool
    const floridaConfigs = existingConfigs.filter(c => c.lotteryId === TEMPLATE_LOTTERY_ID);

    if (floridaConfigs.length === 0) {
      console.log('  ⚠️  No hay config de Florida en esta banca, usando config general');
      // Use general config as template
      const generalConfigs = existingConfigs.filter(c => c.lotteryId === null);
      if (generalConfigs.length === 0) {
        console.log('  ❌ No hay config general tampoco, saltando banca');
        continue;
      }
      floridaConfigs.push(...generalConfigs);
    }

    // Create set of existing lottery+gameType combinations
    const existingKeys = new Set();
    for (const config of existingConfigs) {
      const key = config.lotteryId + '_' + config.gameType;
      existingKeys.add(key);
    }

    let poolCreated = 0;
    let poolSkipped = 0;

    // For each missing lottery, create configs based on Florida template
    for (const lotteryId of MISSING_LOTTERIES) {
      for (const template of floridaConfigs) {
        const key = lotteryId + '_' + template.gameType;

        if (existingKeys.has(key)) {
          poolSkipped++;
          continue;
        }

        // Create new config based on template
        const newConfig = {
          lotteryId: lotteryId,
          gameType: template.gameType,
          prizePayment1: template.prizePayment1,
          prizePayment2: template.prizePayment2,
          prizePayment3: template.prizePayment3,
          prizePayment4: template.prizePayment4,
          commissionDiscount1: template.commissionDiscount1,
          commissionDiscount2: template.commissionDiscount2,
          commissionDiscount3: template.commissionDiscount3,
          commissionDiscount4: template.commissionDiscount4,
          commission2Discount1: template.commission2Discount1,
          commission2Discount2: template.commission2Discount2,
          commission2Discount3: template.commission2Discount3,
          commission2Discount4: template.commission2Discount4,
          isActive: true
        };

        const createResp = await apiRequest('POST', '/api/betting-pools/' + poolId + '/prizes-commissions', newConfig);

        if (createResp.status === 201 || createResp.status === 200) {
          poolCreated++;
          process.stdout.write('.');
        } else {
          totalErrors++;
          if (totalErrors <= 5) {
            console.log('\n  Error: ' + JSON.stringify(createResp.data).substring(0, 100));
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 30));
      }
    }

    if (poolCreated > 0) console.log('');
    console.log('  Creadas: ' + poolCreated + ', Ya existían: ' + poolSkipped);
    totalCreated += poolCreated;
    totalSkipped += poolSkipped;
  }

  console.log('\n=== RESUMEN ===');
  console.log('Total configs creadas: ' + totalCreated);
  console.log('Total configs que ya existían: ' + totalSkipped);
  console.log('Total errores: ' + totalErrors);
}

main().catch(console.error);
