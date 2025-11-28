const { chromium } = require('playwright');

async function analyzeModules() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 ANÁLISIS COMPLETO DE MÓDULOS - V1 Y V2\n');
  console.log('='.repeat(80));

  // Análisis de la aplicación Vue.js original para referencia
  console.log('\n📱 APLICACIÓN VUE.JS ORIGINAL');
  console.log('='.repeat(80));

  await page.goto('https://la-numbers.apk.lol');
  await page.waitForTimeout(2000);

  // Obtener todas las opciones del menú
  const menuItems = await page.evaluate(() => {
    const items = [];
    const links = Array.from(document.querySelectorAll('.sidebar-wrapper a'));

    links.forEach(link => {
      const text = link.textContent.trim();
      const href = link.getAttribute('href');
      if (text && href) {
        items.push({ text, href });
      }
    });

    return items;
  });

  console.log(`\nTotal de opciones en el menú: ${menuItems.length}`);
  menuItems.forEach((item, index) => {
    console.log(`${index + 1}. ${item.text} → ${item.href}`);
  });

  // Análisis V2 (Material-UI)
  console.log('\n\n🎨 FRONTEND V2 (Material-UI) - http://localhost:4001');
  console.log('='.repeat(80));

  await page.goto('http://localhost:4001');
  await page.waitForTimeout(1000);

  // Login V2
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'Admin123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  const v2Routes = [
    // VENTAS
    { name: 'VENTAS > Día', path: '/sales/day' },
    { name: 'VENTAS > Histórico', path: '/sales/history' },
    { name: 'VENTAS > Por fecha', path: '/sales/by-date' },
    { name: 'VENTAS > Premios jugada', path: '/sales/prizes' },
    { name: 'VENTAS > Porcentajes', path: '/sales/percentages' },
    { name: 'VENTAS > Banca', path: '/sales/betting-pools' },
    { name: 'VENTAS > Zona', path: '/sales/zones' },

    // TICKETS
    { name: 'TICKETS > Crear', path: '/tickets/new' },
    { name: 'TICKETS > Monitoreo', path: '/tickets/monitoring' },
    { name: 'TICKETS > Agentes externos', path: '/tickets/external-agents' },
    { name: 'TICKETS > Jugadas', path: '/tickets/plays' },
    { name: 'TICKETS > Ganadoras', path: '/tickets/winners' },
    { name: 'TICKETS > Pizarra', path: '/tickets/board' },
    { name: 'TICKETS > Bote importado', path: '/tickets/imported-pool' },
    { name: 'TICKETS > Bote exportado', path: '/tickets/exported-pool' },
    { name: 'TICKETS > Anomalías', path: '/tickets/anomalies' },

    // RESULTADOS
    { name: 'RESULTADOS', path: '/results' },

    // BANCAS
    { name: 'BANCAS > Lista', path: '/betting-pools/list' },
    { name: 'BANCAS > Crear', path: '/betting-pools/new' },
    { name: 'BANCAS > Edición masiva', path: '/betting-pools/mass-edit' },
    { name: 'BANCAS > Acceso', path: '/betting-pools/access' },
    { name: 'BANCAS > Limpiar pendientes', path: '/betting-pools/clear-pending' },
    { name: 'BANCAS > Sin ventas', path: '/betting-pools/no-sales' },
    { name: 'BANCAS > Reporte días', path: '/betting-pools/days-report' },

    // BALANCES
    { name: 'BALANCES > Bancas', path: '/balances/betting-pools' },
    { name: 'BALANCES > Bancos', path: '/balances/banks' },
    { name: 'BALANCES > Zonas', path: '/balances/zones' },
    { name: 'BALANCES > Grupos', path: '/balances/groups' },

    // USUARIOS
    { name: 'USUARIOS > Lista', path: '/users/list' },
    { name: 'USUARIOS > Crear', path: '/users/new' },
    { name: 'USUARIOS > Bancas', path: '/users/betting-pools' },
    { name: 'USUARIOS > Administradores', path: '/users/administrators' },
    { name: 'USUARIOS > Inicios sesión', path: '/users/login-history' },
    { name: 'USUARIOS > Sesiones bloqueadas', path: '/users/blocked-sessions' },

    // COBROS / PAGOS
    { name: 'COBROS/PAGOS > Lista', path: '/collections-payments/list' },

    // TRANSACCIONES
    { name: 'TRANSACCIONES > Lista', path: '/accountable-transactions' },
    { name: 'TRANSACCIONES > Bancas', path: '/accountable-transactions/betting-pool' },
    { name: 'TRANSACCIONES > Resumen', path: '/accountable-transactions/summary' },
    { name: 'TRANSACCIONES > Grupos', path: '/accountable-transactions-groups' },
    { name: 'TRANSACCIONES > Aprobaciones', path: '/accountable-transaction-approvals' },
    { name: 'TRANSACCIONES > Categorías gastos', path: '/expenses/categories' },

    // PRÉSTAMOS
    { name: 'PRÉSTAMOS > Crear', path: '/loans/new' },
    { name: 'PRÉSTAMOS > Lista', path: '/loans/list' },

    // EXCEDENTES
    { name: 'EXCEDENTES > Manejar', path: '/surpluses/manage' },
    { name: 'EXCEDENTES > Reporte', path: '/surpluses/report' },

    // LÍMITES
    { name: 'LÍMITES > Lista', path: '/limits/list' },
    { name: 'LÍMITES > Crear', path: '/limits/new' },
    { name: 'LÍMITES > Automáticos', path: '/limits/automatic' },
    { name: 'LÍMITES > Eliminar', path: '/limits/delete' },
    { name: 'LÍMITES > Números calientes', path: '/limits/hot-numbers' },

    // COBRADORES
    { name: 'COBRADORES', path: '/collectors' },
    { name: 'MANEJO COBRADORES', path: '/collector-management' },

    // SORTEOS
    { name: 'SORTEOS > Lista', path: '/draws/list' },
    { name: 'SORTEOS > Horarios', path: '/draws/schedules' },

    // ZONAS
    { name: 'ZONAS > Lista', path: '/zones/list' },
    { name: 'ZONAS > Crear', path: '/zones/new' },
    { name: 'ZONAS > Manejar', path: '/zones/manage' },

    // ENTIDADES CONTABLES
    { name: 'ENTIDADES CONTABLES > Lista', path: '/entities/list' },
    { name: 'ENTIDADES CONTABLES > Crear', path: '/entities/new' },

    // MI GRUPO
    { name: 'MI GRUPO > Configuración', path: '/my-group/configuration' },

    // AGENTES EXTERNOS
    { name: 'AGENTES EXTERNOS > Crear', path: '/external-agents/create' },
    { name: 'AGENTES EXTERNOS > Lista', path: '/external-agents/list' },
  ];

  const v2Results = [];

  for (const route of v2Routes) {
    await page.goto(`http://localhost:4001${route.path}`);
    await page.waitForTimeout(1500);

    const status = await page.evaluate(() => {
      const loadingElement = document.querySelector('p:has-text("Cargando...")');
      const errorElement = document.querySelector('[class*="error"]');
      const mainContent = document.querySelector('main');

      if (loadingElement && loadingElement.textContent === 'Cargando...') {
        return 'LOADING';
      }
      if (errorElement) {
        return 'ERROR';
      }
      if (mainContent && mainContent.textContent.length > 100) {
        return 'OK';
      }
      return 'EMPTY';
    });

    v2Results.push({ ...route, status });

    const icon = status === 'OK' ? '✅' : status === 'LOADING' ? '⏳' : status === 'ERROR' ? '❌' : '⚠️';
    console.log(`${icon} ${route.name.padEnd(50)} → ${status}`);
  }

  // Resumen V2
  const v2Ok = v2Results.filter(r => r.status === 'OK').length;
  const v2Loading = v2Results.filter(r => r.status === 'LOADING').length;
  const v2Error = v2Results.filter(r => r.status === 'ERROR').length;
  const v2Empty = v2Results.filter(r => r.status === 'EMPTY').length;

  console.log('\n📊 RESUMEN V2:');
  console.log(`✅ Funcionando: ${v2Ok}/${v2Routes.length}`);
  console.log(`⏳ Cargando: ${v2Loading}/${v2Routes.length}`);
  console.log(`❌ Error: ${v2Error}/${v2Routes.length}`);
  console.log(`⚠️  Vacío: ${v2Empty}/${v2Routes.length}`);

  // Módulos faltantes
  console.log('\n\n🚧 MÓDULOS FALTANTES O CON PROBLEMAS EN V2:');
  console.log('='.repeat(80));

  v2Results.filter(r => r.status !== 'OK').forEach(route => {
    console.log(`- ${route.name} (${route.path}) → ${route.status}`);
  });

  await browser.close();
}

analyzeModules().catch(console.error);
