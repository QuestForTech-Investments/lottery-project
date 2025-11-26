const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to frontend-v3
    console.log('Navigating to http://localhost:4005...');
    await page.goto('http://localhost:4005');
    await page.waitForTimeout(1000);

    // Fill login form
    console.log('Filling login form...');
    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'Admin123456');

    // Click login button
    console.log('Clicking login button...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Verify dashboard loaded
    console.log('Checking dashboard loaded...');
    const url = page.url();
    console.log('Current URL:', url);

    // Click USUARIOS button
    console.log('Clicking USUARIOS button...');
    await page.click('button:has-text("USUARIOS")');
    await page.waitForTimeout(1000);

    // Click Lista submenu
    console.log('Clicking Lista submenu...');
    await page.click('text=Lista');
    await page.waitForTimeout(2000);

    // Check final URL
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);

    // Check if page loaded successfully
    const pageContent = await page.textContent('body');
    if (pageContent.includes('Error') || pageContent.includes('Failed to resolve')) {
      console.error('ERROR: Page has compilation error!');
      console.log('Page content:', pageContent.substring(0, 500));
    } else {
      console.log('SUCCESS: UserList page loaded without errors!');
      // Try to find the Users table or heading
      const hasHeading = await page.locator('h4:has-text("Usuarios")').count() > 0;
      const hasTable = await page.locator('table').count() > 0;
      console.log('Has "Usuarios" heading:', hasHeading);
      console.log('Has table:', hasTable);
    }

  } catch (error) {
    console.error('Test error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await browser.close();
  }
})();
