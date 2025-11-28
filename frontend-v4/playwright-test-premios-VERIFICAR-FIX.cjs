const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4002';
const BANCA_ID = 9;

async function testPremiosTabAfterFix() {
  console.log('🧪 Test: Verificar fix de inputs en tabs específicos\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar logs de consola
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Loading all bet types') || text.includes('Loaded') || text.includes('bet types')) {
      console.log('   🖥️  LOG:', text);
    }
  });

  try {
    // 1. Login
    console.log('1️⃣ Login...');
    await page.goto(`${FRONTEND_URL}/login`);
    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${FRONTEND_URL}/`);
    console.log('   ✅ Login exitoso\n');

    // 2. Navegar a editar banca
    console.log('2️⃣ Navegando a editar banca...');
    await page.goto(`${FRONTEND_URL}/betting-pools/edit/${BANCA_ID}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('   ✅ Página cargada\n');

    // 3. Abrir tab "Premios & Comisiones"
    console.log('3️⃣ Abriendo tab "Premios & Comisiones"...');
    const tabPremios = await page.locator('button[role="tab"]').filter({ hasText: /Premios.*Comisiones/i }).first();
    await tabPremios.click();
    await page.waitForTimeout(1000);
    console.log('   ✅ Tab abierto\n');

    // 4. Ir a sub-tab "Premios"
    console.log('4️⃣ Yendo a sub-tab "Premios"...');
    const subTabPremios = await page.locator('button[role="tab"]').filter({ hasText: 'Premios' }).first();
    await subTabPremios.click();
    await page.waitForTimeout(1500);
    console.log('   ✅ Sub-tab "Premios" activo\n');

    // 5. Verificar tab "General"
    console.log('5️⃣ Verificando tab "General"...');
    const generalTab = await page.locator('button[role="tab"]').filter({ hasText: 'General' }).first();
    await generalTab.click();
    await page.waitForTimeout(1500);

    const inputsGeneral = await page.locator('input[type="text"]').count();
    console.log(`   📝 Inputs en "General": ${inputsGeneral}`);

    if (inputsGeneral > 0) {
      console.log('   ✅ General: OK (tiene inputs)\n');
    } else {
      console.log('   ❌ General: FALLO (sin inputs)\n');
    }

    await page.screenshot({ path: '/tmp/premios-fix/general.png', fullPage: true });

    // 6. TEST PRINCIPAL: Verificar tab "NACIONAL"
    console.log('6️⃣ TEST PRINCIPAL: Verificando tab "NACIONAL"...');
    const nacionalTab = await page.locator('button[role="tab"]').filter({ hasText: 'NACIONAL' }).first();

    if (await nacionalTab.count() > 0) {
      await nacionalTab.click();
      await page.waitForTimeout(2000);

      const inputsNacional = await page.locator('input[type="text"]').count();
      console.log(`   📝 Inputs en "NACIONAL": ${inputsNacional}`);

      if (inputsNacional > 0) {
        console.log('   ✅✅✅ NACIONAL: FIX FUNCIONA! (tiene inputs)');
      } else {
        console.log('   ❌❌❌ NACIONAL: FIX NO FUNCIONA (sin inputs)');
      }

      await page.screenshot({ path: '/tmp/premios-fix/nacional.png', fullPage: true });
    } else {
      console.log('   ⚠️ Tab NACIONAL no encontrado');
    }
    console.log('');

    // 7. Verificar tab "LOTEKA"
    console.log('7️⃣ Verificando tab "LOTEKA"...');
    const lotekaTab = await page.locator('button[role="tab"]').filter({ hasText: 'LOTEKA' }).first();

    if (await lotekaTab.count() > 0) {
      await lotekaTab.click();
      await page.waitForTimeout(2000);

      const inputsLoteka = await page.locator('input[type="text"]').count();
      console.log(`   📝 Inputs en "LOTEKA": ${inputsLoteka}`);

      if (inputsLoteka > 0) {
        console.log('   ✅✅✅ LOTEKA: FIX FUNCIONA! (tiene inputs)');
      } else {
        console.log('   ❌❌❌ LOTEKA: FIX NO FUNCIONA (sin inputs)');
      }

      await page.screenshot({ path: '/tmp/premios-fix/loteka.png', fullPage: true });
    } else {
      console.log('   ⚠️ Tab LOTEKA no encontrado');
    }
    console.log('');

    // 8. Verificar tab "LA PRIMERA"
    console.log('8️⃣ Verificando tab "LA PRIMERA"...');
    const laPrimeraTab = await page.locator('button[role="tab"]').filter({ hasText: 'LA PRIMERA' }).first();

    if (await laPrimeraTab.count() > 0) {
      await laPrimeraTab.click();
      await page.waitForTimeout(2000);

      const inputsLaPrimera = await page.locator('input[type="text"]').count();
      console.log(`   📝 Inputs en "LA PRIMERA": ${inputsLaPrimera}`);

      if (inputsLaPrimera > 0) {
        console.log('   ✅✅✅ LA PRIMERA: FIX FUNCIONA! (tiene inputs)');
      } else {
        console.log('   ❌❌❌ LA PRIMERA: FIX NO FUNCIONA (sin inputs)');
      }

      await page.screenshot({ path: '/tmp/premios-fix/la-primera.png', fullPage: true });
    } else {
      console.log('   ⚠️ Tab LA PRIMERA no encontrado');
    }
    console.log('');

    // 9. Expandir un bet type para verificar campos
    console.log('9️⃣ Expandiendo bet type "Directo" en NACIONAL...');
    await nacionalTab.click();
    await page.waitForTimeout(1500);

    const directoAccordion = await page.locator('div[role="button"]').filter({ hasText: /^Directo/i }).first();

    if (await directoAccordion.count() > 0) {
      await directoAccordion.click();
      await page.waitForTimeout(1000);

      const inputsInDirecto = await page.locator('input[type="text"]').count();
      console.log(`   📝 Inputs visibles después de expandir "Directo": ${inputsInDirecto}`);

      if (inputsInDirecto >= 4) {
        console.log('   ✅ Campos de "Directo" visibles correctamente');
      } else {
        console.log('   ⚠️ Menos inputs de los esperados (esperado: 4+)');
      }

      await page.screenshot({ path: '/tmp/premios-fix/directo-expanded.png', fullPage: true });
    } else {
      console.log('   ⚠️ Accordion "Directo" no encontrado');
    }
    console.log('');

    // Resumen final
    console.log('═══════════════════════════════════════');
    console.log('📊 RESUMEN DE LA VERIFICACIÓN:');
    console.log('═══════════════════════════════════════');
    console.log(`General:     ${inputsGeneral > 0 ? '✅' : '❌'} (${inputsGeneral} inputs)`);

    await nacionalTab.click();
    await page.waitForTimeout(1000);
    const finalInputsNacional = await page.locator('input[type="text"]').count();
    console.log(`NACIONAL:    ${finalInputsNacional > 0 ? '✅' : '❌'} (${finalInputsNacional} inputs)`);

    await lotekaTab.click();
    await page.waitForTimeout(1000);
    const finalInputsLoteka = await page.locator('input[type="text"]').count();
    console.log(`LOTEKA:      ${finalInputsLoteka > 0 ? '✅' : '❌'} (${finalInputsLoteka} inputs)`);

    await laPrimeraTab.click();
    await page.waitForTimeout(1000);
    const finalInputsLaPrimera = await page.locator('input[type="text"]').count();
    console.log(`LA PRIMERA:  ${finalInputsLaPrimera > 0 ? '✅' : '❌'} (${finalInputsLaPrimera} inputs)`);

    console.log('═══════════════════════════════════════');

    if (finalInputsNacional > 0 && finalInputsLoteka > 0 && finalInputsLaPrimera > 0) {
      console.log('\n🎉🎉🎉 FIX VERIFICADO: TODOS LOS TABS MUESTRAN INPUTS! 🎉🎉🎉\n');
    } else {
      console.log('\n❌ FIX NO COMPLETADO: Algunos tabs aún no muestran inputs\n');
    }

    console.log('📸 Screenshots guardados en: /tmp/premios-fix/\n');

    // Mantener navegador abierto 10 segundos para inspección manual
    console.log('⏳ Manteniendo navegador abierto 10 segundos para inspección...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Error durante el test:', error.message);
    await page.screenshot({ path: '/tmp/premios-fix/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Ejecutar test
testPremiosTabAfterFix().catch(console.error);
