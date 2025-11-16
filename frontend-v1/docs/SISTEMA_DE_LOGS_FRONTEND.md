# 📝 Sistema de Logs - Frontend (React)

## ✅ Sistema Completo de Logging Implementado

---

## 🎯 **Características:**

### **1. Logs en Múltiples Lugares:**
- ✅ **Consola del Navegador** (F12 → Console)
- ✅ **LocalStorage** (persistente)
- ✅ **Debug Panel** (visual, en tiempo real)
- ✅ **Exportación a Archivo** (descarga .txt)

### **2. Niveles de Log:**
- 🔵 **INFO** - Información general
- 🟢 **SUCCESS** - Operaciones exitosas
- 🟠 **WARNING** - Advertencias
- 🔴 **ERROR** - Errores
- ⚪ **DEBUG** - Depuración detallada

### **3. Tracking Automático:**
- ✅ Todas las llamadas a la API (request/response/error)
- ✅ Errores no manejados (window.onerror)
- ✅ Promise rejections
- ✅ Inicio/cierre de aplicación
- ✅ Carga de componentes
- ✅ Validaciones de formularios

---

## 🚀 **Cómo Usar:**

### **1. Ver Logs en el Debug Panel:**
```
1. Click en botón 🐛 (esquina inferior derecha)
2. Panel se abre con logs en tiempo real
3. Usa filtros: ALL, ERROR, WARNING, SUCCESS, INFO, DEBUG
4. Click en "Export" para descargar
5. Click en "Clear" para limpiar
```

### **2. Ver Logs en Consola del Navegador:**
```
1. Presiona F12
2. Ve a pestaña "Console"
3. Los logs aparecen con colores:
   [INFO] en azul
   [SUCCESS] en verde
   [ERROR] en rojo
   etc.
```

### **3. Exportar Logs Manualmente:**

**Opción A: Desde Debug Panel**
```
Click en botón "Export"
```

**Opción B: Atajo de Teclado**
```
Ctrl + Shift + L  → Exporta logs
```

**Opción C: Desde Consola**
```javascript
// En consola del navegador (F12)
logger.exportLogs()
```

### **4. Limpiar Logs:**

**Opción A: Desde Debug Panel**
```
Click en botón "Clear"
```

**Opción B: Atajo de Teclado**
```
Ctrl + Shift + C  → Limpia todos los logs
```

**Opción C: Desde Consola**
```javascript
logger.clearLogs()
```

### **5. Ver Logs en Consola (Tabla):**

**Atajo de Teclado:**
```
Ctrl + Shift + D  → Muestra tabla con últimos 20 logs
```

---

## ⌨️ **Atajos de Teclado:**

```
Ctrl + Shift + L  →  Exportar logs
Ctrl + Shift + C  →  Limpiar logs
Ctrl + Shift + D  →  Mostrar logs en consola (tabla)
```

---

## 📊 **Ubicación de los Logs:**

### **1. En el Navegador:**
- **LocalStorage:** `app_debug_logs` (hasta 500 logs)
- **Consola:** En tiempo real
- **Debug Panel:** Visual flotante

### **2. Archivos Exportados:**
- **Manuales:** `app-logs-YYYY-MM-DD.txt`
- **Auto-export:** `auto-logs-YYYY-MM-DDTHH-MM-SS.txt`
- **Al salir:** `logs-on-exit-YYYY-MM-DD.txt` (si hay +100 logs o +5 errores)

### **3. Descarga:**
- Carpeta de Descargas del navegador
- Nombre: `app-logs-2025-10-13.txt`

---

## 🔧 **Configuración:**

### **Activar Auto-Export (Opcional):**

En `src/utils/loggerSetup.js`, descomentar:
```javascript
// Auto-export every 30 minutes
logger.startAutoExport(30)
```

### **Cambiar Intervalo:**
```javascript
logger.startAutoExport(60)  // Cada 60 minutos
logger.startAutoExport(15)  // Cada 15 minutos
```

### **Cambiar Máximo de Logs:**

En `src/utils/logger.js`:
```javascript
const MAX_LOGS = 500  // Cambiar número
```

---

## 📖 **Ejemplo de Archivo de Log:**

```
[INFO] 2025-10-13T17:30:00.123Z - APP
Application started
{
  "timestamp": "2025-10-13T17:30:00.123Z",
  "userAgent": "Mozilla/5.0...",
  "language": "es-ES",
  "screenSize": "1920x1080"
}
================================================================================

[INFO] 2025-10-13T17:30:01.456Z - API_CONFIG
API Base URL: http://localhost:5000/api
{
  "env": "http://localhost:5000/api",
  "fallback": "http://localhost:5000/api"
}
================================================================================

[INFO] 2025-10-13T17:30:02.789Z - CREATE_USER
Loading permissions from API...
================================================================================

[SUCCESS] 2025-10-13T17:30:03.012Z - CREATE_USER
Loaded 9 permission categories
{
  "categories": [
    {"name": "Acceso al sistema", "count": 3},
    {"name": "Transacciones", "count": 10},
    ...
  ]
}
================================================================================

[ERROR] 2025-10-13T17:30:05.345Z - API_ERROR
400 /users/with-permissions
{
  "status": 400,
  "statusText": "Bad Request",
  "errorData": {
    "message": "The FullName field is required."
  }
}
================================================================================
```

---

## 🐛 **Tracking Automático de Errores:**

El sistema ahora captura automáticamente:

### **1. Errores de JavaScript:**
```javascript
// Si hay un error no manejado:
[ERROR] WINDOW_ERROR
Unhandled error
{
  "message": "Cannot read property 'x' of undefined",
  "filename": "CreateUser.jsx",
  "lineno": 123,
  "colno": 45
}
```

### **2. Promise Rejections:**
```javascript
// Si una promesa se rechaza sin .catch():
[ERROR] PROMISE_ERROR
Unhandled promise rejection
{
  "reason": "Network request failed",
  "promise": "[object Promise]"
}
```

### **3. Errores de API:**
```javascript
// Todos los errores de fetch/API:
[ERROR] API_ERROR
400 /users
{
  "status": 400,
  "errorData": {...}
}
```

---

## 📱 **Acceso desde Consola del Navegador:**

Abre F12 → Console y escribe:

```javascript
// Ver todos los logs
logger.getLogs()

// Ver resumen
logger.getLogsSummary()

// Exportar
logger.exportLogs()

// Limpiar
logger.clearLogs()

// Ver en tabla
logger.saveLogsToConsole()
```

---

## ✅ **Qué Se Guarda Automáticamente:**

```
✅ Inicio de la aplicación
✅ Configuración de la API
✅ Todas las llamadas HTTP (request/response)
✅ Errores de la API
✅ Errores de red
✅ Carga de permisos, zonas, bancas
✅ Creación de usuarios
✅ Validaciones de formularios
✅ Navegación entre páginas
✅ Errores no manejados
✅ Promise rejections
✅ Cierre de la aplicación
```

---

## 💾 **Auto-Guardado al Salir:**

Si al cerrar la app hay:
- **Más de 100 logs** O
- **Más de 5 errores**

Se exporta automáticamente un archivo:
```
logs-on-exit-2025-10-13.txt
```

---

## 🔍 **Debug de Problemas:**

### **Si hay un error en la app:**

**Paso 1:** Click en 🐛 Debug Panel

**Paso 2:** Filtra por "ERROR" (botón rojo)

**Paso 3:** Lee el error más reciente

**Paso 4:** Si necesitas compartir:
- Click en "Export"
- Envía el archivo .txt

**O usa atajo:** `Ctrl + Shift + L`

---

## 📋 **Resumen de Funcionalidades:**

```
✅ Logs en consola (con colores)
✅ Logs en localStorage (persistentes)
✅ Debug Panel visual (tiempo real)
✅ Exportación manual (botón o atajo)
✅ Auto-export opcional (cada N minutos)
✅ Auto-save al salir (si hay errores)
✅ Tracking de errores automático
✅ Keyboard shortcuts
✅ Tabla de logs en consola
✅ Resumen de logs (estadísticas)
```

---

## 🎯 **Atajos Rápidos:**

| Acción | Atajo | Alternativa |
|--------|-------|-------------|
| Exportar logs | `Ctrl+Shift+L` | Debug Panel → Export |
| Limpiar logs | `Ctrl+Shift+C` | Debug Panel → Clear |
| Ver en consola | `Ctrl+Shift+D` | F12 → logger.saveLogsToConsole() |
| Abrir Debug Panel | Click 🐛 | - |

---

## 📝 **Ejemplo de Uso:**

```javascript
// En cualquier componente
import * as logger from '@/utils/logger'

// Log info
logger.info('MY_COMPONENT', 'Component mounted')

// Log con datos
logger.info('USER_ACTION', 'Button clicked', {
  buttonId: 'submit',
  userId: 123
})

// Log éxito
logger.success('FORM', 'Form submitted successfully', {
  formData: {...}
})

// Log error
logger.error('API', 'Failed to fetch data', {
  endpoint: '/users',
  error: error.message
})
```

---

## 🎉 **Características Únicas:**

✅ **No requiere servidor** - Todo en el navegador  
✅ **Persistente** - Se mantiene entre recargas  
✅ **Visual** - Debug Panel flotante  
✅ **Exportable** - Descarga archivos .txt  
✅ **Automático** - Captura errores sin código adicional  
✅ **Keyboard shortcuts** - Acceso rápido  
✅ **Performance** - Límite de 500 logs (no llena memoria)  

---

**Sistema de Logs:** ✅ **COMPLETAMENTE IMPLEMENTADO**  
**Ubicación:** Botón 🐛 en esquina inferior derecha  
**Shortcuts:** Ctrl+Shift+L/C/D  
**Estado:** ✅ **LISTO PARA USAR**

