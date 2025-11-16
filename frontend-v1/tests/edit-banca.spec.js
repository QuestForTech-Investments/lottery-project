import { test, expect } from '@playwright/test';

/**
 * Helper function to login (same as create-banca-with-config.spec.js)
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

test.describe('Editar Banca', () => {
  test('debe cargar y guardar cambios en configuración de banca existente', async ({ page }) => {
    // 1. Login
    console.log('Step 1: Logging in...');
    await login(page);

    // 2. Navegar a lista de bancas
    console.log('Step 2: Navigating to Bancas list...');
    await page.goto('http://localhost:3000/bancas/lista');

    // Esperar a que cargue la lista
    await page.waitForTimeout(2000);

    // 3. Buscar el primer botón de editar
    console.log('Step 3: Finding first banca to edit...');

    // Intentar encontrar el botón de editar - puede ser un button con clase edit-button o un botón con título "Editar banca"
    const editButton = await page.locator('button.edit-button, button[title="Editar banca"]').first();

    // Verificar que existe al menos una banca para editar
    const editButtonExists = await editButton.count() > 0;
    if (!editButtonExists) {
      console.log('❌ No hay bancas disponibles para editar');
      throw new Error('No se encontraron bancas para editar en la lista');
    }

    // 4. Hacer click en el botón de editar
    console.log('Step 4: Clicking edit button...');
    await editButton.click();

    // 5. Esperar a que cargue la página de edición
    console.log('Step 5: Waiting for edit page to load...');
    await page.waitForURL('**/bancas/editar/**', { timeout: 10000 });
    await page.waitForTimeout(2000); // Esperar a que carguen los datos

    // 6. Verificar que los datos se cargaron
    console.log('Step 6: Verifying data loaded...');

    // Verificar que el campo nombre tiene algún valor (datos cargados)
    const nameInput = await page.locator('input[name="name"]');
    const nameValue = await nameInput.inputValue();
    console.log('Banca cargada:', nameValue);

    if (!nameValue) {
      throw new Error('Los datos de la banca no se cargaron correctamente');
    }

    // 7. Navegar al Tab de Configuración
    console.log('Step 7: Navigating to Configuration tab...');

    // Buscar el tab de Configuración (puede ser el segundo tab)
    const configTab = page.locator('.el-tabs__item').nth(1); // Tab index 1
    await configTab.click();
    await page.waitForTimeout(1000); // Esperar a que cargue el tab

    // 8. Modificar campos de configuración
    console.log('Step 8: Modifying configuration fields...');

    // Modificar balance de desactivación
    const deactivationBalanceInput = await page.locator('input[name="deactivationBalance"]');
    if (await deactivationBalanceInput.isVisible()) {
      await deactivationBalanceInput.fill('5000');
      console.log('✓ Balance de desactivación actualizado a 5000');
    }

    // Modificar límite de venta diaria
    const dailySaleLimitInput = await page.locator('input[name="dailySaleLimit"]');
    if (await dailySaleLimitInput.isVisible()) {
      await dailySaleLimitInput.fill('10000');
      console.log('✓ Límite de venta diaria actualizado a 10000');
    }

    // Modificar límite de balance diario
    const todayBalanceLimitInput = await page.locator('input[name="todayBalanceLimit"]');
    if (await todayBalanceLimitInput.isVisible()) {
      await todayBalanceLimitInput.fill('15000');
      console.log('✓ Límite de balance diario actualizado a 15000');
    }

    // Modificar límite de crédito
    const creditLimitInput = await page.locator('input[name="creditLimit"]');
    if (await creditLimitInput.isVisible()) {
      await creditLimitInput.fill('2000');
      console.log('✓ Límite de crédito actualizado a 2000');
    }

    // Modificar minutos para cancelar ticket
    const minutesToCancelInput = await page.locator('input[name="minutesToCancelTicket"]');
    if (await minutesToCancelInput.isVisible()) {
      await minutesToCancelInput.fill('60');
      console.log('✓ Minutos para cancelar actualizado a 60');
    }

    // Cambiar tipo de caída a DIARIA
    const fallTypeDiariaRadio = await page.locator('input[name="fallType"][value="3"]');
    if (await fallTypeDiariaRadio.isVisible()) {
      await fallTypeDiariaRadio.check();
      console.log('✓ Tipo de caída cambiado a DIARIA');
    }

    // Cambiar modo de descuento a EFECTIVO
    const discountModeEfectivoRadio = await page.locator('input[name="discountMode"][value="2"]');
    if (await discountModeEfectivoRadio.isVisible()) {
      await discountModeEfectivoRadio.check();
      console.log('✓ Modo de descuento cambiado a EFECTIVO');
    }

    // Activar control de tickets ganadores
    const winningTicketsControlCheckbox = await page.locator('input[name="winningTicketsControl"]');
    if (await winningTicketsControlCheckbox.isVisible()) {
      const isChecked = await winningTicketsControlCheckbox.isChecked();
      if (!isChecked) {
        await winningTicketsControlCheckbox.check();
        console.log('✓ Control de tickets ganadores activado');
      }
    }

    // 9. Guardar los cambios
    console.log('Step 9: Saving changes...');

    // Buscar botón de guardar (puede ser "Guardar", "Actualizar", "Guardar Cambios", etc.)
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();

    // 9. Verificar resultado
    console.log('Step 9: Verifying result...');

    // Esperar mensaje de éxito o error
    await page.waitForTimeout(3000);

    // Verificar si hay mensaje de éxito
    const successMessage = page.locator('text=/actualizada exitosamente|success|guardado|actualizado/i');
    const errorMessage = page.locator('text=/error|failed|falló/i');

    // Esperar a que aparezca alguno de los dos mensajes
    try {
      await Promise.race([
        successMessage.waitFor({ timeout: 5000 }),
        errorMessage.waitFor({ timeout: 5000 })
      ]);
    } catch (e) {
      console.log('⚠️ No se detectó mensaje de éxito o error explícito');
      // Verificar si fue redirigido a la lista (indica éxito)
      const currentUrl = page.url();
      if (currentUrl.includes('/bancas/lista')) {
        console.log('✅ Redirigido a lista de bancas (indica éxito)');
      }
    }

    const hasSuccess = await successMessage.isVisible();
    const hasError = await errorMessage.isVisible();

    console.log('¿Tiene mensaje de éxito?', hasSuccess);
    console.log('¿Tiene mensaje de error?', hasError);

    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.error('❌ Error al actualizar banca:', errorText);

      // Tomar screenshot del error
      await page.screenshot({ path: 'test-results/edit-banca-error.png', fullPage: true });
    }

    // Assertion: debe haber mensaje de éxito y no de error
    // O estar en la página de lista (redirección después de éxito)
    const currentUrl = page.url();
    const isInListPage = currentUrl.includes('/bancas/lista');

    if (!hasSuccess && !isInListPage) {
      // Si no hay mensaje de éxito ni está en la lista, debe ser un error
      expect(hasError).toBeFalsy();
      throw new Error('No se detectó éxito en la actualización');
    }

    // Si hay mensaje de éxito, no debe haber error
    if (hasSuccess) {
      expect(hasError).toBeFalsy();
    }

    console.log('✅ Prueba de edición completada exitosamente!');
  });
});
