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
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('=== VERIFICACIÓN DE COMISIONES EN TICKETS DE HOY ===\n');

  // Get daily sales to see total
  const sales = await apiRequest('/api/sales/daily?date=2026-02-05');
  console.log('Ventas del día por banca:');
  let totalTickets = 0;
  let totalSales = 0;
  let totalCommissions = 0;
  let zeroCommissionBancas = [];

  for (const s of sales) {
    const commPct = s.totalSales > 0 ? ((s.totalCommission / s.totalSales) * 100).toFixed(1) : 0;
    console.log('  ' + s.bettingPoolCode + ': ' + s.totalTickets + ' tickets, $' + s.totalSales.toFixed(2) + ' venta, $' + s.totalCommission.toFixed(2) + ' comisión (' + commPct + '%)');
    totalTickets += s.totalTickets;
    totalSales += s.totalSales;
    totalCommissions += s.totalCommission;
    if (s.totalCommission === 0 && s.totalSales > 0) {
      zeroCommissionBancas.push(s.bettingPoolCode);
    }
  }

  console.log('\n--- TOTALES ---');
  console.log('Total tickets: ' + totalTickets);
  console.log('Total ventas: $' + totalSales.toFixed(2));
  console.log('Total comisiones: $' + totalCommissions.toFixed(2));
  console.log('Porcentaje promedio: ' + ((totalCommissions / totalSales) * 100).toFixed(1) + '%');

  if (zeroCommissionBancas.length > 0) {
    console.log('\n⚠️  BANCAS CON 0% COMISIÓN: ' + zeroCommissionBancas.join(', '));
  } else {
    console.log('\n✅ TODAS LAS BANCAS TIENEN COMISIONES CONFIGURADAS');
  }

  // Get a sample ticket to verify line-level commissions
  console.log('\n--- MUESTRA DE TICKET RECIENTE ---');
  const ticket = await apiRequest('/api/tickets/1109');
  if (ticket && ticket.ticketCode) {
    console.log('Ticket: ' + ticket.ticketCode);
    console.log('Banca: ' + ticket.bettingPoolName + ' (' + ticket.bettingPoolCode + ')');
    console.log('Monto: $' + ticket.totalBetAmount);
    console.log('Comisión total: $' + ticket.totalCommission);
    console.log('Líneas:');
    for (const line of ticket.lines) {
      console.log('  - ' + line.drawName + ': ' + line.betNumber + ' (' + line.betTypeName + ') $' + line.betAmount + ' -> Comisión: ' + line.commissionPercentage + '% ($' + line.commissionAmount + ')');
    }
  }
}

main().catch(console.error);
