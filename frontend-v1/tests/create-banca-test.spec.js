import { test, expect } from '@playwright/test';

/**
 * Helper function to login
 * Based on PLAYWRIGHT.md documentation
 */
async function login(page, username = 'admin', password = 'Admin123456') {
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#log-in');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000); // Extra wait for UI to settle
}

test('crear banca con datos mínimos', async ({ page }) => {
  // Step 1: Login
  console.log('Step 1: Logging in...');
  await login(page);

  // Step 2: Navigate to Create Banca
  console.log('Step 2: Navigating to Create Banca form...');
  await page.goto('http://localhost:3000/bancas/crear');
  await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });

  // Step 3: Fill General tab fields
  console.log('Step 3: Filling General tab fields...');
  const timestamp = Date.now();
  await page.fill('input[name="branchName"]', `Banca Test ${timestamp}`);
  await page.fill('input[name="username"]', `testuser${timestamp}`);
  await page.fill('input[name="password"]', 'test123');
  await page.fill('input[name="confirmPassword"]', 'test123');
  await page.fill('input[name="location"]', 'Test Location Playwright');
  await page.fill('input[name="reference"]', 'Test Reference');

  // Step 4: Go to Configuration tab and select zone
  console.log('Step 4: Selecting zone in Configuration tab...');
  await page.click('button.tab:has-text("Configuración")');
  await page.waitForSelector('select[name="selectedZone"]');
  await page.selectOption('select[name="selectedZone"]', { index: 1 });

  // Step 5: Setup API response/request listeners
  console.log('Step 5: Setting up API listeners...');
  page.on('response', response => {
    if (response.url().includes('/api/betting-pools') && response.request().method() === 'POST') {
      console.log('✅ POST Response Status:', response.status());
      response.text().then(body => {
        console.log('✅ Response Body:', body);
      });
    }
  });

  page.on('request', request => {
    if (request.url().includes('/api/betting-pools') && request.method() === 'POST') {
      console.log('📤 POST Request Body:', request.postData());
    }
  });

  // Step 6: Setup promise to wait for API response
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/betting-pools') &&
                response.request().method() === 'POST',
    { timeout: 10000 }
  );

  // Step 7: Click CREAR button
  console.log('Step 6: Submitting form...');
  await page.click('button.create-button:has-text("CREAR")');

  // Step 8: Wait for API response
  console.log('Step 7: Waiting for API response...');
  const response = await responsePromise;
  console.log('✅ API Response received with status:', response.status());

  // Check if successful
  if (response.status() === 201 || response.status() === 200) {
    console.log('✅ Banca created successfully!');
    const responseData = await response.json();
    console.log('Created banca data:', responseData);

    // Verify the response contains expected fields
    expect(responseData.bettingPoolId).toBeTruthy();
    expect(responseData.bettingPoolCode).toBeTruthy();
    expect(responseData.bettingPoolName).toContain('Banca Test');
    expect(responseData.location).toBe('Test Location Playwright');

    console.log('✅ All validations passed!');
  } else {
    console.log('❌ API returned error status:', response.status());
    const errorBody = await response.text();
    console.log('❌ Error body:', errorBody);

    // Fail the test with the error information
    throw new Error(`Failed to create banca. Status: ${response.status()}, Body: ${errorBody}`);
  }
});
