/**
 * Results Module Utilities
 *
 * Barrel export for utility functions.
 */

export {
  getMaxLength,
  getIndividualMaxLength,
  getFieldWidth,
  getEnabledFields,
  clearEnabledFieldsCache,
  isValidLotteryNumber,
  hasDateLikePattern,
  sanitizeNumberInput,
  calculateUsaFields,
  isUsaTriggerField,
  calculatePlay4OnlyFields,
  isPlay4OnlyDraw,
  isSuperPaleAutoDraw,
  getSuperPaleTarget,
  SUPER_PALE_SOURCE_MAP,
  is6x1AutoDraw,
  get6x1Target,
  DRAW_6X1_SOURCE_MAP,
  validateResultRow,
} from './fieldConfig';
