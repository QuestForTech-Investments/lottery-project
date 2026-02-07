const { chromium } = require('playwright');

const SCREENSHOT_DIR = '/tmp/claude-1001/-home-jorge-projects-lottery-project/7575d4c9-ea8e-4fc9-91f4-ad29103812bb/scratchpad';

async function exploreSorteosSchedules() {
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

    // Click on SORTEOS menu to expand it
    console.log('\n2. Clicking on SORTEOS menu...');
    const sorteosMenu = await page.$('text=SORTEOS');
    if (sorteosMenu) {
      await sorteosMenu.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sorteos-menu-expanded.png`, fullPage: true });
      console.log('Screenshot saved: sorteos-menu-expanded.png');

      // Get submenu items
      const subMenuItems = await page.evaluate(() => {
        const items = document.querySelectorAll('a[href*="sorteo"], a[href*="draw"], a[href*="horario"], a[href*="schedule"]');
        return Array.from(items).map(a => ({ text: a.textContent?.trim(), href: a.getAttribute('href') }));
      });
      console.log('Sorteos submenu items:', JSON.stringify(subMenuItems, null, 2));
    }

    // Try known sorteos-related URLs
    const sorteosUrls = [
      '#/sorteos',
      '#/sorteos/list',
      '#/sorteos/schedules',
      '#/sorteos/horarios',
      '#/draw-schedules',
      '#/draws',
      '#/draws/list',
      '#/draws/schedules'
    ];

    for (const url of sorteosUrls) {
      console.log(`\nTrying URL: ${url}`);
      await page.goto(`https://la-numbers.apk.lol/${url}`);
      await page.waitForTimeout(2000);

      // Check if page has meaningful content
      const pageText = await page.evaluate(() => document.body.innerText);
      if (pageText.length > 200 && !pageText.includes('404')) {
        const cleanUrl = url.replace(/[#\/]/g, '-');
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sorteos-page${cleanUrl}.png`, fullPage: true });
        console.log(`Found content at ${url}. Screenshot saved.`);

        // Log first 500 chars of page content
        console.log('Page content preview:', pageText.substring(0, 500));

        // Check for tables
        const tables = await page.$$('table');
        if (tables.length > 0) {
          console.log(`Found ${tables.length} table(s) on page`);
        }

        // Check for edit buttons or icons
        const editButtons = await page.$$('[class*="edit"], [class*="pencil"], button:has-text("Editar"), a:has-text("Editar")');
        console.log(`Found ${editButtons.length} potential edit buttons/icons`);
      }
    }

    // Now specifically look for draw schedules / horarios
    console.log('\n3. Looking for horarios/schedules section...');

    // Go back to dashboard and look for all available routes
    await page.goto('https://la-numbers.apk.lol/#/dashboard');
    await page.waitForTimeout(2000);

    // Expand SORTEOS menu again and click on sub-items
    const sorteosMenuAgain = await page.$('text=SORTEOS');
    if (sorteosMenuAgain) {
      await sorteosMenuAgain.click();
      await page.waitForTimeout(500);

      // Get all links in sidebar
      const sidebarLinks = await page.evaluate(() => {
        const links = document.querySelectorAll('.sidebar a, .nav a, [class*="sidebar"] a');
        return Array.from(links).map(a => ({
          text: a.textContent?.trim(),
          href: a.getAttribute('href'),
          visible: a.offsetParent !== null
        })).filter(l => l.visible && l.href);
      });
      console.log('Sidebar links:', JSON.stringify(sidebarLinks, null, 2));

      // Find and click on schedule-related links
      for (const link of sidebarLinks) {
        if (link.text && (link.text.toLowerCase().includes('horario') ||
            link.text.toLowerCase().includes('schedule') ||
            link.text.toLowerCase().includes('sorteo'))) {
          console.log(`\nClicking on: ${link.text} (${link.href})`);
          await page.click(`a[href="${link.href}"]`);
          await page.waitForTimeout(2000);

          const cleanName = link.text.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
          await page.screenshot({ path: `${SCREENSHOT_DIR}/sorteos-${cleanName}.png`, fullPage: true });
          console.log(`Screenshot saved: sorteos-${cleanName}.png`);

          // Check for forms, tables, modals
          const formElements = await page.$$('form, table, [role="dialog"], .modal');
          console.log(`Page elements: forms/tables/modals: ${formElements.length}`);

          // Look for time input fields (for schedules)
          const timeInputs = await page.$$('input[type="time"], input[placeholder*="hora"], input[placeholder*="time"]');
          console.log(`Time inputs found: ${timeInputs.length}`);
        }
      }
    }

    // Take final screenshot
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sorteos-final-state.png`, fullPage: true });
    console.log('\nExploration complete.');

  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sorteos-error-state.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreSorteosSchedules();
