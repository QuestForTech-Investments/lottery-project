import { test } from '@playwright/test';

/**
 * Test para explorar el formulario de login y entender su estructura
 */
test('Explorar formulario de login', async ({ page }) => {
  console.log('📍 Navegando a página de login...');
  await page.goto('http://localhost:3001/login');

  // Esperar un poco para que cargue
  await page.waitForTimeout(2000);

  // Tomar screenshot de la página de login
  await page.screenshot({ path: 'login-screenshot.png', fullPage: true });
  console.log('📸 Screenshot guardado en login-screenshot.png');

  // Explorar todos los inputs en la página
  const inputs = await page.$$('input');
  console.log(`\n🔍 Se encontraron ${inputs.length} inputs en la página`);

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    const placeholder = await input.getAttribute('placeholder');
    const className = await input.getAttribute('class');

    console.log(`\nInput ${i + 1}:`);
    console.log(`  type: ${type}`);
    console.log(`  name: ${name}`);
    console.log(`  id: ${id}`);
    console.log(`  placeholder: ${placeholder}`);
    console.log(`  class: ${className}`);
  }

  // Explorar todos los botones
  const buttons = await page.$$('button');
  console.log(`\n🔘 Se encontraron ${buttons.length} botones en la página`);

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const type = await button.getAttribute('type');
    const text = await button.textContent();
    const className = await button.getAttribute('class');

    console.log(`\nBotón ${i + 1}:`);
    console.log(`  type: ${type}`);
    console.log(`  text: ${text}`);
    console.log(`  class: ${className}`);
  }

  // Ver HTML de la página
  const html = await page.content();
  console.log('\n📄 HTML de la página guardado en login-html.txt');
  require('fs').writeFileSync('login-html.txt', html);
});
