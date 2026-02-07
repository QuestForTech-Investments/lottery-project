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
    await page.click('text=FLORIDA (AMERICA/NEW_YORK)');
    await page.waitForTimeout(2000);

    // Take detailed screenshot
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-florida-expanded-detail.png`, fullPage: true });
    console.log('Screenshot saved: schedule-florida-expanded-detail.png');

    // Get all input fields in the expanded section
    console.log('\n4. Analyzing all input fields...');
    const allInputs = await page.$$eval('input', inputs => {
      return inputs.map(i => ({
        type: i.type,
        value: i.value,
        readOnly: i.readOnly,
        disabled: i.disabled,
        placeholder: i.placeholder,
        className: i.className.substring(0, 100),
        name: i.name
      })).filter(i => i.value || i.placeholder);
    });
    console.log('All inputs:', JSON.stringify(allInputs, null, 2));

    // Find and click on a time input (looking for inputs with time values)
    console.log('\n5. Looking for editable time fields...');
    const timeInputSelector = 'input[type="text"]';
    const timeInputs = await page.$$(timeInputSelector);
    console.log(`Found ${timeInputs.length} text inputs`);

    // Get a time input and try interacting with it
    for (let i = 0; i < Math.min(timeInputs.length, 20); i++) {
      const value = await timeInputs[i].evaluate(el => el.value);
      if (value && (value.includes('AM') || value.includes('PM'))) {
        console.log(`Found time input with value: ${value}`);

        // Check if it's editable
        const isEditable = await timeInputs[i].evaluate(el => !el.readOnly && !el.disabled);
        console.log(`Is editable: ${isEditable}`);

        // Click on it
        await timeInputs[i].click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-time-input-focus.png`, fullPage: true });

        // Check if any modal or picker appeared
        const hasModal = await page.$('.modal.show, .modal.in, [role="dialog"], .time-picker, .picker');
        console.log(`Modal/picker appeared: ${hasModal !== null}`);

        break;
      }
    }

    // Look for ACTUALIZAR button
    console.log('\n6. Looking for ACTUALIZAR button...');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('ACTUALIZAR')) {
        console.log('Found ACTUALIZAR button');
        const buttonBox = await btn.boundingBox();
        console.log('Button position:', buttonBox);

        // Highlight the button area
        await btn.evaluate(el => {
          el.style.border = '3px solid red';
        });
        await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-actualizar-button.png`, fullPage: true });
        break;
      }
    }

    // Examine the structure around a day row (e.g., Lunes)
    console.log('\n7. Examining day row structure...');
    const dayRowHTML = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        if (el.textContent?.trim() === 'Lunes' && el.tagName !== 'SCRIPT') {
          // Find the parent row
          let parent = el.parentElement;
          for (let i = 0; i < 5 && parent; i++) {
            if (parent.children.length > 2) {
              return {
                tagName: parent.tagName,
                className: parent.className,
                innerHTML: parent.innerHTML.substring(0, 1000),
                childCount: parent.children.length
              };
            }
            parent = parent.parentElement;
          }
        }
      }
      return null;
    });
    console.log('Day row structure:', JSON.stringify(dayRowHTML, null, 2));

    // Look for any icons (fa icons, material icons, etc.)
    const icons = await page.$$eval('[class*="fa-"], [class*="icon"], .material-icons, svg', els => {
      return els.slice(0, 30).map(el => ({
        tagName: el.tagName,
        className: typeof el.className === 'string' ? el.className : '',
        title: el.getAttribute('title'),
        onclick: el.getAttribute('onclick') ? 'has onclick' : null
      }));
    });
    console.log('Icons found:', JSON.stringify(icons.filter(i => i.className).slice(0, 15), null, 2));

    // Check for bootstrap-vue or vuetify components
    console.log('\n8. Checking for Vue components...');
    const vueComponents = await page.evaluate(() => {
      const vueTags = document.querySelectorAll('[class*="v-"], [class*="b-"], [data-v-]');
      return Array.from(vueTags).slice(0, 10).map(el => ({
        tagName: el.tagName,
        className: el.className.substring(0, 100)
      }));
    });
    console.log('Vue components:', JSON.stringify(vueComponents, null, 2));

    // Final summary
    console.log('\n=== SUMMARY ===');
    console.log('API endpoints called:');
    const uniqueEndpoints = [...new Set(apiCalls.map(c => `${c.method} ${c.url.split('?')[0]}`))];
    uniqueEndpoints.forEach(e => console.log(`  ${e}`));

    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-exploration-final.png`, fullPage: true });
    console.log('\nExploration complete.');

  } catch (e) {
    console.error('Error:', e.message, e.stack);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-edit-error.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreScheduleEditFlow();
