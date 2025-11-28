import { useState, useEffect, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBettingPoolById, getBettingPoolConfig, updateBettingPool, updateBettingPoolConfig, handleBettingPoolError } from '@/services/bettingPoolService';
import { getAllZones } from '@/services/zoneService';
import { savePrizeConfig, getAllBetTypesWithFields, getMergedPrizeData } from '@/services/prizeService';
import { saveBettingPoolSchedules, transformSchedulesToApiFormat, getBettingPoolSchedules, transformSchedulesToFormFormat } from '@/services/scheduleService';
import { getBettingPoolDraws, saveBettingPoolDraws } from '@/services/sortitionService';
import { getAllDraws } from '@/services/drawService';

// ============== INTERFACES ==============

interface AutoExpense {
  description: string;
  amount: string;
  frequency: string;
  active: boolean;
}

// Note: FormData uses index signature to allow dynamic prize fields
// All known fields are defined but the interface allows additional string keys
interface FormData {
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

interface FormErrors {
  submit?: string | null;
  bettingPoolName?: string | null;
  branchCode?: string | null;
  zoneId?: string | null;
  [key: string]: string | null | undefined;
}

interface Zone {
  zoneId: number;
  zoneName: string;
}

interface Draw {
  drawId: number;
  drawName: string;
  lotteryId?: number;
}

interface PrizesDraw {
  id: string;
  name: string;
  drawId?: number;
}

interface DrawValuesCache {
  [drawId: string]: Record<string, string | number>;
}

interface SyntheticEventLike {
  target: {
    name: string;
    value: string | number | boolean | number[] | AutoExpense[];
    type?: string;
    checked?: boolean;
  };
}

interface UseEditBettingPoolFormReturn {
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
  savePrizeConfigForSingleDraw: (drawId: string) => Promise<{ success: boolean; message?: string }>;
  clearSuccessMessage: () => void;
  clearErrors: () => void;
}

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface BettingPoolData {
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

interface ConfigResponse {
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

interface DrawApiData {
  bettingPoolDrawId?: number;
  drawId: number;
  drawName?: string;
  lotteryId?: number;
  isActive?: boolean;
  anticipatedClosingMinutes?: number;
}

interface BetType {
  betTypeCode: string;
  prizeFields?: PrizeField[];
}

interface PrizeField {
  fieldCode: string;
  prizeTypeId: number;
  defaultMultiplier?: number;
}

interface PrizeConfig {
  prizeTypeId: number;
  fieldCode: string;
  value: number;
}

interface SavePrizeResult {
  success: boolean;
  total?: number;
  successful?: number;
  failed?: number;
  results?: Array<{ success: boolean; lottery: string; count?: number; error?: string }>;
  message?: string;
  skipped?: boolean;
  error?: string;
}

interface PrizeData {
  betTypes?: BetType[];
  customMap?: Record<string, number>;
}

console.log('[ERROR] [FILE] useEditBettingPoolForm.js loaded - DRAWS API INTEGRATED (v2025-11-14)');

/**
 * Draw order for consistent sorting across tabs
 */
const DRAW_ORDER = [
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
  'LA CHICA', 'LA PRIMERA 8PM', 'PANAMA MIERCOLES', 'PANAMA DOMINGO', 'LA SUERTE 6:00pm'
];

/**
 * Custom hook for managing edit betting pool form with ALL 168 fields
 */
const useEditBettingPoolForm = (): UseEditBettingPoolFormReturn => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Form state - ALL 168 fields
  const [formData, setFormData] = useState<FormData>({
    // General
    bettingPoolName: '',
    branchCode: '',
    username: '',
    location: '',
    password: '',
    reference: '',
    confirmPassword: '',
    comment: '',

    // Configuration
    selectedZone: '',
    zoneId: '',
    fallType: '1',
    deactivationBalance: '',
    dailySaleLimit: '',
    dailyBalanceLimit: '',
    todayBalanceLimit: '',
    enableTemporaryBalance: false,
    temporaryAdditionalBalance: '',
    isActive: true,
    winningTicketsControl: false,
    controlWinningTickets: false,
    allowPassPot: true,
    allowJackpot: true,
    printTickets: true,
    printEnabled: true,
    printTicketCopy: true,
    smsOnly: false,
    minutesToCancelTicket: '30',
    ticketsToCancelPerDay: '',
    enableRecharges: true,
    printRechargeReceipt: true,
    allowPasswordChange: true,
    printerType: '1',
    discountProvider: '2',
    discountMode: '1',
    maximumCancelTicketAmount: '',
    maxTicketAmount: '',
    dailyPhoneRechargeLimit: '',
    limitPreference: null,
    creditLimit: '',

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

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBasicData, setLoadingBasicData] = useState<boolean>(true); // ⚡ PROGRESSIVE LOADING: Basic data (General tab)
  const [loadingPrizes, setLoadingPrizes] = useState<boolean>(false); // ⚡ PROGRESSIVE LOADING: Prize data (background)
  const [loadingZones, setLoadingZones] = useState<boolean>(true);
  const [loadingDraws, setLoadingDraws] = useState<boolean>(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]); // ⚡ PERFORMANCE: Load once, share between tabs
  const [prizesDraws, setPrizesDraws] = useState<PrizesDraw[]>([]); // Formatted draws for PrizesTab
  const [drawValuesCache, setDrawValuesCache] = useState<DrawValuesCache>({}); // ⚡ PERFORMANCE: Cache draw-specific values by lotteryId
  const [activeTab, setActiveTab] = useState<number>(0);

  // ⚡ DIRTY TRACKING: Store initial values to detect changes
  const [initialFormData, setInitialFormData] = useState<FormData | null>(null);

  /**
   * Load initial data (zones and bettingPool data)
   */
  useEffect(() => {
    console.log('[INFO] [HOOK] useEffect running, id:', id);
    loadInitialData();
  }, [id]);

  /**
   * Helper function to map backend config data to frontend form fields
   * Maps the data from GET /api/betting-pools/{id}/config to form structure
   */
  const mapConfigToFormData = (configResponse: ConfigResponse): Partial<FormData> => {
    if (!configResponse || (!configResponse.config && !configResponse.discountConfig && !configResponse.printConfig)) {
      return {};
    }

    const config = configResponse.config || {};
    const discountConfig = configResponse.discountConfig || {};
    const printConfig = configResponse.printConfig || {};
    const footer = configResponse.footer || {};

    // Reverse mapping for enums (backend -> frontend select values)
    const fallTypeReverseMap: Record<string, string> = { 'OFF': '1', 'COLLECTION': '2', 'DAILY': '3', 'MONTHLY': '4', 'WEEKLY': '5' };
    const printModeReverseMap: Record<string, string> = { 'DRIVER': '1', 'GENERIC': '2' };
    const discountProviderReverseMap: Record<string, string> = { 'GROUP': '1', 'SELLER': '2' };
    const discountModeReverseMap: Record<string, string> = { 'OFF': '1', 'CASH': '2', 'FREE_TICKET': '3' };

    return {
      // Config fields
      fallType: (config.fallType ? fallTypeReverseMap[config.fallType] : null) || '1',
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
      discountProvider: (discountConfig.discountProvider ? discountProviderReverseMap[discountConfig.discountProvider] : null) || '1',
      discountMode: (discountConfig.discountMode ? discountModeReverseMap[discountConfig.discountMode] : null) || '1',

      // Print config fields
      printerType: (printConfig.printMode ? printModeReverseMap[printConfig.printMode] : null) || '1',
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
      showDateTime: footer.showDateTime !== undefined ? footer.showDateTime : true
    };
  };

  /**
   * Load zones and bettingPool data
   * ⚡ PROGRESSIVE LOADING: Two-phase approach
   * Phase 1: Load basic data (zones + betting pool) - FAST, show form immediately
   * Phase 2: Load prizes in background - SLOW, show loading indicators in tabs
   */
  const loadInitialData = async (): Promise<void> => {
    console.log('[OK] [HOOK] loadInitialData() called, id:', id);
    const startTime = performance.now();
    console.log('[START] [PHASE 1] Loading basic data (zones + betting pool)...');

    try {
      setLoadingZones(true);
      setLoadingBasicData(true);

      if (id) {
        // ⚡ PHASE 1: Load zones, basic betting pool data, and configuration (FAST)
        console.log('[TIMING] Phase 1: Loading zones, betting pool, and configuration in parallel...');

        // ⚡ PERFORMANCE: Parallelize all API calls (including draws for tabs)
        const apiStartTime = performance.now();
        console.log('[TIMING] [TIMING] Starting parallel API calls at', apiStartTime.toFixed(2), 'ms');

        const [zonesResponse, bettingPoolResponse, configResponse, schedulesResponse, drawsResponse, allDrawsResponse] = await Promise.all([
          getAllZones(),
          getBettingPoolById(id),
          getBettingPoolConfig(id),
          getBettingPoolSchedules(id),
          getBettingPoolDraws(id),  // Returns betting pool draws config
          getAllDraws({ loadAll: true }) // ⚡ Load all draws once for both DrawsTab and PrizesTab
        ]) as unknown as [
          ApiResponse<Zone[]>,
          ApiResponse<BettingPoolData>,
          ApiResponse<ConfigResponse>,
          { success: boolean; data: Array<{ dayOfWeek: number; openingTime: string | null; closingTime: string | null }> },
          ApiResponse<DrawApiData[]>,
          ApiResponse<Draw[]>
        ];

        const apiEndTime = performance.now();
        const apiDuration = apiEndTime - apiStartTime;
        console.log('[PERF] [TIMING] All 6 parallel API calls completed in', apiDuration.toFixed(2), 'ms');

        // Start processing data
        const processingStartTime = performance.now();
        console.log('[TIMING] [TIMING] Starting data processing...');

        // Process zones
        if (zonesResponse.success && zonesResponse.data) {
          setZones(zonesResponse.data);
          console.log(`[SUCCESS] Loaded ${zonesResponse.data.length} zones`);
        }
        setLoadingZones(false);

        // Process all draws (for DrawsTab and PrizesTab)
        if (allDrawsResponse.success && allDrawsResponse.data) {
          // Sort draws according to DRAW_ORDER (for DrawsTab)
          const sortedDraws = allDrawsResponse.data.sort((a, b) => {
            const indexA = DRAW_ORDER.indexOf(a.drawName);
            const indexB = DRAW_ORDER.indexOf(b.drawName);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setDraws(sortedDraws);

          console.log('[DEBUG] [DEBUG] First 3 all draws structure:', sortedDraws.slice(0, 3).map(d => ({
            drawId: d.drawId,
            lotteryId: d.lotteryId,
            drawName: d.drawName
          })));

          // Format draws for PrizesTab (with 'General' tab)
          const formattedForPrizes = sortedDraws.map(draw => ({
            id: `draw_${draw.drawId}`,
            name: draw.drawName,
            drawId: draw.drawId
          }));
          setPrizesDraws([
            { id: 'general', name: 'General' }, // Always include "General" first
            ...formattedForPrizes
          ]);

          console.log(`[SUCCESS] Loaded ${sortedDraws.length} draws for tabs`);
        }
        setLoadingDraws(false);

        // Process betting pool basic data
        if (bettingPoolResponse.success && bettingPoolResponse.data) {
          const branch = bettingPoolResponse.data;
          console.log('[SUCCESS] Loaded betting pool data');

          // ⚡ OPTIMIZATION: Update form with basic data first
          const basicFormData: Partial<FormData> = {
            bettingPoolName: branch.bettingPoolName || '',
            branchCode: branch.bettingPoolCode || branch.branchCode || '',
            username: branch.username || '',
            location: branch.location || '',
            reference: branch.reference || '',
            comment: branch.comment || '',
            selectedZone: String(branch.zoneId ?? ''),
            isActive: branch.isActive !== undefined ? branch.isActive : true
          };

          // ✅ NEW: Map configuration data from API response to form fields
          let configFormData: Partial<FormData> = {};
          if (configResponse && configResponse.success && configResponse.data) {
            configFormData = mapConfigToFormData(configResponse.data);
            console.log('[SUCCESS] Loaded configuration data');
          }

          // ✅ Process schedules data (now loaded in parallel)
          let scheduleFormData: Partial<FormData> = {};
          try {
            if (schedulesResponse.success && schedulesResponse.data && schedulesResponse.data.length > 0) {
              scheduleFormData = transformSchedulesToFormFormat(schedulesResponse.data as Parameters<typeof transformSchedulesToFormFormat>[0]) as Partial<FormData>;
              console.log('[SUCCESS] Loaded schedule data for all 7 days');
            }
          } catch (scheduleError) {
            console.error('[ERROR] Error processing schedules:', scheduleError);
            // Don't fail the whole form if schedules fail to load
          }

          // ✅ Process draws data (NEW API format)
          console.log('[WARN] [HOOK] Processing draws data...');
          console.log('[DEBUG] [DEBUG] drawsResponse from /betting-pools/draws:', drawsResponse.data);
          let drawsFormData: { selectedDraws: number[]; anticipatedClosing: string; anticipatedClosingDraws: number[] } = { selectedDraws: [], anticipatedClosing: '', anticipatedClosingDraws: [] };
          try {
            if (drawsResponse.success && drawsResponse.data && drawsResponse.data.length > 0) {
              // NEW API: Response already contains drawId directly! No mapping needed!
              // Format: { bettingPoolDrawId, drawId, drawName, lotteryId, isActive, anticipatedClosingMinutes, ... }

              // Extract enabled draws (active draws)
              const enabledDraws = drawsResponse.data.filter(d => d.isActive);
              const enabledDrawIds = enabledDraws.map(d => d.drawId);

              console.log('[DEBUG] [DEBUG] enabledDrawIds (from /draws API):', enabledDrawIds);
              console.log('[DEBUG] [DEBUG] enabledDraws:', enabledDraws.map(d => ({
                drawId: d.drawId,
                drawName: d.drawName,
                lotteryId: d.lotteryId
              })));

              // Extract draws with anticipated closing
              const drawsWithClosing = drawsResponse.data
                .filter(d => d.anticipatedClosingMinutes != null && d.anticipatedClosingMinutes > 0);

              const drawIdsWithClosing = drawsWithClosing.map(d => d.drawId);

              // Use the first value found (or empty if none) - convert to String like V1
              const anticipatedClosing = drawsWithClosing.length > 0
                ? String(drawsWithClosing[0].anticipatedClosingMinutes)
                : '';

              drawsFormData = {
                selectedDraws: enabledDrawIds,
                anticipatedClosing: anticipatedClosing,
                anticipatedClosingDraws: drawIdsWithClosing
              };

              console.log('[DEBUG] [DEBUG] drawsFormData:', drawsFormData);
              console.log(`[SUCCESS] Loaded ${drawsFormData.selectedDraws.length} selected draws, ${drawsFormData.anticipatedClosingDraws.length} with anticipated closing`);
            } else {
              console.warn('[WARN] [DEBUG] No draws data found or empty array');
            }
          } catch (drawsError) {
            console.error('[ERROR] Error processing draws:', drawsError);
            // Don't fail the whole form if draws fail to load
          }

          // ✅ Merge basic data + configuration data + schedule data + draws data
          const completeFormData: FormData = {
            ...formData,
            ...basicFormData,
            ...configFormData,
            ...scheduleFormData,
            ...drawsFormData
          } as FormData;

          setFormData(completeFormData);

          // ⚡ DIRTY TRACKING: Save initial state for comparison
          setInitialFormData(completeFormData);

          const processingEndTime = performance.now();
          const processingDuration = processingEndTime - processingStartTime;
          console.log('[PERF] [TIMING] Data processing completed in', processingDuration.toFixed(2), 'ms');

          const phase1Time = (performance.now() - startTime).toFixed(2);
          console.log(`[SUCCESS] [PHASE 1] Basic data loaded in ${phase1Time}ms (API: ${apiDuration.toFixed(2)}ms + Processing: ${processingDuration.toFixed(2)}ms)`);

          // ⚡ UNLOCK UI: User can now see and interact with the form
          setLoadingBasicData(false);

          // ⚡ PHASE 2: Load prizes in background (SLOW, doesn't block UI)
          console.log('[SYNC] [PHASE 2] Loading prize data in background...');
          setLoadingPrizes(true);

          loadPrizeValues(id)
            .then(prizeValues => {
              if (Object.keys(prizeValues).length > 0) {
                console.log(`[SUCCESS] Loaded ${Object.keys(prizeValues).length} prize values`);

                setFormData(prev => ({
                  ...prev,
                  ...prizeValues
                }) as FormData);

                // Update initial form data with prizes
                setInitialFormData(prev => prev ? ({
                  ...prev,
                  ...prizeValues
                }) as FormData : prev);
              }

              const phase2Time = (performance.now() - startTime).toFixed(2);
              console.log(`[SUCCESS] [PHASE 2] Prize data loaded in ${phase2Time}ms`);
            })
            .catch(error => {
              console.error('[ERROR] Error loading prize values:', error);
              // Don't fail the whole form if prizes fail to load
            })
            .finally(() => {
              setLoadingPrizes(false);
              const totalTime = (performance.now() - startTime).toFixed(2);
              console.log(`[SUCCESS] All data loaded successfully in ${totalTime}ms`);
            });
        }
      } else {
        // No ID provided, only load zones
        const zonesResp = await getAllZones() as ApiResponse<Zone[]>;
        if (zonesResp.success && zonesResp.data) {
          setZones(zonesResp.data);
        }
        setLoadingZones(false);
        setLoadingBasicData(false);
      }

    } catch (error) {
      console.error('[ERROR] Error loading initial data:', error);
      setErrors({ submit: 'Error cargando datos del betting pool' });
      setLoadingBasicData(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | SyntheticEventLike): void => {
    const { name, value, type, checked } = e.target as { name: string; value: string | number | boolean | number[] | AutoExpense[]; type?: string; checked?: boolean };

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' && name === 'limitPreference' ? null : value)
    }) as FormData);
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
    const inicioKey = `${day}Inicio` as keyof FormData;
    const finKey = `${day}Fin` as keyof FormData;
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
   * Save prize configurations for a betting pool
   * Supports both general configs and lottery-specific configs
   *
   * General configs: POST /betting-pools/{id}/prize-config
   * Draw-specific: POST /betting-pools/{id}/draws/{drawId}/prize-config
   *
   * IMPORTANT: For lottery-specific configs (lottery_XX_), we need to map
   * lotteryId -> drawId. Currently uses the FIRST draw of each lottery.
   *
   * Body format:
   * {
   *   prizeConfigs: [
   *     { prizeTypeId: 15, fieldCode: "DIRECTO_PRIMER_PAGO", value: 80 }
   *   ]
   * }
   */
  const savePrizeConfigurations = async (
    bettingPoolId: string | undefined,
    currentFormData: FormData | Record<string, string | number | boolean | number[] | AutoExpense[] | null>,
    initialData: FormData | null = null
  ): Promise<SavePrizeResult> => {
    const startTime = performance.now();
    console.log('[SAVE] Building prize configurations to save...');

    try {
      // Get all bet types to build fieldCode -> prizeTypeId map
      const betTypes = await getAllBetTypesWithFields();

      // Build a map: fieldCode -> prizeTypeId
      const fieldCodeToId: Record<string, number> = {};
      (betTypes as BetType[]).forEach(betType => {
        if (betType.prizeFields) {
          betType.prizeFields.forEach(field => {
            fieldCodeToId[field.fieldCode] = field.prizeTypeId;
          });
        }
      });

      console.log(`Built fieldCode map with ${Object.keys(fieldCodeToId).length} prize types`);

      // Group configs by lottery (general vs lottery_XX)
      const configsByLottery: Record<string, PrizeConfig[]> = {};
      const prizeFieldSet = new Set(Object.keys(fieldCodeToId));

      // ⚡ OPTIMIZED: More efficient filtering + DIRTY TRACKING
      // Group fields by lottery ID
      console.log('[DEBUG] [DEBUG] Starting prize change detection...');
      console.log('[DEBUG] [DEBUG] initialData exists?', !!initialData);
      console.log('[DEBUG] [DEBUG] currentFormData keys count:', Object.keys(currentFormData).length);

      let debugCount = 0;
      Object.keys(currentFormData).forEach(key => {
        // Skip non-prize type fields
        const fieldValue = currentFormData[key];
        if (!key.includes('_') || fieldValue === '' || fieldValue === null || fieldValue === undefined) {
          return;
        }

        // Prize type fields have format:
        //   - V1: BETTYPE_FIELDCODE (e.g., "DIRECTO_DIRECTO_PRIMER_PAGO")
        //   - V2: {lotteryId}_{betTypeCode}_{fieldCode} (e.g., "general_DIRECTO_DIRECTO_PRIMER_PAGO")

        let cleanKey = key;
        let lotteryId = null;

        // ✅ FIX: Remove lottery prefix if present
        const parts = key.split('_');

        // Check for "general_" prefix
        if (parts[0] === 'general' && parts.length >= 4) {
          lotteryId = 'general';
          cleanKey = parts.slice(1).join('_'); // Remove "general_"
        }
        // Check for "lottery_XX_" prefix
        else if (parts[0] === 'lottery' && parts.length >= 5) {
          lotteryId = `${parts[0]}_${parts[1]}`; // "lottery_43"
          cleanKey = parts.slice(2).join('_'); // Remove "lottery_XX_"
        }
        // V1 format without prefix - treat as general
        else if (parts.length >= 3) {
          lotteryId = 'general';
          cleanKey = key;
        }

        // Now extract betTypeCode and fieldCode from cleanKey
        const cleanParts = cleanKey.split('_');
        if (cleanParts.length >= 3) {
          const fieldCode = cleanParts.slice(1).join('_'); // "DIRECTO_PRIMER_PAGO"

          // Check if this fieldCode exists in our bet types
          if (prizeFieldSet.has(fieldCode)) {
            const prizeTypeId = fieldCodeToId[fieldCode];
            const rawValue = currentFormData[key];
            const currentValue = parseFloat(String(rawValue));
            const initialValue = initialData?.[key as keyof FormData];
            const initialValueParsed = parseFloat(String(initialValue ?? ''));

            // Debug first 3 fields
            if (debugCount < 3 && key.startsWith('general_')) {
              console.log(`[DEBUG] [DEBUG #${debugCount + 1}] Field: ${key}`);
              console.log(`  - currentValue (raw): "${rawValue}" (type: ${typeof rawValue})`);
              console.log(`  - currentValue (parsed): ${currentValue}`);
              console.log(`  - initialValue (raw): "${initialValue}" (type: ${typeof initialValue})`);
              console.log(`  - initialValue (parsed): ${initialValueParsed}`);
              console.log(`  - initialData[key] exists? ${initialValue !== undefined}`);
              console.log(`  - Are they equal? ${initialValueParsed === currentValue}`);
              debugCount++;
            }

            // ⚡ DIRTY TRACKING: Only include if value changed
            const hasChanged = !initialData ||
                               initialData[key as keyof FormData] === undefined ||
                               parseFloat(String(initialData[key as keyof FormData])) !== currentValue;

            if (hasChanged && lotteryId) {
              if (!configsByLottery[lotteryId]) {
                configsByLottery[lotteryId] = [];
              }

              configsByLottery[lotteryId].push({
                prizeTypeId: prizeTypeId,
                fieldCode: fieldCode,
                value: currentValue
              });
              console.log(`[OK] Changed [${lotteryId}]: ${key} -> ${fieldCode} = ${rawValue} (was: ${initialValue ?? 'N/A'})`);
            }
          }
        }
      });

      if (Object.keys(configsByLottery).length === 0) {
        console.log('[OK] No prize values changed - skipping save');
        return { success: true, message: 'No changes', skipped: true };
      }

      console.log(`[SAVE] Saving prize configurations for ${Object.keys(configsByLottery).length} lottery groups...`);

      // Save each lottery's configs
      const savePromises: Promise<{ success: boolean; lottery: string; count?: number; error?: string }>[] = [];
      let totalSaved = 0;
      let totalFailed = 0;

      for (const [lotteryIdKey, prizeConfigs] of Object.entries(configsByLottery)) {
        if (lotteryIdKey === 'general') {
          // Save general configs
          console.log(`[SAVE] Saving ${prizeConfigs.length} general prize config(s)...`);
          savePromises.push(
            savePrizeConfig(bettingPoolId || '', prizeConfigs)
              .then(() => {
                console.log(`[SUCCESS] General configs saved successfully`);
                totalSaved += prizeConfigs.length;
                return { success: true, lottery: 'general', count: prizeConfigs.length };
              })
              .catch((error: Error) => {
                console.error(`[ERROR] Error saving general configs:`, error);
                totalFailed += prizeConfigs.length;
                return { success: false, lottery: 'general', error: error.message };
              })
          );
        } else {
          // Extract lotteryId number from "lottery_43"
          const lotteryIdNum = parseInt(lotteryIdKey.split('_')[1]);

          console.log(`[SAVE] Saving ${prizeConfigs.length} prize config(s) for lottery ${lotteryIdNum}...`);

          // For lottery-specific: Get first draw ID, then save
          savePromises.push(
            fetch(`/api/draws/lottery/${lotteryIdNum}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              }
            })
              .then(res => res.json())
              .then(draws => {
                if (!draws || draws.length === 0) {
                  throw new Error(`No draws found for lottery ${lotteryIdNum}`);
                }

                // Use first draw
                const firstDraw = draws[0];
                const drawId = firstDraw.drawId;

                console.log(`  -> Using draw ${drawId} (${firstDraw.drawName || 'N/A'}) for lottery ${lotteryIdNum}`);

                // Save to draw-specific endpoint
                return fetch(`/api/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ prizeConfigs })
                });
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
              })
              .then(() => {
                console.log(`[SUCCESS] Lottery ${lotteryIdNum} configs saved successfully`);
                totalSaved += prizeConfigs.length;
                return { success: true, lottery: lotteryIdKey, count: prizeConfigs.length };
              })
              .catch((error: Error) => {
                console.error(`[ERROR] Error saving lottery ${lotteryIdNum} configs:`, error);
                totalFailed += prizeConfigs.length;
                return { success: false, lottery: lotteryIdKey, error: error.message };
              })
          );
        }
      }

      // Wait for all saves to complete
      const results = await Promise.all(savePromises);

      const endTime = performance.now();
      const saveTime = (endTime - startTime).toFixed(2);

      if (totalFailed === 0) {
        console.log(`[SUCCESS] All prize configurations saved successfully in ${saveTime}ms`);
      } else {
        console.warn(`[WARN] Prize configurations partially saved: ${totalSaved} succeeded, ${totalFailed} failed`);
      }

      return {
        success: totalFailed === 0,
        total: totalSaved + totalFailed,
        successful: totalSaved,
        failed: totalFailed,
        results
      };
    } catch (err) {
      const error = err as Error;
      const endTime = performance.now();
      const saveTime = (endTime - startTime).toFixed(2);
      console.error(`[ERROR] Error saving prize configurations after ${saveTime}ms:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * Load prize values for the betting pool
   * Merges default values from bet types with custom values from banca_prize_configs
   */
  const loadPrizeValues = async (bettingPoolId: string): Promise<Record<string, string | number>> => {
    try {
      console.log(`Loading prize values for betting pool ${bettingPoolId}...`);

      // Get merged prize data (defaults + custom values)
      const prizeData = await getMergedPrizeData(bettingPoolId as unknown as null) as PrizeData | null;

      if (!prizeData || !prizeData.betTypes) {
        console.log('No prize data available');
        return {};
      }

      // Build formData object from prize data
      const prizeFormData: Record<string, string | number> = {};
      const customMap = (prizeData.customMap || {}) as Record<string, number>;

      // Process each bet type
      (prizeData.betTypes ?? []).forEach((betType: BetType) => {
        if (!betType.prizeFields || betType.prizeFields.length === 0) {
          return;
        }

        // Process each prize type field
        betType.prizeFields.forEach(field => {
          // ✅ FIX: Use "general_" prefix to match PrizesTab format
          const fieldKey = `general_${betType.betTypeCode}_${field.fieldCode}`;
          const customKey = `${betType.betTypeCode}_${field.fieldCode}`;

          // Start with default value from the field
          let value: string | number = field.defaultMultiplier || '';

          // Override with custom value if it exists
          if (customMap[customKey] !== undefined) {
            value = customMap[customKey];
            console.log(`Found custom value for ${fieldKey}: ${value} (overriding default: ${field.defaultMultiplier})`);
          } else {
            console.log(`Using default value for ${fieldKey}: ${value}`);
          }

          // Store in formData format with "general_" prefix
          prizeFormData[fieldKey] = value;
        });
      });

      console.log(`Loaded ${Object.keys(prizeFormData).length} prize type values`);
      return prizeFormData;
    } catch (error) {
      console.error('Error loading prize values:', error);
      return {};
    }
  };

  /**
   * 🔥 NEW: Load draw-specific prize values with caching
   * ⚡ PERFORMANCE: Caches loaded values to avoid duplicate API calls
   * @param {number} lotteryId - The lottery ID (e.g., 43 for "LA PRIMERA")
   * @param {number} bettingPoolId - The betting pool ID
   */
  const loadDrawSpecificValues = async (lotteryId: number, bettingPoolId: number | string): Promise<Record<string, string | number>> => {
    try {
      // ⚡ PERFORMANCE: Check cache first
      if (drawValuesCache[lotteryId]) {
        console.log(`[PERF] Using cached values for lottery ${lotteryId} (skipping API calls)`);
        return drawValuesCache[lotteryId];
      }

      console.log(`[DRAW] Loading draw-specific values for draw ${lotteryId}...`);

      // Step 1: Get all draws for this lottery
      const response = await fetch(`/api/draws/lottery/${lotteryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`[WARN] No draws found for lottery ${lotteryId} (${response.status})`);
        return {};
      }

      const draws = await response.json();
      if (!draws || draws.length === 0) {
        console.log(`[INFO] No draws available for lottery ${lotteryId}`);
        return {};
      }

      // Step 2: Use first draw to get prize config
      const firstDraw = draws[0];
      const drawId = firstDraw.drawId;
      console.log(`  -> Using draw ${drawId} (${firstDraw.drawName || 'N/A'})`);

      // Step 3: Get prize config for this draw
      const configResponse = await fetch(`/api/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!configResponse.ok) {
        console.log(`[INFO] No custom prize config found for draw ${drawId}`);
        return {};
      }

      const configs = await configResponse.json();
      console.log(`  -> Raw API response:`, configs);

      if (!configs || configs.length === 0) {
        console.log(`[INFO] No custom values for lottery ${lotteryId}`);
        return {};
      }

      // Step 4: Build formData with lottery_XX_ prefix
      const lotteryFormData: Record<string, string | number> = {};
      (configs as Array<{ fieldCode: string; customValue: string | number }>).forEach(config => {
        // Extract betTypeCode from fieldCode (first part)
        const parts = config.fieldCode.split('_');
        const betTypeCode = parts[0];

        // Build key: lottery_43_DIRECTO_DIRECTO_PRIMER_PAGO
        const fieldKey = `lottery_${lotteryId}_${betTypeCode}_${config.fieldCode}`;
        // ✅ FIX: API returns 'customValue', not 'value'
        lotteryFormData[fieldKey] = config.customValue;

        console.log(`  [OK] Loaded: ${fieldKey} = ${config.customValue}`);
      });

      // ⚡ PERFORMANCE: Store in cache for future use
      setDrawValuesCache(prev => ({
        ...prev,
        [lotteryId]: lotteryFormData
      }));

      console.log(`[SUCCESS] Loaded ${Object.keys(lotteryFormData).length} lottery-specific values (cached for future use)`);
      return lotteryFormData;

    } catch (error) {
      console.error(`[ERROR] Error loading lottery-specific values for lottery ${lotteryId}:`, error);
      return {};
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.bettingPoolName.trim()) {
      newErrors.bettingPoolName = 'El nombre del betting pool es requerido';
    }

    if (!formData.branchCode.trim()) {
      newErrors.branchCode = 'El código del betting pool es requerido';
    }

    if (!formData.selectedZone) {
      newErrors.selectedZone = 'Debe seleccionar una zona';
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
   * Check if schedule data has changed
   */
  const hasScheduleDataChanged = (): boolean => {
    if (!initialFormData) return true;

    const scheduleFields: (keyof FormData)[] = [
      'domingoInicio', 'domingoFin',
      'lunesInicio', 'lunesFin',
      'martesInicio', 'martesFin',
      'miercolesInicio', 'miercolesFin',
      'juevesInicio', 'juevesFin',
      'viernesInicio', 'viernesFin',
      'sabadoInicio', 'sabadoFin'
    ];

    const changedFields = scheduleFields.filter(field =>
      formData[field] !== initialFormData[field]
    );

    if (changedFields.length > 0) {
      console.log(`[SCHEDULE] Schedule changes detected in ${changedFields.length} field(s):`, changedFields);
    }

    return changedFields.length > 0;
  };

  const hasDrawsDataChanged = (): boolean => {
    if (!initialFormData) return true;

    // Compare selected draws
    const prevLotteries = initialFormData.selectedDraws || [];
    const currLotteries = formData.selectedDraws || [];

    if (prevLotteries.length !== currLotteries.length) {
      console.log(`[TARGET] Draws changes detected: draw count changed from ${prevLotteries.length} to ${currLotteries.length}`);
      return true;
    }

    const prevSet = new Set(prevLotteries);
    const currSet = new Set(currLotteries);
    if (!Array.from(prevSet).every(id => currSet.has(id))) {
      console.log('[TARGET] Draws changes detected: selected draws changed');
      return true;
    }

    // Compare anticipated closing
    if (formData.anticipatedClosing !== initialFormData.anticipatedClosing) {
      console.log(`[TARGET] Draws changes detected: anticipated closing changed from ${initialFormData.anticipatedClosing} to ${formData.anticipatedClosing}`);
      return true;
    }

    // Compare anticipated closing lotteries
    const prevClosingLotteries = initialFormData.anticipatedClosingDraws || [];
    const currClosingLotteries = formData.anticipatedClosingDraws || [];

    if (prevClosingLotteries.length !== currClosingLotteries.length) {
      console.log(`[TARGET] Draws changes detected: anticipated closing draws count changed from ${prevClosingLotteries.length} to ${currClosingLotteries.length}`);
      return true;
    }

    const prevClosingSet = new Set(prevClosingLotteries);
    const currClosingSet = new Set(currClosingLotteries);
    if (!Array.from(prevClosingSet).every(id => currClosingSet.has(id))) {
      console.log('[TARGET] Draws changes detected: anticipated closing draws changed');
      return true;
    }

    return false;
  };

  /**
   * Handle form submission
   * ✅ FIX: Uses TWO endpoints - one for basic data, one for config
   * ✅ FIX: Updates initialFormData after successful save
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const startTime = performance.now();
    console.log('[START] Starting save operation...');

    setLoading(true);
    setErrors({});

    try {
      // Map form values to API format
      const fallTypeMap: Record<string, string> = { '1': 'OFF', '2': 'COLLECTION', '3': 'DAILY', '4': 'MONTHLY', '5': 'WEEKLY' };
      const printModeMap: Record<string, string> = { '1': 'DRIVER', '2': 'GENERIC' };
      const discountProviderMap: Record<string, string> = { '1': 'GROUP', '2': 'SELLER' };
      const discountModeMap: Record<string, string> = { '1': 'OFF', '2': 'CASH', '3': 'FREE_TICKET' };

      // ========================================
      // 1️⃣ BASIC DATA - PUT /api/betting-pools/{id}
      // ========================================
      const basicData = {
        bettingPoolName: formData.bettingPoolName,
        location: formData.location || null,
        reference: formData.reference || null,
        comment: formData.comment || null,
        zoneId: parseInt(formData.selectedZone),
        username: formData.username || null,
        password: formData.password || null,
        isActive: formData.isActive
      };

      // ========================================
      // 2️⃣ CONFIGURATION DATA - POST /api/betting-pools/{id}/config
      // ========================================
      const configData = {
        config: {
          fallType: fallTypeMap[formData.fallType] || 'OFF',
          deactivationBalance: formData.deactivationBalance ? parseFloat(formData.deactivationBalance) : null,
          dailySaleLimit: formData.dailySaleLimit ? parseFloat(formData.dailySaleLimit) : null,
          dailyBalanceLimit: formData.dailyBalanceLimit ? parseFloat(formData.dailyBalanceLimit) : null,
          temporaryAdditionalBalance: formData.enableTemporaryBalance && formData.temporaryAdditionalBalance ?
            parseFloat(formData.temporaryAdditionalBalance) : null,
          enableTemporaryBalance: formData.enableTemporaryBalance || false,
          creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
          controlWinningTickets: formData.controlWinningTickets || false,
          allowJackpot: formData.allowJackpot !== undefined ? formData.allowJackpot : true,
          enableRecharges: formData.enableRecharges !== undefined ? formData.enableRecharges : true,
          allowPasswordChange: formData.allowPasswordChange !== undefined ? formData.allowPasswordChange : true,
          cancelMinutes: formData.minutesToCancelTicket ? parseInt(formData.minutesToCancelTicket) : 30,
          dailyCancelTickets: formData.ticketsToCancelPerDay ? parseInt(formData.ticketsToCancelPerDay) : null,
          maxCancelAmount: formData.maximumCancelTicketAmount ? parseFloat(formData.maximumCancelTicketAmount) : null,
          maxTicketAmount: formData.maxTicketAmount ? parseFloat(formData.maxTicketAmount) : null,
          maxDailyRecharge: formData.dailyPhoneRechargeLimit ? parseFloat(formData.dailyPhoneRechargeLimit) : null,
          paymentMode: 'BANCA'
        },
        discountConfig: {
          discountProvider: discountProviderMap[formData.discountProvider] || 'GRUPO',
          discountMode: discountModeMap[formData.discountMode] || 'OFF'
        },
        printConfig: {
          printMode: printModeMap[formData.printerType] || 'DRIVER',
          printEnabled: formData.printEnabled !== undefined ? formData.printEnabled : true,
          printTicketCopy: formData.printTicketCopy !== undefined ? formData.printTicketCopy : true,
          printRechargeReceipt: formData.printRechargeReceipt !== undefined ? formData.printRechargeReceipt : true,
          smsOnly: formData.smsOnly || false
        },
        footer: {
          autoFooter: formData.autoFooter || false,
          footerLine1: formData.footerText1 || '',
          footerLine2: formData.footerText2 || '',
          footerLine3: formData.footerText3 || '',
          footerLine4: formData.footerText4 || '',
          showBranchInfo: formData.showBranchInfo !== undefined ? formData.showBranchInfo : true,
          showDateTime: formData.showDateTime !== undefined ? formData.showDateTime : true
        }
      };

      // ========================================
      // 3️⃣ CALL BOTH ENDPOINTS IN PARALLEL
      // ========================================
      console.log('[SEND] Calling 2 endpoints in parallel...');
      console.log('  - PUT /api/betting-pools/' + id, basicData);
      console.log('  - POST /api/betting-pools/' + id + '/config', configData);

      const bettingPoolId = id as string;
      const [basicResponse, configResponse] = await Promise.all([
        updateBettingPool(bettingPoolId, basicData),
        updateBettingPoolConfig(bettingPoolId, configData)
      ]);

      console.log('[SUCCESS] Basic data response:', basicResponse);
      console.log('[SUCCESS] Config response:', configResponse);

      if (basicResponse.success && configResponse.success) {
        // ========================================
        // 4️⃣ SAVE PRIZE CONFIGURATIONS
        // ========================================
        console.log(`Betting pool updated with ID: ${id}. Saving prize configurations...`);

        try {
          const prizeResult = await savePrizeConfigurations(id, formData, initialFormData);

          if (prizeResult.success) {
            if (prizeResult.skipped) {
              console.log(`[OK] No prize changes to save`);
            } else {
              console.log(`[SUCCESS] ${prizeResult.total} prize configuration(s) saved successfully`);
            }
          } else {
            console.warn(`[WARN] Some prize configurations failed to save: ${prizeResult.failed} of ${prizeResult.total}`);
          }
        } catch (prizeError) {
          console.error('Error saving prize configurations:', prizeError);
          // Don't fail the whole operation if prizes fail to save
        }

        // ========================================
        // 5️⃣ SAVE SCHEDULES IF CHANGED
        // ========================================
        console.log('[DEBUG] [HOOK] Checking schedule changes...');
        console.log('[DEBUG] [HOOK] Current formData schedules:', {
          domingoInicio: formData.domingoInicio,
          domingoFin: formData.domingoFin,
          lunesInicio: formData.lunesInicio,
          lunesFin: formData.lunesFin
        });
        console.log('[DEBUG] [HOOK] Initial formData schedules:', {
          domingoInicio: initialFormData?.domingoInicio,
          domingoFin: initialFormData?.domingoFin,
          lunesInicio: initialFormData?.lunesInicio,
          lunesFin: initialFormData?.lunesFin
        });

        const scheduleChanged = hasScheduleDataChanged();
        console.log(`[DEBUG] [HOOK] Schedule changed: ${scheduleChanged}`);

        if (scheduleChanged) {
          try {
            console.log('[SCHEDULE] [HOOK] Updating schedules...');
            const schedules = transformSchedulesToApiFormat(formData as unknown as Parameters<typeof transformSchedulesToApiFormat>[0]);
            console.log('[SCHEDULE] [HOOK] Transformed schedules:', schedules);
            const scheduleResult = await saveBettingPoolSchedules(id || '', schedules);
            if (scheduleResult.success) {
              console.log('[SUCCESS] [HOOK] Schedules updated successfully');
            }
          } catch (scheduleError) {
            console.error('[ERROR] [HOOK] Error saving schedules:', scheduleError);
            // Don't fail the whole operation if schedules fail to save
          }
        } else {
          console.log('[OK] [HOOK] No schedule changes to save');
        }

        // ========================================
        // 🎯 PASO 6: SAVE DRAWS IF CHANGED
        // ========================================
        const drawsChanged = hasDrawsDataChanged();
        console.log(`[DEBUG] [HOOK] Draws changed: ${drawsChanged}`);

        if (drawsChanged) {
          try {
            console.log('[TARGET] [HOOK] Updating draws...');
            console.log('[LIST] [HOOK] FormData antes de guardar:', {
              selectedDraws: formData.selectedDraws,
              anticipatedClosing: formData.anticipatedClosing,
              anticipatedClosingDraws: formData.anticipatedClosingDraws
            });

            // Build draws array from formData (NEW API format)
            interface DrawToSave {
              drawId: number;
              isActive: boolean;
              anticipatedClosingMinutes: number | null;
              enabledGameTypeIds: number[];
            }
            const drawsToSave: DrawToSave[] = [];

            formData.selectedDraws.forEach(drawId => {
              const hasAnticipatedClosing = formData.anticipatedClosingDraws?.includes(drawId);
              drawsToSave.push({
                drawId: drawId,  // NEW: drawId instead of lotteryId
                isActive: true,  // NEW: isActive instead of isEnabled
                anticipatedClosingMinutes: hasAnticipatedClosing ? parseInt(formData.anticipatedClosing) || null : null,  // NEW: anticipatedClosingMinutes
                enabledGameTypeIds: []
              });
            });

            console.log('[SEND] [HOOK] Draws payload (NEW format):', drawsToSave);
            console.log(`[SEND] [HOOK] Enviando ${drawsToSave.length} draws al endpoint`);

            const drawsResult = await saveBettingPoolDraws(id || '', drawsToSave);
            if (drawsResult.success) {
              console.log('[SUCCESS] [HOOK] Draws updated successfully');
            }
          } catch (drawsError) {
            console.error('[ERROR] [HOOK] Error saving draws:', drawsError);
            // Don't fail the whole operation if draws fail to save
          }
        } else {
          console.log('[OK] [HOOK] No draw changes to save');
        }

        // ========================================
        // 7️⃣ ✅ FIX: UPDATE initialFormData WITH NEW VALUES
        // ========================================
        setInitialFormData({ ...formData });
        console.log('[SUCCESS] initialFormData updated with new values');

        const endTime = performance.now();
        const saveTime = (endTime - startTime).toFixed(2);
        console.log(`[SUCCESS] Save operation completed successfully in ${saveTime}ms`);

        // Show success message and stay on form
        setSuccessMessage('✅ Banca actualizada exitosamente');

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('[ERROR] Error updating betting pool:', error);
      const endTime = performance.now();
      const saveTime = (endTime - startTime).toFixed(2);
      console.log(`[ERROR] Save operation failed after ${saveTime}ms`);

      const errorMessage = handleBettingPoolError(error, 'update betting pool');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔥 NEW: Save prize config for a single draw only (for ACTUALIZAR button)
   * @param {string} drawId - The draw ID (e.g., "general" or "draw_43")
   */
  const savePrizeConfigForSingleDraw = async (drawId: string): Promise<SavePrizeResult> => {
    console.log(`[SAVE] [SINGLE DRAW SAVE] Saving prize config for draw: ${drawId}`);

    try {
      // Filter formData to only include fields for this specific draw
      const filteredFormData: Record<string, string | number | boolean | number[] | AutoExpense[] | null> = {};
      const prefix = drawId === 'general' ? 'general_' : `${drawId}_`;

      Object.keys(formData).forEach(key => {
        if (key.startsWith(prefix)) {
          filteredFormData[key] = formData[key as keyof FormData];
        }
      });

      console.log(`[SAVE] [SINGLE DRAW SAVE] Found ${Object.keys(filteredFormData).length} fields for ${drawId}`);

      // Call the existing savePrizeConfigurations function
      // but with filtered data containing only this draw's fields
      const result = await savePrizeConfigurations(id, filteredFormData, initialFormData);

      if (result.success) {
        console.log(`[SUCCESS] [SINGLE DRAW SAVE] Successfully saved config for ${drawId}`);
      }

      return result;
    } catch (error) {
      console.error(`[ERROR] [SINGLE DRAW SAVE] Error saving config for ${drawId}:`, error);
      throw error;
    }
  };

  // Clear messages functions for Snackbar
  const clearSuccessMessage = (): void => {
    setSuccessMessage('');
  };

  const clearErrors = (): void => {
    setErrors({});
  };

  return {
    formData,
    loading,
    loadingBasicData, // ⚡ PROGRESSIVE LOADING: Basic data (shows loading screen)
    loadingPrizes, // ⚡ PROGRESSIVE LOADING: Prize data (shows indicator in tabs)
    loadingZones,
    loadingDraws, // ⚡ PERFORMANCE: Draws loading state
    errors,
    successMessage,
    zones,
    draws, // ⚡ PERFORMANCE: Draws for DrawsTab (loaded once)
    prizesDraws, // ⚡ PERFORMANCE: Formatted draws for PrizesTab (loaded once)
    drawValuesCache, // ⚡ PERFORMANCE: Cached draw-specific values by lotteryId
    activeTab,
    handleChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll,
    loadDrawSpecificValues, // 🔥 NEW: Load draw-specific prize values (with caching)
    savePrizeConfigForSingleDraw, // 🔥 NEW: Save prize config for single draw (for ACTUALIZAR button)
    clearSuccessMessage, // 🔔 SNACKBAR: Clear success message
    clearErrors, // 🔔 SNACKBAR: Clear error message
  };
};

export default useEditBettingPoolForm;
