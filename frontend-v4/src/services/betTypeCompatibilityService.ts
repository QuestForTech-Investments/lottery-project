/**
 * Bet Type Compatibility Service
 * Maps which bet types are compatible with each lottery/draw type
 * Based on analysis of Vue.js original application (la-numbers.apk.lol)
 *
 * @fileoverview This service provides bet type filtering by draw/lottery
 */

interface BetType {
  betTypeId?: number;
  betTypeName?: string;
  betTypeCode?: string;
  description?: string;
  prizeFields?: unknown[];
}

/**
 * Bet type codes organized by category
 * IMPORTANT: These codes must match EXACTLY the betTypeCode values from the API
 * Some codes exist in multiple formats (with spaces and underscores)
 */
export const BET_TYPE_CODES = {
  // Basic bet types (all lotteries) - Note: PALÉ has accent
  BASIC: ['DIRECTO', 'PALÉ', 'TRIPLETA'],

  // USA lottery specific bet types
  // Includes both formats: with spaces and with underscores
  USA: [
    // Cash3 variants
    'CASH3 STRAIGHT', 'CASH3_STRAIGHT',
    'CASH3 BOX', 'CASH3_BOX',
    'CASH3 FRONT STRAIGHT',
    'CASH3 FRONT BOX', 'CASH3_FRONT_BOX',
    'CASH3 BACK STRAIGHT', 'CASH3_BACK_STRAIGHT',
    'CASH3 BACK BOX',
    // Play4 variants
    'PLAY4 STRAIGHT', 'PLAY4 BOX',
    // Pick5 variants
    'PICK5 STRAIGHT', 'PICK5 BOX',
    // Bolita
    'BOLITA 1', 'BOLITA 2',
    // Singulación (with and without accent)
    'SINGULACION', 'SINGULACIÓN 1', 'SINGULACIÓN 2', 'SINGULACIÓN 3',
    // Pick Two variants
    'PICK TWO', 'PICK TWO FRONT', 'PICK TWO BACK', 'PICK TWO MIDDLE',
    'PICK2'
  ],

  // Pick Two only (2-digit draws like FL PICK2, LA CHICA, DIARIA)
  PICK_TWO: ['PICK TWO'],

  // Cash3 6x1 draws (Cash3 variants only)
  CASH3_6X1: [
    'CASH3 STRAIGHT', 'CASH3_STRAIGHT',
    'CASH3 BOX', 'CASH3_BOX',
    'CASH3 FRONT STRAIGHT', 'CASH3_FRONT_BOX',
    'CASH3 BACK STRAIGHT', 'CASH3_BACK_STRAIGHT',
    'CASH3 BACK BOX',
  ],

  // Super Pale specific - Note: PALÉ has accent
  // API has both formats
  SUPER_PALE: ['SUPER PALÉ', 'SUPER_PALE'],

  // Panama specific
  PANAMA: ['PANAMA']
} as const;

/**
 * Draw categories - maps draw names to their bet type categories
 * This determines which bet types are available for each draw
 */
export const DRAW_CATEGORIES = {
  // Dominican lotteries - only basic bet types (Directo, Palé, Tripleta)
  DOMINICAN: [
    'LA PRIMERA', 'LA PRIMERA 8PM', 'GANA MAS', 'NACIONAL',
    'QUINIELA PALE', 'REAL', 'LOTEKA', 'LOTEDOM',
    'King Lottery AM', 'King Lottery PM',
    'L.E. PUERTO RICO 2PM', 'L.E. PUERTO RICO 10PM',
    'LA SUERTE', 'LA SUERTE 6:00pm'
  ],

  // USA lotteries - basic + USA bet types (full set)
  USA: [
    'NEW YORK DAY', 'NEW YORK NIGHT',
    'FLORIDA AM', 'FLORIDA PM',
    'GEORGIA-MID AM', 'GEORGIA EVENING', 'GEORGIA NIGHT',
    'NEW JERSEY AM', 'NEW JERSEY PM',
    'CONNECTICUT AM', 'CONNECTICUT PM',
    'CALIFORNIA AM', 'CALIFORNIA PM',
    'CHICAGO AM', 'CHICAGO PM',
    'PENN MIDDAY', 'PENN EVENING',
    'INDIANA MIDDAY', 'INDIANA EVENING',
    'TEXAS MORNING', 'TEXAS DAY', 'TEXAS EVENING', 'TEXAS NIGHT',
    'VIRGINIA AM', 'VIRGINIA PM',
    'SOUTH CAROLINA AM', 'SOUTH CAROLINA PM',
    'MARYLAND MIDDAY', 'MARYLAND EVENING',
    'MASS AM', 'MASS PM',
    'NORTH CAROLINA AM', 'NORTH CAROLINA PM',
    'DELAWARE AM', 'DELAWARE PM',
  ],

  // Pick Two only draws (2-digit draws)
  PICK_TWO: [
    'FL PICK2 AM', 'FL PICK2 PM',
    'LA CHICA',
    'DIARIA 11AM', 'DIARIA 3PM', 'DIARIA 9PM',
  ],

  // Cash3 6x1 draws (Cash3 variants only)
  CASH3_6X1: [
    'NY AM 6x1', 'NY PM 6x1', 'FL AM 6X1', 'FL PM 6X1',
  ],

  // Super Pale draws - only Super Pale bet type
  SUPER_PALE: [
    'SUPER PALE TARDE', 'SUPER PALE NOCHE',
    'SUPER PALE NY-FL AM', 'SUPER PALE NY-FL PM'
  ],

  // Panama draws - basic + Panama bet type
  PANAMA: [
    'PANAMA MIERCOLES', 'PANAMA DOMINGO'
  ],

  // Anguila - treat like Dominican (basic only)
  ANGUILA: [
    'Anguila 1pm', 'Anguila 6PM', 'Anguila 9pm', 'Anguila 10am'
  ]
} as const;

type DrawCategory = 'DOMINICAN' | 'USA' | 'SUPER_PALE' | 'PANAMA' | 'ANGUILA' | 'PICK_TWO' | 'CASH3_6X1' | 'GENERAL';

/**
 * Get the category for a given draw name
 * @param drawName - The name of the draw
 * @returns The category name (DOMINICAN, USA, SUPER_PALE, PANAMA, ANGUILA, GENERAL)
 */
export function getDrawCategory(drawName: string | null | undefined): DrawCategory {
  if (!drawName) return 'GENERAL';

  const normalizedName = drawName.toUpperCase().trim();

  for (const [category, draws] of Object.entries(DRAW_CATEGORIES)) {
    if (draws.some((d: string) => d.toUpperCase() === normalizedName)) {
      return category as DrawCategory;
    }
  }

  // Default: return GENERAL (General tab shows all bet types)
  return 'GENERAL';
}

/**
 * Get allowed bet type codes for a draw
 * @param drawName - The name of the draw
 * @returns Array of allowed bet type codes
 */
export function getAllowedBetTypeCodes(drawName: string | null | undefined): string[] {
  const category = getDrawCategory(drawName);

  switch (category) {
    case 'DOMINICAN':
    case 'ANGUILA':
      return [...BET_TYPE_CODES.BASIC];

    case 'USA':
      return [...BET_TYPE_CODES.BASIC, ...BET_TYPE_CODES.USA];

    case 'PICK_TWO':
      return [...BET_TYPE_CODES.PICK_TWO];

    case 'CASH3_6X1':
      return [...BET_TYPE_CODES.CASH3_6X1];

    case 'SUPER_PALE':
      return [...BET_TYPE_CODES.SUPER_PALE];

    case 'PANAMA':
      return [...BET_TYPE_CODES.BASIC, ...BET_TYPE_CODES.PANAMA];

    case 'GENERAL':
    default:
      // General tab shows ALL bet types
      return [
        ...BET_TYPE_CODES.BASIC,
        ...BET_TYPE_CODES.USA,
        ...BET_TYPE_CODES.SUPER_PALE,
        ...BET_TYPE_CODES.PANAMA
      ];
  }
}

/**
 * Filter bet types for a specific draw
 * @param betTypes - Array of bet type objects with betTypeCode property
 * @param drawName - The name of the draw (or 'General')
 * @returns Filtered bet types
 */
export function filterBetTypesForDraw<T extends BetType>(betTypes: T[], drawName: string | null | undefined): T[] {
  if (!betTypes || !Array.isArray(betTypes)) {
    return [];
  }

  // General tab shows all bet types
  if (!drawName || drawName.toLowerCase() === 'general') {
    return betTypes;
  }

  const allowedCodes = getAllowedBetTypeCodes(drawName);

  return betTypes.filter(bt => {
    const code = (bt.betTypeCode || '').toUpperCase();
    return allowedCodes.some(allowed => allowed.toUpperCase() === code);
  });
}

/**
 * Check if a bet type is compatible with a draw
 * @param betTypeCode - The bet type code
 * @param drawName - The draw name
 * @returns True if compatible
 */
export function isBetTypeCompatible(betTypeCode: string | null | undefined, drawName: string | null | undefined): boolean {
  if (!betTypeCode) return false;
  if (!drawName || drawName.toLowerCase() === 'general') return true;

  const allowedCodes = getAllowedBetTypeCodes(drawName);
  return allowedCodes.some(code =>
    code.toUpperCase() === betTypeCode.toUpperCase()
  );
}

export default {
  BET_TYPE_CODES,
  DRAW_CATEGORIES,
  getDrawCategory,
  getAllowedBetTypeCodes,
  filterBetTypesForDraw,
  isBetTypeCompatible
};
