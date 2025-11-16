import { test, expect } from '@playwright/test';

/**
 * TEST SIMPLE - Persistencia de Premios
 *
 * Prueba que los valores de premios se guarden y persistan correctamente:
 * 1. Editar una banca existente
 * 2. Modificar valores de premios
 * 3. Guardar
 * 4. Verificar que los valores persisten después de recargar
 */

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

/**
 * Helper para esperar el campo de premios usando fieldCode
 */
async function waitForPrizeField(page, fieldCode) {
  const selector = `input[name="${fieldCode}"]`;
  await page.waitForSelector(selector, { timeout: 5000 });
  const input = page.locator(selector);
  await input.scrollIntoViewIfNeeded();
  return input;
}

test.describe('Persistencia de Premios - Test Simple', () => {

  test('Editar banca existente y verificar persistencia de valores', async ({ page }) => {
    test.setTimeout(90000); // 1.5 minutos

    // ============================================================
    // PARTE 1: LOGIN
    // ============================================================
    console.log('\n📍 PARTE 1: LOGIN');
    await login(page);
    console.log('✅ Login exitoso\n');

    // ============================================================
    // PARTE 2: BUSCAR Y EDITAR BANCA EXISTENTE
    // ============================================================
    console.log('📍 PARTE 2: BUSCAR BANCA EXISTENTE');
    await page.goto('http://localhost:3000/bancas/lista');
    await page.waitForTimeout(2000);

    // Buscar el primer botón de editar
    const editButton = page.locator('button.edit-button, button[title="Editar banca"]').first();

    // Verificar que existe al menos una banca para editar
    const editButtonExists = await editButton.count() > 0;
    if (!editButtonExists) {
      console.log('  ❌ No hay bancas disponibles para editar');
      throw new Error('No se encontraron bancas para editar en la lista');
    }

    console.log('  ✅ Banca encontrada, haciendo click en editar...');

    // Click en el botón de editar
    await editButton.click();

    // Esperar a que cargue la página de edición
    await page.waitForURL('**/bancas/editar/**', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Obtener el nombre de la banca para referencia
    const branchName = await page.locator('h1, h2, .branch-name, .banca-nombre').first().textContent().catch(() => 'Banca desconocida');
    console.log(`  📝 Editando: ${branchName}`);

    // ============================================================
    // PARTE 3: NAVEGAR A TAB DE PREMIOS & COMISIONES
    // ============================================================
    console.log('\n📍 PARTE 3: NAVEGAR A TAB DE PREMIOS & COMISIONES');

    // Click en el tab correcto "Premios & Comisiones" (NO "Premios" solo)
    await page.click('button:has-text("Premios & Comisiones")');
    await page.waitForTimeout(2000);

    // DEBUG: Tomar screenshot para ver qué hay en la página
    await page.screenshot({ path: 'test-results/debug-premios-tab.png' });
    console.log('  📸 Screenshot guardado en test-results/debug-premios-tab.png')

    // DEBUG: Ver todos los inputs disponibles en la página
    const allInputs = await page.locator('input').all();
    console.log(`  🔍 Total de inputs en la página: ${allInputs.length}`);

    const firstTenInputs = [];
    for (let i = 0; i < Math.min(allInputs.length, 15); i++) {
      const name = await allInputs[i].getAttribute('name');
      const type = await allInputs[i].getAttribute('type');
      const isVisible = await allInputs[i].isVisible();
      firstTenInputs.push(`name="${name}" type="${type}" visible=${isVisible}`);
    }
    console.log('  🔍 Primeros 15 inputs:');
    firstTenInputs.forEach((info, idx) => console.log(`    ${idx + 1}. ${info}`));

    // DEBUG: Verificar si existe el contenedor de premios
    const premiosGrid = page.locator('.premios-grid, .premio-group, .prize-fields');
    const premiosGridCount = await premiosGrid.count();
    console.log(`  📦 Contenedores de premios encontrados: ${premiosGridCount}`);
    if (premiosGridCount > 0) {
      const isGridVisible = await premiosGrid.first().isVisible();
      console.log(`  📦 Primer contenedor visible: ${isGridVisible}`);
    }

    // ============================================================
    // PARTE 4: LEER VALORES ACTUALES
    // ============================================================
    console.log('\n📍 PARTE 4: LEER VALORES ACTUALES');

    const fieldsToTest = [
      'DIRECTO_PRIMER_PAGO',
      'DIRECTO_SEGUNDO_PAGO',
      'DIRECTO_TERCER_PAGO',
      'PALE_TODOS_EN_SECUENCIA',
      'TRIPLETA_PRIMER_PAGO'
    ];

    const originalValues = {};

    for (const fieldCode of fieldsToTest) {
      try {
        const input = await waitForPrizeField(page, fieldCode);
        const value = await input.inputValue();
        originalValues[fieldCode] = value;
        console.log(`  📖 ${fieldCode}: ${value || '(vacío)'}`);
      } catch (error) {
        console.warn(`  ⚠️ No se pudo leer ${fieldCode}`);
      }
    }

    // ============================================================
    // PARTE 5: MODIFICAR VALORES
    // ============================================================
    console.log('\n📍 PARTE 5: MODIFICAR VALORES');

    // Generar valores únicos basados en timestamp para asegurar que detectamos el cambio
    const timestamp = Date.now().toString().slice(-3); // Últimos 3 dígitos

    const newValues = {
      'DIRECTO_PRIMER_PAGO': `${timestamp}`,        // Ej: 456
      'DIRECTO_SEGUNDO_PAGO': `${parseInt(timestamp) + 10}`,  // Ej: 466
      'DIRECTO_TERCER_PAGO': `${parseInt(timestamp) + 20}`,   // Ej: 476
      'PALE_TODOS_EN_SECUENCIA': `${parseInt(timestamp) + 1000}`, // Ej: 1456
      'TRIPLETA_PRIMER_PAGO': `${parseInt(timestamp) + 10000}`    // Ej: 10456
    };

    for (const [fieldCode, newValue] of Object.entries(newValues)) {
      try {
        const input = await waitForPrizeField(page, fieldCode);
        await input.fill(''); // Limpiar primero
        await input.fill(newValue);
        console.log(`  ✏️ ${fieldCode}: ${originalValues[fieldCode] || '(vacío)'} → ${newValue}`);
      } catch (error) {
        console.warn(`  ⚠️ No se pudo modificar ${fieldCode}`);
      }
    }

    // ============================================================
    // PARTE 6: GUARDAR CAMBIOS
    // ============================================================
    console.log('\n📍 PARTE 6: GUARDAR CAMBIOS');

    const updateButton = page.locator('button[type="submit"]').first();
    await updateButton.scrollIntoViewIfNeeded();
    await updateButton.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(1000);

    console.log('  💾 Click en botón ACTUALIZAR...');
    await updateButton.click();

    // Esperar mensaje de éxito usando data-testid
    try {
      await page.getByTestId('success-message').waitFor({ timeout: 15000 });
      const successText = await page.getByTestId('success-message').textContent();
      console.log(`  ✅ ${successText}`);
    } catch (error) {
      const errorMessage = await page.locator('.error-message').textContent().catch(() => 'Error desconocido');
      console.log(`  ❌ Error al guardar: ${errorMessage}`);
      throw error;
    }

    // ============================================================
    // PARTE 7: RECARGAR PÁGINA PARA VERIFICAR PERSISTENCIA
    // ============================================================
    console.log('\n📍 PARTE 7: VERIFICAR PERSISTENCIA (RECARGAR PÁGINA)');
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForTimeout(2000);

    // Navegar nuevamente al tab de Premios
    await page.click('text=PREMIOS & COMISIONES');
    await page.waitForTimeout(2000);

    // ============================================================
    // PARTE 8: VERIFICAR QUE LOS VALORES SE MANTIENEN
    // ============================================================
    console.log('\n📍 PARTE 8: VERIFICAR VALORES GUARDADOS');

    let allValuesMatch = true;

    for (const [fieldCode, expectedValue] of Object.entries(newValues)) {
      try {
        const input = await waitForPrizeField(page, fieldCode);
        const actualValue = await input.inputValue();

        if (actualValue === expectedValue) {
          console.log(`  ✅ ${fieldCode}: ${actualValue} (correcto)`);
        } else {
          console.log(`  ❌ ${fieldCode}: esperado ${expectedValue}, obtenido ${actualValue}`);
          allValuesMatch = false;
        }
      } catch (error) {
        console.warn(`  ⚠️ No se pudo verificar ${fieldCode}`);
        allValuesMatch = false;
      }
    }

    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    console.log('\n📊 RESUMEN DEL TEST');
    console.log(`  - Banca editada: ${branchName}`);
    console.log(`  - Campos modificados: ${Object.keys(newValues).length}`);
    console.log(`  - Persistencia: ${allValuesMatch ? '✅ EXITOSA' : '❌ FALLIDA'}`);
    console.log('');

    // Asegurar que el test falle si los valores no coinciden
    expect(allValuesMatch, 'Todos los valores deben persistir correctamente').toBe(true);
  });
});
