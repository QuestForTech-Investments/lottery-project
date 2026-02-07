const { chromium } = require('playwright');

const SCREENSHOT_DIR = '/tmp/claude-1001/-home-jorge-projects-lottery-project/7575d4c9-ea8e-4fc9-91f4-ad29103812bb/scratchpad';

async function exploreScheduleLastColumn() {
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

    // Get the full HTML structure of a schedule row
    console.log('\n4. Getting complete row HTML structure...');
    const rowHTML = await page.evaluate(() => {
      // Find a row with "Lunes"
      const allRows = document.querySelectorAll('.row');
      for (const row of allRows) {
        const weekday = row.querySelector('.weekday-name');
        if (weekday && weekday.textContent.trim() === 'Lunes') {
          // Get all columns in this row
          const cols = row.querySelectorAll('[class*="col-"]');
          return {
            totalCols: cols.length,
            cols: Array.from(cols).map((col, i) => ({
              index: i,
              className: col.className,
              innerHTML: col.innerHTML.substring(0, 300),
              text: col.textContent?.trim().substring(0, 50)
            }))
          };
        }
      }
      return null;
    });
    console.log('Row structure:', JSON.stringify(rowHTML, null, 2));

    // Specifically look at the last column of each row
    console.log('\n5. Examining last column elements...');
    const lastColElements = await page.evaluate(() => {
      const results = [];
      const allRows = document.querySelectorAll('.row.text-center.no-gutters');

      for (const row of allRows) {
        const cols = row.querySelectorAll('[class*="col-"]');
        if (cols.length > 0) {
          const lastCol = cols[cols.length - 1];
          const weekday = row.querySelector('.weekday-name');
          if (weekday) {
            results.push({
              day: weekday.textContent?.trim(),
              lastColClass: lastCol.className,
              lastColHTML: lastCol.innerHTML,
              hasButton: !!lastCol.querySelector('button'),
              hasIcon: !!lastCol.querySelector('i, svg'),
              clickableEl: lastCol.querySelector('[role="button"], button, a')?.tagName
            });
          }
        }
      }
      return results.slice(0, 5);
    });
    console.log('Last column elements:', JSON.stringify(lastColElements, null, 2));

    // Look for any small buttons or icons that could be for deleting
    console.log('\n6. Looking for action icons (i tags, small buttons)...');
    const actionElements = await page.evaluate(() => {
      const elements = [];

      // Look for i tags (often used for icons)
      const iTags = document.querySelectorAll('i');
      for (const i of iTags) {
        if (i.className && (i.className.includes('el-') || i.className.includes('fa-') || i.className.includes('icon'))) {
          elements.push({
            type: 'i',
            className: i.className,
            parentClass: i.parentElement?.className,
            grandparentClass: i.parentElement?.parentElement?.className
          });
        }
      }

      // Look for small clickable elements
      const clickables = document.querySelectorAll('.col-1 button, .col-1 [role="button"], .col-1 a');
      for (const el of clickables) {
        elements.push({
          type: 'clickable',
          tagName: el.tagName,
          className: el.className,
          innerHTML: el.innerHTML.substring(0, 100)
        });
      }

      return elements.slice(0, 20);
    });
    console.log('Action elements:', JSON.stringify(actionElements, null, 2));

    // Get all elements in the schedule card area
    console.log('\n7. Getting schedule card structure...');
    const cardStructure = await page.evaluate(() => {
      const card = document.querySelector('.card-body');
      if (card) {
        // Find elements that look like they might be for actions
        const allElements = card.querySelectorAll('*');
        const clickableOrIcon = [];

        for (const el of allElements) {
          const hasClickHandler = el.onclick || el.getAttribute('@click') || el.getAttribute('v-on:click');
          const isIcon = el.tagName === 'I' || el.tagName === 'SVG' || el.className?.toString().includes('icon');

          if (hasClickHandler || isIcon) {
            clickableOrIcon.push({
              tagName: el.tagName,
              className: typeof el.className === 'string' ? el.className : el.className?.baseVal,
              hasClick: !!hasClickHandler
            });
          }
        }

        return clickableOrIcon.slice(0, 30);
      }
      return null;
    });
    console.log('Clickable/icon elements in card:', JSON.stringify(cardStructure, null, 2));

    // Take a zoomed screenshot of just the schedule table area
    const scheduleArea = await page.$('.card-body');
    if (scheduleArea) {
      const box = await scheduleArea.boundingBox();
      if (box) {
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/schedule-table-zoomed.png`,
          clip: { x: box.x, y: box.y, width: Math.min(box.width, 800), height: Math.min(box.height, 400) }
        });
        console.log('Screenshot saved: schedule-table-zoomed.png');
      }
    }

    // Final - list ALL elements in a single schedule row
    console.log('\n8. Complete element list for one row...');
    const completeRow = await page.evaluate(() => {
      const rows = document.querySelectorAll('.row.text-center.no-gutters');
      for (const row of rows) {
        const weekday = row.querySelector('.weekday-name');
        if (weekday && weekday.textContent.trim() === 'Lunes') {
          const children = row.querySelectorAll('*');
          return Array.from(children).map(el => ({
            tag: el.tagName,
            class: el.className?.toString().substring(0, 50),
            text: el.textContent?.trim().substring(0, 20)
          })).filter(el => el.class || el.text);
        }
      }
      return null;
    });
    console.log('Complete row elements (first 30):', JSON.stringify(completeRow?.slice(0, 30), null, 2));

    await page.screenshot({ path: `${SCREENSHOT_DIR}/schedule-full-analysis.png`, fullPage: true });
    console.log('\nExploration complete.');

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

exploreScheduleLastColumn();
