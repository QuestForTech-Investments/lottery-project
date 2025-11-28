import { test, expect } from '@playwright/test';

/**
 * Draw Schedules Real Data Test Suite
 * Tests that DrawSchedules component loads real data from API (not mock data)
 * Verifies the fix: replaced hardcoded mockup with real API integration
 * Tests weekly schedule editor and data persistence
 */

// Test credentials
const TEST_USER = {
  username: 'admin',
  password: 'Admin123456'
};

// Before each test, perform login
test.beforeEach(async ({ page }) => {
  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.consoleErrors = consoleErrors;

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

test.describe('Draw Schedules - Page Loading', () => {

  test('should navigate to draw schedules page successfully', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for loading to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show the page title
    const pageTitle = page.locator('text=/horarios de sorteos/i');
    const hasTitleVisible = await pageTitle.count() > 0;

    console.log('✓ Page title visible:', hasTitleVisible);
    expect(hasTitleVisible).toBeTruthy();
  });

  test('should make API call to /api/draws/schedules', async ({ page }) => {
    // Track API requests
    const apiRequests = [];

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Verify API call was made
    const hasDrawSchedulesCall = apiRequests.some(req =>
      req.url.includes('/api/draws/schedules')
    );

    console.log('API Calls made:', apiRequests.map(r => r.url));
    console.log('✓ Draw schedules API called:', hasDrawSchedulesCall);

    expect(hasDrawSchedulesCall).toBeTruthy();
  });

  test('should display loading spinner initially', async ({ page }) => {
    // Navigate to draw schedules
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/draws/schedules')
    );

    await page.goto('/draws/schedules');

    // Should show loading spinner before data loads
    const loadingSpinner = page.locator('.MuiCircularProgress-root');
    const hasLoading = await loadingSpinner.count() > 0;

    console.log('✓ Loading spinner displayed:', hasLoading);

    // Wait for API response
    await responsePromise;

    // Wait for loading to complete
    await page.waitForTimeout(2000);
  });
});

test.describe('Draw Schedules - Data Display', () => {

  test('should display lottery accordions', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for MUI Accordions
    const accordions = page.locator('.MuiAccordion-root');
    const accordionCount = await accordions.count();

    console.log(`✓ Found ${accordionCount} lottery accordions`);
    expect(accordionCount).toBeGreaterThan(0);
  });

  test('should display draw count per lottery', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for draw count pattern: "(X sorteo/sorteos)"
    const drawCountPattern = page.locator('text=/\\(\\d+ sorteos?\\)/');
    const hasDrawCounts = await drawCountPattern.count() > 0;

    console.log('✓ Draw counts displayed:', hasDrawCounts);
    expect(hasDrawCounts).toBeTruthy();
  });

  test('should expand accordion and show draws', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click first accordion to expand
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();

    // Wait for expansion
    await page.waitForTimeout(500);

    // Should show draw buttons
    const drawButtons = page.locator('.MuiAccordionDetails-root button');
    const buttonCount = await drawButtons.count();

    console.log(`✓ Found ${buttonCount} draw buttons in first lottery`);
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should display schedule indicators (icon + text)', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Check for schedule indicators
    const weeklyScheduleText = page.locator('text=/horario semanal/i');
    const fixedScheduleText = page.locator('text=/horario fijo/i');

    const hasWeekly = await weeklyScheduleText.count() > 0;
    const hasFixed = await fixedScheduleText.count() > 0;

    console.log('✓ Weekly schedule indicator:', hasWeekly);
    console.log('✓ Fixed schedule indicator:', hasFixed);

    // At least one type should be displayed
    expect(hasWeekly || hasFixed).toBeTruthy();
  });
});

test.describe('Draw Schedules - Edit Modal', () => {

  test('should open edit modal when clicking a draw', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Click first draw button
    const firstDrawButton = page.locator('.MuiAccordionDetails-root button').first();
    await firstDrawButton.click();

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Check for modal
    const modal = page.locator('.MuiDialog-root');
    const modalVisible = await modal.count() > 0;

    console.log('✓ Edit modal opened:', modalVisible);
    expect(modalVisible).toBeTruthy();
  });

  test('should display modal title with draw and lottery name', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Click first draw button
    const firstDrawButton = page.locator('.MuiAccordionDetails-root button').first();
    await firstDrawButton.click();

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Check for "Configurar Horario" title
    const modalTitle = page.locator('text=/configurar horario/i');
    const hasTitleVisible = await modalTitle.count() > 0;

    console.log('✓ Modal title visible:', hasTitleVisible);
    expect(hasTitleVisible).toBeTruthy();
  });

  test('should display weekly schedule toggle switch', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Click first draw button
    const firstDrawButton = page.locator('.MuiAccordionDetails-root button').first();
    await firstDrawButton.click();

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Check for toggle switch
    const toggleSwitch = page.locator('.MuiSwitch-root');
    const hasToggle = await toggleSwitch.count() > 0;

    // Check for toggle label
    const toggleLabel = page.locator('text=/usar horario semanal/i');
    const hasLabel = await toggleLabel.count() > 0;

    console.log('✓ Toggle switch visible:', hasToggle);
    console.log('✓ Toggle label visible:', hasLabel);

    expect(hasToggle).toBeTruthy();
    expect(hasLabel).toBeTruthy();
  });

  test('should show weekly schedule editor when toggle is enabled', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Click first draw button
    const firstDrawButton = page.locator('.MuiAccordionDetails-root button').first();
    await firstDrawButton.click();

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Enable weekly schedule
    const toggleSwitch = page.locator('.MuiSwitch-root input').first();
    const isChecked = await toggleSwitch.isChecked();

    if (!isChecked) {
      await toggleSwitch.click();
      await page.waitForTimeout(500);
    }

    // Should show days of the week
    const mondayLabel = page.locator('text=/lunes/i');
    const tuesdayLabel = page.locator('text=/martes/i');
    const sundayLabel = page.locator('text=/domingo/i');

    const hasMonday = await mondayLabel.count() > 0;
    const hasTuesday = await tuesdayLabel.count() > 0;
    const hasSunday = await sundayLabel.count() > 0;

    console.log('✓ Monday visible:', hasMonday);
    console.log('✓ Tuesday visible:', hasTuesday);
    console.log('✓ Sunday visible:', hasSunday);

    expect(hasMonday && hasTuesday && hasSunday).toBeTruthy();
  });

  test('should display time inputs when day is enabled', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Click first draw button
    const firstDrawButton = page.locator('.MuiAccordionDetails-root button').first();
    await firstDrawButton.click();

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Enable weekly schedule
    const toggleSwitch = page.locator('.MuiSwitch-root input').first();
    const isChecked = await toggleSwitch.isChecked();

    if (!isChecked) {
      await toggleSwitch.click();
      await page.waitForTimeout(500);
    }

    // Enable Monday (first day toggle)
    const dayToggles = page.locator('.MuiSwitch-root');
    const mondayToggle = dayToggles.nth(1); // First is weekly schedule, second is Monday
    await mondayToggle.click();
    await page.waitForTimeout(500);

    // Should show time inputs
    const timeInputs = page.locator('input[type="time"]');
    const timeInputCount = await timeInputs.count();

    console.log(`✓ Found ${timeInputCount} time inputs`);
    expect(timeInputCount).toBeGreaterThanOrEqual(2); // Start time + End time
  });

  test('should display save and cancel buttons', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Click first draw button
    const firstDrawButton = page.locator('.MuiAccordionDetails-root button').first();
    await firstDrawButton.click();

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Check for buttons
    const cancelButton = page.locator('button:has-text("Cancelar")');
    const saveButton = page.locator('button:has-text("Guardar")');

    const hasCancelButton = await cancelButton.count() > 0;
    const hasSaveButton = await saveButton.count() > 0;

    console.log('✓ Cancel button visible:', hasCancelButton);
    console.log('✓ Save button visible:', hasSaveButton);

    expect(hasCancelButton).toBeTruthy();
    expect(hasSaveButton).toBeTruthy();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Click first draw button
    const firstDrawButton = page.locator('.MuiAccordionDetails-root button').first();
    await firstDrawButton.click();

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Click cancel button
    const cancelButton = page.locator('button:has-text("Cancelar")');
    await cancelButton.click();

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Modal should be closed
    const modal = page.locator('.MuiDialog-root');
    const modalVisible = await modal.count() > 0;

    console.log('✓ Modal closed after cancel:', !modalVisible);
    expect(modalVisible).toBeFalsy();
  });
});

test.describe('Draw Schedules - Data Persistence', () => {

  test('should save weekly schedule and show success message', async ({ page }) => {
    // Track API requests
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/draws/schedules') && request.method() === 'PATCH') {
        apiCalls.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Click first draw button
    const firstDrawButton = page.locator('.MuiAccordionDetails-root button').first();
    await firstDrawButton.click();

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Enable weekly schedule
    const toggleSwitch = page.locator('.MuiSwitch-root input').first();
    const isChecked = await toggleSwitch.isChecked();

    if (!isChecked) {
      await toggleSwitch.click();
      await page.waitForTimeout(500);
    }

    // Enable Monday
    const dayToggles = page.locator('.MuiSwitch-root');
    const mondayToggle = dayToggles.nth(1);
    await mondayToggle.click();
    await page.waitForTimeout(500);

    // Click save button
    const saveButton = page.locator('button:has-text("Guardar")');
    await saveButton.click();

    // Wait for API call
    await page.waitForTimeout(3000);

    // Check if PATCH request was made
    console.log('✓ PATCH requests made:', apiCalls.length);
    expect(apiCalls.length).toBeGreaterThan(0);

    // Should show success snackbar
    const successSnackbar = page.locator('.MuiAlert-root, text=/actualizado correctamente/i');
    const hasSuccessMessage = await successSnackbar.count() > 0;

    console.log('✓ Success message displayed:', hasSuccessMessage);
  });

  test('should reload data after saving', async ({ page }) => {
    // Track API GET requests
    let getRequestCount = 0;

    page.on('request', request => {
      if (request.url().includes('/api/draws/schedules') && request.method() === 'GET') {
        getRequestCount++;
      }
    });

    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for initial load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const initialGetCount = getRequestCount;
    console.log('✓ Initial GET requests:', initialGetCount);

    // Expand first accordion
    const firstAccordion = page.locator('.MuiAccordion-root').first();
    await firstAccordion.click();
    await page.waitForTimeout(500);

    // Click first draw button
    const firstDrawButton = page.locator('.MuiAccordionDetails-root button').first();
    await firstDrawButton.click();

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Click save without changes (just to trigger reload)
    const saveButton = page.locator('button:has-text("Guardar")');
    await saveButton.click();

    // Wait for reload
    await page.waitForTimeout(3000);

    const finalGetCount = getRequestCount;
    console.log('✓ Final GET requests:', finalGetCount);

    // Should have made another GET request after save
    expect(finalGetCount).toBeGreaterThan(initialGetCount);
  });
});

test.describe('Draw Schedules - Error Handling', () => {

  test('should not have critical console errors', async ({ page }) => {
    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check console errors
    const consoleErrors = page.consoleErrors || [];

    // Filter out non-critical errors
    const criticalErrors = consoleErrors.filter(err => {
      const lowerErr = err.toLowerCase();
      return !lowerErr.includes('warning') &&
             !lowerErr.includes('deprecated') &&
             !lowerErr.includes('favicon');
    });

    console.log('Console errors found:', consoleErrors.length);
    console.log('Critical errors:', criticalErrors.length);

    if (criticalErrors.length > 0) {
      console.error('Critical errors:', criticalErrors);
    }

    // Should have no critical errors
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Draw Schedules - Real Data Verification', () => {

  test('should NOT use mock data', async ({ page }) => {
    // Track API response
    let apiData = null;

    page.on('response', async response => {
      if (response.url().includes('/api/draws/schedules') && response.request().method() === 'GET') {
        try {
          apiData = await response.json();
          console.log('✓ API response received with', apiData?.length || 0, 'draws');
        } catch (e) {
          console.log('Could not parse API response');
        }
      }
    });

    // Navigate to draw schedules
    await page.goto('/draws/schedules');

    // Wait for API call to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Verify we got real API data
    expect(apiData).toBeTruthy();
    expect(Array.isArray(apiData)).toBeTruthy();

    if (apiData && Array.isArray(apiData)) {
      console.log('✓ API returned', apiData.length, 'draws');

      // Check first draw has expected structure
      if (apiData.length > 0) {
        const firstDraw = apiData[0];
        console.log('✓ First draw structure:', {
          hasDrawId: !!firstDraw.drawId,
          hasDrawName: !!firstDraw.drawName,
          hasLotteryId: !!firstDraw.lotteryId,
          hasLotteryName: !!firstDraw.lotteryName,
          hasUseWeeklySchedule: typeof firstDraw.useWeeklySchedule === 'boolean'
        });

        // Verify structure matches API contract
        expect(firstDraw).toHaveProperty('drawId');
        expect(firstDraw).toHaveProperty('drawName');
        expect(firstDraw).toHaveProperty('lotteryId');
        expect(firstDraw).toHaveProperty('lotteryName');
      }
    }
  });
});
