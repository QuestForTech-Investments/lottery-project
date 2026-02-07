const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();
  
  const screenshotDir = '/tmp/claude-1001/-home-jorge-projects-lottery-project/7575d4c9-ea8e-4fc9-91f4-ad29103812bb/scratchpad';
  
  try {
    // Navigate to login page
    console.log('Navigating to lottobook.net...');
    await page.goto('https://lottobook.net', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Login
    console.log('Logging in...');
    await page.fill('input[name="username"], input[type="text"]', 'admin');
    await page.fill('input[name="password"], input[type="password"]', 'Admin123456');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('Logged in successfully!');
    
    // Navigate to draw schedules
    console.log('Navigating to Draw Schedules...');
    await page.goto('https://lottobook.net/draws/schedules', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Take screenshot of schedules list
    console.log('Taking screenshot of schedules list...');
    await page.screenshot({ 
      path: `${screenshotDir}/prod-schedules-list.png`,
      fullPage: false 
    });
    console.log('Saved: prod-schedules-list.png');
    
    // Find and click on an accordion to expand it
    console.log('Looking for accordion buttons...');
    
    // Look for accordion buttons - they usually have expand icons
    const accordionButtons = await page.$$('button[aria-expanded], .MuiAccordion-root, .MuiAccordionSummary-root, [role="button"]');
    console.log(`Found ${accordionButtons.length} potential accordion elements`);
    
    // Try to find and click on the first lottery accordion
    const accordion = await page.$('.MuiAccordion-root');
    if (accordion) {
      const summary = await accordion.$('.MuiAccordionSummary-root');
      if (summary) {
        await summary.click();
        await page.waitForTimeout(1000);
        console.log('Clicked on accordion');
      }
    } else {
      // Try alternative selectors
      const expandButton = await page.$('button:has-text("expand"), [aria-label*="expand"]');
      if (expandButton) {
        await expandButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Take screenshot of expanded view
    console.log('Taking screenshot of expanded schedules...');
    await page.screenshot({ 
      path: `${screenshotDir}/prod-schedules-expanded.png`,
      fullPage: false 
    });
    console.log('Saved: prod-schedules-expanded.png');
    
    // Try to find and click on a time input to show the time picker
    console.log('Looking for time inputs...');
    const timeInputs = await page.$$('input[type="time"], input[type="text"][placeholder*="time"], .MuiInputBase-input');
    console.log(`Found ${timeInputs.length} potential time inputs`);
    
    if (timeInputs.length > 0) {
      // Click on the first time input
      await timeInputs[0].click();
      await page.waitForTimeout(1000);
    }
    
    // Take screenshot showing time picker (if visible)
    console.log('Taking screenshot with time picker...');
    await page.screenshot({ 
      path: `${screenshotDir}/prod-time-picker.png`,
      fullPage: false 
    });
    console.log('Saved: prod-time-picker.png');
    
    // Look for copy button
    console.log('Looking for copy button...');
    const copyButtons = await page.$$('button:has-text("Copiar"), button:has-text("Copy"), [aria-label*="copy"], [title*="copy"]');
    console.log(`Found ${copyButtons.length} potential copy buttons`);
    
    console.log('All screenshots captured successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    // Take error screenshot
    await page.screenshot({ 
      path: `${screenshotDir}/error-screenshot.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();
