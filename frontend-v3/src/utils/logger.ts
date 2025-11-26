/**
 * Logger Service - Production Ready
 *
 * Behavior:
 * - Development: All logs to console + localStorage
 * - Production: Only errors/warnings to console, NO localStorage (GDPR)
 * - Respects import.meta.env.MODE
 */

const LOG_STORAGE_KEY = 'app_debug_logs';
const MAX_LOGS = 500; // Maximum number of logs to keep
const IS_DEV = import.meta.env.DEV; // Vite environment flag
const ENABLE_STORAGE = IS_DEV; // Only store logs in development

/**
 * Log levels
 */
export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data: string | null;
}

/**
 * Get current timestamp
 */
const getTimestamp = (): string => {
  const now = new Date();
  return now.toISOString();
};

/**
 * Get logs from localStorage
 */
export const getLogs = (): LogEntry[] => {
  try {
    const logs = localStorage.getItem(LOG_STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
};

/**
 * Save log to localStorage
 */
const saveLog = (logEntry: LogEntry): void => {
  try {
    const logs = getLogs();
    logs.push(logEntry);

    // Keep only the last MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }

    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving log:', error);
  }
};

/**
 * Log message with level (environment-aware)
 */
const log = (level: LogLevel, category: string, message: string, data: any = null): void => {
  const timestamp = getTimestamp();
  const logEntry: LogEntry = {
    timestamp,
    level,
    category,
    message,
    data: data ? JSON.stringify(data, null, 2) : null,
  };

  // Production: Only log errors and warnings to console
  // Development: Log everything
  const shouldLog = IS_DEV || level === LogLevel.ERROR || level === LogLevel.WARNING;

  if (!shouldLog) {
    return; // Skip logging in production for debug/info/success
  }

  // Save to localStorage only in development
  if (ENABLE_STORAGE) {
    saveLog(logEntry);
  }

  // Console output with colors
  const styles: Record<LogLevel, string> = {
    [LogLevel.INFO]: 'color: #2196F3; font-weight: bold',
    [LogLevel.SUCCESS]: 'color: #4CAF50; font-weight: bold',
    [LogLevel.WARNING]: 'color: #FF9800; font-weight: bold',
    [LogLevel.ERROR]: 'color: #F44336; font-weight: bold',
    [LogLevel.DEBUG]: 'color: #9E9E9E; font-weight: bold',
  };

  // In production, use simple console methods for errors/warnings
  if (!IS_DEV) {
    if (level === LogLevel.ERROR) {
      console.error(`[${category}] ${message}`, data || '');
    } else if (level === LogLevel.WARNING) {
      console.warn(`[${category}] ${message}`, data || '');
    }
    return;
  }

  // Development: Fancy colored logs
  console.log(`%c[${level}] ${timestamp} - ${category}`, styles[level], message, data || '');
};

/**
 * Info log
 */
export const info = (category: string, message: string, data?: any): void => {
  log(LogLevel.INFO, category, message, data);
};

/**
 * Success log
 */
export const success = (category: string, message: string, data?: any): void => {
  log(LogLevel.SUCCESS, category, message, data);
};

/**
 * Warning log
 */
export const warning = (category: string, message: string, data?: any): void => {
  log(LogLevel.WARNING, category, message, data);
};

/**
 * Error log
 */
export const error = (category: string, message: string, data?: any): void => {
  log(LogLevel.ERROR, category, message, data);
};

/**
 * Debug log
 */
export const debug = (category: string, message: string, data?: any): void => {
  log(LogLevel.DEBUG, category, message, data);
};

/**
 * Alias for warning (for backward compatibility)
 */
export const warn = warning;

/**
 * Clear all logs
 */
export const clearLogs = (): void => {
  localStorage.removeItem(LOG_STORAGE_KEY);
  console.clear();
  info('LOGGER', 'All logs cleared');
};

/**
 * Export logs as text file
 */
export const exportLogs = (filename: string | null = null): void => {
  const logs = getLogs();
  const logText = logs
    .map(
      (log) =>
        `[${log.level}] ${log.timestamp} - ${log.category}\n${log.message}\n${log.data || ''}\n${'='.repeat(80)}\n`
    )
    .join('\n');

  const blob = new Blob([logText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `app-logs-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  success('LOGGER', 'Logs exported successfully');
};

/**
 * Auto-export logs every N minutes
 * @param {number} intervalMinutes - Export interval in minutes
 */
export const startAutoExport = (intervalMinutes: number = 30): void => {
  const intervalMs = intervalMinutes * 60 * 1000;

  setInterval(() => {
    const logs = getLogs();
    if (logs.length > 0) {
      const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
      exportLogs(`auto-logs-${timestamp}.txt`);
      info('LOGGER', `Auto-exported ${logs.length} logs`);
    }
  }, intervalMs);

  info('LOGGER', `Auto-export started (every ${intervalMinutes} minutes)`);
};

/**
 * Save logs to console storage for debugging
 */
export const saveLogsToConsole = (): void => {
  const logs = getLogs();
  console.log('%c=== APPLICATION LOGS ===', 'font-size: 16px; font-weight: bold; color: #2196F3');
  console.table(logs.slice(-20));
  console.log('%c=== END OF LOGS ===', 'font-size: 16px; font-weight: bold; color: #2196F3');
};

export interface LogsSummary {
  total: number;
  byLevel: {
    INFO: number;
    SUCCESS: number;
    WARNING: number;
    ERROR: number;
    DEBUG: number;
  };
  lastLog: LogEntry | undefined;
}

/**
 * Get logs summary
 */
export const getLogsSummary = (): LogsSummary => {
  const logs = getLogs();
  return {
    total: logs.length,
    byLevel: {
      INFO: logs.filter((l) => l.level === LogLevel.INFO).length,
      SUCCESS: logs.filter((l) => l.level === LogLevel.SUCCESS).length,
      WARNING: logs.filter((l) => l.level === LogLevel.WARNING).length,
      ERROR: logs.filter((l) => l.level === LogLevel.ERROR).length,
      DEBUG: logs.filter((l) => l.level === LogLevel.DEBUG).length,
    },
    lastLog: logs[logs.length - 1],
  };
};

export default {
  info,
  success,
  warning,
  warn,
  error,
  debug,
  getLogs,
  clearLogs,
  exportLogs,
  getLogsSummary,
  startAutoExport,
  saveLogsToConsole,
};
