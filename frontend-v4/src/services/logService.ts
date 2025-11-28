/**
 * Log Service - Send logs to API
 * Sends frontend logs to backend for centralized storage
 */

// Types
interface LogEntry {
  level: string;
  category: string;
  message: string;
  timestamp: string;
  data?: unknown;
  priority?: string;
}

interface LogBatchPayload {
  logs: LogEntry[];
}

/**
 * Send log entry to API
 */
export const sendLogToAPI = async (_logEntry: LogEntry): Promise<null> => {
  // DISABLED - API not running, don't make HTTP requests
  // This prevents 404 errors flooding the console
  return null

  /* COMMENTED OUT - Enable when API is running
  try {
    // Don't log API errors to avoid infinite loop
    const response = await api.post('/logs/frontend', logEntry)
    return response
  } catch (error) {
    // Silently fail - don't create infinite loop
    console.warn('Failed to send log to API:', error.message)
    return null
  }
  */
}

/**
 * Send multiple logs to API (batch)
 */
export const sendLogsBatch = async (_logEntries: LogEntry[]): Promise<null> => {
  // DISABLED - API not running
  return null

  /* COMMENTED OUT - Enable when API is running
  try {
    const response = await api.post('/logs/frontend/batch', { logs: logEntries })
    return response
  } catch (error) {
    console.warn('Failed to send logs batch to API:', error.message)
    return null
  }
  */
}

/**
 * Send error log immediately
 * For critical errors that need immediate logging
 */
export const sendErrorLog = async (_errorLog: Omit<LogEntry, 'level' | 'priority'>): Promise<null> => {
  // DISABLED - API not running
  return null

  /* COMMENTED OUT - Enable when API is running
  return sendLogToAPI({
    ...errorLog,
    level: 'ERROR',
    priority: 'HIGH'
  })
  */
}

export default {
  sendLogToAPI,
  sendLogsBatch,
  sendErrorLog
}
