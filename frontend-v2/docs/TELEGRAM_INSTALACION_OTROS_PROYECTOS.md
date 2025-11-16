# 🚀 Instalar Telegram en Otros Proyectos

Guía para instalar el sistema de Telegram Bidireccional en cualquier proyecto.

---

## ⚡ Instalación Rápida (1 Comando)

Desde este proyecto (LottoWebApp), ejecuta:

```bash
# Instalar en otro proyecto
/home/jorge/projects/Lottery-Project/LottoWebApp/.claude/install-telegram.sh /ruta/a/otro-proyecto

# O si estás en este proyecto:
./.claude/install-telegram.sh ~/projects/mi-app
```

### Con bot incluido:

```bash
# Instala y arranca el bot automáticamente
./.claude/install-telegram.sh ~/projects/mi-app --with-bot
```

---

## 📋 Qué se Instala

El instalador copia automáticamente:

✅ **Archivos del sistema:**
- `claude-telegram-client.cjs` - Cliente Node.js
- `telegram-bot.cjs` - Bot de Telegram
- `telegram-send.sh` - Script bash para enviar mensajes
- `claude-telegram-ask.sh` - Script bash para hacer preguntas
- `test-telegram.cjs` - Test de preguntas
- `test-telegram-send.cjs` - Test de mensajes

✅ **Documentación:**
- `TELEGRAM_QUICK_START.md` - Guía de inicio rápido
- `TELEGRAM_BIDIRECCIONAL_SETUP.md` - Documentación completa
- `TELEGRAM_BIDIRECCIONAL_ARQUITECTURA.md` - Arquitectura del sistema

✅ **Dependencias npm:**
- `node-telegram-bot-api`
- `dotenv`

✅ **Configuración:**
- `.env` (si no existe, crea uno de ejemplo)

---

## 🎯 Uso Paso a Paso

### 1. Instalar en un proyecto

```bash
cd /home/jorge/projects/Lottery-Project/LottoWebApp

# Instalar en otro proyecto
./.claude/install-telegram.sh ~/projects/otro-proyecto
```

**Salida esperada:**
```
═══════════════════════════════════════════════════════════════
🚀 Instalador de Telegram Bidireccional
═══════════════════════════════════════════════════════════════

📂 Directorio destino: /home/jorge/projects/otro-proyecto

📦 Instalando archivos...

📄 Copiando archivos del sistema...
  ✓ claude-telegram-client.cjs
  ✓ telegram-bot.cjs
  ✓ telegram-send.sh
  ✓ claude-telegram-ask.sh
  ✓ test-telegram.cjs
  ✓ test-telegram-send.cjs

📚 Copiando documentación...
  ✓ TELEGRAM_QUICK_START.md
  ✓ TELEGRAM_BIDIRECCIONAL_SETUP.md
  ✓ TELEGRAM_BIDIRECCIONAL_ARQUITECTURA.md

✅ Instalación completada
```

### 2. Configurar el proyecto

```bash
cd ~/projects/otro-proyecto
nano .env  # O tu editor preferido
```

Agrega estas líneas al `.env`:

```bash
TELEGRAM_BOT_TOKEN=7638959180:AAG5ijBME...  # Tu token
TELEGRAM_CHAT_ID=417821897                  # Tu Chat ID
```

> **Nota:** Puedes usar los mismos valores que en LottoWebApp

### 3. Probar que funciona

```bash
# Iniciar bot (en background)
node .claude/telegram-bot.cjs &

# Esperar 2 segundos
sleep 2

# Ejecutar test
node .claude/test-telegram.cjs
```

Si ves esto, ¡funciona!:
```
✅ TEST COMPLETADO EXITOSAMENTE
📥 Respuesta recibida: ✅ Sí, funciona perfecto
```

---

## 🌟 Ejemplos de Uso

### A) Proyecto React

```bash
# Instalar
./.claude/install-telegram.sh ~/projects/mi-react-app

# Usar en scripts
cd ~/projects/mi-react-app
nano package.json
```

Agrega a `scripts`:
```json
{
  "scripts": {
    "deploy": "npm run build && node scripts/deploy.js",
    "notify": "node -e 'require(\"./.claude/claude-telegram-client.cjs\")'"
  }
}
```

Crea `scripts/deploy.js`:
```javascript
const ClaudeTelegramClient = require('../.claude/claude-telegram-client.cjs');

async function deploy() {
  const client = new ClaudeTelegramClient();
  await client.initialize();

  // Preguntar antes de deploy
  const confirm = await client.askQuestion('¿Deploy a producción?', [
    { label: 'Sí', description: 'Deployar ahora' },
    { label: 'No', description: 'Cancelar' }
  ]);

  if (confirm.label === 'Sí') {
    // Deploy...
    await client.sendMarkdown('✅ Deploy completado!');
  }
}

deploy();
```

### B) Proyecto .NET (LottoApi)

```bash
# Instalar en LottoApi
./.claude/install-telegram.sh ~/projects/Lottery-Project/LottoApi

cd ~/projects/Lottery-Project/LottoApi
```

Crea script `scripts/deploy.sh`:
```bash
#!/bin/bash
source .env

# Build
dotnet build

# Preguntar
RESPUESTA=$(../.claude/claude-telegram-ask.sh \
  "¿Deploy de LottoApi?" \
  '[{"label":"Producción","description":"Deploy real"},{"label":"Staging","description":"Pruebas"}]')

echo "Deployando a: $RESPUESTA"
# Deploy...
```

### C) Proyecto Python

```bash
# Instalar
./.claude/install-telegram.sh ~/projects/mi-python-app

cd ~/projects/mi-python-app
```

Crea `notify.py`:
```python
import subprocess
import json

def send_telegram(message):
    subprocess.run([
        './.claude/telegram-send.sh',
        message
    ])

def ask_telegram(question, options):
    result = subprocess.run([
        './.claude/claude-telegram-ask.sh',
        question,
        json.dumps(options)
    ], capture_output=True, text=True)
    return result.stdout.strip()

# Uso
send_telegram('🐍 Script de Python ejecutándose...')
answer = ask_telegram('¿Continuar?', [
    {'label': 'Sí', 'description': 'Continuar'},
    {'label': 'No', 'description': 'Detener'}
])
print(f'Usuario respondió: {answer}')
```

---

## 🔄 Actualizar Sistema en Proyectos

Si mejoras el sistema en LottoWebApp y quieres actualizarlo en otros proyectos:

```bash
# Re-instalar (sobrescribe archivos)
./.claude/install-telegram.sh ~/projects/otro-proyecto

# O manual:
cd ~/projects/otro-proyecto
cp /home/jorge/projects/Lottery-Project/LottoWebApp/.claude/*.cjs .claude/
cp /home/jorge/projects/Lottery-Project/LottoWebApp/.claude/*.sh .claude/
chmod +x .claude/*.sh
```

---

## 🎭 Usar el Mismo Bot en Múltiples Proyectos

**Opción 1: Un bot por proyecto**
- Crea un bot diferente para cada proyecto
- Cada proyecto tiene su propio `.env` con su token

**Opción 2: Un solo bot para todo** (Recomendado)
- Usa el mismo `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en todos los proyectos
- El bot puede estar corriendo en cualquier proyecto
- Todos los proyectos envían mensajes al mismo chat

```bash
# En cada proyecto, usa el mismo .env:
TELEGRAM_BOT_TOKEN=7638959180:AAG5ijBME...  # Mismo token
TELEGRAM_CHAT_ID=417821897                  # Mismo chat
```

**Ventaja:** Solo necesitas un bot corriendo en background, todos los proyectos lo usan.

---

## 📦 Crear Paquete Reutilizable (Opcional)

Si trabajas con muchos proyectos, puedes crear un paquete npm local:

```bash
# Crear paquete
mkdir ~/claude-telegram-utils
cd ~/claude-telegram-utils

# Copiar archivos
cp /home/jorge/projects/Lottery-Project/LottoWebApp/.claude/*.cjs .
cp /home/jorge/projects/Lottery-Project/LottoWebApp/.claude/*.sh .

# Crear package.json
cat > package.json << 'EOF'
{
  "name": "claude-telegram-utils",
  "version": "1.0.0",
  "description": "Sistema de Telegram Bidireccional para Claude Code",
  "main": "claude-telegram-client.cjs",
  "dependencies": {
    "node-telegram-bot-api": "^0.66.0",
    "dotenv": "^16.4.7"
  }
}
EOF

npm install

# Instalar en otros proyectos
cd ~/projects/otro-proyecto
npm install ~/claude-telegram-utils
```

Luego úsalo así:
```javascript
const ClaudeTelegramClient = require('claude-telegram-utils');
```

---

## 🚨 Troubleshooting

### Error: "Cannot find module"

```bash
# Instalar dependencias
cd tu-proyecto
npm install --save-dev node-telegram-bot-api dotenv
```

### Error: "TELEGRAM_BOT_TOKEN no está configurado"

```bash
# Verificar .env
cat .env | grep TELEGRAM

# Si no está, agregarlo:
echo "TELEGRAM_BOT_TOKEN=tu_token" >> .env
echo "TELEGRAM_CHAT_ID=tu_chat_id" >> .env
```

### Bot no responde

```bash
# Verificar que esté corriendo
ps aux | grep telegram-bot

# Si no está, iniciarlo:
node .claude/telegram-bot.cjs &

# Ver logs:
tail -f /tmp/telegram-bot.log
```

### Permisos de ejecución

```bash
# Si los scripts .sh no son ejecutables:
chmod +x .claude/*.sh
```

---

## 📚 Documentación Completa

Después de instalar, lee:

1. **TELEGRAM_QUICK_START.md** - Inicio rápido (5 min)
2. **TELEGRAM_BIDIRECCIONAL_SETUP.md** - Documentación completa
3. **TELEGRAM_BIDIRECCIONAL_ARQUITECTURA.md** - Arquitectura del sistema

---

## 🎉 ¡Listo!

Ahora puedes:

✅ Instalar el sistema en cualquier proyecto con 1 comando
✅ Recibir notificaciones en Telegram desde cualquier proyecto
✅ Hacer preguntas interactivas desde cualquier script
✅ Usar el mismo bot para múltiples proyectos
✅ Integrar con cualquier lenguaje (Node, Python, .NET, Bash, etc.)

**Siguiente paso:** Instala en tu próximo proyecto y empieza a recibir notificaciones! 🚀
