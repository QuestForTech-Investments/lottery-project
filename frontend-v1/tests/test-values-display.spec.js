import { test, expect } from '@playwright/test';

test('Verify prize values display correctly in UI', async ({ page }) => {
  console.log('🧪 TEST: Verificar que valores de premios se muestran correctamente\n');

  // Login
  await page.goto('http://localhost:3001/login');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'Admin123456');
  await page.click('#log-in');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Navigate to edit banca 9
  console.log('📍 Navegando a editar banca 9...');
  await page.goto('http://localhost:3001/bancas/editar/9');

  // Wait for page to load
  await page.waitForTimeout(3000);

  // Click on "Premios & Comisiones" tab
  console.log('📍 Buscando tab "Premios & Comisiones"...');

  // Try multiple selectors to find the tab
  const tabSelectors = [
    'button:has-text("Premios")',
    'button:has-text("PREMIOS")',
    'div[role="tab"]:has-text("Premios")',
    'text=Premios & Comisiones',
    'text=Premios'
  ];

  let tabFound = false;
  for (const selector of tabSelectors) {
    try {
      const tab = page.locator(selector).first();
      if (await tab.isVisible({ timeout: 1000 })) {
        console.log(`✅ Tab encontrado con selector: ${selector}`);
        await tab.click();
        tabFound = true;
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  if (!tabFound) {
    console.log('⚠️ No se encontró el tab, listando todos los botones visibles:');
    const buttons = await page.locator('button').all();
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const text = await buttons[i].textContent();
      console.log(`  Button ${i}: "${text}"`);
    }
  }

  // Wait for tab content to load
  await page.waitForTimeout(2000);

  // Capture all console logs with prize values
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Cargando:') || text.includes('DIRECTO_PRIMER_PAGO')) {
      logs.push(text);
      console.log(`📋 ${text}`);
    }
  });

  // Check if specific input fields have values
  console.log('\n🔍 Verificando valores en inputs...\n');

  const fieldsToCheck = [
    { name: 'DIRECTO_PRIMER_PAGO', expected: '56' },
    { name: 'DIRECTO_SEGUNDO_PAGO', expected: '12' },
    { name: 'DIRECTO_TERCER_PAGO', expected: '4' },
    { name: 'PALE_TODOS_EN_SECUENCIA', expected: '1100' },
    { name: 'TRIPLETA_PRIMER_PAGO', expected: '10000' }
  ];

  for (const field of fieldsToCheck) {
    // Try different selectors
    const selectors = [
      `input[name="${field.name}"]`,
      `input[name="prizes.${field.name}"]`,
      `input[id="${field.name}"]`,
      `input[placeholder*="${field.name}"]`
    ];

    let found = false;
    for (const selector of selectors) {
      try {
        const input = page.locator(selector).first();
        if (await input.isVisible({ timeout: 500 })) {
          const value = await input.inputValue();
          console.log(`  ✅ ${field.name}: ${value} (esperado: ${field.expected})`);

          if (value === '0' || value === '') {
            console.log(`    ❌ ERROR: Valor es ${value}, debería ser ${field.expected}`);
          } else if (value === field.expected) {
            console.log(`    ✅ CORRECTO!`);
          }

          found = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!found) {
      console.log(`  ⚠️ ${field.name}: Input no encontrado`);
    }
  }

  console.log('\n📊 Logs de carga de valores capturados:', logs.length);
});
