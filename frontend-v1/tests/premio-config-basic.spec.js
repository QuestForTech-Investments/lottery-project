import { test, expect } from '@playwright/test';

test.describe('Premio Config - Basic Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin123456');
    await page.click('#log-in');
    await page.waitForURL('**/dashboard');
  });

  test('should load premio configuration successfully', async ({ page }) => {
    // Navigate to banca management
    await page.goto('http://localhost:3000/bancas/lista');
    await page.waitForTimeout(2000);

    // Click on edit button for first banca
    const editButton = await page.locator('button.edit-button, button[title="Editar banca"]').first();
    await editButton.click();

    // Wait for edit page to load
    await page.waitForURL('**/bancas/editar/**', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Click on Premio tab
    await page.click('text=Premios');
    await page.waitForTimeout(3000); // Wait for premio tab content to load

    // Verify we can see at least one category tab (Pick 4 should always be visible)
    await expect(page.locator('text=Pick 4')).toBeVisible();

    console.log('✅ Premio config loaded successfully');
  });

  test('should switch between categories', async ({ page }) => {
    await page.goto('http://localhost:3000/bancas/lista');
    await page.waitForTimeout(2000);

    // Click on edit button for first banca
    const editButton = await page.locator('button.edit-button, button[title="Editar banca"]').first();
    await editButton.click();

    // Wait for edit page to load
    await page.waitForURL('**/bancas/editar/**', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Click on Premio tab
    await page.click('text=Premios');

    // Click on different category tabs
    await page.click('text=Pick 2 & Pick 3');
    await expect(page.locator('.category-tab.active')).toContainText('Pick 2 & Pick 3');

    await page.click('text=Pick 4');
    await expect(page.locator('.category-tab.active')).toContainText('Pick 4');

    console.log('✅ Category switching works');
  });
});
