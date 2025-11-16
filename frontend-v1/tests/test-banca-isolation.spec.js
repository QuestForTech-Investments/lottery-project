import { test, expect } from '@playwright/test';

test('Verificar que cada banca tiene configuración independiente', async ({ page }) => {
  console.log('🧪 TEST: Verificar aislamiento de configuración entre bancas\n');

  // Login
  await page.goto('http://localhost:4200/login');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'Admin123456');
  await page.click('#log-in');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // ============================================================
  // PARTE 1: Leer valores de banca 9
  // ============================================================
  console.log('\n📍 PARTE 1: Leyendo valores de BANCA 9...');
  await page.goto('http://localhost:4200/bancas/editar/9');
  await page.waitForTimeout(2000);

  // Click en tab Premios & Comisiones
  await page.locator('button:has-text("Premios & Comisiones")').first().click();
  await page.waitForTimeout(1000);

  // Leer valor de DIRECTO_PRIMER_PAGO en banca 9
  const banca9Value = await page.locator('input[name="DIRECTO_PRIMER_PAGO"]').first().inputValue();
  console.log(`  ✅ BANCA 9 - DIRECTO_PRIMER_PAGO: ${banca9Value}`);

  // ============================================================
  // PARTE 2: Leer valores de banca 10 (u otra banca diferente)
  // ============================================================
  console.log('\n📍 PARTE 2: Leyendo valores de BANCA 10...');
  await page.goto('http://localhost:4200/bancas/editar/10');
  await page.waitForTimeout(2000);

  // Click en tab Premios & Comisiones
  await page.locator('button:has-text("Premios & Comisiones")').first().click();
  await page.waitForTimeout(1000);

  // Leer valor de DIRECTO_PRIMER_PAGO en banca 10
  const banca10ValueBefore = await page.locator('input[name="DIRECTO_PRIMER_PAGO"]').first().inputValue();
  console.log(`  ✅ BANCA 10 - DIRECTO_PRIMER_PAGO (antes): ${banca10ValueBefore}`);

  // ============================================================
  // PARTE 3: Modificar valor en banca 9
  // ============================================================
  console.log('\n📍 PARTE 3: Modificando valor en BANCA 9 a 999...');
  await page.goto('http://localhost:4200/bancas/editar/9');
  await page.waitForTimeout(2000);

  // Click en tab Premios & Comisiones
  await page.locator('button:has-text("Premios & Comisiones")').first().click();
  await page.waitForTimeout(1000);

  // Cambiar valor a 999
  await page.locator('input[name="DIRECTO_PRIMER_PAGO"]').first().fill('999');
  console.log(`  📝 Cambiando DIRECTO_PRIMER_PAGO a 999 en banca 9`);

  // Guardar
  await page.locator('button:has-text("Guardar")').first().click();
  await page.waitForTimeout(2000);

  // ============================================================
  // PARTE 4: Verificar que banca 10 NO cambió
  // ============================================================
  console.log('\n📍 PARTE 4: Verificando que BANCA 10 NO cambió...');
  await page.goto('http://localhost:4200/bancas/editar/10');
  await page.waitForTimeout(2000);

  // Click en tab Premios & Comisiones
  await page.locator('button:has-text("Premios & Comisiones")').first().click();
  await page.waitForTimeout(1000);

  // Leer valor de DIRECTO_PRIMER_PAGO en banca 10 DESPUÉS del cambio
  const banca10ValueAfter = await page.locator('input[name="DIRECTO_PRIMER_PAGO"]').first().inputValue();
  console.log(`  ✅ BANCA 10 - DIRECTO_PRIMER_PAGO (después): ${banca10ValueAfter}`);

  // ============================================================
  // RESULTADO
  // ============================================================
  console.log('\n📊 RESULTADO:');
  console.log(`  BANCA 9 (original): ${banca9Value}`);
  console.log(`  BANCA 9 (modificado): 999`);
  console.log(`  BANCA 10 (antes): ${banca10ValueBefore}`);
  console.log(`  BANCA 10 (después): ${banca10ValueAfter}`);

  if (banca10ValueAfter === '999') {
    console.log('\n  ❌ BUG CONFIRMADO: Banca 10 se modificó a 999! (debería mantenerse en ' + banca10ValueBefore + ')');
  } else if (banca10ValueAfter === banca10ValueBefore) {
    console.log('\n  ✅ OK: Banca 10 se mantuvo en ' + banca10ValueBefore + ' (configuración independiente)');
  } else {
    console.log('\n  ⚠️ EXTRAÑO: Banca 10 cambió a ' + banca10ValueAfter + ' (esperaba ' + banca10ValueBefore + ')');
  }

  // Restaurar valor original en banca 9
  console.log('\n📍 LIMPIEZA: Restaurando valor original en BANCA 9...');
  await page.goto('http://localhost:4200/bancas/editar/9');
  await page.waitForTimeout(2000);
  await page.locator('button:has-text("Premios & Comisiones")').first().click();
  await page.waitForTimeout(1000);
  await page.locator('input[name="DIRECTO_PRIMER_PAGO"]').first().fill(banca9Value);
  await page.locator('button:has-text("Guardar")').first().click();
  await page.waitForTimeout(2000);
  console.log(`  ✅ Restaurado a ${banca9Value}`);
});
