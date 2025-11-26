/**
 * API Error Handler Utilities
 * Provides centralized error handling for API calls
 * Port from frontend-v2 with TypeScript typing
 */

/**
 * API Error structure
 */
interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

/**
 * Extract error message from API response
 * @param error - Error object
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: ApiError | Error | unknown): string => {
  // Type guard for API error
  const apiError = error as ApiError;

  // Check if it's an API error with response
  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  }

  // Check if it's a network error
  if (apiError.message === 'Network Error') {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  }

  // Check HTTP status codes
  if (apiError.response?.status) {
    switch (apiError.response.status) {
      case 400:
        return 'Datos inválidos. Por favor verifica la información ingresada.';
      case 401:
        return 'No autorizado. Por favor inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'El recurso ya existe o hay un conflicto con los datos.';
      case 500:
        return 'Error interno del servidor. Por favor intenta más tarde.';
      default:
        return `Error del servidor: ${apiError.response.status}`;
    }
  }

  // Default error message
  return apiError.message || 'Ha ocurrido un error inesperado.';
};

/**
 * Notification function type
 */
type NotificationFn = (message: string, type: 'error' | 'success' | 'info' | 'warning') => void;

/**
 * Handle API error and show notification
 * @param error - Error object
 * @param notificationFn - Notification function (optional)
 * @returns Error message
 */
export const handleApiError = (error: ApiError | Error | unknown, notificationFn: NotificationFn | null = null): string => {
  const apiError = error as ApiError;
  const message = getErrorMessage(error);

  // Log error for debugging
  console.error('API Error:', {
    message: apiError.message,
    status: apiError.response?.status,
    data: apiError.response?.data
  });

  // Call notification function if provided
  if (notificationFn && typeof notificationFn === 'function') {
    notificationFn(message, 'error');
  }

  return message;
};

/**
 * Validation result type
 */
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate required fields
 * @param data - Data object to validate
 * @param requiredFields - Array of required field names
 * @returns Validation result { isValid, errors }
 */
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): ValidationResult => {
  const errors: Record<string, string> = {};

  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} es requerido`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation result
 */
interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result { isValid, errors }
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number (basic validation)
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  // Check if it's 10-15 digits
  return /^\d{10,15}$/.test(cleanPhone);
};

/**
 * Format validation errors for display
 * @param errors - Errors object
 * @returns Formatted error message
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.values(errors).join('\n');
};

export default {
  getErrorMessage,
  handleApiError,
  validateRequiredFields,
  isValidEmail,
  validatePassword,
  isValidPhone,
  formatValidationErrors
};
