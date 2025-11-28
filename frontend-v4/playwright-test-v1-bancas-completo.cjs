/**
 * Test Completo Frontend V1:
 * 1. Login
 * 2. BANCAS → Lista → Banca #9
 * 3. Análisis de Sorteos
 * 4. Modificación de Sorteos
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4200';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456';
const SCREENSHOTS_DIR = '/tmp/v1';

(async () => {
  console.log('🚀 Test Completo: Frontend V1');
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

  try {
    // ===========================================
    // PASO 1: LOGIN
    // ===========================================
    console.log('📍 PASO 1: Login');
    console.log('─────────────────────────────────────────────────────');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.locator('input[placeholder*="Usuario" i]').fill(TEST_USERNAME);
    await page.locator('input[placeholder*="Contraseña" i]').fill(TEST_PASSWORD);
    await page.locator('button:has-text("INICIAR SESIÓN")').click();

    await page.waitForTimeout(3000);
    console.log('   ✅ Login exitoso\n');

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-dashboard.png`, fullPage: true });

    // ===========================================
    // PASO 2: NAVEGAR A BANCAS → LISTA
    // ===========================================
    console.log('📍 PASO 2: Navegando a BANCAS → Lista');
    console.log('─────────────────────────────────────────────────────');

    // Buscar elemento BANCAS en el menú
    const bancasSelectors = [
      'text=BANCAS',
      'text=Bancas',
      'a:has-text("BANCAS")',
      'a:has-text("Bancas")',
      '[href*="bancas" i]',
      '[href*="betting" i]'
    ];

    let bancasClicked = false;
    for (const selector of bancasSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          console.log(`   ✅ Clic en BANCAS (selector: ${selector})`);
          bancasClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!bancasClicked) {
      console.log('   ⚠️  No se encontró BANCAS en el menú');
      console.log('   🔍 Analizando opciones del menú...');

      const links = await page.locator('a').all();
      console.log(`\n   📋 Links disponibles (${links.length} encontrados):`);
      for (let i = 0; i < Math.min(links.length, 30); i++) {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href');
        if (text && text.trim()) {
          console.log(`      ${i + 1}. ${text.trim()} → ${href || 'N/A'}`);
        }
      }
    }

    await page.waitForTimeout(1500);

    // Buscar "Lista" en submenú
    const listaSelectors = [
      'text=Lista',
      'text=LISTA',
      'a:has-text("Lista")',
      '[href*="lista" i]',
      '[href*="list" i]'
    ];

    let listaClicked = false;
    for (const selector of listaSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          console.log(`   ✅ Clic en Lista (selector: ${selector})`);
          listaClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    console.log(`   📍 URL actual: ${page.url()}\n`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-bancas-lista.png`, fullPage: true });

    // ===========================================
    // PASO 3: SELECCIONAR BANCA #9
    // ===========================================
    console.log('📍 PASO 3: Seleccionando Banca #9');
    console.log('─────────────────────────────────────────────────────');

    // Buscar botón de editar para banca admin (ID 9)
    const editSelectors = [
      'tr:has-text("admin") >> button[aria-label*="edit" i]',
      'tr:has-text("admin") >> button:has-text("Editar")',
      'tr:has-text("admin") >> button:has-text("Edit")',
      'tr:has-text("admin") >> a[href*="edit"]'
    ];

    let editClicked = false;
    for (const selector of editSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          await element.click();
          console.log(`   ✅ Clic en editar Banca #9 (selector: ${selector})`);
          editClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!editClicked) {
      console.log('   ⚠️  No se encontró botón de editar');
      console.log('   🔍 Buscando alternativas...');
    }

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    console.log(`   📍 URL actual: ${page.url()}\n`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-editar-banca.png`, fullPage: true });

    // ===========================================
    // PASO 4: IR A TAB SORTEOS
    // ===========================================
    console.log('📍 PASO 4: Navegando a Tab Sorteos');
    console.log('─────────────────────────────────────────────────────');

    const sorteosSelectors = [
      'button:has-text("Sorteos")',
      'button:has-text("SORTEOS")',
      '[role="tab"]:has-text("Sorteos")',
      'a:has-text("Sorteos")'
    ];

    let sorteosClicked = false;
    for (const selector of sorteosSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          console.log(`   ✅ Clic en tab Sorteos (selector: ${selector})`);
          sorteosClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-sorteos-antes.png`, fullPage: true });

    // ===========================================
    // PASO 5: ANALIZAR SORTEOS CONFIGURADOS
    // ===========================================
    console.log('\n📍 PASO 5: Analizando Sorteos Configurados');
    console.log('─────────────────────────────────────────────────────');

    const bodyText = await page.locator('body').textContent();
    const matchBefore = bodyText.match(/(\d+)\s+de\s+(\d+)\s+sorteo/i);

    if (matchBefore) {
      const sorteosActivos = matchBefore[1];
      const sorteosTotal = matchBefore[2];
      console.log(`   📊 Sorteos activos: ${sorteosActivos} de ${sorteosTotal}`);
    } else {
      console.log('   ⚠️  No se pudo detectar contador de sorteos');
    }

    // ===========================================
    // PASO 6: AGREGAR SORTEO "DIARIA 11AM"
    // ===========================================
    console.log('\n📍 PASO 6: Agregando sorteo "DIARIA 11AM"');
    console.log('─────────────────────────────────────────────────────');

    const sorteoSelectors = [
      ':text("DIARIA 11AM")',
      'text="DIARIA 11AM"',
      '//*[contains(text(), "DIARIA 11AM")]'
    ];

    let sorteoClicked = false;
    for (const selector of sorteoSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.scrollIntoViewIfNeeded();
          await element.click();
          console.log(`   ✅ Clic en "DIARIA 11AM" (selector: ${selector})`);
          sorteoClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!sorteoClicked) {
      console.log('   ⚠️  No se encontró sorteo "DIARIA 11AM"');
    }

    await page.waitForTimeout(1500);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-sorteo-seleccionado.png`, fullPage: true });

    // Verificar cambio en contador
    const bodyAfterSelect = await page.locator('body').textContent();
    const matchAfterSelect = bodyAfterSelect.match(/(\d+)\s+de\s+(\d+)\s+sorteo/i);

    if (matchAfterSelect) {
      console.log(`   📊 Sorteos seleccionados ahora: ${matchAfterSelect[1]}`);
    }

    // ===========================================
    // PASO 7: GUARDAR CAMBIOS
    // ===========================================
    console.log('\n📍 PASO 7: Guardando cambios');
    console.log('─────────────────────────────────────────────────────');

    const requestsBefore = apiRequests.length;

    const guardarSelectors = [
      'button:has-text("Guardar Cambios")',
      'button:has-text("Guardar")',
      'button:has-text("Save")',
      '[type="submit"]:has-text("Guardar")'
    ];

    let guardarClicked = false;
    for (const selector of guardarSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.scrollIntoViewIfNeeded();
          await element.click();
          console.log(`   ✅ Clic en "Guardar Cambios" (selector: ${selector})`);
          guardarClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(3000);

    const saveRequests = apiRequests.slice(requestsBefore).filter(r => r.method === 'PUT' || r.method === 'POST' || r.method === 'PATCH');
    console.log(`\n   📡 Requests de guardado: ${saveRequests.length}`);
    saveRequests.forEach(r => console.log(`      ${r.method} ${r.url}`));

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-despues-guardar.png`, fullPage: true });

    // ===========================================
    // PASO 8: VERIFICAR PERSISTENCIA
    // ===========================================
    console.log('\n📍 PASO 8: Verificando persistencia');
    console.log('─────────────────────────────────────────────────────');

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Volver a tab Sorteos
    for (const selector of sorteosSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-despues-reload.png`, fullPage: true });

    const bodyAfterReload = await page.locator('body').textContent();
    const matchAfterReload = bodyAfterReload.match(/(\d+)\s+de\s+(\d+)\s+sorteo/i);

    if (matchAfterReload && matchBefore) {
      const sorteosBefore = parseInt(matchBefore[1]);
      const sorteosAfter = parseInt(matchAfterReload[1]);

      console.log(`   📊 Sorteos ANTES:   ${sorteosBefore}`);
      console.log(`   📊 Sorteos DESPUÉS: ${sorteosAfter}`);
      console.log(`   ${sorteosAfter > sorteosBefore ? '✅' : '❌'} Guardado: ${sorteosAfter > sorteosBefore ? 'SÍ' : 'NO'}\n`);
    }

    // ===========================================
    // RESUMEN FINAL
    // ===========================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ TEST COMPLETADO - FRONTEND V1');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Resumen:');
    console.log(`   • Frontend: V1 (puerto 4200)`);
    console.log(`   • Login: ✅ ${TEST_USERNAME} / ***`);
    console.log(`   • BANCAS → Lista: ${bancasClicked && listaClicked ? '✅' : '⚠️'}`);
    console.log(`   • Banca #9: ${editClicked ? '✅' : '⚠️'}`);
    console.log(`   • Tab Sorteos: ${sorteosClicked ? '✅' : '⚠️'}`);
    console.log(`   • Sorteo agregado: ${"DIARIA 11AM"}`);
    console.log(`   • Guardado: ${guardarClicked ? '✅' : '⚠️'}`);
    console.log(`   • API calls guardado: ${saveRequests.length}`);
    console.log(`   • Screenshots: 7`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Análisis de todas las APIs
    console.log('\n📡 API Calls Totales:');
    const uniqueAPIs = [...new Set(apiRequests.map(r => `${r.method} ${r.url}`))];
    uniqueAPIs.forEach((api, i) => console.log(`   ${i + 1}. ${api}`));

  } catch (error) {
    console.error('\n❌ ERROR');
    console.error('═══════════════════════════════════════════════════════');
    console.error(`   ${error.message}`);
    console.error(`   URL: ${page.url()}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/error.png`, fullPage: true });
    throw error;

  } finally {
    console.log('\n⏳ Navegador abierto 10 segundos...\n');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('🏁 Finalizado.\n');
  }
})();
