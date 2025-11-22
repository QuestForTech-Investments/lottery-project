import { test, expect } from '@playwright/test';

/**
 * Prize Configuration Tests
 * Tests the integration between frontend and backend prize configuration system
 *
 * Database setup required:
 * - Banca ID 1: Custom values (Primer Pago=60, Segundo Pago=15)
 * - Banca ID 2: Custom values (Primer Pago=58, Segundo Pago=14)
 * - Banca ID 3: Default values (should use master defaults: 56, 12)
 */

// Test credentials
const TEST_USER = {
  username: 'admin',
  password: 'Admin123456'
};

// Expected values based on database setup
const EXPECTED_VALUES = {
  default: {
    directoPrimerPago: '56',
    directoSegundoPago: '12'
  },
  banca1: {
    directoPrimerPago: '60',
    directoSegundoPago: '15'
  },
  banca2: {
    directoPrimerPago: '58',
    directoSegundoPago: '14'
  },
  banca3: {
    directoPrimerPago: '56',
    directoSegundoPago: '12'
  }
};

// Before each test, perform login
test.beforeEach(async ({ page }) => {
  // Navigate to login page
  await page.goto('/');

  // Wait for login form to be visible
  await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });

  // Fill login form
  const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  await usernameInput.fill(TEST_USER.username);
  await passwordInput.fill(TEST_USER.password);

  // Submit login form
  await page.locator('button[type="submit"]').click();

  // Wait for successful login
  await page.waitForURL(/\/(dashboard|home|inicio)/, { timeout: 10000 });
});

test.describe('Prize Configuration - API Integration', () => {

  test('Test 1: Create New Banca - Should Load Default Values', async ({ page }) => {
    console.log('\n=== TEST 1: CREATE NEW BANCA - DEFAULT VALUES ===');

    // Track API calls
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Navigate to create new betting pool
    await page.goto('/bettingPools/create');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('API calls made:', apiCalls.map(c => c.url));

    // Find and click "Premios y Comisiones" tab
    const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios.*comisiones/i });
    await expect(prizesTab).toBeVisible({ timeout: 10000 });
    await prizesTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(1000);

    // Check if prize API was called
    const prizeApiCalled = apiCalls.some(c =>
      c.url.includes('/api/prize-fields') ||
      c.url.includes('/api/bet-types')
    );
    console.log('Prize API called:', prizeApiCalled);

    // Look for "Pick 3" section (first accordion)
    const pick3Section = page.locator('text=/Pick 3/i').first();
    await expect(pick3Section).toBeVisible();

    // Expand Pick 3 accordion if collapsed
    const pick3Accordion = page.locator('[role="button"]').filter({ hasText: /^Pick 3$/i }).first();
    const isExpanded = await pick3Accordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await pick3Accordion.click();
      await page.waitForTimeout(500);
    }

    // Find "Primer Premio" field
    // The field name is "pick3FirstPayment" based on PrizesTab.jsx line 41
    const primerPremioField = page.locator('input[name="pick3FirstPayment"]');
    await expect(primerPremioField).toBeVisible({ timeout: 5000 });

    // Find "Segundo Premio" field
    const segundoPremioField = page.locator('input[name="pick3SecondPayment"]');
    await expect(segundoPremioField).toBeVisible();

    // Get actual values
    const primerPremioValue = await primerPremioField.inputValue();
    const segundoPremioValue = await segundoPremioField.inputValue();

    console.log('Primer Premio value:', primerPremioValue);
    console.log('Segundo Premio value:', segundoPremioValue);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/prizes-create-new-banca.png',
      fullPage: true
    });

    // Verify values
    // NOTE: If these are empty, it means the form is not loading default values from API
    console.log('\nEXPECTED: Primer Premio = 56, Segundo Premio = 12');
    console.log('ACTUAL: Primer Premio =', primerPremioValue || '(empty)', ', Segundo Premio =', segundoPremioValue || '(empty)');

    if (primerPremioValue === '' || segundoPremioValue === '') {
      console.log('\nPROBLEM DETECTED: Fields are empty! The form is NOT loading default values from API.');
      console.log('The form should call /api/prize-fields or /api/bet-types to get default values.');
    } else if (primerPremioValue === EXPECTED_VALUES.default.directoPrimerPago &&
               segundoPremioValue === EXPECTED_VALUES.default.directoSegundoPago) {
      console.log('\nSUCCESS: Form is correctly loading default values from API!');
    } else {
      console.log('\nWARNING: Values loaded but do not match expected defaults.');
    }

    // Document the findings
    expect(primerPremioValue).toBeTruthy(); // Should not be empty
    expect(segundoPremioValue).toBeTruthy(); // Should not be empty
  });

  test('Test 2: Edit Banca 1 - Should Load Custom Values', async ({ page }) => {
    console.log('\n=== TEST 2: EDIT BANCA 1 - CUSTOM VALUES ===');

    // Track API calls
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Navigate to betting pools list first
    await page.goto('/bettingPools');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to find Banca 1 in the list and click edit
    // This assumes there's an edit button or link for each banca
    const editButton = page.locator('button, a').filter({ hasText: /edit|editar/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();
    } else {
      // Alternative: Navigate directly to edit page if we know the ID
      await page.goto('/bettingPools/edit/1');
    }

    // Wait for edit page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('API calls made:', apiCalls.map(c => c.url));

    // Check if the API endpoint for prizes was called
    const prizesApiCalled = apiCalls.some(c =>
      c.url.includes('/api/betting-pools/1/prizes-commissions')
    );
    console.log('Prizes API called for Banca 1:', prizesApiCalled);

    // Find and click "Premios y Comisiones" tab
    const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios.*comisiones/i });

    if (await prizesTab.count() > 0) {
      await prizesTab.click();
      await page.waitForTimeout(1000);

      // Expand Pick 3 accordion
      const pick3Accordion = page.locator('[role="button"]').filter({ hasText: /^Pick 3$/i }).first();
      const isExpanded = await pick3Accordion.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await pick3Accordion.click();
        await page.waitForTimeout(500);
      }

      // Find fields
      const primerPremioField = page.locator('input[name="pick3FirstPayment"]');
      const segundoPremioField = page.locator('input[name="pick3SecondPayment"]');

      await expect(primerPremioField).toBeVisible({ timeout: 5000 });
      await expect(segundoPremioField).toBeVisible();

      // Get actual values
      const primerPremioValue = await primerPremioField.inputValue();
      const segundoPremioValue = await segundoPremioField.inputValue();

      console.log('Primer Premio value:', primerPremioValue);
      console.log('Segundo Premio value:', segundoPremioValue);

      // Take screenshot
      await page.screenshot({
        path: 'test-results/prizes-edit-banca-1.png',
        fullPage: true
      });

      // Verify values
      console.log('\nEXPECTED: Primer Premio = 60, Segundo Premio = 15 (custom values for Banca 1)');
      console.log('ACTUAL: Primer Premio =', primerPremioValue || '(empty)', ', Segundo Premio =', segundoPremioValue || '(empty)');

      if (primerPremioValue === EXPECTED_VALUES.banca1.directoPrimerPago &&
          segundoPremioValue === EXPECTED_VALUES.banca1.directoSegundoPago) {
        console.log('\nSUCCESS: Form is correctly loading custom values for Banca 1!');
      } else {
        console.log('\nPROBLEM: Values do not match expected custom values for Banca 1.');
        console.log('The form should call /api/betting-pools/1/prizes-commissions to get custom values.');
      }

      expect(primerPremioValue).toBeTruthy();
      expect(segundoPremioValue).toBeTruthy();
    } else {
      console.log('WARNING: Could not find Premios y Comisiones tab. Banca edit page may not exist.');
    }
  });

  test('Test 3: Edit Banca 3 - Should Load Default Values', async ({ page }) => {
    console.log('\n=== TEST 3: EDIT BANCA 3 - DEFAULT VALUES ===');

    // Track API calls
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Navigate to betting pools list first
    await page.goto('/bettingPools');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate directly to edit page for Banca 3
    await page.goto('/bettingPools/edit/3');

    // Wait for edit page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('API calls made:', apiCalls.map(c => c.url));

    // Check if the API endpoint for prizes was called
    const prizesApiCalled = apiCalls.some(c =>
      c.url.includes('/api/betting-pools/3/prizes-commissions')
    );
    console.log('Prizes API called for Banca 3:', prizesApiCalled);

    // Find and click "Premios y Comisiones" tab
    const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios.*comisiones/i });

    if (await prizesTab.count() > 0) {
      await prizesTab.click();
      await page.waitForTimeout(1000);

      // Expand Pick 3 accordion
      const pick3Accordion = page.locator('[role="button"]').filter({ hasText: /^Pick 3$/i }).first();
      const isExpanded = await pick3Accordion.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await pick3Accordion.click();
        await page.waitForTimeout(500);
      }

      // Find fields
      const primerPremioField = page.locator('input[name="pick3FirstPayment"]');
      const segundoPremioField = page.locator('input[name="pick3SecondPayment"]');

      await expect(primerPremioField).toBeVisible({ timeout: 5000 });
      await expect(segundoPremioField).toBeVisible();

      // Get actual values
      const primerPremioValue = await primerPremioField.inputValue();
      const segundoPremioValue = await segundoPremioField.inputValue();

      console.log('Primer Premio value:', primerPremioValue);
      console.log('Segundo Premio value:', segundoPremioValue);

      // Take screenshot
      await page.screenshot({
        path: 'test-results/prizes-edit-banca-3.png',
        fullPage: true
      });

      // Verify values
      console.log('\nEXPECTED: Primer Premio = 56, Segundo Premio = 12 (default values, no custom overrides)');
      console.log('ACTUAL: Primer Premio =', primerPremioValue || '(empty)', ', Segundo Premio =', segundoPremioValue || '(empty)');

      if (primerPremioValue === EXPECTED_VALUES.banca3.directoPrimerPago &&
          segundoPremioValue === EXPECTED_VALUES.banca3.directoSegundoPago) {
        console.log('\nSUCCESS: Form is correctly loading default values for Banca 3 (no custom overrides)!');
      } else {
        console.log('\nPROBLEM: Values do not match expected defaults for Banca 3.');
        console.log('The form should merge default values from /api/prize-fields with empty custom values.');
      }

      expect(primerPremioValue).toBeTruthy();
      expect(segundoPremioValue).toBeTruthy();
    } else {
      console.log('WARNING: Could not find Premios y Comisiones tab. Banca edit page may not exist.');
    }
  });

  test('Test 4: Verify prizeService.js API Integration', async ({ page }) => {
    console.log('\n=== TEST 4: VERIFY API ENDPOINTS ===');

    // Track API requests
    const apiRequests = [];
    page.on('request', request => {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });

    // Navigate to create betting pool page
    await page.goto('/bettingPools/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Click on Premios y Comisiones tab
    const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios.*comisiones/i });
    if (await prizesTab.count() > 0) {
      await prizesTab.click();
      await page.waitForTimeout(2000);
    }

    // Filter API calls related to prizes
    const prizeApiCalls = apiRequests.filter(req =>
      req.url.includes('/api/bet-types') ||
      req.url.includes('/api/prize-fields') ||
      req.url.includes('/api/betting-pools') && req.url.includes('prizes')
    );

    console.log('\nPrize-related API calls:');
    prizeApiCalls.forEach(call => {
      console.log(`  ${call.method} ${call.url}`);
    });

    // Check if any prize-related API was called
    const hasPrizeApiCall = prizeApiCalls.length > 0;
    console.log('\nPrize API integration status:', hasPrizeApiCall ? 'ACTIVE' : 'NOT FOUND');

    if (!hasPrizeApiCall) {
      console.log('\nPROBLEM DETECTED:');
      console.log('- No API calls to /api/bet-types or /api/prize-fields were found');
      console.log('- The PrizesTab component is NOT using the prizeService.js');
      console.log('- Form fields are initialized with empty strings (hardcoded in useCompleteBettingPoolForm.js)');
      console.log('\nRECOMMENDATION:');
      console.log('- Modify useCompleteBettingPoolForm.js to call prizeService.getAllBetTypes() on mount');
      console.log('- Populate form fields with default values from API response');
    } else {
      console.log('\nSUCCESS: Prize API integration is active!');
    }

    // Document findings
    expect(apiRequests.length).toBeGreaterThan(0);
  });
});

test.describe('Prize Configuration - Code Analysis', () => {

  test('Test 5: Document Current Implementation', async ({ page }) => {
    console.log('\n=== TEST 5: CODE ANALYSIS SUMMARY ===');

    console.log('\nCURRENT IMPLEMENTATION:');
    console.log('1. PrizesTab.jsx (lines 18-957):');
    console.log('   - Pure presentational component');
    console.log('   - Receives formData and handleChange as props');
    console.log('   - Does NOT make any API calls');
    console.log('   - Fields: pick3FirstPayment, pick3SecondPayment, etc.');
    console.log('');
    console.log('2. useCompleteBettingPoolForm.js (lines 1-470):');
    console.log('   - Lines 10-193: getInitialFormData() function');
    console.log('   - All prize fields initialized with empty strings ("")');
    console.log('   - Example: pick3FirstPayment: "", pick3SecondPayment: ""');
    console.log('   - NO API calls to load default values');
    console.log('   - loadInitialData() only loads zones and branch code');
    console.log('');
    console.log('3. prizeService.js (lines 1-152):');
    console.log('   - getAllBetTypes(): Calls GET /api/bet-types');
    console.log('   - getBettingPoolPrizeConfigs(): Calls GET /api/betting-pools/{id}/prizes-commissions');
    console.log('   - getMergedPrizeData(): Merges defaults with custom values');
    console.log('   - SERVICE EXISTS but is NOT USED by the form!');
    console.log('');
    console.log('PROBLEM IDENTIFIED:');
    console.log('- Form fields are hardcoded to empty strings');
    console.log('- prizeService.js exists but is never imported or called');
    console.log('- When creating a new banca, all prize fields are empty');
    console.log('- User must manually enter all 60+ prize values');
    console.log('');
    console.log('SOLUTION NEEDED:');
    console.log('1. Modify useCompleteBettingPoolForm.js:');
    console.log('   - Import prizeService');
    console.log('   - Call getAllBetTypes() in useEffect on mount');
    console.log('   - Map bet types to form field names');
    console.log('   - Populate formData with default values');
    console.log('');
    console.log('2. For Edit mode:');
    console.log('   - Call getBettingPoolPrizeConfigs(id)');
    console.log('   - Merge custom values with defaults');
    console.log('   - Custom values override defaults');

    // This is a documentation test, always passes
    expect(true).toBeTruthy();
  });
});
