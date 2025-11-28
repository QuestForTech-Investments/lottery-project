import { useState, useEffect, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBettingPool, getNextBettingPoolCode, handleBettingPoolError } from '@/services/bettingPoolService';
import { getActiveZones } from '@/services/zoneService';
import { savePrizeConfig, getAllBetTypesWithFields } from '@/services/prizeService';
import { saveBettingPoolSchedules, transformSchedulesToApiFormat } from '@/services/scheduleService';
import { saveBettingPoolDraws } from '@/services/sortitionService';

interface Zone {
  zoneId: number;
  name: string;
}

interface AutoExpense {
  id: string;
  description: string;
  amount: number;
}

interface FormData {
  bettingPoolName: string;
  branchCode: string;
  username: string;
  location: string;
  password: string;
  reference: string;
  confirmPassword: string;
  comment: string;
  zoneId: string;
  fallType: string;
  deactivationBalance: string;
  dailySaleLimit: string;
  todayBalanceLimit: string;
  enableTemporaryBalance: boolean;
  temporaryAdditionalBalance: string;
  isActive: boolean;
  winningTicketsControl: boolean;
  allowPassPot: boolean;
  printTickets: boolean;
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
  autoFooter: boolean;
  footerText1: string;
  footerText2: string;
  footerText3: string;
  footerText4: string;
  showBranchInfo: boolean;
  showDateTime: boolean;
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
  selectedDraws: number[];
  anticipatedClosing: string;
  anticipatedClosingDraws: number[];
  sellScreenStyles: string;
  ticketPrintStyles: string;
  autoExpenses: AutoExpense[];
  [key: string]: string | boolean | number | number[] | AutoExpense[] | null;
}

interface FormErrors {
  bettingPoolName?: string | null;
  branchCode?: string | null;
  zoneId?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  username?: string | null;
  submit?: string | null;
  [key: string]: string | null | undefined;
}

interface BetType {
  betTypeCode: string;
  prizeFields?: Array<{
    fieldCode: string;
    prizeTypeId: number;
  }>;
}

interface PrizeSaveResult {
  success: boolean;
  total?: number;
  saved?: number;
  failed?: number;
  warnings?: string[];
  message?: string;
  error?: string;
}

interface UseCompleteBettingPoolFormReturn {
  formData: FormData;
  loading: boolean;
  loadingZones: boolean;
  errors: FormErrors;
  success: boolean;
  zones: Zone[];
  activeTab: number;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleTabChange: (event: SyntheticEvent, newValue: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  copyScheduleToAll: (day: string) => void;
}

/**
 * Initial default values for form fields
 * Centralized for consistency between initial state and reset operations
 */
const getInitialFormData = (branchCode = ''): FormData => ({
  // General - Exact fields from original
  bettingPoolName: '',
  branchCode: branchCode,
  username: '',
  location: '',
  password: '',
  reference: '',
  confirmPassword: '',
  comment: '',

  // Configuration
  zoneId: '',
  fallType: '1', // 1=Off, 2=Cobro, 3=Diaria, 4=Mensual, 5=Semanal
  deactivationBalance: '',
  dailySaleLimit: '',
  todayBalanceLimit: '',
  enableTemporaryBalance: false,
  temporaryAdditionalBalance: '',
  isActive: true,
  winningTicketsControl: false,
  allowPassPot: true,
  printTickets: true,
  printTicketCopy: true,
  smsOnly: false,
  minutesToCancelTicket: '30',
  ticketsToCancelPerDay: '',
  enableRecharges: true,
  printRechargeReceipt: true,
  allowPasswordChange: true,
  printerType: '1', // 1=Driver, 2=Genérico
  discountProvider: '2', // 1=Grupo, 2=Rifero
  discountMode: '1', // 1=Off, 2=Efectivo, 3=Ticket Gratis
  maximumCancelTicketAmount: '',
  maxTicketAmount: '',
  dailyPhoneRechargeLimit: '',
  limitPreference: null,

  // Pies de página
  autoFooter: false,
  footerText1: '',
  footerText2: '',
  footerText3: '',
  footerText4: '',
  showBranchInfo: true,
  showDateTime: true,

  // Premios & Comisiones - Pick 3
  pick3FirstPayment: '',
  pick3SecondPayment: '',
  pick3ThirdPayment: '',
  pick3Doubles: '',

  // Pick 3 Super
  pick3SuperAllSequence: '',
  pick3SuperFirstPayment: '',
  pick3SuperSecondPayment: '',
  pick3SuperThirdPayment: '',

  // Pick 4
  pick4FirstPayment: '',
  pick4SecondPayment: '',

  // Pick 4 Super
  pick4SuperAllSequence: '',
  pick4SuperDoubles: '',

  // Pick 3 NY
  pick3NY_3Way2Identical: '',
  pick3NY_6Way3Unique: '',

  // Pick 4 NY
  pick4NY_AllSequence: '',
  pick4NY_Doubles: '',

  // Pick 4 Extra
  pick4_24Way4Unique: '',
  pick4_12Way2Identical: '',
  pick4_6Way2Identical: '',
  pick4_4Way3Identical: '',

  // Pick 5 Mega
  pick5MegaFirstPayment: '',

  // Pick 5 NY
  pick5NYFirstPayment: '',

  // Pick 5 Bronx
  pick5BronxFirstPayment: '',

  // Pick 5 Brooklyn
  pick5BrooklynFirstPayment: '',

  // Pick 5 Queens
  pick5QueensFirstPayment: '',

  // Pick 5 Extra
  pick5FirstPayment: '',

  // Pick 5 Super
  pick5SuperAllSequence: '',
  pick5SuperDoubles: '',

  // Pick 5 Super Extra
  pick5Super_5Way4Identical: '',
  pick5Super_10Way3Identical: '',
  pick5Super_20Way3Identical: '',
  pick5Super_30Way2Identical: '',
  pick5Super_60Way2Identical: '',
  pick5Super_120Way5Unique: '',

  // Pick 6 Miami
  pick6MiamiFirstPayment: '',
  pick6MiamiDoubles: '',

  // Pick 6 California
  pick6CaliforniaAllSequence: '',
  pick6CaliforniaTriples: '',

  // Pick 6 New York
  pick6NY_3Way2Identical: '',
  pick6NY_6Way3Unique: '',

  // Pick 6 Extra
  pick6AllSequence: '',
  pick6Triples: '',

  // Pick 6 California Extra
  pick6Cali_3Way2Identical: '',
  pick6Cali_6Way3Unique: '',

  // Lotto Classic
  lottoClassicFirstPayment: '',
  lottoClassicDoubles: '',

  // Lotto Plus
  lottoPlusFirstPayment: '',
  lottoPlusDoubles: '',

  // Mega Millions
  megaMillionsFirstPayment: '',
  megaMillionsDoubles: '',

  // Powerball
  powerball4NumbersFirstRound: '',
  powerball3NumbersFirstRound: '',
  powerball2NumbersFirstRound: '',
  powerballLastNumberFirstRound: '',
  powerball4NumbersSecondRound: '',
  powerball3NumbersSecondRound: '',
  powerballLast2NumbersSecondRound: '',
  powerballLastNumberSecondRound: '',
  powerball4NumbersThirdRound: '',
  powerball3NumbersThirdRound: '',
  powerballLast2NumbersThirdRound: '',
  powerballLastNumberThirdRound: '',

  // Horarios de sorteos
  domingoInicio: '12:00 AM',
  domingoFin: '11:59 PM',
  lunesInicio: '12:00 AM',
  lunesFin: '11:59 PM',
  martesInicio: '12:00 AM',
  martesFin: '11:59 PM',
  miercolesInicio: '12:00 AM',
  miercolesFin: '11:59 PM',
  juevesInicio: '12:00 AM',
  juevesFin: '11:59 PM',
  viernesInicio: '12:00 AM',
  viernesFin: '11:59 PM',
  sabadoInicio: '12:00 AM',
  sabadoFin: '11:59 PM',

  // Sorteos
  selectedDraws: [],
  anticipatedClosing: '',
  anticipatedClosingDraws: [],

  // Estilos
  sellScreenStyles: 'estilo1',
  ticketPrintStyles: 'original',

  // Gastos automáticos
  autoExpenses: []
});

/**
 * Custom hook for managing complete betting pool form with ALL 168 fields
 * This is the FULL version matching the original CreateBettingPool
 */
const useCompleteBettingPoolForm = (): UseCompleteBettingPoolFormReturn => {
  const navigate = useNavigate();
  const location = useLocation();

  // Form state - ALL 168 fields from original CreateBanca
  const [formData, setFormData] = useState<FormData>(getInitialFormData());

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingZones, setLoadingZones] = useState<boolean>(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<boolean>(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  /**
   * Load initial data
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * Regenerate branch code when returning to the create page
   * This ensures a fresh code is generated after navigation
   */
  useEffect(() => {
    const regenerateBranchCode = async (): Promise<void> => {
      try {
        const codeData = await getNextBettingPoolCode() as { nextCode?: string };
        if (codeData && codeData.nextCode) {
          setFormData(prev => ({ ...prev, branchCode: codeData.nextCode as string }));
        }
      } catch (error) {
        console.error('Error regenerating branch code:', error);
      }
    };

    // Only regenerate if we're on the create betting pool page
    // This detects navigation back to the page
    if (location.pathname === '/bettingPools/create') {
      regenerateBranchCode();
    }
  }, [location.pathname]);

  /**
   * Load zones and next bettingPool code
   */
  const loadInitialData = async (): Promise<void> => {
    try {
      setLoadingZones(true);

      // Load all active zones (up to 1000)
      const zonesResponse = await getActiveZones() as { success: boolean; data?: Zone[] };
      if (zonesResponse.success && zonesResponse.data) {
        setZones(zonesResponse.data);
      }

      // Load next betting pool code
      const codeData = await getNextBettingPoolCode() as { nextCode?: string };
      if (codeData && codeData.nextCode) {
        setFormData(prev => ({ ...prev, branchCode: codeData.nextCode as string }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setErrors({ submit: 'Error cargando datos iniciales' });
    } finally {
      setLoadingZones(false);
    }
  };

  /**
   * Reset form to default values with a new branch code
   * Used after successful creation to prepare for next entry
   */
  const resetFormToDefaults = (newBranchCode: string): void => {
    setFormData(getInitialFormData(newBranchCode));
    setErrors({});
    setActiveTab(0);
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' && name === 'limitPreference' ? null : value)
    }));
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  /**
   * Copy schedule to all days
   */
  const copyScheduleToAll = (day: string): void => {
    const inicioKey = `${day}Inicio`;
    const finKey = `${day}Fin`;
    const inicio = formData[inicioKey] as string;
    const fin = formData[finKey] as string;

    setFormData(prev => ({
      ...prev,
      domingoInicio: inicio,
      domingoFin: fin,
      lunesInicio: inicio,
      lunesFin: fin,
      martesInicio: inicio,
      martesFin: fin,
      miercolesInicio: inicio,
      miercolesFin: fin,
      juevesInicio: inicio,
      juevesFin: fin,
      viernesInicio: inicio,
      viernesFin: fin,
      sabadoInicio: inicio,
      sabadoFin: fin,
    }));
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.bettingPoolName.trim()) {
      newErrors.bettingPoolName = 'El nombre de la banca es requerido';
    }

    if (!formData.branchCode.trim()) {
      newErrors.branchCode = 'El código de la banca es requerido';
    }

    if (!formData.zoneId) {
      newErrors.zoneId = 'Debe seleccionar una zona';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.password && !formData.username) {
      newErrors.username = 'El usuario es requerido si se proporciona una contraseña';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Extract prize values from formData and group by lottery and bet type
   * Returns an object with lottery IDs as top-level keys, containing bet types
   *
   * Example formData:
   * {
   *   "general_DIRECTO_DIRECTO_PRIMER_PAGO": 60,
   *   "general_DIRECTO_DIRECTO_SEGUNDO_PAGO": 15,
   *   "lottery_43_PALÉ_PALÉ_PRIMER_PAGO": 1100
   * }
   *
   * Returns:
   * {
   *   "general": {
   *     "DIRECTO": {
   *       "DIRECTO_PRIMER_PAGO": 60,
   *       "DIRECTO_SEGUNDO_PAGO": 15
   *     }
   *   },
   *   "lottery_43": {
   *     "PALÉ": {
   *       "PALÉ_PRIMER_PAGO": 1100
   *     }
   *   }
   * }
   */
  const extractPrizeValuesFromFormData = (formData: FormData): Record<string, Record<string, Record<string, string | number>>> => {
    const prizesByLotteryAndBetType: Record<string, Record<string, Record<string, string | number>>> = {};

    // Iterate through all formData keys
    Object.keys(formData).forEach(key => {
      // Check if this is a prize type field (contains underscore and has a value)
      if (key.includes('_') && formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
        // Format: {lotteryId}_{betTypeCode}_{fieldCode}
        // Examples:
        //   - "general_DIRECTO_DIRECTO_PRIMER_PAGO"
        //   - "lottery_43_DIRECTO_DIRECTO_PRIMER_PAGO"

        const parts = key.split('_');

        // Extract lottery ID (first part)
        let lotteryId, betTypeCode, fieldCode;

        if (parts[0] === 'general') {
          // Format: general_BETTYPE_FIELDCODE
          lotteryId = 'general';
          betTypeCode = parts[1];
          fieldCode = parts.slice(2).join('_');
        } else if (parts[0] === 'lottery' && parts.length >= 4) {
          // Format: lottery_XX_BETTYPE_FIELDCODE
          lotteryId = `${parts[0]}_${parts[1]}`; // "lottery_43"
          betTypeCode = parts[2];
          fieldCode = parts.slice(3).join('_');
        } else {
          // Skip fields that don't match expected format
          return;
        }

        if (betTypeCode && fieldCode) {
          // Initialize nested structure if needed
          if (!prizesByLotteryAndBetType[lotteryId]) {
            prizesByLotteryAndBetType[lotteryId] = {};
          }
          if (!prizesByLotteryAndBetType[lotteryId][betTypeCode]) {
            prizesByLotteryAndBetType[lotteryId][betTypeCode] = {};
          }

          // Store the value
          prizesByLotteryAndBetType[lotteryId][betTypeCode][fieldCode] = formData[key] as string | number;
        }
      }
    });

    return prizesByLotteryAndBetType;
  };

  /**
   * Save prize configurations for a betting pool
   * IMPORTANT: Currently only saves GENERAL configurations (general_*)
   * Lottery-specific configurations (lottery_XX_*) are not yet supported by the backend
   *
   * @param bettingPoolId - ID of the created betting pool
   * @param formData - Form data with prize values
   */
  const savePrizeConfigurations = async (bettingPoolId: number, formData: FormData): Promise<PrizeSaveResult> => {
    try {
      // Extract prize values grouped by lottery and bet type
      const prizesByLotteryAndBetType = extractPrizeValuesFromFormData(formData);

      if (Object.keys(prizesByLotteryAndBetType).length === 0) {
        console.log('No custom prize values to save');
        return { success: true, message: 'No custom prizes' };
      }

      console.log('[DATA] Prize configurations to save:', prizesByLotteryAndBetType);

      // Get all bet types to map field codes to prize type IDs
      const betTypes = await getAllBetTypesWithFields() as BetType[];
      const prizeTypeMap: Record<string, number> = {}; // Map "BETTYPE_FIELDCODE" -> prizeTypeId

      // Build a map of field codes to prize type IDs
      betTypes.forEach(bt => {
        if (bt.prizeFields && Array.isArray(bt.prizeFields)) {
          bt.prizeFields.forEach(field => {
            const key = `${bt.betTypeCode}_${field.fieldCode}`;
            prizeTypeMap[key] = field.prizeTypeId;
          });
        }
      });

      console.log(`[LIST] Built prize type map with ${Object.keys(prizeTypeMap).length} fields`);

      let totalSaved = 0;
      let totalFailed = 0;
      const warnings: string[] = [];

      // Process each lottery
      for (const [lotteryId, betTypes] of Object.entries(prizesByLotteryAndBetType)) {
        if (lotteryId === 'general') {
          // Save GENERAL configurations (supported)
          console.log(`[SAVE] Saving GENERAL configurations...`);

          // Build the API request format
          const prizeConfigs: Array<{ prizeTypeId: number; fieldCode: string; value: number }> = [];

          for (const [betTypeCode, fields] of Object.entries(betTypes)) {
            for (const [fieldCode, value] of Object.entries(fields)) {
              const fullKey = `${betTypeCode}_${fieldCode}`;
              const prizeTypeId = prizeTypeMap[fullKey];

              if (!prizeTypeId) {
                console.warn(`[WARN] Prize type not found for key: ${fullKey}`);
                totalFailed++;
                continue;
              }

              prizeConfigs.push({
                prizeTypeId,
                fieldCode,
                value: parseFloat(String(value))
              });
            }
          }

          if (prizeConfigs.length > 0) {
            try {
              console.log(`[SEND] Sending ${prizeConfigs.length} prize configs to API...`);
              const response = await savePrizeConfig(bettingPoolId, prizeConfigs);
              console.log('[SUCCESS] General configurations saved successfully:', response);
              totalSaved += prizeConfigs.length;
            } catch (error) {
              console.error('[ERROR] Error saving general configurations:', error);
              totalFailed += prizeConfigs.length;
            }
          }
        } else {
          // Lottery-specific configurations (NOT YET SUPPORTED)
          const fieldCount = Object.values(betTypes).reduce((sum, fields) => sum + Object.keys(fields).length, 0);
          console.warn(`[WARN] Lottery-specific configurations are not yet supported: ${lotteryId} (${fieldCount} fields)`);
          warnings.push(`${fieldCount} configuraciones para ${lotteryId} no fueron guardadas (función no implementada)`);
        }
      }

      return {
        success: totalFailed === 0,
        total: totalSaved + totalFailed,
        saved: totalSaved,
        failed: totalFailed,
        warnings
      };
    } catch (err) {
      const error = err as Error;
      console.error('[ERROR] Error saving prize configurations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * Save schedule configurations for a betting pool
   * @param bettingPoolId - ID of the created betting pool
   * @param formData - Form data with schedule values
   */
  const saveScheduleConfigurations = async (bettingPoolId: number, formData: FormData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Transform schedule fields to API format
      const schedules = transformSchedulesToApiFormat(formData as unknown as Parameters<typeof transformSchedulesToApiFormat>[0]);

      console.log(`Saving schedules for betting pool ${bettingPoolId}...`);

      // Save schedules
      const result = await saveBettingPoolSchedules(bettingPoolId, schedules) as { success: boolean };

      if (result.success) {
        console.log(`[SUCCESS] Schedules saved successfully for betting pool ${bettingPoolId}`);
        return { success: true };
      } else {
        console.warn(`[WARN] Failed to save schedules`);
        return { success: false };
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error saving schedule configurations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Map form values to API format
      const fallTypeMap: Record<string, string> = { '1': 'OFF', '2': 'COBRO', '3': 'DIARIA', '4': 'MENSUAL', '5': 'SEMANAL' };
      const printModeMap: Record<string, string> = { '1': 'DRIVER', '2': 'GENERICO' };
      const discountProviderMap: Record<string, string> = { '1': 'GRUPO', '2': 'RIFERO' };
      const discountModeMap: Record<string, string> = { '1': 'OFF', '2': 'EFECTIVO', '3': 'TICKET_GRATIS' };

      const bettingPoolData = {
        bettingPoolName: formData.bettingPoolName,
        bettingPoolCode: formData.branchCode, // API expects bettingPoolCode, not branchCode
        username: formData.username || null,
        password: formData.password || null,
        location: formData.location || null,
        reference: formData.reference || null,
        comment: formData.comment || null,
        zoneId: parseInt(formData.zoneId),

        // Configuration mapped to API
        fallType: fallTypeMap[formData.fallType] || 'OFF',
        printMode: printModeMap[formData.printerType] || 'DRIVER',
        discountProvider: discountProviderMap[formData.discountProvider] || 'RIFERO',
        discountMode: discountModeMap[formData.discountMode] || 'OFF',

        deactivationBalance: formData.deactivationBalance ? parseFloat(formData.deactivationBalance) : null,
        dailySaleLimit: formData.dailySaleLimit ? parseFloat(formData.dailySaleLimit) : null,
        dailyBalanceLimit: formData.todayBalanceLimit ? parseFloat(formData.todayBalanceLimit) : null,
        temporaryAdditionalBalance: formData.temporaryAdditionalBalance ? parseFloat(formData.temporaryAdditionalBalance) : null,

        controlWinningTickets: formData.winningTicketsControl,
        allowJackpot: formData.allowPassPot,
        printEnabled: formData.printTickets,
        printTicketCopy: formData.printTicketCopy,

        // Note: Other fields (prizes, schedules, etc.) would need additional API endpoints
        // For now, only essential fields are sent
      };

      const response = await createBettingPool(bettingPoolData) as { success: boolean; data?: { bettingPoolId?: number; id?: number } };

      if (response.success) {
        const createdBettingPoolId = response.data?.bettingPoolId || response.data?.id;

        // Save prize configurations if betting pool was created successfully
        if (createdBettingPoolId) {
          console.log(`Betting pool created with ID: ${createdBettingPoolId}. Saving configurations...`);

          // Save prize configurations
          try {
            const prizeResult = await savePrizeConfigurations(createdBettingPoolId, formData);

            if (prizeResult.success) {
              console.log(`[SUCCESS] Prize configurations saved successfully for betting pool ${createdBettingPoolId}`);
              if (prizeResult.warnings && prizeResult.warnings.length > 0) {
                console.warn('[WARN] Warnings during prize save:', prizeResult.warnings);
                // Show warning to user about lottery-specific configs not saved
                prizeResult.warnings.forEach(warning => console.warn(`   - ${warning}`));
              }
            } else {
              console.warn(`[WARN] Some prize configurations failed to save: ${prizeResult.failed} of ${prizeResult.total}`);
              if (prizeResult.warnings && prizeResult.warnings.length > 0) {
                prizeResult.warnings.forEach(warning => console.warn(`   - ${warning}`));
              }
            }
          } catch (prizeError) {
            console.error('Error saving prize configurations:', prizeError);
            // Don't fail the whole operation if prizes fail to save
            // The betting pool was created successfully
          }

          // Save schedule configurations
          try {
            const scheduleResult = await saveScheduleConfigurations(createdBettingPoolId, formData);

            if (!scheduleResult.success) {
              console.warn(`[WARN] Failed to save schedule configurations`);
            }
          } catch (scheduleError) {
            console.error('Error saving schedule configurations:', scheduleError);
            // Don't fail the whole operation if schedules fail to save
            // The betting pool was created successfully
          }

          // Save draws configurations
          try {
            if (formData.selectedDraws && formData.selectedDraws.length > 0) {
              console.log(`Saving draws for betting pool ${createdBettingPoolId}...`);

              interface DrawToSave {
                drawId: number;
                isActive: boolean;
                anticipatedClosingMinutes: number | null;
                enabledGameTypeIds: number[];
              }

              const drawsToSave: DrawToSave[] = [];

              // Build draws array for each selected draw (NEW API format)
              formData.selectedDraws.forEach(drawId => {
                const hasAnticipatedClosing = formData.anticipatedClosingDraws?.includes(drawId);
                drawsToSave.push({
                  drawId: drawId,  // NEW: drawId instead of lotteryId
                  isActive: true,  // NEW: isActive instead of isEnabled
                  anticipatedClosingMinutes: hasAnticipatedClosing ? parseInt(formData.anticipatedClosing) || null : null,  // NEW: anticipatedClosingMinutes
                  enabledGameTypeIds: []
                });
              });

              console.log(`Draws payload (NEW format):`, {
                drawsCount: drawsToSave.length,
                withAnticipatedClosing: drawsToSave.filter(s => s.anticipatedClosingMinutes).length
              });

              // Save draws
              const drawsResult = await saveBettingPoolDraws(createdBettingPoolId, drawsToSave) as { success: boolean };

              if (drawsResult.success) {
                console.log(`[SUCCESS] Draws saved successfully for betting pool ${createdBettingPoolId}`);
              } else {
                console.warn(`[WARN] Failed to save draws`);
              }
            } else {
              console.log('No draws selected, skipping draws');
            }
          } catch (drawsError) {
            console.error('Error saving draws:', drawsError);
            // Don't fail the whole operation if draws fail to save
            // The betting pool was created successfully
          }
        }

        // Show success message temporarily
        setSuccess(true);

        // Get next branch code from API
        try {
          const codeData = await getNextBettingPoolCode() as { nextCode?: string };
          if (codeData && codeData.nextCode) {
            // Reset form with new code
            resetFormToDefaults(codeData.nextCode);
            console.log('Form reset with new code:', codeData.nextCode);
          } else {
            // If no code available, reset without code
            resetFormToDefaults('');
          }
        } catch (codeError) {
          console.error('Error getting next code:', codeError);
          // Reset form anyway without new code
          resetFormToDefaults('');
        }

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);

        // DO NOT navigate away - stay on the page for next entry
      }
    } catch (error) {
      console.error('Error creating banca:', error);
      const errorMessage = handleBettingPoolError(error, 'create betting pool');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    loadingZones,
    errors,
    success,
    zones,
    activeTab,
    handleChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll,
  };
};

export default useCompleteBettingPoolForm;
