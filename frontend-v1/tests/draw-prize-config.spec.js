import { test, expect } from '@playwright/test';

test.describe('Draw Prize Config - Per Draw Prize Configuration', () => {
  let bancaId;

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/inicio');
  });

  test('debe abrir modal de configuración de premios por sorteo', async ({ page }) => {
    console.log('Step 1: Navegar a lista de bancas');
    await page.goto('http://localhost:3000/bancas/lista');
    await page.waitForTimeout(2000);

    // Verificar que hay bancas en la lista
    const bancasCount = await page.locator('table tbody tr').count();
    console.log(`Bancas encontradas: ${bancasCount}`);

    if (bancasCount === 0) {
      console.log('No hay bancas creadas, saltando test');
      test.skip();
    }

    console.log('Step 2: Hacer clic en editar primera banca');
    // Hacer clic en el primer botón de editar
    await page.click('table tbody tr:first-child button:has-text("Editar")');
    await page.waitForTimeout(2000);

    console.log('Step 3: Navegar al tab Sorteos');
    // Ir al tab Sorteos
    await page.click('button:has-text("Sorteos")');
    await page.waitForTimeout(1000);

    console.log('Step 4: Seleccionar primer sorteo');
    // Seleccionar el primer sorteo disponible
    const firstLottery = page.locator('.sorteo-btn-label').first();
    await firstLottery.click();
    await page.waitForTimeout(500);

    console.log('Step 5: Buscar ícono de configuración ⚙️');
    // Verificar que aparece el ícono de configuración
    const configButton = page.locator('button:has-text("⚙️")').first();
    await expect(configButton).toBeVisible({ timeout: 5000 });

    console.log('Step 6: Hacer clic en ícono ⚙️');
    // Hacer clic en el ícono de configuración
    await configButton.click();
    await page.waitForTimeout(1000);

    console.log('Step 7: Verificar modal abierto');
    // Verificar que el modal se abre
    const modalOverlay = page.locator('.modal-overlay');
    await expect(modalOverlay).toBeVisible({ timeout: 5000 });

    // Verificar que el modal contiene el contenido esperado
    await expect(page.locator('h2:has-text("Configuración de Premios")')).toBeVisible();

    // Verificar que hay una tabla de premios
    await expect(page.locator('table')).toBeVisible();

    // Verificar que hay inputs para editar valores
    const prizeInputs = page.locator('input[type="number"]');
    const inputCount = await prizeInputs.count();
    console.log(`Campos de premio encontrados: ${inputCount}`);
    expect(inputCount).toBeGreaterThan(0);

    console.log('✅ Modal de configuración se abre correctamente');
  });

  test('debe permitir editar y guardar configuración de premios por sorteo', async ({ page }) => {
    console.log('Step 1: Navegar a lista de bancas');
    await page.goto('http://localhost:3000/bancas/lista');
    await page.waitForTimeout(2000);

    const bancasCount = await page.locator('table tbody tr').count();
    if (bancasCount === 0) {
      console.log('No hay bancas creadas, saltando test');
      test.skip();
    }

    console.log('Step 2: Editar primera banca');
    await page.click('table tbody tr:first-child button:has-text("Editar")');
    await page.waitForTimeout(2000);

    console.log('Step 3: Ir a tab Sorteos');
    await page.click('button:has-text("Sorteos")');
    await page.waitForTimeout(1000);

    console.log('Step 4: Seleccionar primer sorteo');
    const firstLottery = page.locator('.sorteo-btn-label').first();
    const lotteryName = await firstLottery.textContent();
    console.log(`Sorteo seleccionado: ${lotteryName}`);
    await firstLottery.click();
    await page.waitForTimeout(500);

    console.log('Step 5: Abrir modal de configuración');
    const configButton = page.locator('button:has-text("⚙️")').first();
    await configButton.click();
    await page.waitForTimeout(1000);

    console.log('Step 6: Esperar a que cargue la configuración');
    // Esperar a que termine de cargar
    await expect(page.locator('p:has-text("Cargando configuración")')).not.toBeVisible({ timeout: 10000 });

    console.log('Step 7: Modificar primer valor');
    // Obtener el primer input de premio
    const firstInput = page.locator('input[type="number"]').first();
    const originalValue = await firstInput.inputValue();
    console.log(`Valor original: ${originalValue}`);

    // Cambiar el valor
    const newValue = '99.50';
    await firstInput.fill(newValue);
    console.log(`Nuevo valor: ${newValue}`);

    console.log('Step 8: Guardar configuración');
    // Hacer clic en el botón Guardar
    await page.click('button:has-text("Guardar Configuración")');

    // Esperar a que se complete el guardado
    await page.waitForTimeout(2000);

    console.log('Step 9: Verificar que el modal se cierra');
    // El modal debería cerrarse después de guardar
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });

    console.log('Step 10: Verificar mensaje de éxito');
    // Debería mostrar un mensaje de éxito
    const successMessage = page.locator('.success-message, div:has-text("Configuración de premios guardada")');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    console.log('✅ Configuración guardada exitosamente');
  });

  test('debe mostrar badges de origen correctamente', async ({ page }) => {
    console.log('Step 1: Navegar y abrir modal');
    await page.goto('http://localhost:3000/bancas/lista');
    await page.waitForTimeout(2000);

    const bancasCount = await page.locator('table tbody tr').count();
    if (bancasCount === 0) {
      test.skip();
    }

    await page.click('table tbody tr:first-child button:has-text("Editar")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Sorteos")');
    await page.waitForTimeout(1000);

    const firstLottery = page.locator('.sorteo-btn-label').first();
    await firstLottery.click();
    await page.waitForTimeout(500);

    const configButton = page.locator('button:has-text("⚙️")').first();
    await configButton.click();
    await page.waitForTimeout(1000);

    console.log('Step 2: Esperar carga');
    await expect(page.locator('p:has-text("Cargando configuración")')).not.toBeVisible({ timeout: 10000 });

    console.log('Step 3: Verificar badges de origen');
    // Verificar que hay badges mostrando el origen de los valores
    const originBadges = page.locator('span:has-text("Sorteo"), span:has-text("Banca"), span:has-text("Sistema")');
    const badgesCount = await originBadges.count();
    console.log(`Badges de origen encontrados: ${badgesCount}`);
    expect(badgesCount).toBeGreaterThan(0);

    console.log('✅ Badges de origen se muestran correctamente');
  });
});
