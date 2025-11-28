const { chromium } = require('playwright');

async function testApiResponse() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar llamadas a la API
  const apiCalls = [];

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/bet-types')) {
      console.log(`\n📡 API Call: ${url}`);
      console.log(`   Status: ${response.status()}`);

      try {
        const data = await response.json();

        if (Array.isArray(data)) {
          console.log(`   Response: Array with ${data.length} items`);

          if (data.length > 0) {
            const first = data[0];
            console.log(`\n   First item structure:`);
            console.log(`   - betTypeId: ${first.betTypeId}`);
            console.log(`   - betTypeCode: ${first.betTypeCode}`);
            console.log(`   - betTypeName: ${first.betTypeName}`);
            console.log(`   - Has prizeTypes: ${first.prizeTypes ? 'YES ✅' : 'NO ❌'}`);
            console.log(`   - Has prizeFields: ${first.prizeFields ? 'YES ✅' : 'NO ❌'}`);

            if (first.prizeTypes) {
              console.log(`   - prizeTypes length: ${first.prizeTypes.length}`);
            }
            if (first.prizeFields) {
              console.log(`   - prizeFields length: ${first.prizeFields.length}`);
            }
          }
        }
      } catch (e) {
        console.log(`   Could not parse response: ${e.message}`);
      }
    }
  });

  // Capturar logs de consola
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('bet types') || text.includes('prizeFields') || text.includes('prizeTypes')) {
      console.log(`\n🖥️  CONSOLE: ${text}`);
    }
  });

  try {
    console.log('🧪 Testing API Response and Data Structure\n');

    // Login
    console.log('1️⃣ Login...');
    await page.goto('http://localhost:4002/login');
    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Ir a editar banca
    console.log('\n2️⃣ Navegando a editar banca...');
    await page.goto('http://localhost:4002/betting-pools/edit/9');
    await page.waitForTimeout(3000);

    // Abrir tab Premios & Comisiones
    console.log('\n3️⃣ Abriendo tab Premios & Comisiones...');
    const tabPremios = await page.locator('button[role="tab"]').filter({ hasText: /Premios.*Comisiones/i }).first();
    if (await tabPremios.count() > 0) {
      await tabPremios.click();
      await page.waitForTimeout(2000);
    }

    // Ir a sub-tab Premios
    console.log('\n4️⃣ Abriendo sub-tab Premios...');
    const subTabPremios = await page.locator('button[role="tab"]').filter({ hasText: 'Premios' }).first();
    if (await subTabPremios.count() > 0) {
      await subTabPremios.click();
      await page.waitForTimeout(3000);
    }

    // Verificar si hay accordions
    console.log('\n5️⃣ Verificando bet types...');
    const accordions = await page.locator('[role="button"]').filter({ hasText: /Directo|Palé|Tripleta/i });
    const accordionCount = await accordions.count();
    console.log(`   📦 Accordions encontrados: ${accordionCount}`);

    // Verificar inputs
    const inputs = await page.locator('input[type="text"]');
    const inputCount = await inputs.count();
    console.log(`   📝 Inputs encontrados: ${inputCount}`);

    // Verificar mensajes de error
    const errorMessages = await page.locator('text=/No hay campos/i');
    const errorCount = await errorMessages.count();
    console.log(`   ⚠️  Mensajes de "No hay campos": ${errorCount}`);

    // Expandir primer accordion si existe
    if (accordionCount > 0) {
      console.log('\n6️⃣ Expandiendo primer bet type...');
      await accordions.first().click();
      await page.waitForTimeout(1000);

      const inputsAfterExpand = await page.locator('input[type="text"]').count();
      console.log(`   📝 Inputs después de expandir: ${inputsAfterExpand}`);
    }

    // Screenshot
    await page.screenshot({ path: '/tmp/premios-debug-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot guardado en /tmp/premios-debug-screenshot.png');

    // Evaluar estado en el navegador
    console.log('\n7️⃣ Evaluando estado en navegador...');
    const browserState = await page.evaluate(() => {
      // Buscar si React DevTools puede dar info
      const root = document.querySelector('#root');
      const premiosTab = document.querySelector('[role="tabpanel"]');

      return {
        hasRoot: !!root,
        hasPremiosTab: !!premiosTab,
        accordionsInDOM: document.querySelectorAll('[role="button"]').length,
        inputsInDOM: document.querySelectorAll('input[type="text"]').length
      };
    });

    console.log('   Browser state:', JSON.stringify(browserState, null, 2));

    console.log('\n⏳ Manteniendo navegador abierto 15 segundos...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testApiResponse().catch(console.error);
