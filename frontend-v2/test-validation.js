const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🚀 Pruebas de validación de tipos de apuesta\n');

  try {
    // Login
    console.log('1️⃣ Login...');
    await page.goto('http://localhost:4000');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Login OK\n');

    // Navegar a tickets
    console.log('2️⃣ Navegar a Crear Ticket...');
    await page.click('text=TICKETS');
    await page.waitForTimeout(500);
    await page.click('text=Crear');
    await page.waitForTimeout(2500);
    console.log('✅ Formulario cargado\n');

    // Test 1: Directo (12)
    console.log('🧪 TEST 1: "12" → Directo');
    await page.fill('input[placeholder*="Ej: 12"]', '12');
    await page.waitForTimeout(500);
    let hint = await page.locator('text=/Detectado:/').textContent().catch(() => '');
    console.log('   ' + hint);
    await page.fill('input[placeholder*="$0.00"]', '10');
    await page.press('input[placeholder*="$0.00"]', 'Enter');
    await page.waitForTimeout(1000);
    let error = await page.locator('text=/❌/').textContent().catch(() => null);
    console.log(error ? `   ❌ ${error}` : '   ✅ Línea agregada');
    console.log('');

    // Test 2: Cash3 (123)
    console.log('🧪 TEST 2: "123" → Cash3 Straight');
    await page.fill('input[placeholder*="Ej: 12"]', '123');
    await page.waitForTimeout(500);
    hint = await page.locator('text=/Detectado:/').textContent().catch(() => '');
    console.log('   ' + hint);
    await page.fill('input[placeholder*="$0.00"]', '10');
    await page.press('input[placeholder*="$0.00"]', 'Enter');
    await page.waitForTimeout(1000);
    error = await page.locator('text=/❌/').textContent().catch(() => null);
    console.log(error ? `   ❌ ${error}` : '   ✅ Línea agregada');
    console.log('');

    // Test 3: Cash3 Box (123+)
    console.log('🧪 TEST 3: "123+" → Cash3 Box');
    await page.fill('input[placeholder*="Ej: 12"]', '123+');
    await page.waitForTimeout(500);
    hint = await page.locator('text=/Detectado:/').textContent().catch(() => '');
    console.log('   ' + hint);
    await page.fill('input[placeholder*="$0.00"]', '10');
    await page.press('input[placeholder*="$0.00"]', 'Enter');
    await page.waitForTimeout(1000);
    error = await page.locator('text=/❌/').textContent().catch(() => null);
    console.log(error ? `   ❌ ${error}` : '   ✅ Línea agregada');
    console.log('');

    // Test 4: Palé (1234)
    console.log('🧪 TEST 4: "1234" → Palé');
    await page.fill('input[placeholder*="Ej: 12"]', '1234');
    await page.waitForTimeout(500);
    hint = await page.locator('text=/Detectado:/').textContent().catch(() => '');
    console.log('   ' + hint);
    await page.fill('input[placeholder*="$0.00"]', '10');
    await page.press('input[placeholder*="$0.00"]', 'Enter');
    await page.waitForTimeout(1000);
    error = await page.locator('text=/❌/').textContent().catch(() => null);
    console.log(error ? `   ❌ ${error}` : '   ✅ Línea agregada');
    console.log('');

    // Test 5: Cash3 Combinaciones (123q)
    console.log('🧪 TEST 5: "123q" → Cash3 Combinaciones');
    await page.fill('input[placeholder*="Ej: 12"]', '123q');
    await page.waitForTimeout(500);
    hint = await page.locator('text=/Detectado:/').textContent().catch(() => '');
    console.log('   ' + hint);
    await page.fill('input[placeholder*="$0.00"]', '10');
    await page.press('input[placeholder*="$0.00"]', 'Enter');
    await page.waitForTimeout(1500);
    error = await page.locator('text=/❌/').textContent().catch(() => null);
    console.log(error ? `   ❌ ${error}` : '   ✅ Línea(s) agregada(s)');
    console.log('');

    // Screenshot final
    console.log('📸 Capturando screenshot...');
    await page.screenshot({ path: 'validation-test.png', fullPage: true });
    console.log('✅ Screenshot: validation-test.png\n');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'validation-error.png' });
  } finally {
    await browser.close();
  }
})();
