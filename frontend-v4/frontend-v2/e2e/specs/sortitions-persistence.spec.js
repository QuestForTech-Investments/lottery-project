/**
 * Test: Sortitions Configuration Persistence
 *
 * Verifies that sortitions (lotteries and anticipated closing) persist after saving.
 *
 * Expected behavior:
 * 1. Select lotteries in Sorteos tab
 * 2. Configure anticipated closing minutes
 * 3. Select specific lotteries for anticipated closing
 * 4. Save successfully
 * 5. Values persist after page refresh
 */

import { test, expect } from '@playwright/test';

test.describe('Edit Betting Pool - Sortitions Persistence (V2)', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:4000');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/home', { timeout: 10000 });
  });

  test('Should persist sortitions configuration', async ({ page }) => {
    console.log('🎯 Starting sortitions persistence test...');

    // Navigate to edit betting pool #9
    await page.goto('http://localhost:4000/bettingPools/edit/9');
    console.log('📍 Navigated to edit betting pool #9');

    // Wait for form to load
    await page.waitForSelector('input[name="bettingPoolName"]', { timeout: 10000 });
    console.log('✅ Form loaded');

    // Navigate to Sorteos tab
    await page.click('button:has-text("Sorteos")');
    await page.waitForTimeout(1000);
    console.log('📑 Navigated to Sorteos tab');

    // Wait for chips to load
    await page.waitForSelector('.MuiChip-root', { timeout: 10000 });
    console.log('✅ Lottery chips loaded');

    // Get all lottery chips
    const allChips = page.locator('.MuiChip-root');
    const chipCount = await allChips.count();
    console.log(`📊 Found ${chipCount} lottery chips`);

    // Deselect all first (click TODOS button if all are selected)
    const todosButton = page.locator('button:has-text("TODOS")');
    await todosButton.click();
    await page.waitForTimeout(500);
    await todosButton.click(); // Click again to deselect all
    await page.waitForTimeout(500);
    console.log('🔄 Deselected all lotteries');

    // Select specific lotteries (LA PRIMERA, NEW YORK DAY, FLORIDA AM)
    const testLotteries = ['LA PRIMERA', 'NEW YORK DAY', 'FLORIDA AM'];
    for (const lotteryName of testLotteries) {
      const chip = page.locator(`.MuiChip-root:has-text("${lotteryName}")`).first();
      await chip.click();
      await page.waitForTimeout(200);
      console.log(`✅ Selected lottery: ${lotteryName}`);
    }

    // Configure anticipated closing minutes
    const anticipatedClosingInput = page.locator('input[name="anticipatedClosing"]');
    await anticipatedClosingInput.fill('15');
    console.log('⏰ Set anticipated closing to 15 minutes');

    // Open the anticipated closing lottery multiselect
    const multiselectBox = page.locator('.MuiPaper-root').filter({ hasText: 'Aplicar cierre anticipado a:' }).first();
    await multiselectBox.click();
    await page.waitForTimeout(500);
    console.log('📋 Opened anticipated closing multiselect');

    // Select specific lotteries for anticipated closing (LA PRIMERA, FLORIDA AM)
    const closingLotteries = ['LA PRIMERA', 'FLORIDA AM'];
    for (const lotteryName of closingLotteries) {
      // Find the lottery in the dropdown and click it
      const option = page.locator(`text="${lotteryName}"`).last();
      await option.click();
      await page.waitForTimeout(300);
      console.log(`✅ Added to anticipated closing: ${lotteryName}`);
    }

    // Close the multiselect by clicking outside
    await page.click('h6:has-text("Sorteos")');
    await page.waitForTimeout(500);
    console.log('📋 Closed multiselect');

    // Verify selected values before saving
    const selectedChipsCount = await page.locator('.MuiChip-root[style*="rgb(102, 16, 242)"]').count();
    console.log(`📊 Selected ${selectedChipsCount} lotteries before save`);

    const anticipatedClosingValue = await anticipatedClosingInput.inputValue();
    console.log(`⏰ Anticipated closing value before save: ${anticipatedClosingValue}`);

    // Save
    console.log('💾 Saving changes...');
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Banca actualizada exitosamente')).toBeVisible({ timeout: 10000 });
    console.log('✅ Success message shown');

    // Wait for state to update
    await page.waitForTimeout(2000);

    // Refresh the page
    console.log('🔄 Reloading page...');
    await page.reload();
    await page.waitForSelector('input[name="bettingPoolName"]', { timeout: 10000 });

    // Navigate back to Sorteos tab
    await page.click('button:has-text("Sorteos")');
    await page.waitForTimeout(1000);
    console.log('📑 Navigated back to Sorteos tab');

    // Verify selected lotteries persist
    await page.waitForSelector('.MuiChip-root', { timeout: 10000 });

    // Check each test lottery is selected (purple background)
    for (const lotteryName of testLotteries) {
      const chip = page.locator(`.MuiChip-root:has-text("${lotteryName}")`).first();
      const backgroundColor = await chip.evaluate(el => window.getComputedStyle(el).backgroundColor);
      console.log(`🎨 ${lotteryName} background: ${backgroundColor}`);

      // Purple color is rgb(102, 16, 242)
      expect(backgroundColor).toContain('rgb(102, 16, 242)');
    }
    console.log('✅ Selected lotteries persisted');

    // Verify anticipated closing minutes persist
    const persistedMinutes = await page.locator('input[name="anticipatedClosing"]').inputValue();
    console.log(`⏰ Persisted anticipated closing: ${persistedMinutes}`);
    expect(persistedMinutes).toBe('15');
    console.log('✅ Anticipated closing minutes persisted');

    // Verify anticipated closing lotteries persist
    // Check the chips in the multiselect box
    const anticipatedClosingChips = page.locator('.MuiPaper-root').filter({ hasText: 'Aplicar cierre anticipado a:' }).locator('.MuiChip-root');
    const chipTexts = await anticipatedClosingChips.allTextContents();
    console.log('📋 Anticipated closing lotteries:', chipTexts);

    for (const lotteryName of closingLotteries) {
      expect(chipTexts.some(text => text.includes(lotteryName))).toBe(true);
    }
    console.log('✅ Anticipated closing lotteries persisted');

    console.log('🎉 All sortitions data persisted correctly!');
  });

  test('Should call POST /sortitions/bulk endpoint on save', async ({ page }) => {
    console.log('🎯 Testing sortitions API call...');

    // Listen to network requests
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/betting-pools/9/sortitions')) {
        requests.push({
          method: request.method(),
          url: request.url()
        });
      }
    });

    // Navigate to edit betting pool #9
    await page.goto('http://localhost:4000/bettingPools/edit/9');
    await page.waitForSelector('input[name="bettingPoolName"]', { timeout: 10000 });

    // Navigate to Sorteos tab
    await page.click('button:has-text("Sorteos")');
    await page.waitForTimeout(1000);

    // Make a change to trigger sortitions save
    const todosButton = page.locator('button:has-text("TODOS")');
    await todosButton.click();
    await page.waitForTimeout(500);

    // Clear previous requests
    requests.length = 0;

    // Save
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Banca actualizada exitosamente')).toBeVisible({ timeout: 10000 });

    // Check that sortitions endpoint was called
    console.log('Network requests:', requests);

    const postSortitionsRequest = requests.find(r =>
      r.method === 'POST' && r.url.includes('/betting-pools/9/sortitions/bulk')
    );

    expect(postSortitionsRequest).toBeDefined();
    console.log('✅ POST request to /api/betting-pools/9/sortitions/bulk:', postSortitionsRequest);
  });
});
