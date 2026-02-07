const { chromium } = require('playwright');

const SCREENSHOT_DIR = '/tmp/claude-1001/-home-jorge-projects-lottery-project/7575d4c9-ea8e-4fc9-91f4-ad29103812bb/scratchpad';

async function exploreScheduleDeleteIcon() {
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

    // Navigate to schedules page
    console.log('\n2. Navigating to schedules page...');
    await page.goto('https://la-numbers.apk.lol/#/sortition-schedules');
    await page.waitForTimeout(3000);

    // Click on FLORIDA to expand
    console.log('\n3. Expanding FLORIDA section...');
    await page.click('text=FLORIDA (AMERICA/NEW_YORK)');
    await page.waitForTimeout(2000);

    // Look for the icon next to each day (appears to be a trash/delete icon)
    console.log('\n4. Looking for day row icons...');

    // Find all SVG elements (likely FontAwesome or similar icons)
    const svgElements = await page.$$('svg');
    console.log(`Found ${svgElements.length} SVG elements`);

    // Find the row structure and look for action buttons
    const rowIcons = await page.evaluate(() => {
      const rows = document.querySelectorAll('.row');
      const iconInfo = [];

      for (const row of rows) {
        const weekdayName = row.querySelector('.weekday-name');
        if (weekdayName) {
          const svg = row.querySelector('svg');
          const button = row.querySelector('button, .btn');
          if (svg) {
            iconInfo.push({
              day: weekdayName.textContent.trim(),
              svgData: svg.getAttribute('data-icon'),
              svgClass: svg.className?.baseVal || svg.getAttribute('class'),
              parentClass: svg.parentElement?.className
            });
          }
        }
      }
      return iconInfo;
    });
    console.log('Row icons:', JSON.stringify(rowIcons, null, 2));

    // Find all trash/delete related elements
    const trashElements = await page.$$eval('svg[data-icon*="trash"], [class*="trash"], [class*="delete"], [title*="delete"], [title*="eliminar"]', els => {
      return els.map(el => ({
        tagName: el.tagName,
        dataIcon: el.getAttribute('data-icon'),
        className: typeof el.className === 'string' ? el.className : el.className?.baseVal,
        title: el.getAttribute('title'),
        parentClass: el.parentElement?.className
      }));
    });
    console.log('Trash/delete elements:', JSON.stringify(trashElements, null, 2));

    // Look for the small button/icon at the end of each schedule row
    console.log('\n5. Examining end-of-row elements...');
    const endOfRowElements = await page.evaluate(() => {
      // Find elements that are likely at the end of schedule rows
      const elements = [];
      const allSvgs = document.querySelectorAll('svg');

      for (const svg of allSvgs) {
        const parent = svg.closest('.col-1, .col-2, .col-auto');
        if (parent) {
          const row = parent.closest('.row');
          const hasTimeInputs = row?.querySelector('.el-date-editor');
          if (hasTimeInputs) {
            elements.push({
              dataIcon: svg.getAttribute('data-icon'),
              dataPrefix: svg.getAttribute('data-prefix'),
              className: svg.className?.baseVal,
              parentColumn: parent.className,
              clickable: !!parent.closest('button, a, [role="button"]')
            });
          }
        }
      }
      return elements;
    });
    console.log('End of row elements:', JSON.stringify(endOfRowElements.slice(0, 10), null, 2));

    // Try to hover over the icon to see if tooltip appears
    console.log('\n6. Hovering over icon next to first time row...');
    const firstRowIcon = await page.$('.row:has(.weekday-name) svg');
    if (firstRowIcon) {
      await firstRowIcon.hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-icon-hover.png`, fullPage: true });
      console.log('Screenshot saved: schedule-icon-hover.png');

      // Get icon info
      const iconDetails = await firstRowIcon.evaluate(el => ({
        dataIcon: el.getAttribute('data-icon'),
        outerHTML: el.outerHTML.substring(0, 200)
      }));
      console.log('Icon details:', JSON.stringify(iconDetails, null, 2));
    }

    // Also check what the sortition-schedules API returns
    console.log('\n7. Checking API response structure...');
    const apiData = await page.evaluate(async () => {
      // Get the stored token if available
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('https://api.lotocompany.com/api/v1/sortition-schedules-information?category=1', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          // Return just the first lottery's structure
          if (data.lotteriesInformation && data.lotteriesInformation.length > 0) {
            return {
              firstLottery: data.lotteriesInformation[0],
              totalLotteries: data.lotteriesInformation.length
            };
          }
          return data;
        } catch (e) {
          return { error: e.message };
        }
      }
      return { error: 'No token found' };
    });
    console.log('API data structure:', JSON.stringify(apiData, null, 2));

    // Final screenshot showing the complete UI
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-ui-complete.png`, fullPage: true });
    console.log('\nExploration complete.');

  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-delete-error.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreScheduleDeleteIcon();
