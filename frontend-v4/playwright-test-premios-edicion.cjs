/**
 * Test de Diagnóstico: Premios & Comisiones en EDICIÓN de Banca
 *
 * Objetivo: Investigar por qué no se ven los inputs de configuración de premios
 *
 * Flujo:
 * 1. Login
 * 2. Crear nueva banca (para tener una banca con ID)
 * 3. Ir a editar esa banca
 * 4. Navegar a tab Premios & Comisiones
 * 5. Capturar estado, consola, y screenshots
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp/premios-edicion';

const NEW_BANCA = {
  name: 'TEST PREMIOS EDICION',
  zone: 'GRUPO ALEX $'
};

const SORTEOS_TO_ADD = ['NACIONAL', 'LOTEKA'];

(async () => {
  console.log('🔍 Test: Premios & Comisiones en EDICIÓN de Banca');
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
    if (text.includes('premio') || text.includes('bet') || text.includes('draw') || text.includes('ERROR') || text.includes('error')) {
      console.log(`   🖥️  CONSOLE [${msg.type()}]: ${text}`);
    }
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

  let createdBancaId = null;

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
    // PASO 2: CREAR NUEVA BANCA
    // ==========================================
    console.log('📍 PASO 2: Creando nueva banca');
    console.log('─────────────────────────────────────────────────────');

    await page.locator('text=BANCAS').first().click();
    await page.waitForTimeout(1500);

    await page.locator('text=/Crear.*Banca/i').first().click();
    console.log('   ✅ Navegando a crear banca');

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    // Llenar formulario
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill(NEW_BANCA.name);
    console.log(`   ✅ Nombre: "${NEW_BANCA.name}"`);

    await page.waitForTimeout(500);

    // Zona
    const zoneSelect = page.locator('[role="combobox"][id*="zoneId"]').first();
    await zoneSelect.click();
    await page.waitForTimeout(1000);

    const zoneOption = page.locator('[role="option"]', { hasText: NEW_BANCA.zone }).first();
    await zoneOption.click();
    console.log(`   ✅ Zona: "${NEW_BANCA.zone}"`);

    await page.waitForTimeout(1000);

    // Seleccionar sorteos
    const sorteosTab = page.locator('[role="tab"]:has-text("Sorteos")').first();
    await sorteosTab.click();
    await page.waitForTimeout(2000);

    for (const sorteo of SORTEOS_TO_ADD) {
      try {
        const chip = page.locator('.MuiChip-root', { hasText: sorteo }).first();
        if (await chip.count() > 0) {
          await chip.click();
          console.log(`   ✅ Sorteo "${sorteo}" seleccionado`);
          await page.waitForTimeout(500);
        }
      } catch (e) {
        console.log(`   ⚠️  Error con "${sorteo}"`);
      }
    }

    // Guardar
    const requestsBefore = apiRequests.length;

    const submitButton = page.locator('button:has-text("Guardar")').first();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();
    console.log('   ✅ Guardando banca...');

    await page.waitForTimeout(5000);

    // Capturar ID de la banca creada
    const saveRequests = apiRequests.slice(requestsBefore).filter(r =>
      r.method === 'POST' && r.url.includes('/betting-pools')
    );

    for (const req of saveRequests) {
      const match = req.url.match(/\/betting-pools\/(\d+)/);
      if (match) {
        createdBancaId = match[1];
      }
    }

    // Buscar en responses
    if (!createdBancaId) {
      const createResponses = apiResponses.filter(r =>
        r.url.includes('/betting-pools') && r.status === 201
      );
      if (createResponses.length > 0 && createResponses[0].body) {
        createdBancaId = createResponses[0].body.id || createResponses[0].body.bettingPoolId;
      }
    }

    console.log(`   🆔 Banca creada con ID: ${createdBancaId || 'PENDIENTE'}\n`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-banca-created.png`, fullPage: true });

    // ==========================================
    // PASO 3: NAVEGAR A EDITAR BANCA
    // ==========================================
    console.log('📍 PASO 3: Navegando a editar banca');
    console.log('─────────────────────────────────────────────────────');

    // Volver a lista de bancas
    await page.locator('text=BANCAS').first().click();
    await page.waitForTimeout(2000);

    // Buscar la banca recién creada
    const bancaRow = page.locator(`text="${NEW_BANCA.name}"`).first();
    const bancaExists = await bancaRow.count() > 0;
    console.log(`   ${bancaExists ? '✅' : '❌'} Banca encontrada en lista: ${bancaExists}`);

    if (bancaExists) {
      // Clic en la fila para editar
      await bancaRow.click();
      await page.waitForTimeout(2000);
      console.log(`   ✅ Editando banca "${NEW_BANCA.name}"`);
    } else if (createdBancaId) {
      // Navegar directamente por URL
      await page.goto(`${FRONTEND_URL}/betting-pools/${createdBancaId}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      console.log(`   ✅ Navegando a /betting-pools/${createdBancaId}`);
    } else {
      throw new Error('No se pudo encontrar la banca creada');
    }

    console.log(`   📍 URL actual: ${page.url()}\n`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-editing-banca.png`, fullPage: true });

    // ==========================================
    // PASO 4: NAVEGAR A PREMIOS & COMISIONES
    // ==========================================
    console.log('📍 PASO 4: Navegando a Premios & Comisiones');
    console.log('─────────────────────────────────────────────────────');

    const requestsBefore2 = apiRequests.length;
    const responsesBefore = apiResponses.length;

    const premiosTab = page.locator('[role="tab"]').filter({ hasText: /Premios.*Comisiones/i }).first();
    const premiosTabExists = await premiosTab.count() > 0;
    console.log(`   ${premiosTabExists ? '✅' : '❌'} Tab "Premios & Comisiones" encontrado: ${premiosTabExists}`);

    if (premiosTabExists) {
      await premiosTab.click();
      console.log('   ✅ Clic en tab Premios & Comisiones');
    } else {
      // Intentar con texto exacto
      const altTab = page.locator('[role="tab"]:has-text("Premios")').first();
      if (await altTab.count() > 0) {
        await altTab.click();
        console.log('   ✅ Clic en tab "Premios"');
      }
    }

    await page.waitForTimeout(4000);

    const requestsAfter = apiRequests.slice(requestsBefore2);
    const responsesAfter = apiResponses.slice(responsesBefore);

    console.log(`\n   📡 API Requests al abrir Premios tab: ${requestsAfter.length}`);
    requestsAfter.forEach(r => console.log(`      ${r.method} ${r.url}`));

    // Buscar responses de bet-types
    const betTypesResponses = responsesAfter.filter(r => r.url.includes('bet-types'));
    console.log(`\n   📦 Responses de bet-types: ${betTypesResponses.length}`);
    betTypesResponses.forEach(r => {
      console.log(`      ${r.url} - Status: ${r.status}`);
      if (r.body && Array.isArray(r.body)) {
        console.log(`      📊 Tipos de premios: ${r.body.length}`);
        r.body.slice(0, 3).forEach(bt => {
          console.log(`         - ${bt.betTypeCode || bt.code}: ${bt.betTypeName || bt.name}`);
        });
      }
    });

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-premios-tab.png`, fullPage: true });

    // ==========================================
    // PASO 5: DIAGNÓSTICO DEL CONTENIDO
    // ==========================================
    console.log('\n📍 PASO 5: Diagnóstico del contenido del tab');
    console.log('─────────────────────────────────────────────────────');

    // Verificar alerts
    const noDataAlert = page.locator('text=/No hay tipos de premios/i').first();
    const hasNoDataAlert = await noDataAlert.count() > 0;
    console.log(`   ${hasNoDataAlert ? '⚠️' : '✅'} Alert "No hay tipos de premios": ${hasNoDataAlert ? 'VISIBLE' : 'No visible'}`);

    // Loading spinner
    const loadingSpinner = page.locator('[role="progressbar"]').first();
    const hasLoading = await loadingSpinner.count() > 0;
    console.log(`   ${hasLoading ? '⏳' : '✅'} Loading spinner: ${hasLoading ? 'VISIBLE' : 'No visible'}`);

    // Tabs de sorteos
    const allTabs = page.locator('[role="tab"]');
    const tabsCount = await allTabs.count();
    console.log(`\n   📑 Total tabs visibles: ${tabsCount}`);

    for (let i = 0; i < Math.min(tabsCount, 15); i++) {
      const tabText = await allTabs.nth(i).textContent();
      console.log(`      ${i + 1}. "${tabText}"`);
    }

    // Sub-tabs (Premios, Comisiones, Comisiones 2)
    console.log(`\n   📑 Buscando sub-tabs:`);
    const subTabs = ['Premios', 'Comisiones', 'Comisiones 2'];
    for (const subTab of subTabs) {
      const tab = page.locator(`[role="tab"]:has-text("${subTab}")`);
      const count = await tab.count();
      console.log(`      ${count > 0 ? '✅' : '❌'} "${subTab}": ${count} encontrado(s)`);
    }

    // Tabs de sorteos (General, NACIONAL, LOTEKA)
    console.log(`\n   📑 Buscando tabs de sorteos:`);
    const drawTabs = ['General', 'NACIONAL', 'LOTEKA', 'DIARIA 11AM'];
    for (const drawTab of drawTabs) {
      const tab = page.locator(`[role="tab"]:has-text("${drawTab}")`);
      const count = await tab.count();
      console.log(`      ${count > 0 ? '✅' : '❌'} "${drawTab}": ${count} encontrado(s)`);
    }

    // Inputs de premios
    const prizeInputs = page.locator('input[type="text"]');
    const prizeInputsCount = await prizeInputs.count();
    console.log(`\n   📝 Inputs de texto visibles: ${prizeInputsCount}`);

    if (prizeInputsCount > 0) {
      console.log(`      Primeros 5 inputs:`);
      for (let i = 0; i < Math.min(prizeInputsCount, 5); i++) {
        const name = await prizeInputs.nth(i).getAttribute('name');
        const placeholder = await prizeInputs.nth(i).getAttribute('placeholder');
        console.log(`         ${i + 1}. name="${name}" placeholder="${placeholder}"`);
      }
    }

    // TextFields de Material-UI
    const textFields = page.locator('.MuiTextField-root');
    const textFieldsCount = await textFields.count();
    console.log(`   📝 Material-UI TextFields: ${textFieldsCount}`);

    // Grid items
    const gridItems = page.locator('.MuiGrid-item');
    const gridItemsCount = await gridItems.count();
    console.log(`   📦 Grid items: ${gridItemsCount}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-diagnostic-detail.png`, fullPage: true });

    // ==========================================
    // PASO 6: EXPLORAR SUB-TABS Y DRAW TABS
    // ==========================================
    console.log('\n📍 PASO 6: Explorando navegación de tabs');
    console.log('─────────────────────────────────────────────────────');

    // Intentar navegar a sub-tab "Premios"
    const premiosSubTab = page.locator('[role="tab"]:has-text("Premios")').nth(1); // Segundo tab "Premios"
    if (await premiosSubTab.count() > 0) {
      await premiosSubTab.click();
      await page.waitForTimeout(1500);
      console.log('   ✅ Navegado a sub-tab "Premios"');

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-subtab-premios.png`, fullPage: true });

      // Inputs después de navegar
      const inputsAfter = await page.locator('input[type="text"]').count();
      console.log(`      📝 Inputs visibles: ${inputsAfter}`);
    }

    // Intentar navegar a tab "General"
    const generalTab = page.locator('[role="tab"]:has-text("General")').last();
    if (await generalTab.count() > 0) {
      await generalTab.click();
      await page.waitForTimeout(1500);
      console.log('   ✅ Navegado a tab de sorteo "General"');

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-draw-general.png`, fullPage: true });

      const inputsGeneral = await page.locator('input[type="text"]').count();
      console.log(`      📝 Inputs en "General": ${inputsGeneral}`);
    }

    // Intentar navegar a "NACIONAL"
    const nacionalTab = page.locator('[role="tab"]:has-text("NACIONAL")').first();
    if (await nacionalTab.count() > 0) {
      await nacionalTab.click();
      await page.waitForTimeout(1500);
      console.log('   ✅ Navegado a tab "NACIONAL"');

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-draw-nacional.png`, fullPage: true });

      const inputsNacional = await page.locator('input[type="text"]').count();
      console.log(`      📝 Inputs en "NACIONAL": ${inputsNacional}`);
    }

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 RESUMEN DEL DIAGNÓSTICO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n🆔 Banca creada: ${createdBancaId || 'N/A'}`);
    console.log(`📍 URL final: ${page.url()}`);

    console.log(`\n🔍 Estado del Tab Premios & Comisiones:`);
    console.log(`   • Alert "No hay premios": ${hasNoDataAlert ? '⚠️ SÍ (PROBLEMA)' : '✅ NO'}`);
    console.log(`   • Loading spinner: ${hasLoading ? '⏳ SÍ' : '✅ NO'}`);
    console.log(`   • Total tabs: ${tabsCount}`);
    console.log(`   • Inputs visibles: ${prizeInputsCount}`);
    console.log(`   • TextFields (MUI): ${textFieldsCount}`);
    console.log(`   • Grid items: ${gridItemsCount}`);

    console.log(`\n📡 API Calls:`);
    console.log(`   • bet-types responses: ${betTypesResponses.length}`);
    betTypesResponses.forEach(r => {
      console.log(`      - ${r.url}: ${r.status}`);
      if (r.body && Array.isArray(r.body)) {
        console.log(`        Total tipos: ${r.body.length}`);
      }
    });

    console.log(`\n🖥️  Console Logs relevantes: ${consoleLogs.filter(l => l.includes('premio') || l.includes('bet') || l.includes('ERROR')).length}`);
    const relevantLogs = consoleLogs.filter(l =>
      l.toLowerCase().includes('premio') ||
      l.toLowerCase().includes('bet') ||
      l.toLowerCase().includes('error') ||
      l.toLowerCase().includes('draw')
    );
    if (relevantLogs.length > 0) {
      relevantLogs.slice(0, 10).forEach(log => console.log(`   ${log}`));
    }

    console.log(`\n❌ Errores de Página: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.forEach(err => console.log(`   ${err}`));
    }

    console.log(`\n📸 Screenshots: ${SCREENSHOTS_DIR}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR EN TEST');
    console.error('═══════════════════════════════════════════════════════');
    console.error(`   ${error.message}`);
    console.error(`   URL: ${page.url()}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/error.png`, fullPage: true });
    throw error;

  } finally {
    console.log('⏳ Navegador abierto 20 segundos para inspección manual...\n');
    await page.waitForTimeout(20000);
    await browser.close();
    console.log('🏁 Finalizado.\n');
  }
})();
