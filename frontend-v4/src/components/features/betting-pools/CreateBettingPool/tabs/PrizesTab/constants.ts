/**
 * PrizesTab Constants
 *
 * Draw order, bet type categories, and commission field definitions.
 */

/**
 * Draw order according to V1 app
 */
export const DRAW_ORDER = [
  'LA PRIMERA', 'NEW YORK DAY', 'NEW YORK NIGHT', 'FLORIDA AM', 'FLORIDA PM',
  'GANA MAS', 'NACIONAL', 'QUINIELA PALE', 'REAL', 'LOTEKA',
  'FL PICK2 AM', 'FL PICK2 PM', 'GEORGIA-MID AM', 'GEORGIA EVENING', 'GEORGIA NIGHT',
  'NEW JERSEY AM', 'NEW JERSEY PM', 'CONNECTICUT AM', 'CONNECTICUT PM',
  'CALIFORNIA AM', 'CALIFORNIA PM', 'CHICAGO AM', 'CHICAGO PM',
  'PENN MIDDAY', 'PENN EVENING', 'INDIANA MIDDAY', 'INDIANA EVENING',
  'DIARIA 11AM', 'DIARIA 3PM', 'DIARIA 9PM',
  'SUPER PALE TARDE', 'SUPER PALE NOCHE', 'SUPER PALE NY-FL AM', 'SUPER PALE NY-FL PM',
  'TEXAS MORNING', 'TEXAS DAY', 'TEXAS EVENING', 'TEXAS NIGHT',
  'VIRGINIA AM', 'VIRGINIA PM', 'SOUTH CAROLINA AM', 'SOUTH CAROLINA PM',
  'MARYLAND MIDDAY', 'MARYLAND EVENING', 'MASS AM', 'MASS PM', 'LA SUERTE',
  'NORTH CAROLINA AM', 'NORTH CAROLINA PM', 'LOTEDOM',
  'NY AM 6x1', 'NY PM 6x1', 'FL AM 6X1', 'FL PM 6X1',
  'King Lottery AM', 'King Lottery PM', 'L.E. PUERTO RICO 2PM', 'L.E. PUERTO RICO 10PM',
  'DELAWARE AM', 'DELAWARE PM', 'Anguila 1pm', 'Anguila 6PM', 'Anguila 9pm', 'Anguila 10am',
  'LA CHICA', 'LA PRIMERA 7PM', 'LA PRIMERA 8PM', 'PANAMA MIERCOLES', 'PANAMA DOMINGO', 'LA SUERTE 6:00PM'
];

/**
 * Bet type order according to the original app (la-numbers.apk.lol)
 */
export const BET_TYPE_ORDER = [
  'DIRECTO',
  'PALÉ',
  'TRIPLETA',
  'CASH3_STRAIGHT',
  'CASH3_BOX',
  'PLAY4 STRAIGHT',
  'PLAY4 BOX',
  'SUPER_PALE',
  'BOLITA 1',
  'BOLITA 2',
  'SINGULACIÓN 1',
  'SINGULACIÓN 2',
  'SINGULACIÓN 3',
  'PICK5 STRAIGHT',
  'PICK5 BOX',
  'PICK TWO',
  'PICK2',
  'CASH3 FRONT STRAIGHT',
  'CASH3_FRONT_BOX',
  'CASH3_BACK_STRAIGHT',
  'CASH3 BACK BOX',
  'PICK TWO FRONT',
  'PICK TWO BACK',
  'PICK TWO MIDDLE',
  'PANAMA',
];

// Basic bet types (Dominicans, Anguila, King Lottery)
const BASIC_BET_TYPES = ['DIRECTO', 'PALÉ', 'TRIPLETA'];

// USA bet types - includes all Cash3, Play4, Pick5, Bolita, Singulación variants
const USA_BET_TYPES = [
  'DIRECTO', 'PALÉ', 'TRIPLETA',
  'CASH3_STRAIGHT', 'CASH3_BOX', 'CASH3_FRONT_BOX', 'CASH3_BACK_STRAIGHT',
  'CASH3 FRONT STRAIGHT', 'CASH3 BACK BOX',
  'PLAY4 STRAIGHT', 'PLAY4 BOX',
  'BOLITA 1', 'BOLITA 2',
  'SINGULACIÓN 1', 'SINGULACIÓN 2', 'SINGULACIÓN 3',
  'PICK5 STRAIGHT', 'PICK5 BOX',
  'PICK2', 'PICK TWO', 'PICK TWO FRONT', 'PICK TWO BACK', 'PICK TWO MIDDLE'
];

// Pick Two only (2-digit draws)
const PICK_TWO_BET_TYPES = ['PICK TWO'];

// Cash3 6x1 draws (Cash3 variants only)
const CASH3_6X1_BET_TYPES = [
  'CASH3_STRAIGHT', 'CASH3_BOX', 'CASH3_FRONT_BOX', 'CASH3_BACK_STRAIGHT',
  'CASH3 FRONT STRAIGHT', 'CASH3 BACK BOX',
];

// Super Pale bet types
const SUPER_PALE_BET_TYPES = ['SUPER_PALE'];

// Panama bet types
const PANAMA_BET_TYPES = ['DIRECTO', 'PALÉ', 'TRIPLETA', 'PANAMA'];

// Draw categories
const DOMINICAN_DRAWS = [
  'NACIONAL', 'LA PRIMERA', 'LA PRIMERA 7PM', 'LA PRIMERA 8PM', 'GANA MAS',
  'LA SUERTE', 'LA SUERTE 6:00pm', 'LOTEKA', 'LOTEDOM',
  'REAL', 'QUINIELA PALE',
  'L.E. PUERTO RICO 2PM', 'L.E. PUERTO RICO 10PM'
];

const ANGUILA_DRAWS = ['Anguila 10am', 'Anguila 1pm', 'Anguila 6PM', 'Anguila 9pm'];

const KING_LOTTERY_DRAWS = ['King Lottery AM', 'King Lottery PM'];

const USA_DRAWS = [
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
];

// Pick Two only draws (2-digit)
const PICK_TWO_DRAWS = [
  'FL PICK2 AM', 'FL PICK2 PM',
  'LA CHICA',
  'DIARIA 11AM', 'DIARIA 3PM', 'DIARIA 9PM',
];

// Cash3 6x1 draws
const CASH3_6X1_DRAWS = [
  'NY AM 6x1', 'NY PM 6x1', 'FL AM 6X1', 'FL PM 6X1',
];

const SUPER_PALE_DRAWS = [
  'SUPER PALE TARDE', 'SUPER PALE NOCHE',
  'SUPER PALE NY-FL AM', 'SUPER PALE NY-FL PM'
];

const PANAMA_DRAWS = ['PANAMA MIERCOLES', 'PANAMA DOMINGO'];

/**
 * Get allowed bet type codes for a specific draw
 */
export const getAllowedBetTypesForDraw = (drawName: string): string[] | null => {
  if (!drawName || drawName.toLowerCase() === 'general') {
    return null;
  }

  const name = drawName.toUpperCase().trim();
  const match = (list: readonly string[]) => list.some(d => d.toUpperCase() === name);

  if (match(DOMINICAN_DRAWS)) return BASIC_BET_TYPES;
  if (match(ANGUILA_DRAWS)) return BASIC_BET_TYPES;
  if (match(KING_LOTTERY_DRAWS)) return BASIC_BET_TYPES;
  if (match(USA_DRAWS)) return USA_BET_TYPES;
  if (match(PICK_TWO_DRAWS)) return PICK_TWO_BET_TYPES;
  if (match(CASH3_6X1_DRAWS)) return CASH3_6X1_BET_TYPES;
  if (match(SUPER_PALE_DRAWS)) return SUPER_PALE_BET_TYPES;
  if (match(PANAMA_DRAWS)) return PANAMA_BET_TYPES;

  return null;
};

/**
 * Commission field definitions for "Comisiones" tab
 */
export const COMMISSION_FIELDS = [
  { id: 'commissionDiscount1', name: 'Comisión Descuento 1', fieldCode: 'COMMISSION_DISCOUNT_1' },
  { id: 'commissionDiscount2', name: 'Comisión Descuento 2', fieldCode: 'COMMISSION_DISCOUNT_2' },
  { id: 'commissionDiscount3', name: 'Comisión Descuento 3', fieldCode: 'COMMISSION_DISCOUNT_3' },
  { id: 'commissionDiscount4', name: 'Comisión Descuento 4', fieldCode: 'COMMISSION_DISCOUNT_4' },
];

/**
 * Commission 2 field definitions for "Comisiones 2" tab
 */
export const COMMISSION_2_FIELDS = [
  { id: 'commission2Discount1', name: 'Comisión 2 Descuento 1', fieldCode: 'COMMISSION_2_DISCOUNT_1' },
  { id: 'commission2Discount2', name: 'Comisión 2 Descuento 2', fieldCode: 'COMMISSION_2_DISCOUNT_2' },
  { id: 'commission2Discount3', name: 'Comisión 2 Descuento 3', fieldCode: 'COMMISSION_2_DISCOUNT_3' },
  { id: 'commission2Discount4', name: 'Comisión 2 Descuento 4', fieldCode: 'COMMISSION_2_DISCOUNT_4' },
];
