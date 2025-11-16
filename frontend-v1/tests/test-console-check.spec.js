import { test } from '@playwright/test';

test('Check console logs during edit page load', async ({ page }) => {
  // Capture all console logs
  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
    console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
  });

  // Login
  await page.goto('http://localhost:3001/login');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'Admin123456');
  await page.click('#log-in');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Navigate to edit banca 9
  console.log('\n🔍 Navigating to edit banca 9...\n');
  await page.goto('http://localhost:3001/bancas/editar/9');

  // Wait for page to load
  await page.waitForTimeout(5000);

  // Look for our debug logs
  console.log('\n📋 CHECKING FOR DEBUG LOGS:');
  const prizeFieldsLogs = logs.filter(log => log.includes('prizeFieldsToJsonConfig'));

  if (prizeFieldsLogs.length > 0) {
    console.log('✅ Found prizeFieldsToJsonConfig logs:');
    prizeFieldsLogs.forEach(log => console.log(`  ${log}`));
  } else {
    console.log('❌ NO prizeFieldsToJsonConfig logs found!');
    console.log('📝 This means the code changes haven\'t been loaded yet');
  }

  console.log(`\n📊 Total console logs captured: ${logs.length}`);
});
