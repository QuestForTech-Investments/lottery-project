/**
 * Test: Edit Betting Pool - Data Persistence
 *
 * Verifies that configuration changes persist after saving.
 * Tests the fix for the two-endpoint architecture issue.
 *
 * Expected behavior:
 * 1. Edit configuration values
 * 2. Save successfully using both endpoints
 * 3. Values persist after page refresh
 */

import { test, expect } from '@playwright/test';

test.describe('Edit Betting Pool - Configuration Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:4000');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/home', { timeout: 10000 });
  });

  test('Should persist basic data changes', async ({ page }) => {
    // Navigate to edit betting pool #9
    await page.goto('http://localhost:4000/bettingPools/edit/9');

    // Wait for form to load
    await page.waitForSelector('input[name="bettingPoolName"]', { timeout: 10000 });

    // Get original value
    const originalName = await page.inputValue('input[name="bettingPoolName"]');
    console.log('Original name:', originalName);

    // Change the name (basic data)
    const newName = `Test Banca ${Date.now()}`;
    await page.fill('input[name="bettingPoolName"]', newName);
    console.log('New name:', newName);

    // Save
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Banca actualizada exitosamente')).toBeVisible({ timeout: 10000 });
    console.log('✅ Success message shown');

    // Wait a bit for state to update
    await page.waitForTimeout(1000);

    // Refresh the page
    await page.reload();
    await page.waitForSelector('input[name="bettingPoolName"]', { timeout: 10000 });

    // Verify the value persists
    const persistedName = await page.inputValue('input[name="bettingPoolName"]');
    console.log('Persisted name:', persistedName);

    expect(persistedName).toBe(newName);
    console.log('✅ Basic data persists after refresh');
  });

  test('Should persist configuration changes', async ({ page }) => {
    // Navigate to edit betting pool #9
    await page.goto('http://localhost:4000/bettingPools/edit/9');

    // Wait for form to load
    await page.waitForSelector('input[name="bettingPoolName"]', { timeout: 10000 });

    // Navigate to Configuration tab
    await page.click('button:has-text("Configuración")');
    await page.waitForTimeout(500);

    // Find and change dailySaleLimit field
    const dailySaleLimitInput = page.locator('input[name="dailySaleLimit"]');
    await expect(dailySaleLimitInput).toBeVisible({ timeout: 5000 });

    // Get original value
    const originalValue = await dailySaleLimitInput.inputValue();
    console.log('Original dailySaleLimit:', originalValue);

    // Set new value
    const newValue = '15000.50';
    await dailySaleLimitInput.fill(newValue);
    console.log('New dailySaleLimit:', newValue);

    // Save
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Banca actualizada exitosamente')).toBeVisible({ timeout: 10000 });
    console.log('✅ Success message shown');

    // Wait for state to update
    await page.waitForTimeout(1000);

    // Refresh the page
    await page.reload();
    await page.waitForSelector('input[name="bettingPoolName"]', { timeout: 10000 });

    // Navigate back to Configuration tab
    await page.click('button:has-text("Configuración")');
    await page.waitForTimeout(500);

    // Verify the value persists
    const persistedValue = await dailySaleLimitInput.inputValue();
    console.log('Persisted dailySaleLimit:', persistedValue);

    expect(persistedValue).toBe(newValue);
    console.log('✅ Configuration data persists after refresh');
  });

  test('Should call both PUT and POST endpoints', async ({ page }) => {
    // Listen to network requests
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/betting-pools/9')) {
        requests.push({
          method: request.method(),
          url: request.url()
        });
      }
    });

    // Navigate to edit betting pool #9
    await page.goto('http://localhost:4000/bettingPools/edit/9');
    await page.waitForSelector('input[name="bettingPoolName"]', { timeout: 10000 });

    // Make a change
    await page.fill('input[name="bettingPoolName"]', `Test ${Date.now()}`);

    // Clear previous requests
    requests.length = 0;

    // Save
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Banca actualizada exitosamente')).toBeVisible({ timeout: 10000 });

    // Check that both endpoints were called
    console.log('Network requests:', requests);

    const putRequest = requests.find(r => r.method === 'PUT' && r.url.endsWith('/betting-pools/9'));
    const postConfigRequest = requests.find(r => r.method === 'POST' && r.url.includes('/betting-pools/9/config'));

    expect(putRequest).toBeDefined();
    expect(postConfigRequest).toBeDefined();

    console.log('✅ PUT request to /api/betting-pools/9:', putRequest);
    console.log('✅ POST request to /api/betting-pools/9/config:', postConfigRequest);
  });

  test('Should show success message and stay on form', async ({ page }) => {
    // Navigate to edit betting pool #9
    await page.goto('http://localhost:4000/bettingPools/edit/9');
    await page.waitForSelector('input[name="bettingPoolName"]', { timeout: 10000 });

    // Make a change
    await page.fill('input[name="bettingPoolName"]', `Test ${Date.now()}`);

    // Save
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Banca actualizada exitosamente')).toBeVisible({ timeout: 10000 });
    console.log('✅ Success message shown');

    // Verify we're still on the edit page (not redirected)
    await expect(page).toHaveURL(/\/bettingPools\/edit\/9/);
    console.log('✅ Stayed on edit page (no redirect)');

    // Verify the form is still visible
    await expect(page.locator('input[name="bettingPoolName"]')).toBeVisible();
    console.log('✅ Form still visible');

    // Verify success message auto-clears after 5 seconds
    await page.waitForTimeout(6000);
    await expect(page.locator('text=Banca actualizada exitosamente')).not.toBeVisible();
    console.log('✅ Success message auto-cleared');
  });
});
