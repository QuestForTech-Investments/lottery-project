import { test, expect } from '@playwright/test';

/**
 * Test del Sistema de Fallback - Opción B
 * Verifica que los valores de "General" se usen como fallback
 * en loterías específicas que no tienen valores personalizados
 */
test.describe('Sistema de Fallback de Premios', () => {
  const BASE_URL = 'http://localhost:4201';
  const BANCA_ID = 9; // Usar banca de prueba

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin123456');
    await page.click('#log-in');

    // Esperar a que cargue el dashboard (redirige a /dashboard)
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('Valores de General se usan como fallback en loterías específicas', async ({ page }) => {
    console.log('🧪 Test: Verificando sistema de fallback...');

    // 1. Navegar a editar banca
    await page.goto(`${BASE_URL}/bancas/${BANCA_ID}/editar`);
    await page.waitForTimeout(2000);

    // 2. Click en tab "Premios & Comisiones"
    await page.click('button:has-text("Premios & Comisiones")');
    await page.waitForTimeout(1000);

    // 3. Verificar que estamos en tab "General" por defecto
    const generalTab = page.locator('.lottery-tab.active:has-text("General")');
    await expect(generalTab).toBeVisible();
    console.log('✅ Tab "General" activo');

    // 4. En tab "General" - obtener valor actual de directo_primerPago
    const generalDirectoInput = page.locator('input[name="general_directo_primerPago"]');
    await generalDirectoInput.waitFor({ state: 'visible' });

    const generalValue = await generalDirectoInput.inputValue();
    console.log(`📋 Valor en General directo_primerPago: ${generalValue || 'vacío'}`);

    // 5. Si está vacío, configurar un valor de prueba
    let testValue = generalValue;
    if (!testValue || testValue === '') {
      testValue = '60';
      await generalDirectoInput.fill(testValue);
      console.log(`📝 Configurado valor de prueba en General: ${testValue}`);
      await page.waitForTimeout(500);
    }

    // 6. Cambiar a tab "LA PRIMERA"
    await page.click('button:has-text("LA PRIMERA")');
    await page.waitForTimeout(2000);
    console.log('🔄 Cambiado a tab "LA PRIMERA"');

    // 7. Esperar a que carguen los tipos de premios
    await page.waitForSelector('.premio-group', { timeout: 5000 });
    console.log('✅ Tipos de premios cargados');

    // 8. Verificar que el input de LA PRIMERA existe
    const laPrimeraDirectoInput = page.locator('input[name="lottery_43_directo_primerPago"]');
    await laPrimeraDirectoInput.waitFor({ state: 'visible', timeout: 5000 });

    // 9. Obtener el valor mostrado en LA PRIMERA
    const laPrimeraValue = await laPrimeraDirectoInput.inputValue();
    console.log(`📊 Valor mostrado en LA PRIMERA: ${laPrimeraValue}`);

    // 10. VERIFICACIÓN CLAVE: El valor debe ser el mismo que General (fallback)
    expect(laPrimeraValue).toBe(testValue);
    console.log(`✅ FALLBACK FUNCIONA: LA PRIMERA muestra ${laPrimeraValue} (de General)`);

    // 11. Verificar que NO está en negrita (no es personalizado)
    const fontWeight = await laPrimeraDirectoInput.evaluate(el =>
      window.getComputedStyle(el).fontWeight
    );
    console.log(`📝 Font-weight: ${fontWeight}`);
    expect(['400', 'normal']).toContain(fontWeight);
    console.log('✅ Campo NO está en negrita (usando fallback)');

    // 12. PERSONALIZAR: Cambiar el valor en LA PRIMERA
    const customValue = '65';
    await laPrimeraDirectoInput.fill(customValue);
    await page.waitForTimeout(500);
    console.log(`🎨 Valor personalizado configurado: ${customValue}`);

    // 13. Verificar que ahora está en negrita (personalizado)
    const newFontWeight = await laPrimeraDirectoInput.evaluate(el =>
      window.getComputedStyle(el).fontWeight
    );
    console.log(`📝 Nuevo font-weight: ${newFontWeight}`);
    expect(['700', 'bold']).toContain(newFontWeight);
    console.log('✅ Campo AHORA está en negrita (valor personalizado)');

    // 14. Volver a "General" y verificar que su valor NO cambió
    await page.click('button:has-text("General")');
    await page.waitForTimeout(1000);

    const generalValueAfter = await generalDirectoInput.inputValue();
    expect(generalValueAfter).toBe(testValue);
    console.log(`✅ Valor de General NO cambió: ${generalValueAfter}`);

    // 15. Cambiar a otra lotería (FLORIDA AM) para verificar que también usa fallback
    await page.click('button:has-text("FLORIDA AM")');
    await page.waitForTimeout(2000);
    console.log('🔄 Cambiado a tab "FLORIDA AM"');

    // 16. Verificar que FLORIDA AM también muestra el valor de General
    const floridaDirectoInput = page.locator('input[name="lottery_5_directo_primerPago"]');
    await floridaDirectoInput.waitFor({ state: 'visible', timeout: 5000 });

    const floridaValue = await floridaDirectoInput.inputValue();
    console.log(`📊 Valor en FLORIDA AM: ${floridaValue}`);
    expect(floridaValue).toBe(testValue);
    console.log(`✅ FLORIDA AM también usa fallback: ${floridaValue}`);

    console.log('\n🎉 TEST COMPLETADO - Sistema de fallback funciona correctamente');
  });

  test('Filtrado dinámico - LA PRIMERA solo muestra 3 tipos', async ({ page }) => {
    console.log('🧪 Test: Verificando filtrado dinámico...');

    // 1. Navegar a editar banca
    await page.goto(`${BASE_URL}/bancas/${BANCA_ID}/editar`);
    await page.waitForTimeout(2000);

    // 2. Click en tab "Premios & Comisiones"
    await page.click('button:has-text("Premios & Comisiones")');
    await page.waitForTimeout(1000);

    // 3. Cambiar a tab "LA PRIMERA"
    await page.click('button:has-text("LA PRIMERA")');
    await page.waitForTimeout(2000);
    console.log('🔄 Cambiado a tab "LA PRIMERA"');

    // 4. Esperar a que carguen los tipos
    await page.waitForSelector('.premio-group', { timeout: 5000 });

    // 5. Contar cuántos grupos de premios hay
    const prizeGroups = await page.locator('.premio-group').count();
    console.log(`📊 Tipos de premios en LA PRIMERA: ${prizeGroups}`);

    // 6. LA PRIMERA solo debe tener 3 tipos (Directo, Palé, Tripleta)
    expect(prizeGroups).toBe(3);
    console.log('✅ LA PRIMERA muestra exactamente 3 tipos (filtrado correcto)');

    // 7. Verificar que los 3 tipos son los correctos
    await expect(page.locator('.premio-group-title:has-text("DIRECTO")')).toBeVisible();
    await expect(page.locator('.premio-group-title:has-text("PALE")')).toBeVisible();
    await expect(page.locator('.premio-group-title:has-text("TRIPLETA")')).toBeVisible();
    console.log('✅ Los 3 tipos son: DIRECTO, PALE, TRIPLETA');

    // 8. Cambiar a FLORIDA AM (debe tener más tipos)
    await page.click('button:has-text("FLORIDA AM")');
    await page.waitForTimeout(2000);
    console.log('🔄 Cambiado a tab "FLORIDA AM"');

    // 9. Contar tipos en FLORIDA AM
    await page.waitForSelector('.premio-group', { timeout: 5000 });
    const floridaPrizeGroups = await page.locator('.premio-group').count();
    console.log(`📊 Tipos de premios en FLORIDA AM: ${floridaPrizeGroups}`);

    // 10. FLORIDA AM debe tener más tipos (18 aprox)
    expect(floridaPrizeGroups).toBeGreaterThan(3);
    console.log(`✅ FLORIDA AM tiene ${floridaPrizeGroups} tipos (más que LA PRIMERA)`);

    // 11. Cambiar a "General" (debe tener todos los tipos)
    await page.click('button:has-text("General")');
    await page.waitForTimeout(2000);
    console.log('🔄 Cambiado a tab "General"');

    // 12. Contar tipos en General
    await page.waitForSelector('.premio-group', { timeout: 5000 });
    const generalPrizeGroups = await page.locator('.premio-group').count();
    console.log(`📊 Tipos de premios en General: ${generalPrizeGroups}`);

    // 13. General debe tener todos los tipos (23+)
    expect(generalPrizeGroups).toBeGreaterThan(floridaPrizeGroups);
    console.log(`✅ General tiene ${generalPrizeGroups} tipos (todos los disponibles)`);

    console.log('\n🎉 TEST COMPLETADO - Filtrado dinámico funciona correctamente');
  });
});
