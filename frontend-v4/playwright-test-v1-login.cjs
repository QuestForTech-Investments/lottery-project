/**
 * Test: Login en Frontend V1 y Navegación al Dashboard
 *
 * Puerto: http://localhost:4200
 * Credenciales: admin / admin123
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4200';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'Admin123456'; // Misma contraseña que V2
const SCREENSHOTS_DIR = '/tmp/v1';

(async () => {
  console.log('🚀 Test: Login Frontend V1');
  console.log('═══════════════════════════════════════════════════════\n');

  // Crear directorio para screenshots
  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Monitorear API requests
  const apiRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const url = request.url().replace('http://localhost:5000', '').replace('http://localhost:4200', '');
      apiRequests.push({
        method: request.method(),
        url: url
      });
    }
  });

  try {
    // PASO 1: Navegar a la página de login
    console.log('📍 PASO 1: Navegando a Frontend V1');
    console.log('─────────────────────────────────────────────────────');
    console.log(`   URL: ${FRONTEND_URL}`);

    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-login-page.png`, fullPage: true });
    console.log('   ✅ Página de login cargada\n');

    // PASO 2: Ingresar credenciales
    console.log('📍 PASO 2: Ingresando credenciales');
    console.log('─────────────────────────────────────────────────────');
    console.log(`   Usuario: ${TEST_USERNAME}`);
    console.log(`   Password: ${TEST_PASSWORD.replace(/./g, '*')}`);

    // Buscar campos de usuario y contraseña
    const usernameSelectors = [
      'input[placeholder*="Usuario" i]',
      'input[placeholder*="usuario" i]',
      'input[name="username"]',
      'input[type="text"]',
      'input[id*="user" i]'
    ];

    const passwordSelectors = [
      'input[placeholder*="Contraseña" i]',
      'input[placeholder*="contraseña" i]',
      'input[placeholder*="Password" i]',
      'input[name="password"]',
      'input[type="password"]'
    ];

    // Probar selectores de usuario
    let usernameFilled = false;
    for (const selector of usernameSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.fill(TEST_USERNAME);
          console.log(`   ✅ Usuario ingresado (selector: ${selector})`);
          usernameFilled = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!usernameFilled) {
      throw new Error('No se pudo encontrar el campo de usuario');
    }

    // Probar selectores de password
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.fill(TEST_PASSWORD);
          console.log(`   ✅ Contraseña ingresada (selector: ${selector})\n`);
          passwordFilled = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!passwordFilled) {
      throw new Error('No se pudo encontrar el campo de contraseña');
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-credentials-filled.png`, fullPage: true });

    // PASO 3: Hacer clic en botón de login
    console.log('📍 PASO 3: Haciendo clic en "Iniciar Sesión"');
    console.log('─────────────────────────────────────────────────────');

    const loginButtonSelectors = [
      'button:has-text("INICIAR SESIÓN")',
      'button:has-text("Iniciar Sesión")',
      'button:has-text("Login")',
      'button:has-text("Entrar")',
      'button[type="submit"]',
      'button.btn-primary'
    ];

    let loginClicked = false;
    for (const selector of loginButtonSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          console.log(`   ✅ Clic en botón login (selector: ${selector})\n`);
          loginClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!loginClicked) {
      throw new Error('No se pudo hacer clic en el botón de login');
    }

    // Esperar navegación al dashboard
    await page.waitForTimeout(4000);
    await page.waitForLoadState('networkidle');

    const currentURL = page.url();
    console.log(`   📍 URL actual: ${currentURL}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-dashboard.png`, fullPage: true });

    // PASO 4: Verificar que estamos en el dashboard
    console.log('\n📍 PASO 4: Verificando Dashboard');
    console.log('─────────────────────────────────────────────────────');

    const isDashboard = currentURL.includes('/dashboard') || currentURL.includes('/inicio') || currentURL.includes('/home');

    if (isDashboard) {
      console.log('   ✅ Login exitoso - Dashboard cargado');
    } else {
      console.log(`   ⚠️  URL no contiene /dashboard: ${currentURL}`);
      console.log('   Verificando contenido de la página...');
    }

    // Buscar elementos del dashboard
    const bodyText = await page.locator('body').textContent();
    const hasMenuItems = bodyText.includes('BANCAS') || bodyText.includes('USUARIOS') || bodyText.includes('SORTEOS');

    if (hasMenuItems) {
      console.log('   ✅ Elementos del menú detectados');
    }

    // Analizar menú
    console.log('\n   📋 Analizando estructura del menú...');

    const menuSelectors = [
      'nav a',
      '.sidebar a',
      '.menu a',
      '[role="navigation"] a'
    ];

    for (const selector of menuSelectors) {
      try {
        const links = await page.locator(selector).all();
        if (links.length > 0) {
          console.log(`\n   📌 Elementos del menú (${links.length} encontrados):`);
          for (let i = 0; i < Math.min(links.length, 20); i++) {
            const text = await links[i].textContent();
            if (text && text.trim()) {
              console.log(`      ${i + 1}. ${text.trim()}`);
            }
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // PASO 5: Análisis de API calls
    console.log('\n📍 PASO 5: Análisis de API Calls');
    console.log('─────────────────────────────────────────────────────');

    const uniqueAPIs = [...new Set(apiRequests.map(r => `${r.method} ${r.url}`))];
    console.log(`\n   📡 Total de API calls: ${apiRequests.length}`);
    console.log(`   📡 API calls únicas: ${uniqueAPIs.length}\n`);

    uniqueAPIs.forEach((api, i) => {
      console.log(`   ${i + 1}. ${api}`);
    });

    // RESUMEN
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✨ TEST COMPLETADO');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Resumen:');
    console.log(`   • Frontend: V1`);
    console.log(`   • URL: ${FRONTEND_URL}`);
    console.log(`   • Credenciales: ${TEST_USERNAME} / ***`);
    console.log(`   • Login: ${isDashboard || hasMenuItems ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    console.log(`   • Dashboard: ${isDashboard ? '✅ SÍ' : '⚠️  Verificar'}`);
    console.log(`   • API calls: ${apiRequests.length}`);
    console.log(`   • Screenshots: 3`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR');
    console.error('═══════════════════════════════════════════════════════');
    console.error(`   ${error.message}`);
    console.error(`   URL: ${page.url()}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/error.png`, fullPage: true });
    throw error;

  } finally {
    console.log('⏳ Navegador abierto 10 segundos...\n');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('🏁 Finalizado.\n');
  }
})();
