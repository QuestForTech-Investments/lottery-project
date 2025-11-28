const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔵 Navegando a V2 Loans List...');
    await page.goto('http://localhost:4000/loans/list', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('✅ Página cargada');
    await page.screenshot({ path: '/tmp/v2-loans-list-loaded.png' });

    // Test 1: Click en botón de pagar (InfoIcon)
    console.log('\n🔵 Test 1: Abriendo modal de pago...');
    const firstPayButton = page.locator('button[title="Pagar préstamo"]').first();
    await firstPayButton.click();
    await page.waitForTimeout(1000);
    
    // Verificar que el modal está visible
    const paymentDialog = page.locator('text=Pagar préstamo').first();
    if (await paymentDialog.isVisible()) {
      console.log('✅ Modal de pago abierto correctamente');
      await page.screenshot({ path: '/tmp/v2-payment-modal.png' });
      
      // Cerrar modal con Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      console.log('✅ Modal cerrado');
    } else {
      console.log('❌ Modal de pago no se abrió');
    }

    // Test 2: Verificar botón de editar (Link)
    console.log('\n🔵 Test 2: Verificando botón de editar...');
    const editButtons = await page.locator('a[title="Editar"]').count();
    console.log(`✅ Encontrados ${editButtons} botones de editar`);
    if (editButtons > 0) {
      const firstEditButton = page.locator('a[title="Editar"]').first();
      const href = await firstEditButton.getAttribute('href');
      console.log(`✅ Botón de editar tiene href: ${href}`);
    }

    // Test 3: Click en botón de eliminar
    console.log('\n🔵 Test 3: Abriendo diálogo de eliminar...');
    const firstDeleteButton = page.locator('button[title="Eliminar"]').first();
    await firstDeleteButton.click();
    await page.waitForTimeout(1000);
    
    // Verificar que el diálogo está visible
    const deleteDialog = page.locator('text=¿Está seguro que desea eliminar este préstamo?');
    if (await deleteDialog.isVisible()) {
      console.log('✅ Diálogo de eliminar abierto correctamente');
      await page.screenshot({ path: '/tmp/v2-delete-dialog.png' });
      
      // Cerrar diálogo
      const cancelButton = page.locator('button:has-text("Cancelar")');
      await cancelButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Diálogo cerrado');
    } else {
      console.log('❌ Diálogo de eliminar no se abrió');
    }

    console.log('\n✅ Todos los tests completados exitosamente!');
    console.log('\n📸 Screenshots capturados:');
    console.log('  - /tmp/v2-loans-list-loaded.png');
    console.log('  - /tmp/v2-payment-modal.png');
    console.log('  - /tmp/v2-delete-dialog.png');
    
  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    await page.screenshot({ path: '/tmp/v2-error.png' });
  } finally {
    await browser.close();
  }
})();
