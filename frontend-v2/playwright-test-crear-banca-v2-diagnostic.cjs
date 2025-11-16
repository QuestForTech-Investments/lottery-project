/**
 * Test DIAGNÓSTICO: Crear Nueva Banca en Frontend V2
 *
 * Este test incluye diagnósticos para identificar por qué el formulario no se envía
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp/v2-crear-banca-diagnostic';

// Datos de la nueva banca
const NEW_BANCA = {
  name: 'TEST DIAGNOSTIC V2',
  zone: 'GRUPO ALEX $'
};

const SORTEOS_TO_ADD = ['NACIONAL', 'LOTEKA', 'DIARIA 11AM'];

(async () => {
  console.log('🔍 Test DIAGNÓSTICO: Crear Nueva Banca - Frontend V2');
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

  // Capturar logs de consola
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`   [BROWSER ${msg.type().toUpperCase()}] ${text}`);
    }
  });

  // Capturar errores de página
  page.on('pageerror', error => {
    console.log(`   [PAGE ERROR] ${error.message}`);
    consoleLogs.push({ type: 'pageerror', text: error.message });
  });

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
    // PASO 2: NAVEGAR A BANCAS → CREAR
    // ==========================================
    console.log('📍 PASO 2: Navegando a BANCAS → Crear');
    console.log('─────────────────────────────────────────────────────');

    await page.locator('text=BANCAS').first().click();
    await page.waitForTimeout(1500);

    const crearElement = page.locator('text=Crear').first();
    await crearElement.click();
    console.log('   ✅ Clic en "Crear"');

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    console.log(`   📍 URL actual: ${page.url()}\n`);

    // ==========================================
    // PASO 3: LLENAR TAB GENERAL
    // ==========================================
    console.log('📍 PASO 3: Llenando campos obligatorios (Tab General)');
    console.log('─────────────────────────────────────────────────────');

    // Nombre de la banca
    const nameInput = page.locator('input[name="bettingPoolName"]').first();
    await nameInput.fill(NEW_BANCA.name);
    console.log(`   ✅ Nombre ingresado: "${NEW_BANCA.name}"`);

    await page.waitForTimeout(1000);

    // Zona (dropdown) - Material-UI Select
    console.log('\n   🔍 DIAGNÓSTICO: Verificando campo de zona...');

    // Material-UI Select uses a combobox div, not the hidden input
    const zoneSelect = page.locator('[role="combobox"][id*="selectedZone"]').first();
    await zoneSelect.scrollIntoViewIfNeeded();
    await zoneSelect.click();
    console.log('   ✅ Dropdown de zona abierto');
    await page.waitForTimeout(1000);

    // Select option from listbox
    const zoneOption = page.locator('[role="option"]', { hasText: NEW_BANCA.zone }).first();
    await zoneOption.click();
    console.log(`   ✅ Zona seleccionada: "${NEW_BANCA.zone}"`);

    await page.waitForTimeout(1000);

    // DIAGNÓSTICO: Verificar el estado del formulario
    const formState = await page.evaluate(() => {
      // Intentar acceder al estado de React
      const formElements = document.querySelectorAll('input, select');
      const state = {};

      formElements.forEach(el => {
        if (el.name) {
          state[el.name] = el.value;
        }
      });

      return state;
    });

    console.log('\n   📊 Estado del formulario:');
    console.log('   ', JSON.stringify(formState, null, 2));

    // El código autogenerado
    const codeElement = page.locator('input[name="branchCode"]').first();
    const generatedCode = await codeElement.inputValue();
    console.log(`\n   📝 Código autogenerado: "${generatedCode}"`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-general-tab-filled.png`, fullPage: true });

    // ==========================================
    // PASO 4: NAVEGAR A TAB SORTEOS
    // ==========================================
    console.log('\n📍 PASO 4: Navegando a tab Sorteos');
    console.log('─────────────────────────────────────────────────────');

    const sorteosTab = page.locator('button:has-text("Sorteos")').first();
    await sorteosTab.click();
    console.log('   ✅ Clic en tab Sorteos');

    await page.waitForTimeout(2000);

    // ==========================================
    // PASO 5: SELECCIONAR SORTEOS
    // ==========================================
    console.log('\n📍 PASO 5: Seleccionando sorteos');
    console.log('─────────────────────────────────────────────────────');

    let sorteosSeleccionados = 0;

    for (const sorteo of SORTEOS_TO_ADD) {
      try {
        const sorteoChip = page.locator(`div[role="button"]:has-text("${sorteo}")`).first();
        if (await sorteoChip.count() > 0) {
          await sorteoChip.scrollIntoViewIfNeeded();
          await sorteoChip.click();
          console.log(`   ✅ Sorteo "${sorteo}" seleccionado`);
          sorteosSeleccionados++;
          await page.waitForTimeout(500);
        } else {
          console.log(`   ⚠️  Sorteo "${sorteo}" no encontrado`);
        }
      } catch (e) {
        console.log(`   ❌ Error seleccionando "${sorteo}": ${e.message}`);
      }
    }

    console.log(`\n   📊 Total sorteos seleccionados: ${sorteosSeleccionados}/${SORTEOS_TO_ADD.length}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-sorteos-selected.png`, fullPage: true });

    // ==========================================
    // PASO 6: DIAGNÓSTICO PRE-SUBMIT
    // ==========================================
    console.log('\n📍 PASO 6: DIAGNÓSTICO PRE-SUBMIT');
    console.log('─────────────────────────────────────────────────────');

    // Verificar estado del formulario completo
    const completeFormState = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      const state = {};

      inputs.forEach(el => {
        if (el.name) {
          if (el.type === 'checkbox') {
            state[el.name] = el.checked;
          } else {
            state[el.name] = el.value;
          }
        }
      });

      return state;
    });

    console.log('   📋 Estado completo del formulario:');
    const relevantFields = ['bettingPoolName', 'branchCode', 'selectedZone', 'zoneId', 'selectedDraws'];
    relevantFields.forEach(field => {
      if (completeFormState[field] !== undefined) {
        console.log(`      ${field}: ${JSON.stringify(completeFormState[field])}`);
      }
    });

    // Verificar si el botón está habilitado
    const submitButton = page.locator('button[type="submit"]').first();
    const isButtonDisabled = await submitButton.isDisabled();
    console.log(`\n   🔘 Botón submit ${isButtonDisabled ? 'DESHABILITADO' : 'HABILITADO'}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-pre-submit-state.png`, fullPage: true });

    // ==========================================
    // PASO 7: INTENTO DE SUBMIT
    // ==========================================
    console.log('\n📍 PASO 7: Intentando submit');
    console.log('─────────────────────────────────────────────────────');

    const requestsBefore = apiRequests.length;

    // Limpiar logs de consola previos para capturar solo los del submit
    consoleLogs.length = 0;

    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();
    console.log('   ✅ Clic en botón submit');

    // Esperar a que se procese
    await page.waitForTimeout(3000);

    // Capturar logs generados durante el submit
    console.log('\n   📝 Logs de consola durante submit:');
    const submitLogs = consoleLogs.filter(log =>
      log.text.includes('error') ||
      log.text.includes('validation') ||
      log.text.includes('Betting pool') ||
      log.text.includes('POST') ||
      log.text.includes('API')
    );

    if (submitLogs.length > 0) {
      submitLogs.forEach(log => {
        console.log(`      [${log.type}] ${log.text}`);
      });
    } else {
      console.log('      (Sin logs relevantes)');
    }

    const saveRequests = apiRequests.slice(requestsBefore).filter(r =>
      r.method === 'POST' && r.url.includes('/betting-pools')
    );

    console.log(`\n   📡 Requests de creación: ${saveRequests.length}`);
    saveRequests.forEach(r => console.log(`      ${r.method} ${r.url}`));

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-after-submit.png`, fullPage: true });

    // ==========================================
    // DIAGNÓSTICO FINAL
    // ==========================================
    console.log('\n📍 DIAGNÓSTICO FINAL');
    console.log('═══════════════════════════════════════════════════════');

    console.log(`   URL actual: ${page.url()}`);
    console.log(`   Zona en selectedZone: ${completeFormState.selectedZone || 'NO DEFINIDO'}`);
    console.log(`   Zona en zoneId: ${completeFormState.zoneId || 'NO DEFINIDO'}`);
    console.log(`   Sorteos seleccionados: ${sorteosSeleccionados}`);
    console.log(`   API POST requests: ${saveRequests.length}`);
    console.log(`   Logs de error en consola: ${consoleLogs.filter(l => l.type === 'error').length}`);

    // Guardar todos los logs en archivo
    fs.writeFileSync(
      `${SCREENSHOTS_DIR}/console-logs.json`,
      JSON.stringify(consoleLogs, null, 2)
    );
    console.log(`\n   📄 Logs guardados en: ${SCREENSHOTS_DIR}/console-logs.json`);

    console.log('\n═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR');
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
