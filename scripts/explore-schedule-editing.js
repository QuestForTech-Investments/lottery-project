const { chromium } = require('playwright');

const SCREENSHOT_DIR = '/tmp/claude-1001/-home-jorge-projects-lottery-project/7575d4c9-ea8e-4fc9-91f4-ad29103812bb/scratchpad';

async function exploreScheduleEditing() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1920, height: 1080 } }).then(c => c.newPage());

  try {
    // Login
    console.log('1. Logging in...');
    await page.goto('https://la-numbers.apk.lol/');
    await page.waitForTimeout(1500);
    await page.fill('input[type="text"]', 'oliver');
    await page.fill('input[type="password"]', 'oliver0597@');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape').catch(() => {});
    console.log('Login complete');

    // Navigate to schedules page
    console.log('\n2. Navigating to schedules page...');
    await page.goto('https://la-numbers.apk.lol/#/sortition-schedules');
    await page.waitForTimeout(3000);

    // Take screenshot of the list
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedules-list.png`, fullPage: true });
    console.log('Screenshot saved: schedules-list.png');

    // Get all the lottery/sorteo rows
    const rows = await page.$$('.card, .accordion, [class*="card"], [class*="collapse"], [role="button"]');
    console.log(`Found ${rows.length} potential clickable rows`);

    // Try to click on the first sorteo (e.g., "FLORIDA")
    console.log('\n3. Looking for FLORIDA row to click...');

    // Find clickable element with FLORIDA text
    const floridaRow = await page.$('text=FLORIDA (AMERICA/NEW_YORK)');
    if (floridaRow) {
      console.log('Found FLORIDA row, clicking...');
      await floridaRow.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/schedules-florida-expanded.png`, fullPage: true });
      console.log('Screenshot saved: schedules-florida-expanded.png');

      // Check what content appeared after clicking
      const expandedContent = await page.evaluate(() => {
        // Look for any newly visible content like tables, forms, inputs
        const tables = document.querySelectorAll('table');
        const inputs = document.querySelectorAll('input[type="time"], input[type="text"], input');
        const buttons = document.querySelectorAll('button');

        return {
          tables: tables.length,
          inputs: Array.from(inputs).map(i => ({
            type: i.type,
            placeholder: i.placeholder,
            value: i.value,
            name: i.name
          })).slice(0, 10),
          buttons: Array.from(buttons).map(b => b.textContent?.trim()).filter(t => t).slice(0, 10)
        };
      });
      console.log('Expanded content:', JSON.stringify(expandedContent, null, 2));
    }

    // Try another sorteo - TEXAS
    console.log('\n4. Looking for TEXAS row to click...');
    const texasRow = await page.$('text=TEXAS (AMERICA/NEW_YORK)');
    if (texasRow) {
      console.log('Found TEXAS row, clicking...');
      await texasRow.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/schedules-texas-expanded.png`, fullPage: true });
      console.log('Screenshot saved: schedules-texas-expanded.png');
    }

    // Look for any edit functionality
    console.log('\n5. Looking for edit buttons/icons...');
    const editElements = await page.$$('[class*="edit"], [class*="pencil"], .fa-edit, .fa-pencil, button:has-text("Editar"), a:has-text("Editar"), svg[class*="edit"]');
    console.log(`Found ${editElements.length} edit elements`);

    // Try to find and click an edit icon if it exists
    if (editElements.length > 0) {
      await editElements[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/schedules-edit-clicked.png`, fullPage: true });
      console.log('Screenshot saved: schedules-edit-clicked.png');
    }

    // Check for modals
    console.log('\n6. Checking for modals...');
    const modals = await page.$$('.modal, [role="dialog"], .dialog, [class*="modal"]');
    console.log(`Found ${modals.length} modal elements`);

    // Look at the page structure more carefully
    console.log('\n7. Analyzing page structure...');
    const pageStructure = await page.evaluate(() => {
      const mainContent = document.querySelector('.content, main, [class*="content"]');
      if (mainContent) {
        return {
          tagName: mainContent.tagName,
          className: mainContent.className,
          innerHTML: mainContent.innerHTML.substring(0, 2000)
        };
      }
      return { body: document.body.innerHTML.substring(0, 2000) };
    });
    console.log('Page structure preview:', pageStructure.innerHTML?.substring(0, 500) || pageStructure.body?.substring(0, 500));

    // Take final screenshot
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedules-final.png`, fullPage: true });
    console.log('\nExploration complete.');

  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedules-error.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreScheduleEditing();
