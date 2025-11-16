/**
 * Logger Service
 * Logs to console, localStorage, and optionally to API
 */

// DISABLED - API not running, don't import logService to prevent HTTP requests
// import { sendLogToAPI, sendErrorLog } from '../services/logService'

const LOG_STORAGE_KEY = 'app_debug_logs'
const MAX_LOGS = 500 // Maximum number of logs to keep
const SEND_TO_API = false // Enable/disable sending logs to API (DISABLED - API not running)

/**
 * Log levels
 */
export const LogLevel = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
}

/**
 * Get current timestamp
 */
const getTimestamp = () => {
  const now = new Date()
  return now.toISOString()
}

/**
 * Get logs from localStorage
 */
export const getLogs = () => {
  try {
    const logs = localStorage.getItem(LOG_STORAGE_KEY)
    return logs ? JSON.parse(logs) : []
  } catch (error) {
    console.error('Error reading logs:', error)
    return []
  }
}

/**
 * Save log to localStorage
 */
const saveLog = (logEntry) => {
  try {
    const logs = getLogs()
    logs.push(logEntry)
    
    // Keep only the last MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS)
    }
    
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs))
  } catch (error) {
    console.error('Error saving log:', error)
  }
}

/**
 * Log message with level
 */
const log = (level, category, message, data = null) => {
  const timestamp = getTimestamp()
  const logEntry = {
    timestamp,
    level,
    category,
    message,
    data: data ? JSON.stringify(data, null, 2) : null
  }
  
  // Save to localStorage
  saveLog(logEntry)
  
  // Console output with colors
  const styles = {
    [LogLevel.INFO]: 'color: #2196F3; font-weight: bold',
    [LogLevel.SUCCESS]: 'color: #4CAF50; font-weight: bold',
    [LogLevel.WARNING]: 'color: #FF9800; font-weight: bold',
    [LogLevel.ERROR]: 'color: #F44336; font-weight: bold',
    [LogLevel.DEBUG]: 'color: #9E9E9E; font-weight: bold'
  }
  
  console.log(
    `%c[${level}] ${timestamp} - ${category}`,
    styles[level],
    message,
    data || ''
  )
  
  // DISABLED - Don't send to API (API not running)
  // Send to API if enabled and it's an ERROR or WARNING
  /* COMMENTED OUT - Enable when API is running
  if (SEND_TO_API && (level === LogLevel.ERROR || level === LogLevel.WARNING)) {
    // Send asynchronously, don't wait for response
    if (level === LogLevel.ERROR) {
      sendErrorLog(logEntry).catch(() => {}) // Silently fail
    } else {
      sendLogToAPI(logEntry).catch(() => {}) // Silently fail
    }
  }
  */
}

/**
 * Info log
 */
export const info = (category, message, data) => {
  log(LogLevel.INFO, category, message, data)
}

/**
 * Success log
 */
export const success = (category, message, data) => {
  log(LogLevel.SUCCESS, category, message, data)
}

/**
 * Warning log
 */
export const warning = (category, message, data) => {
  log(LogLevel.WARNING, category, message, data)
}

/**
 * Error log
 */
export const error = (category, message, data) => {
  log(LogLevel.ERROR, category, message, data)
}

/**
 * Debug log
 */
export const debug = (category, message, data) => {
  log(LogLevel.DEBUG, category, message, data)
}

/**
 * Clear all logs
 */
export const clearLogs = () => {
  localStorage.removeItem(LOG_STORAGE_KEY)
  console.clear()
  info('LOGGER', 'All logs cleared')
}

/**
 * Export logs as text file
 */
export const exportLogs = (filename = null) => {
  const logs = getLogs()
  const logText = logs.map(log => 
    `[${log.level}] ${log.timestamp} - ${log.category}\n${log.message}\n${log.data || ''}\n${'='.repeat(80)}\n`
  ).join('\n')
  
  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `app-logs-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  success('LOGGER', 'Logs exported successfully')
}

/**
 * Auto-export logs every N minutes
 * @param {number} intervalMinutes - Export interval in minutes
 */
export const startAutoExport = (intervalMinutes = 30) => {
  const intervalMs = intervalMinutes * 60 * 1000
  
  setInterval(() => {
    const logs = getLogs()
    if (logs.length > 0) {
      const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19)
      exportLogs(`auto-logs-${timestamp}.txt`)
      info('LOGGER', `Auto-exported ${logs.length} logs`)
    }
  }, intervalMs)
  
  info('LOGGER', `Auto-export started (every ${intervalMinutes} minutes)`)
}

/**
 * Save logs to console storage for debugging
 */
export const saveLogsToConsole = () => {
  const logs = getLogs()
  console.log('%c=== APPLICATION LOGS ===', 'font-size: 16px; font-weight: bold; color: #2196F3')
  console.table(logs.slice(-20))
  console.log('%c=== END OF LOGS ===', 'font-size: 16px; font-weight: bold; color: #2196F3')
}

/**
 * Get logs summary
 */
export const getLogsSummary = () => {
  const logs = getLogs()
  return {
    total: logs.length,
    byLevel: {
      INFO: logs.filter(l => l.level === LogLevel.INFO).length,
      SUCCESS: logs.filter(l => l.level === LogLevel.SUCCESS).length,
      WARNING: logs.filter(l => l.level === LogLevel.WARNING).length,
      ERROR: logs.filter(l => l.level === LogLevel.ERROR).length,
      DEBUG: logs.filter(l => l.level === LogLevel.DEBUG).length
    },
    lastLog: logs[logs.length - 1]
  }
}

export default {
  info,
  success,
  warning,
  error,
  debug,
  getLogs,
  clearLogs,
  exportLogs,
  getLogsSummary,
  startAutoExport,
  saveLogsToConsole
}

