/**
 * Limit Types
 * Types for the limits module (Limites)
 */

import type { SelectOptionValueLabel } from './common';

// ============================================================================
// Enums
// ============================================================================

/**
 * Enum of limit types matching backend values
 */
export enum LimitType {
  GeneralForGroup = 1,
  ByNumberForGroup = 2,
  GeneralForBettingPool = 3,
  ByNumberForBettingPool = 4,
  LocalForBettingPool = 5,
  GeneralForZone = 6,
  ByNumberForZone = 7,
  GeneralForExternalGroup = 8,
  ByNumberForExternalGroup = 9,
  Absolute = 10
}

/**
 * Labels in Spanish for UI display
 */
export const LimitTypeLabels: Record<LimitType, string> = {
  [LimitType.GeneralForGroup]: 'General para grupo',
  [LimitType.ByNumberForGroup]: 'General por número para grupo',
  [LimitType.GeneralForBettingPool]: 'General para banca',
  [LimitType.ByNumberForBettingPool]: 'Por número para banca (Línea)',
  [LimitType.LocalForBettingPool]: 'Local para banca',
  [LimitType.GeneralForZone]: 'General para zona',
  [LimitType.ByNumberForZone]: 'Por número para zona',
  [LimitType.GeneralForExternalGroup]: 'General para grupo externo',
  [LimitType.ByNumberForExternalGroup]: 'Por número para grupo externo',
  [LimitType.Absolute]: 'Absoluto'
};

/**
 * Get all limit types as options for select components
 */
export const getLimitTypeOptions = (): { value: LimitType; label: string }[] => {
  return Object.entries(LimitTypeLabels).map(([value, label]) => ({
    value: Number(value) as LimitType,
    label
  }));
};

// ============================================================================
// Main Interfaces
// ============================================================================

/**
 * Main limit rule interface from API
 */
export interface LimitRule {
  limitRuleId: number;
  ruleName?: string;
  limitType: LimitType;
  limitTypeName: string;
  lotteryId?: number;
  lotteryName?: string;
  drawId?: number;
  drawName?: string;
  gameTypeId?: number;
  gameTypeName?: string;
  zoneId?: number;
  zoneName?: string;
  bettingPoolId?: number;
  bettingPoolName?: string;
  betNumberPattern?: string;
  maxBetPerNumber?: number;
  maxBetPerTicket?: number;
  maxBetPerBettingPool?: number;
  maxBetGlobal?: number;
  isActive: boolean;
  priority?: number;
  daysOfWeek?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request payload for creating a new limit
 */
export interface CreateLimitRequest {
  limitType: LimitType;
  lotteryId?: number;
  drawIds?: number[];
  gameTypeId?: number;
  zoneId?: number;
  bettingPoolId?: number;
  betNumberPattern?: string;
  amounts?: BetTypeAmounts;
  daysOfWeek?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

/**
 * Request payload for updating an existing limit
 */
export interface UpdateLimitRequest extends CreateLimitRequest {
  limitRuleId: number;
}

/**
 * Bet type amounts for limit configuration
 */
export interface BetTypeAmounts {
  directo?: number;
  pale?: number;
  tripleta?: number;
  cash3Straight?: number;
  cash3Box?: number;
  play4Straight?: number;
  play4Box?: number;
  superPale?: number;
  bolita1?: number;
  bolita2?: number;
  singulacion1?: number;
  singulacion2?: number;
  singulacion3?: number;
  pick5Straight?: number;
  pick5Box?: number;
  pickTwo?: number;
  cash3FrontStraight?: number;
  cash3FrontBox?: number;
  cash3BackStraight?: number;
  cash3BackBox?: number;
  pickTwoFront?: number;
  pickTwoBack?: number;
  pickTwoMiddle?: number;
  panama?: number;
  [key: string]: number | undefined;
}

// ============================================================================
// Filter & Params Interfaces
// ============================================================================

/**
 * Filters for listing limits
 */
export interface LimitFilter {
  limitTypes?: LimitType[];
  drawIds?: number[];
  daysOfWeek?: number[];
  bettingPoolId?: number;
  zoneId?: number;
  groupId?: number;
  isActive?: boolean;
  search?: string;
}

/**
 * Select option with value/label pattern for limits
 * Uses the generic SelectOptionValueLabel from common types
 */
export type LimitSelectOption = SelectOptionValueLabel<number>;

/**
 * Day of week option
 */
export interface DayOfWeekOption {
  value: number;
  label: string;
}

/**
 * Parameters for limit forms (dropdown options)
 */
export interface LimitParams {
  limitTypes: LimitSelectOption[];
  draws: LimitSelectOption[];
  lotteries: LimitSelectOption[];
  gameTypes: LimitSelectOption[];
  bettingPools: LimitSelectOption[];
  zones: LimitSelectOption[];
  groups: LimitSelectOption[];
  daysOfWeek: DayOfWeekOption[];
}

// ============================================================================
// Bet Types Configuration
// ============================================================================

/**
 * Bet type definition
 */
export interface BetTypeDefinition {
  key: keyof BetTypeAmounts;
  label: string;
}

/**
 * Available bet types for limit configuration
 */
export const BetTypes: readonly BetTypeDefinition[] = [
  { key: 'directo', label: 'Directo' },
  { key: 'pale', label: 'Pale' },
  { key: 'tripleta', label: 'Tripleta' },
  { key: 'cash3Straight', label: 'Cash3 Straight' },
  { key: 'cash3Box', label: 'Cash3 Box' },
  { key: 'play4Straight', label: 'Play4 Straight' },
  { key: 'play4Box', label: 'Play4 Box' },
  { key: 'superPale', label: 'Super Pale' },
  { key: 'bolita1', label: 'Bolita 1' },
  { key: 'bolita2', label: 'Bolita 2' },
  { key: 'singulacion1', label: 'Singulacion 1' },
  { key: 'singulacion2', label: 'Singulacion 2' },
  { key: 'singulacion3', label: 'Singulacion 3' },
  { key: 'pick5Straight', label: 'Pick5 Straight' },
  { key: 'pick5Box', label: 'Pick5 Box' },
  { key: 'pickTwo', label: 'Pick Two' },
  { key: 'cash3FrontStraight', label: 'Cash3 Front Straight' },
  { key: 'cash3FrontBox', label: 'Cash3 Front Box' },
  { key: 'cash3BackStraight', label: 'Cash3 Back Straight' },
  { key: 'cash3BackBox', label: 'Cash3 Back Box' },
  { key: 'pickTwoFront', label: 'Pick Two Front' },
  { key: 'pickTwoBack', label: 'Pick Two Back' },
  { key: 'pickTwoMiddle', label: 'Pick Two Middle' },
  { key: 'panama', label: 'Panama' }
] as const;

// ============================================================================
// Days of Week Configuration (Bitmask)
// ============================================================================

/**
 * Days of week with bitmask values for API
 */
export const DaysOfWeek: readonly DayOfWeekOption[] = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 4, label: 'Miercoles' },
  { value: 8, label: 'Jueves' },
  { value: 16, label: 'Viernes' },
  { value: 32, label: 'Sabado' },
  { value: 64, label: 'Domingo' }
] as const;

/**
 * All days bitmask (Mon-Sun = 127)
 */
export const ALL_DAYS_BITMASK = 127;

/**
 * Weekdays only bitmask (Mon-Fri = 31)
 */
export const WEEKDAYS_BITMASK = 31;

/**
 * Weekend only bitmask (Sat-Sun = 96)
 */
export const WEEKEND_BITMASK = 96;

/**
 * Convert bitmask to array of day values
 * @param bitmask - The bitmask representing selected days
 * @returns Array of individual day values
 */
export const bitmaskToDays = (bitmask: number): number[] => {
  return DaysOfWeek.filter(day => (bitmask & day.value) !== 0).map(d => d.value);
};

/**
 * Convert array of day values to bitmask
 * @param days - Array of day values
 * @returns Combined bitmask
 */
export const daysToBitmask = (days: number[]): number => {
  return days.reduce((mask, day) => mask | day, 0);
};

/**
 * Get day labels from bitmask
 * @param bitmask - The bitmask representing selected days
 * @returns Array of day labels
 */
export const bitmaskToDayLabels = (bitmask: number): string[] => {
  return DaysOfWeek.filter(day => (bitmask & day.value) !== 0).map(d => d.label);
};

/**
 * Check if all days are selected
 * @param bitmask - The bitmask to check
 * @returns True if all days selected
 */
export const isAllDaysSelected = (bitmask: number): boolean => {
  return bitmask === ALL_DAYS_BITMASK;
};

// ============================================================================
// Automatic Limits Configuration
// ============================================================================

/**
 * General number control settings
 */
export interface NumberControlSettings {
  enableDirecto: boolean;
  montoDirecto: number;
  enablePale: boolean;
  montoPale: number;
  enableSuperPale: boolean;
  montoSuperPale: number;
}

/**
 * Configuration for automatic limits
 */
export interface AutomaticLimitConfig {
  generalNumberControls: NumberControlSettings;
  lineControls: NumberControlSettings;
}

/**
 * Configuration for random blocking
 */
export interface RandomBlockConfig {
  drawIds: number[];
  bettingPoolId?: number;
  palesToBlock: number;
}

/**
 * Default automatic limit configuration
 */
export const defaultAutomaticLimitConfig: AutomaticLimitConfig = {
  generalNumberControls: {
    enableDirecto: false,
    montoDirecto: 0,
    enablePale: false,
    montoPale: 0,
    enableSuperPale: false,
    montoSuperPale: 0
  },
  lineControls: {
    enableDirecto: false,
    montoDirecto: 0,
    enablePale: false,
    montoPale: 0,
    enableSuperPale: false,
    montoSuperPale: 0
  }
};

// ============================================================================
// Hot Numbers Configuration
// ============================================================================

/**
 * Selected hot numbers configuration
 */
export interface HotNumbersConfig {
  selectedNumbers: number[];
}

/**
 * Hot number limit rule
 */
export interface HotNumberLimit {
  id?: number;
  drawIds: number[];
  directo: number;
  pale1Caliente: number;
  pale2Caliente: number;
  tripleta1Caliente: number;
  tripleta2Caliente: number;
  tripleta3Caliente: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hot number with selection state
 */
export interface HotNumberItem {
  number: number;
  isSelected: boolean;
}

/**
 * Default hot number limit
 */
export const defaultHotNumberLimit: Omit<HotNumberLimit, 'id'> = {
  drawIds: [],
  directo: 0,
  pale1Caliente: 0,
  pale2Caliente: 0,
  tripleta1Caliente: 0,
  tripleta2Caliente: 0,
  tripleta3Caliente: 0
};

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated response for limits list
 */
export interface LimitsListResponse {
  items: LimitRule[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Batch delete response
 */
export interface BatchDeleteResponse {
  deletedCount: number;
  message?: string;
}

/**
 * API error response
 */
export interface LimitApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// Form State Types
// ============================================================================

/**
 * Create limit form state
 */
export interface CreateLimitFormState {
  limitType: LimitType | '';
  lotteryId: number | '';
  drawIds: number[];
  gameTypeId: number | '';
  zoneId: number | '';
  bettingPoolId: number | '';
  betNumberPattern: string;
  amounts: BetTypeAmounts;
  daysOfWeek: number[];
  effectiveFrom: string;
  effectiveTo: string;
}

/**
 * Initial state for create limit form
 */
export const initialCreateLimitFormState: CreateLimitFormState = {
  limitType: '',
  lotteryId: '',
  drawIds: [],
  gameTypeId: '',
  zoneId: '',
  bettingPoolId: '',
  betNumberPattern: '',
  amounts: {},
  daysOfWeek: [],
  effectiveFrom: '',
  effectiveTo: ''
};

/**
 * Limit list filter form state
 */
export interface LimitFilterFormState {
  limitTypes: LimitType[];
  drawIds: number[];
  daysOfWeek: number[];
  bettingPoolId: number | '';
  zoneId: number | '';
  groupId: number | '';
  isActive: boolean | '';
}

/**
 * Initial state for limit filter form
 */
export const initialLimitFilterFormState: LimitFilterFormState = {
  limitTypes: [],
  drawIds: [],
  daysOfWeek: [],
  bettingPoolId: '',
  zoneId: '',
  groupId: '',
  isActive: ''
};
