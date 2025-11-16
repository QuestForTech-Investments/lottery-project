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

test.describe('Edición de Premio Directo - Primera Línea', () => {
  test('Debe permitir cambiar el valor de Directo Primer Pago de 56 a 54 y persistirlo', async ({ page }) => {
    // 1. Login
    console.log('PASO 1: Login...');
    await login(page);
    console.log('✅ Login exitoso');

    // 2. Navegar directamente a editar banca ID 9
    console.log('PASO 2: Navegando a editar banca ID 9...');
    const bancaId = '9';
    await page.goto(`http://localhost:3000/bancas/editar/${bancaId}`);
    await page.waitForTimeout(3000);
    console.log('✅ Página de edición cargada');

    // 3. Ir al tab "Premios & Comisiones"
    console.log('PASO 3: Abriendo tab Premios & Comisiones...');
    await page.click('button:has-text("Premios & Comisiones")');
    await page.waitForTimeout(2000);
    console.log('✅ Tab abierto');

    // 4. Encontrar el campo "Directo - Primer Pago" por su input name
    console.log('PASO 4: Localizando campo Directo - Primer Pago...');
    const input = page.locator('input[name="general_directo_primerPago"]');
    await input.waitFor({ timeout: 10000 });
    console.log('✅ Campo encontrado');

    // 8. Verificar valor actual y cambiarlo
    const currentValue = await input.inputValue();
    console.log('Valor actual:', currentValue);

    await input.clear();
    await input.fill('54');
    await page.waitForTimeout(500);

    const newValue = await input.inputValue();
    console.log('Nuevo valor ingresado:', newValue);
    expect(newValue).toBe('54');

    // 9. Guardar los cambios
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();
    await page.waitForTimeout(3000);

    // 10. Verificar en la API que el valor cambió
    console.log('PASO 11: Verificando cambios en la API...');
    const apiResponse = await page.request.get(`http://localhost:5000/api/betting-pools/${bancaId}/prize-config`);
    expect(apiResponse.ok()).toBeTruthy();

    const savedConfig = await apiResponse.json();
    console.log('Configuración guardada en API:', savedConfig);

    // Buscar el campo DIRECTO_PRIMER_PAGO en la respuesta
    const directoPrimerPago = savedConfig.find(config => config.fieldCode === 'DIRECTO_PRIMER_PAGO');
    expect(directoPrimerPago).toBeDefined();
    expect(directoPrimerPago.customValue).toBe(54);
    console.log('✅ Valor verificado en API:', directoPrimerPago.customValue);

    // 12. Navegar nuevamente a editar la misma banca para verificar que el valor persiste
    console.log('PASO 12: Recargando página de edición para verificar persistencia...');
    await page.goto(`http://localhost:3000/bancas/editar/${bancaId}`);
    await page.waitForTimeout(3000);
    console.log('✅ Página de edición recargada');

    // 13. Ir nuevamente al tab "Premios & Comisiones"
    console.log('PASO 13: Abriendo tab Premios & Comisiones nuevamente...');
    await page.click('button:has-text("Premios & Comisiones")');
    await page.waitForTimeout(2000);
    console.log('✅ Tab abierto');

    // 14. Verificar que el valor se muestra correctamente
    console.log('PASO 14: Verificando que el valor persiste en el formulario...');
    const input2 = page.locator('input[name="general_directo_primerPago"]');
    await input2.waitFor({ timeout: 10000 });

    const displayedValue = await input2.inputValue();
    console.log('Valor mostrado después de recargar:', displayedValue);
    expect(displayedValue).toBe('54');

    console.log('✅ Test completado exitosamente');
  });
});
