/**
 * 🤖 Claude Telegram Client
 *
 * Cliente Node.js para que Claude Code haga preguntas vía Telegram
 * Arquitectura: File-Based State
 *
 * Autor: Claude Code
 * Versión: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Leer .env
const envPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

const STATE_DIR = path.join(process.env.HOME, '.claude-telegram');
const PENDING_FILE = path.join(STATE_DIR, 'pending_questions.json');
const RESPONSES_FILE = path.join(STATE_DIR, 'responses.json');
const OUTGOING_FILE = path.join(STATE_DIR, 'outgoing_messages.json');

/**
 * Cliente para interactuar con Telegram vía archivos JSON
 */
class ClaudeTelegramClient {
  constructor(telegramChatId = null) {
    this.telegramChatId = telegramChatId || process.env.TELEGRAM_CHAT_ID;

    if (!this.telegramChatId) {
      throw new Error('TELEGRAM_CHAT_ID no está configurado');
    }

    this.pendingQuestions = new Map();
  }

  /**
   * Inicializa el cliente (crea directorios y archivos si no existen)
   */
  async initialize() {
    try {
      await fs.mkdir(STATE_DIR, { recursive: true });

      // Asegurar que los archivos existan
      await this._ensureFile(PENDING_FILE, {});
      await this._ensureFile(RESPONSES_FILE, {});
      await this._ensureFile(OUTGOING_FILE, {});

      console.log(`✅ Cliente inicializado (Chat ID: ${this.telegramChatId})`);
    } catch (err) {
      throw new Error(`Error inicializando cliente: ${err.message}`);
    }
  }

  /**
   * Hace una pregunta vía Telegram y espera respuesta
   *
   * @param {string} question - La pregunta
   * @param {Array} options - Array de opciones [{label, description}]
   * @param {number} timeout - Timeout en ms (default: 300000 = 5 min)
   * @returns {Promise<Object>} Opción seleccionada
   */
  async askQuestion(question, options, timeout = 300000) {
    const questionId = this._generateQuestionId();

    console.log('');
    console.log('════════════════════════════════════════════════');
    console.log('📤 Enviando pregunta a Telegram...');
    console.log('════════════════════════════════════════════════');
    console.log('');
    console.log(`❓ Pregunta: ${question}`);
    console.log(`🆔 Question ID: ${questionId}`);
    console.log(`💬 Chat ID: ${this.telegramChatId}`);
    console.log(`⏱️  Timeout: ${timeout / 1000}s`);
    console.log('');

    try {
      // Crear pregunta pendiente
      await this._createPendingQuestion(questionId, question, options);

      // Esperar respuesta
      const response = await this._waitForResponse(questionId, timeout);

      console.log('');
      console.log('════════════════════════════════════════════════');
      console.log(`✅ Respuesta recibida: ${response.label}`);
      console.log('════════════════════════════════════════════════');
      console.log('');

      return response;
    } catch (err) {
      // Limpiar pregunta en caso de error
      await this._cleanupQuestion(questionId);
      throw err;
    }
  }

  /**
   * Envía contenido markdown a Telegram
   *
   * @param {string} content - Contenido markdown o ruta a archivo .md
   * @param {Object} options - Opciones de envío
   * @param {boolean} options.isFile - Si content es ruta a archivo (default: false)
   * @param {boolean} options.splitLong - Dividir mensajes largos (default: true)
   * @param {number} options.maxLength - Máximo de caracteres por mensaje (default: 4000)
   * @returns {Promise<Object>} Confirmación de envío
   */
  async sendMarkdown(content, options = {}) {
    const {
      isFile = false,
      splitLong = true,
      maxLength = 4000
    } = options;

    console.log('');
    console.log('════════════════════════════════════════════════');
    console.log('📤 Enviando mensaje markdown a Telegram...');
    console.log('════════════════════════════════════════════════');
    console.log('');

    try {
      let markdownContent = content;

      // Si es archivo, leer contenido
      if (isFile) {
        console.log(`📄 Leyendo archivo: ${content}`);
        markdownContent = await fs.readFile(content, 'utf8');
      }

      const messageId = this._generateMessageId();

      // Si el mensaje es muy largo, dividir
      let messages = [markdownContent];
      if (splitLong && markdownContent.length > maxLength) {
        console.log(`✂️  Mensaje largo (${markdownContent.length} chars), dividiendo...`);
        messages = this._splitMarkdown(markdownContent, maxLength);
        console.log(`📦 Dividido en ${messages.length} partes`);
      }

      // Crear mensaje(s) saliente(s)
      for (let i = 0; i < messages.length; i++) {
        const partId = messages.length > 1 ? `${messageId}_part${i + 1}` : messageId;
        await this._createOutgoingMessage(partId, messages[i], {
          part: i + 1,
          total: messages.length
        });
      }

      console.log(`💬 Chat ID: ${this.telegramChatId}`);
      console.log(`🆔 Message ID: ${messageId}`);
      console.log(`📊 Total caracteres: ${markdownContent.length}`);
      console.log('');
      console.log('✅ Mensaje encolado para envío');
      console.log('💡 El bot enviará el mensaje en los próximos 3 segundos');
      console.log('');

      return {
        messageId,
        chatId: this.telegramChatId,
        parts: messages.length,
        totalChars: markdownContent.length,
        status: 'queued'
      };
    } catch (err) {
      console.error('');
      console.error('❌ Error enviando mensaje:', err.message);
      console.error('');
      throw err;
    }
  }

  /**
   * Crea un mensaje saliente en el archivo JSON
   */
  async _createOutgoingMessage(messageId, content, metadata = {}) {
    const outgoing = await this._readJSON(OUTGOING_FILE);

    outgoing[messageId] = {
      telegram_chat_id: this.telegramChatId,
      content,
      metadata,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await this._writeJSON(OUTGOING_FILE, outgoing);
  }

  /**
   * Divide contenido markdown en partes más pequeñas
   * Intenta dividir por párrafos para mantener formato
   */
  _splitMarkdown(content, maxLength) {
    const parts = [];
    const lines = content.split('\n');
    let currentPart = '';

    for (const line of lines) {
      // Si agregar esta línea excede el límite
      if (currentPart.length + line.length + 1 > maxLength) {
        if (currentPart) {
          parts.push(currentPart.trim());
          currentPart = '';
        }

        // Si una sola línea es más larga que maxLength, dividirla
        if (line.length > maxLength) {
          const chunks = line.match(new RegExp(`.{1,${maxLength}}`, 'g'));
          parts.push(...chunks.slice(0, -1));
          currentPart = chunks[chunks.length - 1] + '\n';
        } else {
          currentPart = line + '\n';
        }
      } else {
        currentPart += line + '\n';
      }
    }

    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }

    return parts;
  }

  /**
   * Genera un ID único para un mensaje
   */
  _generateMessageId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `m_${timestamp}_${random}`;
  }

  /**
   * Crea una pregunta pendiente en el archivo JSON
   */
  async _createPendingQuestion(questionId, question, options) {
    const pending = await this._readJSON(PENDING_FILE);

    pending[questionId] = {
      telegram_chat_id: this.telegramChatId,
      question,
      options,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await this._writeJSON(PENDING_FILE, pending);
    console.log('✅ Pregunta creada exitosamente');
  }

  /**
   * Espera por una respuesta (polling)
   */
  async _waitForResponse(questionId, timeout) {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 segundos
    let dotsCount = 0;

    console.log('⏳ Esperando respuesta del usuario...');
    console.log('');

    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          // Verificar timeout
          const elapsed = Date.now() - startTime;
          if (elapsed > timeout) {
            clearInterval(intervalId);
            reject(new Error(`Timeout: No se recibió respuesta en ${timeout / 1000}s`));
            return;
          }

          // Buscar respuesta
          const responses = await this._readJSON(RESPONSES_FILE);
          const response = responses[questionId];

          if (response) {
            clearInterval(intervalId);

            // Limpiar archivos
            await this._cleanupQuestion(questionId);
            delete responses[questionId];
            await this._writeJSON(RESPONSES_FILE, responses);

            resolve(response.selected_option);
          }

          // Mostrar progreso (dots animados)
          dotsCount = (dotsCount + 1) % 4;
          const dots = '.'.repeat(dotsCount);
          process.stdout.write(`\r⏳ Esperando${dots.padEnd(4)} [${Math.floor(elapsed / 1000)}s / ${timeout / 1000}s]`);

          // Recordatorio cada 30 segundos
          if (elapsed % 30000 < pollInterval && elapsed > 0) {
            console.log('');
            console.log('💡 Revisa tu Telegram para responder');
          }
        } catch (err) {
          clearInterval(intervalId);
          reject(err);
        }
      }, pollInterval);
    });
  }

  /**
   * Limpia una pregunta del archivo pending
   */
  async _cleanupQuestion(questionId) {
    try {
      const pending = await this._readJSON(PENDING_FILE);
      delete pending[questionId];
      await this._writeJSON(PENDING_FILE, pending);
    } catch (err) {
      console.error('Error limpiando pregunta:', err.message);
    }
  }

  /**
   * Lee un archivo JSON
   */
  async _readJSON(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      return {};
    }
  }

  /**
   * Escribe un archivo JSON
   */
  async _writeJSON(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Asegura que un archivo existe
   */
  async _ensureFile(filePath, defaultContent) {
    try {
      await fs.access(filePath);
    } catch {
      await this._writeJSON(filePath, defaultContent);
    }
  }

  /**
   * Genera un ID único para una pregunta
   */
  _generateQuestionId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `q_${timestamp}_${random}`;
  }

  /**
   * Obtiene el estado de preguntas pendientes
   */
  async getStatus() {
    const pending = await this._readJSON(PENDING_FILE);
    const myQuestions = Object.entries(pending)
      .filter(([, q]) => q.telegram_chat_id === this.telegramChatId)
      .map(([id, q]) => ({
        id,
        question: q.question,
        status: q.status,
        created_at: q.created_at
      }));

    return myQuestions;
  }
}

// ============================================
// EJEMPLO DE USO
// ============================================

async function example() {
  const client = new ClaudeTelegramClient();

  try {
    await client.initialize();

    const answer = await client.askQuestion(
      '¿Qué librería de UI prefieres para el proyecto?',
      [
        {
          label: 'Material-UI',
          description: 'Componentes React robustos y completos'
        },
        {
          label: 'Ant Design',
          description: 'Enterprise UI design, muy profesional'
        },
        {
          label: 'Chakra UI',
          description: 'Simple, accesible y moderno'
        }
      ],
      300000 // 5 minutos
    );

    console.log('Usuario eligió:', answer.label);
    console.log('Descripción:', answer.description);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Ejecutar ejemplo si se llama directamente
if (require.main === module) {
  example();
}

module.exports = ClaudeTelegramClient;
