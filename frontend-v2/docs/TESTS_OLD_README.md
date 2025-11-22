# Tests de Playwright - Frontend V2

## 🎯 Tests Disponibles

### ✅ login-admin.spec.js
Test de login con usuario administrador.

**Credenciales:**
- Usuario: `admin`
- Contraseña: `Admin123456`

**Cómo ejecutar:**
```bash
cd /home/jorge/.claude/skills/playwright-skill
node run.js /home/jorge/projects/Lottery-Project/LottoWebApp/tests/login-admin.spec.js
```

**Resultado esperado:**
- Login exitoso
- Redirige a `/dashboard`
- Genera 4 screenshots en `/tmp/`

---

### ✅ bancas-lista-banca9.spec.js
Test de navegación a BANCAS → Lista y selección de Banca #9.

**Flujo:**
1. Login con admin
2. Click en menú BANCAS
3. Click en submenú "Lista"
4. Selección de Banca #9

**Cómo ejecutar:**
```bash
cd /home/jorge/.claude/skills/playwright-skill
node run.js /home/jorge/projects/Lottery-Project/LottoWebApp/tests/bancas-lista-banca9.spec.js
```

**Resultado esperado:**
- Navegación exitosa a lista de bancas
- URL: `http://localhost:4000/betting-pools/list`
- Banca #9 seleccionada correctamente
- Genera 5 screenshots en `/tmp/`
- 3 API calls ejecutados

**Documentación completa:** [docs/PLAYWRIGHT_BANCAS_TEST.md](../docs/PLAYWRIGHT_BANCAS_TEST.md)

---

## 📚 Documentación

Ver documentación completa en: **[docs/PLAYWRIGHT_LOGIN_TEST_GUIDE.md](../docs/PLAYWRIGHT_LOGIN_TEST_GUIDE.md)**

La guía incluye:
- ✅ Credenciales verificadas
- ✅ Selectores documentados
- ✅ Estructura del dashboard mapeada
- ✅ Scripts de ejemplo
- ✅ Mejores prácticas
- ✅ Troubleshooting

---

## 🚀 Requisitos Previos

1. **Frontend corriendo:**
   ```bash
   cd /home/jorge/projects/Lottery-Project/LottoWebApp
   npm run dev
   ```
   Debe estar en: http://localhost:4000

2. **Backend corriendo:**
   ```bash
   cd /home/jorge/projects/Lottery-Apis/src/LotteryApi
   dotnet run --urls "http://0.0.0.0:5000"
   ```
   Debe estar en: http://localhost:5000

3. **Playwright instalado:**
   ```bash
   cd /home/jorge/.claude/skills/playwright-skill
   npm run setup
   ```

---

## 📸 Screenshots Generados

Todos los screenshots se guardan en `/tmp/`:

| Archivo | Descripción |
|---------|-------------|
| `01-login-page.png` | Página de login inicial |
| `02-login-form-filled.png` | Formulario con credenciales |
| `03-post-login.png` | Inmediatamente después del login |
| `04-dashboard.png` | Dashboard completo |
| `error-screenshot.png` | Captura si hay error |

---

## 🔧 Cómo Crear Nuevos Tests

### Plantilla Base

```javascript
const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:4000';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Tu test aquí
    await page.goto(FRONTEND_URL);

    // ... acciones ...

    console.log('✅ Test completado');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/error.png' });
    throw error;

  } finally {
    await browser.close();
  }
})();
```

### Selectores Útiles

Consulta la [documentación completa](../docs/PLAYWRIGHT_LOGIN_TEST_GUIDE.md#selectores-documentados) para ver todos los selectores.

**Los más comunes:**
```javascript
// Login
'input[placeholder*="Usuario" i]'
'input[placeholder*="Contraseña" i]'
'button:has-text("INICIAR SESIÓN")'

// Menú
'text=INICIO'
'text=VENTAS'
'text=TICKETS'
// ... etc
```

---

## 🐛 Troubleshooting

### El test no encuentra el campo de usuario

**Solución:** Verificar que el frontend esté corriendo en puerto 4000
```bash
lsof -i :4000
```

### El login falla

**Verificar:**
1. Backend corriendo: `lsof -i :5000`
2. Credenciales correctas: `admin` / `Admin123456`
3. Ver screenshot de error en `/tmp/error-screenshot.png`

### Timeout esperando elementos

**Solución:** Aumentar el timeout
```javascript
await page.waitForSelector('elemento', { timeout: 15000 });
```

---

## 📝 Notas

- Todos los tests usan navegador visible (`headless: false`) para facilitar debugging
- Los screenshots se guardan en `/tmp/` y se limpian automáticamente por el sistema
- Los tests deben ejecutarse desde la carpeta del skill de Playwright
- Ver logs completos en la consola durante la ejecución

---

**Última actualización:** 2025-11-14
**Tests verificados:** ✅ Funcionando
