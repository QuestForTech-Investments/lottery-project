import { test, expect } from '@playwright/test';

/**
 * Test Suite: Edit User Form
 * Tests for the EditUserMUI component to verify permissions loading and form functionality
 */

test.describe('Edit User Form', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/');

    // Wait for login form to load
    await page.waitForSelector('#username', { timeout: 10000 });

    // Fill login form (using id selectors for MUI TextFields)
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin123456');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should load edit user form and display permissions', async ({ page }) => {
    // Navigate to user list
    await page.goto('/users/list');

    // Wait for users to load
    await page.waitForSelector('table', { timeout: 5000 });

    // Click on the first edit button
    await page.click('button[title="Editar usuario"]').first();

    // Wait for edit form to load
    await page.waitForURL('**/users/edit/**', { timeout: 5000 });

    // Wait for permissions to load (wait for permission categories to render)
    await page.waitForSelector('text=PRIVILEGIOS', { timeout: 10000 });

    // Check that permission checkboxes are visible
    const permissionCheckboxes = await page.locator('input[type="checkbox"]').count();
    expect(permissionCheckboxes).toBeGreaterThan(0);

    // Verify no error messages
    const errorAlert = await page.locator('text=Error al cargar permisos').count();
    expect(errorAlert).toBe(0);

    console.log(`✅ Found ${permissionCheckboxes} permission checkboxes`);
  });

  test('should display user data correctly', async ({ page }) => {
    // Navigate to edit user page directly (user ID 1)
    await page.goto('/users/edit/1');

    // Wait for form to load
    await page.waitForSelector('input[name="username"]', { timeout: 5000 });

    // Check that username field is filled and disabled
    const usernameInput = await page.locator('input[name="username"]');
    expect(await usernameInput.isDisabled()).toBeTruthy();
    expect(await usernameInput.inputValue()).not.toBe('');

    console.log(`✅ Username field is populated and disabled`);
  });

  test('should load zones selector', async ({ page }) => {
    // Navigate to edit user page
    await page.goto('/users/edit/1');

    // Wait for zones to load
    await page.waitForSelector('text=Zonas', { timeout: 5000 });

    // Check that zone selector is present
    const zoneSelector = await page.locator('text=Seleccionar zonas').count();
    expect(zoneSelector).toBeGreaterThan(0);

    console.log(`✅ Zone selector is present`);
  });

  test('should allow permission selection', async ({ page }) => {
    // Navigate to edit user page
    await page.goto('/users/edit/1');

    // Wait for permissions to load
    await page.waitForSelector('input[type="checkbox"]', { timeout: 10000 });

    // Get first permission checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();

    // Get initial state
    const initialState = await firstCheckbox.isChecked();

    // Click to toggle
    await firstCheckbox.click();

    // Verify state changed
    const newState = await firstCheckbox.isChecked();
    expect(newState).not.toBe(initialState);

    console.log(`✅ Permission checkbox toggled from ${initialState} to ${newState}`);
  });

  test('should show update button', async ({ page }) => {
    // Navigate to edit user page
    await page.goto('/users/edit/1');

    // Wait for form to load
    await page.waitForSelector('button:has-text("Actualizar Usuario")', { timeout: 5000 });

    // Check button is visible and enabled
    const updateButton = page.locator('button:has-text("Actualizar Usuario")');
    expect(await updateButton.isVisible()).toBeTruthy();
    expect(await updateButton.isDisabled()).toBeFalsy();

    console.log(`✅ Update button is visible and enabled`);
  });
});
