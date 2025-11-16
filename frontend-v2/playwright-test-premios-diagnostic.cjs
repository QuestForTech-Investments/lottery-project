/**
 * Test de Diagnóstico: Premios & Comisiones Tab
 *
 * Objetivo: Investigar por qué no se ven los inputs de configuración de premios
 *
 * Flujo:
 * 1. Login
 * 2. Crear nueva banca
 * 3. Llenar campos obligatorios
 * 4. Seleccionar sorteos
 * 5. Ir a tab Premios & Comisiones
 * 6. Capturar estado, consola, y screenshots
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp/premios-diagnostic';

const NEW_BANCA = {
  name: 'DIAGNOSTIC TEST PREMIOS',
  zone: 'GRUPO ALEX $'
};

const SORTEOS_TO_ADD = ['NACIONAL', 'LOTEKA'];

(async () => {
  console.log('🔍 Test de Diagnóstico: Premios & Comisiones Tab');
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

  // Capturar console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    console.log(`   🖥️  CONSOLE [${msg.type()}]: ${text}`);
  });

  // Capturar errores de página
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`   ❌ PAGE ERROR: ${error.message}`);
  });

  // Capturar network requests
  const apiRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const url = request.url().replace('http://localhost:5000', '');
      apiRequests.push({
        method: request.method(),
        url: url
      });
    }
  });

  // Capturar responses
  const apiResponses = [];
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const url = response.url().replace('http://localhost:5000', '');
      try {
        const contentType = response.headers()['content-type'] || '';
        let body = null;
        if (contentType.includes('application/json')) {
          body = await response.json();
        }
        apiResponses.push({
          url: url,
          status: response.status(),
          body: body
        });
      } catch (e) {
        // Ignore parsing errors
      }
    }
  });

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
    // PASO 2: NAVEGAR A CREAR BANCA
    // ==========================================
    console.log('📍 PASO 2: Navegando a crear banca');
    console.log('─────────────────────────────────────────────────────');

    await page.locator('text=BANCAS').first().click();
    await page.waitForTimeout(1500);

    await page.locator('text=/Crear.*Banca/i').first().click();
    console.log('   ✅ Navegando a crear banca');

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    console.log(`   📍 URL actual: ${page.url()}\n`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-crear-banca-form.png`, fullPage: true });

    // ==========================================
    // PASO 3: LLENAR CAMPOS OBLIGATORIOS
    // ==========================================
    console.log('📍 PASO 3: Llenando campos obligatorios');
    console.log('─────────────────────────────────────────────────────');

    // Nombre
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill(NEW_BANCA.name);
    console.log(`   ✅ Nombre: "${NEW_BANCA.name}"`);

    await page.waitForTimeout(500);

    // Zona (Material-UI Select)
    const zoneSelect = page.locator('[role="combobox"][id*="zoneId"]').first();
    await zoneSelect.click();
    await page.waitForTimeout(1000);

    const zoneOption = page.locator('[role="option"]', { hasText: NEW_BANCA.zone }).first();
    await zoneOption.click();
    console.log(`   ✅ Zona: "${NEW_BANCA.zone}"`);

    await page.waitForTimeout(1000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-general-filled.png`, fullPage: true });

    // ==========================================
    // PASO 4: SELECCIONAR SORTEOS
    // ==========================================
    console.log('\n📍 PASO 4: Seleccionando sorteos');
    console.log('─────────────────────────────────────────────────────');

    const sorteosTab = page.locator('[role="tab"]:has-text("Sorteos")').first();
    await sorteosTab.click();
    console.log('   ✅ Clic en tab Sorteos');

    await page.waitForTimeout(2000);

    let sorteosSeleccionados = 0;

    for (const sorteo of SORTEOS_TO_ADD) {
      try {
        const chip = page.locator('.MuiChip-root', { hasText: sorteo }).first();

        if (await chip.count() > 0) {
          await chip.scrollIntoViewIfNeeded();
          await chip.click();
          console.log(`   ✅ Sorteo "${sorteo}" seleccionado`);
          sorteosSeleccionados++;
          await page.waitForTimeout(500);
        } else {
          console.log(`   ⚠️  Sorteo "${sorteo}" no encontrado`);
        }
      } catch (e) {
        console.log(`   ❌ Error con "${sorteo}": ${e.message}`);
      }
    }

    console.log(`\n   📊 Total sorteos: ${sorteosSeleccionados}/${SORTEOS_TO_ADD.length}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-sorteos-selected.png`, fullPage: true });

    // ==========================================
    // PASO 5: NAVEGAR A PREMIOS & COMISIONES
    // ==========================================
    console.log('\n📍 PASO 5: Navegando a Premios & Comisiones');
    console.log('─────────────────────────────────────────────────────');

    const requestsBefore = apiRequests.length;

    const premiosTab = page.locator('[role="tab"]:has-text("Premios")').first();
    await premiosTab.click();
    console.log('   ✅ Clic en tab Premios & Comisiones');

    await page.waitForTimeout(3000);

    const requestsAfter = apiRequests.slice(requestsBefore);
    console.log(`\n   📡 API Requests al abrir Premios tab: ${requestsAfter.length}`);
    requestsAfter.forEach(r => console.log(`      ${r.method} ${r.url}`));

    // Buscar responses de bet-types
    const betTypesResponses = apiResponses.filter(r => r.url.includes('bet-types'));
    console.log(`\n   📦 Responses de bet-types: ${betTypesResponses.length}`);
    betTypesResponses.forEach(r => {
      console.log(`      ${r.url} - Status: ${r.status}`);
      if (r.body && Array.isArray(r.body)) {
        console.log(`      📊 Tipos de premios recibidos: ${r.body.length}`);
      }
    });

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-premios-tab.png`, fullPage: true });

    // ==========================================
    // PASO 6: DIAGNÓSTICO DEL TAB PREMIOS
    // ==========================================
    console.log('\n📍 PASO 6: Diagnóstico del contenido');
    console.log('─────────────────────────────────────────────────────');

    // Verificar si hay mensaje de "No hay tipos de premios"
    const noDataAlert = page.locator('text=/No hay tipos de premios/i').first();
    const hasNoDataAlert = await noDataAlert.count() > 0;
    console.log(`   ${hasNoDataAlert ? '⚠️' : '✅'} Alert "No hay tipos de premios": ${hasNoDataAlert ? 'VISIBLE' : 'No visible'}`);

    // Verificar si hay loading spinner
    const loadingSpinner = page.locator('[role="progressbar"]').first();
    const hasLoading = await loadingSpinner.count() > 0;
    console.log(`   ${hasLoading ? '⏳' : '✅'} Loading spinner: ${hasLoading ? 'VISIBLE' : 'No visible'}`);

    // Verificar si hay tabs de sorteos (General, NACIONAL, LOTEKA)
    const drawTabs = page.locator('[role="tab"]');
    const drawTabsCount = await drawTabs.count();
    console.log(`   📑 Tabs visibles en Premios: ${drawTabsCount}`);

    for (let i = 0; i < Math.min(drawTabsCount, 10); i++) {
      const tabText = await drawTabs.nth(i).textContent();
      console.log(`      - Tab ${i + 1}: "${tabText}"`);
    }

    // Verificar si hay TextFields de premios
    const prizeInputs = page.locator('input[type="text"][name*="prize"]');
    const prizeInputsCount = await prizeInputs.count();
    console.log(`   📝 Inputs de premios encontrados: ${prizeInputsCount}`);

    // Verificar si hay TextFields en general
    const allTextFields = page.locator('.MuiTextField-root');
    const allTextFieldsCount = await allTextFields.count();
    console.log(`   📝 Total TextFields en tab: ${allTextFieldsCount}`);

    // Verificar si hay Grid items (contenedores de inputs)
    const gridItems = page.locator('.MuiGrid-item');
    const gridItemsCount = await gridItems.count();
    console.log(`   📦 Grid items en tab: ${gridItemsCount}`);

    // Buscar Box con el contenido de premios
    const prizesBox = page.locator('[class*="MuiBox-root"]');
    const prizesBoxCount = await prizesBox.count();
    console.log(`   📦 Box elements: ${prizesBoxCount}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-premios-diagnostic.png`, fullPage: true });

    // ==========================================
    // PASO 7: INTENTAR NAVEGAR A SUB-TABS
    // ==========================================
    console.log('\n📍 PASO 7: Explorando sub-tabs');
    console.log('─────────────────────────────────────────────────────');

    // Buscar tabs "Premios", "Comisiones", "Comisiones 2"
    const subTabs = ['Premios', 'Comisiones', 'Comisiones 2'];

    for (const subTab of subTabs) {
      const tab = page.locator(`[role="tab"]:has-text("${subTab}")`).first();
      const exists = await tab.count() > 0;
      console.log(`   ${exists ? '✅' : '❌'} Sub-tab "${subTab}": ${exists ? 'Encontrado' : 'No encontrado'}`);

      if (exists) {
        await tab.click();
        await page.waitForTimeout(1000);

        const inputs = page.locator('input[type="text"]');
        const inputsCount = await inputs.count();
        console.log(`      📝 Inputs en "${subTab}": ${inputsCount}`);

        await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-subtab-${subTab.toLowerCase().replace(/\s/g, '-')}.png`, fullPage: true });
      }
    }

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 RESUMEN DEL DIAGNÓSTICO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n🔍 Estado del Tab Premios & Comisiones:`);
    console.log(`   • Alert "No hay premios": ${hasNoDataAlert ? '⚠️ SÍ (PROBLEMA)' : '✅ NO'}`);
    console.log(`   • Loading spinner: ${hasLoading ? '⏳ SÍ' : '✅ NO'}`);
    console.log(`   • Tabs visibles: ${drawTabsCount}`);
    console.log(`   • Inputs de premios: ${prizeInputsCount}`);
    console.log(`   • Total TextFields: ${allTextFieldsCount}`);
    console.log(`   • Grid items: ${gridItemsCount}`);

    console.log(`\n📡 API Calls:`);
    console.log(`   • bet-types responses: ${betTypesResponses.length}`);
    betTypesResponses.forEach(r => {
      console.log(`      - ${r.url}: ${r.status}`);
      if (r.body && Array.isArray(r.body)) {
        console.log(`        Cantidad: ${r.body.length} tipos`);
      }
    });

    console.log(`\n🖥️  Console Logs: ${consoleLogs.length}`);
    if (consoleLogs.length > 0) {
      consoleLogs.slice(0, 10).forEach(log => console.log(`   ${log}`));
      if (consoleLogs.length > 10) {
        console.log(`   ... (${consoleLogs.length - 10} más)`);
      }
    }

    console.log(`\n❌ Errores de Página: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.forEach(err => console.log(`   ${err}`));
    }

    console.log(`\n📸 Screenshots guardados en: ${SCREENSHOTS_DIR}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR EN TEST');
    console.error('═══════════════════════════════════════════════════════');
    console.error(`   ${error.message}`);
    console.error(`   URL: ${page.url()}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/error.png`, fullPage: true });
    throw error;

  } finally {
    console.log('⏳ Navegador abierto 15 segundos para inspección manual...\n');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('🏁 Finalizado.\n');
  }
})();
