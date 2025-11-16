/**
 * Mapping between hardcoded frontend premio fields and database prize_fields
 *
 * IMPORTANT NOTES:
 * - Frontend has 46 hardcoded fields across different bet types
 * - Database has 64 prize fields with different naming conventions
 * - Many fields DO NOT have direct matches
 *
 * Structure: { frontendFieldSuffix: databaseFieldCode }
 */

// ============================================================================
// PERFECT MATCHES (Direct 1:1 mapping)
// ============================================================================

export const DIRECTO_FIELDS = {
  primerPago: 'DIRECTO_PRIMER_PAGO',
  segundoPago: 'DIRECTO_SEGUNDO_PAGO',
  tercerPago: 'DIRECTO_TERCER_PAGO',
  dobles: 'DIRECTO_DOBLES'
};

export const PALE_FIELDS = {
  todosEnSecuencia: 'PALE_TODOS_EN_SECUENCIA',
  primerPago: 'PALE_PRIMER_PAGO',
  segundoPago: 'PALE_SEGUNDO_PAGO',
  tercerPago: 'PALE_TERCER_PAGO'
};

// ============================================================================
// PARTIAL MATCHES (Frontend fields exist but names differ)
// ============================================================================

export const TRIPLETA_FIELDS = {
  primerPago: 'TRIPLETA_PRIMER_PAGO',
  segundoPago: 'TRIPLETA_SEGUNDO_PAGO'
  // NOTE: Database also has TRIPLETA_TODOS_EN_SECUENCIA, TRIPLETA_TRIPLES
  // but frontend doesn't have fields for these
};

export const CASH3_STRAIGHT_FIELDS = {
  todosEnSecuencia: 'CASH3_STRAIGHT_PRIMER_PAGO', // ⚠️ Approximate mapping
  triples: 'CASH3_STRAIGHT_SEGUNDO_PAGO' // ⚠️ Approximate mapping
};

export const CASH3_BOX_FIELDS = {
  threeWay: 'CASH3_BOX_PRIMER_PAGO', // ⚠️ Approximate mapping
  sixWay: 'CASH3_BOX_SEGUNDO_PAGO' // ⚠️ Approximate mapping
};

export const PLAY4_STRAIGHT_FIELDS = {
  todosEnSecuencia: 'PLAY4_STRAIGHT_PRIMER_PAGO', // ⚠️ Approximate mapping
  dobles: 'PLAY4_STRAIGHT_SEGUNDO_PAGO' // ⚠️ Approximate mapping
};

export const PLAY4_BOX_FIELDS = {
  // Frontend has fields named by "way" count (24way, 12way, 6way, 4way)
  // Database only has generic PRIMER/SEGUNDO/TERCER/CUARTO_PAGO under PICK_FOUR_BOX_24
  '24way': 'PLAY4_BOX_PRIMER_PAGO', // ⚠️ Approximate mapping
  '12way': 'PLAY4_BOX_SEGUNDO_PAGO', // ⚠️ Approximate mapping
  '6way': 'PLAY4_BOX_TERCER_PAGO', // ⚠️ Approximate mapping
  '4way': 'PLAY4_BOX_CUARTO_PAGO' // ⚠️ Approximate mapping
};

export const SUPER_PALE_FIELDS = {
  primerPago: 'SUPER_PALE_PREMIO' // ⚠️ Different naming convention
};

export const BOLITA_FIELDS = {
  bolita1_primerPago: 'BOLITA_1_PREMIO', // ⚠️ Different naming
  bolita2_primerPago: 'BOLITA_2_PREMIO' // ⚠️ Different naming
};

export const SINGULACION_FIELDS = {
  singulacion1_primerPago: 'SINGULACION_1_PREMIO', // ⚠️ Different naming
  singulacion2_primerPago: 'SINGULACION_2_PREMIO', // ⚠️ Different naming
  singulacion3_primerPago: 'SINGULACION_3_PREMIO' // ⚠️ Different naming
};

export const PICK5_STRAIGHT_FIELDS = {
  todosEnSecuencia: 'PICK5_STRAIGHT_PRIMER_PAGO', // ⚠️ Approximate mapping
  quadruples: 'PICK5_STRAIGHT_SEGUNDO_PAGO' // ⚠️ Approximate mapping
};

export const PICK5_BOX_FIELDS = {
  // Frontend uses "way" naming, database uses PRIMER/SEGUNDO/etc
  '5way': 'PICK5_BOX_PRIMER_PAGO', // ⚠️ Approximate mapping (order matters!)
  '10way': 'PICK5_BOX_SEGUNDO_PAGO',
  '20way': 'PICK5_BOX_TERCER_PAGO',
  '30way': 'PICK5_BOX_CUARTO_PAGO',
  '60way': 'PICK5_BOX_QUINTO_PAGO',
  '120way': 'PICK5_BOX_SEXTO_PAGO'
};

export const PICK_TWO_FIELDS = {
  primerPago: 'PICK_TWO_PRIMER_PAGO'
  // NOTE: Database also has PICK_TWO_SEGUNDO_PAGO but frontend doesn't have it
};

export const CASH3_FRONT_FIELDS = {
  straight_todosEnSecuencia: 'CASH3_FRONT_STRAIGHT_PRIMER_PAGO', // ⚠️ Approximate
  box_3way: 'CASH3_FRONT_BOX_PRIMER_PAGO', // ⚠️ Approximate
  box_6way: 'CASH3_FRONT_BOX_SEGUNDO_PAGO' // ⚠️ Approximate
  // NOTE: Database also has CASH3_FRONT_STRAIGHT_SEGUNDO_PAGO
};

export const CASH3_BACK_FIELDS = {
  straight_todosEnSecuencia: 'CASH3_BACK_STRAIGHT_PRIMER_PAGO', // ⚠️ Approximate
  box_3way: 'CASH3_BACK_BOX_PRIMER_PAGO', // ⚠️ Approximate
  box_6way: 'CASH3_BACK_BOX_SEGUNDO_PAGO' // ⚠️ Approximate
  // NOTE: Database also has CASH3_BACK_STRAIGHT_SEGUNDO_PAGO
};

export const PICK_TWO_POSITION_FIELDS = {
  front_primerPago: 'PICK_TWO_FRONT_PRIMER_PAGO',
  back_primerPago: 'PICK_TWO_BACK_PRIMER_PAGO',
  middle_primerPago: 'PICK_TWO_MIDDLE_PRIMER_PAGO'
  // NOTE: Database also has SEGUNDO_PAGO for each position but frontend doesn't
};

// ============================================================================
// MAJOR MISMATCH - PANAMA
// ============================================================================

export const PANAMA_FIELDS = {
  // Frontend structure: 3 rounds × 2 payments (primerPago, segundoPago)
  // Database structure: 3 rounds × 4 categories (4 nums, 3 nums, last 2, last 1)
  // These are INCOMPATIBLE structures!

  primeraRonda_primerPago: 'PANAMA_4_NUMEROS_PRIMERA_RONDA', // ⚠️ VERY APPROXIMATE
  primeraRonda_segundoPago: 'PANAMA_3_NUMEROS_PRIMERA_RONDA', // ⚠️ VERY APPROXIMATE
  segundaRonda_primerPago: 'PANAMA_4_NUMEROS_SEGUNDA_RONDA', // ⚠️ VERY APPROXIMATE
  segundaRonda_segundoPago: 'PANAMA_3_NUMEROS_SEGUNDA_RONDA', // ⚠️ VERY APPROXIMATE
  terceraRonda_primerPago: 'PANAMA_4_NUMEROS_TERCERA_RONDA', // ⚠️ VERY APPROXIMATE
  terceraRonda_segundoPago: 'PANAMA_3_NUMEROS_TERCERA_RONDA' // ⚠️ VERY APPROXIMATE

  // MISSING DATABASE FIELDS (not mapped to frontend):
  // - PANAMA_ULTIMOS_2_NUMEROS_*_RONDA (3 fields)
  // - PANAMA_ULTIMO_NUMERO_*_RONDA (3 fields)
};

// ============================================================================
// MASTER MAPPING - Combine all field mappings
// ============================================================================

export const PREMIO_FIELD_MAPPING = {
  // Direct bet types
  directo: DIRECTO_FIELDS,
  pale: PALE_FIELDS,
  tripleta: TRIPLETA_FIELDS,

  // Cash 3 variants
  cash3Straight: CASH3_STRAIGHT_FIELDS,
  cash3Box: CASH3_BOX_FIELDS,
  cash3FrontStraight: { todosEnSecuencia: 'CASH3_FRONT_STRAIGHT_PRIMER_PAGO' },
  cash3FrontBox: { '3way': 'CASH3_FRONT_BOX_PRIMER_PAGO', '6way': 'CASH3_FRONT_BOX_SEGUNDO_PAGO' },
  cash3BackStraight: { todosEnSecuencia: 'CASH3_BACK_STRAIGHT_PRIMER_PAGO' },
  cash3BackBox: { '3way': 'CASH3_BACK_BOX_PRIMER_PAGO', '6way': 'CASH3_BACK_BOX_SEGUNDO_PAGO' },

  // Play 4 variants
  play4Straight: PLAY4_STRAIGHT_FIELDS,
  play4Box: PLAY4_BOX_FIELDS,

  // Pick 5 variants
  pick5Straight: PICK5_STRAIGHT_FIELDS,
  pick5Box: PICK5_BOX_FIELDS,

  // Pick 2 variants
  pickTwo: PICK_TWO_FIELDS,
  pickTwoFront: { primerPago: 'PICK_TWO_FRONT_PRIMER_PAGO' },
  pickTwoBack: { primerPago: 'PICK_TWO_BACK_PRIMER_PAGO' },
  pickTwoMiddle: { primerPago: 'PICK_TWO_MIDDLE_PRIMER_PAGO' },

  // Special types
  superPale: SUPER_PALE_FIELDS,
  bolita1: { primerPago: 'BOLITA_1_PREMIO' },
  bolita2: { primerPago: 'BOLITA_2_PREMIO' },
  singulacion1: { primerPago: 'SINGULACION_1_PREMIO' },
  singulacion2: { primerPago: 'SINGULACION_2_PREMIO' },
  singulacion3: { primerPago: 'SINGULACION_3_PREMIO' },

  // Panama (problematic)
  panama: PANAMA_FIELDS
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get database field code from frontend field name
 * @param {string} fullFieldName - e.g., "general_directo_primerPago"
 * @returns {string|null} - Database field code or null if not found
 */
export function getFrontendToDbFieldCode(fullFieldName) {
  // Parse: ${lottery}_${betType}_${fieldName}
  const parts = fullFieldName.split('_');
  if (parts.length < 3) return null;

  const lottery = parts[0]; // e.g., "general"
  const betType = parts[1]; // e.g., "directo"
  const fieldName = parts.slice(2).join('_'); // e.g., "primerPago" or "primeraRonda_primerPago"

  const betTypeMapping = PREMIO_FIELD_MAPPING[betType];
  if (!betTypeMapping) return null;

  return betTypeMapping[fieldName] || null;
}

/**
 * Get frontend field name from database field code
 * @param {string} dbFieldCode - e.g., "DIRECTO_PRIMER_PAGO"
 * @param {string} lotteryCode - e.g., "general"
 * @returns {string|null} - Frontend field name or null if not found
 */
export function getDbToFrontendFieldName(dbFieldCode, lotteryCode = 'general') {
  for (const [betType, fields] of Object.entries(PREMIO_FIELD_MAPPING)) {
    for (const [frontendField, dbField] of Object.entries(fields)) {
      if (dbField === dbFieldCode) {
        return `${lotteryCode}_${betType}_${frontendField}`;
      }
    }
  }
  return null;
}

/**
 * Get all database field codes for a given bet type
 * @param {string} betType - e.g., "directo"
 * @returns {string[]} - Array of database field codes
 */
export function getDbFieldCodesForBetType(betType) {
  const mapping = PREMIO_FIELD_MAPPING[betType];
  if (!mapping) return [];
  return Object.values(mapping);
}

/**
 * Check if a frontend field has a database mapping
 * @param {string} fullFieldName - e.g., "general_directo_primerPago"
 * @returns {boolean}
 */
export function hasDbMapping(fullFieldName) {
  return getFrontendToDbFieldCode(fullFieldName) !== null;
}

// ============================================================================
// VALIDATION REPORT
// ============================================================================

export const MAPPING_ISSUES = {
  perfectMatches: [
    'DIRECTO (4 fields)',
    'PALE (4 fields)'
  ],
  approximateMappings: [
    'TRIPLETA (2/4 fields mapped)',
    'CASH3_STRAIGHT (different field semantics)',
    'CASH3_BOX (different field semantics)',
    'PLAY4 variants (different field semantics)',
    'PICK5 variants (different field semantics)',
    'PICK2 variants (partial - missing segundoPago)',
    'BOLITA (different naming)',
    'SINGULACION (different naming)',
    'SUPER_PALE (different naming)'
  ],
  majorIssues: [
    'PANAMA: Completely different structure (6 frontend fields vs 12 database fields)',
    'Multiple bet types missing SEGUNDO_PAGO in frontend',
    'Database has 64 fields but frontend only has 46 fields'
  ]
};

console.log('⚠️ Premio Field Mapping loaded with', Object.keys(PREMIO_FIELD_MAPPING).length, 'bet types');
console.log('📊 Total approximate mappings:', MAPPING_ISSUES.approximateMappings.length);
console.log('❌ Major issues:', MAPPING_ISSUES.majorIssues.length);
