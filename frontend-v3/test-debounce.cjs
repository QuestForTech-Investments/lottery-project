const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Track API requests
  const apiRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/users')) {
      const timestamp = Date.now();
      apiRequests.push({
        url: request.url(),
        timestamp,
        params: new URL(request.url()).searchParams.toString()
      });
    }
  });

  try {
    console.log('=== TEST DEBOUNCING (500ms delay) ===\n');

    // Login
    await page.goto('http://localhost:4004');
    await page.waitForTimeout(500);
    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'Admin123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    // Navigate to users list
    await page.click('button:has-text("USUARIOS")');
    await page.waitForTimeout(500);
    await page.click('text=Lista');
    await page.waitForTimeout(2000);

    console.log('✓ Initial page load');
    const initialRequests = apiRequests.length;
    console.log(`  Initial API calls: ${initialRequests}\n`);

    // Clear tracked requests
    apiRequests.length = 0;

    // Type search text rapidly (simulating fast typing)
    console.log('⌨️  Typing "admin" rapidly...');
    const searchInput = await page.locator('input[placeholder*="Búsqueda"]');

    const startTime = Date.now();
    await searchInput.type('a', { delay: 50 });
    await searchInput.type('d', { delay: 50 });
    await searchInput.type('m', { delay: 50 });
    await searchInput.type('i', { delay: 50 });
    await searchInput.type('n', { delay: 50 });

    const typingDuration = Date.now() - startTime;
    console.log(`  Typing took: ${typingDuration}ms`);
    console.log(`  API calls during typing: ${apiRequests.length}`);

    // Wait for debounce delay + network
    console.log('  Waiting 700ms for debounce (500ms) + network...');
    await page.waitForTimeout(700);

    const finalRequests = apiRequests.length;
    console.log(`  Total API calls after debounce: ${finalRequests}\n`);

    // Analyze results
    if (finalRequests === 1) {
      console.log('✅ SUCCESS: Debouncing working perfectly!');
      console.log('   Only 1 API call made after typing stopped\n');
    } else if (finalRequests === 0) {
      console.log('⚠️  No API calls detected - might need longer wait');
    } else {
      console.log('❌ FAILED: Multiple API calls detected');
      console.log(`   Expected: 1 call, Got: ${finalRequests} calls\n`);
    }

    // Show request details
    if (apiRequests.length > 0) {
      console.log('API Request Details:');
      apiRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.params || 'no params'}`);
      });
    }

    console.log('\n=== Debounce Benefit ===');
    console.log(`Without debounce: 5 API calls (one per keystroke)`);
    console.log(`With debounce: ${finalRequests} API call(s)`);
    console.log(`Reduction: ${((5 - finalRequests) / 5 * 100).toFixed(0)}% fewer requests\n`);

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
})();
