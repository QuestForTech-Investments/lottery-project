const { chromium } = require('playwright');

const SCREENSHOT_DIR = '/tmp/claude-1001/-home-jorge-projects-lottery-project/7575d4c9-ea8e-4fc9-91f4-ad29103812bb/scratchpad';

async function main() {
  console.log('Launching Chromium browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to the application
    console.log('Navigating to http://localhost:4001...');
    await page.goto('http://localhost:4001', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded');

    console.log('Taking screenshot: login-page.png...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/login-page.png` });
    console.log('Screenshot saved: login-page.png');

    // 2. Login with credentials
    console.log('Logging in...');
    await page.waitForSelector('#username', { state: 'visible', timeout: 15000 });
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin123456');
    await page.click('button[type="submit"]');
    console.log('Login button clicked');

    // Wait for navigation
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => console.log('Dashboard URL not matched'));
    await page.waitForTimeout(3000);

    console.log('Taking screenshot: after-login.png...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/after-login.png` });
    console.log('Screenshot saved: after-login.png');

    // 3. Navigate directly to schedules page
    console.log('Navigating to /draws/schedules...');
    await page.goto('http://localhost:4001/draws/schedules', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 4. Take screenshot of the DrawSchedules page
    console.log('Taking screenshot: our-app-schedules-list.png...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/our-app-schedules-list.png` });
    console.log('Screenshot saved: our-app-schedules-list.png');

    // 5. Look for accordions and expand one
    console.log('Looking for lotteries to expand...');

    // Get the page HTML to understand structure
    const pageContent = await page.content();
    console.log('Page has content length:', pageContent.length);

    // Try clicking on FLORIDA
    try {
      await page.click('text=FLORIDA', { timeout: 5000 });
      console.log('Clicked FLORIDA');
      await page.waitForTimeout(1500);
    } catch (e) {
      console.log('Could not click FLORIDA, trying other elements...');
      // Try first accordion summary
      try {
        await page.click('[class*="MuiAccordionSummary"]:first-of-type', { timeout: 5000 });
        console.log('Clicked first accordion');
        await page.waitForTimeout(1500);
      } catch (e2) {
        console.log('Could not click accordion');
      }
    }

    // 6. Take screenshot of expanded section
    console.log('Taking screenshot: our-app-schedules-expanded.png...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/our-app-schedules-expanded.png` });
    console.log('Screenshot saved: our-app-schedules-expanded.png');

    // 7. Look for time inputs
    console.log('Looking for time inputs...');
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} inputs`);

    // Click on first input that looks like a time
    for (let i = 0; i < inputs.length; i++) {
      try {
        const value = await inputs[i].inputValue();
        const type = await inputs[i].getAttribute('type');
        console.log(`Input ${i}: type=${type}, value="${value}"`);
        if (value && value.match(/^\d{1,2}:\d{2}/)) {
          console.log('Found time input, clicking...');
          await inputs[i].click();
          await page.waitForTimeout(1500);
          break;
        }
      } catch (e) {
        // Skip
      }
    }

    // 8. Take screenshot showing time picker
    console.log('Taking screenshot: our-app-time-picker.png...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/our-app-time-picker.png` });
    console.log('Screenshot saved: our-app-time-picker.png');

    // 9. Look for buttons
    console.log('Looking for buttons...');
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      try {
        const text = await buttons[i].textContent();
        const title = await buttons[i].getAttribute('title');
        if (text?.trim() || title) {
          console.log(`Button ${i}: text="${text?.trim().substring(0, 40)}", title="${title}"`);
        }
      } catch (e) {
        // Skip
      }
    }

    // Take final screenshot
    console.log('Taking screenshot: our-app-copy-button.png...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/our-app-copy-button.png` });
    console.log('Screenshot saved: our-app-copy-button.png');

    // Full page screenshot
    console.log('Taking screenshot: our-app-full-page.png (full page)...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/our-app-full-page.png`, fullPage: true });
    console.log('Screenshot saved: our-app-full-page.png');

    console.log('\n=== All screenshots saved successfully! ===');
    console.log(`Screenshots location: ${SCREENSHOT_DIR}`);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    try {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/error-state.png`, fullPage: true });
      console.log('Error screenshot saved');
    } catch (e) {
      console.error('Could not take error screenshot:', e.message);
    }
  } finally {
    await browser.close();
  }
}

main();
