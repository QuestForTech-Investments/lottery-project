const { chromium } = require('playwright');

const SCREENSHOT_DIR = '/tmp/claude-1001/-home-jorge-projects-lottery-project/7575d4c9-ea8e-4fc9-91f4-ad29103812bb/scratchpad';

async function exploreScheduleEditFlow() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1920, height: 1080 } }).then(c => c.newPage());

  // Track API calls
  const apiCalls = [];
  page.on('request', request => {
    if (request.url().includes('api.lotocompany.com')) {
      apiCalls.push({
        method: request.method(),
        url: request.url(),
        postData: request.postData()
      });
    }
  });

  page.on('response', async response => {
    if (response.url().includes('api.lotocompany.com') && response.status() === 200) {
      try {
        const json = await response.json();
        console.log(`API Response [${response.url().split('/').pop()}]:`, JSON.stringify(json).substring(0, 200));
      } catch (e) {}
    }
  });

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

    // Navigate to schedules page
    console.log('\n2. Navigating to schedules page...');
    await page.goto('https://la-numbers.apk.lol/#/sortition-schedules');
    await page.waitForTimeout(3000);

    // Click on FLORIDA to expand
    console.log('\n3. Expanding FLORIDA section...');
    const floridaRow = await page.$('text=FLORIDA (AMERICA/NEW_YORK)');
    if (floridaRow) {
      await floridaRow.click();
      await page.waitForTimeout(2000);
    }

    // Find the time input fields
    console.log('\n4. Analyzing time input fields...');
    const timeInputs = await page.$$eval('input[type="text"]', inputs => {
      return inputs.filter(i => i.value && (i.value.includes('AM') || i.value.includes('PM')))
        .map(i => ({
          value: i.value,
          readOnly: i.readOnly,
          disabled: i.disabled,
          className: i.className,
          id: i.id,
          style: i.getAttribute('style')
        }));
    });
    console.log('Time inputs:', JSON.stringify(timeInputs.slice(0, 5), null, 2));

    // Check if there are any delete/trash icons next to time fields
    const trashIcons = await page.$$('.fa-trash, [class*="trash"], [class*="delete"], .btn-danger, button.delete');
    console.log(`Found ${trashIcons.length} delete/trash elements`);

    // Take a closer screenshot of the expanded FLORIDA section
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-florida-detail.png`, fullPage: false, clip: { x: 0, y: 200, width: 1920, height: 600 } });

    // Try clicking on a time input to see if it opens a picker or modal
    console.log('\n5. Clicking on a time input field...');
    const timeInput = await page.$('input[value="01:29 PM"]');
    if (timeInput) {
      await timeInput.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-time-input-clicked.png`, fullPage: true });
      console.log('Screenshot saved: schedule-time-input-clicked.png');

      // Check if any picker/dropdown appeared
      const picker = await page.$('.picker, .dropdown, .time-picker, [class*="picker"], [class*="dropdown"]:not(.dropdown-toggle)');
      if (picker) {
        console.log('Time picker appeared!');
      }

      // Check if input is editable
      const isEditable = await timeInput.evaluate(el => !el.readOnly && !el.disabled);
      console.log(`Time input is editable: ${isEditable}`);

      // Try typing a new value
      if (isEditable) {
        await timeInput.selectText();
        await page.keyboard.type('02:00 PM');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-time-changed.png`, fullPage: true });
        console.log('Screenshot saved: schedule-time-changed.png');
      }
    }

    // Look for the ACTUALIZAR button and examine its behavior
    console.log('\n6. Examining ACTUALIZAR button...');
    const updateButton = await page.$('button:has-text("ACTUALIZAR"), .btn:has-text("ACTUALIZAR"), text=ACTUALIZAR');
    if (updateButton) {
      const buttonInfo = await updateButton.evaluate(el => ({
        tagName: el.tagName,
        className: el.className,
        type: el.type,
        onclick: el.getAttribute('onclick'),
        ngClick: el.getAttribute('ng-click'),
        vOnClick: el.getAttribute('@click') || el.getAttribute('v-on:click')
      }));
      console.log('Update button info:', JSON.stringify(buttonInfo, null, 2));

      // Take screenshot before clicking
      await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-before-update.png`, fullPage: true });

      // Note: Not actually clicking to avoid modifying data
      console.log('(Not clicking ACTUALIZAR to avoid modifying production data)');
    }

    // Look for the small icons next to each day row
    console.log('\n7. Examining day row icons...');
    const dayRowStructure = await page.evaluate(() => {
      // Find a row with day name (e.g., "Lunes")
      const lunesLabel = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'Lunes');
      if (lunesLabel) {
        const parent = lunesLabel.closest('div, tr, li') || lunesLabel.parentElement;
        return {
          parentHTML: parent?.innerHTML?.substring(0, 500),
          siblings: Array.from(parent?.querySelectorAll('*') || []).map(el => ({
            tag: el.tagName,
            class: el.className,
            text: el.textContent?.trim().substring(0, 30)
          })).slice(0, 20)
        };
      }
      return null;
    });
    console.log('Day row structure:', JSON.stringify(dayRowStructure, null, 2));

    // Check what the small icon next to times does (likely delete)
    const smallIcons = await page.$$eval('.fa, [class*="icon"], svg', icons => {
      return icons.slice(0, 20).map(i => ({
        className: i.className,
        tagName: i.tagName,
        title: i.getAttribute('title'),
        ariaLabel: i.getAttribute('aria-label')
      }));
    });
    console.log('Small icons found:', JSON.stringify(smallIcons.slice(0, 10), null, 2));

    // Final screenshot
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-analysis-complete.png`, fullPage: true });

    console.log('\n8. API calls made during exploration:');
    apiCalls.forEach(call => console.log(`  ${call.method} ${call.url}`));

    console.log('\nExploration complete.');

  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-edit-error.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreScheduleEditFlow();
