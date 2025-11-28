#!/usr/bin/env node
/**
 * 📊 Telegram Progress Updater
 *
 * Helper para que Claude Code actualice el progreso fácilmente
 * Escribe a ~/.claude-telegram/status.json
 *
 * Uso:
 *   const { updateProgress } = require('./.claude/telegram-update-progress.js');
 *   await updateProgress("Leyendo archivos", { progress: 25 });
 *
 * Autor: Claude Code
 * Versión: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const STATE_DIR = path.join(process.env.HOME, '.claude-telegram');
const STATUS_FILE = path.join(STATE_DIR, 'status.json');
const ACTIVITY_LOG_FILE = path.join(STATE_DIR, 'activity_log.json');

/**
 * Actualiza el progreso de la tarea actual
 *
 * @param {string} message - Mensaje de progreso
 * @param {Object} options - Opciones
 * @param {string} [options.task] - Nombre de la tarea (si es nueva)
 * @param {number} [options.progress] - Porcentaje de progreso (0-100)
 * @param {string} [options.status] - Estado: pending, in_progress, completed, error
 * @param {Object} [options.activity] - Actividad reciente { action, type }
 * @param {Object} [options.metadata] - Metadata adicional
 * @returns {Promise<Object>} Estado actualizado
 */
async function updateProgress(message, options = {}) {
  try {
    // Asegurar que el directorio existe
    await fs.mkdir(STATE_DIR, { recursive: true });

    // Leer estado actual
    let currentStatus = await readStatus();

    // Timestamp actual
    const now = new Date().toISOString();

    // Si hay una nueva tarea, resetear estado
    if (options.task && options.task !== currentStatus.task) {
      currentStatus = {
        task: options.task,
        progress: 0,
        status: 'in_progress',
        started_at: now,
        updated_at: now,
        activities: [],
        metadata: {
          files_read: 0,
          files_written: 0,
          api_calls: 0,
          questions_asked: 0,
          ...options.metadata
        }
      };
    }

    // Actualizar mensaje y timestamp
    currentStatus.message = message;
    currentStatus.updated_at = now;

    // Actualizar progreso si se provee
    if (typeof options.progress === 'number') {
      currentStatus.progress = Math.max(0, Math.min(100, options.progress));
    }

    // Actualizar estado si se provee
    if (options.status) {
      currentStatus.status = options.status;

      // Si se marca como completado, agregar completed_at
      if (options.status === 'completed') {
        currentStatus.completed_at = now;
        currentStatus.progress = 100;
      }
    }

    // Agregar actividad si se provee
    if (options.activity) {
      const activity = {
        timestamp: now,
        action: options.activity.action || message,
        type: options.activity.type || 'general'
      };

      // Mantener solo las últimas 20 actividades
      currentStatus.activities = currentStatus.activities || [];
      currentStatus.activities.push(activity);
      if (currentStatus.activities.length > 20) {
        currentStatus.activities = currentStatus.activities.slice(-20);
      }

      // Actualizar metadata según el tipo de actividad
      currentStatus.metadata = currentStatus.metadata || {};
      if (activity.type === 'read') {
        currentStatus.metadata.files_read = (currentStatus.metadata.files_read || 0) + 1;
      } else if (activity.type === 'write') {
        currentStatus.metadata.files_written = (currentStatus.metadata.files_written || 0) + 1;
      } else if (activity.type === 'api_test' || activity.type === 'api_call') {
        currentStatus.metadata.api_calls = (currentStatus.metadata.api_calls || 0) + 1;
      } else if (activity.type === 'question') {
        currentStatus.metadata.questions_asked = (currentStatus.metadata.questions_asked || 0) + 1;
      }
    }

    // Fusionar metadata adicional si se provee
    if (options.metadata) {
      currentStatus.metadata = {
        ...currentStatus.metadata,
        ...options.metadata
      };
    }

    // Escribir estado actualizado
    await writeStatus(currentStatus);

    // Log a activity_log para historial
    await logActivity({
      timestamp: now,
      message,
      progress: currentStatus.progress,
      status: currentStatus.status,
      activity: options.activity
    });

    return currentStatus;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
}

/**
 * Lee el estado actual
 */
async function readStatus() {
  try {
    const content = await fs.readFile(STATUS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // Si no existe, retornar estado inicial
    return {
      task: 'Sin tarea activa',
      progress: 0,
      status: 'pending',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activities: [],
      metadata: {
        files_read: 0,
        files_written: 0,
        api_calls: 0,
        questions_asked: 0
      }
    };
  }
}

/**
 * Escribe el estado (atómico)
 */
async function writeStatus(status) {
  const tempFile = `${STATUS_FILE}.tmp`;

  try {
    // Escribir a archivo temporal
    await fs.writeFile(tempFile, JSON.stringify(status, null, 2), 'utf8');

    // Renombrar (operación atómica)
    await fs.rename(tempFile, STATUS_FILE);
  } catch (error) {
    // Limpiar archivo temporal si falla
    try {
      await fs.unlink(tempFile);
    } catch {}
    throw error;
  }
}

/**
 * Log actividad al historial
 */
async function logActivity(entry) {
  try {
    let log = [];

    try {
      const content = await fs.readFile(ACTIVITY_LOG_FILE, 'utf8');
      log = JSON.parse(content);
    } catch {}

    log.push(entry);

    // Mantener solo las últimas 100 entradas
    if (log.length > 100) {
      log = log.slice(-100);
    }

    await fs.writeFile(ACTIVITY_LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
  } catch (error) {
    // No fallar si no se puede escribir el log
    console.error('Warning: Could not write activity log:', error.message);
  }
}

/**
 * Calcula hash del estado (para detectar cambios)
 */
function hashStatus(status) {
  const str = JSON.stringify({
    task: status.task,
    progress: status.progress,
    status: status.status,
    activities: status.activities
  });
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * CLI: Actualizar progreso desde línea de comandos
 */
async function cli() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Uso: telegram-update-progress.js <mensaje> [progress] [status]');
    console.log('Ejemplo: telegram-update-progress.js "Leyendo archivos" 25');
    console.log('Ejemplo: telegram-update-progress.js complete (marca como completado)');
    process.exit(1);
  }

  const message = args[0];
  const progress = args[1] ? parseInt(args[1]) : undefined;
  const status = args[2] || undefined;

  // Comando especial: complete
  if (message === 'complete') {
    const currentStatus = await readStatus();
    await updateProgress(`${currentStatus.task} - Completado`, {
      progress: 100,
      status: 'completed'
    });
    console.log('✅ Marcado como completado');
    return;
  }

  // Actualizar progreso
  const result = await updateProgress(message, { progress, status });
  console.log(`✅ Progreso actualizado: ${result.progress}%`);
}

// Exportar para uso como módulo
module.exports = {
  updateProgress,
  readStatus,
  hashStatus
};

// CLI si se ejecuta directamente
if (require.main === module) {
  cli().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}
