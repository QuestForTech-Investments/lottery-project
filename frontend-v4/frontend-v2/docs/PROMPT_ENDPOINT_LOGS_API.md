# 📝 Prompt para Crear Endpoint de Logs en la API

## 🎯 Objetivo:

Crear un endpoint en la API que reciba logs del frontend y los guarde en archivos de texto en el servidor.

---

## 📡 Endpoints a Crear:

### **1. POST /api/logs/frontend**
Recibe un solo log entry del frontend.

**Request Body:**
```json
{
  "level": "ERROR",
  "category": "CREATE_USER",
  "message": "Failed to create user",
  "timestamp": "2025-10-14T17:30:00.123Z",
  "data": "{\"error\": \"Network error\", \"endpoint\": \"/users\"}"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Log saved successfully"
}
```

---

### **2. POST /api/logs/frontend/batch**
Recibe múltiples logs en una sola llamada.

**Request Body:**
```json
{
  "logs": [
    {
      "level": "INFO",
      "category": "APP",
      "message": "Application started",
      "timestamp": "2025-10-14T17:30:00.000Z",
      "data": null
    },
    {
      "level": "ERROR",
      "category": "API_ERROR",
      "message": "Request failed",
      "timestamp": "2025-10-14T17:30:05.000Z",
      "data": "{\"status\": 500}"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "5 logs saved successfully",
  "count": 5
}
```

---

## 📁 Ubicación de los Archivos de Log:

### **Estructura de Carpetas:**
```
H:\GIT\lottery-api\LotteryAPI\
  └── Logs\
      └── Frontend\
          ├── frontend-2025-10-14.log
          ├── frontend-2025-10-13.log
          ├── errors-2025-10-14.log  (solo errores)
          └── ...
```

---

## 🔧 Implementación Sugerida:

### **1. Crear Controlador: `FrontendLogsController.cs`**

```csharp
using Microsoft.AspNetCore.Mvc;

namespace LotteryAPI.Controllers
{
    [ApiController]
    [Route("api/logs")]
    public class FrontendLogsController : ControllerBase
    {
        private readonly ILogger<FrontendLogsController> _logger;
        private readonly string _logDirectory;

        public FrontendLogsController(ILogger<FrontendLogsController> logger)
        {
            _logger = logger;
            // Create logs directory if it doesn't exist
            _logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs", "Frontend");
            Directory.CreateDirectory(_logDirectory);
        }

        [HttpPost("frontend")]
        public IActionResult LogFrontendEntry([FromBody] FrontendLogEntry logEntry)
        {
            try
            {
                SaveLogToFile(logEntry);
                return Ok(new { success = true, message = "Log saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving frontend log");
                return StatusCode(500, new { success = false, message = "Failed to save log" });
            }
        }

        [HttpPost("frontend/batch")]
        public IActionResult LogFrontendBatch([FromBody] FrontendLogBatchRequest request)
        {
            try
            {
                foreach (var logEntry in request.Logs)
                {
                    SaveLogToFile(logEntry);
                }
                
                return Ok(new 
                { 
                    success = true, 
                    message = $"{request.Logs.Count} logs saved successfully",
                    count = request.Logs.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving frontend logs batch");
                return StatusCode(500, new { success = false, message = "Failed to save logs" });
            }
        }

        private void SaveLogToFile(FrontendLogEntry logEntry)
        {
            var date = DateTime.Parse(logEntry.Timestamp).ToString("yyyy-MM-dd");
            var logFileName = $"frontend-{date}.log";
            var logFilePath = Path.Combine(_logDirectory, logFileName);

            var logLine = $"[{logEntry.Level}] {logEntry.Timestamp} - {logEntry.Category}\n" +
                         $"{logEntry.Message}\n" +
                         $"{logEntry.Data ?? ""}\n" +
                         new string('=', 80) + "\n";

            // Append to file
            System.IO.File.AppendAllText(logFilePath, logLine);

            // If it's an error, also save to separate error log
            if (logEntry.Level == "ERROR")
            {
                var errorFileName = $"errors-{date}.log";
                var errorFilePath = Path.Combine(_logDirectory, errorFileName);
                System.IO.File.AppendAllText(errorFilePath, logLine);
            }
        }
    }

    // DTO Classes
    public class FrontendLogEntry
    {
        public string Level { get; set; }
        public string Category { get; set; }
        public string Message { get; set; }
        public string Timestamp { get; set; }
        public string? Data { get; set; }
    }

    public class FrontendLogBatchRequest
    {
        public List<FrontendLogEntry> Logs { get; set; }
    }
}
```

---

## ✅ Características del Endpoint:

1. ✅ **Guarda logs en archivos** separados por fecha
2. ✅ **Errores separados** en archivo errors-YYYY-MM-DD.log
3. ✅ **Sin autenticación** (para no bloquear logs críticos)
4. ✅ **Manejo de errores** robusto
5. ✅ **Batch support** para enviar múltiples logs
6. ✅ **Formato legible** (igual que export del frontend)

---

## 📊 Formato del Archivo de Log:

```
[ERROR] 2025-10-14T17:30:05.123Z - API_ERROR
Request failed
{"status": 500, "endpoint": "/users"}
================================================================================

[WARNING] 2025-10-14T17:30:10.456Z - CREATE_USER
Form validation failed
{"field": "username", "error": "Too short"}
================================================================================

[INFO] 2025-10-14T17:30:15.789Z - USER_LIST
Loading users from API
null
================================================================================
```

---

## 🚀 Pruebas Después de Implementar:

### **Test 1: Log Individual**
```bash
POST http://localhost:5000/api/logs/frontend
{
  "level": "ERROR",
  "category": "TEST",
  "message": "Test error log",
  "timestamp": "2025-10-14T17:30:00Z",
  "data": "{\"test\": true}"
}

# Verifica que se creó el archivo:
H:\GIT\lottery-api\LotteryAPI\Logs\Frontend\frontend-2025-10-14.log
H:\GIT\lottery-api\LotteryAPI\Logs\Frontend\errors-2025-10-14.log
```

### **Test 2: Batch**
```bash
POST http://localhost:5000/api/logs/frontend/batch
{
  "logs": [
    {"level": "INFO", "category": "TEST", "message": "Log 1", "timestamp": "2025-10-14T17:30:00Z"},
    {"level": "ERROR", "category": "TEST", "message": "Log 2", "timestamp": "2025-10-14T17:30:01Z"}
  ]
}
```

---

## 📝 Resumen para el Agente:

```
Crea un controlador FrontendLogsController.cs que:
1. Reciba logs del frontend vía POST
2. Los guarde en archivos de texto en Logs/Frontend/
3. Un archivo por día: frontend-YYYY-MM-DD.log
4. Errores también en: errors-YYYY-MM-DD.log
5. Formato legible (nivel, timestamp, categoría, mensaje, datos)
6. Soporte para logs individuales y batch

Usa el código de arriba como referencia.
```

---

## ✅ Beneficios:

- ✅ Logs centralizados en el servidor
- ✅ Puedo leer archivos directamente  
- ✅ Errores en archivo separado
- ✅ Un archivo por día (fácil de encontrar)
- ✅ Formato consistente con export del frontend
- ✅ No bloquea si falla (fire and forget)

---

**¿Procedo a configurar el frontend para que envíe los logs automáticamente?** 🎯




