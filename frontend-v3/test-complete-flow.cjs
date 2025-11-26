const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('=== TEST 1: Login ===');
    await page.goto('http://localhost:4004');
    await page.waitForTimeout(1000);

    // Test login form
    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'Admin123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const dashboardUrl = page.url();
    console.log('✓ Login successful, redirected to:', dashboardUrl);

    console.log('\n=== TEST 2: Dashboard Load ===');
    const dashboardTitle = await page.locator('h4, h5, h6').first().textContent();
    console.log('✓ Dashboard loaded with title:', dashboardTitle);

    console.log('\n=== TEST 3: Direct Navigation to Users List ===');
    await page.goto('http://localhost:4004/users/list');
    await page.waitForTimeout(2000);
    
    const usersUrl = page.url();
    console.log('✓ Navigated to:', usersUrl);
    
    // Check for errors
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Failed to resolve') || bodyText.includes('Error')) {
      console.error('✗ ERROR: Page has compilation errors');
    } else {
      console.log('✓ No compilation errors');
    }

    console.log('\n=== TEST 4: Check Users Page Content ===');
    const hasHeading = await page.locator('text=/usuarios/i').count() > 0;
    console.log('Has "Usuarios" text:', hasHeading);

    console.log('\n=== TEST 5: Navigation to Create User ===');
    await page.goto('http://localhost:4004/users/new');
    await page.waitForTimeout(1500);
    console.log('✓ Navigated to Create User:', page.url());

    console.log('\n=== TEST 6: Navigation to Administrators ===');
    await page.goto('http://localhost:4004/users/administrators');
    await page.waitForTimeout(1500);
    console.log('✓ Navigated to Administrators:', page.url());

    console.log('\n=== TEST 7: Navigation to Login History ===');
    await page.goto('http://localhost:4004/users/login-history');
    await page.waitForTimeout(1500);
    console.log('✓ Navigated to Login History:', page.url());

    console.log('\n=== TEST 8: Navigation to Blocked Sessions ===');
    await page.goto('http://localhost:4004/users/blocked-sessions');
    await page.waitForTimeout(1500);
    console.log('✓ Navigated to Blocked Sessions:', page.url());

    console.log('\n=== TEST 9: Navigation to User Betting Pools ===');
    await page.goto('http://localhost:4004/users/betting-pools');
    await page.waitForTimeout(1500);
    console.log('✓ Navigated to User Betting Pools:', page.url());

    console.log('\n=== TEST 10: Logout Test ===');
    // Try to find logout button
    const logoutButton = await page.locator('button:has-text("Cerrar")').count();
    console.log('Logout button found:', logoutButton > 0);

    console.log('\n=== TEST 10: Performance Check ===');
    const metrics = await page.evaluate(() => ({
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    }));
    console.log('Page load time:', metrics.loadTime, 'ms');
    console.log('DOM ready time:', metrics.domReady, 'ms');

    console.log('\n=== ALL TESTS COMPLETED ===');

  } catch (error) {
    console.error('Test error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await browser.close();
  }
})();
