/**
 * Debug test to capture console logs and verify sortitions loading
 */

import { test } from '@playwright/test';

test('Debug sortitions loading', async ({ page }) => {
  // Capture console logs
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log('[BROWSER LOG]', text);
  });

  // Navigate to edit page
  console.log('🎯 Navigating to edit betting pool #9...');
  await page.goto('http://localhost:4000/bettingPools/edit/9');

  // Wait for any page load
  await page.waitForTimeout(5000);

  // Print all captured logs
  console.log('\n===================');
  console.log('ALL BROWSER CONSOLE LOGS:');
  console.log('===================');
  logs.forEach(log => console.log(log));

  // Check for specific debug logs we added
  console.log('\n===================');
  console.log('DEBUG LOGS CHECK:');
  console.log('===================');
  console.log('🔵 [HOOK] useEffect running:', logs.some(log => log.includes('🔵 [HOOK] useEffect running')));
  console.log('🟢 [HOOK] loadInitialData() called:', logs.some(log => log.includes('🟢 [HOOK] loadInitialData() called')));
  console.log('🟡 [HOOK] About to load sortitions:', logs.some(log => log.includes('🟡 [HOOK] About to load sortitions')));
  console.log('🎯 Loading sortitions data:', logs.some(log => log.includes('🎯 Loading sortitions data')));
});
