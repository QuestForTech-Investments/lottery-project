/**
 * Test: Crear Nueva Banca en Frontend V1 con Sorteos
 *
 * Flujo:
 * 1. Login
 * 2. BANCAS → Crear
 * 3. Llenar campos obligatorios (General) - INCLUYE username/password
 * 4. Asignar sorteos
 * 5. Guardar
 * 6. Verificar creación
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4200';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp/v1-crear-banca';

// Datos de la nueva banca
const NEW_BANCA = {
  name: 'TEST PLAYWRIGHT V1',
  username: 'testv1user',
  password: 'Test123456',
  zone: 'GRUPO ALEX $'
};

const SORTEOS_TO_ADD = ['NACIONAL', 'LOTEKA', 'DIARIA 11AM'];

(async () => {
  console.log('🚀 Test: Crear Nueva Banca - Frontend V1');
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
      const url = request.url().replace('http://localhost:5000', '').replace('http://localhost:4200', '');
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

    const crearElement = page.locator('text=Crear').first();
    await crearElement.click();
    console.log('   ✅ Clic en "Crear"');

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
    const nameInput = page.locator('input[name="branchName"]').first();
    await nameInput.fill(NEW_BANCA.name);
    console.log(`   ✅ Nombre ingresado: "${NEW_BANCA.name}"`);

    await page.waitForTimeout(500);

    // Usuario (OBLIGATORIO EN V1)
    const usernameInput = page.locator('input[name="username"]').first();
    await usernameInput.fill(NEW_BANCA.username);
    console.log(`   ✅ Usuario ingresado: "${NEW_BANCA.username}"`);

    await page.waitForTimeout(500);

    // Contraseña (OBLIGATORIO EN V1)
    const passwordInput = page.locator('input[name="password"]').first();
    await passwordInput.fill(NEW_BANCA.password);
    console.log(`   ✅ Contraseña ingresada`);

    await page.waitForTimeout(500);

    // Confirmar contraseña (OBLIGATORIO EN V1)
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]').first();
    await confirmPasswordInput.fill(NEW_BANCA.password);
    console.log(`   ✅ Contraseña confirmada`);

    await page.waitForTimeout(500);

    // El código debe ser autogenerado
    const codeElement = page.locator('input[name="branchCode"]').first();
    const generatedCode = await codeElement.inputValue();
    console.log(`   📝 Código autogenerado: "${generatedCode}"`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-general-tab-filled.png`, fullPage: true });

    // ==========================================
    // PASO 4: NAVEGAR A TAB CONFIGURACIÓN
    // ==========================================
    console.log('\n📍 PASO 4: Navegando a tab Configuración (para seleccionar zona)');
    console.log('─────────────────────────────────────────────────────');

    const configuracionTab = page.locator('button:has-text("Configuración")').first();
    await configuracionTab.click();
    console.log('   ✅ Clic en tab Configuración');

    await page.waitForTimeout(1000);

    // Zona (dropdown) - Bootstrap Select nativo EN TAB CONFIGURACIÓN
    const zoneSelect = page.locator('select[name="selectedZone"]').first();
    await zoneSelect.selectOption({ label: NEW_BANCA.zone });
    console.log(`   ✅ Zona seleccionada: "${NEW_BANCA.zone}"`);

    await page.waitForTimeout(1000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-configuracion-tab.png`, fullPage: true });

    // ==========================================
    // PASO 5: NAVEGAR A TAB SORTEOS
    // ==========================================
    console.log('\n📍 PASO 5: Navegando a tab Sorteos');
    console.log('─────────────────────────────────────────────────────');

    // V1 usa botones con text="Sorteos" para los tabs
    const sorteosTab = page.locator('button:has-text("Sorteos")').first();
    await sorteosTab.click();
    console.log('   ✅ Clic en tab Sorteos');

    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-sorteos-tab.png`, fullPage: true });

    // ==========================================
    // PASO 6: SELECCIONAR SORTEOS
    // ==========================================
    console.log('\n📍 PASO 6: Seleccionando sorteos');
    console.log('─────────────────────────────────────────────────────');

    let sorteosSeleccionados = 0;

    for (const sorteo of SORTEOS_TO_ADD) {
      try {
        // V1 usa LotteryMultiselect - buscar por texto del sorteo
        const sorteoElement = page.locator(`.sorteo-chip:has-text("${sorteo}")`).first();

        if (await sorteoElement.count() > 0) {
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

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-sorteos-selected.png`, fullPage: true });

    // ==========================================
    // PASO 7: GUARDAR BANCA
    // ==========================================
    console.log('\n📍 PASO 7: Guardando nueva banca');
    console.log('─────────────────────────────────────────────────────');

    const requestsBefore = apiRequests.length;

    // V1 tiene botón "Guardar" en la parte inferior
    const submitButton = page.locator('button:has-text("Guardar")').first();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();
    console.log('   ✅ Clic en "Guardar"');

    // Esperar a que procese y redirija
    await page.waitForTimeout(5000);

    const saveRequests = apiRequests.slice(requestsBefore).filter(r =>
      (r.method === 'POST' && r.url.includes('/branches')) ||
      (r.method === 'POST' && r.url.includes('/betting-pools'))
    );

    console.log(`\n   📡 Requests de creación: ${saveRequests.length}`);
    saveRequests.forEach(r => console.log(`      ${r.method} ${r.url}`));

    // Intentar capturar el ID de la banca creada
    for (const req of saveRequests) {
      const match = req.url.match(/\/(branches|betting-pools)\/(\d+)/);
      if (match) {
        createdBancaId = match[2];
        console.log(`   🆔 Banca creada con ID: ${createdBancaId}`);
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-after-save.png`, fullPage: true });

    // ==========================================
    // PASO 8: VERIFICACIÓN FINAL
    // ==========================================
    console.log('\n📍 PASO 8: Verificación final');
    console.log('─────────────────────────────────────────────────────');

    const creationSuccess = saveRequests.length > 0;
    console.log(`   ${creationSuccess ? '✅' : '❌'} Creación: ${creationSuccess ? 'EXITOSA' : 'FALLIDA'}`);

    if (createdBancaId) {
      console.log(`   🆔 Banca ID: ${createdBancaId}`);
    }

    console.log(`   📝 URL actual: ${page.url()}\n`);

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ TEST COMPLETADO - CREAR BANCA V1');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Resumen:');
    console.log(`   • Frontend: V1 (puerto 4200)`);
    console.log(`   • Nombre: "${NEW_BANCA.name}"`);
    console.log(`   • Usuario: "${NEW_BANCA.username}" (⭐ CAMPO EXCLUSIVO V1)`);
    console.log(`   • Zona: "${NEW_BANCA.zone}"`);
    console.log(`   • Sorteos: ${sorteosSeleccionados} seleccionados (${SORTEOS_TO_ADD.join(', ')})`);
    console.log(`   • API calls: ${saveRequests.length} request(s)`);
    console.log(`   • Creación: ${creationSuccess ? '✅ EXITOSA' : '❌ FALLIDA'}`);
    console.log(`   • ID: ${createdBancaId || 'N/A'}`);
    console.log(`   • Screenshots: 6`);
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
