# 📝 Sistema de Logs Centralizado - Frontend → API

## ✅ IMPLEMENTADO EN FRONTEND

**Fecha:** 14 de Octubre, 2025  
**Estado:** Frontend listo, esperando endpoint en API

---

## 🎯 ¿Cómo Funciona?

### **Frontend (React):**
```
Usuario usa la app
    ↓
Ocurre un ERROR o WARNING
    ↓
Logger captura el evento
    ↓
Guarda en localStorage (local)
    ↓
Envía a API automáticamente ✅
    ↓
API guarda en archivo .log
```

---

## 📊 Flujo Completo:

```
1. ERROR ocurre en el navegador
   → logger.error('CATEGORY', 'Message', data)

2. Se guarda en localStorage (siempre)
   → Para Debug Panel y export manual

3. Se muestra en consola (siempre)
   → Para desarrollo

4. Se envía a la API (solo ERROR y WARNING)
   → POST /api/logs/frontend
   → Guarda en: Logs/Frontend/frontend-2025-10-14.log

5. YO puedo leer el archivo
   → Directamente desde el servidor
```

---

## ⚙️ Configuración:

### **En `src/utils/logger.js`:**

```javascript
const SEND_TO_API = true  // ← Cambiar a false para deshabilitar envío
```

**Cuando está habilitado:**
- ✅ Envía ERRORES automáticamente a la API
- ✅ Envía WARNINGS automáticamente a la API
- ⚪ NO envía INFO, SUCCESS, DEBUG (solo local)

---

## 📁 Archivos Creados:

### **Frontend:**
```
src/services/logService.js       ← Servicio para enviar logs a API
src/utils/logger.js (actualizado) ← Envío automático habilitado
src/services/index.js (actualizado) ← Export de logService

PROMPT_ENDPOINT_LOGS_API.md      ← Instrucciones para la API
SISTEMA_LOGS_CENTRALIZADO.md     ← Este archivo
```

---

## 🚀 Para Activar (Necesitas):

### **1. Implementar Endpoint en la API**

Dale este prompt al agente de la API:

```
Lee el archivo PROMPT_ENDPOINT_LOGS_API.md del proyecto frontend 
y crea el endpoint POST /api/logs/frontend según las instrucciones.

Debe guardar logs en:
H:\GIT\lottery-api\LotteryAPI\Logs\Frontend\frontend-{date}.log
```

### **2. Verificar que Funciona**

Después de que la API tenga el endpoint:

```bash
# Test manual
POST http://localhost:5000/api/logs/frontend
{
  "level": "ERROR",
  "category": "TEST",
  "message": "Test log",
  "timestamp": "2025-10-14T17:30:00Z"
}

# Verificar archivo creado
dir H:\GIT\lottery-api\LotteryAPI\Logs\Frontend\
```

### **3. Frontend Ya Está Listo**

Una vez el endpoint exista, el frontend:
- ✅ Enviará automáticamente todos los ERRORES
- ✅ Enviará automáticamente todos los WARNINGS
- ✅ Los guardará en el servidor
- ✅ YO podré leerlos directamente

---

## 📊 Ejemplo de Uso Real:

### **Escenario: Usuario tiene error al crear usuario**

```javascript
// 1. Error ocurre en el navegador
logger.error('CREATE_USER', 'Failed to create user', {
  username: 'jorge',
  error: 'Network error'
})

// 2. Se guarda localmente (localStorage)

// 3. Se muestra en consola

// 4. Se envía a la API automáticamente
POST /api/logs/frontend
{
  "level": "ERROR",
  "category": "CREATE_USER",
  "message": "Failed to create user",
  "timestamp": "2025-10-14T17:30:05.123Z",
  "data": "{\"username\":\"jorge\",\"error\":\"Network error\"}"
}

// 5. API guarda en:
H:\GIT\lottery-api\LotteryAPI\Logs\Frontend\frontend-2025-10-14.log
H:\GIT\lottery-api\LotteryAPI\Logs\Frontend\errors-2025-10-14.log

// 6. YO leo el archivo:
Get-Content H:\GIT\lottery-api\LotteryAPI\Logs\Frontend\errors-2025-10-14.log
```

---

## 🔧 Configuración Avanzada:

### **Cambiar qué niveles se envían a la API:**

En `src/utils/logger.js` línea 96:

```javascript
// ACTUAL: Solo ERROR y WARNING
if (SEND_TO_API && (level === LogLevel.ERROR || level === LogLevel.WARNING))

// OPCIÓN 1: Solo errores
if (SEND_TO_API && level === LogLevel.ERROR)

// OPCIÓN 2: Todo
if (SEND_TO_API)

// OPCIÓN 3: Errores y SUCCESS
if (SEND_TO_API && (level === LogLevel.ERROR || level === LogLevel.SUCCESS))
```

---

## ✅ Estado Actual:

```
Frontend:     ✅ Listo para enviar logs
API:          ⏸️ Pendiente (crear endpoint)
Logs locales: ✅ Funcionando (Debug Panel)
Auto-envío:   ✅ Configurado (espera endpoint)
```

---

## 📝 Próximos Pasos:

1. ✅ Frontend configurado (hecho)
2. ⏸️ Implementar endpoint en API
3. ✅ Probar que funcione
4. ✅ Verificar archivos de log
5. ✅ YO puedo leer logs directamente

---

**El frontend ya está listo. Solo falta que el agente de la API cree el endpoint receptor.** 🎯




