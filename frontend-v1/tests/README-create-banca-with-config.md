# Test: Crear Banca con Configuración

## Descripción

Este test (`create-banca-with-config.spec.js`) valida el flujo completo de creación de una banca con configuración en la aplicación LottoWebApp.

## Archivo

`/home/jorge/projects/LottoWebApp/tests/create-banca-with-config.spec.js`

## Fecha de Creación

29 de Octubre, 2025

## Objetivo del Test

Verificar que se puede crear exitosamente una banca con todos los campos de configuración:
- **Tab 1 - Datos Generales**: Nombre, Ubicación, Referencia
- **Tab 2 - Configuración**: Zona, Tipo de caída, Balance de desactivación, Límites, Proveedor de descuento, Modo de descuento, Tipo de impresora, Checkboxes de impresión, etc. (24 campos en total)

## Flujo del Test

1. **Login** con credenciales admin/Admin123456
2. **Navegación** a `/bancas/crear`
3. **Tab 1 - Datos Generales**:
   - Llenar nombre de banca
   - Llenar ubicación
   - Llenar referencia
4. **Tab 2 - Configuración**:
   - Hacer click en tab "Configuración"
   - Seleccionar zona (campo obligatorio)
   - Configurar tipo de caída (DIARIA)
   - Configurar balances y límites
   - Configurar proveedor de descuento (RIFERO)
   - Configurar modo de descuento (EFECTIVO)
   - Configurar tipo de impresora (GENERICO)
   - Activar checkboxes de impresión
5. **Submit** del formulario
6. **Verificación** de mensaje de éxito

## Problemas Encontrados y Soluciones

### Problema 1: Login selectors incorrectos

**Error Original:**
```
Error: page.fill: Test timeout of 60000ms exceeded.
Call log: - waiting for locator('input[name="username"]')
```

**Causa:**
- Usaba selectores de atributo `input[name="username"]` en lugar de ID selectors
- Navegaba a URL incorrecta `http://localhost:3000` en lugar de `/login`

**Solución:**
```javascript
// ❌ INCORRECTO
await page.goto('http://localhost:3000');
await page.fill('input[name="username"]', username);

// ✅ CORRECTO
await page.goto('http://localhost:3000/login');
await page.fill('#username', username);
await page.fill('#password', password);
await page.click('#log-in');
```

**Lección:** Siempre usar ID selectors (#) cuando están disponibles, son más rápidos y confiables que los selectores de atributo.

---

### Problema 2: Campo de zona en tab incorrecto

**Error Original:**
```
Error: page.click: Test timeout of 30000ms exceeded.
Call log: - waiting for locator('select[name="selectedZone"]')
```

**Causa:**
Intentaba seleccionar el campo de zona en el Tab 1 (General), pero el campo está en el Tab 2 (Configuración).

**Solución:**
```javascript
// ❌ INCORRECTO - Intentar seleccionar zona sin cambiar de tab
await page.fill('input[name="branchName"]', 'BANCA TEST');
await page.selectOption('select[name="selectedZone"]', { index: 1 }); // FALLA

// ✅ CORRECTO - Primero cambiar al tab de Configuración
await page.fill('input[name="branchName"]', 'BANCA TEST');
await page.click('text=Configuración'); // Cambiar al tab 2
await page.waitForSelector('select[name="selectedZone"]', { timeout: 5000 });
await page.selectOption('select[name="selectedZone"]', { index: 1 }); // FUNCIONA
```

**Lección:** Entender la estructura de tabs del componente. El campo `selectedZone` está renderizado condicionalmente solo cuando `activeTab === 'Configuración'`.

---

### Problema 3: Nombre del campo incorrecto

**Error:**
Test buscaba `select[name="zoneId"]` pero el campo real es `select[name="selectedZone"]`

**Solución:**
Verificar el código del componente (`CreateBanca.jsx` línea 948):
```javascript
<select
  name="selectedZone"
  value={formData.selectedZone || ''}
  onChange={handleInputChange}
  ...
>
```

**Lección:** Cuando un selector falla, examinar el componente React para verificar el nombre exacto del campo.

---

## Patrones Correctos a Seguir

### 1. Helper Function de Login

**Referencia:** `create-banca-test.spec.js` líneas 7-15

```javascript
async function login(page, username = 'admin', password = 'Admin123456') {
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#log-in');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000); // Extra wait for UI to settle
}
```

### 2. Navegación entre Tabs

```javascript
// Llenar campos del Tab 1
await page.fill('input[name="branchName"]', 'Nombre');
await page.fill('input[name="location"]', 'Ubicación');

// Cambiar al Tab 2
await page.click('text=Configuración');
await page.waitForTimeout(500); // Esperar animación

// Ahora llenar campos del Tab 2
await page.waitForSelector('select[name="selectedZone"]', { timeout: 5000 });
await page.selectOption('select[name="selectedZone"]', { index: 1 });
```

### 3. Verificación de Mensajes de Éxito/Error

```javascript
// Esperar resultado
await page.waitForTimeout(2000);

// Verificar mensajes
const successMessage = page.locator('text=/Banca creada exitosamente|success/i');
const errorMessage = page.locator('text=/error|failed/i');

// Esperar a que aparezca alguno
try {
  await Promise.race([
    successMessage.waitFor({ timeout: 5000 }),
    errorMessage.waitFor({ timeout: 5000 })
  ]);
} catch (e) {
  console.log('No se detectó mensaje de éxito o error');
}

// Validar resultado
const hasSuccess = await successMessage.isVisible();
const hasError = await errorMessage.isVisible();

expect(hasSuccess).toBeTruthy();
expect(hasError).toBeFalsy();
```

---

## Componentes Relacionados

### CreateBanca.jsx

**Ubicación:** `/home/jorge/projects/LottoWebApp/src/components/CreateBanca.jsx`

**Estructura de Tabs:**
- `activeTab === 'General'` - Líneas 918-938
  - Campos: branchName, branchCode, username, password, confirmPassword, location, reference, comment
- `activeTab === 'Configuración'` - Líneas 939-1200+
  - **Zona** (selectedZone) - Línea 948 ⚠️ Campo obligatorio
  - Tipo de caída (fallType)
  - Balances y límites
  - Configuración de impresión
  - Configuración de descuentos

**Estado del Formulario (formData):**
```javascript
{
  // Tab 1: General
  branchName: '',
  location: '',
  reference: '',

  // Tab 2: Configuración (24 campos)
  selectedZone: '',          // ⚠️ Obligatorio, en Tab 2
  fallType: '1',
  deactivationBalance: '',
  dailySaleLimit: '',
  todayBalanceLimit: '',
  creditLimit: '',
  // ... 18 campos más
}
```

---

## Credenciales de Prueba

```javascript
username: 'admin'
password: 'Admin123456'
```

**Nota:** No usar `Admin123` (sin los últimos 3 dígitos), la contraseña correcta es `Admin123456`.

---

## Tests de Referencia

### Tests que funcionan correctamente:

1. **create-banca-test.spec.js** - Test exitoso de creación de banca
   - Login pattern correcto (líneas 7-15)
   - Navegación entre tabs correcta (líneas 37-41)
   - Selección de zona en tab Configuración

2. **zones.spec.js** - Test de zonas (si existe)

---

## Comandos Útiles

### Ejecutar este test específico:
```bash
cd /home/jorge/projects/LottoWebApp
npx playwright test tests/create-banca-with-config.spec.js --headed
```

### Ejecutar con timeout extendido:
```bash
npx playwright test tests/create-banca-with-config.spec.js --headed --timeout=60000
```

### Ejecutar en modo debug:
```bash
npx playwright test tests/create-banca-with-config.spec.js --debug
```

---

## Resultado Esperado

```
✅ 1 passed (9-12s)

Salida del console.log:
Step 1: Logging in...
Step 2: Navigating to Create Banca form...
Llenando Tab 1: Datos Generales
Navegando a Tab 2: Configuración
Haciendo submit del formulario...
Verificando resultado...
¿Tiene mensaje de éxito? true
¿Tiene mensaje de error? false
✅ Prueba completada exitosamente!
```

---

## Resumen de Selectores Correctos

| Campo | Selector Correcto | Tab | Notas |
|-------|------------------|-----|-------|
| Username (login) | `#username` | Login | ID selector |
| Password (login) | `#password` | Login | ID selector |
| Login button | `#log-in` | Login | ID selector |
| Nombre banca | `input[name="branchName"]` | General | Obligatorio |
| Ubicación | `input[name="location"]` | General | Obligatorio |
| Referencia | `input[name="reference"]` | General | Obligatorio |
| **Zona** | `select[name="selectedZone"]` | **Configuración** | **⚠️ Obligatorio, Tab 2** |
| Tipo de caída | `select[name="fallType"]` | Configuración | - |
| Balance desactivación | `input[name="deactivationBalance"]` | Configuración | - |
| Límite venta diaria | `input[name="dailySaleLimit"]` | Configuración | - |
| Límite balance diario | `input[name="todayBalanceLimit"]` | Configuración | - |
| Límite crédito | `input[name="creditLimit"]` | Configuración | - |
| Minutos cancelar | `input[name="minutesToCancelTicket"]` | Configuración | Default: 30 |
| Proveedor descuento | `input[name="discountProvider"][value="2"]` | Configuración | Radio: RIFERO |
| Modo descuento | `input[name="discountMode"][value="2"]` | Configuración | Radio: EFECTIVO |
| Tipo impresora | `input[name="printerType"][value="2"]` | Configuración | Radio: GENERICO |
| Imprimir tickets | `input[name="printTickets"]` | Configuración | Checkbox |

---

## Troubleshooting

### Si el test falla con timeout en login:
1. Verificar que el servidor está corriendo en `http://localhost:3000`
2. Verificar credenciales: `admin` / `Admin123456` (no `Admin123`)
3. Verificar que usas ID selectors (`#username`, no `input[name="username"]`)

### Si el test falla al buscar zona:
1. Verificar que hiciste click en tab "Configuración" primero
2. Verificar que hay zonas en la base de datos
3. Usar `await page.waitForSelector('select[name="selectedZone"]')` antes de seleccionar

### Si el test falla al hacer submit:
1. Verificar que todos los campos obligatorios están llenos (branchName, location, reference, selectedZone)
2. Verificar que el botón submit es visible y clickeable
3. Tomar screenshot: `await page.screenshot({ path: 'debug.png', fullPage: true })`

---

## Última Actualización

**Fecha:** 29 de Octubre, 2025
**Estado:** ✅ Test funcionando correctamente
**Autor:** Claude Code
**Versión:** 1.0
