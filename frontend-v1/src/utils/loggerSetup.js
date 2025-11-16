/**
 * Logger Setup and Configuration
 * Initializes logging system with auto-export
 */

import * as logger from './logger'

/**
 * Initialize logging system
 * Call this once when app starts
 */
export const initializeLogger = () => {
  // Log app startup
  logger.info('APP', 'Application started', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`
  })

  // Setup auto-export (every 30 minutes)
  // Uncomment if you want automatic log exports
  // logger.startAutoExport(30)

  // Log unhandled errors
  window.addEventListener('error', (event) => {
    logger.error('WINDOW_ERROR', 'Unhandled error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack
    })
  })

  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('PROMISE_ERROR', 'Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise
    })
  })

  // Log when user is leaving
  window.addEventListener('beforeunload', () => {
    logger.info('APP', 'User leaving application')

    // Auto-save logs on exit - DESACTIVADO para evitar descargas no deseadas
    // Usa Ctrl+Shift+L para exportar logs manualmente
    /*
    const summary = logger.getLogsSummary()
    if (summary.byLevel.ERROR > 5 || summary.total > 100) {
      const filename = `docs/logs-on-exit-${new Date().toISOString().slice(0, 10)}.txt`
      logger.exportLogs(filename)
      console.log(`📁 Logs exported to: ${filename}`)
      console.log('💡 Mueve el archivo descargado a la carpeta docs/ del proyecto')
    }
    */
  })

  // Add keyboard shortcut to export logs (Ctrl+Shift+L)
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'L') {
      event.preventDefault()
      const filename = `docs/app-logs-${new Date().toISOString().slice(0, 10)}.txt`
      logger.exportLogs(filename)
      console.log(`✅ Logs exported to: ${filename}`)
      console.log('💡 Mueve el archivo descargado a la carpeta docs/ del proyecto')
    }
  })

  // Add keyboard shortcut to clear logs (Ctrl+Shift+C)
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
      event.preventDefault()
      logger.clearLogs()
      console.log('✅ Logs cleared!')
    }
  })

  // Add keyboard shortcut to show logs in console (Ctrl+Shift+D)
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault()
      logger.saveLogsToConsole()
    }
  })

  logger.success('LOGGER', 'Logger system initialized', {
    features: [
      'localStorage persistence',
      'Console logging',
      'Debug Panel',
      'Keyboard shortcuts',
      'Error tracking',
      'Auto-export (optional)'
    ]
  })
}

export default {
  initializeLogger
}

