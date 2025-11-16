#!/usr/bin/env node
/**
 * 🤖 Telegram Bot Bidireccional para Claude Code
 *
 * Este bot permite que Claude Code haga preguntas y reciba respuestas desde Telegram
 * Arquitectura: File-Based State (archivos JSON como estado compartido)
 *
 * Autor: Claude Code
 * Versión: 1.0.0
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');

// ============================================
// CONFIGURACIÓN
// ============================================

const STATE_DIR = path.join(process.env.HOME, '.claude-telegram');
const PENDING_FILE = path.join(STATE_DIR, 'pending_questions.json');
const RESPONSES_FILE = path.join(STATE_DIR, 'responses.json');
const SESSIONS_FILE = path.join(STATE_DIR, 'sessions.json');
const OUTGOING_FILE = path.join(STATE_DIR, 'outgoing_messages.json');

// Leer variables de entorno del archivo .env si existe
const envPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Validar configuración
if (!BOT_TOKEN) {
  console.error('❌ ERROR: TELEGRAM_BOT_TOKEN no está configurado');
  console.error('💡 Configúralo en el archivo .env o como variable de entorno');
  process.exit(1);
}

if (!CHAT_ID) {
  console.warn('⚠️  WARNING: TELEGRAM_CHAT_ID no está configurado');
  console.warn('💡 Usa /start en Telegram para obtener tu Chat ID');
}

// Crear bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ============================================
// UTILIDADES PARA ARCHIVOS JSON
// ============================================

/**
 * Asegura que un directorio existe
 */
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Asegura que un archivo existe con contenido por defecto
 */
async function ensureFile(filePath, defaultContent = {}) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
  }
}

/**
 * Lee un archivo JSON de forma segura
 */
async function readJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return {};
  }
}

/**
 * Escribe un archivo JSON de forma segura
 */
async function writeJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

async function init() {
  console.log('🚀 Inicializando Telegram Bot...');

  await ensureDir(STATE_DIR);
  await ensureFile(PENDING_FILE, {});
  await ensureFile(RESPONSES_FILE, {});
  await ensureFile(SESSIONS_FILE, {});
  await ensureFile(OUTGOING_FILE, {});
  await ensureFile(path.join(STATE_DIR, 'suggestions.json'), {});

  console.log(`✅ Estado inicializado en: ${STATE_DIR}`);
}

// ============================================
// FUNCIONES DE NEGOCIO
// ============================================

/**
 * Muestra una pregunta pendiente al usuario con botones inline
 */
async function showPendingQuestion(chatId, questionId, questionData) {
  const { question, options } = questionData;

  // Crear inline keyboard con botones
  const keyboard = options.map((opt, idx) => [{
    text: `${idx + 1}. ${opt.label}`,
    callback_data: `answer_${questionId}_${idx}`
  }]);

  try {
    await bot.sendMessage(
      chatId,
      `🤖 *Claude Code necesita tu decisión:*\n\n${question}\n\n_Selecciona una opción:_`,
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      }
    );

    console.log(`📤 Pregunta enviada a chat ${chatId}: ${questionId}`);
  } catch (err) {
    console.error(`Error enviando pregunta a ${chatId}:`, err.message);
  }
}

/**
 * Envía un mensaje markdown a Telegram
 */
async function sendMarkdownMessage(chatId, messageId, messageData) {
  const { content, metadata } = messageData;

  try {
    // Enviar mensaje con formato Markdown
    await bot.sendMessage(chatId, content, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    // Si es parte de un mensaje multi-parte, mostrar progreso
    if (metadata.total && metadata.total > 1) {
      console.log(`📤 Parte ${metadata.part}/${metadata.total} enviada a chat ${chatId}: ${messageId}`);
    } else {
      console.log(`📤 Mensaje enviado a chat ${chatId}: ${messageId}`);
    }
  } catch (err) {
    console.error(`Error enviando mensaje a ${chatId}:`, err.message);
    throw err;
  }
}

/**
 * Obtiene el número de preguntas pendientes para un chat
 */
async function getPendingCount(chatId) {
  const pending = await readJSON(PENDING_FILE);
  return Object.values(pending).filter(
    q => q.telegram_chat_id === chatId.toString() && q.status === 'pending'
  ).length;
}

// ============================================
// COMANDO /start
// ============================================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;

  await bot.sendMessage(
    chatId,
    `👋 ¡Hola ${username}!\n\n` +
    `🤖 Soy el bot de *Claude Code Bidireccional*\n\n` +
    `📝 *Tu Chat ID:* \`${chatId}\`\n\n` +
    `💡 *Cómo funciona:*\n` +
    `• Claude Code puede hacerte preguntas\n` +
    `• Recibirás notificaciones aquí\n` +
    `• Responde con los botones\n` +
    `• Claude continuará con tu decisión\n\n` +
    `⚙️ *Comandos disponibles:*\n` +
    `/start - Mostrar este mensaje\n` +
    `/status - Ver preguntas pendientes\n` +
    `/help - Ayuda\n` +
    `/chatid - Ver tu Chat ID`,
    { parse_mode: 'Markdown' }
  );

  // Guardar sesión
  const sessions = await readJSON(SESSIONS_FILE);
  sessions[chatId] = {
    username,
    first_seen: sessions[chatId]?.first_seen || new Date().toISOString(),
    last_seen: new Date().toISOString()
  };
  await writeJSON(SESSIONS_FILE, sessions);
});

// ============================================
// COMANDO /chatid
// ============================================

bot.onText(/\/chatid/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `🆔 *Tu Chat ID:*\n\`${chatId}\`\n\n` +
    `💡 *Para configurarlo:*\n` +
    `1. Agrega esta línea a tu \`.env\`:\n` +
    `\`\`\`\nTELEGRAM_CHAT_ID=${chatId}\n\`\`\`\n` +
    `2. O exporta como variable de entorno:\n` +
    `\`\`\`bash\nexport TELEGRAM_CHAT_ID="${chatId}"\n\`\`\``,
    { parse_mode: 'Markdown' }
  );
});

// ============================================
// COMANDO /status
// ============================================

bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const pending = await readJSON(PENDING_FILE);

  const myQuestions = Object.entries(pending)
    .filter(([, q]) => q.telegram_chat_id === chatId.toString())
    .map(([id, q]) => ({
      id,
      question: q.question,
      status: q.status,
      created: new Date(q.created_at).toLocaleString('es-ES')
    }));

  if (myQuestions.length === 0) {
    await bot.sendMessage(chatId, '✅ No tienes preguntas pendientes.');
    return;
  }

  const statusEmoji = {
    pending: '⏳',
    sent: '📤',
    answered: '✅'
  };

  const message = myQuestions
    .map(q =>
      `${statusEmoji[q.status]} *${q.status.toUpperCase()}*\n` +
      `   ${q.question}\n` +
      `   _Creada: ${q.created}_`
    )
    .join('\n\n');

  await bot.sendMessage(
    chatId,
    `📋 *Tus preguntas:*\n\n${message}`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================
// COMANDO /help
// ============================================

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `📚 *Ayuda - Telegram Bot Bidireccional*\n\n` +
    `🎯 *Propósito:*\n` +
    `Permite que Claude Code te haga preguntas y reciba tus respuestas en tiempo real.\n\n` +
    `💬 *Comandos:*\n` +
    `/start - Iniciar el bot\n` +
    `/status - Ver preguntas pendientes\n` +
    `/chatid - Obtener tu Chat ID\n` +
    `/help - Esta ayuda\n\n` +
    `🔧 *Configuración:*\n` +
    `1. Obtén tu Chat ID con \`/chatid\`\n` +
    `2. Configúralo en \`.env\`\n` +
    `3. Claude Code podrá hacerte preguntas\n\n` +
    `📖 *Más info:*\n` +
    `Lee \`TELEGRAM_BIDIRECCIONAL_SETUP.md\``,
    { parse_mode: 'Markdown' }
  );
});

// ============================================
// HANDLER DE MENSAJES DE TEXTO LIBRE
// ============================================

const SUGGESTIONS_FILE = path.join(STATE_DIR, 'suggestions.json');

bot.on('message', async (msg) => {
  // Ignorar comandos (ya manejados por onText)
  if (msg.text && msg.text.startsWith('/')) return;

  // Ignorar mensajes sin texto
  if (!msg.text) return;

  const chatId = msg.chat.id;
  const text = msg.text;
  const username = msg.from.username || msg.from.first_name;

  console.log(`💬 Mensaje recibido de ${username} (${chatId}): ${text}`);

  // PRIMERO: Verificar si hay una pregunta pendiente para este chat
  const pending = await readJSON(PENDING_FILE);
  const pendingQuestions = Object.entries(pending)
    .filter(([, q]) => q.telegram_chat_id === chatId.toString() && !q.answered);

  if (pendingQuestions.length > 0) {
    // Hay pregunta pendiente - usar este texto como respuesta personalizada
    const [questionId, questionData] = pendingQuestions[0];

    console.log(`📝 Respuesta de texto libre para pregunta: ${questionId}`);

    // Guardar respuesta personalizada
    const responses = await readJSON(RESPONSES_FILE);
    responses[questionId] = {
      question_id: questionId,
      answer: {
        label: text,  // El texto libre es el label
        description: 'Respuesta personalizada del usuario'
      },
      answered_at: new Date().toISOString()
    };

    await writeJSON(RESPONSES_FILE, responses);

    // Marcar pregunta como respondida
    pending[questionId].answered = true;
    await writeJSON(PENDING_FILE, pending);

    // Confirmar al usuario
    await bot.sendMessage(
      chatId,
      `✅ *Respuesta registrada:*\n\n"${text}"\n\n🤖 Claude Code continuará con tu decisión.`,
      { parse_mode: 'Markdown' }
    );

    console.log(`✅ Respuesta personalizada guardada para: ${questionId}`);
    return;
  }

  // SEGUNDO: Si no hay pregunta pendiente, guardar como sugerencia
  const suggestions = await readJSON(SUGGESTIONS_FILE);
  const suggestionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  suggestions[suggestionId] = {
    id: suggestionId,
    chat_id: chatId.toString(),
    username,
    text,
    timestamp: new Date().toISOString(),
    read: false
  };

  await writeJSON(SUGGESTIONS_FILE, suggestions);

  // Confirmar recepción
  await bot.sendMessage(
    chatId,
    `✅ Sugerencia recibida:\n\n"${text}"\n\n🤖 Claude Code la procesará en la próxima iteración.`,
    { parse_mode: 'Markdown' }
  );

  console.log(`✅ Sugerencia guardada: ${suggestionId}`);
});

// ============================================
// HANDLER DE RESPUESTAS (CALLBACK QUERY)
// ============================================

bot.on('callback_query', async (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  // Parsear: answer_questionId_optionIndex
  const match = data.match(/^answer_(.+)_(\d+)$/);
  if (!match) {
    await bot.answerCallbackQuery(query.id, { text: '❌ Formato inválido' });
    return;
  }

  const [, questionId, optionIndex] = match;

  // Leer pregunta
  const pending = await readJSON(PENDING_FILE);
  const question = pending[questionId];

  if (!question) {
    await bot.answerCallbackQuery(query.id, { text: '❌ Pregunta no encontrada' });
    return;
  }

  // Obtener opción seleccionada
  const selectedOption = question.options[parseInt(optionIndex)];

  if (!selectedOption) {
    await bot.answerCallbackQuery(query.id, { text: '❌ Opción inválida' });
    return;
  }

  // Guardar respuesta
  const responses = await readJSON(RESPONSES_FILE);
  responses[questionId] = {
    answer: selectedOption.label,
    option_index: parseInt(optionIndex),
    selected_option: selectedOption,
    answered_at: new Date().toISOString(),
    telegram_user: {
      id: chatId.toString(),
      username: query.from.username,
      first_name: query.from.first_name
    }
  };
  await writeJSON(RESPONSES_FILE, responses);

  // Actualizar estado de pregunta a "answered"
  question.status = 'answered';
  question.answered_at = new Date().toISOString();
  await writeJSON(PENDING_FILE, pending);

  // Confirmar al usuario (popup)
  await bot.answerCallbackQuery(query.id, {
    text: `✅ Seleccionaste: ${selectedOption.label}`
  });

  // Actualizar mensaje
  await bot.editMessageText(
    `✅ *Pregunta respondida*\n\n` +
    `❓ ${question.question}\n\n` +
    `💡 *Tu respuesta:* ${selectedOption.label}\n\n` +
    `🤖 Claude Code continuará trabajando...`,
    {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    }
  );

  console.log(`✅ Respuesta guardada: ${questionId} -> ${selectedOption.label}`);
});

// ============================================
// POLLING DE PREGUNTAS PENDIENTES
// ============================================

/**
 * Verifica cada 3 segundos si hay nuevas preguntas pendientes
 */
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
        question.sent_at = new Date().toISOString();
        await writeJSON(PENDING_FILE, pending);
      }
    }
  } catch (err) {
    console.error('Error en polling de preguntas:', err.message);
  }
}, 3000); // 3 segundos

// ============================================
// POLLING DE MENSAJES SALIENTES
// ============================================

/**
 * Verifica cada 3 segundos si hay mensajes markdown para enviar
 */
setInterval(async () => {
  try {
    const outgoing = await readJSON(OUTGOING_FILE);

    for (const [messageId, message] of Object.entries(outgoing)) {
      if (message.status === 'pending') {
        await sendMarkdownMessage(
          message.telegram_chat_id,
          messageId,
          message
        );

        // Marcar como enviado y limpiar
        delete outgoing[messageId];
        await writeJSON(OUTGOING_FILE, outgoing);
      }
    }
  } catch (err) {
    console.error('Error en polling de mensajes:', err.message);
  }
}, 3000); // 3 segundos

// ============================================
// LIMPIEZA PERIÓDICA
// ============================================

/**
 * Limpia preguntas respondidas cada 5 minutos
 */
setInterval(async () => {
  try {
    const pending = await readJSON(PENDING_FILE);
    const responses = await readJSON(RESPONSES_FILE);

    const now = new Date();
    let cleanedQuestions = 0;
    let cleanedResponses = 0;

    // Limpiar preguntas respondidas hace más de 10 minutos
    for (const [questionId, question] of Object.entries(pending)) {
      if (question.status === 'answered' && question.answered_at) {
        const answeredAt = new Date(question.answered_at);
        const minutesAgo = (now - answeredAt) / 1000 / 60;

        if (minutesAgo > 10) {
          delete pending[questionId];
          cleanedQuestions++;
        }
      }
    }

    // Limpiar respuestas huérfanas (sin pregunta)
    for (const [questionId] of Object.entries(responses)) {
      if (!pending[questionId]) {
        delete responses[questionId];
        cleanedResponses++;
      }
    }

    if (cleanedQuestions > 0 || cleanedResponses > 0) {
      await writeJSON(PENDING_FILE, pending);
      await writeJSON(RESPONSES_FILE, responses);
      console.log(`🧹 Limpieza: ${cleanedQuestions} preguntas, ${cleanedResponses} respuestas`);
    }
  } catch (err) {
    console.error('Error en limpieza:', err.message);
  }
}, 300000); // 5 minutos

// ============================================
// MANEJO DE ERRORES
// ============================================

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('SIGINT', async () => {
  console.log('\n\n👋 Deteniendo bot...');
  await bot.stopPolling();
  process.exit(0);
});

// ============================================
// INICIO
// ============================================

init().then(() => {
  console.log('');
  console.log('✅ Telegram Bot iniciado correctamente');
  console.log(`📁 Directorio de estado: ${STATE_DIR}`);
  console.log(`🤖 Bot Token: ${BOT_TOKEN.substring(0, 20)}...`);
  console.log(`💬 Chat ID configurado: ${CHAT_ID || 'No configurado'}`);
  console.log('');
  console.log('🔄 Polling activo - Esperando preguntas...');
  console.log('');
  console.log('💡 Comandos disponibles en Telegram:');
  console.log('   /start   - Iniciar bot');
  console.log('   /chatid  - Obtener Chat ID');
  console.log('   /status  - Ver preguntas pendientes');
  console.log('   /help    - Ayuda');
  console.log('');
  console.log('⏹️  Presiona Ctrl+C para detener');
  console.log('');
}).catch(err => {
  console.error('❌ Error fatal al iniciar:', err);
  process.exit(1);
});
