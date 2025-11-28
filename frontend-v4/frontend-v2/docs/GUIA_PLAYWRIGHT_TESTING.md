# 🎭 Guía Completa de Testing con Playwright

**Fecha:** 2025-11-02
**Autor:** Claude Code
**Proyecto:** LottoWebApp - Sistema de Lotería

---

## 📋 Tabla de Contenidos

1. [Introducción a Playwright](#introducción-a-playwright)
2. [Configuración del Proyecto](#configuración-del-proyecto)
3. [Estructura de un Test](#estructura-de-un-test)
4. [Patrones Comunes](#patrones-comunes)
5. [Helpers y Utilidades](#helpers-y-utilidades)
6. [Testing del Sistema de Premios](#testing-del-sistema-de-premios)
7. [Mejores Prácticas](#mejores-prácticas)
8. [Debugging](#debugging)
9. [CI/CD Integration](#cicd-integration)

---

## 1. Introducción a Playwright

### ¿Qué es Playwright?

Playwright es un framework de testing end-to-end (E2E) desarrollado por Microsoft que permite automatizar navegadores web (Chromium, Firefox, WebKit) para probar aplicaciones web.

### Ventajas

- ✅ **Cross-browser**: Soporta Chromium, Firefox y WebKit
- ✅ **Auto-wait**: Espera automáticamente a que los elementos sean interactivos
- ✅ **Fast & reliable**: Tests rápidos y estables
- ✅ **Screenshots & videos**: Captura automática para debugging
- ✅ **Parallel execution**: Ejecuta tests en paralelo
- ✅ **API robusta**: Locators potentes y selectores flexibles

### Casos de Uso

- Probar flujos completos de usuario
- Verificar integración frontend-backend
- Validar que los cambios no rompan funcionalidad existente
- Automatizar pruebas repetitivas

---

## 2. Configuración del Proyecto

### Instalación

```bash
cd LottoWebApp
npm install -D @playwright/test
npx playwright install
```

### Configuración (`playwright.config.js`)

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000, // 30 segundos por test
  expect: {
    timeout: 5000 // 5 segundos para expects
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 3. Estructura de un Test

### Anatomía Básica

```javascript
import { test, expect } from '@playwright/test';

// Describe: Agrupa tests relacionados
test.describe('Nombre del Módulo', () => {

  // beforeEach: Se ejecuta antes de cada test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup común
  });

  // Test individual
  test('Descripción del test', async ({ page }) => {
    // 1. Arrange: Preparar
    await page.goto('/ruta');

    // 2. Act: Actuar
    await page.click('button');

    // 3. Assert: Verificar
    await expect(page.locator('h1')).toHaveText('Éxito');
  });

  // afterEach: Se ejecuta después de cada test
  test.afterEach(async ({ page }) => {
    // Cleanup
  });
});
```

### Test Real del Proyecto

```javascript
test('Debe cargar zonas y crear una banca', async ({ page }) => {
  // 1. Login
  await page.goto('/');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'Admin123456');
  await page.click('button[type="submit"]');

  // 2. Esperar redirección
  await page.waitForURL(/\/(dashboard|home)/);

  // 3. Navegar a crear banca
  await page.goto('/bettingPools/new');

  // 4. Llenar formulario
  await page.fill('input[name="bettingPoolName"]', 'Test Banca');

  // 5. Seleccionar zona (Material-UI Select)
  const zoneField = page.locator('div[id="zoneId"]').first();
  await zoneField.click();
  await page.locator('ul[role="listbox"] li[role="option"]').nth(1).click();

  // 6. Guardar
  await page.click('button[type="submit"]');

  // 7. Verificar éxito
  await expect(page.locator('text=/éxito|success/i')).toBeVisible();
});
```

---

## 4. Patrones Comunes

### 4.1 Locators (Selectores)

```javascript
// Por rol ARIA (recomendado)
page.locator('button[role="button"]')
page.locator('[role="tab"]')

// Por texto
page.locator('text=Guardar')
page.locator('button', { hasText: 'Guardar' })

// Por atributo name
page.locator('input[name="username"]')

// Por CSS selector
page.locator('.my-class')
page.locator('#my-id')

// Por XPath (evitar si es posible)
page.locator('xpath=//button[@type="submit"]')

// Combinaciones
page.locator('button').filter({ hasText: /guardar/i })
```

### 4.2 Esperar Elementos

```javascript
// Esperar a que sea visible
await page.waitForSelector('button', { timeout: 5000 });

// Esperar a que desaparezca
await page.waitForSelector('.loading', { state: 'hidden' });

// Esperar por URL
await page.waitForURL('/dashboard');

// Esperar por estado de la red
await page.waitForLoadState('networkidle');

// Esperar timeout fijo (evitar si es posible)
await page.waitForTimeout(1000);
```

### 4.3 Interacciones

```javascript
// Click
await page.click('button');
await page.locator('button').click();

// Llenar input
await page.fill('input[name="email"]', 'test@example.com');

// Clear y llenar
await page.locator('input').clear();
await page.locator('input').fill('nuevo valor');

// Seleccionar en dropdown nativo
await page.selectOption('select[name="country"]', 'ES');

// Checkbox
await page.check('input[type="checkbox"]');
await page.uncheck('input[type="checkbox"]');

// Upload file
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');

// Keyboard
await page.keyboard.press('Enter');
await page.keyboard.type('Hello World');
```

### 4.4 Assertions

```javascript
// Visibilidad
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('.loading')).toBeHidden();

// Texto
await expect(page.locator('h1')).toHaveText('Bienvenido');
await expect(page.locator('h1')).toContainText('Bien');

// Valor de input
await expect(page.locator('input')).toHaveValue('test@example.com');

// Atributo
await expect(page.locator('button')).toHaveAttribute('disabled', '');

// Count
await expect(page.locator('li')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/dashboard/);

// Screenshot comparison
await expect(page).toHaveScreenshot();
```

---

## 5. Helpers y Utilidades

### 5.1 Helper de Login

```javascript
/**
 * Helper reutilizable para login
 */
async function login(page, username = 'admin', password = 'Admin123456') {
  await page.goto('/');
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });

  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(dashboard|home|inicio)/, { timeout: 10000 });

  console.log('✅ Login exitoso');
}

// Uso
test('Mi test', async ({ page }) => {
  await login(page);
  // ... continuar test
});
```

### 5.2 Helper de Navegación

```javascript
/**
 * Navegar al tab de Premios y Comisiones
 */
async function navigateToPrizesTab(page) {
  const prizesTab = page.locator('[role="tab"]')
    .filter({ hasText: /premios.*comisiones/i });

  await expect(prizesTab).toBeVisible({ timeout: 10000 });
  await prizesTab.click();
  await page.waitForTimeout(2000);

  // Esperar indicador de carga
  await page.waitForSelector('text=/tipos de juegos cargados/i', {
    timeout: 15000
  });

  console.log('✅ Tab de premios cargado');
}
```

### 5.3 Helper de Captura de Requests

```javascript
/**
 * Interceptar y capturar requests API
 */
async function captureApiRequests(page, urlPattern) {
  const requests = [];

  page.on('request', request => {
    if (request.url().includes(urlPattern)) {
      requests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData()
      });
    }
  });

  return requests;
}

// Uso
test('Verificar API calls', async ({ page }) => {
  const requests = await captureApiRequests(page, '/api/betting-pools');

  // Hacer algo que trigger la API
  await page.click('button');

  // Verificar
  expect(requests.length).toBeGreaterThan(0);
  expect(requests[0].method).toBe('POST');
});
```

### 5.4 Helper de Verificación Backend

```javascript
/**
 * Verificar datos directamente en el backend
 */
async function verifyBackendValue(bettingPoolId, fieldCode, expectedValue) {
  const response = await fetch(
    `http://localhost:5000/api/betting-pools/${bettingPoolId}/prize-config`
  );

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  const configs = await response.json();
  const config = configs.find(c => c.fieldCode === fieldCode);

  if (!config) {
    throw new Error(`Config not found for ${fieldCode}`);
  }

  if (config.customValue !== expectedValue) {
    throw new Error(
      `Mismatch: expected ${expectedValue}, got ${config.customValue}`
    );
  }

  console.log(`✅ Backend verified: ${fieldCode} = ${expectedValue}`);
  return true;
}
```

---

## 6. Testing del Sistema de Premios

### Test Completo: Edit + Save + Verify

```javascript
test('Sistema de premios: Flujo completo', async ({ page }) => {
  // 1. Login
  await login(page);

  // 2. Navegar a editar banca
  await page.goto(`/bettingPools/edit/19`);
  await page.waitForLoadState('networkidle');

  // 3. Ir al tab de premios
  await navigateToPrizesTab(page);

  // 4. Obtener valor actual
  const field = page.locator('input[name="DIRECTO_DIRECTO_PRIMER_PAGO"]');
  const valorInicial = parseFloat(await field.inputValue());
  console.log(`Valor inicial: ${valorInicial}`);

  // 5. Modificar valor
  const nuevoValor = valorInicial + 10;
  await field.clear();
  await field.fill(nuevoValor.toString());
  console.log(`Nuevo valor: ${nuevoValor}`);

  // 6. Guardar
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // 7. Verificar en backend
  await verifyBackendValue(19, 'DIRECTO_PRIMER_PAGO', nuevoValor);

  // 8. Recargar página
  await page.reload();
  await page.waitForLoadState('networkidle');
  await navigateToPrizesTab(page);

  // 9. Verificar persistencia
  const valorDespuesDeRecargar = parseFloat(await field.inputValue());
  expect(valorDespuesDeRecargar).toBe(nuevoValor);

  console.log('✅ Test completo exitoso');
});
```

### Test de Payload Format

```javascript
test('Verificar formato del payload enviado', async ({ page }) => {
  let payloadCapturado = null;

  // Interceptar request
  page.on('request', request => {
    if (request.method() === 'POST' &&
        request.url().includes('/prize-config')) {
      payloadCapturado = JSON.parse(request.postData());
      console.log('📦 Payload:', JSON.stringify(payloadCapturado, null, 2));
    }
  });

  await login(page);
  await page.goto('/bettingPools/edit/19');
  await navigateToPrizesTab(page);

  // Modificar valor
  await page.fill('input[name="DIRECTO_DIRECTO_PRIMER_PAGO"]', '88');

  // Guardar
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Verificar formato
  expect(payloadCapturado).not.toBeNull();
  expect(payloadCapturado).toHaveProperty('prizeConfigs');
  expect(Array.isArray(payloadCapturado.prizeConfigs)).toBe(true);

  const firstConfig = payloadCapturado.prizeConfigs[0];
  expect(firstConfig).toHaveProperty('prizeFieldId');
  expect(firstConfig).toHaveProperty('fieldCode');
  expect(firstConfig).toHaveProperty('value');

  console.log('✅ Formato correcto');
});
```

---

## 7. Mejores Prácticas

### ✅ DO's

1. **Usar roles ARIA y atributos semánticos**
   ```javascript
   // Bueno
   page.locator('[role="button"]')
   page.locator('input[name="email"]')

   // Evitar
   page.locator('.css-class-random-123')
   ```

2. **Usar helpers reutilizables**
   ```javascript
   // Crear funciones helper para flujos comunes
   async function login(page) { ... }
   async function createBettingPool(page, data) { ... }
   ```

3. **Usar expects explícitos**
   ```javascript
   // Bueno
   await expect(page.locator('h1')).toHaveText('Éxito');

   // Evitar
   const text = await page.locator('h1').textContent();
   expect(text).toBe('Éxito'); // No espera automáticamente
   ```

4. **Capturar screenshots para debugging**
   ```javascript
   await page.screenshot({
     path: 'test-results/debug.png',
     fullPage: true
   });
   ```

5. **Usar console.log para tracking**
   ```javascript
   console.log('✅ Login exitoso');
   console.log(`📊 Valor: ${valor}`);
   console.log('🔍 Verificando backend...');
   ```

### ❌ DON'Ts

1. **NO usar selectores frágiles**
   ```javascript
   // Malo: Cambiará si cambia el estilo
   page.locator('.MuiButton-root-123')

   // Bueno: Basado en semántica
   page.locator('button[type="submit"]')
   ```

2. **NO usar waits fijos si es posible**
   ```javascript
   // Malo: Tiempo arbitrario
   await page.waitForTimeout(5000);

   // Bueno: Espera a condición específica
   await page.waitForSelector('.loaded');
   ```

3. **NO repetir código**
   ```javascript
   // Malo: Repetir login en cada test
   test('test 1', async ({ page }) => {
     await page.goto('/');
     await page.fill('input[name="username"]', 'admin');
     // ... repetido
   });

   // Bueno: Usar helper o beforeEach
   test.beforeEach(async ({ page }) => {
     await login(page);
   });
   ```

4. **NO ignorar errores**
   ```javascript
   // Malo: Tragar errores
   try {
     await page.click('button');
   } catch (e) {
     // Ignorado
   }

   // Bueno: Manejar o propagar
   try {
     await page.click('button');
   } catch (e) {
     console.error('Error clicking button:', e);
     throw e;
   }
   ```

---

## 8. Debugging

### 8.1 Modo UI

Playwright incluye un modo UI interactivo muy útil:

```bash
npx playwright test --ui
```

Permite:
- Ver tests en tiempo real
- Pausar en cualquier momento
- Inspeccionar el DOM
- Ver screenshots paso a paso

### 8.2 Modo Debug

```bash
npx playwright test --debug
```

Abre el inspector de Playwright que permite:
- Ejecutar paso a paso
- Ver selectores
- Evaluar código en consola

### 8.3 Headed Mode

Ver el navegador mientras corre el test:

```bash
npx playwright test --headed
```

### 8.4 Slow Motion

Ejecutar en cámara lenta:

```bash
npx playwright test --headed --slow-mo=1000
```

### 8.5 Console Logs

Capturar console messages del navegador:

```javascript
test('Debug test', async ({ page }) => {
  page.on('console', msg => {
    console.log(`Browser [${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', error => {
    console.error('Browser error:', error.message);
  });

  // ... rest of test
});
```

### 8.6 Trace Viewer

Generar trace completo:

```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

---

## 9. CI/CD Integration

### 9.1 GitHub Actions

`.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd LottoWebApp
          npm ci

      - name: Install Playwright
        run: |
          cd LottoWebApp
          npx playwright install --with-deps

      - name: Run tests
        run: |
          cd LottoWebApp
          npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: LottoWebApp/playwright-report/
```

### 9.2 Scripts en package.json

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report",
    "test:prizes": "playwright test prizes-system-complete"
  }
}
```

---

## 10. Comandos Útiles

```bash
# Ejecutar todos los tests
npx playwright test

# Ejecutar un archivo específico
npx playwright test prizes-system-complete.spec.js

# Ejecutar un test específico por nombre
npx playwright test -g "Test 1: Cargar valores"

# Ejecutar en modo debug
npx playwright test --debug

# Ejecutar con UI
npx playwright test --ui

# Ver reporte HTML
npx playwright show-report

# Generar código automáticamente (codegen)
npx playwright codegen http://localhost:4000

# Limpiar resultados anteriores
rm -rf test-results playwright-report
```

---

## 11. Ejemplo Real: Test del Sistema de Premios

Ver archivo completo: `tests/prizes-system-complete.spec.js`

Este test incluye:

1. ✅ **Test 1**: Cargar valores por defecto
2. ✅ **Test 2**: Modificar y guardar valor custom
3. ✅ **Test 3**: Verificar persistencia
4. ✅ **Test 4**: Modificar múltiples valores
5. ✅ **Test 5**: Verificar formato del payload

### Ejecutar

```bash
cd LottoWebApp
npx playwright test prizes-system-complete.spec.js
```

### Ver Resultados

```bash
npx playwright show-report
```

---

## 📚 Recursos Adicionales

- [Documentación oficial de Playwright](https://playwright.dev/)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selector Engine](https://playwright.dev/docs/selectors)

---

## 📝 Notas Finales

Esta guía cubre los fundamentos y patrones más comunes para testing con Playwright en LottoWebApp. Se recomienda:

1. **Empezar simple**: Crear tests básicos primero
2. **Refactorizar**: Extraer helpers cuando se repite código
3. **Documentar**: Agregar comentarios explicativos
4. **Mantener**: Actualizar tests cuando cambia la UI
5. **Revisar**: Ejecutar tests antes de cada commit

---

**Última actualización:** 2025-11-02
**Mantenedor:** Equipo de Desarrollo LottoWebApp
