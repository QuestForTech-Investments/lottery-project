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
 * Draws that only have "1ra" (first number) - no other bet types
 * These are special draws that only show a single winning number
 */
const SINGLE_NUMBER_DRAWS = [
  'LA CHICA',
  'DIARIA 11AM',
  'DIARIA 3PM',
  'DIARIA 9PM',
  'FL PICK2 AM',
  'FL PICK2 PM',
];

/**
 * Draws that only have Play4 (4 numbers) - no Cash3/Pick3
 * Massachusetts lottery only draws 4 numbers, not 3
 */
const PLAY4_ONLY_DRAWS = [
  'MASS AM',
  'MASS PM',
];

/**
 * Super Palé draws that are auto-calculated from source draw results.
 * SUPER PALE TARDE = Real(1ra) + Gana Más(1ra)
 * SUPER PALE NOCHE = Nacional(1ra) + Quiniela Palé(1ra)
 * NOTE: NY-FL variants are NOT auto-calculated (manual entry)
 */
const SUPER_PALE_AUTO_DRAWS = ['SUPER PALE TARDE', 'SUPER PALE NOCHE'];

/**
 * Mapping of source draw names to their Super Palé target draw and field.
 * When a source draw's num1 (1ra) is entered, the target Super Palé draw's field is auto-populated.
 */
export const SUPER_PALE_SOURCE_MAP: Record<string, { targetDraw: string; targetField: 'num1' | 'num2' }> = {
  'REAL': { targetDraw: 'SUPER PALE TARDE', targetField: 'num1' },
  'GANA MAS': { targetDraw: 'SUPER PALE TARDE', targetField: 'num2' },
  'NACIONAL': { targetDraw: 'SUPER PALE NOCHE', targetField: 'num1' },
  'QUINIELA PALE': { targetDraw: 'SUPER PALE NOCHE', targetField: 'num2' },
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

  // Check for single-number draws first (only 1ra)
  const normalizedName = drawName.toUpperCase().trim();
  if (SINGLE_NUMBER_DRAWS.some(d => normalizedName.includes(d) || d.includes(normalizedName))) {
    const result = { ...ALL_DISABLED, num1: true };
    enabledFieldsCache.set(drawName, result);
    return result;
  }

  // Check for Play4-only draws (Massachusetts - only has 4 numbers, no Pick3)
  if (PLAY4_ONLY_DRAWS.some(d => normalizedName.includes(d) || d.includes(normalizedName))) {
    const result = {
      ...ALL_DISABLED,
      play4: true,       // Only Play4 is editable - Massachusetts only draws 4 numbers
    };
    enabledFieldsCache.set(drawName, result);
    return result;
  }

  // Super Palé auto-calculated draws (Tarde/Noche) - all fields readonly, populated from source draws
  if (SUPER_PALE_AUTO_DRAWS.some(d => normalizedName.includes(d))) {
    const result = { ...ALL_DISABLED };
    enabledFieldsCache.set(drawName, result);
    return result;
  }

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

/**
 * Auto-calculated fields for Play4-only lotteries (Massachusetts)
 */
export interface Play4OnlyCalculatedFields {
  num1: string;       // 1ra = AB (overlapping)
  num2: string;       // 2da = BC (overlapping)
  num3: string;       // 3ra = CD (overlapping)
  cash3: string;      // Pick3 = ABC (first 3 digits)
}

/**
 * Auto-calculate derived fields for Play4-only lotteries (Massachusetts)
 *
 * Algorithm (overlapping derivation):
 * Given Play4 = "ABCD" (4 digits):
 *   - num1 (1ra) = AB
 *   - num2 (2da) = BC
 *   - num3 (3ra) = CD
 *   - cash3 (Pick3) = ABC
 *
 * @param play4 - 4-digit Play4 number (e.g., "0124")
 * @returns Object with auto-calculated fields
 *
 * @example
 * calculatePlay4OnlyFields("0124")
 * // Returns: { num1: "01", num2: "12", num3: "24", cash3: "012" }
 */
export const calculatePlay4OnlyFields = (play4: string): Play4OnlyCalculatedFields => {
  const r = (play4 || '').padStart(4, '0').slice(0, 4);
  return {
    num1: r[0] + r[1],
    num2: r[1] + r[2],
    num3: r[2] + r[3],
    cash3: r[0] + r[1] + r[2],
  };
};

/**
 * Check if a draw is Play4-only (Massachusetts)
 */
export const isPlay4OnlyDraw = (drawName: string): boolean => {
  const normalizedName = drawName.toUpperCase().trim();
  return PLAY4_ONLY_DRAWS.some(d => normalizedName.includes(d) || d.includes(normalizedName));
};

// =============================================================================
// Super Palé Auto-Calculation
// =============================================================================

/**
 * Check if a draw is a Super Palé auto-calculated draw (Tarde/Noche only)
 */
export const isSuperPaleAutoDraw = (drawName: string): boolean => {
  const normalized = drawName.toUpperCase().trim();
  return SUPER_PALE_AUTO_DRAWS.some(d => normalized.includes(d));
};

/**
 * Get the Super Palé target for a source draw.
 * Returns null if the draw is not a Super Palé source.
 *
 * @example
 * getSuperPaleTarget('REAL') // { targetDraw: 'SUPER PALE TARDE', targetField: 'num1' }
 * getSuperPaleTarget('GANA MAS') // { targetDraw: 'SUPER PALE TARDE', targetField: 'num2' }
 * getSuperPaleTarget('LOTEKA') // null
 */
export const getSuperPaleTarget = (sourceDrawName: string): { targetDraw: string; targetField: 'num1' | 'num2' } | null => {
  const normalized = sourceDrawName.toUpperCase().trim();
  for (const [source, target] of Object.entries(SUPER_PALE_SOURCE_MAP)) {
    if (normalized.includes(source) || source.includes(normalized)) {
      return target;
    }
  }
  return null;
};

// =============================================================================
// Validation Functions
// =============================================================================

import type { DrawResultRow } from '../types';

interface ValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Validate a result row before saving
 */
export const validateResultRow = (row: DrawResultRow): ValidationResult => {
  // Play4-only draws (Massachusetts): play4 must be exactly 4 digits
  if (isPlay4OnlyDraw(row.drawName)) {
    if (!row.play4 || !/^\d{4}$/.test(row.play4)) {
      return { valid: false, error: 'El resultado debe ser exactamente 4 dígitos' };
    }
    return { valid: true, error: null };
  }

  // Super Palé auto-calculated draws: num1 and num2 are required
  if (isSuperPaleAutoDraw(row.drawName)) {
    if (!row.num1 || !/^\d{2}$/.test(row.num1)) {
      return { valid: false, error: 'Falta 1ra (resultado fuente no publicado)' };
    }
    if (!row.num2 || !/^\d{2}$/.test(row.num2)) {
      return { valid: false, error: 'Falta 2da (resultado fuente no publicado)' };
    }
    return { valid: true, error: null };
  }

  if (row.num1 && !isValidLotteryNumber(row.num1)) {
    return { valid: false, error: `"${row.num1}" no es un numero valido (debe ser 2 digitos)` };
  }
  if (row.num2 && !isValidLotteryNumber(row.num2)) {
    return { valid: false, error: `"${row.num2}" no es un numero valido (debe ser 2 digitos)` };
  }
  if (row.num3 && !isValidLotteryNumber(row.num3)) {
    return { valid: false, error: `"${row.num3}" no es un numero valido (debe ser 2 digitos)` };
  }

  const combined = row.num1 + row.num2 + row.num3;
  if (combined && hasDateLikePattern(combined)) {
    return {
      valid: false,
      error: `El resultado "${combined}" parece una fecha. Verifique los numeros.`,
    };
  }

  return { valid: true, error: null };
};
