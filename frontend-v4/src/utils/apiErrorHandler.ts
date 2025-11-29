/**
 * API Error Handler Utilities
 * Provides centralized error handling for API calls
 */

interface ApiErrorData {
  message?: string
  [key: string]: unknown
}

export interface ApiErrorLike extends Error {
  response?: {
    status?: number
    data?: ApiErrorData
  }
  code?: string
}

const ensureError = (error: unknown): ApiErrorLike => {
  if (error instanceof Error) {
    return error as ApiErrorLike
  }

  return {
    name: 'UnknownError',
    message: typeof error === 'string' ? error : 'Ha ocurrido un error inesperado.',
  } as ApiErrorLike
}

/**
 * Extract error message from API response
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (incomingError: unknown): string => {
  const error = ensureError(incomingError)
  // Check if it's an API error with response
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  
  // Check if it's a network error
  if (error.message === 'Network Error') {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.'
  }
  
  // Check HTTP status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Datos inválidos. Por favor verifica la información ingresada.'
      case 401:
        return 'No autorizado. Por favor inicia sesión nuevamente.'
      case 403:
        return 'No tienes permisos para realizar esta acción.'
      case 404:
        return 'Recurso no encontrado.'
      case 409:
        return 'El recurso ya existe o hay un conflicto con los datos.'
      case 500:
        return 'Error interno del servidor. Por favor intenta más tarde.'
      default:
        return `Error del servidor: ${error.response.status}`
    }
  }
  
  // Default error message
  return error.message || 'Ha ocurrido un error inesperado.'
}

/**
 * Handle API error and show notification
 * @param {Error} error - Error object
 * @param {Function} notificationFn - Notification function (optional)
 * @returns {string} - Error message
 */
type NotificationFn = (message: string, severity?: 'error' | 'info' | 'success' | 'warning') => void

export const handleApiError = (error: unknown, notificationFn: NotificationFn | null = null): string => {
  const message = getErrorMessage(error)
  const apiError = ensureError(error)
  
  // Log error for debugging
  console.error('API Error:', {
    message: apiError.message,
    status: apiError.response?.status,
    data: apiError.response?.data
  })
  
  // Call notification function if provided
  if (typeof notificationFn === 'function') {
    notificationFn(message, 'error')
  }
  
  return message
}

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} - Validation result { isValid, errors }
 */
export const validateRequiredFields = <T extends Record<string, unknown>>(data: T, requiredFields: string[]) => {
  const errors: Record<string, string> = {}
  
  requiredFields.forEach((field) => {
    const value = data[field as keyof T]
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      errors[field] = `${field} es requerido`
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result { isValid, errors }
 */
export const validatePassword = (password: string) => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '')
  // Check if it's 10-15 digits
  return /^\d{10,15}$/.test(cleanPhone)
}

/**
 * Format validation errors for display
 * @param {Object} errors - Errors object
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.values(errors).join('\n')
}

export default {
  getErrorMessage,
  handleApiError,
  validateRequiredFields,
  isValidEmail,
  validatePassword,
  isValidPhone,
  formatValidationErrors
}
