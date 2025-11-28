# 🐛 Sistema de Logs y Depuración

## ✅ Sistema Implementado y Listo

---

## 🎯 ¿Qué incluye?

### **1. Logger Service** (`src/utils/logger.js`)
- Logs en consola con colores
- Persistencia en localStorage
- 5 niveles de log: INFO, SUCCESS, WARNING, ERROR, DEBUG
- Exportación de logs a archivo .txt
- Límite de 500 logs (los más antiguos se eliminan automáticamente)

### **2. Debug Panel** (`src/components/common/DebugPanel.jsx`)
- Panel flotante en la esquina inferior derecha
- Vista en tiempo real de todos los logs
- Filtros por nivel (ALL, ERROR, WARNING, etc.)
- Botón para limpiar logs
- Botón para exportar logs
- Se actualiza automáticamente cada segundo

### **3. Logs Automáticos en:**
- ✅ Todas las llamadas a la API (request/response/error)
- ✅ Configuración de la API (URL base, entorno)
- ✅ Carga de permisos en el formulario
- ✅ Creación de usuarios
- ✅ Errores de red y CORS
- ✅ Validaciones del formulario

---

## 🚀 Cómo Usar el Debug Panel

### **Paso 1: Abre la Aplicación**
```
http://localhost:3002
```

### **Paso 2: Verás un Botón Flotante**
En la esquina inferior derecha verás un botón:
```
🐛 Debug
```

### **Paso 3: Click en el Botón**
Se abrirá un panel con:
- Header con número total de logs
- Filtros por nivel
- Botones Clear y Export
- Lista de logs en tiempo real

### **Paso 4: Navega al Formulario**
```
http://localhost:3002/usuarios/crear
```

### **Paso 5: Observa los Logs**
Verás logs como:
```
[INFO] 12:05:30 - API_CONFIG
API Base URL: https://localhost:7001/api

[INFO] 12:05:31 - CREATE_USER
Loading permissions from API...

[INFO] 12:05:31 - API_REQUEST
GET /permissions/categories

[ERROR] 12:05:32 - NETWORK_ERROR
Cannot connect to https://localhost:7001/api/permissions/categories
```

---

## 📊 Niveles de Log

### **🔵 INFO** - Información general
```javascript
logger.info('CATEGORY', 'Message', { data })
```
**Ejemplo:**
- API configuration loaded
- Form submitted
- Component mounted

### **🟢 SUCCESS** - Operaciones exitosas
```javascript
logger.success('CATEGORY', 'Message', { data })
```
**Ejemplo:**
- API request successful
- User created
- Permissions loaded

### **🟠 WARNING** - Advertencias
```javascript
logger.warning('CATEGORY', 'Message', { data })
```
**Ejemplo:**
- Form validation failed
- API response with success=false
- Missing optional data

### **🔴 ERROR** - Errores
```javascript
logger.error('CATEGORY', 'Message', { data })
```
**Ejemplo:**
- API request failed
- Network error
- Exception thrown

### **⚪ DEBUG** - Depuración detallada
```javascript
logger.debug('CATEGORY', 'Message', { data })
```
**Ejemplo:**
- API response structure
- State changes
- Detailed data

---

## 🔍 Qué Buscar en los Logs

### **Problema: No cargan los permisos**

**Logs a buscar:**
```
1. [INFO] API_CONFIG
   → Verifica que la URL sea: https://localhost:7001/api

2. [INFO] CREATE_USER
   → "Loading permissions from API..."

3. [INFO] API_REQUEST
   → GET /permissions/categories

4. [ERROR] NETWORK_ERROR o API_ERROR
   → Si aparece, ahí está el problema
```

**Posibles errores:**

#### **Error 1: NETWORK_ERROR**
```
[ERROR] NETWORK_ERROR
Cannot connect to https://localhost:7001/api/permissions/categories
```
**Significa:** La API no está corriendo o la URL es incorrecta

**Solución:**
- Iniciar la API en https://localhost:7001
- Verificar .env tiene la URL correcta
- Reiniciar el servidor frontend

---

#### **Error 2: CORS Error**
```
[ERROR] API_ERROR
Failed to fetch
```
**Significa:** Problema de CORS en el backend

**Solución:**
Configurar CORS en la API .NET

---

#### **Error 3: 404 Not Found**
```
[ERROR] API_ERROR
404 /permissions/categories
```
**Significa:** El endpoint no existe en la API

**Solución:**
- Verificar que el endpoint esté implementado
- Verificar la ruta sea correcta

---

#### **Error 4: SSL Certificate**
```
[ERROR] NETWORK_ERROR
net::ERR_CERT_AUTHORITY_INVALID
```
**Significa:** Certificado SSL no aceptado

**Solución:**
1. Abrir https://localhost:7001 en el navegador
2. Aceptar el certificado
3. Volver a la aplicación

---

## 📥 Exportar Logs

### **Desde el Debug Panel:**
1. Click en botón "Export"
2. Se descarga archivo: `app-logs-YYYY-MM-DD.txt`

### **Desde la Consola:**
```javascript
import { exportLogs } from '@/utils/logger'
exportLogs()
```

### **Formato del Archivo:**
```
[INFO] 2025-10-13T12:05:30.123Z - API_CONFIG
API Base URL: https://localhost:7001/api
{
  "env": "https://localhost:7001/api",
  "fallback": "http://localhost:5000/api"
}
================================================================================

[ERROR] 2025-10-13T12:05:32.456Z - NETWORK_ERROR
Cannot connect to https://localhost:7001/api/permissions/categories
{
  "endpoint": "/permissions/categories",
  "baseUrl": "https://localhost:7001/api",
  "error": "Failed to fetch"
}
================================================================================
```

---

## 🧹 Limpiar Logs

### **Desde el Debug Panel:**
Click en botón "Clear"

### **Desde la Consola:**
```javascript
import { clearLogs } from '@/utils/logger'
clearLogs()
```

---

## 🛠️ Agregar Logs Personalizados

### **En cualquier componente:**
```javascript
import * as logger from '@/utils/logger'

// Info log
logger.info('MY_COMPONENT', 'Component mounted')

// Con datos
logger.info('MY_COMPONENT', 'User clicked button', {
  buttonId: 'submit',
  timestamp: Date.now()
})

// Success
logger.success('MY_COMPONENT', 'Operation completed')

// Warning
logger.warning('MY_COMPONENT', 'Missing optional field')

// Error
logger.error('MY_COMPONENT', 'Failed to load data', {
  error: error.message
})

// Debug
logger.debug('MY_COMPONENT', 'Current state', {
  state: myState
})
```

---

## 📊 Categorías de Logs Actuales

```
API_CONFIG      → Configuración de la API
API_REQUEST     → Requests a la API
API_SUCCESS     → Responses exitosas
API_ERROR       → Errores de API
NETWORK_ERROR   → Errores de red
CREATE_USER     → Formulario de crear usuario
LOGGER          → Operaciones del logger
```

---

## 🎨 Vista del Debug Panel

```
┌─────────────────────────────────────────────┐
│ 🐛 Debug Panel             (150 logs)   ✕  │
├─────────────────────────────────────────────┤
│ [ALL] [ERROR(5)] [WARNING(2)] [SUCCESS(10)]│
│ [INFO(100)] [DEBUG(33)]  [Clear] [Export]  │
├─────────────────────────────────────────────┤
│                                              │
│ [ERROR] 12:05:32  NETWORK_ERROR             │
│ Cannot connect to API                        │
│ {                                            │
│   "endpoint": "/permissions/categories"      │
│ }                                            │
│ ─────────────────────────────────────────── │
│                                              │
│ [INFO] 12:05:31  API_REQUEST                │
│ GET /permissions/categories                  │
│ ─────────────────────────────────────────── │
│                                              │
│ [INFO] 12:05:30  CREATE_USER                │
│ Loading permissions from API...              │
│ ─────────────────────────────────────────── │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🔧 Configuración Avanzada

### **Cambiar máximo de logs:**
En `src/utils/logger.js`:
```javascript
const MAX_LOGS = 500  // Cambia este número
```

### **Deshabilitar logs en producción:**
```javascript
// Envolver los logs en una condición
if (import.meta.env.DEV) {
  logger.info('CATEGORY', 'Message')
}
```

### **Cambiar intervalo de actualización del panel:**
En `src/components/common/DebugPanel.jsx`:
```javascript
const interval = setInterval(loadLogs, 1000)  // Cambia 1000ms
```

---

## ✅ Checklist de Depuración

Cuando haya un problema, verifica en este orden:

- [ ] 1. Abrir Debug Panel (botón 🐛)
- [ ] 2. Verificar log `API_CONFIG` - ¿URL correcta?
- [ ] 3. Navegar a la página con problema
- [ ] 4. Buscar logs `ERROR` en rojo
- [ ] 5. Leer el mensaje de error
- [ ] 6. Ver los datos adjuntos (JSON)
- [ ] 7. Exportar logs si es necesario
- [ ] 8. Aplicar solución según el error
- [ ] 9. Limpiar logs y probar de nuevo

---

## 🎯 Para Tu Problema Específico (Permisos)

Cuando abras el formulario, deberías ver esta secuencia:

```
1. [INFO] API_CONFIG
   API Base URL: https://localhost:7001/api

2. [INFO] CREATE_USER
   Loading permissions from API...

3. [INFO] API_REQUEST
   GET /permissions/categories

4a. SI TODO BIEN:
    [SUCCESS] API_SUCCESS
    GET /permissions/categories
    
    [SUCCESS] CREATE_USER
    Loaded 9 permission categories

4b. SI HAY ERROR:
    [ERROR] NETWORK_ERROR o API_ERROR
    [Con detalles del error]
```

**Si ves el error en el paso 4b, el Debug Panel te dirá exactamente qué falló.**

---

## 📱 Acceso Rápido

### **Ver logs en consola:**
```javascript
F12 → Console
```

### **Ver logs en el panel:**
```javascript
Click en 🐛 Debug
```

### **Exportar logs:**
```javascript
Debug Panel → Export
```

### **Limpiar logs:**
```javascript
Debug Panel → Clear
```

---

## 🎉 Beneficios

✅ **Ver en tiempo real** qué está pasando  
✅ **No más "adivinar"** dónde está el error  
✅ **Historial completo** de operaciones  
✅ **Exportar** para compartir con el equipo  
✅ **Filtrar** por nivel de log  
✅ **Persistente** en localStorage  
✅ **Colores** para identificar rápido  

---

**Sistema de Logs:** ✅ IMPLEMENTADO  
**Estado:** ✅ LISTO PARA USAR  
**Ubicación:** Botón flotante 🐛 en esquina inferior derecha

**¡Abre la aplicación y pruébalo ahora!** 🚀

