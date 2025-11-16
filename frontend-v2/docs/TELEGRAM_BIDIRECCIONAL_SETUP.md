# 🔄 Telegram Bidireccional - Guía de Instalación y Uso

## 📋 Índice

1. [Descripción](#descripción)
2. [Requisitos](#requisitos)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Uso](#uso)
6. [Ejemplos](#ejemplos)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

---

## 🎯 Descripción

Sistema que permite a Claude Code hacer preguntas y recibir respuestas desde Telegram en tiempo real. Usa archivos JSON como estado compartido (File-Based State).

### Flujo de Trabajo

```
1. Claude Code hace una pregunta
   ↓
2. Se crea un archivo JSON con la pregunta
   ↓
3. Bot de Telegram detecta la pregunta (polling cada 3s)
   ↓
4. Bot envía mensaje con botones a tu Telegram
   ↓
5. Respondes desde tu móvil/desktop
   ↓
6. Bot guarda tu respuesta en JSON
   ↓
7. Claude Code detecta la respuesta (polling cada 2s)
   ↓
8. Claude continúa trabajando con tu decisión ✅
```

---

## ✅ Requisitos

### Software

- ✅ **Node.js** >= 14.0.0
- ✅ **npm** >= 6.0.0
- ✅ **jq** (para scripts bash)
- ✅ **Telegram** (app móvil o desktop)

### Verificar instalación

```bash
# Node.js y npm
node --version  # Debe ser >= 14
npm --version   # Debe ser >= 6

# jq (solo para scripts bash)
jq --version    # Si no está: sudo apt-get install jq (Ubuntu) o brew install jq (Mac)
```

---

## 📦 Instalación

### Paso 1: Instalar dependencias npm

```bash
cd /home/jorge/projects/Lottery-Project/LottoWebApp

# Instalar dependencias necesarias
npm install --save-dev node-telegram-bot-api dotenv
```

### Paso 2: Verificar archivos

```bash
ls -la .claude/

# Deberías ver:
# telegram-bot.js          (Bot de Telegram)
# claude-telegram-ask.sh   (Script bash)
# claude-telegram-client.js (Cliente Node.js)
```

### Paso 3: Hacer scripts ejecutables

```bash
chmod +x .claude/telegram-bot.js
chmod +x .claude/claude-telegram-ask.sh
```

---

## ⚙️ Configuración

### Paso 1: Crear tu Bot de Telegram

1. Abre Telegram y busca **@BotFather**
2. Envía `/newbot`
3. Sigue las instrucciones:
   - Nombre: `Claude Code Bot` (o el que prefieras)
   - Username: `tu_nombre_bot` (debe terminar en `_bot`)
4. BotFather te dará un **token**. Guárdalo.

**Ejemplo de token:**
```
7638959180:AAG5ijBMEVcrZg0fwmhbh5pQKqY-1i4yabQ
```

### Paso 2: Obtener tu Chat ID

#### Opción A: Usando el bot

1. Inicia el bot temporalmente:
   ```bash
   # En una terminal
   TELEGRAM_BOT_TOKEN="tu_token_aqui" node .claude/telegram-bot.js
   ```

2. Abre Telegram y busca tu bot
3. Envía `/start`
4. Envía `/chatid`
5. El bot te responderá con tu Chat ID

#### Opción B: Manualmente

1. Busca tu bot en Telegram y envía `/start`
2. Abre en navegador:
   ```
   https://api.telegram.org/bot<TU_TOKEN>/getUpdates
   ```
3. Busca `"chat":{"id":123456789}` en la respuesta
4. Ese número es tu Chat ID

### Paso 3: Configurar variables de entorno

Agrega estas líneas al archivo `.env`:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=7638959180:AAG5ijBMEVcrZg0fwmhbh5pQKqY-1i4yabQ
TELEGRAM_CHAT_ID=417821897
```

**Reemplaza con tus valores reales.**

### Paso 4: Verificar configuración

```bash
# Ver variables
cat .env | grep TELEGRAM

# Deberías ver:
# TELEGRAM_BOT_TOKEN=tu_token
# TELEGRAM_CHAT_ID=tu_chat_id
```

---

## 🚀 Uso

### Iniciar el Bot de Telegram

**En una terminal separada** (mantenerla abierta):

```bash
cd /home/jorge/projects/Lottery-Project/LottoWebApp
node .claude/telegram-bot.js
```

**Output esperado:**
```
🚀 Inicializando Telegram Bot...
✅ Estado inicializado en: /home/jorge/.claude-telegram

✅ Telegram Bot iniciado correctamente
📁 Directorio de estado: /home/jorge/.claude-telegram
🤖 Bot Token: 7638959180:AAG5ijB...
💬 Chat ID configurado: 417821897

🔄 Polling activo - Esperando preguntas...

💡 Comandos disponibles en Telegram:
   /start   - Iniciar bot
   /chatid  - Obtener Chat ID
   /status  - Ver preguntas pendientes
   /help    - Ayuda

⏹️  Presiona Ctrl+C para detener
```

**¡Listo!** El bot está esperando preguntas.

---

## 💬 Uso desde Claude Code

### Opción 1: Script Bash

```bash
# Desde cualquier script
./.claude/claude-telegram-ask.sh \
  "¿Qué librería de UI prefieres?" \
  '[{"label":"Material-UI","description":"Componentes robustos"},{"label":"Ant Design","description":"Enterprise UI"}]'

# Output:
# 📤 Enviando pregunta a Telegram...
# ⏳ Esperando respuesta del usuario...
# ✅ Respuesta recibida: Material-UI
```

### Opción 2: Cliente Node.js

```javascript
const ClaudeTelegramClient = require('./.claude/claude-telegram-client');

async function main() {
  const client = new ClaudeTelegramClient();
  await client.initialize();

  const answer = await client.askQuestion(
    '¿Qué framework prefieres?',
    [
      { label: 'React', description: 'Librería de componentes' },
      { label: 'Vue', description: 'Framework progresivo' },
      { label: 'Svelte', description: 'Sin virtual DOM' }
    ],
    300000 // 5 minutos timeout
  );

  console.log(`Usuario eligió: ${answer.label}`);
}

main();
```

### Opción 3: Desde Hook de Claude Code

Puedes crear un hook personalizado:

```javascript
// .claude/hooks/telegram-ask.js
const ClaudeTelegramClient = require('../claude-telegram-client');

async function askViaTelegram(question, options, timeout = 300000) {
  const client = new ClaudeTelegramClient();
  await client.initialize();
  return await client.askQuestion(question, options, timeout);
}

module.exports = { askViaTelegram };
```

Uso:

```javascript
const { askViaTelegram } = require('./.claude/hooks/telegram-ask');

const answer = await askViaTelegram(
  '¿Continuar con el deployment?',
  [
    { label: 'Sí', description: 'Deploy a producción' },
    { label: 'No', description: 'Cancelar' }
  ]
);

if (answer.label === 'Sí') {
  // Continuar deployment
}
```

---

## 📱 Uso desde Telegram

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `/start` | Iniciar el bot y ver info |
| `/chatid` | Obtener tu Chat ID |
| `/status` | Ver preguntas pendientes |
| `/help` | Ver ayuda |

### Responder Preguntas

Cuando Claude Code hace una pregunta, recibirás un mensaje como este:

```
🤖 Claude Code necesita tu decisión:

¿Qué librería de UI prefieres?

Selecciona una opción:
┌─────────────────────┐
│ 1. Material-UI      │
│ 2. Ant Design       │
│ 3. Chakra UI        │
└─────────────────────┘
```

**Simplemente presiona el botón** de tu elección.

El bot confirmará:

```
✅ Pregunta respondida

❓ ¿Qué librería de UI prefieres?

💡 Tu respuesta: Material-UI

🤖 Claude Code continuará trabajando...
```

---

## 📝 Ejemplos Completos

### Ejemplo 1: Pregunta Simple

```javascript
// test-simple.js
const ClaudeTelegramClient = require('./.claude/claude-telegram-client');

async function test() {
  const client = new ClaudeTelegramClient();
  await client.initialize();

  const answer = await client.askQuestion(
    '¿Apruebas este cambio?',
    [
      { label: 'Sí', description: 'Aprobar el cambio' },
      { label: 'No', description: 'Rechazar el cambio' }
    ]
  );

  console.log(`Respuesta: ${answer.label}`);
}

test();
```

**Ejecutar:**
```bash
node test-simple.js
```

### Ejemplo 2: Pregunta con Timeout Corto

```javascript
// test-timeout.js
const ClaudeTelegramClient = require('./.claude/claude-telegram-client');

async function test() {
  const client = new ClaudeTelegramClient();
  await client.initialize();

  try {
    const answer = await client.askQuestion(
      'Pregunta urgente: ¿Proceder?',
      [
        { label: 'Sí', description: 'Continuar' },
        { label: 'No', description: 'Detener' }
      ],
      30000 // 30 segundos timeout
    );

    console.log(`Respuesta: ${answer.label}`);
  } catch (err) {
    console.error('Timeout o error:', err.message);
  }
}

test();
```

### Ejemplo 3: Múltiples Preguntas

```javascript
// test-multiple.js
const ClaudeTelegramClient = require('./.claude/claude-telegram-client');

async function test() {
  const client = new ClaudeTelegramClient();
  await client.initialize();

  // Primera pregunta
  const style = await client.askQuestion(
    '¿Qué estilo de diseño prefieres?',
    [
      { label: 'Modern', description: 'Gradientes y glassmorphism' },
      { label: 'Classic', description: 'Diseño tradicional' }
    ]
  );

  console.log(`Estilo elegido: ${style.label}`);

  // Segunda pregunta basada en la primera
  if (style.label === 'Modern') {
    const colors = await client.askQuestion(
      '¿Qué paleta de colores?',
      [
        { label: 'Indigo/Purple', description: 'Vibrante y moderno' },
        { label: 'Blue/Cyan', description: 'Corporativo y fresco' }
      ]
    );

    console.log(`Colores elegidos: ${colors.label}`);
  }
}

test();
```

### Ejemplo 4: Con Bash Script

```bash
#!/bin/bash
# deploy-with-confirmation.sh

echo "🚀 Iniciando deployment..."

# Preguntar confirmación
RESPONSE=$(./.claude/claude-telegram-ask.sh \
  "¿Continuar con el deployment a producción?" \
  '[{"label":"Sí","description":"Deploy ahora"},{"label":"No","description":"Cancelar"}]')

ANSWER=$(echo "$RESPONSE" | jq -r '.label')

if [ "$ANSWER" = "Sí" ]; then
  echo "✅ Deployment aprobado"
  # Ejecutar deployment
  npm run build
  npm run deploy
else
  echo "❌ Deployment cancelado"
  exit 1
fi
```

---

## 🔧 Troubleshooting

### Problema: "TELEGRAM_BOT_TOKEN no está configurado"

**Solución:**
```bash
# Verifica que esté en .env
cat .env | grep TELEGRAM_BOT_TOKEN

# Si no está, agrégalo:
echo "TELEGRAM_BOT_TOKEN=tu_token" >> .env
```

### Problema: "No se recibió respuesta (timeout)"

**Posibles causas:**

1. **El bot no está corriendo**
   ```bash
   # Verificar si está ejecutándose
   ps aux | grep telegram-bot

   # Si no está, iniciarlo
   node .claude/telegram-bot.js
   ```

2. **Chat ID incorrecto**
   ```bash
   # Verificar Chat ID
   echo $TELEGRAM_CHAT_ID

   # Obtener el correcto desde Telegram
   # Envía /chatid a tu bot
   ```

3. **No respondiste a tiempo**
   - Default timeout: 5 minutos
   - Revisa tu Telegram y responde antes del timeout

### Problema: "jq: command not found"

**Solución:**
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Fedora/CentOS
sudo yum install jq
```

### Problema: Bot no envía mensajes

**Solución:**

1. Verifica que el token sea correcto
2. Asegúrate de haber enviado `/start` al bot al menos una vez
3. Revisa los logs del bot:
   ```bash
   node .claude/telegram-bot.js 2>&1 | tee bot.log
   ```

### Problema: "Error: Cannot find module 'node-telegram-bot-api'"

**Solución:**
```bash
npm install --save-dev node-telegram-bot-api dotenv
```

---

## 📚 API Reference

### ClaudeTelegramClient

#### Constructor

```javascript
new ClaudeTelegramClient(telegramChatId?: string)
```

**Parámetros:**
- `telegramChatId` (opcional): Chat ID de Telegram. Si no se provee, usa `process.env.TELEGRAM_CHAT_ID`

**Ejemplo:**
```javascript
const client = new ClaudeTelegramClient('417821897');
// o
const client = new ClaudeTelegramClient(); // Usa variable de entorno
```

#### initialize()

Inicializa el cliente (crea directorios y archivos necesarios).

```javascript
await client.initialize();
```

**Returns:** `Promise<void>`

#### askQuestion(question, options, timeout)

Hace una pregunta vía Telegram y espera respuesta.

```javascript
const answer = await client.askQuestion(question, options, timeout);
```

**Parámetros:**
- `question` (string): La pregunta
- `options` (Array): Array de opciones `[{label: string, description: string}]`
- `timeout` (number, opcional): Timeout en milisegundos (default: 300000 = 5 min)

**Returns:** `Promise<Object>` - Opción seleccionada `{label, description}`

**Ejemplo:**
```javascript
const answer = await client.askQuestion(
  '¿Qué prefieres?',
  [
    { label: 'A', description: 'Opción A' },
    { label: 'B', description: 'Opción B' }
  ],
  60000 // 1 minuto
);

console.log(answer.label); // "A" o "B"
```

#### getStatus()

Obtiene el estado de preguntas pendientes.

```javascript
const questions = await client.getStatus();
```

**Returns:** `Promise<Array>` - Array de preguntas `[{id, question, status, created_at}]`

---

## 🎯 Casos de Uso

### 1. Confirmaciones Antes de Deployments

```javascript
const answer = await client.askQuestion(
  '¿Deploy a producción?',
  [
    { label: 'Producción', description: 'Deploy a prod' },
    { label: 'Staging', description: 'Deploy a staging' },
    { label: 'Cancelar', description: 'No deploy' }
  ]
);

if (answer.label === 'Producción') {
  await deployToProduction();
}
```

### 2. Elegir Opciones de Configuración

```javascript
const framework = await client.askQuestion(
  '¿Qué framework de testing?',
  [
    { label: 'Jest', description: 'Rápido y completo' },
    { label: 'Vitest', description: 'Compatible con Vite' },
    { label: 'Mocha', description: 'Flexible' }
  ]
);

await setupTesting(framework.label);
```

### 3. Aprobaciones en Workflows

```javascript
// En un workflow de GitHub Actions
const approval = await client.askQuestion(
  'PR #123: ¿Aprobar merge?',
  [
    { label: 'Aprobar', description: 'Merge a main' },
    { label: 'Rechazar', description: 'Cerrar PR' },
    { label: 'Comentar', description: 'Solicitar cambios' }
  ]
);

await handlePRDecision(approval.label);
```

### 4. Decisiones de Arquitectura

```javascript
const architecture = await client.askQuestion(
  '¿Qué arquitectura para el nuevo módulo?',
  [
    { label: 'Microservicios', description: 'Alta escalabilidad' },
    { label: 'Monolito', description: 'Más simple' },
    { label: 'Serverless', description: 'Sin infraestructura' }
  ]
);

await scaffoldArchitecture(architecture.label);
```

---

## 🔐 Seguridad

### Mejores Prácticas

1. ✅ **Nunca commits el token** al repositorio
   ```bash
   # Asegúrate de que .env está en .gitignore
   echo ".env" >> .gitignore
   ```

2. ✅ **Usa variables de entorno** en producción
   ```bash
   export TELEGRAM_BOT_TOKEN="..."
   export TELEGRAM_CHAT_ID="..."
   ```

3. ✅ **Limita acceso** al Chat ID
   - Solo tú deberías tener acceso
   - Considera usar un grupo privado para equipos

4. ✅ **Rotate tokens periódicamente**
   - Cada 6-12 meses
   - Usa @BotFather para generar nuevo token

---

## 📊 Monitoreo

### Ver Archivos de Estado

```bash
# Ver preguntas pendientes
cat ~/.claude-telegram/pending_questions.json | jq '.'

# Ver respuestas
cat ~/.claude-telegram/responses.json | jq '.'

# Ver sesiones
cat ~/.claude-telegram/sessions.json | jq '.'
```

### Limpiar Estado

```bash
# Limpiar todo
rm -rf ~/.claude-telegram/

# Reiniciar bot para recrear archivos
node .claude/telegram-bot.js
```

---

## 🎉 ¡Listo!

Ahora puedes:

✅ Hacer preguntas desde Claude Code
✅ Recibir notificaciones en Telegram
✅ Responder desde tu móvil
✅ Claude continúa con tu decisión

**Siguiente paso:** Prueba con el ejemplo simple:

```bash
node .claude/claude-telegram-client.js
```

¡Disfruta de Claude Code Bidireccional! 🚀
