const { chromium } = require('playwright');

async function testLoginPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:4002/login');
    await page.waitForTimeout(2000);

    // Tomar screenshot
    await page.screenshot({ path: '/tmp/login-page.png' });
    console.log('Screenshot guardado en /tmp/login-page.png');

    // Intentar encontrar el input de username con diferentes selectores
    console.log('\nProbando selectores para username:');

    const selectors = [
      'input[name="username"]',
      'input#username',
      'input[type="text"]',
      'input[placeholder*="usuario" i]',
      'input[placeholder*="Usuario" i]',
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      console.log(`  ${selector}: ${count > 0 ? '✅ ENCONTRADO' : '❌ No encontrado'} (${count})`);
    }

    await page.waitForTimeout(5000);

  } finally {
    await browser.close();
  }
}

testLoginPage().catch(console.error);
