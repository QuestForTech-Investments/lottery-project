/**
 * MassEditBettingPools Types
 *
 * Type definitions for the mass edit betting pools feature.
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

export interface Draw {
  drawId?: number;
  id?: number;
  drawName?: string;
  name?: string;
}

export interface BettingPool {
  bettingPoolId?: number;
  id?: number;
  bettingPoolName?: string;
  name?: string;
}

export interface PrizeField {
  prizeTypeId: number;
  fieldCode: string;
  fieldName: string;
  defaultMultiplier?: number;
}

export interface BetType {
  betTypeId: number;
  betTypeCode: string;
  betTypeName: string;
  prizeTypes?: PrizeField[];
  prizeFields?: PrizeField[];
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormData {
  zoneId: string;
  fallType: string | null;
  deactivationBalance: string;
  dailySaleLimit: string;
  minutesToCancelTicket: string;
  ticketsToCancelPerDay: string;
  printTicketCopy: string;
  isActive: string;
  winningTicketControl: string;
  useNormalizedPrizes: string;
  allowPassingPlays: string;
  canChangePassword: string;
  language: string | null;
  printMode: string | null;
  discountProvider: string | null;
  discountMode: string | null;
  updateGeneralValues: boolean;
  autoFooter: boolean;
  footer1: string;
  footer2: string;
  footer3: string;
  footer4: string;
  footer5: string;
  footer6: string;
  generalCommission?: string;
  commissionType?: string;
  activeDraws?: number[];
  earlyClosingDrawId?: string;
  [key: string]: string | number | boolean | number[] | null | undefined;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ConfigurationTabProps {
  formData: FormData;
  zones: Zone[];
  onInputChange: (field: string, value: string | number | boolean | number[] | null) => void;
}

export interface FootersTabProps {
  formData: FormData;
  onInputChange: (field: string, value: string | boolean) => void;
}

export interface PrizesTabProps {
  betTypes: BetType[];
  loadingBetTypes: boolean;
  prizesSubTab: number;
  formData: FormData;
  onSubTabChange: (newVal: number) => void;
  onPrizeFieldChange: (betTypeCode: string, fieldCode: string, value: string) => void;
  onCommissionChange: (betTypeCode: string, value: string) => void;
  onGeneralCommissionChange: (value: string) => void;
  onCommissionTypeChange: (value: string) => void;
}

export interface DrawsTabProps {
  draws: Draw[];
  formData: FormData;
  onInputChange: (field: string, value: string | number[] | null) => void;
}

export interface SelectionSectionProps {
  draws: Draw[];
  bettingPools: BettingPool[];
  zones: Zone[];
  selectedDraws: number[];
  selectedBettingPools: number[];
  selectedZones: number[];
  updateGeneralValues: boolean;
  onDrawToggle: (drawId: number) => void;
  onPoolToggle: (poolId: number) => void;
  onZoneToggle: (zoneId: number) => void;
  onUpdateGeneralValuesChange: (checked: boolean) => void;
}
