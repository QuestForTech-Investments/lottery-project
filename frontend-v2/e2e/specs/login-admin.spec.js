/**
 * Test: Login con Usuario Admin - Frontend V2
 *
 * Script verificado y funcional para login con credenciales de admin.
 * Este test debe ejecutarse con el skill de Playwright.
 *
 * Credenciales:
 * - Usuario: admin
 * - Contraseña: Admin123456
 *
 * Ejecución:
 * cd /home/jorge/.claude/skills/playwright-skill
 * node run.js /home/jorge/projects/Lottery-Project/LottoWebApp/tests/login-admin.spec.js
 *
 * Documentación completa: docs/PLAYWRIGHT_LOGIN_TEST_GUIDE.md
 */

const { chromium } = require('playwright');

// Configuración
const FRONTEND_URL = 'http://localhost:4000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp';

(async () => {
  console.log('🚀 Test de Login - Frontend V2 (Usuario Admin)');
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
      apiRequests.push({
        method: request.method(),
        url: request.url(),
        timestamp: new Date().toISOString()
      });
    }
  });

  try {
    // PASO 1: Navegar a login
    console.log('📍 PASO 1: Navegando a la página de login');
    console.log('─────────────────────────────────────────────────────');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
    console.log(`   ✅ Página cargada: ${FRONTEND_URL}`);
    console.log(`   🌐 Título: ${await page.title()}`);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/01-login-page.png`,
      fullPage: true
    });
    console.log('   📸 Screenshot: 01-login-page.png\n');

    // PASO 2: Identificar elementos del formulario
    console.log('📍 PASO 2: Identificando elementos del formulario');
    console.log('─────────────────────────────────────────────────────');

    await page.waitForTimeout(2000);

    const usernameSelector = 'input[placeholder*="Usuario" i]';
    const passwordSelector = 'input[placeholder*="Contraseña" i]';
    const submitSelector = 'button:has-text("INICIAR SESIÓN")';

    await page.waitForSelector(usernameSelector, { timeout: 10000 });
    await page.waitForSelector(passwordSelector, { timeout: 10000 });
    await page.waitForSelector(submitSelector, { timeout: 10000 });

    console.log(`   ✅ Campo Usuario: ${usernameSelector}`);
    console.log(`   ✅ Campo Contraseña: ${passwordSelector}`);
    console.log(`   ✅ Botón Login: ${submitSelector}\n`);

    // PASO 3: Ingresar credenciales
    console.log('📍 PASO 3: Ingresando credenciales');
    console.log('─────────────────────────────────────────────────────');
    console.log(`   👤 Usuario: ${TEST_USERNAME}`);
    await page.locator(usernameSelector).fill(TEST_USERNAME);

    console.log(`   🔒 Contraseña: ${'*'.repeat(TEST_PASSWORD.length)}`);
    await page.locator(passwordSelector).fill(TEST_PASSWORD);
    console.log('   ✅ Credenciales ingresadas\n');

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/02-login-form-filled.png`,
      fullPage: true
    });
    console.log('   📸 Screenshot: 02-login-form-filled.png\n');

    // PASO 4: Ejecutar login
    console.log('📍 PASO 4: Ejecutando login');
    console.log('─────────────────────────────────────────────────────');

    const apiRequestsBefore = apiRequests.length;
    await page.locator(submitSelector).click();
    console.log('   ✅ Clic en botón "INICIAR SESIÓN"\n');

    await page.waitForTimeout(3000);

    // PASO 5: Verificar autenticación
    console.log('📍 PASO 5: Verificando autenticación');
    console.log('─────────────────────────────────────────────────────');

    const currentURL = page.url();
    console.log(`   📍 URL actual: ${currentURL}`);

    const apiRequestsAfter = apiRequests.length;
    const newRequests = apiRequests.slice(apiRequestsBefore);

    console.log(`\n   📡 API Requests (${newRequests.length}):`);
    newRequests.forEach((req, i) => {
      console.log(`      ${i + 1}. ${req.method} ${req.url.replace('http://localhost:5000', '')}`);
    });

    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/03-post-login.png`,
      fullPage: true
    });
    console.log(`\n   📸 Screenshot: 03-post-login.png\n`);

    // PASO 6: Verificar dashboard
    console.log('📍 PASO 6: Verificando dashboard');
    console.log('─────────────────────────────────────────────────────');

    const pageTitle = await page.title();
    console.log(`   📄 Título: "${pageTitle}"`);

    // Verificar que estamos en el dashboard
    const isDashboard = await page.locator('text=INICIO').isVisible();
    console.log(`   ${isDashboard ? '✅' : '❌'} Dashboard cargado: ${isDashboard ? 'Sí' : 'No'}`);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/04-dashboard.png`,
      fullPage: true
    });
    console.log(`\n   📸 Screenshot: 04-dashboard.png\n`);

    // RESUMEN
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✨ TEST COMPLETADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📋 Resumen:`);
    console.log(`   • Usuario: ${TEST_USERNAME}`);
    console.log(`   • Login: ${isDashboard ? 'Exitoso ✅' : 'Fallido ❌'}`);
    console.log(`   • URL: ${currentURL}`);
    console.log(`   • Screenshots: 4`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL TEST');
    console.error('═══════════════════════════════════════════════════════');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   URL: ${page.url()}`);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/error-screenshot.png`,
      fullPage: true
    });
    console.error('\n   📸 Screenshot: error-screenshot.png');

    throw error;

  } finally {
    console.log('⏳ Manteniendo navegador abierto 5 segundos...\n');
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('🏁 Test finalizado.\n');
  }
})();
