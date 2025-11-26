/**
 * App Load Test
 * Captures console errors to debug blank page
 */

import { test, expect } from '@playwright/test';

test('should load app without errors', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];

  // Capture console messages
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });

  // Navigate to home
  await page.goto('/');

  // Wait a bit for app to load
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'test-results/app-load-debug.png', fullPage: true });

  // Print console messages
  console.log('=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => console.log(msg));

  console.log('\n=== ERRORS ===');
  errors.forEach(err => console.log(err));

  // Print page content
  const bodyText = await page.locator('body').textContent();
  console.log('\n=== BODY TEXT ===');
  console.log(bodyText);

  // Print HTML
  const html = await page.content();
  console.log('\n=== HTML (first 500 chars) ===');
  console.log(html.substring(0, 500));
});
