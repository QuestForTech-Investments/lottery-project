# 📊 Sistema de Notificaciones Webhook para Claude Code

**Versión**: 1.0.0
**Fecha**: 2025-10-31
**Estado**: ✅ Implementado y Probado

---

## 🎯 ¿Qué es este sistema?

Un sistema automático que envía notificaciones a Telegram sobre el progreso de Claude Code en tiempo real, sin necesidad de intervención manual.

**Beneficios**:
- ✅ Notificaciones automáticas cada 2 minutos (configurable)
- ✅ Dashboard de progreso en tiempo real
- ✅ Resumen de actividades (archivos leídos, APIs probadas, etc.)
- ✅ Rate limiting inteligente (evita spam)
- ✅ Integración con hooks de Claude Code

---

## 📁 Archivos del Sistema

```
.claude/
├── telegram-update-progress.cjs    # Helper para actualizar progreso
├── telegram-progress-tracker.cjs   # Daemon de monitoreo
├── telegram-webhook-architecture.md  # Documentación de arquitectura
└── settings.local.json             # Configuración de hooks

~/.claude-telegram/
├── status.json                     # Estado actual del progreso
├── tracking_state.json             # Estado del tracker
├── activity_log.json               # Log histórico de actividades
├── config.json                     # Configuración del sistema
└── tracker.log                     # Log del daemon

docs/
└── TELEGRAM_WEBHOOK_GUIA_COMPLETA.md  # Esta guía
```

---

## 🚀 Instalación en Nuevos Proyectos

### Paso 1: Copiar archivos

```bash
# Copiar scripts
cp .claude/telegram-update-progress.cjs /ruta/al/nuevo/proyecto/.claude/
cp .claude/telegram-progress-tracker.cjs /ruta/al/nuevo/proyecto/.claude/

# Hacer ejecutables
chmod +x /ruta/al/nuevo/proyecto/.claude/telegram-*.cjs
```

### Paso 2: Configurar variables de entorno

```bash
# En .env o ~/.bashrc
export TELEGRAM_BOT_TOKEN="tu_bot_token"
export TELEGRAM_CHAT_ID="tu_chat_id"
```

### Paso 3: Actualizar hooks en `.claude/settings.local.json`

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/telegram-update-progress.cjs complete 2>/dev/null || echo '⚠️ Could not update progress status'"
          },
          {
            "type": "command",
            "command": "if [[ -n \"$TELEGRAM_BOT_TOKEN\" && -n \"$TELEGRAM_CHAT_ID\" ]]; then MESSAGE=\"🤖 Claude Code finished working at $(date '+%Y-%m-%d %H:%M:%S')\"; curl -s -X POST \"https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage\" -d \"chat_id=$TELEGRAM_CHAT_ID\" -d \"text=$MESSAGE\" -d \"parse_mode=HTML\" >/dev/null 2>&1 || echo \"Failed to send Telegram notification\"; else echo \"⚠️ Telegram notification skipped: Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables\"; fi"
          }
        ]
      }
    ]
  }
}
```

### Paso 4: Probar el sistema

```bash
# Test 1: Actualizar progreso
node .claude/telegram-update-progress.cjs "Probando sistema" 25

# Test 2: Ejecutar tracker una vez
node .claude/telegram-progress-tracker.cjs --once

# Test 3: Ver el log
cat ~/.claude-telegram/tracker.log
```

---

## 💻 Uso desde Claude Code

### Opción 1: API Programática (Recomendada)

```javascript
// Desde un script que Claude Code ejecute
const { updateProgress } = require('./.claude/telegram-update-progress.cjs');

// Iniciar tarea
await updateProgress('Iniciando investigación de API', {
  task: 'Investigar endpoints de API',
  progress: 0,
  status: 'in_progress'
});

// Actualizar progreso con actividad
await updateProgress('Leyendo archivos de configuración', {
  progress: 25,
  activity: {
    action: 'Leyó src/config/api.js',
    type: 'read'
  }
});

// Probar API
await updateProgress('Probando endpoints', {
  progress: 50,
  activity: {
    action: 'Probó GET /api/users',
    type: 'api_test'
  }
});

// Crear documentación
await updateProgress('Documentando hallazgos', {
  progress: 75,
  activity: {
    action: 'Creó HALLAZGOS_API.md',
    type: 'write'
  }
});

// Completar tarea
await updateProgress('Investigación completada', {
  progress: 100,
  status: 'completed'
});
```

### Opción 2: CLI (Desde Bash)

```bash
# Actualizar progreso simple
node .claude/telegram-update-progress.cjs "Leyendo archivos" 25

# Incrementar progreso
node .claude/telegram-update-progress.cjs "Probando API" 50

# Marcar como completado
node .claude/telegram-update-progress.cjs complete
```

---

## 🔧 Configuración Avanzada

### Archivo de Configuración (`~/.claude-telegram/config.json`)

```json
{
  "update_interval_ms": 120000,          // Intervalo de polling (2 minutos)
  "min_progress_change": 5,              // Notificar si progreso >= 5%
  "max_notifications_per_hour": 15,      // Límite de notificaciones
  "notification_types": {
    "progress_update": true,             // Notificaciones de progreso
    "task_start": true,                  // Notificar al iniciar tarea
    "task_complete": true,               // Notificar al completar
    "error": true,                       // Notificar errores
    "question": true                     // Notificar preguntas
  },
  "telegram": {
    "chat_id": "417821897",
    "bot_token": "${TELEGRAM_BOT_TOKEN}",
    "parse_mode": "Markdown"
  }
}
```

### Tipos de Actividades

```javascript
{
  type: "read",         // Lectura de archivos
  type: "write",        // Escritura de archivos
  type: "api_test",     // Prueba de API
  type: "api_call",     // Llamada a API
  type: "question",     // Pregunta al usuario
  type: "general"       // Actividad general
}
```

---

## 🤖 Iniciar el Daemon Automáticamente

### Opción 1: Systemd (Linux)

Crear `/etc/systemd/system/claude-telegram-tracker.service`:

```ini
[Unit]
Description=Claude Telegram Progress Tracker
After=network.target

[Service]
Type=simple
User=jorge
WorkingDirectory=/home/jorge/projects/Lottery-Project/LottoWebApp
Environment="TELEGRAM_BOT_TOKEN=your_token"
Environment="TELEGRAM_CHAT_ID=your_chat_id"
ExecStart=/usr/bin/node .claude/telegram-progress-tracker.cjs
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar y iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable claude-telegram-tracker
sudo systemctl start claude-telegram-tracker

# Ver logs
sudo journalctl -u claude-telegram-tracker -f
```

### Opción 2: PM2 (Multiplataforma)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar daemon
pm2 start .claude/telegram-progress-tracker.cjs --name "claude-tracker"

# Ver logs
pm2 logs claude-tracker

# Guardar configuración
pm2 save
pm2 startup
```

### Opción 3: Cron (Ejecución periódica)

```bash
# Editar crontab
crontab -e

# Ejecutar cada 2 minutos
*/2 * * * * cd /home/jorge/projects/Lottery-Project/LottoWebApp && node .claude/telegram-progress-tracker.cjs --once >> /tmp/claude-tracker.log 2>&1
```

---

## 📊 Formato de Notificaciones

### Notificación de Progreso

```
🔄 Investigar endpoints de API

💬 Probando endpoints de API

📊 Progreso: 50%
[██████████░░░░░░░░░░]

🏷️ Estado: En Progreso

📝 Últimas actividades:
📄 Leyó src/config/api.js
🔌 Probó GET /api/users
✏️ Creó HALLAZGOS_API.md

📈 Estadísticas:
📄 Archivos leídos: 5
✏️ Archivos escritos: 2
🔌 Llamadas API: 3

⏱️ Última actualización: hace 30 seg
```

### Notificación de Completado

```
✅ Investigar endpoints de API

💬 Investigación completada

📊 Progreso: 100%
[████████████████████]

🏷️ Estado: Completado

📝 Últimas actividades:
📄 Leyó 10 archivos
🔌 Probó 5 endpoints
✏️ Creó 3 documentos

⏱️ Última actualización: hace 5 seg
```

---

## 🧪 Testing

### Test Completo del Sistema

```bash
cat > test-webhook.sh << 'EOF'
#!/bin/bash
set -e

echo "🧪 Testing Sistema Webhook..."

# Test 1: Helper
echo "1️⃣ Testing telegram-update-progress.cjs..."
node .claude/telegram-update-progress.cjs "Test 1" 25
node .claude/telegram-update-progress.cjs "Test 2" 50
node .claude/telegram-update-progress.cjs complete

# Test 2: Tracker (--once mode)
echo "2️⃣ Testing telegram-progress-tracker.cjs..."
node .claude/telegram-progress-tracker.cjs --once

# Test 3: Ver estado
echo "3️⃣ Estado final:"
cat ~/.claude-telegram/status.json | head -20

echo "✅ Tests completados"
EOF

chmod +x test-webhook.sh
./test-webhook.sh
```

### Test de Hooks

```bash
# Simular evento Stop
echo '{"event": "Stop"}' | node -e "
const { exec } = require('child_process');
exec('node .claude/telegram-update-progress.cjs complete', (err, stdout, stderr) => {
  if (err) console.error(err);
  console.log(stdout);
});
"
```

---

## 🔍 Troubleshooting

### Problema: No se envían notificaciones

**Solución**:
```bash
# Verificar variables de entorno
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID

# Verificar permisos
ls -lh .claude/telegram-*.cjs

# Ver logs del tracker
cat ~/.claude-telegram/tracker.log
```

### Problema: Demasiadas notificaciones

**Solución**:
```json
// Ajustar en config.json
{
  "update_interval_ms": 300000,      // 5 minutos en lugar de 2
  "min_progress_change": 10,         // Notificar solo si >= 10%
  "max_notifications_per_hour": 10   // Reducir a 10/hora
}
```

### Problema: Archivo status.json no se crea

**Solución**:
```bash
# Ejecutar desde raíz del proyecto, NO desde .claude/
cd /home/jorge/projects/Lottery-Project/LottoWebApp
node .claude/telegram-update-progress.cjs "Test" 25

# Verificar creación
ls -lh ~/.claude-telegram/
```

### Problema: Error "Cannot find module"

**Solución**:
```bash
# Asegurarse de que los archivos son .cjs (NO .js)
ls .claude/telegram-*.cjs

# Si son .js, renombrar:
mv .claude/telegram-update-progress.js .claude/telegram-update-progress.cjs
mv .claude/telegram-progress-tracker.js .claude/telegram-progress-tracker.cjs

# Actualizar hooks en settings.local.json para usar .cjs
```

---

## 📝 Mejores Prácticas

### 1. Estructura de Tareas

```javascript
// ✅ BIEN: Tarea descriptiva con progreso granular
await updateProgress('Iniciando', {
  task: 'Implementar autenticación OAuth',
  progress: 0
});

await updateProgress('Investigando bibliotecas', { progress: 20 });
await updateProgress('Configurando Passport.js', { progress: 40 });
await updateProgress('Creando rutas de auth', { progress: 60 });
await updateProgress('Escribiendo tests', { progress: 80 });
await updateProgress('Completado', { progress: 100, status: 'completed' });

// ❌ MAL: Actualizar de 0 a 100 sin pasos intermedios
await updateProgress('Inicio', { progress: 0 });
await updateProgress('Completado', { progress: 100 });
```

### 2. Actividades Descriptivas

```javascript
// ✅ BIEN: Actividades con contexto
await updateProgress('Probando endpoint de login', {
  progress: 50,
  activity: {
    action: 'Probó POST /api/auth/login con credenciales válidas',
    type: 'api_test'
  }
});

// ❌ MAL: Actividad genérica
await updateProgress('Probando API', {
  progress: 50,
  activity: { action: 'Test', type: 'api_test' }
});
```

### 3. Manejo de Errores

```javascript
try {
  await implementarFeature();
  await updateProgress('Feature completado', {
    progress: 100,
    status: 'completed'
  });
} catch (error) {
  await updateProgress(`Error: ${error.message}`, {
    progress: 50,
    status: 'error',
    activity: {
      action: `Error al implementar: ${error.message}`,
      type: 'general'
    }
  });
}
```

---

## 🎓 Ejemplos Reales

### Ejemplo 1: Investigación de API

```javascript
const { updateProgress } = require('./.claude/telegram-update-progress.cjs');

async function investigarAPI() {
  // Iniciar
  await updateProgress('Iniciando investigación', {
    task: 'Investigar API multi-tabla',
    progress: 0,
    status: 'in_progress'
  });

  // Leer configuración
  await updateProgress('Leyendo configuración', {
    progress: 20,
    activity: {
      action: 'Leyó src/config/api.js',
      type: 'read'
    }
  });

  // Probar endpoints
  await updateProgress('Probando GET /api/betting-pools/9/config', {
    progress: 40,
    activity: {
      action: 'Probó GET /api/betting-pools/9/config - 200 OK',
      type: 'api_test'
    }
  });

  await updateProgress('Probando GET /api/betting-pools/9/prizes', {
    progress: 60,
    activity: {
      action: 'Probó GET /api/betting-pools/9/prizes - 400 Error',
      type: 'api_test'
    }
  });

  // Documentar
  await updateProgress('Documentando hallazgos', {
    progress: 80,
    activity: {
      action: 'Creó HALLAZGOS_API.md con 45 campos disponibles',
      type: 'write'
    }
  });

  // Completar
  await updateProgress('Investigación completada', {
    progress: 100,
    status: 'completed'
  });
}

investigarAPI().catch(console.error);
```

### Ejemplo 2: Refactorización de Componentes

```javascript
async function refactorizarComponentes() {
  await updateProgress('Iniciando refactorización', {
    task: 'Migrar componentes a Material-UI',
    progress: 0
  });

  const componentes = ['CreateBanca', 'EditBanca', 'ListaBancas'];
  const totalComponentes = componentes.length;

  for (let i = 0; i < totalComponentes; i++) {
    const componente = componentes[i];
    const progress = Math.floor(((i + 1) / totalComponentes) * 100);

    await updateProgress(`Refactorizando ${componente}`, {
      progress,
      activity: {
        action: `Migró ${componente}.jsx a Material-UI`,
        type: 'write'
      }
    });
  }

  await updateProgress('Refactorización completada', {
    progress: 100,
    status: 'completed',
    metadata: {
      componentes_migrados: totalComponentes
    }
  });
}
```

---

## 🔗 Referencias

- [Arquitectura del Sistema](./telegram-webhook-architecture.md)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Claude Code Hooks](https://docs.claude.com/en/docs/claude-code/hooks)
- [Node.js fs.promises](https://nodejs.org/api/fs.html#fs_promises_api)

---

## 📈 Roadmap v2.0

- [ ] Dashboard web para ver progreso en navegador
- [ ] Comandos de Telegram (/pause, /resume, /status)
- [ ] Múltiples usuarios/chats
- [ ] Estadísticas de productividad
- [ ] Voice notes en lugar de texto
- [ ] Screenshots automáticos de resultados

---

## 📞 Soporte

Si encuentras problemas o tienes sugerencias:

1. Revisa la sección de Troubleshooting
2. Verifica los logs en `~/.claude-telegram/tracker.log`
3. Prueba el sistema con `test-webhook.sh`
4. Contacta al desarrollador original del proyecto

---

**Desarrollado con ❤️ por Claude Code**
**Fecha de creación**: 2025-10-31
**Última actualización**: 2025-10-31
