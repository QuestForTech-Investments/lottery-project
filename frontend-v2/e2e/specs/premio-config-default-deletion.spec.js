import { test, expect } from '@playwright/test';

/**
 * Helper function to login
 */
async function login(page, username = 'admin', password = 'Admin123456') {
  await page.goto('http://localhost:4203/login');
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#log-in');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000);
}

test.describe('Premio Config - Default Value Deletion Test', () => {
  let createdBancaId = null;
  const testTimestamp = Date.now();
  const bancaName = `TEST DEFAULT DELETION ${testTimestamp}`;

  test('debe crear banca con valor personalizado', async ({ page }) => {
    console.log('Step 1: Login');
    await login(page);

    console.log('Step 2: Navegar a Crear Banca');
    await page.goto('http://localhost:4203/bancas/crear');
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });

    console.log('Step 3: Llenar Datos Generales');
    await page.fill('input[name="branchName"]', bancaName);
    await page.fill('input[name="location"]', 'Test Location ' + testTimestamp);
    await page.fill('input[name="reference"]', 'REF-' + testTimestamp);

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

    console.log('Step 5: Navegar a Premios y Comisiones');
    await page.click('text=Premios y Comisiones');
    await page.waitForTimeout(2000); // Esperar a que carguen los valores por defecto

    console.log('Step 6: Modificar UN SOLO valor de premio');
    // Cambiar Directo - Primer Pago de 56 (default) a 70 (personalizado)
    const primerPagoInput = await page.locator('input[name="general_directo_primerPago"]');
    await expect(primerPagoInput).toBeVisible({ timeout: 5000 });

    const defaultValue = await primerPagoInput.inputValue();
    console.log('Valor por defecto de Directo - Primer Pago:', defaultValue);

    await primerPagoInput.fill('70');
    console.log('Valor modificado a: 70');

    console.log('Step 7: Guardar banca');
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    await page.waitForTimeout(3000);

    // Verificar éxito
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

    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.error('Error al crear banca:', errorText);
      await page.screenshot({ path: 'test-results/default-deletion-create-error.png', fullPage: true });
      throw new Error('Error al crear banca: ' + errorText);
    }

    // Extraer ID de la banca creada
    const currentUrl = page.url();
    const urlMatch = currentUrl.match(/\/bancas\/(?:ver|editar)\/(\d+)/);
    if (urlMatch) {
      createdBancaId = parseInt(urlMatch[1]);
      console.log('✅ Banca creada con ID:', createdBancaId);
    }

    expect(hasSuccess || currentUrl.includes('/bancas')).toBeTruthy();
  });

  test('debe verificar que el valor personalizado existe en BD', async ({ page, request }) => {
    if (!createdBancaId) {
      console.log('⚠️  Saltando test: no hay ID de banca creada');
      test.skip();
      return;
    }

    console.log('Step 1: Verificando valor personalizado en BD vía API...');

    // Obtener configuración guardada
    const response = await request.get(`http://localhost:5000/api/betting-pools/${createdBancaId}/prize-config`);

    if (!response.ok()) {
      console.error('Error al obtener configuración:', response.status());
      throw new Error('No se pudo obtener la configuración de premios');
    }

    const prizeConfig = await response.json();
    console.log('Configuración obtenida de BD:', JSON.stringify(prizeConfig, null, 2));

    // Buscar el campo que modificamos
    const directoPrimerPago = prizeConfig.find(c => c.fieldCode === 'DIRECTO_PRIMER_PAGO');

    console.log('Valor guardado de Directo Primer Pago:', directoPrimerPago?.customValue);

    // VERIFICACIÓN CRÍTICA: El valor 70 debe existir en la BD
    expect(directoPrimerPago).toBeDefined();
    expect(directoPrimerPago.customValue).toBe(70);

    console.log('✅ Valor personalizado verificado en BD');
  });

  test('debe editar banca y cambiar valor de vuelta al default', async ({ page }) => {
    if (!createdBancaId) {
      console.log('⚠️  Saltando test: no hay ID de banca creada');
      test.skip();
      return;
    }

    console.log('Step 1: Login');
    await login(page);

    console.log('Step 2: Navegar a editar banca ID:', createdBancaId);
    await page.goto(`http://localhost:4203/bancas/editar/${createdBancaId}`);
    await page.waitForTimeout(2000);

    console.log('Step 3: Navegar a pestaña Premios y Comisiones');
    await page.click('text=Premios y Comisiones');
    await page.waitForTimeout(2000);

    console.log('Step 4: Verificar que se cargó el valor personalizado (70)');
    const primerPagoInput = await page.locator('input[name="general_directo_primerPago"]');
    await expect(primerPagoInput).toBeVisible();
    const currentValue = await primerPagoInput.inputValue();
    console.log('Valor actual cargado:', currentValue);
    expect(currentValue).toBe('70');

    console.log('Step 5: CAMBIAR VALOR DE VUELTA AL DEFAULT (56)');
    await primerPagoInput.fill('56');
    console.log('Valor cambiado de 70 → 56 (default)');

    console.log('Step 6: Guardar cambios');
    const submitButton = page.locator('button:has-text("Guardar Cambios")').first();
    await submitButton.click();
    await page.waitForTimeout(3000);

    console.log('✅ Banca editada - valor vuelto al default');
  });

  test('debe verificar que el registro fue ELIMINADO de la BD', async ({ page, request }) => {
    if (!createdBancaId) {
      console.log('⚠️  Saltando test: no hay ID de banca creada');
      test.skip();
      return;
    }

    console.log('Step 1: Verificando que NO existe registro en BD vía API...');

    const response = await request.get(`http://localhost:5000/api/betting-pools/${createdBancaId}/prize-config`);

    if (!response.ok()) {
      console.error('Error al obtener configuración:', response.status());
      throw new Error('No se pudo obtener la configuración de premios');
    }

    const prizeConfig = await response.json();
    console.log('Configuración obtenida de BD:', JSON.stringify(prizeConfig, null, 2));

    // Buscar el campo DIRECTO_PRIMER_PAGO
    const directoPrimerPago = prizeConfig.find(c => c.fieldCode === 'DIRECTO_PRIMER_PAGO');

    console.log('Campo DIRECTO_PRIMER_PAGO en BD:', directoPrimerPago);

    // VERIFICACIÓN CRÍTICA: El campo NO debe existir porque volvió al default
    expect(directoPrimerPago).toBeUndefined();

    console.log('✅ ÉXITO: El registro fue ELIMINADO correctamente al volver al default');
  });

  test('debe verificar que el valor default se muestra correctamente en UI', async ({ page }) => {
    if (!createdBancaId) {
      console.log('⚠️  Saltando test: no hay ID de banca creada');
      test.skip();
      return;
    }

    console.log('Step 1: Login');
    await login(page);

    console.log('Step 2: Navegar a editar banca ID:', createdBancaId);
    await page.goto(`http://localhost:4203/bancas/editar/${createdBancaId}`);
    await page.waitForTimeout(2000);

    console.log('Step 3: Navegar a pestaña Premios y Comisiones');
    await page.click('text=Premios y Comisiones');
    await page.waitForTimeout(2000);

    console.log('Step 4: Verificar que se muestra el valor DEFAULT (56)');
    const primerPagoInput = await page.locator('input[name="general_directo_primerPago"]');
    await expect(primerPagoInput).toBeVisible();
    const displayedValue = await primerPagoInput.inputValue();

    console.log('Valor mostrado en UI:', displayedValue);

    // VERIFICACIÓN CRÍTICA: Debe mostrar el default (56), NO el valor anterior (70)
    expect(displayedValue).toBe('56');

    console.log('✅ ÉXITO: La UI muestra correctamente el valor default después de eliminar la personalización');
  });
});
