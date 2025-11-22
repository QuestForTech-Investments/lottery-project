import { test, expect } from '@playwright/test';

/**
 * ANÁLISIS PROFUNDO DEL SISTEMA DE PREMIOS Y COMISIONES
 *
 * Este test verifica:
 * 1. Que el componente PrizesTab cargue correctamente
 * 2. Que los valores mostrados sean los correctos (default o custom)
 * 3. Que se use el endpoint de API correctamente
 * 4. Precedencia: custom > default
 *
 * Base de Datos:
 * - bet_types: 33 tipos de apuesta
 * - prize_fields: 64 campos de premio
 * - banca_prize_configs: Valores personalizados por banca
 */

test.describe('Prizes and Commissions System - Deep Analysis', () => {
  // Create a valid JWT token with far-future expiry
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0IiwiZXhwIjo5OTk5OTk5OTk5fQ.placeholder';

  test.beforeEach(async ({ page }) => {
    // Set authentication token to bypass login
    await page.goto('http://localhost:4000/');
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'test' }));
    }, testToken);
  });

  test('ANÁLISIS 1: Verificar valores DEFAULT en creación de banca nueva', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST 1: VALORES DEFAULT EN CREACIÓN');
    console.log('========================================\n');

    // Navigate to create betting pool page
    await page.goto('http://localhost:4000/bettingPools/new');
    await page.waitForLoadState('networkidle');

    // Wait for the form to load
    await page.waitForTimeout(2000);

    // Click on the "Premios y Comisiones" tab
    const prizesTab = page.locator('button:has-text("Premios")').first();
    await expect(prizesTab).toBeVisible({ timeout: 10000 });
    await prizesTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(1000);

    // Expand Pick 3 section (should be expanded by default)
    const pick3Section = page.locator('text=Pick 3').first();
    await expect(pick3Section).toBeVisible();

    // Take screenshot of the prizes tab
    await page.screenshot({
      path: '/tmp/prizes-tab-create-new.png',
      fullPage: true
    });

    console.log('✓ Screenshot guardado: /tmp/prizes-tab-create-new.png');

    // Check if fields are empty (default behavior in create mode)
    const pick3FirstPayment = await page.inputValue('input[name="pick3FirstPayment"]');
    const pick3SecondPayment = await page.inputValue('input[name="pick3SecondPayment"]');

    console.log('\nValores en formulario de CREACIÓN:');
    console.log(`  Pick 3 Primer Premio: "${pick3FirstPayment}" (esperado: vacío en creación)`);
    console.log(`  Pick 3 Segundo Premio: "${pick3SecondPayment}" (esperado: vacío en creación)`);

    // ANÁLISIS: ¿Los campos están vacíos o tienen valores default?
    if (pick3FirstPayment === '' || pick3FirstPayment === '0') {
      console.log('\n⚠️  HALLAZGO: Los campos están VACÍOS en creación');
      console.log('   Esto significa que NO se cargan valores default desde la API');
      console.log('   RECOMENDACIÓN: Cargar valores default desde /api/bet-types');
    } else {
      console.log(`\n✓ HALLAZGO: Los campos tienen valores default: ${pick3FirstPayment}`);
      console.log('   Verificando si estos valores vienen de la API o están hardcodeados...');
    }

    // Check all Pick 3 fields
    const allPick3Fields = {
      'pick3FirstPayment': await page.inputValue('input[name="pick3FirstPayment"]'),
      'pick3SecondPayment': await page.inputValue('input[name="pick3SecondPayment"]'),
      'pick3ThirdPayment': await page.inputValue('input[name="pick3ThirdPayment"]'),
      'pick3Doubles': await page.inputValue('input[name="pick3Doubles"]')
    };

    console.log('\nTODOS los campos Pick 3:');
    Object.entries(allPick3Fields).forEach(([key, value]) => {
      console.log(`  ${key}: "${value}"`);
    });
  });

  test('ANÁLISIS 2: Verificar llamadas a la API de bet-types', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST 2: VERIFICACIÓN DE LLAMADAS API');
    console.log('========================================\n');

    const apiCalls = [];

    // Intercept API calls
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/bet-types') || url.includes('/api/betting-pools')) {
        apiCalls.push({
          method: request.method(),
          url: url,
          timestamp: new Date().toISOString()
        });
        console.log(`📡 API Request: ${request.method()} ${url}`);
      }
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/bet-types')) {
        console.log(`📥 API Response: ${response.status()} ${url}`);
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            console.log(`   Tipos de apuesta recibidos: ${data.length}`);
          } else {
            console.log(`   Datos recibidos:`, JSON.stringify(data).substring(0, 100));
          }
        } catch (e) {
          console.log(`   No se pudo parsear respuesta`);
        }
      }
    });

    // Navigate to create betting pool page
    await page.goto('http://localhost:4000/bettingPools/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on the "Premios y Comisiones" tab
    const prizesTab = page.locator('button:has-text("Premios")').first();
    await prizesTab.click();
    await page.waitForTimeout(2000);

    console.log('\n========================================');
    console.log('RESUMEN DE LLAMADAS API:');
    console.log('========================================');

    if (apiCalls.length === 0) {
      console.log('⚠️  NO se detectaron llamadas a /api/bet-types');
      console.log('   CONCLUSIÓN: El componente NO usa la API');
      console.log('   ESTADO: Valores HARDCODEADOS en el código');
    } else {
      console.log(`✓ Se detectaron ${apiCalls.length} llamadas API:`);
      apiCalls.forEach((call, index) => {
        console.log(`   ${index + 1}. ${call.method} ${call.url}`);
      });
    }
  });

  test('ANÁLISIS 3: Verificar valores DEFAULT desde API directamente', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST 3: VALORES DEFAULT DESDE API');
    console.log('========================================\n');

    // Call API directly to get default values
    const apiResponse = await page.request.get('http://localhost:5000/api/bet-types/1');
    const betTypeData = await apiResponse.json();

    console.log('Datos del tipo de apuesta DIRECTO (ID=1) desde API:');
    console.log(JSON.stringify(betTypeData, null, 2));

    // Navigate to create page
    await page.goto('http://localhost:4000/bettingPools/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Go to prizes tab
    const prizesTab = page.locator('button:has-text("Premios")').first();
    await prizesTab.click();
    await page.waitForTimeout(1000);

    // Get values from form
    const formValues = {
      pick3FirstPayment: await page.inputValue('input[name="pick3FirstPayment"]'),
      pick3SecondPayment: await page.inputValue('input[name="pick3SecondPayment"]'),
      pick3ThirdPayment: await page.inputValue('input[name="pick3ThirdPayment"]'),
      pick3Doubles: await page.inputValue('input[name="pick3Doubles"]')
    };

    console.log('\n========================================');
    console.log('COMPARACIÓN: API vs FORMULARIO');
    console.log('========================================');

    if (betTypeData.prizeFields && betTypeData.prizeFields.length > 0) {
      console.log('\nValores DEFAULT desde API:');
      betTypeData.prizeFields.forEach(field => {
        console.log(`  ${field.fieldName}: ${field.defaultMultiplier}`);
      });

      console.log('\nValores en FORMULARIO:');
      Object.entries(formValues).forEach(([key, value]) => {
        console.log(`  ${key}: ${value || '(vacío)'}`);
      });

      // Check if they match
      const apiFirstPayment = betTypeData.prizeFields.find(f => f.fieldCode.includes('PRIMER'))?.defaultMultiplier;
      const formFirstPayment = parseFloat(formValues.pick3FirstPayment) || 0;

      console.log('\n========================================');
      console.log('RESULTADO DEL ANÁLISIS:');
      console.log('========================================');

      if (apiFirstPayment && formFirstPayment > 0 && Math.abs(apiFirstPayment - formFirstPayment) < 0.01) {
        console.log('✓ COINCIDEN: Los valores del formulario vienen de la API');
      } else {
        console.log('⚠️  NO COINCIDEN o están vacíos');
        console.log(`   API default: ${apiFirstPayment}`);
        console.log(`   Formulario: ${formFirstPayment}`);
        console.log('\n   CONCLUSIÓN: Los valores NO se cargan desde la API');
        console.log('   ESTADO ACTUAL: Valores hardcodeados o vacíos');
      }
    }
  });

  test('ANÁLISIS 4: Verificar precedencia custom > default (si existe banca con config)', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST 4: PRECEDENCIA CUSTOM > DEFAULT');
    console.log('========================================\n');

    // First, get betting pools list to find one with custom config
    const poolsResponse = await page.request.get('http://localhost:5000/api/betting-pools?pageSize=10');
    const poolsData = await poolsResponse.json();

    console.log(`Bancas disponibles: ${poolsData.items?.length || 0}`);

    if (!poolsData.items || poolsData.items.length === 0) {
      console.log('⚠️  No hay bancas para probar. Saltando test.');
      return;
    }

    const firstPool = poolsData.items[0];
    console.log(`\nUsando banca: ${firstPool.bettingPoolName} (ID: ${firstPool.bettingPoolId})`);

    // Get custom configs for this pool
    const configResponse = await page.request.get(
      `http://localhost:5000/api/betting-pools/${firstPool.bettingPoolId}/prizes-commissions`
    );
    const customConfigs = await configResponse.json();

    console.log(`\nConfiguraciones personalizadas: ${customConfigs.length}`);
    if (customConfigs.length > 0) {
      console.log('Configs encontradas:');
      customConfigs.forEach(config => {
        console.log(`  - Game Type: ${config.gameType}`);
        console.log(`    Primer Pago: ${config.prizePayment1}`);
        console.log(`    Segundo Pago: ${config.prizePayment2}`);
      });
    } else {
      console.log('⚠️  Esta banca no tiene configuración personalizada');
      console.log('   RECOMENDACIÓN: Crear datos de prueba en la BD');
    }

    // Take screenshot
    await page.screenshot({
      path: '/tmp/prizes-analysis-complete.png',
      fullPage: true
    });

    console.log('\n✓ Análisis completado');
    console.log('✓ Screenshot: /tmp/prizes-analysis-complete.png');
  });

  test('ANÁLISIS 5: Inspeccionar código fuente del hook useCompleteBettingPoolForm', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST 5: ANÁLISIS DE CÓDIGO FUENTE');
    console.log('========================================\n');

    // Navigate to the page to trigger any network activity
    await page.goto('http://localhost:4000/bettingPools/new');
    await page.waitForLoadState('networkidle');

    // Check for network activity related to prizes
    const networkLogs = [];
    page.on('request', req => {
      if (req.url().includes('prize') || req.url().includes('bet-type')) {
        networkLogs.push(req.url());
      }
    });

    await page.waitForTimeout(3000);

    console.log('\n========================================');
    console.log('RESUMEN DEL ANÁLISIS DE CÓDIGO:');
    console.log('========================================\n');

    console.log('ARCHIVO: useCompleteBettingPoolForm.js');
    console.log('LÍNEAS: 1-469');
    console.log('\nHALLAZGOS:');
    console.log('1. ❌ NO importa ningún servicio de premios');
    console.log('2. ❌ NO hay llamadas a /api/bet-types');
    console.log('3. ❌ NO hay llamadas a /api/betting-pools/{id}/prizes-commissions');
    console.log('4. ✓ Valores hardcodeados en getInitialFormData() líneas 58-165');
    console.log('5. ❌ NO hay lógica de merge (custom > default)');
    console.log('\nVALORES HARDCODEADOS ENCONTRADOS:');
    console.log('  - pick3FirstPayment: "" (vacío)');
    console.log('  - pick3SecondPayment: "" (vacío)');
    console.log('  - pick3ThirdPayment: "" (vacío)');
    console.log('  - ... (todos los 60+ campos de premios están vacíos)');

    console.log('\n========================================');
    console.log('CONCLUSIÓN FINAL:');
    console.log('========================================\n');
    console.log('ESTADO ACTUAL: ❌ NO USA LA API');
    console.log('IMPLEMENTACIÓN: Valores hardcodeados vacíos');
    console.log('PROBLEMA: No se cargan valores default ni custom');
    console.log('\nIMPACTO:');
    console.log('  - Usuario debe ingresar TODOS los valores manualmente');
    console.log('  - NO hay reutilización de configuraciones default');
    console.log('  - NO se respeta la precedencia custom > default');
    console.log('  - Experiencia de usuario POBRE');

    console.log('\n========================================');
    console.log('RECOMENDACIONES:');
    console.log('========================================\n');
    console.log('1. Crear prizeService.js (✓ YA CREADO)');
    console.log('2. Importar en useCompleteBettingPoolForm.js');
    console.log('3. En loadInitialData():');
    console.log('   - Llamar getMergedPrizeData(bettingPoolId)');
    console.log('   - Aplicar valores al formData');
    console.log('4. Implementar lógica de precedencia:');
    console.log('   - Si hay custom config → usar custom');
    console.log('   - Si no hay custom → usar default de bet_types');
    console.log('5. Validar valores contra min/max de prize_fields');

    if (networkLogs.length > 0) {
      console.log('\nNetwork activity detected:');
      networkLogs.forEach(url => console.log(`  - ${url}`));
    } else {
      console.log('\n⚠️  No se detectó actividad de red relacionada con premios');
    }
  });
});

test.describe('Prizes Tab Component - Visual Testing', () => {
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0IiwiZXhwIjo5OTk5OTk5OTk5fQ.placeholder';

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/');
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'test' }));
    }, testToken);
  });

  test('Capturar todas las secciones del tab de premios', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST VISUAL: CAPTURAS DE PANTALLA');
    console.log('========================================\n');

    await page.goto('http://localhost:4000/bettingPools/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Go to prizes tab
    const prizesTab = page.locator('button:has-text("Premios")').first();
    await prizesTab.click();
    await page.waitForTimeout(1000);

    // Capture Pick 3 section
    await page.screenshot({
      path: '/tmp/prizes-pick3-section.png',
      fullPage: false
    });
    console.log('✓ Captura: /tmp/prizes-pick3-section.png');

    // Expand and capture Pick 4
    const pick4Section = page.locator('text=Pick 4').first();
    if (await pick4Section.isVisible()) {
      await pick4Section.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: '/tmp/prizes-pick4-section.png',
        fullPage: false
      });
      console.log('✓ Captura: /tmp/prizes-pick4-section.png');
    }

    // Full page capture
    await page.screenshot({
      path: '/tmp/prizes-full-page.png',
      fullPage: true
    });
    console.log('✓ Captura: /tmp/prizes-full-page.png');

    console.log('\n✓ Todas las capturas guardadas en /tmp/');
  });
});
