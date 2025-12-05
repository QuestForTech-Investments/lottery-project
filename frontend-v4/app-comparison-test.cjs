const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = '/tmp/comparison-screenshots';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function compareApplications() {
  console.log('🚀 Starting application comparison...\n');

  const browser = await chromium.launch({ headless: true });

  try {
    // ============================================
    // 1. LOGIN TO ORIGINAL VUE.JS APP
    // ============================================
    console.log('📱 Testing ORIGINAL Vue.js app (https://la-numbers.apk.lol)');
    const originalContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const originalPage = await originalContext.newPage();

    await originalPage.goto('https://la-numbers.apk.lol');
    await originalPage.waitForLoadState('networkidle');
    await originalPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-original-login.png'),
      fullPage: true
    });
    console.log('  ✓ Login page screenshot saved');

    // Login to original
    await originalPage.fill('input[name="username"]', 'oliver');
    await originalPage.fill('input[name="password"]', 'oliver0597@');
    await originalPage.click('button[type="submit"]');
    await originalPage.waitForTimeout(3000);
    await originalPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-original-dashboard.png'),
      fullPage: true
    });
    console.log('  ✓ Dashboard screenshot saved');

    // ============================================
    // 2. LOGIN TO FRONTEND-V4
    // ============================================
    console.log('\n📱 Testing Frontend-v4 (http://localhost:4023)');
    const v4Context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const v4Page = await v4Context.newPage();

    await v4Page.goto('http://localhost:4023');
    await v4Page.waitForLoadState('networkidle');
    await v4Page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-v4-login.png'),
      fullPage: true
    });
    console.log('  ✓ Login page screenshot saved');

    // Login to v4
    await v4Page.fill('input[name="username"]', 'admin');
    await v4Page.fill('input[name="password"]', 'Admin123456');
    await v4Page.click('button[type="submit"]');
    await v4Page.waitForTimeout(3000);
    await v4Page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-v4-dashboard.png'),
      fullPage: true
    });
    console.log('  ✓ Dashboard screenshot saved');

    // ============================================
    // 3. COMPARE BETTING POOLS LIST
    // ============================================
    console.log('\n📋 Comparing Betting Pools List...');

    // Original - Navigate to bancas/pools
    try {
      await originalPage.click('text=Bancas', { timeout: 5000 });
      await originalPage.waitForTimeout(2000);
      await originalPage.screenshot({
        path: path.join(SCREENSHOT_DIR, '03-original-bancas-list.png'),
        fullPage: true
      });
      console.log('  ✓ Original bancas list captured');
    } catch (e) {
      console.log('  ⚠ Could not find bancas in original app:', e.message);
    }

    // V4 - Navigate to betting pools
    try {
      await v4Page.click('text=Bancas', { timeout: 5000 });
      await v4Page.waitForTimeout(2000);
      await v4Page.screenshot({
        path: path.join(SCREENSHOT_DIR, '03-v4-betting-pools-list.png'),
        fullPage: true
      });
      console.log('  ✓ V4 betting pools list captured');
    } catch (e) {
      console.log('  ⚠ Could not find betting pools in v4:', e.message);
    }

    // ============================================
    // 4. COMPARE CREATE/EDIT BETTING POOL FORM
    // ============================================
    console.log('\n✏️ Comparing Create/Edit Forms...');

    // Original - Try to access edit form
    try {
      const editButton = await originalPage.locator('button:has-text("Editar"), a:has-text("Editar")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await originalPage.waitForTimeout(2000);
        await originalPage.screenshot({
          path: path.join(SCREENSHOT_DIR, '04-original-edit-form-general.png'),
          fullPage: true
        });
        console.log('  ✓ Original edit form (general) captured');

        // Click on Premios tab if exists
        const premiosTab = await originalPage.locator('text=Premios');
        if (await premiosTab.isVisible()) {
          await premiosTab.click();
          await originalPage.waitForTimeout(1000);
          await originalPage.screenshot({
            path: path.join(SCREENSHOT_DIR, '05-original-edit-form-premios.png'),
            fullPage: true
          });
          console.log('  ✓ Original premios tab captured');
        }
      }
    } catch (e) {
      console.log('  ⚠ Could not access original edit form:', e.message);
    }

    // V4 - Try to access edit form
    try {
      const editButton = await v4Page.locator('button:has-text("Editar"), a:has-text("Editar")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await v4Page.waitForTimeout(2000);
        await v4Page.screenshot({
          path: path.join(SCREENSHOT_DIR, '04-v4-edit-form-general.png'),
          fullPage: true
        });
        console.log('  ✓ V4 edit form (general) captured');

        // Click on Premios tab if exists
        const premiosTab = await v4Page.locator('text=Premios');
        if (await premiosTab.isVisible()) {
          await premiosTab.click();
          await v4Page.waitForTimeout(1000);
          await v4Page.screenshot({
            path: path.join(SCREENSHOT_DIR, '05-v4-edit-form-premios.png'),
            fullPage: true
          });
          console.log('  ✓ V4 premios tab captured');
        }
      }
    } catch (e) {
      console.log('  ⚠ Could not access v4 edit form:', e.message);
    }

    // ============================================
    // 5. COMPARE TICKET CREATION
    // ============================================
    console.log('\n🎫 Comparing Ticket Creation...');

    // Go back to dashboard/home for both
    await originalPage.goto('https://la-numbers.apk.lol');
    await originalPage.waitForTimeout(2000);
    await v4Page.goto('http://localhost:4023');
    await v4Page.waitForTimeout(2000);

    // Original - Find ticket creation
    try {
      const ticketLink = await originalPage.locator('text=Tickets, text=Crear Ticket, text=Vender').first();
      if (await ticketLink.isVisible()) {
        await ticketLink.click();
        await originalPage.waitForTimeout(2000);
        await originalPage.screenshot({
          path: path.join(SCREENSHOT_DIR, '06-original-ticket-creation.png'),
          fullPage: true
        });
        console.log('  ✓ Original ticket creation captured');
      }
    } catch (e) {
      console.log('  ⚠ Could not find ticket creation in original:', e.message);
    }

    // V4 - Find ticket creation
    try {
      const ticketLink = await v4Page.locator('text=Tickets, text=Crear Ticket, text=Vender').first();
      if (await ticketLink.isVisible()) {
        await ticketLink.click();
        await v4Page.waitForTimeout(2000);
        await v4Page.screenshot({
          path: path.join(SCREENSHOT_DIR, '06-v4-ticket-creation.png'),
          fullPage: true
        });
        console.log('  ✓ V4 ticket creation captured');
      }
    } catch (e) {
      console.log('  ⚠ Could not find ticket creation in v4:', e.message);
    }

    // ============================================
    // 6. COMPARE TICKET MONITORING/LIST
    // ============================================
    console.log('\n📊 Comparing Ticket Monitoring...');

    // Original - Find ticket list/monitoring
    try {
      await originalPage.goto('https://la-numbers.apk.lol');
      await originalPage.waitForTimeout(1000);
      const monitorLink = await originalPage.locator('text=Monitoreo, text=Lista de Tickets, text=Ver Tickets').first();
      if (await monitorLink.isVisible()) {
        await monitorLink.click();
        await originalPage.waitForTimeout(2000);
        await originalPage.screenshot({
          path: path.join(SCREENSHOT_DIR, '07-original-ticket-monitoring.png'),
          fullPage: true
        });
        console.log('  ✓ Original ticket monitoring captured');
      }
    } catch (e) {
      console.log('  ⚠ Could not find ticket monitoring in original:', e.message);
    }

    // V4 - Find ticket list/monitoring
    try {
      await v4Page.goto('http://localhost:4023');
      await v4Page.waitForTimeout(1000);
      const monitorLink = await v4Page.locator('text=Monitoreo, text=Lista de Tickets, text=Ver Tickets').first();
      if (await monitorLink.isVisible()) {
        await monitorLink.click();
        await v4Page.waitForTimeout(2000);
        await v4Page.screenshot({
          path: path.join(SCREENSHOT_DIR, '07-v4-ticket-monitoring.png'),
          fullPage: true
        });
        console.log('  ✓ V4 ticket monitoring captured');
      }
    } catch (e) {
      console.log('  ⚠ Could not find ticket monitoring in v4:', e.message);
    }

    // ============================================
    // 7. EXTRACT DATA FOR COMPARISON
    // ============================================
    console.log('\n📊 Extracting data for comparison...');

    // Extract menu items from both apps
    const originalMenuItems = await originalPage.evaluate(() => {
      const items = Array.from(document.querySelectorAll('nav a, .menu a, .sidebar a'));
      return items.map(item => item.textContent.trim()).filter(t => t.length > 0);
    });

    const v4MenuItems = await v4Page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('nav a, .menu a, .sidebar a'));
      return items.map(item => item.textContent.trim()).filter(t => t.length > 0);
    });

    // Save comparison data
    const comparisonData = {
      timestamp: new Date().toISOString(),
      original: {
        url: 'https://la-numbers.apk.lol',
        menuItems: originalMenuItems
      },
      v4: {
        url: 'http://localhost:4023',
        menuItems: v4MenuItems
      }
    };

    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'comparison-data.json'),
      JSON.stringify(comparisonData, null, 2)
    );
    console.log('  ✓ Comparison data saved');

    console.log('\n✅ Comparison complete!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);

  } catch (error) {
    console.error('\n❌ Error during comparison:', error);
  } finally {
    await browser.close();
  }
}

compareApplications().catch(console.error);
