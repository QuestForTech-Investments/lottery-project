/**
 * PrizesTab Types
 *
 * Type definitions for the prizes configuration tab.
 */

export interface PrizeField {
  prizeTypeId: number;
  fieldName: string;
  fieldCode: string;
  defaultMultiplier: number;
  minMultiplier?: number;
  maxMultiplier?: number;
}

export interface BetType {
  betTypeId: number;
  betTypeName: string;
  betTypeCode: string;
  description?: string;
  prizeFields: PrizeField[];
}

export interface Draw {
  id: string;
  name: string;
  drawId?: number;
}

export interface CommissionField {
  id: string;
  name: string;
  fieldCode: string;
}

export interface PrizesFormData {
  [key: string]: string | number | boolean;
}

export interface GeneralValues {
  [key: string]: number | string;
}

export interface SyntheticEventLike {
  target: {
    name: string;
    value: string | number;
  };
}

export interface PrizesTabProps {
  formData: PrizesFormData;
  handleChange: (e: SyntheticEventLike) => void;
  onBatchChange?: (updates: Record<string, string | number>) => void;
  bettingPoolId?: number | null;
  loadDrawSpecificValues?: ((drawId: number, bettingPoolId: number) => Promise<Record<string, string | number>>) | null;
  draws?: Draw[];
  loadingDraws?: boolean;
  onSavePrizeConfig?: ((activeDraw: string) => Promise<void>) | null;
}

export interface ApiDraw {
  drawId: number;
  drawName: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface DrawsApiResponse {
  success: boolean;
  data?: ApiDraw[];
}

/**
 * Field configuration for BetTypeFieldGrid
 */
export interface FieldConfig {
  id: string | number;
  name: string;
  fieldCode: string;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  suffix?: string;
}

/**
 * Props for BetTypeFieldGrid component
 */
export interface BetTypeFieldGridProps {
  betTypes: BetType[];
  activeDraw: string;
  formData: PrizesFormData;
  generalValues: GeneralValues;
  fieldType: 'prize' | 'commission' | 'commission2';
  onFieldChange: (fieldKey: string, value: string) => void;
  bettingPoolId?: number | null;
  saving?: boolean;
  onSave?: () => void;
}

/**
 * Props for DrawTabSelector component
 */
export interface DrawTabSelectorProps {
  draws: Draw[];
  activeDraw: string;
  loadingDraws: boolean;
  onDrawSelect: (drawId: string) => void;
}
