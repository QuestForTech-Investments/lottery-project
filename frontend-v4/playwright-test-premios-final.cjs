/**
 * Test FINAL: Premios & Comisiones en EDICIÓN de Banca
 * Navega directo a banca ID 9 para diagnosticar el tab de premios
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp/premios-final';
const BANCA_ID = 9; // admin / LAN-0009

(async () => {
  console.log('🔍 Test FINAL: Premios & Comisiones - Banca ID ' + BANCA_ID);
  console.log('═══════════════════════════════════════════════════════\n');

  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Logs relevantes
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('premio') || text.includes('bet') || text.includes('draw') ||
        text.includes('ERROR') || text.includes('error') || text.includes('PrizesTab')) {
      console.log(`   🖥️  ${msg.type().toUpperCase()}: ${text.substring(0, 150)}`);
    }
  });

  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`   ❌ PAGE ERROR: ${error.message}`);
  });

  // API tracking
  const apiCalls = [];
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const url = response.url().replace('http://localhost:5000', '').replace('http://localhost:4000', '');
      try {
        const contentType = response.headers()['content-type'] || '';
        let body = null;
        if (contentType.includes('application/json')) {
          body = await response.json();
        }
        apiCalls.push({ url, status: response.status(), body });

        // Loggear llamadas importantes
        if (url.includes('bet-types') || url.includes('draws/') || url.includes('betting-pools/' + BANCA_ID)) {
          console.log(`   📡 API: ${response.status()} ${url}`);
          if (url.includes('bet-types') && body && Array.isArray(body)) {
            console.log(`      📊 bet-types recibidos: ${body.length}`);
          }
        }
      } catch (e) {
        // Ignore
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
    // PASO 2: NAVEGAR A EDITAR BANCA
    // ==========================================
    console.log(`📍 PASO 2: Navegar a editar banca ID ${BANCA_ID}`);
    console.log('─────────────────────────────────────────────────────');

    await page.goto(`${FRONTEND_URL}/betting-pools/edit/${BANCA_ID}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log(`   ✅ Navegado a /betting-pools/edit/${BANCA_ID}`);
    console.log(`   📍 URL: ${page.url()}\n`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-editar-banca.png`, fullPage: true });

    // Verificar tabs disponibles
    const tabs = page.locator('[role="tab"]');
    const tabsCount = await tabs.count();
    console.log(`   📑 Tabs disponibles: ${tabsCount}`);
    for (let i = 0; i < Math.min(tabsCount, 10); i++) {
      const text = await tabs.nth(i).textContent();
      console.log(`      ${i + 1}. "${text}"`);
    }

    // ==========================================
    // PASO 3: IR A TAB PREMIOS & COMISIONES
    // ==========================================
    console.log('\n📍 PASO 3: Navegar a Premios & Comisiones');
    console.log('─────────────────────────────────────────────────────');

    // Buscar el tab
    let premiosTab = page.locator('[role="tab"]').filter({ hasText: /Premios.*Comisiones/i }).first();

    if (await premiosTab.count() === 0) {
      premiosTab = page.locator('[role="tab"]').filter({ hasText: 'Premios' }).first();
    }

    if (await premiosTab.count() === 0) {
      premiosTab = page.locator('[role="tab"]').nth(2); // Tercer tab
    }

    const tabExists = await premiosTab.count() > 0;
    console.log(`   ${tabExists ? '✅' : '❌'} Tab encontrado`);

    if (tabExists) {
      const tabText = await premiosTab.textContent();
      console.log(`   📍 Tab a clickear: "${tabText}"`);

      await premiosTab.click();
      console.log('   ✅ Clic en tab');

      await page.waitForTimeout(5000); // Esperar carga
    } else {
      throw new Error('No se encontró el tab de Premios');
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-premios-tab-clicked.png`, fullPage: true });

    // ==========================================
    // PASO 4: DIAGNÓSTICO COMPLETO
    // ==========================================
    console.log('\n📍 PASO 4: Diagnóstico del tab Premios');
    console.log('─────────────────────────────────────────────────────');

    await page.waitForTimeout(2000);

    // 1. Alerts
    const alerts = page.locator('[role="alert"]');
    const alertsCount = await alerts.count();
    console.log(`\n   📢 Alerts: ${alertsCount}`);
    for (let i = 0; i < alertsCount; i++) {
      const text = await alerts.nth(i).textContent();
      console.log(`      "${text}"`);
    }

    // 2. Loading
    const spinner = page.locator('[role="progressbar"]');
    const hasSpinner = await spinner.count() > 0;
    console.log(`   ${hasSpinner ? '⏳ LOADING ACTIVO' : '✅ No loading'}`);

    // 3. Tabs visibles AHORA
    const newTabs = page.locator('[role="tab"]');
    const newTabsCount = await newTabs.count();
    console.log(`\n   📑 Tabs DESPUÉS de abrir Premios: ${newTabsCount}`);
    for (let i = 0; i < Math.min(newTabsCount, 25); i++) {
      const text = await newTabs.nth(i).textContent();
      const isSelected = await newTabs.nth(i).getAttribute('aria-selected');
      console.log(`      ${i + 1}. "${text}" ${isSelected === 'true' ? '✅ ACTIVO' : ''}`);
    }

    // 4. Inputs
    const inputs = page.locator('input[type="text"]');
    const inputsCount = await inputs.count();
    console.log(`\n   📝 Inputs de texto: ${inputsCount}`);

    if (inputsCount > 0) {
      console.log(`      Primeros 15:`);
      for (let i = 0; i < Math.min(inputsCount, 15); i++) {
        const name = await inputs.nth(i).getAttribute('name');
        const placeholder = await inputs.nth(i).getAttribute('placeholder');
        const value = await inputs.nth(i).inputValue();
        const label = await inputs.nth(i).locator('xpath=ancestor::div[contains(@class, "MuiFormControl-root")]//label').textContent().catch(() => '');
        console.log(`         ${i + 1}. name="${name}" placeholder="${placeholder}" value="${value}" label="${label}"`);
      }
    } else {
      console.log(`      ⚠️  NO HAY INPUTS VISIBLES`);
    }

    // 5. TextFields MUI
    const textFields = page.locator('.MuiTextField-root');
    const tfCount = await textFields.count();
    console.log(`   📝 TextFields MUI: ${tfCount}`);

    // 6. API Calls de bet-types
    const betTypesAPICalls = apiCalls.filter(c => c.url.includes('bet-types'));
    console.log(`\n   📡 API Calls de bet-types: ${betTypesAPICalls.length}`);
    betTypesAPICalls.forEach((call, idx) => {
      console.log(`\n      Call ${idx + 1}:`);
      console.log(`      URL: ${call.url}`);
      console.log(`      Status: ${call.status}`);
      if (call.body && Array.isArray(call.body)) {
        console.log(`      Cantidad: ${call.body.length} tipos`);
        call.body.slice(0, 3).forEach(bt => {
          console.log(`         - ${bt.betTypeCode || bt.code}: ${bt.betTypeName || bt.name}`);
        });
      }
    });

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-diagnostic.png`, fullPage: true });

    // ==========================================
    // PASO 5: NAVEGAR POR SUB-TABS
    // ==========================================
    console.log('\n📍 PASO 5: Intentar navegar por sub-tabs');
    console.log('─────────────────────────────────────────────────────');

    const tabsToTry = [
      { name: 'Premios', index: null },
      { name: 'Comisiones', index: null },
      { name: 'General', index: null },
      { name: 'NACIONAL', index: null },
      { name: 'LOTEKA', index: null }
    ];

    for (const tabInfo of tabsToTry) {
      const tab = page.locator(`[role="tab"]:has-text("${tabInfo.name}")`).last();
      if (await tab.count() > 0) {
        console.log(`\n   ✅ Navegando a "${tabInfo.name}"...`);
        await tab.click();
        await page.waitForTimeout(2000);

        const inputsAfter = await page.locator('input[type="text"]').count();
        const alertsAfter = await page.locator('[role="alert"]').count();
        console.log(`      📝 Inputs: ${inputsAfter}`);
        console.log(`      📢 Alerts: ${alertsAfter}`);

        await page.screenshot({ path: `${SCREENSHOTS_DIR}/tab-${tabInfo.name.toLowerCase().replace(/\s/g, '-')}.png`, fullPage: true });
      } else {
        console.log(`   ❌ "${tabInfo.name}" no encontrado`);
      }
    }

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 RESUMEN FINAL');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n🆔 Banca: ${BANCA_ID} (admin / LAN-0009)`);
    console.log(`📍 URL: ${page.url()}`);
    console.log(`\n📊 Estado del Tab Premios:`);
    console.log(`   • Alerts: ${alertsCount} ${alertsCount > 0 ? '⚠️' : '✅'}`);
    console.log(`   • Loading activo: ${hasSpinner ? '⏳ SÍ' : '✅ NO'}`);
    console.log(`   • Tabs disponibles: ${newTabsCount}`);
    console.log(`   • Inputs visibles: ${inputsCount} ${inputsCount === 0 ? '❌ PROBLEMA' : '✅'}`);
    console.log(`   • TextFields MUI: ${tfCount}`);
    console.log(`   • API bet-types: ${betTypesAPICalls.length} ${betTypesAPICalls.length === 0 ? '❌ PROBLEMA' : '✅'}`);
    console.log(`\n❌ Page errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.forEach(e => console.log(`   - ${e}`));
    }
    console.log(`\n📸 Screenshots: ${SCREENSHOTS_DIR}/`);
    console.log('═══════════════════════════════════════════════════════\n');

    // CONCLUSIÓN
    if (inputsCount === 0) {
      console.log('🔴 PROBLEMA IDENTIFICADO: No hay inputs visibles en el tab de Premios');
      console.log('   Posibles causas:');
      console.log('   1. betTypes no se están cargando desde la API');
      console.log('   2. Sorteos no asignados a la banca');
      console.log('   3. Error en el render del componente PrizesTab');
      console.log('   4. Estado de loading/error oculto');
    } else {
      console.log('✅ INPUTS ENCONTRADOS - El tab está funcionando correctamente');
    }

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST');
    console.error('═══════════════════════════════════════════════════════');
    console.error(`   ${error.message}`);
    console.error(`   Stack: ${error.stack.substring(0, 300)}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/error.png`, fullPage: true });

  } finally {
    console.log('\n⏳ Navegador abierto 25 segundos para inspección...\n');
    await page.waitForTimeout(25000);
    await browser.close();
    console.log('🏁 Test finalizado.\n');
  }
})();
