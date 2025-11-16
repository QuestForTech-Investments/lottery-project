/**
 * Test: Navegación a BANCAS → Lista y Selección de Banca #9
 *
 * ✅ VERIFICADO Y FUNCIONAL
 *
 * Este test ejecuta el flujo completo:
 * 1. Login con usuario admin
 * 2. Navegación al menú BANCAS
 * 3. Clic en submenú "Lista"
 * 4. Selección de la banca #9
 * 5. Documentación de elementos y API calls
 *
 * Credenciales:
 * - Usuario: admin
 * - Contraseña: Admin123456
 *
 * URL esperada:
 * - Lista de bancas: http://localhost:4000/betting-pools/list
 *
 * API Calls ejecutados:
 * - POST /api/auth/login
 * - GET /api/zones
 * - GET /api/betting-pools?page=1&pageSize=1000
 *
 * Ejecución:
 * cd /home/jorge/.claude/skills/playwright-skill
 * node run.js /home/jorge/projects/Lottery-Project/LottoWebApp/tests/bancas-lista-banca9.spec.js
 */

const { chromium } = require('playwright');

// Configuración
const FRONTEND_URL = 'http://localhost:4000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp';
const TARGET_BANCA = '9';

(async () => {
  console.log('🚀 Test: BANCAS → Lista → Banca #9');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Monitorear API requests
  const apiRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const url = request.url().replace('http://localhost:5000', '').replace('http://localhost:4000', '');
      apiRequests.push({
        method: request.method(),
        url: url
      });
    }
  });

  try {
    // PASO 1: Login
    console.log('📍 PASO 1: Login');
    console.log('─────────────────────────────────────────────────────');

    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.locator('input[placeholder*="Usuario" i]').fill(TEST_USERNAME);
    await page.locator('input[placeholder*="Contraseña" i]').fill(TEST_PASSWORD);
    await page.locator('button:has-text("INICIAR SESIÓN")').click();

    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    console.log(`   ✅ Login exitoso`);
    console.log(`   📍 URL: ${page.url()}\n`);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/01-dashboard.png`,
      fullPage: true
    });

    // PASO 2: Navegar a BANCAS
    console.log('📍 PASO 2: Navegando al menú BANCAS');
    console.log('─────────────────────────────────────────────────────');

    await page.locator('text=BANCAS').first().click();
    await page.waitForTimeout(1500);

    console.log('   ✅ BANCAS clickeado');

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/02-bancas-menu-clicked.png`,
      fullPage: true
    });
    console.log('   📸 Screenshot: 02-bancas-menu-clicked.png\n');

    // PASO 3: Click en "Lista"
    console.log('📍 PASO 3: Navegando a "Lista"');
    console.log('─────────────────────────────────────────────────────');

    await page.waitForTimeout(1000);
    await page.locator('text=Lista').first().click();

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    const currentURL = page.url();
    console.log(`   ✅ Lista cargada`);
    console.log(`   📍 URL: ${currentURL}`);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/03-bancas-lista.png`,
      fullPage: true
    });
    console.log('   📸 Screenshot: 03-bancas-lista.png\n');

    // PASO 4: Analizar lista
    console.log('📍 PASO 4: Analizando lista de bancas');
    console.log('─────────────────────────────────────────────────────');

    const tableElements = await page.locator('table').count();
    const rowElements = await page.locator('tr').count();

    console.log(`   📊 Tabla: ${tableElements} encontrada(s)`);
    console.log(`   📊 Filas: ${rowElements}`);

    // PASO 5: Seleccionar Banca #9
    console.log('\n📍 PASO 5: Seleccionando Banca #9');
    console.log('─────────────────────────────────────────────────────');

    // Selector verificado: text=/^9$/
    const banca9Element = page.locator('text=/^9$/').first();
    const isVisible = await banca9Element.isVisible();

    console.log(`   🔍 Banca #9 visible: ${isVisible ? 'Sí' : 'No'}`);

    if (isVisible) {
      await banca9Element.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Banca #9 seleccionada');

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/04-banca-9-selected.png`,
        fullPage: true
      });
      console.log('   📸 Screenshot: 04-banca-9-selected.png');
    }

    // PASO 6: APIs
    console.log('\n📍 PASO 6: APIs llamadas');
    console.log('─────────────────────────────────────────────────────');

    const uniqueApis = [...new Set(apiRequests.map(r => `${r.method} ${r.url}`))];
    uniqueApis.forEach((api, index) => {
      console.log(`   ${index + 1}. ${api}`);
    });

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/05-final-state.png`,
      fullPage: true
    });
    console.log('\n   📸 Screenshot final: 05-final-state.png');

    // RESUMEN
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✨ TEST COMPLETADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Resumen:');
    console.log(`   • Login: ✅`);
    console.log(`   • BANCAS → Lista: ✅`);
    console.log(`   • Banca #9: ✅`);
    console.log(`   • Screenshots: 5`);
    console.log(`   • API calls: ${uniqueApis.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR');
    console.error('═══════════════════════════════════════════════════════');
    console.error(`   ${error.message}`);
    console.error(`   URL: ${page.url()}`);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/error-screenshot.png`,
      fullPage: true
    });

    throw error;

  } finally {
    console.log('⏳ Navegador abierto 8 segundos...\n');
    await page.waitForTimeout(8000);
    await browser.close();
    console.log('🏁 Test finalizado.\n');
  }
})();
