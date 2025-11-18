const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navegando a V2 Loans List...');
    await page.goto('http://localhost:4000/loans/list', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('Esperando 3 segundos para que cargue...');
    await page.waitForTimeout(3000);
    
    // Capturar screenshot
    await page.screenshot({ path: '/tmp/v2-loans-manual-check.png', fullPage: true });
    
    // Buscar botones de diferentes formas
    console.log('\nBuscando botones...');
    
    const infoButtons = await page.locator('button').filter({ has: page.locator('svg[data-testid="InfoIcon"]') }).count();
    console.log(`InfoIcon buttons: ${infoButtons}`);
    
    const editLinks = await page.locator('a[href*="/loans/edit/"]').count();
    console.log(`Edit links: ${editLinks}`);
    
    const deleteButtons = await page.locator('button').filter({ has: page.locator('svg[data-testid="DeleteIcon"]') }).count();
    console.log(`DeleteIcon buttons: ${deleteButtons}`);
    
    console.log('\nDejando el navegador abierto por 10 segundos para inspección visual...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
