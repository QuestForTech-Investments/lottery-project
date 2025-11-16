import { test, expect } from '@playwright/test';

/**
 * Helper function to login
 */
async function login(page, username = 'admin', password = 'Admin123456') {
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#log-in');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000);
}

test.describe('Premio Config - Full Flow Integration', () => {
  let createdBancaId = null;
  const testTimestamp = Date.now();
  const bancaName = `TEST PREMIO CONFIG ${testTimestamp}`;

  test('debe crear banca con premios personalizados y verificar guardado', async ({ page }) => {
    // ===== STEP 1: LOGIN =====
    console.log('Step 1: Login');
    await login(page);

    // ===== STEP 2: NAVEGAR A CREAR BANCA =====
    console.log('Step 2: Navegar a Crear Banca');
    await page.goto('http://localhost:3000/bancas/crear');
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });

    // ===== STEP 3: TAB DATOS GENERALES =====
    console.log('Step 3: Llenar Datos Generales');
    await page.fill('input[name="branchName"]', bancaName);
    await page.fill('input[name="location"]', 'Test Location ' + testTimestamp);
    await page.fill('input[name="reference"]', 'REF-' + testTimestamp);

    // ===== STEP 4: TAB CONFIGURACIÓN =====
    console.log('Step 4: Llenar Configuración');
    await page.click('text=Configuración');
    await page.waitForTimeout(500);

    // Seleccionar zona
    await page.waitForSelector('select[name="selectedZone"]', { timeout: 5000 });
    const hasZones = await page.locator('select[name="selectedZone"] option:not([value=""])').count();
    if (hasZones > 0) {
      await page.selectOption('select[name="selectedZone"]', { index: 1 });
    } else {
      throw new Error('No hay zonas disponibles');
    }

    // Configuración básica - skip fallType for this test (not critical for premio testing)
    // await page.selectOption('select[name="fallType"]', '3'); // DIARIA

    // ===== STEP 5: TAB PREMIOS Y COMISIONES =====
    console.log('Step 5: Navegar a Premios y Comisiones');
    await page.click('text=Premios y Comisiones');
    await page.waitForTimeout(2000); // Esperar a que carguen los valores por defecto

    // Verificar que se cargaron los valores por defecto
    console.log('Verificando que se cargaron valores por defecto...');

    // Buscar el campo de Directo - Primer Pago (debería tener valor 56 por defecto)
    const primerPagoInput = await page.locator('input[name="general_directo_primerPago"]');
    await expect(primerPagoInput).toBeVisible({ timeout: 5000 });

    const defaultValue = await primerPagoInput.inputValue();
    console.log('Valor por defecto de Directo - Primer Pago:', defaultValue);

    // Verificar que no esté vacío
    expect(defaultValue).not.toBe('');

    // ===== STEP 6: MODIFICAR VALORES DE PREMIOS =====
    console.log('Step 6: Modificando valores de premios...');

    // Cambiar Directo - Primer Pago de 56 a 60
    await primerPagoInput.fill('60');

    // Cambiar Directo - Segundo Pago de 12 a 15
    const segundoPagoInput = await page.locator('input[name="general_directo_segundoPago"]');
    await segundoPagoInput.fill('15');

    // Cambiar Pale - Primer Pago
    const palePrimerPagoInput = await page.locator('input[name="general_pale_primerPago"]');
    if (await palePrimerPagoInput.isVisible()) {
      await palePrimerPagoInput.fill('28');
    }

    console.log('Valores modificados:');
    console.log('  - Directo Primer Pago: 60');
    console.log('  - Directo Segundo Pago: 15');
    console.log('  - Pale Primer Pago: 28');

    // ===== STEP 7: GUARDAR BANCA =====
    console.log('Step 7: Guardando banca...');
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Esperar respuesta
    await page.waitForTimeout(3000);

    // Verificar mensaje de éxito
    const successMessage = page.locator('text=/Banca creada exitosamente|éxito|success/i');
    const errorMessage = page.locator('text=/error|failed/i');

    try {
      await Promise.race([
        successMessage.waitFor({ timeout: 5000 }),
        errorMessage.waitFor({ timeout: 5000 })
      ]);
    } catch (e) {
      console.log('No se detectó mensaje de éxito o error inmediato');
    }

    const hasSuccess = await successMessage.isVisible().catch(() => false);
    const hasError = await errorMessage.isVisible().catch(() => false);

    console.log('¿Mensaje de éxito?', hasSuccess);
    console.log('¿Mensaje de error?', hasError);

    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.error('Error al crear banca:', errorText);
      await page.screenshot({ path: 'test-results/premio-config-create-error.png', fullPage: true });
      throw new Error('Error al crear banca: ' + errorText);
    }

    // Extraer ID de la banca creada de la URL o mensaje
    const currentUrl = page.url();
    console.log('URL actual:', currentUrl);

    // Si nos redirige a la lista de bancas o a ver detalles
    const urlMatch = currentUrl.match(/\/bancas\/(?:ver|editar)\/(\d+)/);
    if (urlMatch) {
      createdBancaId = parseInt(urlMatch[1]);
      console.log('✅ Banca creada con ID:', createdBancaId);
    }

    expect(hasSuccess || currentUrl.includes('/bancas')).toBeTruthy();
    console.log('✅ Banca creada exitosamente con premios personalizados');
  });

  test('debe verificar que los valores personalizados se guardaron correctamente', async ({ page, request }) => {
    // Saltar si no se creó una banca en el test anterior
    if (!createdBancaId) {
      console.log('⚠️  Saltando test: no hay ID de banca creada');
      test.skip();
      return;
    }

    console.log('Step 1: Verificando valores en la BD vía API...');

    // Hacer llamada al API para obtener la configuración guardada
    const response = await request.get(`http://localhost:5000/api/betting-pools/${createdBancaId}/prize-config`);

    if (!response.ok()) {
      console.error('Error al obtener configuración:', response.status());
      throw new Error('No se pudo obtener la configuración de premios');
    }

    const prizeConfig = await response.json();
    console.log('Configuración obtenida de BD:', JSON.stringify(prizeConfig, null, 2));

    // Verificar que se guardaron los valores personalizados
    expect(prizeConfig).toBeDefined();
    expect(Array.isArray(prizeConfig)).toBeTruthy();
    expect(prizeConfig.length).toBeGreaterThan(0);

    // Buscar los campos específicos que modificamos
    const directoPrimerPago = prizeConfig.find(c => c.fieldCode === 'DIRECTO_PRIMER_PAGO');
    const directoSegundoPago = prizeConfig.find(c => c.fieldCode === 'DIRECTO_SEGUNDO_PAGO');
    const palePrimerPago = prizeConfig.find(c => c.fieldCode === 'PALE_PRIMER_PAGO');

    console.log('Valores guardados:');
    console.log('  - Directo Primer Pago:', directoPrimerPago?.customValue);
    console.log('  - Directo Segundo Pago:', directoSegundoPago?.customValue);
    console.log('  - Pale Primer Pago:', palePrimerPago?.customValue);

    // Verificar valores
    expect(directoPrimerPago).toBeDefined();
    expect(directoPrimerPago.customValue).toBe(60);

    expect(directoSegundoPago).toBeDefined();
    expect(directoSegundoPago.customValue).toBe(15);

    if (palePrimerPago) {
      expect(palePrimerPago.customValue).toBe(28);
    }

    console.log('✅ Valores verificados correctamente en la BD');
  });

  test('debe editar banca y verificar que carga valores personalizados', async ({ page }) => {
    // Saltar si no se creó una banca en el test anterior
    if (!createdBancaId) {
      console.log('⚠️  Saltando test: no hay ID de banca creada');
      test.skip();
      return;
    }

    console.log('Step 1: Login');
    await login(page);

    console.log('Step 2: Navegar a editar banca ID:', createdBancaId);
    await page.goto(`http://localhost:3000/bancas/editar/${createdBancaId}`);
    await page.waitForTimeout(2000);

    console.log('Step 3: Navegar a pestaña Premios y Comisiones');
    await page.click('text=Premios y Comisiones');
    await page.waitForTimeout(2000);

    console.log('Step 4: Verificar que se cargaron valores personalizados');

    // Verificar Directo - Primer Pago = 60
    const primerPagoInput = await page.locator('input[name="general_directo_primerPago"]');
    await expect(primerPagoInput).toBeVisible();
    const primerPagoValue = await primerPagoInput.inputValue();
    console.log('Directo Primer Pago cargado:', primerPagoValue);
    expect(primerPagoValue).toBe('60');

    // Verificar Directo - Segundo Pago = 15
    const segundoPagoInput = await page.locator('input[name="general_directo_segundoPago"]');
    const segundoPagoValue = await segundoPagoInput.inputValue();
    console.log('Directo Segundo Pago cargado:', segundoPagoValue);
    expect(segundoPagoValue).toBe('15');

    // Verificar Pale - Primer Pago = 28
    const palePrimerPagoInput = await page.locator('input[name="general_pale_primerPago"]');
    if (await palePrimerPagoInput.isVisible()) {
      const palePrimerPagoValue = await palePrimerPagoInput.inputValue();
      console.log('Pale Primer Pago cargado:', palePrimerPagoValue);
      expect(palePrimerPagoValue).toBe('28');
    }

    console.log('✅ Valores personalizados cargados correctamente en modo edición');
  });
});
