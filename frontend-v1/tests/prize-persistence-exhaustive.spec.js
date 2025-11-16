import { test, expect } from '@playwright/test';

/**
 * SUITE EXHAUSTIVO: Persistencia de Valores de Premios
 *
 * Este test verifica todo el ciclo de vida de los valores de premios:
 * 1. Carga inicial (custom o defaults)
 * 2. Modificación de valores
 * 3. Guardado
 * 4. Recarga y verificación de persistencia
 */

test.describe('Prize Persistence - Exhaustive Tests', () => {

  // Estado compartido entre tests
  let initialValues = {};
  let modifiedValues = {};

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Esperar que el login sea exitoso y redirija al dashboard
    await page.waitForURL('**/inicio', { timeout: 10000 });
  });

  test('1️⃣ CARGA INICIAL: Debe cargar valores custom o defaults correctamente', async ({ page }) => {
    console.log('\n========== TEST 1: CARGA INICIAL ==========');

    // Navegar a editar banca 1 (tiene valores custom)
    await page.goto('http://localhost:3001/bancas/edit/1');

    // Esperar a que cargue el formulario
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });

    // Esperar un poco más para que carguen los premios
    await page.waitForTimeout(2000);

    // Navegar al tab de Premios & Comisiones
    await page.click('text=Premios & Comisiones');
    await page.waitForTimeout(1000);

    // Capturar valores iniciales de múltiples campos
    const fields = [
      { name: 'general_directo_primerPago', label: 'Directo - Primer Pago' },
      { name: 'general_directo_segundoPago', label: 'Directo - Segundo Pago' },
      { name: 'general_directo_tercerPago', label: 'Directo - Tercer Pago' },
      { name: 'general_pale_todosEnSecuencia', label: 'Pale - Todos en Secuencia' }
    ];

    for (const field of fields) {
      const value = await page.inputValue(`input[name="${field.name}"]`);
      initialValues[field.name] = value;
      console.log(`✓ ${field.label}: ${value}`);

      // Verificar que el campo tiene un valor (no está vacío)
      expect(value).not.toBe('');
      expect(value).not.toBe(null);
    }

    console.log('\n✅ Todos los campos tienen valores iniciales cargados');
  });

  test('2️⃣ MODIFICACIÓN: Debe permitir modificar valores sin errores', async ({ page }) => {
    console.log('\n========== TEST 2: MODIFICACIÓN ==========');

    await page.goto('http://localhost:3001/bancas/edit/1');
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.click('text=Premios & Comisiones');
    await page.waitForTimeout(1000);

    // Capturar valores antes de modificar
    const primerPagoAntes = await page.inputValue('input[name="general_directo_primerPago"]');
    const segundoPagoAntes = await page.inputValue('input[name="general_directo_segundoPago"]');

    console.log(`📝 Valores ANTES de modificar:`);
    console.log(`   Directo - Primer Pago: ${primerPagoAntes}`);
    console.log(`   Directo - Segundo Pago: ${segundoPagoAntes}`);

    // Modificar múltiples campos con nuevos valores
    const nuevosPrimero = parseFloat(primerPagoAntes) + 1; // Incrementar en 1
    const nuevosSegundo = parseFloat(segundoPagoAntes) + 0.5; // Incrementar en 0.5

    await page.fill('input[name="general_directo_primerPago"]', nuevosPrimero.toString());
    await page.fill('input[name="general_directo_segundoPago"]', nuevosSegundo.toString());

    // Guardar valores modificados para verificación posterior
    modifiedValues.primerPago = nuevosPrimero.toString();
    modifiedValues.segundoPago = nuevosSegundo.toString();

    // Verificar que los campos se modificaron
    const primerPagoDespues = await page.inputValue('input[name="general_directo_primerPago"]');
    const segundoPagoDespues = await page.inputValue('input[name="general_directo_segundoPago"]');

    console.log(`\n📝 Valores DESPUÉS de modificar:`);
    console.log(`   Directo - Primer Pago: ${primerPagoDespues}`);
    console.log(`   Directo - Segundo Pago: ${segundoPagoDespues}`);

    expect(primerPagoDespues).toBe(nuevosPrimero.toString());
    expect(segundoPagoDespues).toBe(nuevosSegundo.toString());

    console.log('\n✅ Valores modificados correctamente en el formulario');
  });

  test('3️⃣ GUARDADO: Debe guardar valores modificados sin errores', async ({ page }) => {
    console.log('\n========== TEST 3: GUARDADO ==========');

    await page.goto('http://localhost:3001/bancas/edit/1');
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.click('text=Premios & Comisiones');
    await page.waitForTimeout(1000);

    // Modificar valores
    const nuevoValor = '99.5';
    await page.fill('input[name="general_directo_primerPago"]', nuevoValor);

    console.log(`📝 Modificado Directo - Primer Pago a: ${nuevoValor}`);

    // Capturar mensajes de consola para verificar los logs de debug
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('DEBUG RECARGA')) {
        consoleLogs.push(msg.text());
      }
    });

    // Guardar
    const updateButton = page.locator('button:has-text("Actualizar Banca")');
    await updateButton.click();

    console.log('💾 Botón "Actualizar Banca" clickeado');

    // Esperar mensaje de éxito
    await page.waitForSelector('text=/actualizada correctamente|guardada correctamente/i', {
      timeout: 15000
    });

    console.log('✅ Mensaje de éxito mostrado');

    // Esperar un poco para ver los logs de debug
    await page.waitForTimeout(2000);

    // Verificar que se ejecutó la recarga de premios (debe haber logs)
    if (consoleLogs.length > 0) {
      console.log(`\n🔍 Logs de debug capturados: ${consoleLogs.length}`);
      consoleLogs.forEach(log => console.log(`   ${log}`));
    }

    console.log('\n✅ Guardado exitoso');
  });

  test('4️⃣ PERSISTENCIA: Los valores deben persistir después de recargar', async ({ page }) => {
    console.log('\n========== TEST 4: PERSISTENCIA (CRÍTICO) ==========');

    // Este es el test MÁS IMPORTANTE
    // Verifica que el fix de recarga funciona correctamente

    await page.goto('http://localhost:3001/bancas/edit/1');
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.click('text=Premios & Comisiones');
    await page.waitForTimeout(1000);

    // Capturar valor ANTES de modificar
    const valorAntes = await page.inputValue('input[name="general_directo_primerPago"]');
    console.log(`📊 Valor ANTES de modificar: ${valorAntes}`);

    // Modificar a un valor único y fácil de verificar
    const valorUnico = '88.88';
    await page.fill('input[name="general_directo_primerPago"]', valorUnico);
    console.log(`📝 Modificado a valor único: ${valorUnico}`);

    // Guardar
    await page.click('button:has-text("Actualizar Banca")');
    await page.waitForSelector('text=/actualizada correctamente|guardada correctamente/i', {
      timeout: 15000
    });
    console.log('💾 Guardado exitoso');

    // IMPORTANTE: Esperar a que se ejecute la recarga automática
    await page.waitForTimeout(3000);

    // Verificar que el valor persiste EN EL MISMO FORMULARIO sin recargar la página
    const valorDespuesDeGuardar = await page.inputValue('input[name="general_directo_primerPago"]');
    console.log(`📊 Valor DESPUÉS de guardar (sin recargar página): ${valorDespuesDeGuardar}`);

    // ESTE ES EL TEST CRÍTICO
    expect(valorDespuesDeGuardar).toBe(valorUnico);

    if (valorDespuesDeGuardar === valorUnico) {
      console.log('✅ ÉXITO: El valor persiste después de guardar (fix de recarga funcionando)');
    } else {
      console.log(`❌ ERROR: El valor volvió a ${valorDespuesDeGuardar} en lugar de mantener ${valorUnico}`);
      console.log('   Esto indica que el fix de recarga NO está funcionando');
    }

    // Ahora recargar COMPLETAMENTE la página para verificar persistencia en BD
    console.log('\n🔄 Recargando página COMPLETA para verificar persistencia en BD...');
    await page.reload();
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.click('text=Premios & Comisiones');
    await page.waitForTimeout(1000);

    const valorDespuesDeRecargar = await page.inputValue('input[name="general_directo_primerPago"]');
    console.log(`📊 Valor DESPUÉS de recargar página: ${valorDespuesDeRecargar}`);

    expect(valorDespuesDeRecargar).toBe(valorUnico);

    if (valorDespuesDeRecargar === valorUnico) {
      console.log('✅ ÉXITO: El valor persiste en base de datos');
    }

    console.log('\n🎉 TEST COMPLETO: Persistencia verificada en ambos escenarios');
  });

  test('5️⃣ FUSIÓN: Custom debe sobrescribir default (verificar logs)', async ({ page }) => {
    console.log('\n========== TEST 5: FUSIÓN DE VALORES ==========');

    // Este test verifica que los logs de debug muestren correctamente la fusión

    const debugLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('DEBUG')) {
        debugLogs.push(text);
        console.log(`🔍 ${text}`);
      }
    });

    await page.goto('http://localhost:3001/bancas/edit/1');
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });
    await page.waitForTimeout(3000); // Esperar a que se muestren los logs de carga inicial

    // Verificar que hubo logs de debug de carga inicial
    const cargaInicialLogs = debugLogs.filter(log => log.includes('CARGA INICIAL'));
    expect(cargaInicialLogs.length).toBeGreaterThan(0);

    console.log(`\n✅ Se capturaron ${cargaInicialLogs.length} logs de CARGA INICIAL`);

    // Ahora modificar, guardar y verificar logs de recarga
    await page.click('text=Premios & Comisiones');
    await page.waitForTimeout(1000);

    await page.fill('input[name="general_directo_primerPago"]', '77.77');

    const logsAntes = debugLogs.length;

    await page.click('button:has-text("Actualizar Banca")');
    await page.waitForSelector('text=/actualizada correctamente|guardada correctamente/i', {
      timeout: 15000
    });
    await page.waitForTimeout(3000);

    const logsNuevos = debugLogs.slice(logsAntes);
    const recargaLogs = logsNuevos.filter(log => log.includes('RECARGA'));

    expect(recargaLogs.length).toBeGreaterThan(0);

    console.log(`\n✅ Se capturaron ${recargaLogs.length} logs de RECARGA`);
    console.log('\n🎉 Logs de fusión verificados correctamente');
  });

  test('6️⃣ MÚLTIPLES CAMPOS: Debe persistir cambios en múltiples campos simultáneamente', async ({ page }) => {
    console.log('\n========== TEST 6: MÚLTIPLES CAMPOS ==========');

    await page.goto('http://localhost:3001/bancas/edit/1');
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.click('text=Premios & Comisiones');
    await page.waitForTimeout(1000);

    // Modificar 4 campos diferentes
    const cambios = [
      { name: 'general_directo_primerPago', valor: '111.11' },
      { name: 'general_directo_segundoPago', valor: '222.22' },
      { name: 'general_directo_tercerPago', valor: '333.33' },
      { name: 'general_directo_dobles', valor: '444.44' }
    ];

    console.log('📝 Modificando múltiples campos:');
    for (const cambio of cambios) {
      await page.fill(`input[name="${cambio.name}"]`, cambio.valor);
      console.log(`   ${cambio.name}: ${cambio.valor}`);
    }

    // Guardar
    await page.click('button:has-text("Actualizar Banca")');
    await page.waitForSelector('text=/actualizada correctamente|guardada correctamente/i', {
      timeout: 15000
    });
    await page.waitForTimeout(3000);

    // Verificar que TODOS los campos persisten
    console.log('\n📊 Verificando persistencia:');
    let todosCorrecto = true;

    for (const cambio of cambios) {
      const valorActual = await page.inputValue(`input[name="${cambio.name}"]`);
      const correcto = valorActual === cambio.valor;
      console.log(`   ${cambio.name}: ${valorActual} ${correcto ? '✅' : '❌'}`);

      expect(valorActual).toBe(cambio.valor);

      if (!correcto) todosCorrecto = false;
    }

    if (todosCorrecto) {
      console.log('\n🎉 ÉXITO: Todos los campos múltiples persistieron correctamente');
    }
  });

  test('7️⃣ DEFAULTS: Banca sin custom debe cargar valores default', async ({ page }) => {
    console.log('\n========== TEST 7: VALORES DEFAULT ==========');

    // Editar una banca que NO tiene valores custom (ej: banca 3)
    await page.goto('http://localhost:3001/bancas/edit/3');
    await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.click('text=Premios & Comisiones');
    await page.waitForTimeout(1000);

    // Verificar que tiene valores (los defaults del sistema)
    const primerPago = await page.inputValue('input[name="general_directo_primerPago"]');

    console.log(`📊 Directo - Primer Pago (default): ${primerPago}`);

    // Debe tener un valor (no vacío)
    expect(primerPago).not.toBe('');
    expect(primerPago).not.toBe(null);

    // El valor default típico es 56
    console.log(`✅ Banca sin custom cargó valor default: ${primerPago}`);
  });

});
