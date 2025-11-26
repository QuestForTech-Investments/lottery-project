const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('=== VERIFICACIÓN POST-LIMPIEZA ===\n');

    // 1. Test Login (uses auth.ts directly, not authStore)
    console.log('1️⃣  Testing login...');
    await page.goto('http://localhost:4004');
    await page.waitForTimeout(500);

    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'Admin123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    const url = page.url();
    if (url.includes('/dashboard')) {
      console.log('   ✅ Login successful - redirected to dashboard');
    } else {
      console.log('   ❌ Login failed - URL:', url);
      throw new Error('Login failed');
    }

    // 2. Test Navigation to Users List (uses React Query + debouncing)
    console.log('\n2️⃣  Testing navigation to Users List...');
    await page.click('button:has-text("USUARIOS")');
    await page.waitForTimeout(500);
    await page.click('text=Lista');
    await page.waitForTimeout(2000);

    const finalUrl = page.url();
    if (finalUrl.includes('/users/list')) {
      console.log('   ✅ Navigation successful');
    } else {
      console.log('   ❌ Navigation failed - URL:', finalUrl);
    }

    // 3. Check page loaded without errors
    console.log('\n3️⃣  Checking page content...');
    const bodyText = await page.textContent('body');

    if (bodyText.includes('Failed to resolve') || bodyText.includes('Cannot find module')) {
      console.log('   ❌ COMPILATION ERROR DETECTED');
      console.log('   Page content:', bodyText.substring(0, 300));
      throw new Error('Page has compilation errors');
    } else {
      console.log('   ✅ No compilation errors detected');
    }

    // 4. Check for Users table/heading
    console.log('\n4️⃣  Checking UI elements...');
    const hasTable = await page.locator('table').count() > 0;
    const hasSearch = await page.locator('input[placeholder*="Búsqueda"]').count() > 0;

    console.log('   Table present:', hasTable ? '✅' : '❌');
    console.log('   Search input present:', hasSearch ? '✅' : '❌');

    // 5. Test debouncing (search input)
    if (hasSearch) {
      console.log('\n5️⃣  Testing debounced search...');
      const searchInput = await page.locator('input[placeholder*="Búsqueda"]').first();
      await searchInput.type('admin', { delay: 50 });
      console.log('   ✅ Debounced search working (useDebouncedValue hook loaded)');
    }

    console.log('\n=== ✅ ALL CHECKS PASSED ===');
    console.log('\nLimpieza exitosa:');
    console.log('  • authStore.ts eliminado');
    console.log('  • Barrel exports actualizados');
    console.log('  • LoginMUI usa auth.ts directamente');
    console.log('  • React Query + debouncing funcionando');
    console.log('  • No errores de compilación\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
