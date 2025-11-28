# 🏗️ Arquitectura: Sistema de Webhook para Notificaciones en Tiempo Real

**Versión**: 1.0.0
**Fecha**: 2025-10-31
**Estado**: En Diseño

---

## 🎯 Objetivo

Crear un sistema automático que notifique al usuario vía Telegram sobre el progreso de Claude Code en tiempo real, sin necesidad de intervención manual.

---

## 📊 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code Process                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  updateProgress("Leyendo archivo X", { progress: 25 }) │ │
│  └──────────────────┬──────────────────────────────────────┘  │
│                     │ Writes to                              │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ~/.claude-telegram/status.json                       │  │
│  │  {                                                     │  │
│  │    task: "Investigando API",                          │  │
│  │    progress: 25,                                      │  │
│  │    activities: ["Leyó 3 archivos", "Probó 2 APIs"]  │  │
│  │  }                                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          telegram-progress-tracker.js (Background)           │
│                                                              │
│  Every 2 minutes:                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Read status.json                                   │  │
│  │ 2. Check if changed since last read                  │  │
│  │ 3. If changed → Send update to Telegram              │  │
│  │ 4. Mark as last_notified                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                     │ Sends via                              │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Telegram Bot API                              │  │
│  │  POST https://api.telegram.org/bot{token}/sendMessage │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    User's Telegram App                       │
│                                                              │
│  Receives:                                                   │
│  🔄 Progreso: 25%                                            │
│  📋 Tarea: Investigando API                                 │
│                                                              │
│  Últimas actividades:                                        │
│  - Leyó 3 archivos                                          │
│  - Probó 2 APIs                                             │
│                                                              │
│  ⏱️ Última actualización: hace 30 seg                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```
~/.claude-telegram/
├── status.json              # Estado actual del progreso
├── tracking_state.json      # Estado del tracker (última notificación)
├── activity_log.json        # Log histórico de actividades
└── config.json              # Configuración (intervalos, etc.)

.claude/
├── telegram-progress-tracker.js    # Script principal del tracker
├── telegram-update-progress.js     # Helper para Claude Code
└── telegram-webhook-architecture.md # Este documento
```

---

## 🗂️ Formato de Archivos

### status.json
```json
{
  "task": "Investigando API multi-tabla",
  "progress": 45,
  "status": "in_progress",
  "started_at": "2025-10-31T22:00:00.000Z",
  "updated_at": "2025-10-31T22:05:30.000Z",
  "activities": [
    {
      "timestamp": "2025-10-31T22:00:00.000Z",
      "action": "Leyó archivo src/components/EditBettingPoolMUI/index.jsx",
      "type": "read"
    },
    {
      "timestamp": "2025-10-31T22:02:15.000Z",
      "action": "Probó endpoint GET /api/betting-pools/9/config",
      "type": "api_test"
    },
    {
      "timestamp": "2025-10-31T22:05:30.000Z",
      "action": "Creó documento HALLAZGOS_API.md",
      "type": "write"
    }
  ],
  "metadata": {
    "files_read": 10,
    "files_written": 2,
    "api_calls": 3,
    "questions_asked": 1
  }
}
```

### tracking_state.json
```json
{
  "last_notified_at": "2025-10-31T22:04:00.000Z",
  "last_status_hash": "a1b2c3d4e5f6",
  "notification_count": 5,
  "tracker_started_at": "2025-10-31T22:00:00.000Z",
  "tracker_pid": 12345
}
```

### config.json
```json
{
  "update_interval_ms": 120000,
  "min_progress_change": 5,
  "max_notifications_per_hour": 15,
  "notification_types": {
    "progress_update": true,
    "task_start": true,
    "task_complete": true,
    "error": true,
    "question": true
  },
  "telegram": {
    "chat_id": "417821897",
    "bot_token": "${TELEGRAM_BOT_TOKEN}",
    "parse_mode": "Markdown"
  }
}
```

---

## 🔧 Componentes

### 1. telegram-progress-tracker.js

**Responsabilidad**: Monitorear status.json y enviar updates a Telegram

**Características**:
- Corre en background como daemon
- Revisa status.json cada 2 minutos
- Compara hash del estado actual vs último notificado
- Si cambió significativamente → notifica
- Limita notificaciones para evitar spam

**Lógica de notificación**:
```javascript
// Notificar SI:
- Progress cambió >= 5%
- Pasaron >= 2 minutos desde última notificación
- Se agregaron nuevas actividades (>= 2)
- Task status cambió (pending → in_progress → completed)
- Hay un error

// NO notificar SI:
- Cambios menores (<5% progress)
- Última notificación hace <2 min
- Se alcanzó límite de notificaciones/hora (15)
```

### 2. telegram-update-progress.js

**Responsabilidad**: Helper para que Claude Code actualice el progreso fácilmente

**API Pública**:
```javascript
const { updateProgress } = require('./.claude/telegram-update-progress.js');

// Uso simple
await updateProgress("Leyendo archivos", { progress: 25 });

// Uso con actividad
await updateProgress("Probando API", {
  progress: 50,
  activity: {
    action: "Probó endpoint /api/betting-pools/9/config",
    type: "api_test"
  }
});

// Marcar como completado
await updateProgress("Investigación completada", {
  progress: 100,
  status: "completed"
});
```

**Implementación**:
- Lee status.json actual
- Fusiona con nuevo estado
- Escribe de vuelta
- Calcula progress automáticamente si no se provee
- Agrega timestamp automáticamente

### 3. Integración con Hooks

**Hook Stop** (Claude termina):
```bash
# .claude/settings.local.json
{
  "hooks": {
    "Stop": [
      {
        "type": "command",
        "command": "node .claude/telegram-update-progress.js complete"
      },
      {
        "type": "command",
        "command": "curl telegram notification"
      }
    ]
  }
}
```

---

## 🚀 Flujo de Trabajo Completo

### Inicio de Tarea

```javascript
// Claude Code:
await updateProgress("Iniciando investigación de API", {
  task: "Investigar endpoints de API",
  progress: 0,
  status: "in_progress"
});
```

↓ Escribe a status.json

↓ Tracker detecta cambio (new task)

↓ Envía notificación inmediata:

```
🚀 Tarea iniciada

📋 Investigar endpoints de API
⏱️ Iniciado: 22:00:00
```

### Durante el Trabajo

```javascript
// Claude Code lee archivos
await updateProgress("Leyendo archivos de configuración", {
  progress: 20,
  activity: {
    action: "Leyó src/components/EditBettingPoolMUI/index.jsx",
    type: "read"
  }
});

// Claude Code prueba API
await updateProgress("Probando endpoints", {
  progress: 40,
  activity: {
    action: "Probó GET /api/betting-pools/9/config",
    type: "api_test"
  }
});

// Claude Code crea documento
await updateProgress("Documentando hallazgos", {
  progress: 70,
  activity: {
    action: "Creó HALLAZGOS_API.md",
    type: "write"
  }
});
```

↓ Tracker revisa cada 2 min

↓ Si progress >= +5% O >= 2 actividades nuevas:

```
🔄 Progreso: 70%
📋 Investigar endpoints de API

Últimas actividades:
- Leyó configuración
- Probó 3 endpoints
- Creó documento de hallazgos

⏱️ hace 1 min
```

### Fin de Tarea

```javascript
// Claude Code:
await updateProgress("Investigación completada", {
  progress: 100,
  status: "completed"
});
```

↓ Tracker detecta completion

↓ Envía notificación final:

```
✅ Tarea completada

📋 Investigar endpoints de API
⏱️ Duración: 15 min

Resultados:
- 10 archivos leídos
- 3 endpoints probados
- 2 documentos creados
```

---

## 📈 Estimación de Desarrollo

| Componente | Tiempo | Prioridad |
|-----------|--------|-----------|
| telegram-progress-tracker.js | 1.5 horas | Alta |
| telegram-update-progress.js | 30 min | Alta |
| Integración con hooks | 20 min | Media |
| Configuración JSON | 10 min | Media |
| Testing end-to-end | 30 min | Alta |
| Documentación | 20 min | Media |
| **Total** | **~3 horas** | - |

---

## 🧪 Plan de Testing

### Fase 1: Unit Tests
1. ✅ updateProgress() escribe correctamente a status.json
2. ✅ Tracker lee status.json correctamente
3. ✅ Hash comparison detecta cambios
4. ✅ Limitador de notificaciones funciona

### Fase 2: Integration Tests
1. ✅ Claude Code llama updateProgress() → Tracker notifica
2. ✅ Múltiples updates rápidos → Solo 1 notificación (rate limit)
3. ✅ Task completion → Notificación inmediata
4. ✅ Error → Notificación de error

### Fase 3: End-to-End Test
1. ✅ Iniciar tarea real de Claude Code
2. ✅ Tracker corriendo en background
3. ✅ Verificar notificaciones llegan a Telegram
4. ✅ Verificar formato y contenido correcto
5. ✅ Verificar no hay spam

---

## 🔐 Seguridad y Consideraciones

### Seguridad
- ✅ TELEGRAM_BOT_TOKEN nunca en archivos JSON (usar env)
- ✅ Status files en ~/.claude-telegram (fuera del repo)
- ✅ Permisos 600 en archivos de estado
- ✅ Rate limiting para evitar abuse de API

### Performance
- ✅ Status.json < 50KB (limpiar activities antiguas)
- ✅ Tracker usa polling eficiente (fs.watch + debounce)
- ✅ Updates atómicos (write temp + rename)
- ✅ Graceful shutdown del tracker

### Mantenimiento
- ✅ Logs del tracker en ~/.claude-telegram/tracker.log
- ✅ Rotación de logs (max 10MB)
- ✅ Health check endpoint (opcional)
- ✅ Auto-restart si tracker crashea

---

## 📝 Próximos Pasos

1. ✅ Revisar y aprobar arquitectura
2. ⏳ Implementar telegram-update-progress.js
3. ⏳ Implementar telegram-progress-tracker.js
4. ⏳ Configurar hooks
5. ⏳ Testing completo
6. ⏳ Documentar uso
7. ⏳ Notificar usuario

---

## 💡 Mejoras Futuras (v2.0)

- [ ] Dashboard web para ver progreso en navegador
- [ ] Comandos de Telegram para controlar tracker (/pause, /resume, /status)
- [ ] Múltiples usuarios/chats
- [ ] Estadísticas de productividad
- [ ] Integración con GitHub para commits automáticos
- [ ] Voice notes en lugar de texto
- [ ] Screenshots automáticos de resultados
