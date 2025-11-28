# 🔄 Telegram Bidireccional con Claude Code - Arquitectura Completa

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitecturas Propuestas](#arquitecturas-propuestas)
3. [Opción 1: File-Based State (Simple)](#opción-1-file-based-state-simple)
4. [Opción 2: Redis + WebSocket (Profesional)](#opción-2-redis--websocket-profesional)
5. [Opción 3: Database + Polling (Escalable)](#opción-3-database--polling-escalable)
6. [Comparación de Opciones](#comparación-de-opciones)
7. [Implementación Recomendada](#implementación-recomendada)
8. [Código de Ejemplo](#código-de-ejemplo)

---

## 🎯 Visión General

### Objetivo
Permitir que Claude Code:
1. Envíe preguntas a Telegram
2. Pause la ejecución esperando respuesta
3. Reciba la respuesta del usuario desde Telegram
4. Continue la ejecución con la decisión tomada

### Flujo Deseado

```
┌─────────────┐      1. Pregunta       ┌──────────────┐
│             │────────────────────────>│              │
│ Claude Code │                         │   Telegram   │
│             │<────────────────────────│     Bot      │
└─────────────┘      2. Respuesta      └──────────────┘
      │                                        │
      │                                        │
      └────────── Estado Compartido ──────────┘
           (File / Redis / Database)
```

---

## 🏗️ Arquitecturas Propuestas

### Componentes Necesarios

Todas las arquitecturas requieren:

1. **Telegram Bot Server**
   - Escucha mensajes entrantes (polling o webhook)
   - Procesa comandos del usuario
   - Envía respuestas a Claude Code

2. **Estado Compartido**
   - Almacena conversaciones activas
   - Vincula Claude Code sessions con Telegram chats
   - Guarda preguntas pendientes y respuestas

3. **Claude Code Integration**
   - Hook personalizado para pausar y esperar
   - Polling del estado compartido
   - Continuación de la ejecución

---

## 🔧 Opción 1: File-Based State (Simple)

### ✅ Ventajas
- **Muy simple de implementar**
- **No requiere servicios externos**
- **Fácil debugging** (archivos JSON legibles)
- **Cero configuración**

### ❌ Desventajas
- **No escalable** a múltiples usuarios
- **Latencia** en file system
- **Sin notificaciones** en tiempo real
- **Race conditions** posibles

### 📐 Arquitectura

```
┌────────────────────────────────────────────────────────────┐
│                     FILE SYSTEM                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /tmp/claude-telegram/                               │  │
│  │    ├── sessions.json         (Claude sessions)       │  │
│  │    ├── pending_questions.json (Preguntas activas)    │  │
│  │    └── responses.json         (Respuestas usuarios)  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
         ↑                                      ↑
         │ Write                                │ Write
         │                                      │
┌────────┴────────┐                   ┌────────┴────────┐
│  Claude Code    │                   │  Telegram Bot   │
│   (Polling)     │                   │    (Webhook)    │
└─────────────────┘                   └─────────────────┘
```

### 🔧 Implementación

#### Estructura de Archivos

**sessions.json:**
```json
{
  "session_12345": {
    "telegram_chat_id": "417821897",
    "status": "waiting_response",
    "created_at": "2025-10-30T10:00:00Z",
    "last_activity": "2025-10-30T10:05:00Z"
  }
}
```

**pending_questions.json:**
```json
{
  "question_abc123": {
    "session_id": "session_12345",
    "telegram_chat_id": "417821897",
    "question": "¿Qué librería de UI prefieres?",
    "options": [
      {"label": "Material-UI", "description": "..."},
      {"label": "Ant Design", "description": "..."}
    ],
    "status": "pending",
    "created_at": "2025-10-30T10:05:00Z"
  }
}
```

**responses.json:**
```json
{
  "question_abc123": {
    "answer": "Material-UI",
    "answered_at": "2025-10-30T10:06:00Z",
    "telegram_user": {
      "id": "417821897",
      "username": "jorge"
    }
  }
}
```

#### Telegram Bot (Node.js)

```javascript
// telegram-bot.js
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const STATE_DIR = '/tmp/claude-telegram';
const PENDING_FILE = path.join(STATE_DIR, 'pending_questions.json');
const RESPONSES_FILE = path.join(STATE_DIR, 'responses.json');

// Inicializar directorio
async function init() {
  await fs.mkdir(STATE_DIR, { recursive: true });
  await ensureFile(PENDING_FILE, {});
  await ensureFile(RESPONSES_FILE, {});
}

async function ensureFile(filePath, defaultContent) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
  }
}

// Leer archivo JSON
async function readJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

// Escribir archivo JSON
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Mostrar pregunta pendiente al usuario
async function showPendingQuestion(chatId, questionId, questionData) {
  const { question, options } = questionData;

  // Crear inline keyboard con opciones
  const keyboard = options.map((opt, idx) => [{
    text: `${idx + 1}. ${opt.label}`,
    callback_data: `answer_${questionId}_${idx}`
  }]);

  await bot.sendMessage(chatId,
    `🤖 *Claude Code necesita tu decisión:*\n\n${question}`,
    {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    }
  );
}

// Manejar respuestas de botones
bot.on('callback_query', async (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  // Parsear: answer_questionId_optionIndex
  const match = data.match(/^answer_(.+)_(\d+)$/);
  if (!match) return;

  const [, questionId, optionIndex] = match;

  // Leer pregunta
  const pending = await readJSON(PENDING_FILE);
  const question = pending[questionId];

  if (!question) {
    await bot.answerCallbackQuery(query.id, { text: 'Pregunta no encontrada' });
    return;
  }

  // Obtener respuesta seleccionada
  const selectedOption = question.options[parseInt(optionIndex)];

  // Guardar respuesta
  const responses = await readJSON(RESPONSES_FILE);
  responses[questionId] = {
    answer: selectedOption.label,
    answered_at: new Date().toISOString(),
    telegram_user: {
      id: chatId.toString(),
      username: query.from.username
    }
  };
  await writeJSON(RESPONSES_FILE, responses);

  // Actualizar estado de pregunta
  question.status = 'answered';
  await writeJSON(PENDING_FILE, pending);

  // Confirmar al usuario
  await bot.answerCallbackQuery(query.id, {
    text: `✅ Seleccionaste: ${selectedOption.label}`
  });

  await bot.editMessageText(
    `✅ Respondiste: *${selectedOption.label}*\n\nClaude Code continuará trabajando...`,
    {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    }
  );
});

// Polling cada 5 segundos para verificar nuevas preguntas
setInterval(async () => {
  try {
    const pending = await readJSON(PENDING_FILE);

    for (const [questionId, question] of Object.entries(pending)) {
      if (question.status === 'pending') {
        await showPendingQuestion(
          question.telegram_chat_id,
          questionId,
          question
        );

        // Marcar como enviada
        question.status = 'sent';
        await writeJSON(PENDING_FILE, pending);
      }
    }
  } catch (err) {
    console.error('Error checking pending questions:', err);
  }
}, 5000);

// Comando /status para ver preguntas pendientes
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const pending = await readJSON(PENDING_FILE);

  const myQuestions = Object.entries(pending)
    .filter(([, q]) => q.telegram_chat_id === chatId.toString() && q.status === 'sent')
    .map(([id, q]) => `• ${q.question}`);

  if (myQuestions.length === 0) {
    await bot.sendMessage(chatId, 'No tienes preguntas pendientes.');
  } else {
    await bot.sendMessage(chatId,
      `Preguntas pendientes:\n${myQuestions.join('\n')}`
    );
  }
});

// Iniciar
init().then(() => {
  console.log('✅ Telegram Bot started - File-based mode');
  console.log(`📁 State directory: ${STATE_DIR}`);
});
```

#### Claude Code Integration (Bash Script)

```bash
#!/bin/bash
# claude-telegram-ask.sh
# Usar desde Claude Code para hacer preguntas

STATE_DIR="/tmp/claude-telegram"
PENDING_FILE="$STATE_DIR/pending_questions.json"
RESPONSES_FILE="$STATE_DIR/responses.json"
SESSIONS_FILE="$STATE_DIR/sessions.json"

# Generar ID único
QUESTION_ID="q_$(date +%s)_$$"

# Chat ID del usuario (configurado previamente)
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-417821897}"

# Argumentos
QUESTION="$1"
OPTIONS_JSON="$2"  # JSON array: [{"label":"A","description":"..."},...]

# Crear pregunta pendiente
echo "📤 Enviando pregunta a Telegram..."

# Leer archivo actual
if [ ! -f "$PENDING_FILE" ]; then
  echo "{}" > "$PENDING_FILE"
fi

PENDING=$(cat "$PENDING_FILE")

# Agregar nueva pregunta usando jq
NEW_PENDING=$(echo "$PENDING" | jq \
  --arg id "$QUESTION_ID" \
  --arg chat "$TELEGRAM_CHAT_ID" \
  --arg q "$QUESTION" \
  --argjson opts "$OPTIONS_JSON" \
  '.[$id] = {
    telegram_chat_id: $chat,
    question: $q,
    options: $opts,
    status: "pending",
    created_at: now | todate
  }')

echo "$NEW_PENDING" > "$PENDING_FILE"

echo "⏳ Esperando respuesta del usuario..."

# Polling hasta obtener respuesta (timeout 5 minutos)
TIMEOUT=300
ELAPSED=0
INTERVAL=2

while [ $ELAPSED -lt $TIMEOUT ]; do
  # Verificar si hay respuesta
  if [ -f "$RESPONSES_FILE" ]; then
    RESPONSE=$(cat "$RESPONSES_FILE" | jq -r --arg id "$QUESTION_ID" '.[$id].answer // empty')

    if [ ! -z "$RESPONSE" ]; then
      echo "✅ Respuesta recibida: $RESPONSE"

      # Limpiar pregunta respondida
      PENDING=$(cat "$PENDING_FILE" | jq --arg id "$QUESTION_ID" 'del(.[$id])')
      echo "$PENDING" > "$PENDING_FILE"

      RESPONSES=$(cat "$RESPONSES_FILE" | jq --arg id "$QUESTION_ID" 'del(.[$id])')
      echo "$RESPONSES" > "$RESPONSES_FILE"

      # Retornar respuesta
      echo "$RESPONSE"
      exit 0
    fi
  fi

  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))

  # Mostrar progreso cada 10 segundos
  if [ $((ELAPSED % 10)) -eq 0 ]; then
    echo "⏳ Esperando... ($ELAPSED/${TIMEOUT}s)"
  fi
done

echo "❌ Timeout: No se recibió respuesta"
exit 1
```

#### Uso desde Claude Code

Claude Code puede usar el script en un hook personalizado:

```javascript
// .claude/hooks/telegram-ask.js
const { execSync } = require('child_process');

function askViaTelegram(question, options) {
  const optionsJSON = JSON.stringify(options.map(opt => ({
    label: opt.label,
    description: opt.description
  })));

  try {
    const response = execSync(
      `bash claude-telegram-ask.sh "${question}" '${optionsJSON}'`,
      { encoding: 'utf8', timeout: 300000 } // 5 min timeout
    ).trim();

    return response;
  } catch (error) {
    throw new Error(`Telegram ask failed: ${error.message}`);
  }
}

module.exports = { askViaTelegram };
```

---

## 🚀 Opción 2: Redis + WebSocket (Profesional)

### ✅ Ventajas
- **Tiempo real** con WebSocket
- **Escalable** a múltiples usuarios
- **Bajo latencia** (Redis en memoria)
- **Pub/Sub** para notificaciones

### ❌ Desventajas
- **Requiere Redis** instalado
- **Más complejo** de configurar
- **Servidor WebSocket** necesario

### 📐 Arquitectura

```
┌─────────────────────────────────────────────┐
│              REDIS SERVER                    │
│  ┌────────────────────────────────────┐     │
│  │  Keys:                             │     │
│  │    claude:session:{id}             │     │
│  │    claude:question:{id}            │     │
│  │    claude:response:{id}            │     │
│  │                                    │     │
│  │  Pub/Sub Channels:                 │     │
│  │    telegram:questions              │     │
│  │    telegram:responses:{sessionId}  │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
         ↑                          ↑
         │ Redis Client             │ Redis Client
         │                          │
┌────────┴────────┐        ┌────────┴────────┐
│  Claude Code    │        │  WebSocket      │
│   (Subscribe)   │        │    Server       │
└─────────────────┘        └─────────┬───────┘
                                     │
                            ┌────────┴────────┐
                            │  Telegram Bot   │
                            │   (Webhook)     │
                            └─────────────────┘
```

### 🔧 Implementación

#### WebSocket Server (Node.js + Express)

```javascript
// websocket-server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Redis clients
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisSub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Mapeo: socket.id -> Claude session
const claudeSockets = new Map();

// ========= WebSocket Handlers =========

io.on('connection', (socket) => {
  console.log(`✅ Claude Code connected: ${socket.id}`);

  // Registrar sesión de Claude
  socket.on('register_claude', async (data) => {
    const { sessionId, telegramChatId } = data;

    claudeSockets.set(socket.id, { sessionId, telegramChatId });

    // Guardar en Redis
    await redis.set(
      `claude:session:${sessionId}`,
      JSON.stringify({ socketId: socket.id, telegramChatId }),
      'EX', 3600 // Expira en 1 hora
    );

    // Suscribirse a respuestas para esta sesión
    await redisSub.subscribe(`telegram:responses:${sessionId}`);

    socket.emit('registered', { sessionId });
    console.log(`📝 Claude session registered: ${sessionId}`);
  });

  // Claude hace una pregunta
  socket.on('ask_question', async (data) => {
    const { questionId, question, options, sessionId } = data;
    const sessionData = claudeSockets.get(socket.id);

    if (!sessionData) {
      socket.emit('error', { message: 'Session not registered' });
      return;
    }

    // Guardar pregunta en Redis
    await redis.set(
      `claude:question:${questionId}`,
      JSON.stringify({
        sessionId,
        telegramChatId: sessionData.telegramChatId,
        question,
        options,
        status: 'pending',
        createdAt: new Date().toISOString()
      }),
      'EX', 600 // 10 minutos
    );

    // Publicar para que el bot envíe la pregunta
    await redis.publish('telegram:questions', JSON.stringify({
      questionId,
      telegramChatId: sessionData.telegramChatId,
      question,
      options
    }));

    socket.emit('question_sent', { questionId });
  });

  socket.on('disconnect', () => {
    const sessionData = claudeSockets.get(socket.id);
    if (sessionData) {
      redisSub.unsubscribe(`telegram:responses:${sessionData.sessionId}`);
      console.log(`❌ Claude disconnected: ${sessionData.sessionId}`);
    }
    claudeSockets.delete(socket.id);
  });
});

// ========= Redis Pub/Sub Handler =========

redisSub.on('message', async (channel, message) => {
  if (channel.startsWith('telegram:responses:')) {
    const sessionId = channel.split(':')[2];
    const response = JSON.parse(message);

    // Encontrar socket de Claude
    const socketId = await redis.get(`claude:session:${sessionId}`);
    if (socketId) {
      const socket = io.sockets.sockets.get(JSON.parse(socketId).socketId);
      if (socket) {
        socket.emit('answer_received', response);
      }
    }
  }
});

// ========= Telegram Bot Handlers =========

// Suscribirse a preguntas
(async () => {
  await redis.subscribe('telegram:questions');

  redis.on('message', async (channel, message) => {
    if (channel === 'telegram:questions') {
      const { questionId, telegramChatId, question, options } = JSON.parse(message);

      // Crear inline keyboard
      const keyboard = options.map((opt, idx) => [{
        text: `${idx + 1}. ${opt.label}`,
        callback_data: `ans_${questionId}_${idx}`
      }]);

      await bot.sendMessage(
        telegramChatId,
        `🤖 *Claude Code necesita tu decisión:*\n\n${question}`,
        {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        }
      );
    }
  });
})();

// Manejar respuestas
bot.on('callback_query', async (query) => {
  const match = query.data.match(/^ans_(.+)_(\d+)$/);
  if (!match) return;

  const [, questionId, optionIndex] = match;

  // Obtener pregunta
  const questionData = await redis.get(`claude:question:${questionId}`);
  if (!questionData) {
    await bot.answerCallbackQuery(query.id, { text: 'Pregunta no encontrada' });
    return;
  }

  const question = JSON.parse(questionData);
  const selectedOption = question.options[parseInt(optionIndex)];

  // Guardar respuesta
  await redis.set(
    `claude:response:${questionId}`,
    JSON.stringify({
      answer: selectedOption.label,
      answeredAt: new Date().toISOString(),
      telegramUser: query.from
    }),
    'EX', 600
  );

  // Publicar respuesta al canal de la sesión
  await redis.publish(
    `telegram:responses:${question.sessionId}`,
    JSON.stringify({
      questionId,
      answer: selectedOption.label,
      option: selectedOption
    })
  );

  // Confirmar
  await bot.answerCallbackQuery(query.id, {
    text: `✅ ${selectedOption.label}`
  });

  await bot.editMessageText(
    `✅ Respondiste: *${selectedOption.label}*`,
    {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    }
  );
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ WebSocket server running on port ${PORT}`);
  console.log(`📡 Redis connected`);
  console.log(`🤖 Telegram bot active`);
});
```

#### Claude Code Client (Node.js)

```javascript
// claude-telegram-client.js
const io = require('socket.io-client');
const crypto = require('crypto');

class ClaudeTelegramClient {
  constructor(serverUrl, sessionId, telegramChatId) {
    this.serverUrl = serverUrl;
    this.sessionId = sessionId;
    this.telegramChatId = telegramChatId;
    this.socket = null;
    this.pendingQuestions = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl);

      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server');

        this.socket.emit('register_claude', {
          sessionId: this.sessionId,
          telegramChatId: this.telegramChatId
        });
      });

      this.socket.on('registered', () => {
        console.log(`📝 Registered as session: ${this.sessionId}`);
        resolve();
      });

      this.socket.on('answer_received', (data) => {
        const { questionId, answer, option } = data;
        const resolver = this.pendingQuestions.get(questionId);

        if (resolver) {
          resolver(option);
          this.pendingQuestions.delete(questionId);
        }
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        reject(error);
      });

      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });
  }

  async askQuestion(question, options, timeout = 300000) {
    const questionId = `q_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    return new Promise((resolve, reject) => {
      // Timeout handler
      const timeoutId = setTimeout(() => {
        this.pendingQuestions.delete(questionId);
        reject(new Error('Question timeout'));
      }, timeout);

      // Resolver
      this.pendingQuestions.set(questionId, (answer) => {
        clearTimeout(timeoutId);
        resolve(answer);
      });

      // Enviar pregunta
      this.socket.emit('ask_question', {
        questionId,
        sessionId: this.sessionId,
        question,
        options
      });

      console.log(`📤 Question sent: ${questionId}`);
      console.log(`⏳ Waiting for answer...`);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('❌ Disconnected from WebSocket server');
    }
  }
}

// Ejemplo de uso
async function example() {
  const client = new ClaudeTelegramClient(
    'http://localhost:3000',
    'session_12345',
    '417821897'
  );

  await client.connect();

  const answer = await client.askQuestion(
    '¿Qué librería de UI prefieres?',
    [
      { label: 'Material-UI', description: 'Componentes React robustos' },
      { label: 'Ant Design', description: 'Enterprise UI design' },
      { label: 'Chakra UI', description: 'Simple y accesible' }
    ]
  );

  console.log(`✅ Usuario eligió: ${answer.label}`);

  client.disconnect();
}

module.exports = ClaudeTelegramClient;
```

---

## 💾 Opción 3: Database + Polling (Escalable)

### ✅ Ventajas
- **Muy escalable** a múltiples usuarios y sesiones
- **Persistente** (no se pierde en restart)
- **Auditable** (historial completo)
- **Robusto** ante fallos

### ❌ Desventajas
- **Requiere base de datos** (PostgreSQL/MongoDB)
- **Mayor latencia** que Redis
- **Setup más complejo**

### 📐 Arquitectura

```
┌────────────────────────────────────────────────────┐
│           DATABASE (PostgreSQL / MongoDB)           │
│                                                     │
│  Tables/Collections:                                │
│    • claude_sessions                                │
│    • telegram_questions                             │
│    • telegram_responses                             │
│    • audit_log                                      │
└────────────────────────────────────────────────────┘
         ↑                                  ↑
         │ SQL/NoSQL                        │ SQL/NoSQL
         │                                  │
┌────────┴────────┐              ┌────────┴────────┐
│  Claude Code    │              │  Telegram Bot   │
│   (Polling)     │              │    (Webhook)    │
│                 │              │                 │
│  poll_interval  │              │  INSERT/UPDATE  │
│  = 2 seconds    │              │                 │
└─────────────────┘              └─────────────────┘
```

### 🗄️ Database Schema

#### PostgreSQL Schema

```sql
-- Sessions de Claude Code
CREATE TABLE claude_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_chat_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE INDEX idx_sessions_telegram ON claude_sessions(telegram_chat_id);
CREATE INDEX idx_sessions_status ON claude_sessions(status);

-- Preguntas pendientes
CREATE TABLE telegram_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES claude_sessions(id) ON DELETE CASCADE,
  telegram_chat_id BIGINT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- [{"label":"A","description":"..."}]
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  answered_at TIMESTAMP
);

CREATE INDEX idx_questions_session ON telegram_questions(session_id);
CREATE INDEX idx_questions_status ON telegram_questions(status);

-- Respuestas
CREATE TABLE telegram_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES telegram_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  selected_option JSONB,
  telegram_user JSONB, -- {"id": 123, "username": "jorge"}
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_responses_question ON telegram_responses(question_id);

-- Audit log
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES claude_sessions(id),
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_session ON audit_log(session_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

### 🔧 Implementación (Node.js + PostgreSQL)

#### Database Helper

```javascript
// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class ClaudeTelegramDB {
  // Crear sesión
  async createSession(telegramChatId, metadata = {}) {
    const result = await pool.query(
      `INSERT INTO claude_sessions (telegram_chat_id, metadata)
       VALUES ($1, $2)
       RETURNING *`,
      [telegramChatId, JSON.stringify(metadata)]
    );
    return result.rows[0];
  }

  // Crear pregunta
  async createQuestion(sessionId, telegramChatId, question, options) {
    const result = await pool.query(
      `INSERT INTO telegram_questions
        (session_id, telegram_chat_id, question, options)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sessionId, telegramChatId, question, JSON.stringify(options)]
    );
    return result.rows[0];
  }

  // Obtener preguntas pendientes
  async getPendingQuestions(telegramChatId) {
    const result = await pool.query(
      `SELECT * FROM telegram_questions
       WHERE telegram_chat_id = $1
         AND status = 'pending'
       ORDER BY created_at ASC`,
      [telegramChatId]
    );
    return result.rows;
  }

  // Marcar pregunta como enviada
  async markQuestionSent(questionId) {
    await pool.query(
      `UPDATE telegram_questions
       SET status = 'sent', sent_at = NOW()
       WHERE id = $1`,
      [questionId]
    );
  }

  // Guardar respuesta
  async saveResponse(questionId, answer, selectedOption, telegramUser) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insertar respuesta
      await client.query(
        `INSERT INTO telegram_responses
          (question_id, answer, selected_option, telegram_user)
         VALUES ($1, $2, $3, $4)`,
        [
          questionId,
          answer,
          JSON.stringify(selectedOption),
          JSON.stringify(telegramUser)
        ]
      );

      // Actualizar pregunta
      await client.query(
        `UPDATE telegram_questions
         SET status = 'answered', answered_at = NOW()
         WHERE id = $1`,
        [questionId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Polling: obtener respuesta para una pregunta
  async getResponse(questionId) {
    const result = await pool.query(
      `SELECT r.*, q.status as question_status
       FROM telegram_responses r
       JOIN telegram_questions q ON q.id = r.question_id
       WHERE r.question_id = $1`,
      [questionId]
    );
    return result.rows[0] || null;
  }

  // Limpiar sesiones expiradas
  async cleanupExpiredSessions() {
    await pool.query(
      `DELETE FROM claude_sessions
       WHERE expires_at < NOW()
         AND status != 'completed'`
    );
  }
}

module.exports = new ClaudeTelegramDB();
```

#### Telegram Bot con Database

```javascript
// telegram-bot-db.js
const TelegramBot = require('node-telegram-bot-api');
const db = require('./db');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Polling cada 3 segundos para verificar preguntas pendientes
setInterval(async () => {
  try {
    // Obtener todos los chats con preguntas pendientes
    const questions = await db.getPendingQuestions();

    for (const question of questions) {
      const { id, telegram_chat_id, question: text, options } = question;

      // Crear keyboard
      const keyboard = JSON.parse(options).map((opt, idx) => [{
        text: `${idx + 1}. ${opt.label}`,
        callback_data: `ans_${id}_${idx}`
      }]);

      await bot.sendMessage(
        telegram_chat_id,
        `🤖 *Claude Code necesita tu decisión:*\n\n${text}`,
        {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        }
      );

      // Marcar como enviada
      await db.markQuestionSent(id);
    }
  } catch (err) {
    console.error('Error checking questions:', err);
  }
}, 3000);

// Manejar respuestas
bot.on('callback_query', async (query) => {
  const match = query.data.match(/^ans_(.+)_(\d+)$/);
  if (!match) return;

  const [, questionId, optionIndex] = match;

  // Obtener pregunta de DB
  const question = await pool.query(
    'SELECT * FROM telegram_questions WHERE id = $1',
    [questionId]
  );

  if (question.rows.length === 0) {
    await bot.answerCallbackQuery(query.id, { text: 'Pregunta no encontrada' });
    return;
  }

  const options = JSON.parse(question.rows[0].options);
  const selectedOption = options[parseInt(optionIndex)];

  // Guardar respuesta
  await db.saveResponse(
    questionId,
    selectedOption.label,
    selectedOption,
    {
      id: query.from.id,
      username: query.from.username,
      first_name: query.from.first_name
    }
  );

  // Confirmar
  await bot.answerCallbackQuery(query.id, {
    text: `✅ ${selectedOption.label}`
  });

  await bot.editMessageText(
    `✅ Respondiste: *${selectedOption.label}*`,
    {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    }
  );
});

console.log('✅ Telegram Bot with Database started');
```

#### Claude Code Client con Database

```javascript
// claude-telegram-db-client.js
const db = require('./db');

class ClaudeTelegramDBClient {
  constructor(telegramChatId) {
    this.telegramChatId = telegramChatId;
    this.session = null;
  }

  async initialize() {
    this.session = await db.createSession(this.telegramChatId, {
      started_by: 'claude_code',
      version: '1.0'
    });
    console.log(`✅ Session created: ${this.session.id}`);
  }

  async askQuestion(question, options, timeout = 300000) {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    // Crear pregunta en DB
    const questionRecord = await db.createQuestion(
      this.session.id,
      this.telegramChatId,
      question,
      options
    );

    console.log(`📤 Question created: ${questionRecord.id}`);
    console.log(`⏳ Waiting for answer (timeout: ${timeout / 1000}s)...`);

    // Polling hasta obtener respuesta
    const startTime = Date.now();
    const pollInterval = 2000; // 2 segundos

    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          const response = await db.getResponse(questionRecord.id);

          if (response && response.question_status === 'answered') {
            clearInterval(intervalId);
            console.log(`✅ Answer received: ${response.answer}`);
            resolve(JSON.parse(response.selected_option));
          }

          // Verificar timeout
          if (Date.now() - startTime > timeout) {
            clearInterval(intervalId);
            reject(new Error('Question timeout'));
          }
        } catch (err) {
          clearInterval(intervalId);
          reject(err);
        }
      }, pollInterval);
    });
  }

  async close() {
    if (this.session) {
      await pool.query(
        'UPDATE claude_sessions SET status = $1 WHERE id = $2',
        ['completed', this.session.id]
      );
      console.log('✅ Session closed');
    }
  }
}

// Ejemplo de uso
async function example() {
  const client = new ClaudeTelegramDBClient('417821897');
  await client.initialize();

  try {
    const answer = await client.askQuestion(
      '¿Qué librería de UI prefieres?',
      [
        { label: 'Material-UI', description: 'Componentes React robustos' },
        { label: 'Ant Design', description: 'Enterprise UI design' }
      ]
    );

    console.log(`Usuario eligió: ${answer.label}`);
  } finally {
    await client.close();
  }
}

module.exports = ClaudeTelegramDBClient;
```

---

## 📊 Comparación de Opciones

| Criterio | File-Based | Redis + WebSocket | Database + Polling |
|----------|------------|-------------------|-------------------|
| **Complejidad** | ⭐ Muy simple | ⭐⭐⭐ Media | ⭐⭐⭐⭐ Alta |
| **Setup** | Ninguno | Redis + Server | DB + Server |
| **Latencia** | ~5s | <1s (real-time) | ~2-3s |
| **Escalabilidad** | ❌ 1 usuario | ✅ Múltiple | ✅✅ Muy escalable |
| **Persistencia** | ❌ Temporal | ❌ En memoria | ✅ Permanente |
| **Costo** | $0 | Redis hosting | DB hosting |
| **Debugging** | ✅ Fácil | ⭐⭐ Medio | ⭐⭐⭐ Logs complejos |
| **Notificaciones** | ❌ Polling | ✅ WebSocket | ❌ Polling |
| **Historial** | ❌ No | ❌ No | ✅ Auditable |
| **Race conditions** | ⚠️ Posible | ✅ Seguro | ✅ Transacciones |
| **Multi-tenant** | ❌ No | ✅ Sí | ✅✅ Completo |

---

## 🏆 Implementación Recomendada

### Para Uso Personal (1 usuario):
**→ Opción 1: File-Based State**

**Razones:**
- ✅ Extremadamente simple (1 archivo JS + 1 bash script)
- ✅ No requiere infraestructura externa
- ✅ Suficiente para desarrollo personal
- ✅ Fácil debugging
- ✅ Costo: $0

**Limitaciones aceptables:**
- Solo 1 usuario (tú)
- Latencia de 5 segundos (aceptable)
- No persiste entre reinicios (ok para dev)

### Para Producción (múltiples usuarios):
**→ Opción 3: Database + Polling**

**Razones:**
- ✅ Escalable a N usuarios
- ✅ Historial y auditoría completa
- ✅ Robusto ante fallos
- ✅ Fácil mantenimiento
- ✅ Latencia aceptable (2-3s)

**Cuando usar Opción 2 (Redis):**
- Necesitas < 1s de latencia
- Tienes experiencia con Redis
- No necesitas historial permanente

---

## 🚀 Plan de Implementación Sugerido

### Fase 1: Prototipo (File-Based) - 2 horas
1. Crear bot de Telegram
2. Implementar polling de archivos JSON
3. Crear script bash para Claude
4. Probar con ejemplos simples

### Fase 2: Integración Claude Code - 3 horas
1. Crear hook personalizado
2. Modificar AskUserQuestion para usar Telegram
3. Implementar timeout y fallback
4. Documentar uso

### Fase 3: Mejoras (Opcional) - 4 horas
1. Migrar a Database si es necesario
2. Agregar UI web para monitoreo
3. Implementar analytics
4. Agregar más comandos de Telegram

---

## 🎯 Siguiente Paso

**¿Quieres que implemente la Opción 1 (File-Based) para tu uso personal?**

Puedo crear:
1. ✅ Bot de Telegram completo (Node.js)
2. ✅ Script bash para Claude Code
3. ✅ Hook personalizado para integración
4. ✅ Documentación de uso
5. ✅ Ejemplos de prueba

**Tiempo estimado:** 30-40 minutos de implementación + 15 minutos de pruebas

¿Procedemos? 🚀
