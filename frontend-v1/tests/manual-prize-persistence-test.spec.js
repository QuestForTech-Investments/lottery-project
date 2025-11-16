import { test, expect } from '@playwright/test';

/**
 * TEST MANUAL: Verificación de Persistencia de Premios
 *
 * Este test hace EXACTAMENTE lo que el usuario reportó como problema:
 * 1. Edita Banca 9
 * 2. Modifica "Directo - Primer Pago" de 60 a 55
 * 3. Guarda
 * 4. Verifica que el valor se mantenga en 55 (NO vuelva a 56)
 */

test('PERSISTENCIA MANUAL: Verificar que los valores guardados persisten', async ({ page }) => {
  console.log('\n========== INICIANDO TEST MANUAL DE PERSISTENCIA ==========\n');

  // ========== 1. LOGIN ==========
  console.log('📍 PASO 1: Login');
  await page.goto('http://localhost:3000/');

  // Esperar a que cargue el formulario de login (selector flexible)
  await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });

  // Usar selectores flexibles como en manage-zones-real-data.spec.js
  const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  await usernameInput.fill('admin');
  await passwordInput.fill('Admin123456');
  await page.locator('button[type="submit"]').click();

  // Esperar a que redirija al dashboard
  await page.waitForURL(/\/(dashboard|home|inicio)/, { timeout: 10000 });
  console.log('✅ Login exitoso\n');

  // ========== 2. NAVEGAR A EDITAR BANCA 9 ==========
  console.log('📍 PASO 2: Navegar a Editar Banca 9');
  await page.goto('http://localhost:3000/bancas/editar/9');

  // Esperar a que la red se estabilice
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // Esperar 5 segundos para que cargue todo

  // Tomar screenshot para debug
  await page.screenshot({ path: 'test-results/debug-banca-9-page.png', fullPage: true });
  console.log('📸 Screenshot guardado en test-results/debug-banca-9-page.png');

  // Ver qué hay en la página
  const mainContent = await page.locator('main').textContent();
  console.log('📄 Contenido de main:', mainContent?.substring(0, 200));

  // Intentar esperar el formulario con manejo de error
  try {
    await page.waitForSelector('input[name="branchName"]', { timeout: 5000 });
    console.log('✅ Formulario de edición cargado\n');
  } catch (e) {
    console.log('❌ Formulario NO cargó. Buscando mensajes de error...');
    const bodyText = await page.locator('body').textContent();
    if (bodyText.includes('No encontrado') || bodyText.includes('404')) {
      console.log('⚠️  Parece que la banca 9 no existe');
    }
    throw e;
  }

  // Esperar a que carguen los premios (la carga inicial)
  await page.waitForTimeout(3000);

  // ========== 3. IR AL TAB DE PREMIOS ==========
  console.log('📍 PASO 3: Ir al tab "Premios & Comisiones"');
  await page.click('text=Premios & Comisiones');
  await page.waitForTimeout(1000);
  console.log('✅ Tab de premios abierto\n');

  // ========== 4. CAPTURAR VALOR INICIAL ==========
  console.log('📍 PASO 4: Capturar valor INICIAL');
  const valorInicial = await page.inputValue('input[name="general_directo_primerPago"]');
  console.log(`   📊 Directo - Primer Pago INICIAL: ${valorInicial}`);

  // Verificar que tiene un valor (no está vacío)
  expect(valorInicial).not.toBe('');
  console.log('✅ Campo tiene valor inicial (no está vacío)\n');

  // ========== 5. MODIFICAR A UN VALOR ÚNICO ==========
  const nuevoValor = '88.88'; // Valor único para identificar fácilmente
  console.log(`📍 PASO 5: Modificar valor a ${nuevoValor}`);

  await page.fill('input[name="general_directo_primerPago"]', '');
  await page.fill('input[name="general_directo_primerPago"]', nuevoValor);

  const valorDespuesDeModificar = await page.inputValue('input[name="general_directo_primerPago"]');
  console.log(`   📊 Valor después de modificar: ${valorDespuesDeModificar}`);
  expect(valorDespuesDeModificar).toBe(nuevoValor);
  console.log('✅ Valor modificado correctamente en el formulario\n');

  // ========== 6. CONFIGURAR LISTENER PARA LOGS DE CONSOLA ==========
  console.log('📍 PASO 6: Configurar captura de logs de debug');
  const debugLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('DEBUG')) {
      debugLogs.push(text);
      console.log(`   🔍 ${text}`);
    }
  });
  console.log('✅ Listener de logs configurado\n');

  // ========== 7. GUARDAR ==========
  console.log('📍 PASO 7: Guardar cambios');
  await page.click('button:has-text("ACTUALIZAR")');

  // Esperar a que se procese el guardado (sin esperar mensaje de éxito)
  await page.waitForTimeout(2000);
  console.log('✅ Guardado procesado\n');

  // ========== 8. ESPERAR A QUE SE EJECUTE LA RECARGA ==========
  console.log('📍 PASO 8: Esperar a que se ejecute la recarga automática');
  await page.waitForTimeout(3000);

  // Screenshot después de guardar
  await page.screenshot({ path: 'test-results/debug-after-save.png', fullPage: true });
  console.log('📸 Screenshot post-save guardado');

  // Ver si seguimos en el tab de premios
  const tabText = await page.locator('text=Premios & Comisiones').count();
  console.log(`📊 Tab "Premios & Comisiones" visible: ${tabText > 0 ? 'SÍ' : 'NO'}`);

  // Si el tab se cerró, volver a abrirlo
  if (tabText === 0) {
    console.log('⚠️  Tab cerrado, volviéndolo a abrir...');
    await page.click('text=Premios & Comisiones');
    await page.waitForTimeout(1000);
    console.log('✅ Tab reabierto');
  }

  console.log('✅ Recarga automática completada\n');

  // ========== 9. VERIFICAR LOGS DE DEBUG ==========
  console.log('📍 PASO 9: Verificar logs de debug');

  const cargaInicialLogs = debugLogs.filter(log => log.includes('CARGA INICIAL'));
  const recargaLogs = debugLogs.filter(log => log.includes('RECARGA'));

  console.log(`   📊 Logs de CARGA INICIAL capturados: ${cargaInicialLogs.length}`);
  console.log(`   📊 Logs de RECARGA capturados: ${recargaLogs.length}`);

  if (cargaInicialLogs.length > 0) {
    console.log('\n   ✅ Se capturaron logs de CARGA INICIAL');
  }

  if (recargaLogs.length > 0) {
    console.log('   ✅ Se capturaron logs de RECARGA (fix funcionando!)');
  } else {
    console.log('   ⚠️  NO se capturaron logs de RECARGA (puede indicar problema)');
  }
  console.log('');

  // ========== 10. VERIFICAR PERSISTENCIA (SIN RECARGAR PÁGINA) ==========
  console.log('📍 PASO 10: VERIFICAR PERSISTENCIA (sin recargar página)');
  const valorDespuesDeGuardar = await page.inputValue('input[name="general_directo_primerPago"]');
  console.log(`   📊 Valor DESPUÉS de guardar: ${valorDespuesDeGuardar}`);

  console.log('\n🔍 COMPARACIÓN CRÍTICA:');
  console.log(`   Valor que guardamos: ${nuevoValor}`);
  console.log(`   Valor que muestra ahora: ${valorDespuesDeGuardar}`);

  if (valorDespuesDeGuardar === nuevoValor) {
    console.log(`\n   ✅✅✅ ÉXITO: El valor PERSISTE correctamente (${nuevoValor})`);
    console.log('   El fix de recarga está FUNCIONANDO!');
  } else {
    console.log(`\n   ❌❌❌ ERROR: El valor NO persiste`);
    console.log(`   Esperado: ${nuevoValor}`);
    console.log(`   Actual: ${valorDespuesDeGuardar}`);
    console.log('   El fix de recarga NO está funcionando');
  }

  expect(valorDespuesDeGuardar).toBe(nuevoValor);
  console.log('');

  // ========== 11. VERIFICAR PERSISTENCIA EN BASE DE DATOS (RECARGAR PÁGINA) ==========
  console.log('📍 PASO 11: VERIFICAR PERSISTENCIA EN BD (recargar página completa)');
  await page.reload();
  await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });
  await page.waitForTimeout(3000); // Esperar carga de premios

  await page.click('text=Premios & Comisiones');
  await page.waitForTimeout(1000);

  const valorDespuesDeRecargar = await page.inputValue('input[name="general_directo_primerPago"]');
  console.log(`   📊 Valor DESPUÉS de recargar página: ${valorDespuesDeRecargar}`);

  if (valorDespuesDeRecargar === nuevoValor) {
    console.log('\n   ✅✅✅ ÉXITO: El valor persiste en BASE DE DATOS');
    console.log('   El guardado funcionó correctamente');
  } else {
    console.log(`\n   ❌❌❌ ERROR: El valor no persiste en BD`);
    console.log(`   Esperado: ${nuevoValor}`);
    console.log(`   Actual: ${valorDespuesDeRecargar}`);
  }

  expect(valorDespuesDeRecargar).toBe(nuevoValor);
  console.log('');

  // ========== 12. TOMAR SCREENSHOT FINAL ==========
  console.log('📍 PASO 12: Tomar screenshot final');
  await page.screenshot({
    path: 'test-results/prize-persistence-final.png',
    fullPage: true
  });
  console.log('   📸 Screenshot guardado en test-results/prize-persistence-final.png\n');

  // ========== RESUMEN FINAL ==========
  console.log('========== RESUMEN FINAL ==========\n');
  console.log(`✅ Valor inicial: ${valorInicial}`);
  console.log(`✅ Valor modificado a: ${nuevoValor}`);
  console.log(`✅ Persistió después de guardar: ${valorDespuesDeGuardar === nuevoValor ? 'SÍ' : 'NO'}`);
  console.log(`✅ Persistió después de recargar: ${valorDespuesDeRecargar === nuevoValor ? 'SÍ' : 'NO'}`);
  console.log(`✅ Logs de debug capturados: ${debugLogs.length}`);
  console.log('\n🎉 TEST COMPLETADO EXITOSAMENTE\n');
});
