import { test, expect } from '@playwright/test';

/**
 * Test: Premio Configuration Field Editing Behavior
 *
 * This test verifies that the field editing fix resolves the issue where:
 * - Fields would immediately convert to numbers during typing
 * - Empty fields would show 0
 * - Decimal points would be lost (e.g., "5." → "5")
 * - Values wouldn't persist after save
 *
 * The fix implements "string-based editing, parse-on-save" pattern.
 */

test.describe('Premio Config Field Editing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:4201/');

    // Login
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to bancas
    await page.click('a[href="/bancas"]');
    await page.waitForURL('**/bancas', { timeout: 5000 });

    // Find and click edit button for banca 9
    const editButton = page.locator('button:has-text("Editar")').first();
    await editButton.click();

    // Wait for edit form to load
    await page.waitForTimeout(1000);

    // Click on "Premios y Comisiones" tab
    const premiosTab = page.locator('button:has-text("Premios y Comisiones")');
    await premiosTab.click();

    // Wait for premio config to load
    await page.waitForTimeout(2000);
  });

  test('Field editing preserves user input during typing', async ({ page }) => {
    console.log('🧪 TEST: Field editing preserves user input during typing');

    // Find the first input field (DIRECTO_PRIMER_PAGO)
    const firstInput = page.locator('.field-input').first();

    // Get current value
    const currentValue = await firstInput.inputValue();
    console.log(`Current value: ${currentValue}`);

    // Clear the field
    await firstInput.clear();

    // Type slowly to verify each character appears
    await firstInput.type('6', { delay: 100 });
    let value = await firstInput.inputValue();
    console.log(`After typing '6': ${value}`);
    expect(value).toBe('6');

    await firstInput.type('0', { delay: 100 });
    value = await firstInput.inputValue();
    console.log(`After typing '60': ${value}`);
    expect(value).toBe('60');

    // Test decimal point preservation
    await firstInput.type('.', { delay: 100 });
    value = await firstInput.inputValue();
    console.log(`After typing '60.': ${value}`);
    expect(value).toContain('.'); // Should preserve decimal point

    await firstInput.type('5', { delay: 100 });
    value = await firstInput.inputValue();
    console.log(`After typing '60.5': ${value}`);
    expect(value).toBe('60.5');

    console.log('✅ Field editing preserves input during typing');
  });

  test('Empty field does not immediately show 0', async ({ page }) => {
    console.log('🧪 TEST: Empty field does not immediately show 0');

    const firstInput = page.locator('.field-input').first();

    // Clear the field
    await firstInput.clear();

    // Wait a moment
    await page.waitForTimeout(300);

    // Check that the value is empty, not 0
    const value = await firstInput.inputValue();
    console.log(`Value after clearing: "${value}"`);
    expect(value).toBe('');

    console.log('✅ Empty field stays empty (not 0)');
  });

  test('Value persists after save and shows success message', async ({ page }) => {
    console.log('🧪 TEST: Value persists after save and shows success message');

    const firstInput = page.locator('.field-input').first();

    // Set a specific test value
    const testValue = '62.75';
    await firstInput.clear();
    await firstInput.fill(testValue);

    console.log(`Set value to: ${testValue}`);

    // Click save button
    const saveButton = page.locator('button.btn-save-premio');
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(2000);

    // Check for success message
    const successMessage = page.locator('.success-message-banner');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    const messageText = await successMessage.textContent();
    console.log(`Success message: ${messageText}`);
    expect(messageText).toContain('actualizada exitosamente');

    // Reload the form by clicking another tab and back
    const generalTab = page.locator('button:has-text("General")');
    await generalTab.click();
    await page.waitForTimeout(500);

    const premiosTab = page.locator('button:has-text("Premios y Comisiones")');
    await premiosTab.click();
    await page.waitForTimeout(2000);

    // Verify the value persisted
    const reloadedValue = await firstInput.inputValue();
    console.log(`Value after reload: ${reloadedValue}`);

    // Parse both to numbers for comparison (account for formatting)
    const expectedNum = parseFloat(testValue);
    const actualNum = parseFloat(reloadedValue);
    expect(actualNum).toBe(expectedNum);

    console.log('✅ Value persisted and success message shown');
  });

  test('Multiple fields can be edited independently', async ({ page }) => {
    console.log('🧪 TEST: Multiple fields can be edited independently');

    const inputs = page.locator('.field-input');
    const count = await inputs.count();
    console.log(`Found ${count} input fields`);

    // Edit first 3 fields
    const testValues = ['70', '15.5', '8.25'];

    for (let i = 0; i < 3 && i < count; i++) {
      const input = inputs.nth(i);
      await input.clear();
      await input.fill(testValues[i]);

      const value = await input.inputValue();
      console.log(`Field ${i}: Set to ${testValues[i]}, got ${value}`);
      expect(value).toBe(testValues[i]);
    }

    // Verify all values are still correct
    for (let i = 0; i < 3 && i < count; i++) {
      const input = inputs.nth(i);
      const value = await input.inputValue();
      expect(value).toBe(testValues[i]);
    }

    console.log('✅ Multiple fields maintain independent values');
  });

  test('Success message auto-dismisses after 5 seconds', async ({ page }) => {
    console.log('🧪 TEST: Success message auto-dismisses');

    const firstInput = page.locator('.field-input').first();

    // Make a change
    await firstInput.clear();
    await firstInput.fill('99');

    // Save
    const saveButton = page.locator('button.btn-save-premio');
    await saveButton.click();

    // Wait for success message
    const successMessage = page.locator('.success-message-banner');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    console.log('Success message appeared');

    // Wait 6 seconds and verify it's gone
    await page.waitForTimeout(6000);
    await expect(successMessage).not.toBeVisible();
    console.log('✅ Success message auto-dismissed after 5 seconds');
  });
});
