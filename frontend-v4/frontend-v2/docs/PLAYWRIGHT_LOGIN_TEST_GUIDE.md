# Guía de Testing con Playwright - Frontend V2

## Documentación Completa para Tests Futuros

**Fecha de Creación:** 2025-11-14
**Frontend URL:** http://localhost:4000
**Backend API:** http://localhost:5000
**Estado:** ✅ Verificado y Funcionando

---

## 📋 Índice

1. [Credenciales de Acceso](#credenciales-de-acceso)
2. [Selectores Documentados](#selectores-documentados)
3. [Flujo de Login Exitoso](#flujo-de-login-exitoso)
4. [Estructura del Dashboard](#estructura-del-dashboard)
5. [Scripts de Prueba](#scripts-de-prueba)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Troubleshooting](#troubleshooting)

---

## 🔐 Credenciales de Acceso

### Usuario Admin (Verificado ✅)
```
Usuario: admin
Contraseña: Admin123456
```

**Comportamiento esperado:**
- ✅ Login exitoso
- ✅ Redirige a: `http://localhost:4000/dashboard`
- ✅ Muestra dashboard completo con sidebar y widgets

### Otras Credenciales de Prueba
```
Usuario: test@example.com
Contraseña: password123
```
*Nota: Estas credenciales pueden no funcionar en producción*

---

## 🎯 Selectores Documentados

### Página de Login

| Elemento | Selector | Tipo |
|----------|----------|------|
| Campo Usuario | `input[placeholder*="Usuario" i]` | Input Text |
| Campo Contraseña | `input[placeholder*="Contraseña" i]` | Input Password |
| Botón Login | `button:has-text("INICIAR SESIÓN")` | Button |

**Ejemplo de uso:**
```javascript
// Llenar formulario de login
await page.locator('input[placeholder*="Usuario" i]').fill('admin');
await page.locator('input[placeholder*="Contraseña" i]').fill('Admin123456');
await page.locator('button:has-text("INICIAR SESIÓN")').click();
```

### Dashboard (Post-Login)

#### Sidebar - Menú Principal

| Sección | Selector Sugerido | Visible |
|---------|-------------------|---------|
| INICIO | `text=INICIO` | ✅ |
| VENTAS | `text=VENTAS` | ✅ |
| TICKETS | `text=TICKETS` | ✅ |
| RESULTADOS | `text=RESULTADOS` | ✅ |
| BANCAS | `text=BANCAS` | ✅ |
| BALANCES | `text=BALANCES` | ✅ |
| USUARIOS | `text=USUARIOS` | ✅ |
| COBROS/PAGOS | `text=COBROS / PAGOS` | ✅ |
| TRANSACCIONES | `text=TRANSACCIONES` | ✅ |
| PRÉSTAMOS | `text=PRÉSTAMOS` | ✅ |
| EXCEDENTES | `text=EXCEDENTES` | ✅ |
| LÍMITES | `text=LÍMITES` | ✅ |
| COBRADORES | `text=COBRADORES` | ✅ |
| SORTEOS | `text=SORTEOS` | ✅ |
| MANEJO DE COBRADORES | `text=MANEJO DE COBRADORES` | ✅ |
| MI GRUPO | `text=MI GRUPO` | ✅ |
| AGENTES EXTERNOS | `text=AGENTES EXTERNOS` | ✅ |

#### Widgets del Dashboard

| Widget | Descripción |
|--------|-------------|
| Cobros & pagos | Formulario para crear cobros/pagos con código de banca, banco y monto |
| Jugadas por sorteo | Muestra jugadas del sorteo "DIARIA 11AM" |
| Publicación rápida de resultados | Permite publicar resultados de sorteos |
| Bloqueo rápido de números | Permite bloquear números por sorteo y tipo de jugada |

#### Botones Principales

```javascript
// Dashboard
await page.locator('button:has-text("Dashboard")').click();

// Dashboard Operativo
await page.locator('button:has-text("Dashboard Operativo")').click();
```

---

## 🔄 Flujo de Login Exitoso

### Secuencia Completa

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 1. Navegar a login
  await page.goto('http://localhost:4000');

  // 2. Esperar que cargue el formulario
  await page.waitForSelector('input[placeholder*="Usuario" i]');

  // 3. Ingresar credenciales
  await page.locator('input[placeholder*="Usuario" i]').fill('admin');
  await page.locator('input[placeholder*="Contraseña" i]').fill('Admin123456');

  // 4. Click en login
  await page.locator('button:has-text("INICIAR SESIÓN")').click();

  // 5. Esperar redirección
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // 6. Verificar que cargó el dashboard
  await page.waitForSelector('text=INICIO');

  console.log('✅ Login exitoso');

  await browser.close();
})();
```

### Requests de API Generados

Al hacer login, se ejecuta:
```
POST http://localhost:4000/api/auth/login
```

**Respuesta esperada:**
- Status: 200 OK
- Redirige a `/dashboard`

---

## 🏗️ Estructura del Dashboard

### Layout General

```
┌─────────────────────────────────────────────────────┐
│ Header (Iconos + Usuario: oliver + Hora + Idioma)  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │         CONTENT AREA                     │
│          │                                          │
│ • INICIO │  ┌────────────┬────────────┬──────────┐ │
│ • VENTAS │  │  Cobros &  │  Jugadas   │ Publica- │ │
│ • ...    │  │   pagos    │  sorteo    │  ción    │ │
│          │  └────────────┴────────────┴──────────┘ │
│          │                                          │
│          │  ┌─────────────────────────────────────┐│
│          │  │  Bloqueo rápido de números          ││
│          │  └─────────────────────────────────────┘│
│          │                                          │
│          │  Bancas vendiendo: Mar: 72, Mié: 79... │
│          │                                          │
│          │  [Dashboard] [Dashboard Operativo]      │
└──────────┴──────────────────────────────────────────┘
```

### Información Visible en Dashboard

- **Usuario actual:** oliver
- **Hora actual:** 05:37:34 PM
- **Idioma:** ES (Español)
- **Estadísticas de bancas:** Martes: 72, Miércoles: 79, Hoy: 14

---

## 📝 Scripts de Prueba

### Script 1: Login Básico

**Ubicación:** `/tmp/playwright-test-login-admin.js`

```javascript
// Ver archivo completo en /tmp/playwright-test-login-admin.js
// Este script ejecuta login y documenta toda la estructura
```

**Cómo ejecutar:**
```bash
cd /home/jorge/.claude/skills/playwright-skill
node run.js /tmp/playwright-test-login-admin.js
```

**Salida esperada:**
- ✅ 4 screenshots en `/tmp/`
- ✅ Análisis completo del dashboard
- ✅ Lista de elementos detectados

### Script 2: Navegación por el Menú

```javascript
// Plantilla para navegar por las secciones del menú
const sections = [
  'INICIO', 'VENTAS', 'TICKETS', 'RESULTADOS',
  'BANCAS', 'BALANCES', 'USUARIOS'
];

for (const section of sections) {
  await page.locator(`text=${section}`).click();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: `/tmp/${section.toLowerCase()}.png`
  });
  console.log(`✅ Screenshot de ${section}`);
}
```

### Script 3: Verificar Widgets del Dashboard

```javascript
// Verificar que todos los widgets estén presentes
const widgets = [
  'Cobros & pagos',
  'Jugadas por sorteo',
  'Publicación rápida de resultados',
  'Bloqueo rápido de números'
];

for (const widget of widgets) {
  const isVisible = await page.locator(`text=${widget}`).isVisible();
  console.log(`${widget}: ${isVisible ? '✅' : '❌'}`);
}
```

---

## ✨ Mejores Prácticas

### 1. Usar Selectores Flexibles

❌ **Evitar:**
```javascript
await page.locator('input:nth-child(1)').fill('admin');
```

✅ **Preferir:**
```javascript
await page.locator('input[placeholder*="Usuario" i]').fill('admin');
```

### 2. Siempre Esperar Elementos

```javascript
// Esperar antes de interactuar
await page.waitForSelector('button:has-text("INICIAR SESIÓN")');
await page.click('button:has-text("INICIAR SESIÓN")');
```

### 3. Capturar Screenshots en Pasos Clave

```javascript
// Después de cada acción importante
await page.screenshot({ path: '/tmp/01-login.png' });
await page.fill('input[placeholder*="Usuario" i]', 'admin');
await page.screenshot({ path: '/tmp/02-form-filled.png' });
```

### 4. Manejar Errores con Try-Catch

```javascript
try {
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✅ Login exitoso');
} catch (error) {
  await page.screenshot({ path: '/tmp/error.png' });
  console.error('❌ Error en login:', error.message);
  throw error;
}
```

### 5. Documentar API Calls

```javascript
// Monitorear requests de API
page.on('request', request => {
  if (request.url().includes('/api/')) {
    console.log(`📡 ${request.method()} ${request.url()}`);
  }
});
```

---

## 🔍 Troubleshooting

### Problema 1: Campo de Usuario No Encontrado

**Error:**
```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded
```

**Solución:**
```javascript
// Aumentar timeout y usar múltiples selectores
const usernameSelectors = [
  'input[placeholder*="Usuario" i]',
  'input[type="text"]:first-of-type',
  'input[name="username"]'
];

for (const selector of usernameSelectors) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.fill(selector, 'admin');
    break;
  } catch (e) {
    continue;
  }
}
```

### Problema 2: No Redirige a Dashboard

**Síntomas:** Se queda en página de login después de hacer click

**Verificar:**
1. Credenciales correctas (admin / Admin123456)
2. API está corriendo en puerto 5000
3. Frontend está corriendo en puerto 4000

```bash
# Verificar servicios
lsof -i :4000  # Frontend
lsof -i :5000  # Backend
```

### Problema 3: Elementos del Dashboard No Cargan

**Solución:**
```javascript
// Esperar a que la red esté inactiva
await page.waitForLoadState('networkidle');

// O esperar un elemento específico del dashboard
await page.waitForSelector('text=INICIO', { timeout: 15000 });
```

---

## 📊 Resultados del Test Documentado

### Fecha: 2025-11-14

**Test Ejecutado:** Login con usuario admin
**Resultado:** ✅ EXITOSO

**Métricas:**
- Tiempo de ejecución: ~15 segundos
- Screenshots capturados: 4
- API calls detectados: 1 (POST /api/auth/login)
- Elementos del menú detectados: 17
- Widgets detectados: 4
- Botones en dashboard: 24
- Campos de entrada: 8

**Screenshots Generados:**
1. `01-login-page.png` - Página de login inicial
2. `02-login-form-filled.png` - Formulario con credenciales
3. `03-post-login.png` - Inmediatamente después del login
4. `04-home-page-complete.png` - Dashboard completo cargado

---

## 🔗 Enlaces Útiles

- **Frontend Local:** http://localhost:4000
- **Backend API:** http://localhost:5000
- **Dashboard:** http://localhost:4000/dashboard
- **Playwright Docs:** https://playwright.dev/docs/intro

---

## 📅 Historial de Cambios

### 2025-11-14
- ✅ Documentación inicial creada
- ✅ Credenciales de admin verificadas
- ✅ Selectores documentados
- ✅ Estructura del dashboard mapeada
- ✅ Scripts de prueba creados

---

## 👨‍💻 Próximos Pasos Recomendados

1. **Crear test para cada sección del menú**
   - Navegar a VENTAS, TICKETS, RESULTADOS, etc.
   - Verificar elementos específicos de cada sección

2. **Test de formularios**
   - Cobros & pagos
   - Bloqueo de números
   - Publicación de resultados

3. **Test de flujos completos**
   - Crear una venta completa
   - Consultar resultados
   - Gestión de usuarios

4. **Test de responsive design**
   - Verificar en diferentes tamaños de pantalla
   - Mobile, tablet, desktop

5. **Test de integración API**
   - Verificar que los datos mostrados coinciden con la API
   - Test de manejo de errores

---

**Documentación creada por:** Claude Code
**Basado en:** Test real ejecutado con Playwright
**Última actualización:** 2025-11-14
