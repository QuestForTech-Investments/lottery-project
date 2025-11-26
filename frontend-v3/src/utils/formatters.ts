/**
 * Formatting Utilities
 * Common data formatting functions
 * Port from frontend-v2 with TypeScript typing
 */

/**
 * Format date to locale string
 * @param date - Date to format
 * @param locale - Locale (default: 'es-ES')
 * @returns Formatted date
 */
export const formatDate = (date: string | Date | null | undefined, locale: string = 'es-ES'): string => {
  if (!date) return '-';

  try {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format date and time to locale string
 * @param date - Date to format
 * @param locale - Locale (default: 'es-ES')
 * @returns Formatted date and time
 */
export const formatDateTime = (date: string | Date | null | undefined, locale: string = 'es-ES'): string => {
  if (!date) return '-';

  try {
    return new Date(date).toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '-';
  }
};

/**
 * Format currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale (default: 'en-US')
 * @returns Formatted currency
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = 'USD', locale: string = 'en-US'): string => {
  if (amount === null || amount === undefined) return '-';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount}`;
  }
};

/**
 * Format percentage
 * @param value - Value to format
 * @param decimals - Number of decimals (default: 2)
 * @returns Formatted percentage
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined) return '-';

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format phone number
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Return original if not 10 digits
  return phone;
};

/**
 * Truncate text
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return '-';

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeFirst = (text: string | null | undefined): string => {
  if (!text) return '';

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * User status format result
 */
interface UserStatusFormat {
  label: string;
  className: string;
  color: string;
}

/**
 * Format user status
 * @param isActive - Active status
 * @returns Status object with label and class
 */
export const formatUserStatus = (isActive: boolean): UserStatusFormat => {
  return {
    label: isActive ? 'Activo' : 'Inactivo',
    className: isActive ? 'badge-success' : 'badge-secondary',
    color: isActive ? 'green' : 'gray'
  };
};

/**
 * User object type
 */
interface User {
  fullName?: string | null;
  username?: string | null;
}

/**
 * Format full name from user object
 * @param user - User object
 * @returns Full name or username
 */
export const formatUserDisplayName = (user: User | null | undefined): string => {
  if (!user) return '-';

  return user.fullName || user.username || '-';
};

/**
 * Format list to string
 * @param list - Array to format
 * @param separator - Separator (default: ', ')
 * @returns Formatted list
 */
export const formatList = (list: any[] | null | undefined, separator: string = ', '): string => {
  if (!list || !Array.isArray(list) || list.length === 0) return '-';

  return list.join(separator);
};

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
};
