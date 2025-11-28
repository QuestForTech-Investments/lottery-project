/**
 * Betting Pool Types
 * Complete TypeScript definitions for Betting Pools module
 */

// ============================================================================
// MAIN ENTITIES
// ============================================================================

export interface BettingPool {
  bettingPoolId: number
  bettingPoolCode: string
  bettingPoolName: string
  zoneId: number
  zoneName?: string
  bankId?: number | null
  bankName?: string | null
  address?: string | null
  phone?: string | null
  location?: string | null
  reference?: string | null
  comment?: string | null
  username?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
  deletedAt?: string | null
  createdBy?: number | null
  updatedBy?: number | null
  deletedBy?: number | null
  deletionReason?: string | null
}

export interface BettingPoolConfig {
  configId: number
  bettingPoolId: number
  fallType: 'OFF' | 'PERDIDA' | 'GANANCIA'
  deactivationBalance?: number | null
  dailySaleLimit?: number | null
  dailyBalanceLimit?: number | null
  temporaryAdditionalBalance?: number | null
  enableTemporaryBalance: boolean
  creditLimit: number
  isActive: boolean
  controlWinningTickets: boolean
  allowJackpot: boolean
  enableRecharges: boolean
  allowPasswordChange: boolean
  cancelMinutes: number
  dailyCancelTickets?: number | null
  maxCancelAmount?: number | null
  maxTicketAmount?: number | null
  maxDailyRecharge?: number | null
  paymentMode: 'BANCA' | 'PROVEEDOR'
  createdAt: string
  updatedAt?: string | null
  createdBy?: number | null
  updatedBy?: number | null
}

export interface BettingPoolDraw {
  bettingPoolDrawId: number
  bettingPoolId: number
  drawId: number
  drawName?: string
  drawTime?: string
  lotteryId?: number
  lotteryName?: string
  countryName?: string
  isActive: boolean
  anticipatedClosingMinutes?: number | null
  enabledGameTypes?: GameType[]
  availableGameTypes?: GameType[]
  createdAt: string
  updatedAt?: string | null
}

export interface BettingPoolSchedule {
  scheduleId: number
  bettingPoolId: number
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  openingTime?: string | null
  closingTime?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface BettingPoolPrizesCommission {
  prizeCommissionId: number
  bettingPoolId: number
  lotteryId?: number | null
  lotteryName?: string
  gameType: string
  prizePayment1?: number | null
  prizePayment2?: number | null
  prizePayment3?: number | null
  prizePayment4?: number | null
  commissionDiscount1?: number | null
  commissionDiscount2?: number | null
  commissionDiscount3?: number | null
  commissionDiscount4?: number | null
  commission2Discount1?: number | null
  commission2Discount2?: number | null
  commission2Discount3?: number | null
  commission2Discount4?: number | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface BettingPoolDiscountConfig {
  discountConfigId: number
  bettingPoolId: number
  providerMode: 'BANCA' | 'PROVEEDOR'
  discountMode: 'PORCENTAJE' | 'MONTO'
  createdAt: string
  updatedAt?: string | null
}

export interface BettingPoolPrintConfig {
  printConfigId: number
  bettingPoolId: number
  printMode: 'NORMAL' | 'THERMAL'
  enablePrinting: boolean
  numberOfCopies: number
  printReceipts: boolean
  sendSMS: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface BettingPoolFooter {
  footerId: number
  bettingPoolId: number
  useAutoFooter: boolean
  line1?: string | null
  line2?: string | null
  line3?: string | null
  line4?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface BettingPoolUser {
  userId: number
  username: string
  fullName?: string
  bettingPoolId: number
  bettingPoolName: string
  roleId?: number
  roleName?: string
}

export interface GameType {
  gameTypeId: number
  gameTypeName: string
  gameTypeCode: string
  isEnabled: boolean
}

// ============================================================================
// DTOs - LIST & DETAIL
// ============================================================================

export interface BettingPoolListDto {
  bettingPoolId: number
  bettingPoolCode: string
  bettingPoolName: string
  zoneId: number
  zoneName: string
  bankId?: number | null
  bankName?: string | null
  location?: string | null
  phone?: string | null
  reference?: string | null
  username?: string | null
  isActive: boolean
  createdAt: string
}

export interface BettingPoolDetailDto extends BettingPoolListDto {
  address?: string | null
  comment?: string | null
  updatedAt?: string | null
}

export interface BettingPoolDetailWithConfigDto extends BettingPoolDetailDto {
  config?: BettingPoolConfig
  discountConfig?: BettingPoolDiscountConfig
  printConfig?: BettingPoolPrintConfig
  footer?: BettingPoolFooter
}

// ============================================================================
// DTOs - CREATE & UPDATE
// ============================================================================

export interface CreateBettingPoolDto {
  bettingPoolName: string
  zoneId: number
  bankId?: number | null
  address?: string | null
  phone?: string | null
  location?: string | null
  reference?: string | null
  comment?: string | null
  username?: string | null
  password?: string | null
  isActive?: boolean
}

export interface UpdateBettingPoolDto {
  bettingPoolName?: string
  zoneId?: number
  bankId?: number | null
  address?: string | null
  phone?: string | null
  location?: string | null
  reference?: string | null
  comment?: string | null
  username?: string | null
  isActive?: boolean
}

export interface UpdateBettingPoolConfigDto {
  fallType?: 'OFF' | 'PERDIDA' | 'GANANCIA'
  deactivationBalance?: number | null
  dailySaleLimit?: number | null
  dailyBalanceLimit?: number | null
  temporaryAdditionalBalance?: number | null
  enableTemporaryBalance?: boolean
  creditLimit?: number
  controlWinningTickets?: boolean
  allowJackpot?: boolean
  enableRecharges?: boolean
  allowPasswordChange?: boolean
  cancelMinutes?: number
  dailyCancelTickets?: number | null
  maxCancelAmount?: number | null
  maxTicketAmount?: number | null
  maxDailyRecharge?: number | null
  paymentMode?: 'BANCA' | 'PROVEEDOR'
}

export interface CreateBettingPoolWithConfigDto extends CreateBettingPoolDto {
  config?: UpdateBettingPoolConfigDto
  discountConfig?: {
    providerMode?: 'BANCA' | 'PROVEEDOR'
    discountMode?: 'PORCENTAJE' | 'MONTO'
  }
  printConfig?: {
    printMode?: 'NORMAL' | 'THERMAL'
    enablePrinting?: boolean
    numberOfCopies?: number
    printReceipts?: boolean
    sendSMS?: boolean
  }
  footer?: {
    useAutoFooter?: boolean
    line1?: string | null
    line2?: string | null
    line3?: string | null
    line4?: string | null
  }
}

export interface CreateBettingPoolDrawDto {
  drawId?: number
  lotteryId?: number // Legacy support
  isActive?: boolean
  anticipatedClosingMinutes?: number | null
  enabledGameTypeIds?: number[]
}

export interface UpdateBettingPoolDrawDto {
  isActive?: boolean
  anticipatedClosingMinutes?: number | null
  enabledGameTypeIds?: number[]
}

export interface CreateBettingPoolPrizesCommissionDto {
  lotteryId?: number | null
  gameType: string
  prizePayment1?: number | null
  prizePayment2?: number | null
  prizePayment3?: number | null
  prizePayment4?: number | null
  commissionDiscount1?: number | null
  commissionDiscount2?: number | null
  commissionDiscount3?: number | null
  commissionDiscount4?: number | null
  commission2Discount1?: number | null
  commission2Discount2?: number | null
  commission2Discount3?: number | null
  commission2Discount4?: number | null
  isActive?: boolean
}

export interface UpdateBettingPoolPrizesCommissionDto extends CreateBettingPoolPrizesCommissionDto {}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface GetBettingPoolsParams {
  page?: number
  pageSize?: number
  search?: string
  zoneId?: number
  isActive?: boolean
}

export interface NextBettingPoolCodeDto {
  nextCode: string
}

export interface SchedulesResponse {
  schedules: BettingPoolSchedule[]
}

export interface SaveSchedulesRequest {
  schedules: Array<{
    dayOfWeek: number
    openingTime?: string | null
    closingTime?: string | null
    isActive?: boolean
  }>
}

export interface MassUpdateBettingPoolsDto {
  bettingPoolIds: number[]
  zoneId?: number
  isActive?: boolean
  drawIdsToAdd?: number[]
  drawIdsToRemove?: number[]
}

export interface MassUpdateResponseDto {
  success: boolean
  updatedCount: number
  message: string
}

export interface FlatPrizesConfigDto {
  bettingPoolId: number
  prizes: Record<string, {
    gameType: string
    lotteryId?: number
    prizePayment1?: number
    prizePayment2?: number
    prizePayment3?: number
    prizePayment4?: number
    commissionDiscount1?: number
    commissionDiscount2?: number
    commissionDiscount3?: number
    commissionDiscount4?: number
    commission2Discount1?: number
    commission2Discount2?: number
    commission2Discount3?: number
    commission2Discount4?: number
  }>
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PagedResponse<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}
