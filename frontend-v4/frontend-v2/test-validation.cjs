const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🚀 Pruebas de validación de tipos de apuesta\n');

  try {
    // Login
    console.log('1️⃣ Login...');
    await page.goto('http://localhost:4000');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Login OK\n');

    // Navegar a tickets
    console.log('2️⃣ Navegar a Crear Ticket...');
    await page.click('text=TICKETS');
    await page.waitForTimeout(500);
    await page.click('text=Crear');
    await page.waitForTimeout(3000);
    console.log('✅ Formulario cargado\n');

    const tests = [
      { input: '12', name: 'Directo' },
      { input: '123', name: 'Cash3 Straight' },
      { input: '123+', name: 'Cash3 Box' },
      { input: '1234', name: 'Palé' },
      { input: '123q', name: 'Cash3 Combinaciones' }
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      console.log(`🧪 TEST ${i+1}: "${test.input}" → ${test.name}`);
      
      await page.fill('input[placeholder*="Ej: 12"]', test.input);
      await page.waitForTimeout(500);
      
      const hint = await page.locator('text=/Detectado:/').textContent().catch(() => '');
      console.log('   ' + hint);
      
      await page.fill('input[placeholder*="$0.00"]', '10');
      await page.press('input[placeholder*="$0.00"]', 'Enter');
      await page.waitForTimeout(1500);
      
      const error = await page.locator('text=/❌/').textContent().catch(() => null);
      console.log(error ? `   ❌ ${error}` : '   ✅ Línea agregada');
      console.log('');
    }

    console.log('📸 Screenshot final...');
    await page.screenshot({ path: 'validation-test.png', fullPage: true });
    console.log('✅ Guardado: validation-test.png\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'validation-error.png' });
  } finally {
    await browser.close();
  }
})();
