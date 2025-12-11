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
      // Only Cash3 and Play4 are editable - all other fields are auto-calculated
      // Algorithm: Given Cash3="ABC" and Play4="DEFG":
      //   - num1 (1ra) = BC (bolita2)
      //   - num2 (2da) = DE
      //   - num3 (3ra) = FG
      //   - bolita1 = AB
      //   - bolita2 = BC
      //   - singulaccion1/2/3 = A, B, C
      //   - pick5 = ABC + DE = Cash3 + 2da
      result = {
        ...ALL_DISABLED,
        num1: false,       // Auto-calculated from bolita2
        num2: false,       // Auto-calculated from play4[0:2]
        num3: false,       // Auto-calculated from play4[2:4]
        cash3: true,       // EDITABLE - primary input
        play4: true,       // EDITABLE - primary input
        pick5: false,      // Auto-calculated
        bolita1: false,    // Auto-calculated from cash3[0:2]
        bolita2: false,    // Auto-calculated from cash3[1:3]
        singulaccion1: false,  // Auto-calculated from cash3[0]
        singulaccion2: false,  // Auto-calculated from cash3[1]
        singulaccion3: false,  // Auto-calculated from cash3[2]
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

// =============================================================================
// USA Lottery Auto-Calculation
// =============================================================================

/**
 * Auto-calculated fields for USA lotteries
 */
export interface UsaAutoCalculatedFields {
  num1: string;       // 1ra = bolita2 (BC)
  num2: string;       // 2da = DE
  num3: string;       // 3ra = FG
  bolita1: string;    // AB
  bolita2: string;    // BC
  singulaccion1: string;  // A
  singulaccion2: string;  // B
  singulaccion3: string;  // C
  pick5: string;      // Cash3 + 2da = ABC + DE
}

/**
 * Auto-calculate all derived fields for USA lotteries from Cash3 and Play4
 *
 * Algorithm:
 * Given Cash3 = "ABC" (3 digits) and Play4 = "DEFG" (4 digits):
 *   - singulaccion1 = A
 *   - singulaccion2 = B
 *   - singulaccion3 = C
 *   - bolita1 = AB
 *   - bolita2 = BC
 *   - num1 (1ra) = BC (same as bolita2)
 *   - num2 (2da) = DE
 *   - num3 (3ra) = FG
 *   - pick5 = ABC + DE (Cash3 + 2da)
 *
 * @param cash3 - 3-digit Cash3 number (e.g., "583")
 * @param play4 - 4-digit Play4/Pick Four number (e.g., "4173")
 * @returns Object with all auto-calculated fields
 *
 * @example
 * calculateUsaFields("583", "4173")
 * // Returns:
 * // {
 * //   num1: "83",
 * //   num2: "41",
 * //   num3: "73",
 * //   bolita1: "58",
 * //   bolita2: "83",
 * //   singulaccion1: "5",
 * //   singulaccion2: "8",
 * //   singulaccion3: "3",
 * //   pick5: "58341"
 * // }
 */
export const calculateUsaFields = (cash3: string, play4: string): UsaAutoCalculatedFields => {
  // Ensure proper format with leading zeros
  const c3 = (cash3 || '').padStart(3, '0').slice(0, 3);
  const p4 = (play4 || '').padStart(4, '0').slice(0, 4);

  // Extract individual digits
  const A = c3[0] || '0';
  const B = c3[1] || '0';
  const C = c3[2] || '0';

  const D = p4[0] || '0';
  const E = p4[1] || '0';
  const F = p4[2] || '0';
  const G = p4[3] || '0';

  // Calculate derived values
  const bolita1 = A + B;
  const bolita2 = B + C;
  const segunda = D + E;
  const tercera = F + G;

  return {
    num1: bolita2,      // 1ra = bolita2
    num2: segunda,      // 2da = first 2 digits of play4
    num3: tercera,      // 3ra = last 2 digits of play4
    bolita1,
    bolita2,
    singulaccion1: A,
    singulaccion2: B,
    singulaccion3: C,
    pick5: c3 + segunda,  // Cash3 + 2da
  };
};

/**
 * Check if a field should trigger USA auto-calculation
 */
export const isUsaTriggerField = (field: string): boolean => {
  return field === 'cash3' || field === 'play4';
};
