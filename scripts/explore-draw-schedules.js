const { chromium } = require('playwright');

const SCREENSHOT_DIR = '/tmp/claude-1001/-home-jorge-projects-lottery-project/7575d4c9-ea8e-4fc9-91f4-ad29103812bb/scratchpad';

async function exploreDrawSchedules() {
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

    // Take screenshot after login
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-after-login.png`, fullPage: true });
    console.log('Screenshot saved: 01-after-login.png');

    // Look for menu items to find Sorteos/Horarios
    console.log('\n2. Looking for menu items...');

    // Get all visible text to find navigation
    const menuText = await page.evaluate(() => {
      const menuItems = document.querySelectorAll('a, button, [role="menuitem"], .nav-item, .menu-item, li');
      return Array.from(menuItems).map(el => ({
        text: el.textContent?.trim().substring(0, 50),
        tag: el.tagName,
        href: el.getAttribute('href')
      })).filter(item => item.text && item.text.length > 0);
    });

    console.log('Menu items found:', JSON.stringify(menuText.slice(0, 30), null, 2));

    // Look for sidebar/menu
    const sidebar = await page.$('.sidebar, .nav, .menu, [class*="sidebar"], [class*="menu"]');
    if (sidebar) {
      console.log('Sidebar found');
    }

    // Try to find and click on Sorteos or a related menu
    const sorteosLink = await page.$('a[href*="sorteo"], a[href*="draw"], a[href*="horario"], a[href*="schedule"]');
    if (sorteosLink) {
      console.log('Found sorteos/schedule link');
      await sorteosLink.click();
      await page.waitForTimeout(2000);
    } else {
      // Try clicking on a menu that might have Sorteos
      console.log('Looking for Sorteos in menu...');

      // Get all clickable elements with text
      const clickables = await page.$$('a, button, [role="button"]');
      for (const el of clickables) {
        const text = await el.textContent().catch(() => '');
        if (text && (text.includes('Sorteo') || text.includes('Horario') || text.includes('Draw') || text.includes('Schedule'))) {
          console.log(`Found clickable: ${text}`);
          await el.click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }

    // Take screenshot of current state
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-after-menu-search.png`, fullPage: true });
    console.log('Screenshot saved: 02-after-menu-search.png');

    // Try navigating directly to likely URLs
    const possibleUrls = [
      '/#/draws',
      '/#/sorteos',
      '/#/horarios',
      '/#/schedules',
      '/#/draw-schedules',
      '/#/configuracion/sorteos',
      '/#/config/draws',
      '/#/admin/draws',
      '/#/admin/sorteos'
    ];

    for (const url of possibleUrls) {
      console.log(`Trying URL: ${url}`);
      await page.goto(`https://la-numbers.apk.lol${url}`);
      await page.waitForTimeout(2000);

      const pageContent = await page.content();
      const hasContent = pageContent.includes('sorteo') || pageContent.includes('horario') ||
                         pageContent.includes('Sorteo') || pageContent.includes('Horario') ||
                         pageContent.includes('draw') || pageContent.includes('schedule');

      if (hasContent && !pageContent.includes('404') && !pageContent.includes('not found')) {
        console.log(`Found content at ${url}`);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/03-draws-page-${url.replace(/[#\/]/g, '-')}.png`, fullPage: true });

        // Check for tables or lists
        const tables = await page.$$('table');
        const lists = await page.$$('ul, ol, .list, [class*="list"]');
        console.log(`Tables found: ${tables.length}, Lists found: ${lists.length}`);
      }
    }

    // Now try to explore the admin/config area
    console.log('\n3. Exploring admin/config area...');

    // Look for config/admin menu
    const configUrls = [
      '/#/admin',
      '/#/configuracion',
      '/#/config',
      '/#/settings'
    ];

    for (const url of configUrls) {
      await page.goto(`https://la-numbers.apk.lol${url}`);
      await page.waitForTimeout(2000);

      const hasContent = await page.evaluate(() => {
        return document.body.textContent.length > 100;
      });

      if (hasContent) {
        console.log(`Content found at ${url}`);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/04-config-${url.replace(/[#\/]/g, '-')}.png`, fullPage: true });

        // Look for sub-menu items
        const subMenuItems = await page.evaluate(() => {
          const items = document.querySelectorAll('a, button, [role="menuitem"]');
          return Array.from(items)
            .map(el => ({ text: el.textContent?.trim(), href: el.getAttribute('href') }))
            .filter(item => item.text && item.text.length > 0 && item.text.length < 50);
        });
        console.log('Sub-menu items:', JSON.stringify(subMenuItems.slice(0, 20), null, 2));
      }
    }

    // Try the main menu approach - look for hamburger or main nav
    console.log('\n4. Looking for main navigation...');
    await page.goto('https://la-numbers.apk.lol/#/');
    await page.waitForTimeout(2000);

    // Click on hamburger menu if exists
    const hamburger = await page.$('[class*="hamburger"], [class*="toggle"], .navbar-toggler, button[aria-label*="menu"]');
    if (hamburger) {
      await hamburger.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/05-hamburger-menu.png`, fullPage: true });
    }

    // Get all links on the page
    const allLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .map(a => ({ text: a.textContent?.trim(), href: a.href }))
        .filter(l => l.href && l.href.includes('#/'));
    });
    console.log('All links:', JSON.stringify(allLinks.slice(0, 30), null, 2));

    // Final state
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-final-state.png`, fullPage: true });
    console.log('\nExploration complete. Check screenshots in:', SCREENSHOT_DIR);

  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/error-state.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreDrawSchedules();
