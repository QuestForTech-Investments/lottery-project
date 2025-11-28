/**
 * Formatting Utilities
 * Common data formatting functions
 */

/**
 * Format date to locale string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale (default: 'es-ES')
 * @returns {string} - Formatted date
 */
type DateInput = string | number | Date | null | undefined

export const formatDate = (date: DateInput, locale = 'es-ES'): string => {
  if (!date) return '-'
  
  try {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

/**
 * Format date and time to locale string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale (default: 'es-ES')
 * @returns {string} - Formatted date and time
 */
export const formatDateTime = (date: DateInput, locale = 'es-ES'): string => {
  if (!date) return '-'
  
  try {
    return new Date(date).toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date time:', error)
    return '-'
  }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale (default: 'en-US')
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount: number | null | undefined, currency = 'USD', locale = 'en-US'): string => {
  if (amount === null || amount === undefined) return '-'
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount)
  } catch (error) {
    console.error('Error formatting currency:', error)
    return `${amount}`
  }
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimals (default: 2)
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined) return '-'
  
  return `${value.toFixed(decimals)}%`
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-'
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX for 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  // Return original if not 10 digits
  return phone
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text: string | null | undefined, maxLength = 50): string => {
  if (!text) return '-'
  
  if (text.length <= maxLength) return text
  
  return `${text.slice(0, maxLength)}...`
}

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalizeFirst = (text: string | null | undefined): string => {
  if (!text) return ''
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Format user status
 * @param {boolean} isActive - Active status
 * @returns {Object} - Status object with label and class
 */
export const formatUserStatus = (isActive: boolean) => {
  return {
    label: isActive ? 'Activo' : 'Inactivo',
    className: isActive ? 'badge-success' : 'badge-secondary',
    color: isActive ? 'green' : 'gray'
  }
}

/**
 * Format full name from user object
 * @param {Object} user - User object
 * @returns {string} - Full name or username
 */
interface UserDisplay {
  fullName?: string | null
  username?: string | null
}

export const formatUserDisplayName = (user?: UserDisplay | null): string => {
  if (!user) return '-'
  
  return user.fullName || user.username || '-'
}

/**
 * Format list to string
 * @param {Array} list - Array to format
 * @param {string} separator - Separator (default: ', ')
 * @returns {string} - Formatted list
 */
export const formatList = (list: Array<string | number> | null | undefined, separator = ', '): string => {
  if (!list || list.length === 0) return '-'
  
  return list.join(separator)
}

export default {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatPercentage,
  formatPhone,
  truncateText,
  capitalizeFirst,
  formatUserStatus,
  formatUserDisplayName,
  formatList
}
