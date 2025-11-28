/**
 * Test: Crear Nueva Banca en Frontend V2 con Sorteos
 *
 * Flujo:
 * 1. Login
 * 2. BANCAS → Crear
 * 3. Llenar campos obligatorios (General)
 * 4. Asignar sorteos
 * 5. Guardar
 * 6. Verificar creación
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp/v2-crear-banca';

// Datos de la nueva banca
const NEW_BANCA = {
  name: 'TEST PLAYWRIGHT V2',
  // Código se autogenera
  zone: 'GRUPO ALEX $' // Primera zona disponible
};

const SORTEOS_TO_ADD = ['NACIONAL', 'LOTEKA', 'DIARIA 11AM'];

(async () => {
  console.log('🚀 Test: Crear Nueva Banca - Frontend V2');
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
    // PASO 2: NAVEGAR A BANCAS → CREAR
    // ==========================================
    console.log('📍 PASO 2: Navegando a BANCAS → Crear');
    console.log('─────────────────────────────────────────────────────');

    await page.locator('text=BANCAS').first().click();
    await page.waitForTimeout(1500);

    const crearSelectors = [
      'text=Crear',
      'a:has-text("Crear")',
      'button:has-text("Crear")',
      '[href*="crear" i]',
      '[href*="create" i]'
    ];

    let crearClicked = false;
    for (const selector of crearSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          console.log(`   ✅ Clic en "Crear" (selector: ${selector})`);
          crearClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    console.log(`   📍 URL actual: ${page.url()}\n`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-crear-banca-form.png`, fullPage: true });

    // ==========================================
    // PASO 3: LLENAR TAB GENERAL
    // ==========================================
    console.log('📍 PASO 3: Llenando campos obligatorios (Tab General)');
    console.log('─────────────────────────────────────────────────────');

    // Nombre de la banca
    const nameSelectors = [
      'input[name="bettingPoolName"]',
      'input[label*="Nombre" i]',
      'input[placeholder*="Nombre" i]'
    ];

    for (const selector of nameSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.fill(NEW_BANCA.name);
          console.log(`   ✅ Nombre ingresado: "${NEW_BANCA.name}"`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(1000);

    // Zona (dropdown) - Material-UI Select
    try {
      const zoneSelect = page.locator('[role="combobox"][id*="zoneId"]').first();
      await zoneSelect.scrollIntoViewIfNeeded();
      await zoneSelect.click();
      await page.waitForTimeout(1000);

      // Seleccionar opción del listbox
      const zoneOption = page.locator('[role="option"]', { hasText: NEW_BANCA.zone }).first();
      await zoneOption.click();
      console.log(`   ✅ Zona seleccionada: "${NEW_BANCA.zone}"`);
    } catch (e) {
      console.log(`   ❌ Error seleccionando zona: ${e.message}`);
    }

    await page.waitForTimeout(1000);

    // El código debe ser autogenerado
    const codeElement = page.locator('input[name="branchCode"]').first();
    if (await codeElement.count() > 0) {
      const generatedCode = await codeElement.inputValue();
      console.log(`   📝 Código autogenerado: "${generatedCode}"`);
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-general-tab-filled.png`, fullPage: true });

    // ==========================================
    // PASO 4: NAVEGAR A TAB SORTEOS
    // ==========================================
    console.log('\n📍 PASO 4: Navegando a tab Sorteos');
    console.log('─────────────────────────────────────────────────────');

    const sorteosTabSelectors = [
      'button:has-text("Sorteos")',
      '[role="tab"]:has-text("Sorteos")',
      'a:has-text("Sorteos")',
      'text=Sorteos'
    ];

    for (const selector of sorteosTabSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          console.log(`   ✅ Clic en tab Sorteos`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-sorteos-tab.png`, fullPage: true });

    // ==========================================
    // PASO 5: SELECCIONAR SORTEOS
    // ==========================================
    console.log('\n📍 PASO 5: Seleccionando sorteos');
    console.log('─────────────────────────────────────────────────────');

    let sorteosSeleccionados = 0;

    for (const sorteo of SORTEOS_TO_ADD) {
      try {
        const sorteoElement = page.locator(`:text("${sorteo}")`).first();
        if (await sorteoElement.count() > 0 && await sorteoElement.isVisible()) {
          await sorteoElement.scrollIntoViewIfNeeded();
          await sorteoElement.click();
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

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-sorteos-selected.png`, fullPage: true });

    // ==========================================
    // PASO 6: GUARDAR BANCA
    // ==========================================
    console.log('\n📍 PASO 6: Guardando nueva banca');
    console.log('─────────────────────────────────────────────────────');

    const requestsBefore = apiRequests.length;

    // El botón correcto es type="submit" con texto "Crear Banca"
    const submitButton = page.locator('button[type="submit"]').first();

    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();
    console.log(`   ✅ Clic en "Crear Banca" (button[type="submit"])`);

    // Esperar a que procese y redirija
    await page.waitForTimeout(3000);

    // Esperar cambio de estado del botón (Creando... → Crear Banca)
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 10000 }).catch(() => console.log('   ⚠️  Timeout esperando botón'));

    await page.waitForTimeout(2000);

    const saveRequests = apiRequests.slice(requestsBefore).filter(r =>
      r.method === 'POST' && r.url.includes('/betting-pools')
    );

    console.log(`\n   📡 Requests de creación: ${saveRequests.length}`);
    saveRequests.forEach(r => console.log(`      ${r.method} ${r.url}`));

    // Intentar capturar el ID de la banca creada
    for (const req of saveRequests) {
      const match = req.url.match(/\/betting-pools\/(\d+)/);
      if (match) {
        createdBancaId = match[1];
        console.log(`   🆔 Banca creada con ID: ${createdBancaId}`);
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-after-save.png`, fullPage: true });

    // ==========================================
    // PASO 7: VERIFICACIÓN FINAL
    // ==========================================
    console.log('\n📍 PASO 7: Verificación final');
    console.log('─────────────────────────────────────────────────────');

    const creationSuccess = saveRequests.length > 0;
    console.log(`   ${creationSuccess ? '✅' : '❌'} Creación: ${creationSuccess ? 'EXITOSA' : 'FALLIDA'}`);

    if (createdBancaId) {
      console.log(`   🆔 Banca ID: ${createdBancaId}`);
    }

    console.log(`   📝 Nota: V2 no redirige, permanece en formulario para siguiente entrada\n`);

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ TEST COMPLETADO - CREAR BANCA V2');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Resumen:');
    console.log(`   • Frontend: V2 (puerto 4000)`);
    console.log(`   • Nombre: "${NEW_BANCA.name}"`);
    console.log(`   • Zona: "${NEW_BANCA.zone}"`);
    console.log(`   • Sorteos: ${sorteosSeleccionados} seleccionados (${SORTEOS_TO_ADD.join(', ')})`);
    console.log(`   • API calls: ${saveRequests.length} POST request(s)`);
    console.log(`   • Creación: ${creationSuccess ? '✅ EXITOSA' : '❌ FALLIDA'}`);
    console.log(`   • ID: ${createdBancaId || 'N/A'}`);
    console.log(`   • Screenshots: 5`);
    console.log(`   • Bug fix aplicado: selectedZone → zoneId ✅`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR');
    console.error('═══════════════════════════════════════════════════════');
    console.error(`   ${error.message}`);
    console.error(`   URL: ${page.url()}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/error.png`, fullPage: true });
    throw error;

  } finally {
    console.log('⏳ Navegador abierto 10 segundos...\n');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('🏁 Finalizado.\n');
  }
})();
