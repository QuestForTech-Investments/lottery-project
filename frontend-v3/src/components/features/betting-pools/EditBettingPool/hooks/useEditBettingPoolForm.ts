/**
 * useEditBettingPoolForm Hook - TypeScript Version
 * Custom hook for managing edit betting pool form with ALL 168 fields
 * Ported from V2 JavaScript to V3 TypeScript
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getBettingPoolById,
  getBettingPoolConfig,
  updateBettingPool,
  updateBettingPoolConfig,
} from '@/services/bettingPoolService'
import { getAllZones } from '@/services/zoneService'
import {
  savePrizeConfig,
  getAllBetTypesWithFields,
  getMergedPrizeData,
  type BetTypeWithFields,
  type PrizeField,
} from '@/services/prizeService'
import {
  saveBettingPoolSchedules,
  transformSchedulesToApiFormat,
  getBettingPoolSchedules,
  transformSchedulesToFormFormat,
  type Schedule,
} from '@/services/scheduleService'
import {
  getBettingPoolDraws,
  saveBettingPoolDraws,
  type BettingPoolDrawDto,
  type CreateBettingPoolDrawDto,
} from '@/services/sortitionService'
import { drawsApi } from '@/services/api/draws'
import logger from '@/utils/logger'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Draw order for consistent sorting across tabs
 */
const DRAW_ORDER = [
  'LA PRIMERA',
  'NEW YORK DAY',
  'NEW YORK NIGHT',
  'FLORIDA AM',
  'FLORIDA PM',
  'GANA MAS',
  'NACIONAL',
  'QUINIELA PALE',
  'REAL',
  'LOTEKA',
  'FL PICK2 AM',
  'FL PICK2 PM',
  'GEORGIA-MID AM',
  'GEORGIA EVENING',
  'GEORGIA NIGHT',
  'NEW JERSEY AM',
  'NEW JERSEY PM',
  'CONNECTICUT AM',
  'CONNECTICUT PM',
  'CALIFORNIA AM',
  'CALIFORNIA PM',
  'CHICAGO AM',
  'CHICAGO PM',
  'PENN MIDDAY',
  'PENN EVENING',
  'INDIANA MIDDAY',
  'INDIANA EVENING',
  'DIARIA 11AM',
  'DIARIA 3PM',
  'DIARIA 9PM',
  'SUPER PALE TARDE',
  'SUPER PALE NOCHE',
  'SUPER PALE NY-FL AM',
  'SUPER PALE NY-FL PM',
  'TEXAS MORNING',
  'TEXAS DAY',
  'TEXAS EVENING',
  'TEXAS NIGHT',
  'VIRGINIA AM',
  'VIRGINIA PM',
  'SOUTH CAROLINA AM',
  'SOUTH CAROLINA PM',
  'MARYLAND MIDDAY',
  'MARYLAND EVENING',
  'MASS AM',
  'MASS PM',
  'LA SUERTE',
  'NORTH CAROLINA AM',
  'NORTH CAROLINA PM',
  'LOTEDOM',
  'NY AM 6x1',
  'NY PM 6x1',
  'FL AM 6X1',
  'FL PM 6X1',
  'King Lottery AM',
  'King Lottery PM',
  'L.E. PUERTO RICO 2PM',
  'L.E. PUERTO RICO 10PM',
  'DELAWARE AM',
  'DELAWARE PM',
  'Anguila 1pm',
  'Anguila 6PM',
  'Anguila 9pm',
  'Anguila 10am',
  'LA CHICA',
  'LA PRIMERA 8PM',
  'PANAMA MIERCOLES',
  'PANAMA DOMINGO',
  'LA SUERTE 6:00pm',
]

// ============================================================================
// TYPES
// ============================================================================

interface FormData {
  // General
  bettingPoolName: string
  branchCode: string
  username: string
  location: string
  password: string
  reference: string
  confirmPassword: string
  comment: string

  // Configuration
  selectedZone: string
  fallType: string
  deactivationBalance: string
  dailySaleLimit: string
  todayBalanceLimit: string
  enableTemporaryBalance: boolean
  temporaryAdditionalBalance: string
  isActive: boolean
  winningTicketsControl: boolean
  allowPassPot: boolean
  printTickets: boolean
  printTicketCopy: boolean
  smsOnly: boolean
  minutesToCancelTicket: string
  ticketsToCancelPerDay: string
  enableRecharges: boolean
  printRechargeReceipt: boolean
  allowPasswordChange: boolean
  printerType: string
  discountProvider: string
  discountMode: string
  maximumCancelTicketAmount: string
  maxTicketAmount: string
  dailyPhoneRechargeLimit: string
  limitPreference: string | null
  creditLimit?: string
  dailyBalanceLimit?: string
  controlWinningTickets?: boolean
  allowJackpot?: boolean
  printEnabled?: boolean

  // Pies de página
  autoFooter: boolean
  footerText1: string
  footerText2: string
  footerText3: string
  footerText4: string
  showBranchInfo: boolean
  showDateTime: boolean

  // Premios & Comisiones - Pick 3
  pick3FirstPayment: string
  pick3SecondPayment: string
  pick3ThirdPayment: string
  pick3Doubles: string

  // Pick 3 Super
  pick3SuperAllSequence: string
  pick3SuperFirstPayment: string
  pick3SuperSecondPayment: string
  pick3SuperThirdPayment: string

  // Pick 4
  pick4FirstPayment: string
  pick4SecondPayment: string

  // Pick 4 Super
  pick4SuperAllSequence: string
  pick4SuperDoubles: string

  // Pick 3 NY
  pick3NY_3Way2Identical: string
  pick3NY_6Way3Unique: string

  // Pick 4 NY
  pick4NY_AllSequence: string
  pick4NY_Doubles: string

  // Pick 4 Extra
  pick4_24Way4Unique: string
  pick4_12Way2Identical: string
  pick4_6Way2Identical: string
  pick4_4Way3Identical: string

  // Pick 5 Mega
  pick5MegaFirstPayment: string

  // Pick 5 NY
  pick5NYFirstPayment: string

  // Pick 5 Bronx
  pick5BronxFirstPayment: string

  // Pick 5 Brooklyn
  pick5BrooklynFirstPayment: string

  // Pick 5 Queens
  pick5QueensFirstPayment: string

  // Pick 5 Extra
  pick5FirstPayment: string

  // Pick 5 Super
  pick5SuperAllSequence: string
  pick5SuperDoubles: string

  // Pick 5 Super Extra
  pick5Super_5Way4Identical: string
  pick5Super_10Way3Identical: string
  pick5Super_20Way3Identical: string
  pick5Super_30Way2Identical: string
  pick5Super_60Way2Identical: string
  pick5Super_120Way5Unique: string

  // Pick 6 Miami
  pick6MiamiFirstPayment: string
  pick6MiamiDoubles: string

  // Pick 6 California
  pick6CaliforniaAllSequence: string
  pick6CaliforniaTriples: string

  // Pick 6 New York
  pick6NY_3Way2Identical: string
  pick6NY_6Way3Unique: string

  // Pick 6 Extra
  pick6AllSequence: string
  pick6Triples: string

  // Pick 6 California Extra
  pick6Cali_3Way2Identical: string
  pick6Cali_6Way3Unique: string

  // Lotto Classic
  lottoClassicFirstPayment: string
  lottoClassicDoubles: string

  // Lotto Plus
  lottoPlusFirstPayment: string
  lottoPlusDoubles: string

  // Mega Millions
  megaMillionsFirstPayment: string
  megaMillionsDoubles: string

  // Powerball
  powerball4NumbersFirstRound: string
  powerball3NumbersFirstRound: string
  powerball2NumbersFirstRound: string
  powerballLastNumberFirstRound: string
  powerball4NumbersSecondRound: string
  powerball3NumbersSecondRound: string
  powerballLast2NumbersSecondRound: string
  powerballLastNumberSecondRound: string
  powerball4NumbersThirdRound: string
  powerball3NumbersThirdRound: string
  powerballLast2NumbersThirdRound: string
  powerballLastNumberThirdRound: string

  // Horarios de sorteos
  domingoInicio: string
  domingoFin: string
  lunesInicio: string
  lunesFin: string
  martesInicio: string
  martesFin: string
  miercolesInicio: string
  miercolesFin: string
  juevesInicio: string
  juevesFin: string
  viernesInicio: string
  viernesFin: string
  sabadoInicio: string
  sabadoFin: string

  // Sorteos
  selectedDraws: number[]
  anticipatedClosing: string
  anticipatedClosingDraws: number[]

  // Estilos
  sellScreenStyles: string
  ticketPrintStyles: string

  // Gastos automáticos
  autoExpenses: any[]

  // Dynamic prize fields (added at runtime)
  [key: string]: any
}

interface Errors {
  [key: string]: string | undefined
}

interface Zone {
  zoneId: number
  zoneName: string
  isActive: boolean
}

interface Draw {
  drawId: number
  drawName: string
  lotteryId: number
  drawTime?: string
}

interface PrizesDrawItem {
  id: string
  name: string
  drawId?: number
}

interface DrawValuesCache {
  [lotteryId: number]: Record<string, number>
}

interface PrizeConfigPayload {
  prizeTypeId: number
  fieldCode: string
  value: number
}

interface SavePrizeConfigsResult {
  success: boolean
  message?: string
  skipped?: boolean
  total?: number
  successful?: number
  failed?: number
  results?: any[]
  error?: string
}

// ============================================================================
// HOOK
// ============================================================================

export const useEditBettingPoolForm = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

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
    fallType: '1',
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
    printerType: '1',
    discountProvider: '2',
    discountMode: '1',
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
    autoExpenses: [],
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [loadingBasicData, setLoadingBasicData] = useState(true) // Progressive loading: Basic data
  const [loadingPrizes, setLoadingPrizes] = useState(false) // Progressive loading: Prize data
  const [loadingZones, setLoadingZones] = useState(true)
  const [loadingDraws, setLoadingDraws] = useState(true)
  const [errors, setErrors] = useState<Errors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [zones, setZones] = useState<Zone[]>([])
  const [draws, setDraws] = useState<Draw[]>([]) // Performance: Load once, share between tabs
  const [prizesDraws, setPrizesDraws] = useState<PrizesDrawItem[]>([]) // Formatted draws for PrizesTab
  const [drawValuesCache, setDrawValuesCache] = useState<DrawValuesCache>({}) // Performance: Cache draw-specific values
  const [activeTab, setActiveTab] = useState(0)

  // Dirty tracking: Store initial values to detect changes
  const [initialFormData, setInitialFormData] = useState<FormData | null>(null)

  /**
   * Load initial data (zones and bettingPool data)
   */
  useEffect(() => {
    logger.debug('useEditBettingPoolForm', 'useEffect running', { id })
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  /**
   * Helper function to map backend config data to frontend form fields
   * Maps the data from GET /api/betting-pools/{id}/config to form structure
   */
  const mapConfigToFormData = (configResponse: any): Partial<FormData> => {
    if (
      !configResponse ||
      (!configResponse.config && !configResponse.discountConfig && !configResponse.printConfig)
    ) {
      return {}
    }

    const config = configResponse.config || {}
    const discountConfig = configResponse.discountConfig || {}
    const printConfig = configResponse.printConfig || {}
    const footer = configResponse.footer || {}

    // Reverse mapping for enums (backend → frontend select values)
    const fallTypeReverseMap: Record<string, string> = {
      OFF: '1',
      COLLECTION: '2',
      DAILY: '3',
      MONTHLY: '4',
      WEEKLY: '5',
    }
    const printModeReverseMap: Record<string, string> = { DRIVER: '1', GENERIC: '2' }
    const discountProviderReverseMap: Record<string, string> = { GROUP: '1', SELLER: '2' }
    const discountModeReverseMap: Record<string, string> = { OFF: '1', CASH: '2', FREE_TICKET: '3' }

    return {
      // Config fields
      fallType: fallTypeReverseMap[config.fallType] || '1',
      deactivationBalance: config.deactivationBalance || '',
      dailySaleLimit: config.dailySaleLimit || '',
      dailyBalanceLimit: config.dailyBalanceLimit || '',
      temporaryAdditionalBalance: config.temporaryAdditionalBalance || '',
      enableTemporaryBalance: config.enableTemporaryBalance || false,
      creditLimit: config.creditLimit || '',
      controlWinningTickets: config.controlWinningTickets || false,
      allowJackpot: config.allowJackpot !== undefined ? config.allowJackpot : true,
      enableRecharges: config.enableRecharges !== undefined ? config.enableRecharges : true,
      allowPasswordChange:
        config.allowPasswordChange !== undefined ? config.allowPasswordChange : true,
      minutesToCancelTicket: config.cancelMinutes || 30,
      ticketsToCancelPerDay: config.dailyCancelTickets || '',
      maximumCancelTicketAmount: config.maxCancelAmount || '',
      maxTicketAmount: config.maxTicketAmount || '',
      dailyPhoneRechargeLimit: config.maxDailyRecharge || '',

      // Discount config fields
      discountProvider: discountProviderReverseMap[discountConfig.discountProvider] || '1',
      discountMode: discountModeReverseMap[discountConfig.discountMode] || '1',

      // Print config fields
      printerType: printModeReverseMap[printConfig.printMode] || '1',
      printEnabled: printConfig.printEnabled !== undefined ? printConfig.printEnabled : true,
      printTicketCopy:
        printConfig.printTicketCopy !== undefined ? printConfig.printTicketCopy : true,
      printRechargeReceipt:
        printConfig.printRechargeReceipt !== undefined ? printConfig.printRechargeReceipt : true,
      smsOnly: printConfig.smsOnly || false,

      // Footer fields - Map API footerLine* to form footerText*
      autoFooter: footer.autoFooter || false,
      footerText1: footer.footerLine1 || '',
      footerText2: footer.footerLine2 || '',
      footerText3: footer.footerLine3 || '',
      footerText4: footer.footerLine4 || '',
      showBranchInfo: footer.showBranchInfo !== undefined ? footer.showBranchInfo : true,
      showDateTime: footer.showDateTime !== undefined ? footer.showDateTime : true,
    }
  }

  /**
   * Load zones and bettingPool data
   * Progressive loading: Two-phase approach
   * Phase 1: Load basic data (zones + betting pool) - FAST, show form immediately
   * Phase 2: Load prizes in background - SLOW, show loading indicators in tabs
   */
  const loadInitialData = async () => {
    logger.info('useEditBettingPoolForm', 'loadInitialData() called', { id })
    const startTime = performance.now()
    logger.debug('useEditBettingPoolForm', 'PHASE 1: Loading basic data...')

    try {
      setLoadingZones(true)
      setLoadingBasicData(true)

      if (id) {
        // Phase 1: Load zones, basic betting pool data, and configuration (FAST)
        logger.debug('useEditBettingPoolForm', 'Loading zones, betting pool, and configuration in parallel')

        // Performance: Parallelize all API calls (including draws for tabs)
        const apiStartTime = performance.now()
        logger.debug('useEditBettingPoolForm', 'Starting parallel API calls', { time: apiStartTime })

        const [
          zonesResponse,
          bettingPoolResponse,
          configResponse,
          schedulesResponse,
          drawsResponse,
          allDrawsResponse,
        ] = await Promise.all([
          getAllZones(),
          getBettingPoolById(parseInt(id)),
          getBettingPoolConfig(parseInt(id)),
          getBettingPoolSchedules(parseInt(id)),
          getBettingPoolDraws(parseInt(id)), // Returns betting pool draws config
          drawsApi.getAll(), // Load all draws once for both DrawsTab and PrizesTab
        ])

        const apiEndTime = performance.now()
        const apiDuration = apiEndTime - apiStartTime
        logger.info('useEditBettingPoolForm', 'All 6 parallel API calls completed', { duration: apiDuration })

        // Start processing data
        const processingStartTime = performance.now()
        logger.debug('useEditBettingPoolForm', 'Starting data processing')

        // Process zones
        if (zonesResponse.success && zonesResponse.data) {
          setZones(zonesResponse.data)
          logger.info('useEditBettingPoolForm', 'Loaded zones', { count: zonesResponse.data.length })
        }
        setLoadingZones(false)

        // Process all draws (for DrawsTab and PrizesTab)
        if (allDrawsResponse && Array.isArray(allDrawsResponse)) {
          // Sort draws according to DRAW_ORDER (for DrawsTab)
          const sortedDraws = allDrawsResponse.sort((a: Draw, b: Draw) => {
            const indexA = DRAW_ORDER.indexOf(a.drawName)
            const indexB = DRAW_ORDER.indexOf(b.drawName)
            if (indexA === -1 && indexB === -1) return 0
            if (indexA === -1) return 1
            if (indexB === -1) return -1
            return indexA - indexB
          })
          setDraws(sortedDraws)

          logger.debug('useEditBettingPoolForm', 'First 3 all draws structure', {
            draws: sortedDraws.slice(0, 3).map((d: Draw) => ({
              drawId: d.drawId,
              lotteryId: d.lotteryId,
              drawName: d.drawName,
            })),
          })

          // Format draws for PrizesTab (with 'General' tab)
          const formattedForPrizes: PrizesDrawItem[] = sortedDraws.map((draw: Draw) => ({
            id: `draw_${draw.drawId}`,
            name: draw.drawName,
            drawId: draw.drawId,
          }))
          setPrizesDraws([
            { id: 'general', name: 'General' }, // Always include "General" first
            ...formattedForPrizes,
          ])

          logger.info('useEditBettingPoolForm', 'Loaded draws for tabs', { count: sortedDraws.length })
        }
        setLoadingDraws(false)

        // Process betting pool basic data
        if (bettingPoolResponse.success && bettingPoolResponse.data) {
          const branch = bettingPoolResponse.data
          logger.info('useEditBettingPoolForm', 'Loaded betting pool data')

          // Optimization: Update form with basic data first
          const basicFormData: Partial<FormData> = {
            bettingPoolName: branch.bettingPoolName || '',
            branchCode: branch.bettingPoolCode || branch.branchCode || '',
            username: branch.username || '',
            location: branch.location || '',
            reference: branch.reference || '',
            comment: branch.comment || '',
            selectedZone: branch.zoneId || '',
            isActive: branch.isActive !== undefined ? branch.isActive : true,
          }

          // Map configuration data from API response to form fields
          let configFormData: Partial<FormData> = {}
          if (configResponse && configResponse.success && configResponse.data) {
            configFormData = mapConfigToFormData(configResponse.data)
            logger.info('useEditBettingPoolForm', 'Loaded configuration data')
          }

          // Process schedules data (now loaded in parallel)
          let scheduleFormData: Partial<FormData> = {}
          try {
            if (
              schedulesResponse.success &&
              schedulesResponse.data &&
              schedulesResponse.data.length > 0
            ) {
              scheduleFormData = transformSchedulesToFormFormat(schedulesResponse.data)
              logger.info('useEditBettingPoolForm', 'Loaded schedule data for all 7 days')
            }
          } catch (scheduleError) {
            logger.error('useEditBettingPoolForm', 'Error processing schedules', scheduleError)
            // Don't fail the whole form if schedules fail to load
          }

          // Process draws data (NEW API format)
          logger.debug('useEditBettingPoolForm', 'Processing draws data')
          logger.debug('useEditBettingPoolForm', 'drawsResponse from /betting-pools/draws', {
            data: drawsResponse.data,
          })
          let drawsFormData: Partial<FormData> = {
            selectedDraws: [],
            anticipatedClosing: '',
            anticipatedClosingDraws: [],
          }
          try {
            if (drawsResponse.success && drawsResponse.data && drawsResponse.data.length > 0) {
              // NEW API: Response already contains drawId directly! No mapping needed!
              // Format: { bettingPoolDrawId, drawId, drawName, lotteryId, isActive, anticipatedClosingMinutes, ... }

              // Extract enabled draws (active draws)
              const enabledDraws = drawsResponse.data.filter((d: BettingPoolDrawDto) => d.isActive)
              const enabledDrawIds = enabledDraws.map((d: BettingPoolDrawDto) => d.drawId)

              logger.debug('useEditBettingPoolForm', 'enabledDrawIds (from /draws API)', {
                drawIds: enabledDrawIds,
              })
              logger.debug('useEditBettingPoolForm', 'enabledDraws', {
                draws: enabledDraws.map((d: BettingPoolDrawDto) => ({
                  drawId: d.drawId,
                  drawName: d.drawName,
                  lotteryId: d.lotteryId,
                })),
              })

              // Extract draws with anticipated closing
              const drawsWithClosing = drawsResponse.data.filter(
                (d: BettingPoolDrawDto) =>
                  d.anticipatedClosingMinutes != null && d.anticipatedClosingMinutes > 0
              )

              const drawIdsWithClosing = drawsWithClosing.map((d: BettingPoolDrawDto) => d.drawId)

              // Use the first value found (or empty if none) - convert to String
              const anticipatedClosing =
                drawsWithClosing.length > 0
                  ? String(drawsWithClosing[0].anticipatedClosingMinutes)
                  : ''

              drawsFormData = {
                selectedDraws: enabledDrawIds,
                anticipatedClosing: anticipatedClosing,
                anticipatedClosingDraws: drawIdsWithClosing,
              }

              logger.debug('useEditBettingPoolForm', 'drawsFormData', { drawsFormData })
              logger.info('useEditBettingPoolForm', 'Loaded selected draws', {
                selectedCount: drawsFormData.selectedDraws?.length || 0,
                anticipatedCount: drawsFormData.anticipatedClosingDraws?.length || 0,
              })
            } else {
              logger.warn('useEditBettingPoolForm', 'No draws data found or empty array')
            }
          } catch (drawsError) {
            logger.error('useEditBettingPoolForm', 'Error processing draws', drawsError)
            // Don't fail the whole form if draws fail to load
          }

          // Merge basic data + configuration data + schedule data + draws data
          const completeFormData: FormData = {
            ...formData,
            ...basicFormData,
            ...configFormData,
            ...scheduleFormData,
            ...drawsFormData,
          } as FormData

          setFormData(completeFormData)

          // Dirty tracking: Save initial state for comparison
          setInitialFormData(completeFormData)

          const processingEndTime = performance.now()
          const processingDuration = processingEndTime - processingStartTime
          logger.debug('useEditBettingPoolForm', 'Data processing completed', {
            duration: processingDuration,
          })

          const phase1Time = (performance.now() - startTime).toFixed(2)
          logger.info('useEditBettingPoolForm', 'PHASE 1 completed', {
            totalTime: phase1Time,
            apiTime: apiDuration.toFixed(2),
            processingTime: processingDuration.toFixed(2),
          })

          // Unlock UI: User can now see and interact with the form
          setLoadingBasicData(false)

          // Phase 2: Load prizes in background (SLOW, doesn't block UI)
          logger.debug('useEditBettingPoolForm', 'PHASE 2: Loading prize data in background')
          setLoadingPrizes(true)

          loadPrizeValues(parseInt(id))
            .then((prizeValues) => {
              if (Object.keys(prizeValues).length > 0) {
                logger.info('useEditBettingPoolForm', 'Loaded prize values', {
                  count: Object.keys(prizeValues).length,
                })

                setFormData((prev) => ({
                  ...prev,
                  ...prizeValues,
                }))

                // Update initial form data with prizes
                setInitialFormData((prev) => ({
                  ...prev!,
                  ...prizeValues,
                }))
              }

              const phase2Time = (performance.now() - startTime).toFixed(2)
              logger.info('useEditBettingPoolForm', 'PHASE 2 completed', { time: phase2Time })
            })
            .catch((error) => {
              logger.error('useEditBettingPoolForm', 'Error loading prize values', error)
              // Don't fail the whole form if prizes fail to load
            })
            .finally(() => {
              setLoadingPrizes(false)
              const totalTime = (performance.now() - startTime).toFixed(2)
              logger.info('useEditBettingPoolForm', 'All data loaded successfully', {
                totalTime,
              })
            })
        }
      } else {
        // No ID provided, only load zones
        const zonesResponse = await getAllZones()
        if (zonesResponse.success && zonesResponse.data) {
          setZones(zonesResponse.data)
        }
        setLoadingZones(false)
        setLoadingBasicData(false)
      }
    } catch (error) {
      logger.error('useEditBettingPoolForm', 'Error loading initial data', error)
      setErrors({ submit: 'Error cargando datos del betting pool' })
      setLoadingBasicData(false)
    }
  }

  /**
   * Handle form field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : value === '' && name === 'limitPreference' ? null : value,
    }))
  }

  /**
   * Handle tab change
   */
  const handleTabChange = (_event: any, newValue: number) => {
    setActiveTab(newValue)
  }

  /**
   * Copy schedule to all days
   */
  const copyScheduleToAll = (day: string) => {
    const inicioKey = `${day}Inicio` as keyof FormData
    const finKey = `${day}Fin` as keyof FormData
    const inicio = formData[inicioKey] as string
    const fin = formData[finKey] as string

    setFormData((prev) => ({
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
    }))
  }

  /**
   * Save prize configurations for a betting pool
   * Supports both general configs and lottery-specific configs
   */
  const savePrizeConfigurations = async (
    bettingPoolId: number,
    formDataToSave: FormData,
    initialFormData: FormData | null = null
  ): Promise<SavePrizeConfigsResult> => {
    const startTime = performance.now()
    logger.info('useEditBettingPoolForm', 'Building prize configurations to save')

    try {
      // Get all bet types to build fieldCode → prizeTypeId map
      const betTypes = await getAllBetTypesWithFields()

      // Build a map: fieldCode → prizeTypeId
      const fieldCodeToId: Record<string, number> = {}
      betTypes.forEach((betType: BetTypeWithFields) => {
        if (betType.prizeFields) {
          betType.prizeFields.forEach((field: PrizeField) => {
            fieldCodeToId[field.fieldCode] = field.prizeTypeId
          })
        }
      })

      logger.info('useEditBettingPoolForm', 'Built fieldCode map', {
        count: Object.keys(fieldCodeToId).length,
      })

      // Group configs by lottery (general vs lottery_XX)
      const configsByLottery: Record<string, PrizeConfigPayload[]> = {}
      const prizeFieldSet = new Set(Object.keys(fieldCodeToId))

      // Optimized: More efficient filtering + DIRTY TRACKING
      logger.debug('useEditBettingPoolForm', 'Starting prize change detection', {
        hasInitialFormData: !!initialFormData,
        formDataKeysCount: Object.keys(formDataToSave).length,
      })

      let debugCount = 0
      Object.keys(formDataToSave).forEach((key) => {
        // Skip non-prize type fields
        if (
          !key.includes('_') ||
          formDataToSave[key] === '' ||
          formDataToSave[key] === null ||
          formDataToSave[key] === undefined
        ) {
          return
        }

        // Prize type fields have format:
        //   - V1: BETTYPE_FIELDCODE (e.g., "DIRECTO_DIRECTO_PRIMER_PAGO")
        //   - V2: {lotteryId}_{betTypeCode}_{fieldCode} (e.g., "general_DIRECTO_DIRECTO_PRIMER_PAGO")

        let cleanKey = key
        let lotteryId: string | null = null

        // Fix: Remove lottery prefix if present
        const parts = key.split('_')

        // Check for "general_" prefix
        if (parts[0] === 'general' && parts.length >= 4) {
          lotteryId = 'general'
          cleanKey = parts.slice(1).join('_') // Remove "general_"
        }
        // Check for "lottery_XX_" prefix
        else if (parts[0] === 'lottery' && parts.length >= 5) {
          lotteryId = `${parts[0]}_${parts[1]}` // "lottery_43"
          cleanKey = parts.slice(2).join('_') // Remove "lottery_XX_"
        }
        // V1 format without prefix - treat as general
        else if (parts.length >= 3) {
          lotteryId = 'general'
          cleanKey = key
        }

        // Now extract betTypeCode and fieldCode from cleanKey
        const cleanParts = cleanKey.split('_')
        if (cleanParts.length >= 3) {
          const betTypeCode = cleanParts[0] // "DIRECTO"
          const fieldCode = cleanParts.slice(1).join('_') // "DIRECTO_PRIMER_PAGO"

          // Check if this fieldCode exists in our bet types
          if (prizeFieldSet.has(fieldCode)) {
            const prizeTypeId = fieldCodeToId[fieldCode]
            const currentValue = parseFloat(formDataToSave[key])
            const initialValue = initialFormData?.[key]
            const initialValueParsed = parseFloat(initialValue as string)

            // Debug first 3 fields
            if (debugCount < 3 && key.startsWith('general_')) {
              logger.debug('useEditBettingPoolForm', `Prize field #${debugCount + 1}`, {
                field: key,
                currentValueRaw: formDataToSave[key],
                currentValue,
                initialValueRaw: initialValue,
                initialValueParsed,
                areEqual: initialValueParsed === currentValue,
              })
              debugCount++
            }

            // Dirty tracking: Only include if value changed
            const hasChanged =
              !initialFormData ||
              !initialFormData[key] ||
              parseFloat(initialFormData[key] as string) !== currentValue

            if (hasChanged && lotteryId) {
              if (!configsByLottery[lotteryId]) {
                configsByLottery[lotteryId] = []
              }

              configsByLottery[lotteryId].push({
                prizeTypeId: prizeTypeId,
                fieldCode: fieldCode,
                value: currentValue,
              })
              logger.debug('useEditBettingPoolForm', 'Prize value changed', {
                lottery: lotteryId,
                key,
                fieldCode,
                newValue: formDataToSave[key],
                oldValue: initialFormData?.[key] || 'N/A',
              })
            }
          }
        }
      })

      if (Object.keys(configsByLottery).length === 0) {
        logger.info('useEditBettingPoolForm', 'No prize values changed - skipping save')
        return { success: true, message: 'No changes', skipped: true }
      }

      logger.info('useEditBettingPoolForm', 'Saving prize configurations', {
        lotteryGroupsCount: Object.keys(configsByLottery).length,
      })

      // Save each lottery's configs
      const savePromises: Promise<any>[] = []
      let totalSaved = 0
      let totalFailed = 0

      for (const [lotteryId, prizeConfigs] of Object.entries(configsByLottery)) {
        if (lotteryId === 'general') {
          // Save general configs
          logger.debug('useEditBettingPoolForm', 'Saving general prize configs', {
            count: prizeConfigs.length,
          })
          savePromises.push(
            savePrizeConfig(bettingPoolId, { prizeConfigs } as any)
              .then((response) => {
                logger.info('useEditBettingPoolForm', 'General configs saved successfully')
                totalSaved += prizeConfigs.length
                return { success: true, lottery: 'general', count: prizeConfigs.length }
              })
              .catch((error) => {
                logger.error('useEditBettingPoolForm', 'Error saving general configs', error)
                totalFailed += prizeConfigs.length
                return {
                  success: false,
                  lottery: 'general',
                  error: (error as Error).message,
                }
              })
          )
        } else {
          // Extract lotteryId number from "lottery_43"
          const lotteryIdNum = parseInt(lotteryId.split('_')[1])

          logger.debug('useEditBettingPoolForm', 'Saving lottery-specific prize configs', {
            lotteryId: lotteryIdNum,
            count: prizeConfigs.length,
          })

          // For lottery-specific: Get first draw ID, then save
          savePromises.push(
            fetch(`/api/draws/lottery/${lotteryIdNum}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
              },
            })
              .then((res) => res.json())
              .then((draws) => {
                if (!draws || draws.length === 0) {
                  throw new Error(`No draws found for lottery ${lotteryIdNum}`)
                }

                // Use first draw
                const firstDraw = draws[0]
                const drawId = firstDraw.drawId

                logger.debug('useEditBettingPoolForm', 'Using draw for lottery', {
                  drawId,
                  drawName: firstDraw.drawName || 'N/A',
                  lotteryId: lotteryIdNum,
                })

                // Save to draw-specific endpoint
                return fetch(
                  `/api/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prizeConfigs }),
                  }
                )
              })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`)
                }
                return response.json()
              })
              .then((response) => {
                logger.info('useEditBettingPoolForm', 'Lottery configs saved successfully', {
                  lotteryId: lotteryIdNum,
                })
                totalSaved += prizeConfigs.length
                return { success: true, lottery: lotteryId, count: prizeConfigs.length }
              })
              .catch((error) => {
                logger.error('useEditBettingPoolForm', 'Error saving lottery configs', {
                  lotteryId: lotteryIdNum,
                  error,
                })
                totalFailed += prizeConfigs.length
                return {
                  success: false,
                  lottery: lotteryId,
                  error: (error as Error).message,
                }
              })
          )
        }
      }

      // Wait for all saves to complete
      const results = await Promise.all(savePromises)

      const endTime = performance.now()
      const saveTime = (endTime - startTime).toFixed(2)

      if (totalFailed === 0) {
        logger.info('useEditBettingPoolForm', 'All prize configurations saved successfully', {
          time: saveTime,
        })
      } else {
        logger.warn(
          'useEditBettingPoolForm',
          'Prize configurations partially saved',
          {
            succeeded: totalSaved,
            failed: totalFailed,
          }
        )
      }

      return {
        success: totalFailed === 0,
        total: totalSaved + totalFailed,
        successful: totalSaved,
        failed: totalFailed,
        results,
      }
    } catch (error) {
      const endTime = performance.now()
      const saveTime = (endTime - startTime).toFixed(2)
      logger.error('useEditBettingPoolForm', 'Error saving prize configurations', {
        time: saveTime,
        error,
      })
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * Load prize values for the betting pool
   * Merges default values from bet types with custom values from banca_prize_configs
   */
  const loadPrizeValues = async (bettingPoolId: number): Promise<Record<string, any>> => {
    try {
      logger.info('useEditBettingPoolForm', 'Loading prize values', { bettingPoolId })

      // Get merged prize data (defaults + custom values)
      const prizeData = await getMergedPrizeData(bettingPoolId)

      if (!prizeData || !prizeData.betTypes) {
        logger.info('useEditBettingPoolForm', 'No prize data available')
        return {}
      }

      // Build formData object from prize data
      const prizeFormData: Record<string, any> = {}

      // Process each bet type
      prizeData.betTypes.forEach((betType: BetTypeWithFields) => {
        if (!betType.prizeFields || betType.prizeFields.length === 0) {
          return
        }

        // Process each prize type field
        betType.prizeFields.forEach((field: PrizeField) => {
          // Use "general_" prefix to match PrizesTab format
          const fieldKey = `general_${betType.betTypeCode}_${field.fieldCode}`
          const customKey = `${betType.betTypeCode}_${field.fieldCode}`

          // Start with default value from the field
          let value: any = field.defaultMultiplier || ''

          // Override with custom value if it exists
          if (prizeData.customMap && prizeData.customMap[customKey] !== undefined) {
            value = prizeData.customMap[customKey]
            logger.debug('useEditBettingPoolForm', 'Found custom prize value', {
              field: fieldKey,
              value,
              default: field.defaultMultiplier,
            })
          } else {
            logger.debug('useEditBettingPoolForm', 'Using default prize value', {
              field: fieldKey,
              value,
            })
          }

          // Store in formData format with "general_" prefix
          prizeFormData[fieldKey] = value
        })
      })

      logger.info('useEditBettingPoolForm', 'Loaded prize type values', {
        count: Object.keys(prizeFormData).length,
      })
      return prizeFormData
    } catch (error) {
      logger.error('useEditBettingPoolForm', 'Error loading prize values', error)
      return {}
    }
  }

  /**
   * Load draw-specific prize values with caching
   * Performance: Caches loaded values to avoid duplicate API calls
   */
  const loadDrawSpecificValues = async (
    lotteryId: number,
    bettingPoolId: number
  ): Promise<Record<string, any>> => {
    try {
      // Performance: Check cache first
      if (drawValuesCache[lotteryId]) {
        logger.info('useEditBettingPoolForm', 'Using cached values for lottery', {
          lotteryId,
        })
        return drawValuesCache[lotteryId]
      }

      logger.info('useEditBettingPoolForm', 'Loading draw-specific values', { lotteryId })

      // Step 1: Get all draws for this lottery
      const response = await fetch(`/api/draws/lottery/${lotteryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        logger.warn('useEditBettingPoolForm', 'No draws found for lottery', {
          lotteryId,
          status: response.status,
        })
        return {}
      }

      const draws = await response.json()
      if (!draws || draws.length === 0) {
        logger.info('useEditBettingPoolForm', 'No draws available for lottery', { lotteryId })
        return {}
      }

      // Step 2: Use first draw to get prize config
      const firstDraw = draws[0]
      const drawId = firstDraw.drawId
      logger.debug('useEditBettingPoolForm', 'Using draw', {
        drawId,
        drawName: firstDraw.drawName || 'N/A',
      })

      // Step 3: Get prize config for this draw
      const configResponse = await fetch(
        `/api/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!configResponse.ok) {
        logger.info('useEditBettingPoolForm', 'No custom prize config found for draw', {
          drawId,
        })
        return {}
      }

      const configs = await configResponse.json()
      logger.debug('useEditBettingPoolForm', 'Raw API response', { configs })

      if (!configs || configs.length === 0) {
        logger.info('useEditBettingPoolForm', 'No custom values for lottery', { lotteryId })
        return {}
      }

      // Step 4: Build formData with lottery_XX_ prefix
      const lotteryFormData: Record<string, any> = {}
      configs.forEach((config: any) => {
        // Extract betTypeCode from fieldCode (first part)
        const parts = config.fieldCode.split('_')
        const betTypeCode = parts[0]

        // Build key: lottery_43_DIRECTO_DIRECTO_PRIMER_PAGO
        const fieldKey = `lottery_${lotteryId}_${betTypeCode}_${config.fieldCode}`
        // Fix: API returns 'customValue', not 'value'
        lotteryFormData[fieldKey] = config.customValue

        logger.debug('useEditBettingPoolForm', 'Loaded lottery-specific value', {
          field: fieldKey,
          value: config.customValue,
        })
      })

      // Performance: Store in cache for future use
      setDrawValuesCache((prev) => ({
        ...prev,
        [lotteryId]: lotteryFormData,
      }))

      logger.info('useEditBettingPoolForm', 'Loaded lottery-specific values (cached)', {
        count: Object.keys(lotteryFormData).length,
      })
      return lotteryFormData
    } catch (error) {
      logger.error('useEditBettingPoolForm', 'Error loading lottery-specific values', {
        lotteryId,
        error,
      })
      return {}
    }
  }

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Errors = {}

    if (!formData.bettingPoolName.trim()) {
      newErrors.bettingPoolName = 'El nombre del betting pool es requerido'
    }

    if (!formData.branchCode.trim()) {
      newErrors.branchCode = 'El código del betting pool es requerido'
    }

    if (!formData.selectedZone) {
      newErrors.selectedZone = 'Debe seleccionar una zona'
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (formData.password && !formData.username) {
      newErrors.username = 'El usuario es requerido si se proporciona una contraseña'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Check if schedule data has changed
   */
  const hasScheduleDataChanged = (): boolean => {
    if (!initialFormData) return true

    const scheduleFields = [
      'domingoInicio',
      'domingoFin',
      'lunesInicio',
      'lunesFin',
      'martesInicio',
      'martesFin',
      'miercolesInicio',
      'miercolesFin',
      'juevesInicio',
      'juevesFin',
      'viernesInicio',
      'viernesFin',
      'sabadoInicio',
      'sabadoFin',
    ]

    const changedFields = scheduleFields.filter(
      (field) => formData[field as keyof FormData] !== initialFormData[field as keyof FormData]
    )

    if (changedFields.length > 0) {
      logger.debug('useEditBettingPoolForm', 'Schedule changes detected', {
        count: changedFields.length,
        fields: changedFields,
      })
    }

    return changedFields.length > 0
  }

  /**
   * Check if draws data has changed
   */
  const hasDrawsDataChanged = (): boolean => {
    if (!initialFormData) return true

    // Compare selected draws
    const prevLotteries = initialFormData.selectedDraws || []
    const currLotteries = formData.selectedDraws || []

    if (prevLotteries.length !== currLotteries.length) {
      logger.debug('useEditBettingPoolForm', 'Draws changes detected: count changed', {
        from: prevLotteries.length,
        to: currLotteries.length,
      })
      return true
    }

    const prevSet = new Set(prevLotteries)
    const currSet = new Set(currLotteries)
    if (!Array.from(prevSet).every((id) => currSet.has(id))) {
      logger.debug('useEditBettingPoolForm', 'Draws changes detected: selected draws changed')
      return true
    }

    // Compare anticipated closing
    if (formData.anticipatedClosing !== initialFormData.anticipatedClosing) {
      logger.debug('useEditBettingPoolForm', 'Draws changes detected: anticipated closing changed', {
        from: initialFormData.anticipatedClosing,
        to: formData.anticipatedClosing,
      })
      return true
    }

    // Compare anticipated closing lotteries
    const prevClosingLotteries = initialFormData.anticipatedClosingDraws || []
    const currClosingLotteries = formData.anticipatedClosingDraws || []

    if (prevClosingLotteries.length !== currClosingLotteries.length) {
      logger.debug('useEditBettingPoolForm', 'Draws changes detected: anticipated closing draws count changed', {
        from: prevClosingLotteries.length,
        to: currClosingLotteries.length,
      })
      return true
    }

    const prevClosingSet = new Set(prevClosingLotteries)
    const currClosingSet = new Set(currClosingLotteries)
    if (!Array.from(prevClosingSet).every((id) => currClosingSet.has(id))) {
      logger.debug('useEditBettingPoolForm', 'Draws changes detected: anticipated closing draws changed')
      return true
    }

    return false
  }

  /**
   * Handle form submission
   * Uses TWO endpoints - one for basic data, one for config
   * Updates initialFormData after successful save
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!id) {
      logger.error('useEditBettingPoolForm', 'No betting pool ID provided')
      return
    }

    const startTime = performance.now()
    logger.info('useEditBettingPoolForm', 'Starting save operation')

    setLoading(true)
    setErrors({})

    try {
      // Map form values to API format
      const fallTypeMap: Record<string, string> = {
        '1': 'OFF',
        '2': 'COLLECTION',
        '3': 'DAILY',
        '4': 'MONTHLY',
        '5': 'WEEKLY',
      }
      const printModeMap: Record<string, string> = { '1': 'DRIVER', '2': 'GENERIC' }
      const discountProviderMap: Record<string, string> = { '1': 'GROUP', '2': 'SELLER' }
      const discountModeMap: Record<string, string> = {
        '1': 'OFF',
        '2': 'CASH',
        '3': 'FREE_TICKET',
      }

      // 1. Basic data - PUT /api/betting-pools/{id}
      const basicData = {
        bettingPoolName: formData.bettingPoolName,
        location: formData.location || null,
        reference: formData.reference || null,
        comment: formData.comment || null,
        zoneId: parseInt(formData.selectedZone),
        username: formData.username || null,
        password: formData.password || null,
        isActive: formData.isActive,
      }

      // 2. Configuration data - POST /api/betting-pools/{id}/config
      const configData = {
        config: {
          fallType: fallTypeMap[formData.fallType] || 'OFF',
          deactivationBalance: formData.deactivationBalance
            ? parseFloat(formData.deactivationBalance)
            : null,
          dailySaleLimit: formData.dailySaleLimit ? parseFloat(formData.dailySaleLimit) : null,
          dailyBalanceLimit: formData.dailyBalanceLimit
            ? parseFloat(formData.dailyBalanceLimit)
            : null,
          temporaryAdditionalBalance:
            formData.enableTemporaryBalance && formData.temporaryAdditionalBalance
              ? parseFloat(formData.temporaryAdditionalBalance)
              : null,
          enableTemporaryBalance: formData.enableTemporaryBalance || false,
          creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
          controlWinningTickets: formData.controlWinningTickets || false,
          allowJackpot: formData.allowJackpot !== undefined ? formData.allowJackpot : true,
          enableRecharges:
            formData.enableRecharges !== undefined ? formData.enableRecharges : true,
          allowPasswordChange:
            formData.allowPasswordChange !== undefined ? formData.allowPasswordChange : true,
          cancelMinutes: formData.minutesToCancelTicket
            ? parseInt(formData.minutesToCancelTicket)
            : 30,
          dailyCancelTickets: formData.ticketsToCancelPerDay
            ? parseInt(formData.ticketsToCancelPerDay)
            : null,
          maxCancelAmount: formData.maximumCancelTicketAmount
            ? parseFloat(formData.maximumCancelTicketAmount)
            : null,
          maxTicketAmount: formData.maxTicketAmount ? parseFloat(formData.maxTicketAmount) : null,
          maxDailyRecharge: formData.dailyPhoneRechargeLimit
            ? parseFloat(formData.dailyPhoneRechargeLimit)
            : null,
          paymentMode: 'BANCA',
        },
        discountConfig: {
          discountProvider: discountProviderMap[formData.discountProvider] || 'GRUPO',
          discountMode: discountModeMap[formData.discountMode] || 'OFF',
        },
        printConfig: {
          printMode: printModeMap[formData.printerType] || 'DRIVER',
          printEnabled: formData.printEnabled !== undefined ? formData.printEnabled : true,
          printTicketCopy:
            formData.printTicketCopy !== undefined ? formData.printTicketCopy : true,
          printRechargeReceipt:
            formData.printRechargeReceipt !== undefined ? formData.printRechargeReceipt : true,
          smsOnly: formData.smsOnly || false,
        },
        footer: {
          autoFooter: formData.autoFooter || false,
          footerLine1: formData.footerText1 || '',
          footerLine2: formData.footerText2 || '',
          footerLine3: formData.footerText3 || '',
          footerLine4: formData.footerText4 || '',
          showBranchInfo: formData.showBranchInfo !== undefined ? formData.showBranchInfo : true,
          showDateTime: formData.showDateTime !== undefined ? formData.showDateTime : true,
        },
      }

      // 3. Call both endpoints in parallel
      logger.debug('useEditBettingPoolForm', 'Calling 2 endpoints in parallel', {
        basicData,
        configData,
      })

      const [basicResponse, configResponse] = await Promise.all([
        updateBettingPool(parseInt(id), basicData),
        updateBettingPoolConfig(parseInt(id), configData),
      ])

      logger.info('useEditBettingPoolForm', 'Basic data and config responses received', {
        basicResponse,
        configResponse,
      })

      if (basicResponse && configResponse) {
        // 4. Save prize configurations
        logger.info('useEditBettingPoolForm', 'Saving prize configurations')

        try {
          const prizeResult = await savePrizeConfigurations(parseInt(id), formData, initialFormData)

          if (prizeResult.success) {
            if (prizeResult.skipped) {
              logger.info('useEditBettingPoolForm', 'No prize changes to save')
            } else {
              logger.info('useEditBettingPoolForm', 'Prize configurations saved', {
                count: prizeResult.total,
              })
            }
          } else {
            logger.warn('useEditBettingPoolForm', 'Some prize configurations failed to save', {
              failed: prizeResult.failed,
              total: prizeResult.total,
            })
          }
        } catch (prizeError) {
          logger.error('useEditBettingPoolForm', 'Error saving prize configurations', prizeError)
          // Don't fail the whole operation if prizes fail to save
        }

        // 5. Save schedules if changed
        logger.debug('useEditBettingPoolForm', 'Checking schedule changes')
        const scheduleChanged = hasScheduleDataChanged()
        logger.debug('useEditBettingPoolForm', 'Schedule changed', { scheduleChanged })

        if (scheduleChanged) {
          try {
            logger.info('useEditBettingPoolForm', 'Updating schedules')
            const schedules = transformSchedulesToApiFormat(formData)
            logger.debug('useEditBettingPoolForm', 'Transformed schedules', { schedules })
            const scheduleResult = await saveBettingPoolSchedules(parseInt(id), schedules)
            if (scheduleResult.success) {
              logger.info('useEditBettingPoolForm', 'Schedules updated successfully')
            }
          } catch (scheduleError) {
            logger.error('useEditBettingPoolForm', 'Error saving schedules', scheduleError)
            // Don't fail the whole operation if schedules fail to save
          }
        } else {
          logger.info('useEditBettingPoolForm', 'No schedule changes to save')
        }

        // 6. Save draws if changed
        const drawsChanged = hasDrawsDataChanged()
        logger.debug('useEditBettingPoolForm', 'Draws changed', { drawsChanged })

        if (drawsChanged) {
          try {
            logger.info('useEditBettingPoolForm', 'Updating draws')
            logger.debug('useEditBettingPoolForm', 'FormData before saving draws', {
              selectedDraws: formData.selectedDraws,
              anticipatedClosing: formData.anticipatedClosing,
              anticipatedClosingDraws: formData.anticipatedClosingDraws,
            })

            // Build draws array from formData (NEW API format)
            const drawsToSave: CreateBettingPoolDrawDto[] = []

            formData.selectedDraws.forEach((drawId) => {
              const hasAnticipatedClosing = formData.anticipatedClosingDraws?.includes(drawId)
              drawsToSave.push({
                drawId: drawId, // NEW: drawId instead of lotteryId
                isActive: true, // NEW: isActive instead of isEnabled
                anticipatedClosingMinutes: hasAnticipatedClosing
                  ? parseInt(formData.anticipatedClosing) || null
                  : null, // NEW: anticipatedClosingMinutes
                enabledGameTypeIds: [],
              })
            })

            logger.debug('useEditBettingPoolForm', 'Draws payload (NEW format)', {
              payload: drawsToSave,
              count: drawsToSave.length,
            })

            const drawsResult = await saveBettingPoolDraws(parseInt(id), drawsToSave)
            if (drawsResult.success) {
              logger.info('useEditBettingPoolForm', 'Draws updated successfully')
            }
          } catch (drawsError) {
            logger.error('useEditBettingPoolForm', 'Error saving draws', drawsError)
            // Don't fail the whole operation if draws fail to save
          }
        } else {
          logger.info('useEditBettingPoolForm', 'No draw changes to save')
        }

        // 7. Update initialFormData with new values
        setInitialFormData({ ...formData })
        logger.info('useEditBettingPoolForm', 'initialFormData updated with new values')

        const endTime = performance.now()
        const saveTime = (endTime - startTime).toFixed(2)
        logger.info('useEditBettingPoolForm', 'Save operation completed successfully', {
          time: saveTime,
        })

        // Show success message and stay on form
        setSuccessMessage('Banca actualizada exitosamente')

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('')
        }, 5000)
      }
    } catch (error) {
      logger.error('useEditBettingPoolForm', 'Error updating betting pool', error)
      const endTime = performance.now()
      const saveTime = (endTime - startTime).toFixed(2)
      logger.error('useEditBettingPoolForm', 'Save operation failed', { time: saveTime })

      const errorMessage = (error as Error).message || 'Error updating betting pool'
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Save prize config for a single draw only (for ACTUALIZAR button)
   */
  const savePrizeConfigForSingleDraw = async (drawId: string): Promise<SavePrizeConfigsResult> => {
    logger.info('useEditBettingPoolForm', 'Saving prize config for single draw', { drawId })

    if (!id) {
      throw new Error('No betting pool ID provided')
    }

    try {
      // Filter formData to only include fields for this specific draw
      const filteredFormData: Record<string, any> = {}
      const prefix = drawId === 'general' ? 'general_' : `${drawId}_`

      Object.keys(formData).forEach((key) => {
        if (key.startsWith(prefix)) {
          filteredFormData[key] = formData[key]
        }
      })

      logger.debug('useEditBettingPoolForm', 'Found fields for single draw', {
        count: Object.keys(filteredFormData).length,
        drawId,
      })

      // Call the existing savePrizeConfigurations function
      // but with filtered data containing only this draw's fields
      const result = await savePrizeConfigurations(
        parseInt(id),
        filteredFormData as FormData,
        initialFormData
      )

      if (result.success) {
        logger.info('useEditBettingPoolForm', 'Successfully saved config for draw', { drawId })
      }

      return result
    } catch (error) {
      logger.error('useEditBettingPoolForm', 'Error saving config for draw', { drawId, error })
      throw error
    }
  }

  // Clear messages functions for Snackbar
  const clearSuccessMessage = () => {
    setSuccessMessage('')
  }

  const clearErrors = () => {
    setErrors({})
  }

  return {
    formData,
    loading,
    loadingBasicData, // Progressive loading: Basic data (shows loading screen)
    loadingPrizes, // Progressive loading: Prize data (shows indicator in tabs)
    loadingZones,
    loadingDraws, // Performance: Draws loading state
    errors,
    successMessage,
    zones,
    draws, // Performance: Draws for DrawsTab (loaded once)
    prizesDraws, // Performance: Formatted draws for PrizesTab (loaded once)
    drawValuesCache, // Performance: Cached draw-specific values by lotteryId
    activeTab,
    handleChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll,
    loadDrawSpecificValues, // Load draw-specific prize values (with caching)
    savePrizeConfigForSingleDraw, // Save prize config for single draw (for ACTUALIZAR button)
    clearSuccessMessage, // Clear success message
    clearErrors, // Clear error message
  }
}

export default useEditBettingPoolForm
