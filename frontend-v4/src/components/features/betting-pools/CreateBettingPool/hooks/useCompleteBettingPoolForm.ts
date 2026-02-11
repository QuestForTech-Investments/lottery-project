import { useState, useEffect, useCallback, useRef, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBettingPool, getNextBettingPoolCode, handleBettingPoolError, getBettingPools, getBettingPoolById, getBettingPoolConfig, type BettingPool, type BettingPoolConfigData } from '@/services/bettingPoolService';
import { getActiveZones } from '@/services/zoneService';
import { savePrizeConfig, getAllBetTypesWithFields, getBettingPoolPrizeConfigs } from '@/services/prizeService';
import { saveBettingPoolSchedules, transformSchedulesToApiFormat, getBettingPoolSchedules } from '@/services/scheduleService';
import { saveBettingPoolDraws, getBettingPoolDraws } from '@/services/sortitionService';

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
  allowFutureSales: boolean;
  maxFutureDays: string;
  autoFooter: boolean;
  footerText1: string;
  footerText2: string;
  footerText3: string;
  footerText4: string;
  footerText5: string;
  footerText6: string;
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
    defaultValue?: number;
    defaultMultiplier?: number;
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

/**
 * Template fields that can be copied from an existing betting pool
 * Based on original Vue.js app "Copiar de banca plantilla" feature
 */
interface TemplateFields {
  configuration: boolean;  // Configuración
  footers: boolean;        // Pies de página
  prizesAndCommissions: boolean;  // Premios & Comisiones
  drawSchedules: boolean;  // Horarios de sorteos
  draws: boolean;          // Sorteos
  styles: boolean;         // Estilos
  rules: boolean;          // Reglas (additional)
}

interface TemplateBettingPool {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode?: string;
  zoneId?: number;
  zoneName?: string;
}

interface UseCompleteBettingPoolFormReturn {
  formData: FormData;
  loading: boolean;
  loadingZones: boolean;
  errors: FormErrors;
  success: boolean;
  successMessage: string;
  zones: Zone[];
  activeTab: number;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBatchChange: (updates: Record<string, string | number>) => void;
  handleTabChange: (event: SyntheticEvent, newValue: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  copyScheduleToAll: (day: string) => void;
  clearSuccessMessage: () => void;
  // Template copy functionality
  templateBettingPools: TemplateBettingPool[];
  loadingTemplates: boolean;
  selectedTemplateId: number | null;
  templateFields: TemplateFields;
  loadingTemplateData: boolean;
  handleTemplateSelect: (templateId: number | null) => void;
  handleTemplateFieldChange: (field: keyof TemplateFields, checked: boolean) => void;
  applyTemplate: () => Promise<void>;
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
  allowFutureSales: true,
  maxFutureDays: '7',

  // Pies de página
  autoFooter: false,
  footerText1: '',
  footerText2: '',
  footerText3: '',
  footerText4: '',
  footerText5: '',
  footerText6: '',
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
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Template copy state
  const [templateBettingPools, setTemplateBettingPools] = useState<TemplateBettingPool[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [loadingTemplateData, setLoadingTemplateData] = useState<boolean>(false);
  const templateDrawOverridesRef = useRef<Set<number>>(new Set());
  const [templateFields, setTemplateFields] = useState<TemplateFields>({
    configuration: true,
    footers: true,
    prizesAndCommissions: true,
    drawSchedules: true,
    draws: true,
    styles: true,
    rules: true,
  });

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
    if (location.pathname === '/betting-pools/new') {
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

        // Set default zone automatically
        // First try to find zone named "Default", otherwise use the first zone
        const defaultZone = zonesResponse.data.find(z => {
          const zoneName = (z.name || (z as unknown as { zoneName: string }).zoneName || '').toLowerCase();
          return zoneName === 'default' || zoneName === 'zona default' || zoneName === 'zona por defecto';
        }) || zonesResponse.data[0];

        if (defaultZone) {
          setFormData(prev => ({ ...prev, zoneId: String(defaultZone.zoneId) }));
        }
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
   * Load all betting pools for template selection
   */
  const loadTemplateBettingPools = useCallback(async (): Promise<void> => {
    try {
      setLoadingTemplates(true);
      const response = await getBettingPools({ pageSize: 1000 });
      if (response && response.items) {
        const pools: TemplateBettingPool[] = response.items.map((pool: BettingPool) => ({
          bettingPoolId: pool.bettingPoolId,
          bettingPoolName: pool.bettingPoolName,
          bettingPoolCode: pool.bettingPoolCode || pool.branchCode,
          zoneId: pool.zoneId,
          zoneName: pool.zoneName,
        }));
        setTemplateBettingPools(pools);
      }
    } catch (error) {
      console.error('Error loading template betting pools:', error);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  // Load template betting pools on mount
  useEffect(() => {
    loadTemplateBettingPools();
  }, [loadTemplateBettingPools]);

  /**
   * Handle template betting pool selection
   */
  const handleTemplateSelect = (templateId: number | null): void => {
    setSelectedTemplateId(templateId);
  };

  /**
   * Handle template field checkbox change
   */
  const handleTemplateFieldChange = (field: keyof TemplateFields, checked: boolean): void => {
    setTemplateFields(prev => ({
      ...prev,
      [field]: checked,
    }));
  };

  /**
   * Apply template: Copy selected fields from template betting pool to form
   */
  const applyTemplate = async (): Promise<void> => {
    if (!selectedTemplateId) return;

    try {
      setLoadingTemplateData(true);

      // Fetch all necessary data from the template betting pool
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const fetchCommissions = async () => {
        const resp = await fetch(`${API_BASE}/betting-pools/${selectedTemplateId}/prizes-commissions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        if (!resp.ok) return [];
        return resp.json();
      };

      const fetchDrawPrizeConfigs = async () => {
        const resp = await fetch(`${API_BASE}/betting-pools/${selectedTemplateId}/draws/prize-config/all`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        if (!resp.ok) return [];
        return resp.json();
      };

      const [basicDataResult, configResult, schedulesResult, drawsResult, prizesResult, commissionsResult, betTypesResult, drawPrizesResult] = await Promise.allSettled([
        getBettingPoolById(selectedTemplateId),
        getBettingPoolConfig(selectedTemplateId),
        getBettingPoolSchedules(selectedTemplateId),
        getBettingPoolDraws(selectedTemplateId),
        getBettingPoolPrizeConfigs(selectedTemplateId),
        fetchCommissions(),
        getAllBetTypesWithFields(),
        fetchDrawPrizeConfigs(),
      ]);

      // Build updates object based on selected fields
      const updates: Partial<FormData> = {};

      // Process Configuration fields (maps use English API values matching EditBettingPool/hooks/utils.ts)
      if (templateFields.configuration && configResult.status === 'fulfilled') {
        const configData = (configResult.value as { success: boolean; data?: BettingPoolConfigData })?.data;
        if (configData) {
          // Map config values - API returns English values (MONTHLY, COLLECTION, SELLER, etc.)
          if (configData.config) {
            const fallTypeMap: Record<string, string> = {
              'OFF': '1', 'COLLECTION': '2', 'DAILY': '3', 'MONTHLY': '4',
              'WEEKLY': '5', 'WEEKLY_ACCUMULATED': '5', 'WEEKLY_NO_ACCUMULATED': '6'
            };
            const discountProviderMap: Record<string, string> = { 'GROUP': '1', 'SELLER': '2' };
            const discountModeMap: Record<string, string> = { 'OFF': '1', 'CASH': '2', 'FREE_TICKET': '3' };
            const printModeMap: Record<string, string> = { 'DRIVER': '1', 'GENERIC': '2' };
            const paymentModeMap: Record<string, string> = { 'BANCA': '1', 'ZONA': '2', 'ZONE': '2', 'GRUPO': '3', 'GROUP': '3' };

            updates.fallType = fallTypeMap[configData.config.fallType || 'OFF'] || '1';
            updates.discountProvider = discountProviderMap[configData.discountConfig?.discountProvider || 'SELLER'] || '2';
            updates.discountMode = discountModeMap[configData.discountConfig?.discountMode || 'OFF'] || '1';
            updates.printerType = printModeMap[configData.printConfig?.printMode || 'DRIVER'] || '1';
            if (configData.config.paymentMode) {
              updates.limitPreference = paymentModeMap[configData.config.paymentMode] || null;
            }

            updates.deactivationBalance = String(configData.config.deactivationBalance ?? '');
            updates.dailySaleLimit = String(configData.config.dailySaleLimit ?? '');
            updates.todayBalanceLimit = String(configData.config.dailyBalanceLimit ?? '');
            updates.temporaryAdditionalBalance = String(configData.config.temporaryAdditionalBalance ?? '');
            updates.enableTemporaryBalance = configData.config.enableTemporaryBalance || false;
            updates.winningTicketsControl = configData.config.controlWinningTickets || false;
            updates.allowJackpot = configData.config.allowJackpot !== undefined ? configData.config.allowJackpot : true;
            updates.minutesToCancelTicket = String(configData.config.cancelMinutes ?? 30);
            updates.ticketsToCancelPerDay = String(configData.config.dailyCancelTickets ?? '');
            updates.maximumCancelTicketAmount = String(configData.config.maxCancelAmount ?? '');
            updates.maxTicketAmount = String(configData.config.maxTicketAmount ?? '');
            updates.dailyPhoneRechargeLimit = String(configData.config.maxDailyRecharge ?? '');
            updates.enableRecharges = configData.config.enableRecharges !== undefined ? configData.config.enableRecharges : true;
            updates.allowPasswordChange = configData.config.allowPasswordChange !== undefined ? configData.config.allowPasswordChange : true;
            updates.allowFutureSales = configData.config.allowFutureSales !== undefined ? configData.config.allowFutureSales : true;
            updates.maxFutureDays = String(configData.config.maxFutureDays ?? 7);
            updates.creditLimit = String(configData.config.creditLimit ?? '');
            updates.useCentralLogo = configData.config.useCentralLogo || false;
          }

          // Print config
          if (configData.printConfig) {
            updates.printEnabled = configData.printConfig.printEnabled !== undefined ? configData.printConfig.printEnabled : true;
            updates.printTicketCopy = configData.printConfig.printTicketCopy !== undefined ? configData.printConfig.printTicketCopy : true;
            updates.printRechargeReceipt = configData.printConfig.printRechargeReceipt !== undefined ? configData.printConfig.printRechargeReceipt : true;
            updates.smsOnly = configData.printConfig.smsOnly || false;
          }
        }

        // Copy zone from template
        const templatePool = templateBettingPools.find(p => p.bettingPoolId === selectedTemplateId);
        if (templatePool?.zoneId) {
          updates.selectedZone = String(templatePool.zoneId);
          updates.zoneId = String(templatePool.zoneId);
        }
      }

      // Process Footers fields
      if (templateFields.footers && configResult.status === 'fulfilled') {
        const configData = (configResult.value as { success: boolean; data?: BettingPoolConfigData })?.data;
        if (configData?.footer) {
          updates.autoFooter = configData.footer.autoFooter || false;
          updates.footerText1 = configData.footer.footerLine1 || '';
          updates.footerText2 = configData.footer.footerLine2 || '';
          updates.footerText3 = configData.footer.footerLine3 || '';
          updates.footerText4 = configData.footer.footerLine4 || '';
          updates.footerText5 = configData.footer.footerLine5 || '';
          updates.footerText6 = configData.footer.footerLine6 || '';
          updates.showBranchInfo = configData.footer.showBranchInfo !== undefined ? configData.footer.showBranchInfo : true;
          updates.showDateTime = configData.footer.showDateTime !== undefined ? configData.footer.showDateTime : true;
        }
      }

      // Process Draw Schedules
      if (templateFields.drawSchedules && schedulesResult.status === 'fulfilled') {
        const schedulesData = schedulesResult.value as unknown as { success: boolean; data?: Array<{ dayOfWeek: number; openingTime: string | null; closingTime: string | null }> };
        if (schedulesData.success && schedulesData.data) {
          const dayMap: Record<number, string> = {
            0: 'domingo',
            1: 'lunes',
            2: 'martes',
            3: 'miercoles',
            4: 'jueves',
            5: 'viernes',
            6: 'sabado',
          };

          schedulesData.data.forEach(schedule => {
            const dayName = dayMap[schedule.dayOfWeek];
            if (dayName) {
              (updates as Record<string, string | boolean | number | number[] | AutoExpense[] | null>)[`${dayName}Inicio`] = schedule.openingTime || '12:00 AM';
              (updates as Record<string, string | boolean | number | number[] | AutoExpense[] | null>)[`${dayName}Fin`] = schedule.closingTime || '11:59 PM';
            }
          });
        }
      }

      // Process Draws (sorteos)
      if (templateFields.draws && drawsResult.status === 'fulfilled') {
        const drawsData = drawsResult.value as { success: boolean; data?: Array<{ drawId: number; isActive: boolean; anticipatedClosingMinutes?: number | null }> };
        if (drawsData.success && drawsData.data) {
          const selectedDrawIds = drawsData.data
            .filter(d => d.isActive)
            .map(d => d.drawId);
          updates.selectedDraws = selectedDrawIds;

          // Get anticipated closing draws
          const anticipatedDraws = drawsData.data
            .filter(d => d.isActive && d.anticipatedClosingMinutes)
            .map(d => d.drawId);
          updates.anticipatedClosingDraws = anticipatedDraws;

          // Get anticipated closing value (use the first one found)
          const firstWithAnticipated = drawsData.data.find(d => d.anticipatedClosingMinutes);
          if (firstWithAnticipated?.anticipatedClosingMinutes) {
            updates.anticipatedClosing = firstWithAnticipated.anticipatedClosingMinutes.toString();
          }
        }
      }

      // Process Prizes & Commissions
      if (templateFields.prizesAndCommissions) {
        const prizesData = prizesResult.status === 'fulfilled'
          ? prizesResult.value as Array<{ prizeTypeId: number; fieldCode: string; customValue: number }>
          : [];

        // Build prizeTypeId -> betTypeCode map from bet types
        const betTypesData = betTypesResult.status === 'fulfilled'
          ? betTypesResult.value as BetType[]
          : [];
        const prizeTypeToCode: Record<number, string> = {};
        if (betTypesData && Array.isArray(betTypesData)) {
          betTypesData.forEach(bt => {
            const code = bt.betTypeCode || '';
            (bt.prizeFields || []).forEach(pf => {
              prizeTypeToCode[pf.prizeTypeId] = code;
            });
          });
        }

        // Step 1: Always load system defaults from bet types
        if (Array.isArray(betTypesData) && betTypesData.length > 0) {
          betTypesData.forEach(bt => {
            const code = bt.betTypeCode || '';
            (bt.prizeFields || []).forEach(pf => {
              if (pf.fieldCode && pf.defaultMultiplier !== undefined) {
                const fieldKey = `general_${code}_${pf.fieldCode}`;
                (updates as Record<string, string | boolean | number | number[] | AutoExpense[] | null>)[fieldKey] = pf.defaultMultiplier;
              }
            });
          });
        }

        // Step 2: Overlay with explicit prize configs (these take priority)
        if (Array.isArray(prizesData) && prizesData.length > 0) {
          prizesData.forEach(prize => {
            if (prize.fieldCode && prize.customValue !== undefined) {
              const betTypeCode = prizeTypeToCode[prize.prizeTypeId];
              if (betTypeCode) {
                const fieldKey = `general_${betTypeCode}_${prize.fieldCode}`;
                (updates as Record<string, string | boolean | number | number[] | AutoExpense[] | null>)[fieldKey] = prize.customValue;
              }
            }
          });
        }

        // Step 3: Per-draw prize configs
        if (drawPrizesResult.status === 'fulfilled') {
          const drawPrizeConfigs = drawPrizesResult.value as Array<{ drawId: number; prizeTypeId: number; fieldCode: string; customValue: number }>;
          if (Array.isArray(drawPrizeConfigs) && drawPrizeConfigs.length > 0) {
            const overrideDrawIds = new Set<number>();
            drawPrizeConfigs.forEach(config => {
              if (config.fieldCode && config.customValue !== undefined) {
                const betTypeCode = prizeTypeToCode[config.prizeTypeId];
                if (betTypeCode) {
                  const fieldKey = `draw_${config.drawId}_${betTypeCode}_${config.fieldCode}`;
                  (updates as Record<string, string | boolean | number | number[] | AutoExpense[] | null>)[fieldKey] = config.customValue;
                  overrideDrawIds.add(config.drawId);
                }
              }
            });
            templateDrawOverridesRef.current = overrideDrawIds;
          }
        }
      }

      // Process Commissions (from prizes-commissions endpoint)
      if (templateFields.prizesAndCommissions && commissionsResult.status === 'fulfilled') {
        const commissions = commissionsResult.value as Array<{
          gameType: string;
          lotteryId: number | null;
          commissionDiscount1: number | null;
          commissionDiscount2: number | null;
          commissionDiscount3: number | null;
          commissionDiscount4: number | null;
        }>;
        if (commissions && Array.isArray(commissions)) {
          // Map backend GameType to frontend betTypeCode
          const gameTypeMap: Record<string, string> = {
            'DIRECTO': 'DIRECTO', 'PALE': 'PALÉ', 'TRIPLETA': 'TRIPLETA',
            'CASH3_STRAIGHT': 'CASH3_STRAIGHT', 'CASH3_BOX': 'CASH3_BOX',
            'PLAY4_STRAIGHT': 'PLAY4 STRAIGHT', 'PLAY4_BOX': 'PLAY4 BOX',
            'SUPER_PALE': 'SUPER_PALE', 'BOLITA_1': 'BOLITA 1', 'BOLITA_2': 'BOLITA 2',
            'SINGULACION_1': 'SINGULACIÓN 1', 'SINGULACION_2': 'SINGULACIÓN 2', 'SINGULACION_3': 'SINGULACIÓN 3',
            'PICK5_STRAIGHT': 'PICK5 STRAIGHT', 'PICK5_BOX': 'PICK5 BOX',
            'PICK_TWO': 'PICK TWO', 'PICK2': 'PICK2',
            'CASH3_FRONT_STRAIGHT': 'CASH3 FRONT STRAIGHT', 'CASH3_FRONT_BOX': 'CASH3_FRONT_BOX',
            'CASH3_BACK_STRAIGHT': 'CASH3_BACK_STRAIGHT', 'CASH3_BACK_BOX': 'CASH3 BACK BOX',
            'PICK_TWO_FRONT': 'PICK TWO FRONT', 'PICK_TWO_BACK': 'PICK TWO BACK',
            'PICK_TWO_MIDDLE': 'PICK TWO MIDDLE', 'SINGULACION': 'SINGULACION', 'PANAMA': 'PANAMA',
          };

          // General commissions (lotteryId === null)
          commissions.filter(r => r.lotteryId === null).forEach(record => {
            const betTypeCode = gameTypeMap[record.gameType] || record.gameType;
            if (record.commissionDiscount1 !== null && record.commissionDiscount1 !== 0) {
              (updates as Record<string, unknown>)[`general_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_1`] = record.commissionDiscount1;
            }
            if (record.commissionDiscount2 !== null && record.commissionDiscount2 !== 0) {
              (updates as Record<string, unknown>)[`general_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_2`] = record.commissionDiscount2;
            }
            if (record.commissionDiscount3 !== null && record.commissionDiscount3 !== 0) {
              (updates as Record<string, unknown>)[`general_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_3`] = record.commissionDiscount3;
            }
            if (record.commissionDiscount4 !== null && record.commissionDiscount4 !== 0) {
              (updates as Record<string, unknown>)[`general_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_4`] = record.commissionDiscount4;
            }
          });

          // Per-draw commissions (lotteryId !== null)
          // Build lotteryId → drawIds mapping from template draws
          const lotteryToDrawIds: Record<number, number[]> = {};
          if (drawsResult.status === 'fulfilled') {
            const drawsData = drawsResult.value as { success: boolean; data?: Array<{ drawId: number; lotteryId?: number }> };
            if (drawsData.success && drawsData.data) {
              drawsData.data.forEach(d => {
                if (d.lotteryId) {
                  if (!lotteryToDrawIds[d.lotteryId]) lotteryToDrawIds[d.lotteryId] = [];
                  lotteryToDrawIds[d.lotteryId].push(d.drawId);
                }
              });
            }
          }

          commissions.filter(r => r.lotteryId !== null).forEach(record => {
            const betTypeCode = gameTypeMap[record.gameType] || record.gameType;
            const drawIds = lotteryToDrawIds[record.lotteryId!] || [];
            drawIds.forEach(drawId => {
              if (record.commissionDiscount1 !== null && record.commissionDiscount1 !== 0) {
                (updates as Record<string, unknown>)[`draw_${drawId}_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_1`] = record.commissionDiscount1;
              }
              if (record.commissionDiscount2 !== null && record.commissionDiscount2 !== 0) {
                (updates as Record<string, unknown>)[`draw_${drawId}_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_2`] = record.commissionDiscount2;
              }
              if (record.commissionDiscount3 !== null && record.commissionDiscount3 !== 0) {
                (updates as Record<string, unknown>)[`draw_${drawId}_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_3`] = record.commissionDiscount3;
              }
              if (record.commissionDiscount4 !== null && record.commissionDiscount4 !== 0) {
                (updates as Record<string, unknown>)[`draw_${drawId}_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_4`] = record.commissionDiscount4;
              }
            });
          });
        }
      }

      // Process Styles
      if (templateFields.styles && basicDataResult.status === 'fulfilled') {
        // Styles might come from basic data or a separate endpoint
        // For now, we'll check if there are style fields in the basic data
        const basicData = (basicDataResult.value as unknown as { success: boolean; data?: Record<string, unknown> })?.data;
        if (basicData) {
          if (basicData.sellScreenStyles) {
            updates.sellScreenStyles = basicData.sellScreenStyles as string;
          }
          if (basicData.ticketPrintStyles) {
            updates.ticketPrintStyles = basicData.ticketPrintStyles as string;
          }
        }
      }

      // Apply all updates to form data
      setFormData(prev => ({
        ...prev,
        ...updates,
      } as FormData));

      // Clear any previous errors on successful apply
      setErrors({});

      setSuccessMessage('Plantilla aplicada correctamente');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error applying template:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      setErrors({ submit: 'Error al copiar datos de la plantilla' });
    } finally {
      setLoadingTemplateData(false);
    }
  };


  // Auto-apply template when selectedTemplateId changes (live preview)
  useEffect(() => {
    if (selectedTemplateId) {
      applyTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId]);

  // Auto-apply template when templateFields change (live preview of selected fields)
  useEffect(() => {
    if (selectedTemplateId) {
      applyTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateFields]);

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

    // Username is required for betting pool
    if (!formData.username || !formData.username.trim()) {
      newErrors.username = 'El usuario de banca es requerido';
    }

    // Password is required for betting pool
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    const hasErrors = Object.keys(newErrors).length > 0;

    // Force a new object reference to trigger re-render
    setErrors({ ...newErrors });

    return !hasErrors;
  };

  /**
   * Extract prize values from formData and group by draw and bet type
   * Returns an object with draw IDs as top-level keys, containing bet types
   *
   * Example formData (from PrizesTab):
   * {
   *   "general_DIRECTO_DIRECTO_PRIMER_PAGO": 60,
   *   "general_DIRECTO_DIRECTO_SEGUNDO_PAGO": 15,
   *   "draw_43_DIRECTO_DIRECTO_PRIMER_PAGO": 1100
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
   *   "draw_43": {
   *     "DIRECTO": {
   *       "DIRECTO_PRIMER_PAGO": 1100
   *     }
   *   }
   * }
   */
  const extractPrizeValuesFromFormData = (formData: FormData): Record<string, Record<string, Record<string, string | number>>> => {
    const prizesByDrawAndBetType: Record<string, Record<string, Record<string, string | number>>> = {};

    // Iterate through all formData keys
    Object.keys(formData).forEach(key => {
      // Check if this is a prize type field (contains underscore and has a value)
      // Skip commission fields (COMMISSION, COMMISSION2) and non-prize fields
      if (key.includes('_') &&
          !key.includes('_COMMISSION_') &&
          !key.includes('_COMMISSION2_') &&
          formData[key] !== '' &&
          formData[key] !== null &&
          formData[key] !== undefined) {

        const parts = key.split('_');

        // Extract draw ID (first part)
        let drawId: string | null = null;
        let betTypeCode: string | null = null;
        let fieldCode: string | null = null;

        if (parts[0] === 'general') {
          // Format: general_BETTYPE_FIELDCODE
          // Example: general_DIRECTO_DIRECTO_PRIMER_PAGO
          drawId = 'general';
          betTypeCode = parts[1];
          fieldCode = parts.slice(2).join('_');
        } else if (parts[0] === 'draw' && parts.length >= 4) {
          // Format: draw_XX_BETTYPE_FIELDCODE (NEW format from PrizesTab)
          // Example: draw_43_DIRECTO_DIRECTO_PRIMER_PAGO
          drawId = `${parts[0]}_${parts[1]}`; // "draw_43"
          betTypeCode = parts[2];
          fieldCode = parts.slice(3).join('_');
        } else if (parts[0] === 'lottery' && parts.length >= 4) {
          // Format: lottery_XX_BETTYPE_FIELDCODE (legacy format)
          // Example: lottery_43_DIRECTO_DIRECTO_PRIMER_PAGO
          drawId = `draw_${parts[1]}`; // Convert to "draw_43"
          betTypeCode = parts[2];
          fieldCode = parts.slice(3).join('_');
        } else {
          // Skip fields that don't match expected format
          return;
        }

        if (drawId && betTypeCode && fieldCode) {
          // Initialize nested structure if needed
          if (!prizesByDrawAndBetType[drawId]) {
            prizesByDrawAndBetType[drawId] = {};
          }
          if (!prizesByDrawAndBetType[drawId][betTypeCode]) {
            prizesByDrawAndBetType[drawId][betTypeCode] = {};
          }

          // Store the value
          prizesByDrawAndBetType[drawId][betTypeCode][fieldCode] = formData[key] as string | number;
        }
      }
    });

    return prizesByDrawAndBetType;
  };

  /**
   * Save prize configurations for a betting pool
   * IMPORTANT: Currently only saves GENERAL configurations (general_*)
   * Draw-specific configurations (draw_XX_*) are not yet supported by the backend
   *
   * @param bettingPoolId - ID of the created betting pool
   * @param formData - Form data with prize values
   */
  const savePrizeConfigurations = async (bettingPoolId: number, formData: FormData, drawOverrides?: Set<number>): Promise<PrizeSaveResult> => {
    try {
      // Extract prize values grouped by draw and bet type
      const prizesByDrawAndBetType = extractPrizeValuesFromFormData(formData);

      if (Object.keys(prizesByDrawAndBetType).length === 0) {
        return { success: true, message: 'No custom prizes' };
      }


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


      let totalSaved = 0;
      let totalFailed = 0;
      const warnings: string[] = [];
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

      // ⚡ OPTIMIZED: Collect all configs first, then send in batch
      const generalPrizeConfigs: Array<{ prizeTypeId: number; fieldCode: string; value: number }> = [];
      const drawSpecificConfigs: Array<{ drawId: number; prizeConfigs: Array<{ prizeTypeId: number; fieldCode: string; value: number }> }> = [];

      // Process each draw and collect configs
      for (const [drawId, betTypesForDraw] of Object.entries(prizesByDrawAndBetType)) {
        const prizeConfigs: Array<{ prizeTypeId: number; fieldCode: string; value: number }> = [];

        for (const [betTypeCode, fields] of Object.entries(betTypesForDraw)) {
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
          if (drawId === 'general') {
            generalPrizeConfigs.push(...prizeConfigs);
          } else {
            // drawId format is "draw_43" — extract numeric part
            const numericDrawId = parseInt(drawId.split('_')[1], 10);
            drawSpecificConfigs.push({
              drawId: numericDrawId,
              prizeConfigs
            });
          }
        }
      }

      // Save general configurations (single request)
      if (generalPrizeConfigs.length > 0) {
        try {
          await savePrizeConfig(bettingPoolId, generalPrizeConfigs);
          totalSaved += generalPrizeConfigs.length;
        } catch (error) {
          console.error('[ERROR] Error saving general configurations:', error);
          totalFailed += generalPrizeConfigs.length;
        }
      }

      // ⚡ OPTIMIZED: Save all draw-specific configurations in ONE batch request
      // Filter by template overrides if set (only save draws that had real overrides in source)
      const filteredDrawConfigs = drawOverrides && drawOverrides.size > 0
        ? drawSpecificConfigs.filter(dc => drawOverrides.has(dc.drawId))
        : drawSpecificConfigs;

      if (filteredDrawConfigs.length > 0) {
        try {
          const batchResp = await fetch(`${API_BASE}/betting-pools/${bettingPoolId}/draws/prize-config/batch`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ drawConfigs: filteredDrawConfigs })
          });

          if (batchResp.ok) {
            const totalDrawConfigs = filteredDrawConfigs.reduce((sum, dc) => sum + dc.prizeConfigs.length, 0);
            totalSaved += totalDrawConfigs;
          } else {
            const errText = await batchResp.text();
            console.error('[ERROR] Batch save draw prizes failed:', errText);
            const totalDrawConfigs = filteredDrawConfigs.reduce((sum, dc) => sum + dc.prizeConfigs.length, 0);
            totalFailed += totalDrawConfigs;
          }
        } catch (error) {
          console.error('[ERROR] Error saving draw-specific configurations:', error);
          const totalDrawConfigs = filteredDrawConfigs.reduce((sum, dc) => sum + dc.prizeConfigs.length, 0);
          totalFailed += totalDrawConfigs;
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
   * Save commission configurations for a betting pool
   * Extracts commission fields from formData and saves them to prizes-commissions endpoint
   * @param bettingPoolId - ID of the created betting pool
   * @param formData - Form data with commission values
   */
  const saveCommissionConfigurations = async (bettingPoolId: number, formData: FormData): Promise<{ success: boolean; error?: string }> => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

    try {
      // Reverse map: frontend betTypeCode -> backend GameType
      const betTypeToGameType: Record<string, string> = {
        'DIRECTO': 'DIRECTO',
        'PALÉ': 'PALE',
        'TRIPLETA': 'TRIPLETA',
        'CASH3_STRAIGHT': 'CASH3_STRAIGHT',
        'CASH3_BOX': 'CASH3_BOX',
        'PLAY4 STRAIGHT': 'PLAY4_STRAIGHT',
        'PLAY4 BOX': 'PLAY4_BOX',
        'SUPER_PALE': 'SUPER_PALE',
        'BOLITA 1': 'BOLITA_1',
        'BOLITA 2': 'BOLITA_2',
        'SINGULACIÓN 1': 'SINGULACION_1',
        'SINGULACIÓN 2': 'SINGULACION_2',
        'SINGULACIÓN 3': 'SINGULACION_3',
        'PICK5 STRAIGHT': 'PICK5_STRAIGHT',
        'PICK5 BOX': 'PICK5_BOX',
        'PICK TWO': 'PICK_TWO',
        'PICK2': 'PICK2',
        'CASH3 FRONT STRAIGHT': 'CASH3_FRONT_STRAIGHT',
        'CASH3_FRONT_BOX': 'CASH3_FRONT_BOX',
        'CASH3_BACK_STRAIGHT': 'CASH3_BACK_STRAIGHT',
        'CASH3 BACK BOX': 'CASH3_BACK_BOX',
        'PICK TWO FRONT': 'PICK_TWO_FRONT',
        'PICK TWO BACK': 'PICK_TWO_BACK',
        'PICK TWO MIDDLE': 'PICK_TWO_MIDDLE',
        'SINGULACION': 'SINGULACION',
        'PANAMA': 'PANAMA',
      };

      // Collect ALL commission items (general + draw-specific) for batch save
      interface CommissionData {
        commissionDiscount1?: number;
        commissionDiscount2?: number;
        commissionDiscount3?: number;
        commissionDiscount4?: number;
        commission2Discount1?: number;
        commission2Discount2?: number;
        commission2Discount3?: number;
        commission2Discount4?: number;
      }
      interface BatchItem {
        lotteryId: number | null;
        gameType: string;
        commissionDiscount1?: number;
        commission2Discount1?: number;
      }
      const batchItems: BatchItem[] = [];

      // Fetch draws to get drawId -> lotteryId mapping
      const { getAllDraws } = await import('@services/drawService');
      const drawsResponse = await getAllDraws({ isActive: true, loadAll: true }) as { success: boolean; data?: Array<{ drawId: number; lotteryId?: number }> };
      const drawIdToLotteryId: Record<number, number> = {};
      if (drawsResponse.success && drawsResponse.data) {
        drawsResponse.data.forEach(d => {
          if (d.lotteryId) drawIdToLotteryId[d.drawId] = d.lotteryId;
        });
      }

      // Helper to collect commissions for a given key prefix and lotteryId
      const collectCommissionsForPrefix = (keyPrefix: string, targetLotteryId: number | null): void => {
        const commissions: Record<string, CommissionData> = {};
        const escapedPrefix = keyPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const commissionPattern = new RegExp(`^${escapedPrefix}_COMMISSION_(.+)_COMMISSION_DISCOUNT_(\\d)$`);
        const commission2Pattern = new RegExp(`^${escapedPrefix}_COMMISSION2_(.+)_COMMISSION_2_DISCOUNT_(\\d)$`);

        Object.keys(formData).forEach(key => {
          const value = formData[key];
          if (value === '' || value === null || value === undefined) return;

          const commissionMatch = key.match(commissionPattern);
          if (commissionMatch) {
            const betTypeCode = commissionMatch[1];
            const discountNum = commissionMatch[2];
            const gameType = betTypeToGameType[betTypeCode] || betTypeCode;
            if (!commissions[gameType]) commissions[gameType] = {};
            (commissions[gameType] as Record<string, number>)[`commissionDiscount${discountNum}`] = parseFloat(String(value));
            return;
          }

          const commission2Match = key.match(commission2Pattern);
          if (commission2Match) {
            const betTypeCode = commission2Match[1];
            const discountNum = commission2Match[2];
            const gameType = betTypeToGameType[betTypeCode] || betTypeCode;
            if (!commissions[gameType]) commissions[gameType] = {};
            (commissions[gameType] as Record<string, number>)[`commission2Discount${discountNum}`] = parseFloat(String(value));
            return;
          }
        });

        for (const [gameType, commissionData] of Object.entries(commissions)) {
          batchItems.push({ lotteryId: targetLotteryId, gameType, ...commissionData });
        }
      };

      // Collect general commissions (lotteryId = null)
      collectCommissionsForPrefix('general', null);

      // Collect draw-specific commissions
      const drawPrefixes = new Set<string>();
      Object.keys(formData).forEach(key => {
        const match = key.match(/^(draw_\d+)_COMMISSION/);
        if (match) drawPrefixes.add(match[1]);
      });
      for (const drawPrefix of drawPrefixes) {
        const drawIdNum = parseInt(drawPrefix.split('_')[1]);
        const lotteryId = drawIdToLotteryId[drawIdNum] ?? null;
        if (lotteryId !== null) {
          collectCommissionsForPrefix(drawPrefix, lotteryId);
        }
      }

      // If no commission changes, return early
      if (batchItems.length === 0) {
        return { success: true };
      }

      const batchResp = await fetch(`${API_BASE}/betting-pools/${bettingPoolId}/prizes-commissions/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: batchItems })
      });

      if (!batchResp.ok) {
        const errText = await batchResp.text();
        console.error(`[COMMISSION SAVE] Batch POST error:`, errText);
        return { success: false, error: errText };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving commission configurations:', error);
      return { success: false, error: (error as Error).message };
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


      // Save schedules
      const result = await saveBettingPoolSchedules(bettingPoolId, schedules) as { success: boolean };

      if (result.success) {
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
      // Map form values to API format (English values matching backend)
      const fallTypeMap: Record<string, string> = { '1': 'OFF', '2': 'COLLECTION', '3': 'DAILY', '4': 'MONTHLY', '5': 'WEEKLY', '6': 'WEEKLY_NO_ACCUMULATED' };
      const printModeMap: Record<string, string> = { '1': 'DRIVER', '2': 'GENERIC' };
      const discountProviderMap: Record<string, string> = { '1': 'GROUP', '2': 'SELLER' };
      const discountModeMap: Record<string, string> = { '1': 'OFF', '2': 'CASH', '3': 'FREE_TICKET' };

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
        discountProvider: discountProviderMap[formData.discountProvider] || 'SELLER',
        discountMode: discountModeMap[formData.discountMode] || 'OFF',

        deactivationBalance: formData.deactivationBalance ? parseFloat(formData.deactivationBalance) : null,
        dailySaleLimit: formData.dailySaleLimit ? parseFloat(formData.dailySaleLimit) : null,
        dailyBalanceLimit: formData.todayBalanceLimit ? parseFloat(formData.todayBalanceLimit) : null,
        temporaryAdditionalBalance: formData.temporaryAdditionalBalance ? parseFloat(formData.temporaryAdditionalBalance) : null,

        controlWinningTickets: formData.controlWinningTickets ?? formData.winningTicketsControl,
        allowJackpot: formData.allowJackpot ?? formData.allowPassPot,
        printEnabled: formData.printEnabled ?? formData.printTickets,
        printTicketCopy: formData.printTicketCopy,

        // Future sales configuration
        allowFutureSales: formData.allowFutureSales !== undefined ? formData.allowFutureSales : true,
        maxFutureDays: formData.maxFutureDays ? parseInt(formData.maxFutureDays) : 7,

        // Note: Other fields (prizes, schedules, etc.) would need additional API endpoints
        // For now, only essential fields are sent
      };

      const response = await createBettingPool(bettingPoolData) as {
        success?: boolean;
        data?: { bettingPoolId?: number; id?: number };
        bettingPoolId?: number;  // Direct API response format
        BettingPoolId?: number;  // PascalCase API response format
      };

      // Handle both wrapped response {success: true, data: {...}}
      // and direct response {BettingPoolId: 123, ...}
      const isSuccess = response.success === true ||
                        response.bettingPoolId !== undefined ||
                        response.BettingPoolId !== undefined;

      if (isSuccess) {
        const createdBettingPoolId = response.data?.bettingPoolId ||
                                     response.data?.id ||
                                     response.bettingPoolId ||
                                     response.BettingPoolId;

        // Save prize configurations if betting pool was created successfully
        if (createdBettingPoolId) {

          // Save prize configurations
          try {
            const prizeResult = await savePrizeConfigurations(createdBettingPoolId, formData, templateDrawOverridesRef.current);

            if (prizeResult.success) {
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

          // Save commission configurations
          try {
            const commissionResult = await saveCommissionConfigurations(createdBettingPoolId, formData);

            if (!commissionResult.success) {
              console.warn(`[WARN] Failed to save commission configurations: ${commissionResult.error}`);
            }
          } catch (commissionError) {
            console.error('Error saving commission configurations:', commissionError);
            // Don't fail the whole operation if commissions fail to save
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
              } else {
                console.warn(`[WARN] Failed to save draws`);
              }
            } else {
            }
          } catch (drawsError) {
            console.error('Error saving draws:', drawsError);
            // Don't fail the whole operation if draws fail to save
            // The betting pool was created successfully
          }
        }

        // Show success message and navigate to list
        setSuccess(true);

        // Navigate to list after a brief delay to show success message
        setTimeout(() => {
          navigate('/betting-pools/list', {
            state: {
              message: 'Banca creada exitosamente',
              type: 'success'
            }
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating banca:', error);
      const errorMessage = handleBettingPoolError(error, 'create betting pool');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (updates: Record<string, string | number>): void => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    loading,
    loadingZones,
    errors,
    success,
    successMessage,
    zones,
    activeTab,
    handleChange,
    handleBatchChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll,
    clearSuccessMessage: () => setSuccessMessage(''),
    // Template copy functionality
    templateBettingPools,
    loadingTemplates,
    selectedTemplateId,
    templateFields,
    loadingTemplateData,
    handleTemplateSelect,
    handleTemplateFieldChange,
    applyTemplate,
  };
};

export default useCompleteBettingPoolForm;
