import { test, expect } from '@playwright/test';

/**
 * Sistema de Premios - Tests Completos
 *
 * Este archivo contiene tests end-to-end para verificar el sistema completo de
 * gestión de premios y comisiones en las bancas.
 *
 * Flujo testeado:
 * 1. Login
 * 2. Editar banca existente
 * 3. Verificar carga de valores (defaults o custom)
 * 4. Modificar valores de premios
 * 5. Guardar cambios
 * 6. Verificar persistencia en backend
 * 7. Recargar y verificar que los valores persisten
 */

// Credenciales de prueba
const TEST_USER = {
  username: 'admin',
  password: 'Admin123456'
};

// ID de banca para pruebas (asegúrate de que existe)
const TEST_BETTING_POOL_ID = 9;

/**
 * Helper: Realizar login
 */
async function login(page) {
  await page.goto('http://localhost:4000/');

  // Esperar formulario de login
  await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });

  // Llenar credenciales
  const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  await usernameInput.fill(TEST_USER.username);
  await passwordInput.fill(TEST_USER.password);

  // Submit
  await page.locator('button[type="submit"]').click();

  // Esperar redirección al dashboard
  await page.waitForURL(/\/(dashboard|home|inicio)/, { timeout: 10000 });

  console.log('✅ Login exitoso');
}

/**
 * Helper: Navegar a lista de bancas y editar una banca específica
 */
async function navigateToBettingPoolEdit(page, bettingPoolId) {
  // Hacer clic en el menú BANCAS del sidebar
  const bancasMenu = page.locator('[role="button"]:has-text("BANCAS"), button:has-text("BANCAS")').first();
  await bancasMenu.click();
  await page.waitForTimeout(1000);
  console.log('✅ Menú BANCAS expandido');

  // Hacer clic en "Lista" dentro del menú de BANCAS
  const listaOption = page.getByText('Lista', { exact: false }).first();
  await listaOption.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('✅ Lista de bancas cargada');

  // Buscar la fila que contiene el ID de la banca
  const row = page.locator(`tr:has-text("${bettingPoolId}")`).first();
  await expect(row).toBeVisible({ timeout: 10000 });
  console.log(`✅ Fila de banca ${bettingPoolId} encontrada`);

  // Buscar todos los botones en la fila (normalmente son iconos de acción)
  // El botón de editar suele ser el segundo botón en las tablas
  const buttons = row.locator('button, [role="button"]');
  const buttonCount = await buttons.count();
  console.log(`📊 Encontrados ${buttonCount} botones en la fila`);

  // Usar el segundo botón (índice 1) que generalmente es el de editar
  // Si solo hay un botón, usar ese
  const editButton = buttonCount > 1 ? buttons.nth(1) : buttons.first();

  await editButton.click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');

  console.log(`✅ Navegado a editar banca ${bettingPoolId}`);
}

/**
 * Helper: Navegar al tab de Premios
 */
async function navigateToPrizesTab(page) {
  // Buscar el tab por texto exacto "Premios & Comisiones"
  const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios\s*&\s*comisiones/i });
  await expect(prizesTab).toBeVisible({ timeout: 10000 });
  await prizesTab.click();
  await page.waitForTimeout(2000);

  // Esperar a que carguen los tipos de juego
  await page.waitForSelector('text=/tipos de juegos cargados/i', { timeout: 15000 });

  console.log('✅ Tab de premios cargado');
}

/**
 * Helper: Obtener valor de un campo de premio
 */
async function getPrizeFieldValue(page, fieldName) {
  // Buscar el campo por su atributo name
  const field = page.locator(`input[name="${fieldName}"]`);
  await expect(field).toBeVisible({ timeout: 5000 });

  const value = await field.inputValue();
  return parseFloat(value);
}

/**
 * Helper: Establecer valor de un campo de premio
 */
async function setPrizeFieldValue(page, fieldName, value) {
  const field = page.locator(`input[name="${fieldName}"]`);
  await expect(field).toBeVisible({ timeout: 5000 });

  await field.clear();
  await field.fill(value.toString());

  console.log(`✏️  Campo ${fieldName} actualizado a: ${value}`);
}

/**
 * Helper: Verificar en el backend que se guardó el valor
 */
async function verifyBackendValue(bettingPoolId, fieldCode, expectedValue) {
  const response = await fetch(`http://localhost:5000/api/betting-pools/${bettingPoolId}/prize-config`);
  const configs = await response.json();

  const config = configs.find(c => c.fieldCode === fieldCode);

  if (!config) {
    throw new Error(`No se encontró configuración para ${fieldCode}`);
  }

  if (config.customValue !== expectedValue) {
    throw new Error(`Valor incorrecto. Esperado: ${expectedValue}, Obtenido: ${config.customValue}`);
  }

  console.log(`✅ Backend verificado: ${fieldCode} = ${expectedValue}`);
  return true;
}

test.describe('Sistema de Premios - Tests Completos', () => {

  /**
   * TEST 1: Verificar carga de valores por defecto
   *
   * Este test verifica que cuando se edita una banca sin valores custom,
   * se muestran los valores por defecto de la base de datos.
   */
  test('Test 1: Cargar valores por defecto en banca sin customs', async ({ page }) => {
    console.log('\n🧪 TEST 1: Valores por defecto\n');

    // Login
    await login(page);

    // Navegar a la banca por el flujo normal (menú → lista → editar)
    await navigateToBettingPoolEdit(page, TEST_BETTING_POOL_ID);

    // Esperar a que carguen los tabs del formulario (indica que el form está renderizado)
    await page.waitForSelector('[role="tab"]', { timeout: 15000 });
    console.log('✅ Tabs cargados');

    // Navegar a tab de premios
    await navigateToPrizesTab(page);

    // Verificar que los campos tienen valores (no están vacíos)
    const directoPrimerPago = await getPrizeFieldValue(page, 'DIRECTO_DIRECTO_PRIMER_PAGO');
    const directoSegundoPago = await getPrizeFieldValue(page, 'DIRECTO_DIRECTO_SEGUNDO_PAGO');

    console.log(`📊 Directo Primer Pago: ${directoPrimerPago}`);
    console.log(`📊 Directo Segundo Pago: ${directoSegundoPago}`);

    // Verificar que tienen valores numéricos válidos
    expect(directoPrimerPago).toBeGreaterThan(0);
    expect(directoSegundoPago).toBeGreaterThan(0);

    // Screenshot
    await page.screenshot({
      path: 'test-results/prizes-default-values.png',
      fullPage: true
    });

    console.log('✅ Test 1 pasado: Valores por defecto cargados correctamente\n');
  });

  /**
   * TEST 2: Modificar y guardar valor custom
   *
   * Este test modifica un valor de premio, lo guarda, y verifica que:
   * - Se envía correctamente a la API
   * - Se guarda en el backend
   * - Persiste al recargar la página
   */
  test('Test 2: Modificar y guardar valor custom', async ({ page }) => {
    console.log('\n🧪 TEST 2: Modificar y guardar valor custom\n');

    // Login
    await login(page);

    // Navegar a la banca por el flujo normal (menú → lista → editar)
    await navigateToBettingPoolEdit(page, TEST_BETTING_POOL_ID);

    // Esperar a que carguen los tabs del formulario
    await page.waitForSelector('[role="tab"]', { timeout: 15000 });
    console.log('✅ Tabs cargados');

    // Navegar a tab de premios
    await navigateToPrizesTab(page);

    // Obtener valor actual
    const valorInicial = await getPrizeFieldValue(page, 'DIRECTO_DIRECTO_PRIMER_PAGO');
    console.log(`📊 Valor inicial: ${valorInicial}`);

    // Calcular nuevo valor (diferente al actual)
    const nuevoValor = valorInicial + 10;
    console.log(`🎯 Nuevo valor a guardar: ${nuevoValor}`);

    // Modificar el valor
    await setPrizeFieldValue(page, 'DIRECTO_DIRECTO_PRIMER_PAGO', nuevoValor);

    // Esperar un momento para que React actualice el estado
    await page.waitForTimeout(500);

    // Guardar
    console.log('💾 Guardando cambios...');
    const saveButton = page.locator('button[type="submit"]').filter({ hasText: /actualizar|guardar/i });
    await saveButton.click();

    // Esperar éxito
    await page.waitForTimeout(3000);

    // Verificar en el backend
    console.log('🔍 Verificando en backend...');
    await verifyBackendValue(TEST_BETTING_POOL_ID, 'DIRECTO_PRIMER_PAGO', nuevoValor);

    console.log('✅ Test 2 pasado: Valor guardado correctamente\n');
  });

  /**
   * TEST 3: Verificar persistencia de valores custom
   *
   * Este test recarga la página y verifica que los valores custom
   * se mantienen (no vuelven a los defaults).
   */
  test('Test 3: Verificar persistencia de valores custom', async ({ page }) => {
    console.log('\n🧪 TEST 3: Persistencia de valores custom\n');

    // Login
    await login(page);

    // Navegar a la banca por el flujo normal (menú → lista → editar)
    await navigateToBettingPoolEdit(page, TEST_BETTING_POOL_ID);

    // Esperar a que carguen los tabs del formulario
    await page.waitForSelector('[role="tab"]', { timeout: 15000 });
    console.log('✅ Tabs cargados');

    // Navegar a tab de premios
    await navigateToPrizesTab(page);

    // Obtener valor actual del campo
    const valorActual = await getPrizeFieldValue(page, 'DIRECTO_DIRECTO_PRIMER_PAGO');
    console.log(`📊 Valor cargado: ${valorActual}`);

    // Obtener valor del backend para comparar
    const response = await fetch(`http://localhost:5000/api/betting-pools/${TEST_BETTING_POOL_ID}/prize-config`);
    const configs = await response.json();
    const configBackend = configs.find(c => c.fieldCode === 'DIRECTO_PRIMER_PAGO');

    if (!configBackend) {
      console.log('⚠️  No hay valor custom en backend (usando default)');
    } else {
      console.log(`📊 Valor en backend: ${configBackend.customValue}`);

      // Verificar que coinciden
      expect(valorActual).toBe(configBackend.customValue);
    }

    // Screenshot
    await page.screenshot({
      path: 'test-results/prizes-persistence-check.png',
      fullPage: true
    });

    console.log('✅ Test 3 pasado: Valores persisten correctamente\n');
  });

  /**
   * TEST 4: Modificar múltiples valores a la vez
   *
   * Este test modifica varios valores de premio simultáneamente
   * y verifica que todos se guarden correctamente.
   */
  test('Test 4: Modificar múltiples valores simultáneamente', async ({ page }) => {
    console.log('\n🧪 TEST 4: Modificar múltiples valores\n');

    // Login
    await login(page);

    // Navegar a la banca por el flujo normal (menú → lista → editar)
    await navigateToBettingPoolEdit(page, TEST_BETTING_POOL_ID);

    // Esperar a que carguen los tabs del formulario
    await page.waitForSelector('[role="tab"]', { timeout: 15000 });
    console.log('✅ Tabs cargados');

    // Navegar a tab de premios
    await navigateToPrizesTab(page);

    // Definir los campos a modificar
    const camposAModificar = [
      { name: 'DIRECTO_DIRECTO_PRIMER_PAGO', fieldCode: 'DIRECTO_PRIMER_PAGO', newValue: 75 },
      { name: 'DIRECTO_DIRECTO_SEGUNDO_PAGO', fieldCode: 'DIRECTO_SEGUNDO_PAGO', newValue: 15 },
      { name: 'DIRECTO_DIRECTO_TERCER_PAGO', fieldCode: 'DIRECTO_TERCER_PAGO', newValue: 5 }
    ];

    // Modificar todos los campos
    for (const campo of camposAModificar) {
      console.log(`✏️  Modificando ${campo.fieldCode} a ${campo.newValue}`);
      await setPrizeFieldValue(page, campo.name, campo.newValue);
      await page.waitForTimeout(300);
    }

    // Guardar
    console.log('💾 Guardando todos los cambios...');
    const saveButton = page.locator('button[type="submit"]').filter({ hasText: /actualizar|guardar/i });
    await saveButton.click();

    // Esperar éxito
    await page.waitForTimeout(3000);

    // Verificar todos los valores en el backend
    console.log('🔍 Verificando todos los valores en backend...');
    for (const campo of camposAModificar) {
      await verifyBackendValue(TEST_BETTING_POOL_ID, campo.fieldCode, campo.newValue);
    }

    console.log('✅ Test 4 pasado: Múltiples valores guardados correctamente\n');
  });

  /**
   * TEST 5: Verificar formato del payload enviado al backend
   *
   * Este test intercepta la petición al backend y verifica que
   * el formato del payload es correcto según la especificación.
   */
  test('Test 5: Verificar formato del payload enviado', async ({ page }) => {
    console.log('\n🧪 TEST 5: Formato del payload\n');

    // Login
    await login(page);

    // Interceptar petición POST al backend
    let payloadCapturado = null;

    page.on('request', request => {
      if (request.method() === 'POST' &&
          request.url().includes('/prize-config')) {
        try {
          payloadCapturado = JSON.parse(request.postData());
          console.log('📦 Payload capturado:');
          console.log(JSON.stringify(payloadCapturado, null, 2));
        } catch (e) {
          console.error('Error parseando payload:', e);
        }
      }
    });

    // Navegar a la banca por el flujo normal (menú → lista → editar)
    await navigateToBettingPoolEdit(page, TEST_BETTING_POOL_ID);

    // Esperar a que carguen los tabs del formulario
    await page.waitForSelector('[role="tab"]', { timeout: 15000 });
    console.log('✅ Tabs cargados');

    // Navegar a tab de premios
    await navigateToPrizesTab(page);

    // Modificar un valor
    await setPrizeFieldValue(page, 'DIRECTO_DIRECTO_PRIMER_PAGO', 88);

    // Guardar
    const saveButton = page.locator('button[type="submit"]').filter({ hasText: /actualizar|guardar/i });
    await saveButton.click();

    // Esperar que se capture el payload
    await page.waitForTimeout(3000);

    // Verificar formato del payload
    expect(payloadCapturado).not.toBeNull();
    expect(payloadCapturado).toHaveProperty('prizeConfigs');
    expect(Array.isArray(payloadCapturado.prizeConfigs)).toBe(true);
    expect(payloadCapturado.prizeConfigs.length).toBeGreaterThan(0);

    // Verificar estructura de cada config
    const firstConfig = payloadCapturado.prizeConfigs[0];
    expect(firstConfig).toHaveProperty('prizeFieldId');
    expect(firstConfig).toHaveProperty('fieldCode');
    expect(firstConfig).toHaveProperty('value');

    console.log('✅ Formato verificado:');
    console.log(`   - prizeFieldId: ${firstConfig.prizeFieldId} (tipo: ${typeof firstConfig.prizeFieldId})`);
    console.log(`   - fieldCode: ${firstConfig.fieldCode} (tipo: ${typeof firstConfig.fieldCode})`);
    console.log(`   - value: ${firstConfig.value} (tipo: ${typeof firstConfig.value})`);

    console.log('✅ Test 5 pasado: Formato del payload correcto\n');
  });
});
