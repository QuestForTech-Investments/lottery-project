/**
 * Formatting Utilities
 * Common data formatting functions. Date/time/percent formatters honor the
 * active i18n language; pass an explicit `locale` to override.
 */

import i18n from '../i18n/config'

type DateInput = string | number | Date | null | undefined

// Map our i18n language codes to BCP-47 locale tags. `ht` (Haitian Creole)
// has limited Intl support across browsers — fall back to `fr-FR` which is
// the closest language for date/number formatting.
const LOCALE_MAP: Record<string, string> = {
  es: 'es-DO',
  en: 'en-US',
  fr: 'fr-FR',
  ht: 'fr-FR',
}

/** Resolve the active locale from i18n unless caller provided one. */
const resolveLocale = (override?: string): string => {
  if (override) return override
  const lang = (i18n.language || 'es').split('-')[0]
  return LOCALE_MAP[lang] || 'es-DO'
}

/** Public helper: get the BCP-47 locale for the active i18n language. */
export const getActiveLocale = (): string => resolveLocale()

export const formatDate = (date: DateInput, locale?: string): string => {
  if (!date) return '-'

  try {
    return new Date(date).toLocaleDateString(resolveLocale(locale), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

export const formatDateTime = (date: DateInput, locale?: string): string => {
  if (!date) return '-'

  try {
    return new Date(date).toLocaleString(resolveLocale(locale), {
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
 * Short numeric date, e.g. "20/05/2026". Useful in table cells where the
 * long form takes too much space.
 */
export const formatDateShort = (date: DateInput, locale?: string): string => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString(resolveLocale(locale))
  } catch {
    return '-'
  }
}

/**
 * Time-of-day formatter, e.g. "14:30" or "2:30 PM" depending on locale.
 */
export const formatTime = (date: DateInput, locale?: string, withSeconds = false): string => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleTimeString(resolveLocale(locale), {
      hour: '2-digit',
      minute: '2-digit',
      ...(withSeconds && { second: '2-digit' }),
    })
  } catch {
    return '-'
  }
}

/**
 * Currency stays in `en-US` by default because USD formatting is the canonical
 * representation users expect; pass a locale to override for display tweaks.
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

/**
 * Get today's date in Santo Domingo timezone (YYYY-MM-DD)
 * Use this instead of new Date().toISOString().split('T')[0]
 * to avoid UTC offset issues (e.g. 8 PM Santo Domingo = next day in UTC)
 */
export const getTodayDate = (): string => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' });
}

export default {
  formatDate,
  formatDateTime,
  formatDateShort,
  formatTime,
  formatCurrency,
  formatPercentage,
  formatPhone,
  truncateText,
  capitalizeFirst,
  formatUserStatus,
  formatUserDisplayName,
  formatList,
  getTodayDate
}
