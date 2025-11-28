#!/usr/bin/env node
/**
 * 📊 Telegram Progress Tracker Daemon
 *
 * Monitorea ~/.claude-telegram/status.json y envía actualizaciones a Telegram
 * cuando hay cambios significativos en el progreso.
 *
 * Características:
 * - Polling cada 2 minutos
 * - Detección de cambios por hash
 * - Rate limiting (max 15 notificaciones/hora)
 * - Notificaciones inteligentes (progreso >= 5%, nuevas actividades, cambios de estado)
 * - Graceful shutdown (SIGINT/SIGTERM)
 *
 * Uso:
 *   node telegram-progress-tracker.js                    # Start daemon
 *   node telegram-progress-tracker.js --once             # Run once and exit
 *   node telegram-progress-tracker.js --interval 60000   # Custom interval (ms)
 *
 * Autor: Claude Code
 * Versión: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ============================================================================
// CONFIGURATION
// ============================================================================

const STATE_DIR = path.join(process.env.HOME, '.claude-telegram');
const STATUS_FILE = path.join(STATE_DIR, 'status.json');
const TRACKING_STATE_FILE = path.join(STATE_DIR, 'tracking_state.json');
const CONFIG_FILE = path.join(STATE_DIR, 'config.json');
const LOG_FILE = path.join(STATE_DIR, 'tracker.log');

const DEFAULT_CONFIG = {
  update_interval_ms: 120000, // 2 minutes
  min_progress_change: 5, // Notify if progress changes >= 5%
  max_notifications_per_hour: 15,
  notification_types: {
    progress_update: true,
    task_start: true,
    task_complete: true,
    error: true,
    question: true
  },
  telegram: {
    chat_id: process.env.TELEGRAM_CHAT_ID || '417821897',
    bot_token: process.env.TELEGRAM_BOT_TOKEN || '',
    parse_mode: 'Markdown'
  }
};

// Parse command line args
const args = process.argv.slice(2);
const runOnce = args.includes('--once');
const customInterval = args.find(arg => arg.startsWith('--interval='));
const interval = customInterval ? parseInt(customInterval.split('=')[1]) : DEFAULT_CONFIG.update_interval_ms;

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Lee el archivo de configuración
 */
async function loadConfig() {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
  } catch (error) {
    // Si no existe, crear con defaults
    await fs.mkdir(STATE_DIR, { recursive: true });
    await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
    return DEFAULT_CONFIG;
  }
}

/**
 * Lee el estado actual del progreso
 */
async function readStatus() {
  try {
    const content = await fs.readFile(STATUS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // Si no existe, retornar null
    return null;
  }
}

/**
 * Lee el estado del tracker
 */
async function readTrackingState() {
  try {
    const content = await fs.readFile(TRACKING_STATE_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // Estado inicial
    return {
      last_notified_at: null,
      last_status_hash: null,
      last_progress: 0,
      notification_count: 0,
      notification_history: [], // Últimas notificaciones para rate limiting
      tracker_started_at: new Date().toISOString(),
      tracker_pid: process.pid
    };
  }
}

/**
 * Escribe el estado del tracker
 */
async function writeTrackingState(state) {
  const tempFile = `${TRACKING_STATE_FILE}.tmp`;

  try {
    await fs.writeFile(tempFile, JSON.stringify(state, null, 2), 'utf8');
    await fs.rename(tempFile, TRACKING_STATE_FILE);
  } catch (error) {
    try {
      await fs.unlink(tempFile);
    } catch {}
    throw error;
  }
}

/**
 * Calcula hash del estado para detectar cambios
 */
function calculateStatusHash(status) {
  if (!status) return null;

  const str = JSON.stringify({
    task: status.task,
    progress: status.progress,
    status: status.status,
    activities: status.activities,
    message: status.message
  });

  return crypto.createHash('md5').update(str).digest('hex');
}

// ============================================================================
// NOTIFICATION LOGIC
// ============================================================================

/**
 * Verifica si debemos enviar una notificación
 */
function shouldNotify(currentStatus, trackingState, config) {
  if (!currentStatus) return false;

  const now = Date.now();
  const currentHash = calculateStatusHash(currentStatus);

  // 1. Hash no cambió - no notificar
  if (currentHash === trackingState.last_status_hash) {
    return false;
  }

  // 2. Verificar rate limiting
  const oneHourAgo = now - (60 * 60 * 1000);
  const recentNotifications = trackingState.notification_history.filter(
    timestamp => timestamp > oneHourAgo
  );

  if (recentNotifications.length >= config.max_notifications_per_hour) {
    log('⚠️ Rate limit alcanzado. No se enviará notificación.');
    return false;
  }

  // 3. Tarea nueva - notificar inmediatamente
  if (trackingState.last_status_hash === null) {
    return true;
  }

  // 4. Estado cambió - notificar inmediatamente
  const statusChanged = currentStatus.status !== trackingState.last_status;
  if (statusChanged && config.notification_types[`task_${currentStatus.status}`]) {
    return true;
  }

  // 5. Progreso cambió significativamente
  const progressDelta = Math.abs(currentStatus.progress - trackingState.last_progress);
  if (progressDelta >= config.min_progress_change) {
    return true;
  }

  // 6. Nuevas actividades (>= 2)
  const lastActivities = trackingState.last_activities || [];
  const newActivities = currentStatus.activities || [];
  const newActivityCount = newActivities.length - lastActivities.length;

  if (newActivityCount >= 2) {
    return true;
  }

  // 7. Error detectado
  if (currentStatus.status === 'error' && config.notification_types.error) {
    return true;
  }

  // 8. Tiempo mínimo desde última notificación (2 min)
  if (trackingState.last_notified_at) {
    const timeSinceLastNotification = now - new Date(trackingState.last_notified_at).getTime();
    const twoMinutes = 2 * 60 * 1000;

    if (timeSinceLastNotification < twoMinutes) {
      return false;
    }
  }

  // Si llegamos aquí, hay cambios pero no son suficientemente significativos
  return false;
}

/**
 * Formatea el mensaje de notificación
 */
function formatNotificationMessage(status) {
  const emoji = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    error: '❌'
  };

  const statusEmoji = emoji[status.status] || '📋';

  let message = `${statusEmoji} *${status.task}*\n\n`;

  // Mensaje principal
  if (status.message) {
    message += `💬 ${status.message}\n\n`;
  }

  // Progreso
  if (status.progress !== undefined) {
    const progressBar = createProgressBar(status.progress);
    message += `📊 Progreso: ${status.progress}%\n${progressBar}\n\n`;
  }

  // Estado
  const statusText = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    completed: 'Completado',
    error: 'Error'
  };
  message += `🏷️ Estado: *${statusText[status.status] || status.status}*\n\n`;

  // Últimas actividades
  if (status.activities && status.activities.length > 0) {
    const recentActivities = status.activities.slice(-5);
    message += `📝 *Últimas actividades:*\n`;
    recentActivities.forEach(activity => {
      const activityEmoji = {
        read: '📄',
        write: '✏️',
        api_test: '🔌',
        api_call: '🌐',
        question: '❓',
        general: '🔹'
      };
      const emoji = activityEmoji[activity.type] || '•';
      message += `${emoji} ${activity.action}\n`;
    });
    message += '\n';
  }

  // Metadata
  if (status.metadata) {
    const { files_read, files_written, api_calls, questions_asked } = status.metadata;
    message += `📈 *Estadísticas:*\n`;
    if (files_read) message += `📄 Archivos leídos: ${files_read}\n`;
    if (files_written) message += `✏️ Archivos escritos: ${files_written}\n`;
    if (api_calls) message += `🔌 Llamadas API: ${api_calls}\n`;
    if (questions_asked) message += `❓ Preguntas: ${questions_asked}\n`;
    message += '\n';
  }

  // Timestamp
  const updatedAt = new Date(status.updated_at);
  const now = new Date();
  const diffMs = now - updatedAt;
  const diffMin = Math.floor(diffMs / 60000);
  const timeAgo = diffMin === 0 ? 'ahora' : diffMin === 1 ? 'hace 1 min' : `hace ${diffMin} min`;
  message += `⏱️ Última actualización: ${timeAgo}`;

  return message;
}

/**
 * Crea una barra de progreso visual
 */
function createProgressBar(progress) {
  const barLength = 20;
  const filled = Math.round((progress / 100) * barLength);
  const empty = barLength - filled;

  const filledChar = '█';
  const emptyChar = '░';

  return `[${filledChar.repeat(filled)}${emptyChar.repeat(empty)}]`;
}

/**
 * Envía notificación a Telegram
 */
async function sendTelegramNotification(message, config) {
  const { chat_id, bot_token, parse_mode } = config.telegram;

  if (!bot_token) {
    log('⚠️ TELEGRAM_BOT_TOKEN no configurado. Saltando notificación.');
    return false;
  }

  const url = `https://api.telegram.org/bot${bot_token}/sendMessage`;
  const payload = {
    chat_id,
    text: message,
    parse_mode
  };

  try {
    const curlCommand = `curl -s -X POST "${url}" \
      -H "Content-Type: application/json" \
      -d '${JSON.stringify(payload).replace(/'/g, "'\\''")}'`;

    const { stdout, stderr } = await execAsync(curlCommand);

    if (stderr) {
      log(`⚠️ Error en notificación Telegram: ${stderr}`);
      return false;
    }

    const response = JSON.parse(stdout);
    if (response.ok) {
      log('✅ Notificación enviada a Telegram');
      return true;
    } else {
      log(`❌ Error en respuesta Telegram: ${response.description}`);
      return false;
    }
  } catch (error) {
    log(`❌ Error enviando notificación: ${error.message}`);
    return false;
  }
}

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Escribe en el log del tracker
 */
async function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(logMessage.trim());

  try {
    await fs.appendFile(LOG_FILE, logMessage, 'utf8');

    // Rotar log si es muy grande (> 10MB)
    const stats = await fs.stat(LOG_FILE);
    if (stats.size > 10 * 1024 * 1024) {
      const backupFile = `${LOG_FILE}.${Date.now()}.bak`;
      await fs.rename(LOG_FILE, backupFile);
      log('🔄 Log rotado (>10MB)');
    }
  } catch (error) {
    console.error('Error escribiendo log:', error.message);
  }
}

// ============================================================================
// MAIN LOOP
// ============================================================================

/**
 * Chequea progreso y envía notificación si es necesario
 */
async function checkAndNotify() {
  try {
    log('🔍 Revisando estado del progreso...');

    // Cargar config
    const config = await loadConfig();

    // Leer estado actual
    const currentStatus = await readStatus();
    if (!currentStatus) {
      log('ℹ️ No hay estado de progreso disponible. Esperando...');
      return;
    }

    // Leer tracking state
    const trackingState = await readTrackingState();

    // Verificar si debemos notificar
    if (!shouldNotify(currentStatus, trackingState, config)) {
      log('ℹ️ No hay cambios significativos. No se envía notificación.');
      return;
    }

    // Formatear y enviar notificación
    const message = formatNotificationMessage(currentStatus);
    const sent = await sendTelegramNotification(message, config);

    if (sent) {
      // Actualizar tracking state
      const now = Date.now();
      trackingState.last_notified_at = new Date().toISOString();
      trackingState.last_status_hash = calculateStatusHash(currentStatus);
      trackingState.last_progress = currentStatus.progress;
      trackingState.last_status = currentStatus.status;
      trackingState.last_activities = currentStatus.activities;
      trackingState.notification_count += 1;

      // Agregar a historial (mantener últimas 20)
      trackingState.notification_history = trackingState.notification_history || [];
      trackingState.notification_history.push(now);
      if (trackingState.notification_history.length > 20) {
        trackingState.notification_history = trackingState.notification_history.slice(-20);
      }

      await writeTrackingState(trackingState);
      log(`📤 Notificación #${trackingState.notification_count} enviada`);
    }
  } catch (error) {
    log(`❌ Error en checkAndNotify: ${error.message}`);
    console.error(error);
  }
}

/**
 * Inicia el daemon
 */
async function startDaemon() {
  log('🚀 Telegram Progress Tracker iniciado');
  log(`📊 PID: ${process.pid}`);
  log(`⏱️ Intervalo: ${interval}ms (${interval / 1000}s)`);

  // Crear directorio de estado si no existe
  await fs.mkdir(STATE_DIR, { recursive: true });

  // Primera revisión inmediata
  await checkAndNotify();

  if (runOnce) {
    log('✅ Ejecución única completada. Saliendo...');
    process.exit(0);
  }

  // Loop continuo
  const intervalId = setInterval(async () => {
    await checkAndNotify();
  }, interval);

  // Graceful shutdown
  const shutdown = async (signal) => {
    log(`⚠️ Recibido ${signal}. Cerrando gracefully...`);
    clearInterval(intervalId);

    const trackingState = await readTrackingState();
    trackingState.tracker_stopped_at = new Date().toISOString();
    await writeTrackingState(trackingState);

    log('👋 Tracker detenido');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  log('✅ Daemon corriendo. Presiona Ctrl+C para detener.');
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

if (require.main === module) {
  startDaemon().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

// Exportar para testing
module.exports = {
  checkAndNotify,
  shouldNotify,
  formatNotificationMessage,
  calculateStatusHash
};
