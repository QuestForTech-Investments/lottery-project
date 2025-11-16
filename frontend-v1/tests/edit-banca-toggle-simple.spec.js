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

test.describe('Test Simple - Toggle enableTemporaryBalance', () => {
  test('debe guardar y mostrar correctamente el toggle usando banca ID 9', async ({ page }) => {
    console.log('=== TEST SIMPLE: enableTemporaryBalance con ID conocido ===');

    // PASO 1: Login
    console.log('PASO 1: Login...');
    await login(page);
    console.log('✓ Login exitoso');

    // PASO 2: Navegar DIRECTAMENTE a editar banca ID 9
    console.log('PASO 2: Navegando directamente a editar banca ID 9...');
    await page.goto('http://localhost:3000/bancas/editar/9');
    await page.waitForTimeout(3000); // Esperar a que cargue
    console.log('✓ Página de edición cargada');

    // PASO 3: Verificar que el nombre se cargó
    console.log('PASO 3: Verificando que datos cargaron...');
    const nameInput = await page.locator('input[name="name"]').first();
    await nameInput.waitFor({ timeout: 10000 });
    const nameValue = await nameInput.inputValue();
    console.log('✓ Banca cargada:', nameValue);

    if (!nameValue) {
      throw new Error('La banca no cargó correctamente');
    }

    // PASO 4: Navegar al tab de Configuración
    console.log('PASO 4: Abriendo tab de Configuración...');

    // Esperar a que los tabs estén disponibles
    await page.waitForSelector('.el-tabs__item', { timeout: 10000 });

    // Clic en el segundo tab (Configuración)
    const configTab = page.locator('.el-tabs__item').nth(1);
    await configTab.click();
    await page.waitForTimeout(2000);
    console.log('✓ Tab de configuración abierto');

    // PASO 5: Buscar el toggle enableTemporaryBalance
    console.log('PASO 5: Buscando toggle enableTemporaryBalance...');

    // Esperar a que el tab esté visible
    await page.waitForTimeout(1000);

    // Intentar múltiples selectores para encontrar el toggle
    let toggleCheckbox = null;
    let toggleFound = false;

    // Intentar por nombre
    toggleCheckbox = page.locator('input[name="enableTemporaryBalance"]').first();
    if (await toggleCheckbox.count() > 0) {
      toggleFound = true;
      console.log('✓ Toggle encontrado por nombre');
    }

    // Si no se encontró, buscar todos los checkboxes y contar
    if (!toggleFound) {
      const allCheckboxes = page.locator('input[type="checkbox"]');
      const count = await allCheckboxes.count();
      console.log(`Encontrados ${count} checkboxes en el tab`);

      // Mostrar información de cada checkbox
      for (let i = 0; i < count; i++) {
        const cb = allCheckboxes.nth(i);
        const name = await cb.getAttribute('name');
        const id = await cb.getAttribute('id');
        console.log(`  Checkbox ${i}: name="${name}", id="${id}"`);
      }

      // El toggle enableTemporaryBalance debería estar en uno de los checkboxes
      // Vamos a asumir que es el octavo checkbox (índice 7) basado en el orden del formulario
      toggleCheckbox = allCheckboxes.nth(7); // Ajustar este índice según sea necesario
      toggleFound = await toggleCheckbox.count() > 0;
    }

    if (!toggleFound) {
      console.error('❌ No se pudo encontrar el toggle enableTemporaryBalance');
      await page.screenshot({ path: 'test-results/toggle-not-found-simple.png', fullPage: true });
      throw new Error('Toggle enableTemporaryBalance no encontrado');
    }

    console.log('✓ Toggle localizado');

    // PASO 6: Leer estado inicial
    console.log('PASO 6: Leyendo estado inicial...');
    const initialState = await toggleCheckbox.isChecked();
    console.log(`✓ Estado inicial: ${initialState ? 'ACTIVADO' : 'DESACTIVADO'}`);

    // PASO 7: Cambiar estado
    console.log('PASO 7: Cambiando estado del toggle...');
    const targetState = !initialState;

    if (targetState) {
      await toggleCheckbox.check();
      console.log('✓ Toggle ACTIVADO');
    } else {
      await toggleCheckbox.uncheck();
      console.log('✓ Toggle DESACTIVADO');
    }

    // Verificar cambio en DOM
    const stateAfterChange = await toggleCheckbox.isChecked();
    expect(stateAfterChange).toBe(targetState);
    console.log(`✓ Cambio confirmado en DOM: ${stateAfterChange ? 'ACTIVADO' : 'DESACTIVADO'}`);

    // PASO 8: Guardar
    console.log('PASO 8: Guardando cambios...');
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    console.log('✓ Cambios guardados');

    // PASO 9: Verificar mensaje de éxito
    console.log('PASO 9: Verificando resultado...');
    const successMessage = page.locator('text=/exitosamente|success|guardado|actualizado/i');
    const hasSuccess = await successMessage.isVisible().catch(() => false);

    if (hasSuccess) {
      console.log('✅ Mensaje de éxito visible');
    } else {
      console.log('⚠️ No se vio mensaje de éxito, pero puede haber funcionado');
    }

    // PASO 10: Recargar página para verificar persistencia
    console.log('PASO 10: Recargando página para verificar persistencia...');
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:3000/bancas/editar/9');
    await page.waitForTimeout(3000);
    console.log('✓ Página recargada');

    // PASO 11: Volver a abrir tab de configuración
    console.log('PASO 11: Abriendo tab de Configuración nuevamente...');
    await page.waitForSelector('.el-tabs__item', { timeout: 10000 });
    const configTabReload = page.locator('.el-tabs__item').nth(1);
    await configTabReload.click();
    await page.waitForTimeout(2000);
    console.log('✓ Tab reabierto');

    // PASO 12: Verificar que el estado persiste
    console.log('PASO 12: Verificando que el estado persiste...');

    // Buscar toggle nuevamente
    const toggleCheckboxReload = page.locator('input[name="enableTemporaryBalance"]').first();
    let finalState;

    if (await toggleCheckboxReload.count() > 0) {
      finalState = await toggleCheckboxReload.isChecked();
    } else {
      // Si no se encuentra por nombre, usar el mismo índice que antes
      finalState = await page.locator('input[type="checkbox"]').nth(7).isChecked();
    }

    console.log(`✓ Estado después de recargar: ${finalState ? 'ACTIVADO' : 'DESACTIVADO'}`);
    console.log(`✓ Estado esperado: ${targetState ? 'ACTIVADO' : 'DESACTIVADO'}`);

    // VERIFICACIÓN FINAL
    expect(finalState).toBe(targetState);

    if (finalState === targetState) {
      console.log('✅ ¡ÉXITO! El toggle mantiene correctamente el estado guardado');
      console.log('✅ El backend está devolviendo enableTemporaryBalance correctamente');
      console.log('✅ El frontend está guardando y mostrando el valor correctamente');
    } else {
      console.error('❌ FALLO: El toggle NO mantiene el estado');
      console.error(`   Esperado: ${targetState}, Actual: ${finalState}`);
      await page.screenshot({ path: 'test-results/toggle-state-mismatch-simple.png', fullPage: true });
      throw new Error(`Toggle no persiste. Esperado: ${targetState}, Actual: ${finalState}`);
    }

    // PASO 13: Revertir al estado original
    console.log('PASO 13: Revirtiendo al estado original...');
    const toggleForRevert = page.locator('input[name="enableTemporaryBalance"]').first().count() > 0
      ? page.locator('input[name="enableTemporaryBalance"]').first()
      : page.locator('input[type="checkbox"]').nth(7);

    if (initialState) {
      await toggleForRevert.check();
    } else {
      await toggleForRevert.uncheck();
    }

    const saveButtonFinal = page.locator('button[type="submit"]').first();
    await saveButtonFinal.click();
    await page.waitForTimeout(2000);
    console.log('✓ Estado original restaurado');

    console.log('');
    console.log('🎉 ========================================');
    console.log('🎉   PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('🎉 ========================================');
  });
});
