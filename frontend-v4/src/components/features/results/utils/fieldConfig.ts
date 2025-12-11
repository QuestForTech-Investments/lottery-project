/**
 * Field Configuration Utilities
 *
 * Unified functions for field configuration, max lengths, and enabled fields.
 * Uses betTypeCompatibilityService for consistent categorization across the app.
 */

import { getDrawCategory } from '@services/betTypeCompatibilityService';
import type { EnabledFields } from '../types';
import { FIELD_MAX_LENGTHS, FIELD_WIDTHS } from '../constants';

// =============================================================================
// Field Length Functions
// =============================================================================

/**
 * Get the maximum length for a field
 * Unified function that replaces both getMaxLength and getIndividualMaxLength
 *
 * @param field - The field name
 * @returns Maximum number of characters allowed
 */
export const getMaxLength = (field: string): number => {
  return FIELD_MAX_LENGTHS[field] ?? 2;
};

/**
 * Alias for backwards compatibility
 * @deprecated Use getMaxLength instead
 */
export const getIndividualMaxLength = getMaxLength;

/**
 * Get the width for a field input
 *
 * @param field - The field name
 * @returns Width in pixels
 */
export const getFieldWidth = (field: string): number => {
  return FIELD_WIDTHS[field] ?? 40;
};

// =============================================================================
// Enabled Fields Configuration
// =============================================================================

/**
 * Default all fields disabled
 */
const ALL_DISABLED: EnabledFields = {
  num1: false,
  num2: false,
  num3: false,
  cash3: false,
  play4: false,
  pick5: false,
  bolita1: false,
  bolita2: false,
  singulaccion1: false,
  singulaccion2: false,
  singulaccion3: false,
};

/**
 * Cache for enabled fields by draw name
 * Prevents recalculation on every render
 */
const enabledFieldsCache = new Map<string, EnabledFields>();

/**
 * Get enabled fields configuration based on draw name/category
 *
 * Uses betTypeCompatibilityService for consistent categorization.
 * Results are cached to avoid recalculation.
 *
 * @param drawName - Name of the draw (e.g., "NACIONAL", "TEXAS AM")
 * @returns Object indicating which fields are enabled
 */
export const getEnabledFields = (drawName: string): EnabledFields => {
  // Check cache first
  const cached = enabledFieldsCache.get(drawName);
  if (cached) return cached;

  const category = getDrawCategory(drawName);
  let result: EnabledFields;

  switch (category) {
    case 'DOMINICAN':
    case 'ANGUILA':
    case 'PANAMA':
      // Dominican, Anguila and Panama lotteries - only num1, num2, num3
      // Used for Directo, Palé, Tripleta
      result = { ...ALL_DISABLED, num1: true, num2: true, num3: true };
      break;

    case 'USA':
      // USA lotteries (TEXAS, FLORIDA, etc.)
      // Full set: 1ra, 2da, 3ra, Cash 3, Pick Four, bolita 1, bolita 2, Singulaccion 1-3
      // Note: Pick five is NOT used for Texas
      result = {
        ...ALL_DISABLED,
        num1: true,
        num2: true,
        num3: true,
        cash3: true,
        play4: true,
        pick5: false,
        bolita1: true,
        bolita2: true,
        singulaccion1: true,
        singulaccion2: true,
        singulaccion3: true,
      };
      break;

    case 'SUPER_PALE':
      // Super Pale - uses num1/num2 for the paired numbers
      result = { ...ALL_DISABLED, num1: true, num2: true };
      break;

    case 'GENERAL':
    default:
      // Unknown category - show all fields and let user decide
      result = {
        num1: true,
        num2: true,
        num3: true,
        cash3: true,
        play4: true,
        pick5: true,
        bolita1: true,
        bolita2: true,
        singulaccion1: true,
        singulaccion2: true,
        singulaccion3: true,
      };
  }

  // Cache the result
  enabledFieldsCache.set(drawName, result);
  return result;
};

/**
 * Clear the enabled fields cache
 * Useful for testing or when draw categories change
 */
export const clearEnabledFieldsCache = (): void => {
  enabledFieldsCache.clear();
};

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate that a lottery number is valid (2 digits, 00-99)
 *
 * @param value - The value to validate
 * @returns true if valid or empty, false otherwise
 */
export const isValidLotteryNumber = (value: string): boolean => {
  if (!value) return true; // Empty is valid (means not filled yet)
  return /^\d{2}$/.test(value);
};

/**
 * Check if a winning number has a date-like pattern
 * This helps detect data entry errors
 *
 * @param winningNumber - Combined winning number (e.g., "074725")
 * @returns true if the pattern looks like a date
 */
export const hasDateLikePattern = (winningNumber: string): boolean => {
  // Check for YYYYMM patterns like "202512" (2025-12)
  if (/^202[45]\d{2}$/.test(winningNumber)) return true;
  // Check for MMYYYY patterns
  if (/^\d{2}202[45]$/.test(winningNumber)) return true;
  // Check for YYYYMMDD patterns
  if (/^202[45](0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/.test(winningNumber)) return true;
  return false;
};

/**
 * Sanitize input to only allow digits
 *
 * @param value - The input value
 * @returns Value with only digit characters
 */
export const sanitizeNumberInput = (value: string): string => {
  return value.replace(/\D/g, '');
};
