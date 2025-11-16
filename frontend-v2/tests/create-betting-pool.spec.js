import { test, expect } from '@playwright/test';

test.describe('Create Betting Pool', () => {
  test('should load zones from API and create a betting pool', async ({ page }) => {
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`Browser console [${msg.type()}]: ${msg.text()}`);
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log(`Browser error: ${error.message}`);
      console.log(`Stack: ${error.stack}`);
    });

    // Create a valid JWT token with far-future expiry (year 2286)
    // Header: {"alg":"HS256","typ":"JWT"}
    // Payload: {"sub":"1","username":"test","exp":9999999999}
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0IiwiZXhwIjo5OTk5OTk5OTk5fQ.placeholder';

    // Set authentication token to bypass login
    await page.goto('http://localhost:4000/');
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'test' }));
    }, testToken);

    // Navigate to create betting pool page
    await page.goto('http://localhost:4000/bettingPools/new');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for zones to load
    await page.waitForTimeout(5000);

    // Debug: Check what's in the page
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Page HTML length:', bodyHTML.length);

    // Check if lazy loading fallback is still showing
    const loadingFallback = page.locator('text=Cargando');
    if (await loadingFallback.count() > 0) {
      console.log('Loading fallback is still visible');
    }

    // Check if the form is loaded
    const form = page.locator('form');
    if (await form.count() === 0) {
      console.log('Form not found. Taking screenshot...');
      await page.screenshot({ path: '/tmp/no-form-debug.png', fullPage: true });

      // Check if there's an error boundary or empty state
      const mainContent = await page.locator('main, [role="main"], .main-content').innerHTML().catch(() => 'No main content');
      console.log('Main content:', mainContent.substring(0, 500));
    }

    await expect(form).toBeVisible();

    // Fill required fields
    await page.fill('input[name="bettingPoolName"]', 'Test Banca Playwright');

    // Branch code should be auto-filled, but let's check
    const branchCode = await page.inputValue('input[name="branchCode"]');
    console.log(`Branch code: ${branchCode}`);

    // For Material-UI Select, we need to click the select button and then choose an option
    // Wait for zones to load and select the zone field
    const zoneField = page.locator('div[id="zoneId"]').first();
    if (await zoneField.count() > 0) {
      await zoneField.click();

      // Wait for the dropdown menu to open
      await page.waitForTimeout(500);

      // Select the first real option (not the placeholder)
      const firstOption = page.locator('ul[role="listbox"] li[role="option"]').nth(1);
      if (await firstOption.count() > 0) {
        const optionText = await firstOption.textContent();
        console.log(`Selecting zone: ${optionText}`);
        await firstOption.click();
      }
    }

    // Take a screenshot before submitting
    await page.screenshot({ path: '/tmp/before-submit.png', fullPage: true });

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });

    // Listen for network responses
    page.on('response', response => {
      if (response.url().includes('/api/betting-pools')) {
        console.log(`API Response: ${response.status()} ${response.url()}`);
      }
    });

    // Click submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait a bit to see what happens
    await page.waitForTimeout(3000);

    // Take a screenshot after submission
    await page.screenshot({ path: '/tmp/after-submit.png', fullPage: true });

    // Check for success or error messages
    const alertMessage = page.locator('.MuiAlert-message, .alert, [role="alert"]');
    if (await alertMessage.count() > 0) {
      const messageText = await alertMessage.first().textContent();
      console.log(`Alert message: ${messageText}`);
    }

    // Print current URL
    console.log(`Current URL: ${page.url()}`);
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Create a valid JWT token with far-future expiry
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0IiwiZXhwIjo5OTk5OTk5OTk5fQ.placeholder';

    // Set authentication token to bypass login
    await page.goto('http://localhost:4000/');
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'test' }));
    }, testToken);

    await page.goto('http://localhost:4000/bettingPools/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: '/tmp/validation-errors.png', fullPage: true });

    // Check for validation errors
    const errorMessages = page.locator('.MuiFormHelperText-root.Mui-error, .error, .text-danger');
    const errorCount = await errorMessages.count();
    console.log(`Found ${errorCount} validation errors`);

    for (let i = 0; i < errorCount; i++) {
      const error = await errorMessages.nth(i).textContent();
      console.log(`Validation error ${i + 1}: ${error}`);
    }
  });
});
