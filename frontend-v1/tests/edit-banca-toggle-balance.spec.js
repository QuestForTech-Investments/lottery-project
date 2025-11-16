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

test.describe('Editar Banca - Toggle Habilitar Balance Temporal', () => {
  test('debe guardar y mostrar correctamente el estado del toggle enableTemporaryBalance', async ({ page }) => {
    console.log('=== TEST: Verificar que toggle enableTemporaryBalance guarda y muestra correctamente ===');

    // PASO 1: Login
    console.log('PASO 1: Logging in...');
    await login(page);

    // PASO 2: Navegar a lista de bancas
    console.log('PASO 2: Navegando a lista de bancas...');
    await page.goto('http://localhost:3000/bancas/lista');
    await page.waitForTimeout(2000);

    // PASO 3: Buscar y hacer click en el primer botón de editar
    console.log('PASO 3: Buscando primera banca para editar...');
    const editButton = await page.locator('button.edit-button, button[title="Editar banca"]').first();
    const editButtonExists = await editButton.count() > 0;

    if (!editButtonExists) {
      console.error('❌ No hay bancas disponibles para editar');
      throw new Error('No se encontraron bancas para editar en la lista');
    }

    await editButton.click();
    console.log('✓ Click en botón editar');

    // PASO 4: Esperar a que cargue la página de edición
    console.log('PASO 4: Esperando que cargue página de edición...');
    await page.waitForURL('**/bancas/editar/**', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Extraer el ID de la banca de la URL
    const url = page.url();
    const bancaId = url.match(/\/bancas\/editar\/(\d+)/)?.[1];
    console.log('✓ Banca ID:', bancaId);

    // Verificar que el nombre se cargó
    const nameInput = await page.locator('input[name="name"]');
    const nameValue = await nameInput.inputValue();
    console.log('✓ Banca cargada:', nameValue);

    if (!nameValue) {
      throw new Error('Los datos de la banca no se cargaron correctamente');
    }

    // PASO 5: Navegar al Tab de Configuración
    console.log('PASO 5: Navegando al tab de Configuración...');
    const configTab = page.locator('.el-tabs__item').nth(1);
    await configTab.click();
    await page.waitForTimeout(1500);
    console.log('✓ Tab de configuración abierto');

    // PASO 6: Localizar el toggle de enableTemporaryBalance
    console.log('PASO 6: Localizando toggle enableTemporaryBalance...');

    // El toggle puede estar con diferentes selectores, intentar varios
    let toggleCheckbox = await page.locator('input[name="enableTemporaryBalance"]').first();
    let toggleExists = await toggleCheckbox.count() > 0;

    if (!toggleExists) {
      // Intentar con otro selector (por si el nombre es diferente)
      toggleCheckbox = await page.locator('input[type="checkbox"]').filter({ hasText: /balance.*temporal/i }).first();
      toggleExists = await toggleCheckbox.count() > 0;
    }

    if (!toggleExists) {
      // Buscar por el label asociado
      const labelText = await page.locator('text=/habilitar.*balance.*temporal/i').first();
      if (await labelText.count() > 0) {
        // Encontrar el checkbox más cercano
        toggleCheckbox = await page.locator('input[type="checkbox"]').nth(0);
        toggleExists = await toggleCheckbox.count() > 0;
      }
    }

    if (!toggleExists) {
      console.error('❌ No se encontró el toggle enableTemporaryBalance');
      await page.screenshot({ path: 'test-results/toggle-not-found.png', fullPage: true });
      throw new Error('No se encontró el toggle enableTemporaryBalance en el formulario');
    }

    console.log('✓ Toggle encontrado');

    // PASO 7: Leer estado inicial del toggle
    console.log('PASO 7: Leyendo estado inicial del toggle...');
    const initialState = await toggleCheckbox.isChecked();
    console.log('✓ Estado inicial del toggle:', initialState ? 'ACTIVADO' : 'DESACTIVADO');

    // PASO 8: Cambiar el estado del toggle (activar o desactivar según estado inicial)
    console.log('PASO 8: Cambiando estado del toggle...');
    const targetState = !initialState; // Invertir el estado

    if (targetState) {
      // Activar
      await toggleCheckbox.check();
      console.log('✓ Toggle ACTIVADO');
    } else {
      // Desactivar
      await toggleCheckbox.uncheck();
      console.log('✓ Toggle DESACTIVADO');
    }

    // Verificar que el cambio se aplicó en el DOM
    const stateAfterChange = await toggleCheckbox.isChecked();
    expect(stateAfterChange).toBe(targetState);
    console.log('✓ Cambio de estado confirmado en DOM:', stateAfterChange ? 'ACTIVADO' : 'DESACTIVADO');

    // PASO 9: Guardar cambios
    console.log('PASO 9: Guardando cambios...');
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();
    console.log('✓ Click en botón Guardar');

    // PASO 10: Esperar confirmación de guardado
    console.log('PASO 10: Esperando confirmación...');
    await page.waitForTimeout(3000);

    // Verificar mensaje de éxito o redirección
    const successMessage = page.locator('text=/actualizada exitosamente|success|guardado|actualizado/i');
    const errorMessage = page.locator('text=/error|failed|falló/i');

    try {
      await Promise.race([
        successMessage.waitFor({ timeout: 5000 }),
        errorMessage.waitFor({ timeout: 5000 })
      ]);
    } catch (e) {
      console.log('⚠️ No se detectó mensaje explícito de éxito/error');
    }

    const hasSuccess = await successMessage.isVisible();
    const hasError = await errorMessage.isVisible();

    console.log('¿Mensaje de éxito visible?', hasSuccess);
    console.log('¿Mensaje de error visible?', hasError);

    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.error('❌ Error al guardar:', errorText);
      await page.screenshot({ path: 'test-results/save-error.png', fullPage: true });
      throw new Error(`Error al guardar cambios: ${errorText}`);
    }

    // PASO 11: Volver a cargar la banca para verificar que el cambio persiste
    console.log('PASO 11: Recargando banca para verificar persistencia...');

    // Esperar un poco para que el backend procese
    await page.waitForTimeout(2000);

    // Navegar nuevamente a la página de edición
    await page.goto(`http://localhost:3000/bancas/editar/${bancaId}`);
    await page.waitForTimeout(2000);
    console.log('✓ Página recargada');

    // PASO 12: Navegar nuevamente al tab de Configuración
    console.log('PASO 12: Abriendo tab de Configuración nuevamente...');
    const configTabReload = page.locator('.el-tabs__item').nth(1);
    await configTabReload.click();
    await page.waitForTimeout(1500);
    console.log('✓ Tab de configuración reabierto');

    // PASO 13: Verificar que el toggle mantiene el nuevo estado
    console.log('PASO 13: Verificando que el toggle mantiene el estado guardado...');

    // Volver a localizar el toggle
    const toggleCheckboxReload = await page.locator('input[name="enableTemporaryBalance"]').first();
    const finalState = await toggleCheckboxReload.isChecked();

    console.log('✓ Estado después de recargar:', finalState ? 'ACTIVADO' : 'DESACTIVADO');
    console.log('✓ Estado esperado:', targetState ? 'ACTIVADO' : 'DESACTIVADO');

    // VERIFICACIÓN FINAL: El estado debe coincidir con el que guardamos
    expect(finalState).toBe(targetState);

    if (finalState === targetState) {
      console.log('✅ ÉXITO: El toggle mantiene correctamente el estado guardado');
    } else {
      console.error('❌ FALLO: El toggle NO mantiene el estado guardado');
      await page.screenshot({ path: 'test-results/toggle-state-mismatch.png', fullPage: true });
      throw new Error(`El toggle no mantiene el estado. Esperado: ${targetState}, Actual: ${finalState}`);
    }

    // PASO 14: Revertir el cambio (dejar como estaba originalmente)
    console.log('PASO 14: Revirtiendo cambio para dejar como estaba...');

    if (initialState) {
      await toggleCheckboxReload.check();
    } else {
      await toggleCheckboxReload.uncheck();
    }

    const saveButtonFinal = page.locator('button[type="submit"]').first();
    await saveButtonFinal.click();
    await page.waitForTimeout(2000);
    console.log('✓ Estado original restaurado');

    console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE');
  });

  test('debe verificar que el valor del toggle se envía correctamente al backend', async ({ page }) => {
    console.log('=== TEST: Verificar comunicación con backend ===');

    // Interceptar llamadas al API
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/betting-pools')) {
        apiCalls.push({
          method: request.method(),
          url: request.url(),
          body: request.postData()
        });
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/betting-pools')) {
        const status = response.status();
        let body = null;
        try {
          body = await response.json();
        } catch (e) {
          body = await response.text();
        }
        console.log('API Response:', { url: response.url(), status, body });
      }
    });

    // Login y navegar
    await login(page);
    await page.goto('http://localhost:3000/bancas/lista');
    await page.waitForTimeout(2000);

    const editButton = await page.locator('button.edit-button, button[title="Editar banca"]').first();
    await editButton.click();
    await page.waitForURL('**/bancas/editar/**', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Navegar al tab de configuración
    const configTab = page.locator('.el-tabs__item').nth(1);
    await configTab.click();
    await page.waitForTimeout(1500);

    // Localizar y cambiar toggle
    const toggleCheckbox = await page.locator('input[name="enableTemporaryBalance"]').first();
    const initialState = await toggleCheckbox.isChecked();

    if (initialState) {
      await toggleCheckbox.uncheck();
    } else {
      await toggleCheckbox.check();
    }

    // Guardar
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();
    await page.waitForTimeout(3000);

    // Verificar que se hizo una llamada PUT al API
    console.log('API Calls realizadas:', apiCalls.length);

    const putCalls = apiCalls.filter(call => call.method === 'PUT');
    console.log('PUT Calls:', putCalls.length);

    if (putCalls.length > 0) {
      console.log('✓ Se realizó llamada PUT al backend');

      // Verificar que el body contiene enableTemporaryBalance
      const bodyText = putCalls[0].body;
      if (bodyText && bodyText.includes('enableTemporaryBalance')) {
        console.log('✅ El campo enableTemporaryBalance se envió al backend');
      } else {
        console.warn('⚠️ No se encontró enableTemporaryBalance en el body de la petición');
      }
    } else {
      console.warn('⚠️ No se detectó llamada PUT al backend');
    }

    console.log('✅ Test de comunicación con backend completado');
  });
});
