/**
 * Test SIMPLIFICADO: Premios & Comisiones en EDICIÓN de Banca
 *
 * Va directo a editar una banca existente
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp/premios-simple';

// Usaremos una banca existente
const BANCA_ID_TO_EDIT = null; // Se detectará automáticamente

(async () => {
  console.log('🔍 Test SIMPLIFICADO: Premios & Comisiones Tab');
  console.log('═══════════════════════════════════════════════════════\n');

  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Capturar console logs relevantes
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('premio') || text.includes('bet') || text.includes('draw') || text.includes('ERROR') || text.includes('error')) {
      consoleLogs.push(`[${msg.type()}] ${text}`);
      console.log(`   🖥️  ${msg.type()}: ${text}`);
    }
  });

  // Capturar errores
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`   ❌ ERROR: ${error.message}`);
  });

  // Capturar API calls
  const apiRequests = [];
  const apiResponses = [];

  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const url = request.url().replace('http://localhost:5000', '').replace('http://localhost:4000', '');
      apiRequests.push({ method: request.method(), url: url });
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const url = response.url().replace('http://localhost:5000', '').replace('http://localhost:4000', '');
      try {
        const contentType = response.headers()['content-type'] || '';
        let body = null;
        if (contentType.includes('application/json')) {
          body = await response.json();
        }
        apiResponses.push({ url, status: response.status(), body });
      } catch (e) {
        // Ignore
      }
    }
  });

  let bancaId = BANCA_ID_TO_EDIT;

  try {
    // ==========================================
    // PASO 1: LOGIN
    // ==========================================
    console.log('📍 PASO 1: Login');
    console.log('─────────────────────────────────────────────────────');

    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.locator('input[placeholder*="Usuario" i]').fill(TEST_USERNAME);
    await page.locator('input[placeholder*="Contraseña" i]').fill(TEST_PASSWORD);
    await page.locator('button:has-text("INICIAR SESIÓN")').click();

    await page.waitForTimeout(3000);
    console.log('   ✅ Login exitoso\n');

    // ==========================================
    // PASO 2: IR A LISTA DE BANCAS
    // ==========================================
    console.log('📍 PASO 2: Ir a lista de bancas');
    console.log('─────────────────────────────────────────────────────');

    await page.locator('text=BANCAS').first().click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-lista-bancas.png`, fullPage: true });

    // Buscar primera banca en la tabla
    const firstRow = page.locator('tbody tr').first();
    const hasRows = await firstRow.count() > 0;

    if (hasRows) {
      // Intentar extraer el ID de la URL o del atributo data
      const firstRowText = await firstRow.textContent();
      console.log(`   ✅ Primera banca encontrada: ${firstRowText.substring(0, 50)}...`);

      // Hacer clic en la primera fila para editar
      await firstRow.click();
      await page.waitForTimeout(3000);

      // Obtener ID de la URL
      const currentUrl = page.url();
      const match = currentUrl.match(/\/betting-pools\/(\d+)/);
      if (match) {
        bancaId = match[1];
        console.log(`   🆔 ID de banca detectado: ${bancaId}`);
      }
    } else {
      throw new Error('No hay bancas disponibles para editar');
    }

    console.log(`   📍 URL actual: ${page.url()}\n`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-editar-banca.png`, fullPage: true });

    // ==========================================
    // PASO 3: NAVEGAR A PREMIOS & COMISIONES
    // ==========================================
    console.log('📍 PASO 3: Navegar a tab Premios & Comisiones');
    console.log('─────────────────────────────────────────────────────');

    const requestsBefore = apiRequests.length;

    // Buscar el tab (puede tener diferentes textos)
    let premiosTab = page.locator('[role="tab"]').filter({ hasText: /Premios.*Comisiones/i }).first();

    if (await premiosTab.count() === 0) {
      premiosTab = page.locator('[role="tab"]').filter({ hasText: 'Premios' }).first();
    }

    const tabExists = await premiosTab.count() > 0;
    console.log(`   ${tabExists ? '✅' : '❌'} Tab encontrado: ${tabExists}`);

    if (tabExists) {
      await premiosTab.click();
      console.log('   ✅ Clic en tab Premios');
      await page.waitForTimeout(4000);
    } else {
      console.log('   ⚠️  Tab no encontrado, listando todos los tabs...');
      const allTabs = page.locator('[role="tab"]');
      const count = await allTabs.count();
      for (let i = 0; i < count; i++) {
        const text = await allTabs.nth(i).textContent();
        console.log(`      ${i + 1}. "${text}"`);
      }
    }

    const requestsAfter = apiRequests.slice(requestsBefore);
    console.log(`\n   📡 API calls: ${requestsAfter.length}`);
    requestsAfter.forEach(r => console.log(`      ${r.method} ${r.url}`));

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-premios-tab.png`, fullPage: true });

    // ==========================================
    // PASO 4: DIAGNÓSTICO DETALLADO
    // ==========================================
    console.log('\n📍 PASO 4: Diagnóstico del contenido');
    console.log('─────────────────────────────────────────────────────');

    // Alerts
    const alerts = page.locator('[role="alert"]');
    const alertsCount = await alerts.count();
    console.log(`   📢 Alerts visibles: ${alertsCount}`);
    for (let i = 0; i < alertsCount; i++) {
      const text = await alerts.nth(i).textContent();
      console.log(`      ${i + 1}. ${text}`);
    }

    // Loading
    const spinner = page.locator('[role="progressbar"]');
    const hasSpinner = await spinner.count() > 0;
    console.log(`   ${hasSpinner ? '⏳' : '✅'} Loading: ${hasSpinner}`);

    // Todos los tabs visibles
    const allTabs = page.locator('[role="tab"]');
    const tabsCount = await allTabs.count();
    console.log(`\n   📑 Tabs totales: ${tabsCount}`);
    for (let i = 0; i < Math.min(tabsCount, 20); i++) {
      const text = await allTabs.nth(i).textContent();
      const isSelected = await allTabs.nth(i).getAttribute('aria-selected');
      console.log(`      ${i + 1}. "${text}" ${isSelected === 'true' ? '✅ ACTIVO' : ''}`);
    }

    // Inputs
    const inputs = page.locator('input[type="text"]');
    const inputsCount = await inputs.count();
    console.log(`\n   📝 Inputs de texto: ${inputsCount}`);

    if (inputsCount > 0) {
      console.log(`      Primeros 10:`);
      for (let i = 0; i < Math.min(inputsCount, 10); i++) {
        const name = await inputs.nth(i).getAttribute('name');
        const value = await inputs.nth(i).inputValue();
        const placeholder = await inputs.nth(i).getAttribute('placeholder');
        console.log(`         ${i + 1}. name="${name}" placeholder="${placeholder}" value="${value}"`);
      }
    }

    // TextFields MUI
    const textFields = page.locator('.MuiTextField-root');
    const tfCount = await textFields.count();
    console.log(`   📝 MUI TextFields: ${tfCount}`);

    // Grid
    const grids = page.locator('.MuiGrid-container');
    const gridCount = await grids.count();
    console.log(`   📦 Grid containers: ${gridCount}`);

    // ==========================================
    // PASO 5: RESPONSES DE BET-TYPES
    // ==========================================
    console.log('\n📍 PASO 5: Análisis de responses bet-types');
    console.log('─────────────────────────────────────────────────────');

    const betTypesResponses = apiResponses.filter(r => r.url.includes('bet-types'));
    console.log(`   📦 Responses: ${betTypesResponses.length}`);

    betTypesResponses.forEach((r, idx) => {
      console.log(`\n      Response ${idx + 1}:`);
      console.log(`      URL: ${r.url}`);
      console.log(`      Status: ${r.status}`);

      if (r.body) {
        if (Array.isArray(r.body)) {
          console.log(`      Array length: ${r.body.length}`);
          r.body.slice(0, 5).forEach((item, i) => {
            console.log(`         ${i + 1}. ${JSON.stringify(item).substring(0, 100)}...`);
          });
        } else {
          console.log(`      Body: ${JSON.stringify(r.body).substring(0, 200)}`);
        }
      }
    });

    // ==========================================
    // PASO 6: NAVEGACIÓN POR SUB-TABS
    // ==========================================
    console.log('\n📍 PASO 6: Intentar navegar por sub-tabs');
    console.log('─────────────────────────────────────────────────────');

    // Lista de tabs a intentar
    const tabsToTry = ['Premios', 'Comisiones', 'Comisiones 2', 'General', 'NACIONAL', 'LOTEKA'];

    for (const tabName of tabsToTry) {
      const tab = page.locator(`[role="tab"]:has-text("${tabName}")`).last();
      if (await tab.count() > 0) {
        console.log(`\n   ✅ Navegando a "${tabName}"...`);
        await tab.click();
        await page.waitForTimeout(2000);

        const inputsAfter = await page.locator('input[type="text"]').count();
        console.log(`      📝 Inputs después: ${inputsAfter}`);

        await page.screenshot({ path: `${SCREENSHOTS_DIR}/tab-${tabName.toLowerCase().replace(/\s/g, '-')}.png`, fullPage: true });
      }
    }

    // ==========================================
    // RESUMEN
    // ==========================================
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 RESUMEN');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n🆔 Banca ID: ${bancaId || 'N/A'}`);
    console.log(`📍 URL: ${page.url()}`);
    console.log(`\n📊 Diagnóstico:`);
    console.log(`   • Alerts: ${alertsCount}`);
    console.log(`   • Loading: ${hasSpinner}`);
    console.log(`   • Tabs: ${tabsCount}`);
    console.log(`   • Inputs: ${inputsCount}`);
    console.log(`   • TextFields: ${tfCount}`);
    console.log(`   • bet-types responses: ${betTypesResponses.length}`);
    console.log(`\n🖥️  Console logs: ${consoleLogs.length}`);
    console.log(`❌ Page errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.forEach(e => console.log(`   - ${e}`));
    }
    console.log(`\n📸 Screenshots: ${SCREENSHOTS_DIR}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR');
    console.error('═══════════════════════════════════════════════════════');
    console.error(`   ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/error.png`, fullPage: true });
    throw error;

  } finally {
    console.log('⏳ Navegador abierto 20 segundos...\n');
    await page.waitForTimeout(20000);
    await browser.close();
    console.log('🏁 Finalizado.\n');
  }
})();
