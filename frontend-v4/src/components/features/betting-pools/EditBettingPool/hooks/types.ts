import type { ChangeEvent, SyntheticEvent } from 'react';

// ============== INTERFACES ==============

export interface AutoExpense {
  description: string;
  amount: string;
  frequency: string;
  active: boolean;
}

// Note: FormData uses index signature to allow dynamic prize fields
// All known fields are defined but the interface allows additional string keys
export interface FormData {
  // General
  bettingPoolName: string;
  branchCode: string;
  username: string;
  location: string;
  password: string;
  reference: string;
  confirmPassword: string;
  comment: string;
  // Configuration
  selectedZone: string;
  zoneId: string;
  fallType: string;
  deactivationBalance: string;
  dailySaleLimit: string;
  dailyBalanceLimit: string;
  todayBalanceLimit: string;
  enableTemporaryBalance: boolean;
  temporaryAdditionalBalance: string;
  isActive: boolean;
  winningTicketsControl: boolean;
  controlWinningTickets: boolean;
  allowPassPot: boolean;
  allowJackpot: boolean;
  printTickets: boolean;
  printEnabled: boolean;
  printTicketCopy: boolean;
  smsOnly: boolean;
  minutesToCancelTicket: string;
  ticketsToCancelPerDay: string;
  enableRecharges: boolean;
  printRechargeReceipt: boolean;
  allowPasswordChange: boolean;
  printerType: string;
  discountProvider: string;
  discountMode: string;
  maximumCancelTicketAmount: string;
  maxTicketAmount: string;
  dailyPhoneRechargeLimit: string;
  limitPreference: string | null;
  creditLimit: string;
  // Future sales
  allowFutureSales: boolean;
  maxFutureDays: string;
  // Footers
  autoFooter: boolean;
  footerText1: string;
  footerText2: string;
  footerText3: string;
  footerText4: string;
  showBranchInfo: boolean;
  showDateTime: boolean;
  // Schedules
  domingoInicio: string;
  domingoFin: string;
  lunesInicio: string;
  lunesFin: string;
  martesInicio: string;
  martesFin: string;
  miercolesInicio: string;
  miercolesFin: string;
  juevesInicio: string;
  juevesFin: string;
  viernesInicio: string;
  viernesFin: string;
  sabadoInicio: string;
  sabadoFin: string;
  // Draws
  selectedDraws: number[];
  anticipatedClosing: string;
  anticipatedClosingDraws: number[];
  // Styles
  sellScreenStyles: string;
  ticketPrintStyles: string;
  // Auto expenses
  autoExpenses: AutoExpense[];
  // Dynamic prize fields - index signature
  [key: string]: string | number | boolean | number[] | AutoExpense[] | null;
}

export interface FormErrors {
  submit?: string | null;
  bettingPoolName?: string | null;
  branchCode?: string | null;
  zoneId?: string | null;
  [key: string]: string | null | undefined;
}

export interface Zone {
  zoneId: number;
  zoneName: string;
}

export interface Draw {
  drawId: number;
  drawName: string;
  abbreviation?: string;
  lotteryId?: number;
}

export interface PrizesDraw {
  id: string;
  name: string;
  drawId?: number;
}

export interface DrawValuesCache {
  [drawId: string]: Record<string, string | number>;
}

// Template copy types
export interface TemplateFields {
  configuration: boolean;
  footers: boolean;
  prizesAndCommissions: boolean;
  drawSchedules: boolean;
  draws: boolean;
  styles: boolean;
  rules: boolean;
}

export interface TemplateBettingPool {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode?: string;
}

export interface SyntheticEventLike {
  target: {
    name: string;
    value: string | number | boolean | number[] | AutoExpense[];
    type?: string;
    checked?: boolean;
  };
}

export interface UseEditBettingPoolFormReturn {
  formData: FormData;
  loading: boolean;
  loadingBasicData: boolean;
  loadingPrizes: boolean;
  loadingZones: boolean;
  loadingDraws: boolean;
  errors: FormErrors;
  successMessage: string;
  zones: Zone[];
  draws: Draw[];
  prizesDraws: PrizesDraw[];
  drawValuesCache: DrawValuesCache;
  activeTab: number;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | SyntheticEventLike) => void;
  handleTabChange: (event: SyntheticEvent, newValue: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  copyScheduleToAll: (day: string) => void;
  loadDrawSpecificValues: (drawId: number, bettingPoolId: number | string) => Promise<Record<string, string | number>>;
  savePrizeConfigForSingleDraw: (drawId: string) => Promise<SavePrizeResult>;
  clearSuccessMessage: () => void;
  clearErrors: () => void;
  // Template copy
  templateBettingPools: TemplateBettingPool[];
  loadingTemplates: boolean;
  selectedTemplateId: number | null;
  templateFields: TemplateFields;
  loadingTemplateData: boolean;
  handleTemplateSelect: (templateId: number | null) => void;
  handleTemplateFieldChange: (field: keyof TemplateFields, checked: boolean) => void;
  applyTemplate: () => Promise<void>;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface BettingPoolData {
  bettingPoolName?: string;
  bettingPoolCode?: string;
  branchCode?: string;
  username?: string;
  location?: string;
  reference?: string;
  comment?: string;
  zoneId?: number;
  isActive?: boolean;
}

export interface ConfigResponse {
  config?: {
    fallType?: string;
    deactivationBalance?: number;
    dailySaleLimit?: number;
    dailyBalanceLimit?: number;
    temporaryAdditionalBalance?: number;
    enableTemporaryBalance?: boolean;
    creditLimit?: number;
    controlWinningTickets?: boolean;
    allowJackpot?: boolean;
    enableRecharges?: boolean;
    allowPasswordChange?: boolean;
    cancelMinutes?: number;
    dailyCancelTickets?: number;
    maxCancelAmount?: number;
    maxTicketAmount?: number;
    maxDailyRecharge?: number;
    paymentMode?: string;  // ✅ NEW: Payment mode (BANCA, ZONA, GRUPO)
    allowFutureSales?: boolean;
    maxFutureDays?: number;
  };
  discountConfig?: {
    discountProvider?: string;
    discountMode?: string;
  };
  printConfig?: {
    printMode?: string;
    printEnabled?: boolean;
    printTicketCopy?: boolean;
    printRechargeReceipt?: boolean;
    smsOnly?: boolean;
  };
  footer?: {
    autoFooter?: boolean;
    footerLine1?: string;
    footerLine2?: string;
    footerLine3?: string;
    footerLine4?: string;
    showBranchInfo?: boolean;
    showDateTime?: boolean;
  };
}

export interface DrawApiData {
  bettingPoolDrawId?: number;
  drawId: number;
  drawName?: string;
  lotteryId?: number;
  isActive?: boolean;
  anticipatedClosingMinutes?: number;
}

export interface BetType {
  betTypeCode: string;
  prizeFields?: PrizeField[];
}

export interface PrizeField {
  fieldCode: string;
  prizeTypeId: number;
  defaultMultiplier?: number;
}

export interface PrizeConfig {
  prizeTypeId: number;
  fieldCode: string;
  value: number;
}

export interface SavePrizeResult {
  success: boolean;
  total?: number;
  successful?: number;
  failed?: number;
  results?: Array<{ success: boolean; lottery: string; count?: number; error?: string }>;
  message?: string;
  skipped?: boolean;
  error?: string;
}

export interface PrizeData {
  betTypes?: BetType[];
  customMap?: Record<string, number>;
}
