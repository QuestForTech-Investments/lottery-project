import type { FormData, ConfigResponse, FormErrors } from './types';

/**
 * Reverse mapping constants for enum values (backend -> frontend)
 */
const FALL_TYPE_REVERSE_MAP: Record<string, string> = {
  'OFF': '1',
  'COLLECTION': '2',
  'DAILY': '3',
  'MONTHLY': '4',
  'WEEKLY': '5',
  'WEEKLY_ACCUMULATED': '5',    // ✅ Alias para SEMANAL CON ACUMULADO
  'WEEKLY_NO_ACCUMULATED': '6'  // ✅ Alias para SEMANAL SIN ACUMULADO
};

const PRINT_MODE_REVERSE_MAP: Record<string, string> = {
  'DRIVER': '1',
  'GENERIC': '2'
};

const DISCOUNT_PROVIDER_REVERSE_MAP: Record<string, string> = {
  'GROUP': '1',
  'SELLER': '2'
};

const DISCOUNT_MODE_REVERSE_MAP: Record<string, string> = {
  'OFF': '1',
  'CASH': '2',
  'FREE_TICKET': '3'
};

// ✅ NEW: Payment Mode mapping (API -> Frontend)
const PAYMENT_MODE_REVERSE_MAP: Record<string, string> = {
  'BANCA': '1',
  'ZONA': '2',
  'ZONE': '2',      // Alias
  'GRUPO': '3',
  'GROUP': '3'      // Alias
};

/**
 * Maps backend config response to frontend form fields
 * Used when loading data from GET /api/betting-pools/{id}/config
 */
export const mapConfigToFormData = (configResponse: ConfigResponse): Partial<FormData> => {
  if (!configResponse || (!configResponse.config && !configResponse.discountConfig && !configResponse.printConfig)) {
    return {};
  }

  const config = configResponse.config || {};
  const discountConfig = configResponse.discountConfig || {};
  const printConfig = configResponse.printConfig || {};
  const footer = configResponse.footer || {};

  return {
    // Config fields
    fallType: (config.fallType ? FALL_TYPE_REVERSE_MAP[config.fallType] : null) || '1',
    deactivationBalance: String(config.deactivationBalance ?? ''),
    dailySaleLimit: String(config.dailySaleLimit ?? ''),
    dailyBalanceLimit: String(config.dailyBalanceLimit ?? ''),
    temporaryAdditionalBalance: String(config.temporaryAdditionalBalance ?? ''),
    enableTemporaryBalance: config.enableTemporaryBalance || false,
    creditLimit: String(config.creditLimit ?? ''),
    controlWinningTickets: config.controlWinningTickets || false,
    allowJackpot: config.allowJackpot !== undefined ? config.allowJackpot : true,
    enableRecharges: config.enableRecharges !== undefined ? config.enableRecharges : true,
    allowPasswordChange: config.allowPasswordChange !== undefined ? config.allowPasswordChange : true,
    minutesToCancelTicket: String(config.cancelMinutes ?? 30),
    ticketsToCancelPerDay: String(config.dailyCancelTickets ?? ''),
    maximumCancelTicketAmount: String(config.maxCancelAmount ?? ''),
    maxTicketAmount: String(config.maxTicketAmount ?? ''),
    dailyPhoneRechargeLimit: String(config.maxDailyRecharge ?? ''),

    // Discount config fields
    discountProvider: (discountConfig.discountProvider ? DISCOUNT_PROVIDER_REVERSE_MAP[discountConfig.discountProvider] : null) || '1',
    discountMode: (discountConfig.discountMode ? DISCOUNT_MODE_REVERSE_MAP[discountConfig.discountMode] : null) || '1',

    // Print config fields
    printerType: (printConfig.printMode ? PRINT_MODE_REVERSE_MAP[printConfig.printMode] : null) || '1',
    printEnabled: printConfig.printEnabled !== undefined ? printConfig.printEnabled : true,
    printTicketCopy: printConfig.printTicketCopy !== undefined ? printConfig.printTicketCopy : true,
    printRechargeReceipt: printConfig.printRechargeReceipt !== undefined ? printConfig.printRechargeReceipt : true,
    smsOnly: printConfig.smsOnly || false,

    // Footer fields - Map API footerLine* to form footerText*
    autoFooter: footer.autoFooter || false,
    footerText1: footer.footerLine1 || '',
    footerText2: footer.footerLine2 || '',
    footerText3: footer.footerLine3 || '',
    footerText4: footer.footerLine4 || '',
    showBranchInfo: footer.showBranchInfo !== undefined ? footer.showBranchInfo : true,
    showDateTime: footer.showDateTime !== undefined ? footer.showDateTime : true,

    // ✅ NEW: Payment mode / limit preference
    limitPreference: config.paymentMode ? PAYMENT_MODE_REVERSE_MAP[config.paymentMode] || null : null
  };
};

/**
 * Validates the form data and returns errors object
 * Pure function - does not modify state
 */
export const validateFormData = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.bettingPoolName.trim()) {
    errors.bettingPoolName = 'El nombre del betting pool es requerido';
  }

  if (!formData.branchCode.trim()) {
    errors.branchCode = 'El código del betting pool es requerido';
  }

  if (!formData.selectedZone) {
    errors.selectedZone = 'Debe seleccionar una zona';
  }

  if (formData.password && formData.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (formData.password && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  if (formData.password && !formData.username) {
    errors.username = 'El usuario es requerido si se proporciona una contraseña';
  }

  return errors;
};

/**
 * Schedule field names for change detection
 */
export const SCHEDULE_FIELDS: (keyof FormData)[] = [
  'domingoInicio', 'domingoFin',
  'lunesInicio', 'lunesFin',
  'martesInicio', 'martesFin',
  'miercolesInicio', 'miercolesFin',
  'juevesInicio', 'juevesFin',
  'viernesInicio', 'viernesFin',
  'sabadoInicio', 'sabadoFin'
];

/**
 * Check if schedule data has changed between two form states
 * Pure function for change detection
 */
export const hasScheduleChanged = (
  currentFormData: FormData,
  initialFormData: FormData | null
): boolean => {
  if (!initialFormData) return true;

  return SCHEDULE_FIELDS.some(field => currentFormData[field] !== initialFormData[field]);
};

/**
 * Check if draws data has changed between two form states
 * Pure function for change detection
 */
export const hasDrawsChanged = (
  currentFormData: FormData,
  initialFormData: FormData | null
): boolean => {
  if (!initialFormData) return true;

  // Compare selected draws
  const prevDraws = initialFormData.selectedDraws || [];
  const currDraws = currentFormData.selectedDraws || [];

  if (prevDraws.length !== currDraws.length) {
    return true;
  }

  const prevSet = new Set(prevDraws);
  const currSet = new Set(currDraws);
  if (!Array.from(prevSet).every(id => currSet.has(id))) {
    return true;
  }

  // Compare anticipated closing
  if (currentFormData.anticipatedClosing !== initialFormData.anticipatedClosing) {
    return true;
  }

  // Compare anticipated closing draws
  const prevClosingDraws = initialFormData.anticipatedClosingDraws || [];
  const currClosingDraws = currentFormData.anticipatedClosingDraws || [];

  if (prevClosingDraws.length !== currClosingDraws.length) {
    return true;
  }

  const prevClosingSet = new Set(prevClosingDraws);
  const currClosingSet = new Set(currClosingDraws);
  if (!Array.from(prevClosingSet).every(id => currClosingSet.has(id))) {
    return true;
  }

  return false;
};

/**
 * Schedule update type - only schedule-related string fields
 */
type ScheduleUpdates = Record<string, string>;

/**
 * Generate schedule data to copy from one day to all days
 * Returns schedule field updates to be spread into form state
 */
export const generateCopiedSchedules = (
  formData: FormData,
  sourceDay: string
): ScheduleUpdates => {
  const inicioKey = `${sourceDay}Inicio` as keyof FormData;
  const finKey = `${sourceDay}Fin` as keyof FormData;
  const inicio = formData[inicioKey] as string;
  const fin = formData[finKey] as string;

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const updates: ScheduleUpdates = {};

  days.forEach(day => {
    if (day !== sourceDay) {
      updates[`${day}Inicio`] = inicio;
      updates[`${day}Fin`] = fin;
    }
  });

  return updates;
};
