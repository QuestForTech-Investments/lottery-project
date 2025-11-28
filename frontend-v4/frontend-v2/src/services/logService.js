/**
 * Log Service - Send logs to API
 * Sends frontend logs to backend for centralized storage
 */

import api from './api'

/**
 * Send log entry to API
 * @param {Object} logEntry - Log entry object
 * @param {string} logEntry.level - Log level (INFO, ERROR, etc.)
 * @param {string} logEntry.category - Log category
 * @param {string} logEntry.message - Log message
 * @param {string} logEntry.timestamp - ISO timestamp
 * @param {Object} logEntry.data - Additional data
 * @returns {Promise} - API response
 */
export const sendLogToAPI = async (logEntry) => {
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
 * @param {Array} logEntries - Array of log entries
 * @returns {Promise} - API response
 */
export const sendLogsBatch = async (logEntries) => {
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
 * @param {Object} errorLog - Error log entry
 * @returns {Promise} - API response
 */
export const sendErrorLog = async (errorLog) => {
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


