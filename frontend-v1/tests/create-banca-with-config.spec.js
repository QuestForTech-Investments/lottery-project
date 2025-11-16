import { test, expect } from '@playwright/test';

/**
 * Helper function to login (based on create-banca-test.spec.js)
 */
async function login(page, username = 'admin', password = 'Admin123456') {
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#log-in');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000); // Extra wait for UI to settle
}

test.describe('Crear Banca con Configuración', () => {
  test('debe crear una banca con configuración completa', async ({ page }) => {
    // 1. Login
    console.log('Step 1: Logging in...');
    await login(page);

    // 2. Navegar al formulario de Crear Banca
    console.log('Step 2: Navigating to Create Banca form...');
    await page.goto('http://localhost:3000/bancas/crear');

    // 3. Esperar a que cargue el formulario
    await page.waitForSelector('input[name="branchName"]', { timeout: 5000 });

    // ===== TAB 1: DATOS GENERALES =====
    console.log('Llenando Tab 1: Datos Generales');

    // Nombre de la banca (campo obligatorio)
    await page.fill('input[name="branchName"]', 'BANCA TEST CONFIG ' + Date.now());

    // Ubicación
    await page.fill('input[name="location"]', 'Test Location ' + Date.now());

    // Referencia
    await page.fill('input[name="reference"]', 'REF-' + Date.now());

    // ===== TAB 2: CONFIGURACIÓN =====
    console.log('Navegando a Tab 2: Configuración');

    // Click en el tab de Configuración
    await page.click('text=Configuración');

    // Esperar a que se muestre el contenido del tab
    await page.waitForTimeout(500);

    // Seleccionar zona (campo obligatorio) - primero verificar que haya zonas
    await page.waitForSelector('select[name="selectedZone"]', { timeout: 5000 });
    const hasZones = await page.locator('select[name="selectedZone"] option:not([value=""])').count();
    if (hasZones > 0) {
      await page.selectOption('select[name="selectedZone"]', { index: 1 });
    } else {
      throw new Error('No hay zonas disponibles para seleccionar');
    }

    // Tipo de caída (select)
    const fallTypeSelect = await page.locator('select[name="fallType"]');
    if (await fallTypeSelect.isVisible()) {
      await fallTypeSelect.selectOption('3'); // DIARIA
    }

    // Balance de desactivación
    const deactivationBalanceInput = await page.locator('input[name="deactivationBalance"]');
    if (await deactivationBalanceInput.isVisible()) {
      await deactivationBalanceInput.fill('2000');
    }

    // Límite de venta diaria
    const dailySaleLimitInput = await page.locator('input[name="dailySaleLimit"]');
    if (await dailySaleLimitInput.isVisible()) {
      await dailySaleLimitInput.fill('8000');
    }

    // Límite de balance diario
    const todayBalanceLimitInput = await page.locator('input[name="todayBalanceLimit"]');
    if (await todayBalanceLimitInput.isVisible()) {
      await todayBalanceLimitInput.fill('15000');
    }

    // Límite de crédito
    const creditLimitInput = await page.locator('input[name="creditLimit"]');
    if (await creditLimitInput.isVisible()) {
      await creditLimitInput.fill('1000');
    }

    // Minutos para cancelar ticket
    const minutesToCancelInput = await page.locator('input[name="minutesToCancelTicket"]');
    if (await minutesToCancelInput.isVisible()) {
      await minutesToCancelInput.fill('45');
    }

    // Proveedor de descuento (radio button o select)
    const discountProviderRadio = await page.locator('input[name="discountProvider"][value="2"]'); // RIFERO
    if (await discountProviderRadio.isVisible()) {
      await discountProviderRadio.check();
    }

    // Modo de descuento (radio button o select)
    const discountModeRadio = await page.locator('input[name="discountMode"][value="2"]'); // EFECTIVO
    if (await discountModeRadio.isVisible()) {
      await discountModeRadio.check();
    }

    // Tipo de impresora (radio button o select)
    const printerTypeRadio = await page.locator('input[name="printerType"][value="2"]'); // GENERICO
    if (await printerTypeRadio.isVisible()) {
      await printerTypeRadio.check();
    }

    // Checkboxes de impresión
    const printTicketsCheckbox = await page.locator('input[name="printTickets"]');
    if (await printTicketsCheckbox.isVisible() && !(await printTicketsCheckbox.isChecked())) {
      await printTicketsCheckbox.check();
    }

    // ===== SUBMIT =====
    console.log('Haciendo submit del formulario...');

    // Buscar el botón de submit (puede ser "Crear Banca" o "Guardar")
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // ===== VERIFICACIÓN =====
    console.log('Verificando resultado...');

    // Esperar a que aparezca el mensaje de éxito o error
    await page.waitForTimeout(2000);

    // Verificar si hay mensaje de éxito
    const successMessage = page.locator('text=/Banca creada exitosamente|success/i');
    const errorMessage = page.locator('text=/error|failed/i');

    // Esperar a que aparezca alguno de los dos
    try {
      await Promise.race([
        successMessage.waitFor({ timeout: 5000 }),
        errorMessage.waitFor({ timeout: 5000 })
      ]);
    } catch (e) {
      console.log('No se detectó mensaje de éxito o error, verificando estado del formulario...');
    }

    // Verificar que se creó exitosamente
    const hasSuccess = await successMessage.isVisible();
    const hasError = await errorMessage.isVisible();

    console.log('¿Tiene mensaje de éxito?', hasSuccess);
    console.log('¿Tiene mensaje de error?', hasError);

    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.error('Error al crear banca:', errorText);

      // Tomar screenshot del error
      await page.screenshot({ path: 'test-results/create-banca-error.png', fullPage: true });
    }

    // Assertion: debe haber mensaje de éxito y no de error
    expect(hasSuccess).toBeTruthy();
    expect(hasError).toBeFalsy();

    console.log('✅ Prueba completada exitosamente!');
  });
});
