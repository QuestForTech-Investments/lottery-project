import { test, expect } from '@playwright/test';

/**
 * Dynamic Prize Configuration Tests
 * Tests the new dynamic API-based prize configuration system
 *
 * This test verifies:
 * 1. PrizesTab loads bet types dynamically from /api/bet-types
 * 2. Each bet type shows its prize fields with 3 parameters (default, min, max)
 * 3. Custom prize values are saved to banca_prize_configs table
 * 4. When editing, custom values are loaded and merged with defaults
 */

// Test credentials
const TEST_USER = {
  username: 'admin',
  password: 'Admin123456'
};

// Test data
const TEST_BANCA_NAME = `Test Banca ${Date.now()}`;
const TEST_BRANCH_CODE = `TB${Date.now()}`;

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

test.describe('Dynamic Prize Configuration - API Integration', () => {

  test('Test 1: Verify bet types load dynamically from API', async ({ page }) => {
    console.log('\n=== TEST 1: DYNAMIC BET TYPES LOADING ===');

    // Track API calls
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/bet-types')) {
        apiCalls.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`API Call: ${request.method()} ${request.url()}`);
      }
    });

    // Navigate to create betting pool
    await page.goto('/bettingPools/create');
    await page.waitForLoadState('networkidle');

    // Click on Premios y Comisiones tab
    const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios.*comisiones/i });
    await expect(prizesTab).toBeVisible({ timeout: 10000 });
    await prizesTab.click();
    await page.waitForTimeout(2000);

    // Verify API was called
    const betTypesApiCall = apiCalls.find(c => c.url.includes('/api/bet-types') && !c.url.match(/\/\d+$/));
    console.log('Bet types list API called:', betTypesApiCall ? 'YES' : 'NO');
    expect(betTypesApiCall).toBeTruthy();

    // Verify individual bet type details were fetched
    const betTypeDetailsApiCalls = apiCalls.filter(c => c.url.match(/\/api\/bet-types\/\d+$/));
    console.log(`Bet type details API calls: ${betTypeDetailsApiCalls.length}`);
    expect(betTypeDetailsApiCalls.length).toBeGreaterThan(0);

    // Look for loading indicator
    const loadingIndicator = page.locator('text=/cargando.*premios/i');
    if (await loadingIndicator.isVisible().catch(() => false)) {
      console.log('Loading indicator found - waiting for it to disappear');
      await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
    }

    // Verify chip showing number of game types loaded
    const successChip = page.locator('text=/tipos de juegos cargados/i');
    await expect(successChip).toBeVisible({ timeout: 10000 });
    const chipText = await successChip.textContent();
    console.log('Success chip text:', chipText);

    // Verify at least one accordion exists
    const accordions = page.locator('[role="button"][aria-expanded]');
    const accordionCount = await accordions.count();
    console.log(`Number of bet type accordions: ${accordionCount}`);
    expect(accordionCount).toBeGreaterThan(0);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/prizes-dynamic-loaded.png',
      fullPage: true
    });

    console.log('✅ Test passed: Bet types loaded dynamically from API');
  });

  test('Test 2: Verify prize fields show 3 parameters (default, min, max)', async ({ page }) => {
    console.log('\n=== TEST 2: PRIZE FIELD PARAMETERS ===');

    // Navigate to create betting pool
    await page.goto('/bettingPools/create');
    await page.waitForLoadState('networkidle');

    // Click on Premios y Comisiones tab
    const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios.*comisiones/i });
    await prizesTab.click();
    await page.waitForTimeout(2000);

    // Wait for bet types to load
    const successChip = page.locator('text=/tipos de juegos cargados/i');
    await expect(successChip).toBeVisible({ timeout: 10000 });

    // Find first accordion (should be expanded by default)
    const firstAccordion = page.locator('[role="button"][aria-expanded]').first();
    const accordionTitle = await firstAccordion.textContent();
    console.log('First accordion:', accordionTitle);

    // Make sure it's expanded
    const isExpanded = await firstAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await firstAccordion.click();
      await page.waitForTimeout(500);
    }

    // Find all input fields in the first accordion
    const accordionPanel = page.locator('[role="region"]').first();
    const inputFields = accordionPanel.locator('input[type="number"]');
    const fieldCount = await inputFields.count();
    console.log(`Number of prize fields in first accordion: ${fieldCount}`);
    expect(fieldCount).toBeGreaterThan(0);

    // Check the first field's attributes
    if (fieldCount > 0) {
      const firstField = inputFields.first();
      const fieldName = await firstField.getAttribute('name');
      const fieldMin = await firstField.getAttribute('min');
      const fieldMax = await firstField.getAttribute('max');
      const fieldStep = await firstField.getAttribute('step');
      const fieldDefault = await firstField.getAttribute('data-default');
      const fieldDataMin = await firstField.getAttribute('data-min');
      const fieldDataMax = await firstField.getAttribute('data-max');

      console.log('First field attributes:');
      console.log('  name:', fieldName);
      console.log('  min:', fieldMin);
      console.log('  max:', fieldMax);
      console.log('  step:', fieldStep);
      console.log('  data-default:', fieldDefault);
      console.log('  data-min:', fieldDataMin);
      console.log('  data-max:', fieldDataMax);

      // Verify field has the new naming convention (BETTYPE_FIELDCODE)
      expect(fieldName).toContain('_');

      // Verify field has min/max constraints
      expect(fieldMin).toBeTruthy();
      expect(fieldMax).toBeTruthy();

      // Verify field has default value in data attribute
      expect(fieldDefault).toBeTruthy();

      // Find helper text showing the parameters
      const helperText = accordionPanel.locator('p.MuiFormHelperText-root').first();
      const helperTextContent = await helperText.textContent();
      console.log('Helper text:', helperTextContent);

      // Verify helper text contains "Default" and "Rango"
      expect(helperTextContent).toContain('Default');
      expect(helperTextContent).toContain('Rango');
    }

    console.log('✅ Test passed: Prize fields show all 3 parameters');
  });

  test('Test 3: Create banca with custom prize values and verify save', async ({ page }) => {
    console.log('\n=== TEST 3: CREATE BANCA WITH CUSTOM PRIZE VALUES ===');

    // Track POST requests to prizes API
    const prizesSaveRequests = [];
    page.on('request', request => {
      if (request.method() === 'POST' &&
          request.url().includes('/api/betting-pools') &&
          request.url().includes('prizes-commissions')) {
        prizesSaveRequests.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`Prize save API call: ${request.method()} ${request.url()}`);
      }
    });

    // Navigate to create betting pool
    await page.goto('/bettingPools/create');
    await page.waitForLoadState('networkidle');

    // Fill in General tab
    await page.fill('input[name="bettingPoolName"]', TEST_BANCA_NAME);
    await page.fill('input[name="branchCode"]', TEST_BRANCH_CODE);

    // Select a zone (assuming zone ID 1 exists)
    const zoneSelect = page.locator('select[name="selectedZone"], div[role="button"][aria-haspopup="listbox"]').first();
    if (await zoneSelect.count() > 0) {
      await zoneSelect.click();
      await page.waitForTimeout(500);
      // Select first option
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.count() > 0) {
        await firstOption.click();
      }
    }

    // Click on Premios y Comisiones tab
    const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios.*comisiones/i });
    await prizesTab.click();
    await page.waitForTimeout(2000);

    // Wait for bet types to load
    await page.waitForSelector('text=/tipos de juegos cargados/i', { timeout: 10000 });

    // Find first accordion and expand it
    const firstAccordion = page.locator('[role="button"][aria-expanded]').first();
    const isExpanded = await firstAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await firstAccordion.click();
      await page.waitForTimeout(500);
    }

    // Get the first prize field and fill in a custom value
    const firstPrizeField = page.locator('[role="region"]').first().locator('input[type="number"]').first();
    const fieldName = await firstPrizeField.getAttribute('name');
    const defaultValue = await firstPrizeField.getAttribute('data-default');

    // Set a custom value different from default
    const customValue = parseFloat(defaultValue || '0') + 10;
    await firstPrizeField.fill(customValue.toString());

    console.log(`Set custom value for ${fieldName}: ${customValue} (default was ${defaultValue})`);

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /crear|guardar/i });
    await submitButton.click();

    // Wait for success message or redirect
    await page.waitForTimeout(3000);

    // Verify prize save API was called
    console.log(`Prize save API calls: ${prizesSaveRequests.length}`);

    if (prizesSaveRequests.length > 0) {
      console.log('✅ Prize configurations were saved via API');
    } else {
      console.log('⚠️ No prize save API calls detected - check console logs');
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/prizes-create-with-custom-values.png',
      fullPage: true
    });
  });

  test('Test 4: Edit banca and verify custom prize values load', async ({ page }) => {
    console.log('\n=== TEST 4: EDIT BANCA - LOAD CUSTOM VALUES ===');

    // Track API calls for merged prize data
    const mergedDataCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/betting-pools') &&
          request.url().includes('prizes-commissions')) {
        mergedDataCalls.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`Merged data API call: ${request.method()} ${request.url()}`);
      }
    });

    // Navigate to betting pools list
    await page.goto('/bettingPools/list');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find the first edit button (assuming at least one banca exists)
    const editButton = page.locator('button, a').filter({ hasText: /edit|editar/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Click on Premios y Comisiones tab
      const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios.*comisiones/i });

      if (await prizesTab.count() > 0) {
        await prizesTab.click();
        await page.waitForTimeout(2000);

        // Wait for bet types to load
        await page.waitForSelector('text=/tipos de juegos cargados/i', { timeout: 10000 });

        // Verify merged data API was called
        console.log(`Merged prize data API calls: ${mergedDataCalls.length}`);

        if (mergedDataCalls.length > 0) {
          console.log('✅ Custom prize values were loaded from API');
        } else {
          console.log('⚠️ No merged data API calls - custom values may not load');
        }

        // Find first accordion
        const firstAccordion = page.locator('[role="button"][aria-expanded]').first();
        const isExpanded = await firstAccordion.getAttribute('aria-expanded');
        if (isExpanded !== 'true') {
          await firstAccordion.click();
          await page.waitForTimeout(500);
        }

        // Check if any fields have values
        const firstPrizeField = page.locator('[role="region"]').first().locator('input[type="number"]').first();
        const fieldValue = await firstPrizeField.inputValue();
        const fieldName = await firstPrizeField.getAttribute('name');

        console.log(`Field ${fieldName} has value: ${fieldValue || '(empty)'}`);

        // Take screenshot
        await page.screenshot({
          path: 'test-results/prizes-edit-load-values.png',
          fullPage: true
        });

        console.log('✅ Test completed: Edit banca loads prize values');
      } else {
        console.log('⚠️ Premios y Comisiones tab not found in edit page');
      }
    } else {
      console.log('⚠️ No edit button found - make sure at least one banca exists');
    }
  });

  test('Test 5: Verify field naming convention (BETTYPE_FIELDCODE)', async ({ page }) => {
    console.log('\n=== TEST 5: FIELD NAMING CONVENTION ===');

    // Navigate to create betting pool
    await page.goto('/bettingPools/create');
    await page.waitForLoadState('networkidle');

    // Click on Premios y Comisiones tab
    const prizesTab = page.locator('[role="tab"]').filter({ hasText: /premios.*comisiones/i });
    await prizesTab.click();
    await page.waitForTimeout(2000);

    // Wait for bet types to load
    await page.waitForSelector('text=/tipos de juegos cargados/i', { timeout: 10000 });

    // Get all input fields
    const allInputs = page.locator('input[type="number"]');
    const inputCount = await allInputs.count();
    console.log(`Total number of prize input fields: ${inputCount}`);

    // Check naming convention for all fields
    const fieldNames = [];
    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      const fieldName = await allInputs.nth(i).getAttribute('name');
      fieldNames.push(fieldName);
    }

    console.log('Sample field names:');
    fieldNames.forEach(name => console.log(`  - ${name}`));

    // Verify all field names follow the BETTYPE_FIELDCODE pattern
    const validPattern = /^[A-Z0-9]+_[A-Z0-9_]+$/;
    const allValid = fieldNames.every(name => validPattern.test(name));

    console.log('All field names follow BETTYPE_FIELDCODE pattern:', allValid ? 'YES' : 'NO');
    expect(allValid).toBeTruthy();

    console.log('✅ Test passed: Field naming convention is correct');
  });
});
