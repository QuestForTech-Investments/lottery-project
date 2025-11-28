/**
 * Betting Pool Management Service
 * Handles all betting pool-related API calls
 * Complete TypeScript implementation with all endpoints
 */

import api from './api/client'
import type {
  BettingPool,
  BettingPoolConfig,
  BettingPoolDraw,
  BettingPoolSchedule,
  BettingPoolPrizesCommission,
  BettingPoolDiscountConfig,
  BettingPoolPrintConfig,
  BettingPoolFooter,
  BettingPoolUser,
  BettingPoolListDto,
  BettingPoolDetailDto,
  BettingPoolDetailWithConfigDto,
  CreateBettingPoolDto,
  CreateBettingPoolWithConfigDto,
  UpdateBettingPoolDto,
  UpdateBettingPoolConfigDto,
  CreateBettingPoolDrawDto,
  UpdateBettingPoolDrawDto,
  CreateBettingPoolPrizesCommissionDto,
  UpdateBettingPoolPrizesCommissionDto,
  GetBettingPoolsParams,
  NextBettingPoolCodeDto,
  SchedulesResponse,
  SaveSchedulesRequest,
  MassUpdateBettingPoolsDto,
  MassUpdateResponseDto,
  FlatPrizesConfigDto,
  PagedResponse,
  ApiResponse,
} from '@/types/bettingPool'

// ============================================================================
// RESPONSE WRAPPER HELPERS
// ============================================================================

/**
 * Wrap API response in success format for consistency
 */
const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
})

/**
 * Transform paginated response to expected format
 */
const transformPaginated = <T>(response: any): ApiResponse<T[]> & { pagination?: any } => {
  if (response && response.items) {
    return {
      success: true,
      data: response.items,
      pagination: {
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage,
      },
    }
  }
  return wrapSuccess(response)
}

// ============================================================================
// BETTING POOLS - MAIN CRUD
// ============================================================================

/**
 * Get all betting pools with pagination and filters
 * GET /api/betting-pools
 * @param params - Query parameters (page, pageSize, search, zoneId, isActive)
 * @returns Betting pools list with pagination
 */
export const getAllBettingPools = async (
  params: GetBettingPoolsParams = {}
): Promise<ApiResponse<BettingPoolListDto[]>> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.zoneId) queryParams.append('zoneId', params.zoneId.toString())
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())

  const query = queryParams.toString()
  const response = await api.get<any>(`/betting-pools${query ? `?${query}` : ''}`)

  return transformPaginated<BettingPoolListDto>(response)
}

/**
 * Get betting pool by ID
 * GET /api/betting-pools/{id}
 * @param bettingPoolId - Betting Pool ID
 * @returns Betting pool details
 */
export const getBettingPoolById = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolDetailDto>> => {
  const response = await api.get<BettingPoolDetailDto>(`/betting-pools/${bettingPoolId}`)
  return wrapSuccess(response)
}

/**
 * Get betting pool by ID with full configuration
 * GET /api/betting-pools/{id}/with-config
 * @param bettingPoolId - Betting Pool ID
 * @returns Betting pool with all configuration
 */
export const getBettingPoolWithConfig = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolDetailWithConfigDto>> => {
  const response = await api.get<BettingPoolDetailWithConfigDto>(
    `/betting-pools/${bettingPoolId}/with-config`
  )
  return wrapSuccess(response)
}

/**
 * Get next available betting pool code
 * GET /api/betting-pools/next-code
 * @returns Next available code (e.g., "RB001234")
 */
export const getNextBettingPoolCode = async (): Promise<ApiResponse<string>> => {
  const response = await api.get<NextBettingPoolCodeDto>('/betting-pools/next-code')
  return wrapSuccess(response.nextCode)
}

/**
 * Create new betting pool (basic)
 * POST /api/betting-pools
 * @param data - Betting pool data
 * @returns Created betting pool
 */
export const createBettingPool = async (
  data: CreateBettingPoolDto
): Promise<ApiResponse<BettingPool>> => {
  const response = await api.post<BettingPool>('/betting-pools', data)
  return wrapSuccess(response)
}

/**
 * Create new betting pool with full configuration
 * POST /api/betting-pools/with-config
 * @param data - Betting pool data with config
 * @returns Created betting pool with config
 */
export const createBettingPoolWithConfig = async (
  data: CreateBettingPoolWithConfigDto
): Promise<ApiResponse<BettingPoolDetailWithConfigDto>> => {
  const response = await api.post<BettingPoolDetailWithConfigDto>(
    '/betting-pools/with-config',
    data
  )
  return wrapSuccess(response)
}

/**
 * Update betting pool
 * PUT /api/betting-pools/{id}
 * @param bettingPoolId - Betting Pool ID
 * @param data - Update data
 * @returns Updated betting pool
 */
export const updateBettingPool = async (
  bettingPoolId: number,
  data: UpdateBettingPoolDto
): Promise<BettingPool> => {
  return api.put<BettingPool>(`/betting-pools/${bettingPoolId}`, data)
}

/**
 * Deactivate betting pool (soft delete)
 * DELETE /api/betting-pools/{id}
 * @param bettingPoolId - Betting Pool ID
 */
export const deactivateBettingPool = async (bettingPoolId: number): Promise<void> => {
  return api.delete<void>(`/betting-pools/${bettingPoolId}`)
}

/**
 * Activate betting pool (reactivate)
 * PUT /api/betting-pools/{id}
 * @param bettingPoolId - Betting Pool ID
 */
export const activateBettingPool = async (bettingPoolId: number): Promise<BettingPool> => {
  return api.put<BettingPool>(`/betting-pools/${bettingPoolId}`, { isActive: true })
}

/**
 * Mass update betting pools
 * PATCH /api/betting-pools/mass-update
 * @param data - Mass update data
 * @returns Update result
 */
export const massUpdateBettingPools = async (
  data: MassUpdateBettingPoolsDto
): Promise<MassUpdateResponseDto> => {
  return api.patch<MassUpdateResponseDto>('/betting-pools/mass-update', data)
}

// ============================================================================
// BETTING POOL CONFIGURATION
// ============================================================================

/**
 * Get betting pool configuration
 * GET /api/betting-pools/{id}/config
 * @param bettingPoolId - Betting Pool ID
 * @returns Configuration
 */
export const getBettingPoolConfig = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolConfig>> => {
  const response = await api.get<BettingPoolConfig>(`/betting-pools/${bettingPoolId}/config`)
  return wrapSuccess(response)
}

/**
 * Update betting pool configuration
 * PUT /api/betting-pools/{id}/config
 * @param bettingPoolId - Betting Pool ID
 * @param data - Configuration data
 * @returns Updated configuration
 */
export const updateBettingPoolConfig = async (
  bettingPoolId: number,
  data: UpdateBettingPoolConfigDto
): Promise<BettingPoolConfig> => {
  return api.put<BettingPoolConfig>(`/betting-pools/${bettingPoolId}/config`, data)
}

/**
 * Get betting pool discount configuration
 * GET /api/betting-pools/{id}/discount-config
 * @param bettingPoolId - Betting Pool ID
 * @returns Discount configuration
 */
export const getBettingPoolDiscountConfig = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolDiscountConfig>> => {
  const response = await api.get<BettingPoolDiscountConfig>(
    `/betting-pools/${bettingPoolId}/discount-config`
  )
  return wrapSuccess(response)
}

/**
 * Update betting pool discount configuration
 * PUT /api/betting-pools/{id}/discount-config
 * @param bettingPoolId - Betting Pool ID
 * @param data - Discount configuration data
 * @returns Updated discount configuration
 */
export const updateBettingPoolDiscountConfig = async (
  bettingPoolId: number,
  data: Partial<BettingPoolDiscountConfig>
): Promise<BettingPoolDiscountConfig> => {
  return api.put<BettingPoolDiscountConfig>(
    `/betting-pools/${bettingPoolId}/discount-config`,
    data
  )
}

/**
 * Get betting pool print configuration
 * GET /api/betting-pools/{id}/print-config
 * @param bettingPoolId - Betting Pool ID
 * @returns Print configuration
 */
export const getBettingPoolPrintConfig = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolPrintConfig>> => {
  const response = await api.get<BettingPoolPrintConfig>(
    `/betting-pools/${bettingPoolId}/print-config`
  )
  return wrapSuccess(response)
}

/**
 * Update betting pool print configuration
 * PUT /api/betting-pools/{id}/print-config
 * @param bettingPoolId - Betting Pool ID
 * @param data - Print configuration data
 * @returns Updated print configuration
 */
export const updateBettingPoolPrintConfig = async (
  bettingPoolId: number,
  data: Partial<BettingPoolPrintConfig>
): Promise<BettingPoolPrintConfig> => {
  return api.put<BettingPoolPrintConfig>(`/betting-pools/${bettingPoolId}/print-config`, data)
}

/**
 * Get betting pool footer configuration
 * GET /api/betting-pools/{id}/footer
 * @param bettingPoolId - Betting Pool ID
 * @returns Footer configuration
 */
export const getBettingPoolFooter = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolFooter>> => {
  const response = await api.get<BettingPoolFooter>(`/betting-pools/${bettingPoolId}/footer`)
  return wrapSuccess(response)
}

/**
 * Update betting pool footer configuration
 * PUT /api/betting-pools/{id}/footer
 * @param bettingPoolId - Betting Pool ID
 * @param data - Footer configuration data
 * @returns Updated footer configuration
 */
export const updateBettingPoolFooter = async (
  bettingPoolId: number,
  data: Partial<BettingPoolFooter>
): Promise<BettingPoolFooter> => {
  return api.put<BettingPoolFooter>(`/betting-pools/${bettingPoolId}/footer`, data)
}

// ============================================================================
// BETTING POOL SCHEDULES
// ============================================================================

/**
 * Get betting pool schedules
 * GET /api/betting-pools/{id}/schedules
 * @param bettingPoolId - Betting Pool ID
 * @returns Schedules (7 days)
 */
export const getBettingPoolSchedules = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolSchedule[]>> => {
  const response = await api.get<SchedulesResponse>(`/betting-pools/${bettingPoolId}/schedules`)
  return wrapSuccess(response.schedules)
}

/**
 * Save betting pool schedules (all 7 days at once)
 * PUT /api/betting-pools/{id}/schedules
 * @param bettingPoolId - Betting Pool ID
 * @param data - Schedules data (7 days)
 * @returns Saved schedules
 */
export const saveBettingPoolSchedules = async (
  bettingPoolId: number,
  data: SaveSchedulesRequest
): Promise<BettingPoolSchedule[]> => {
  return api.put<BettingPoolSchedule[]>(`/betting-pools/${bettingPoolId}/schedules`, data)
}

// ============================================================================
// BETTING POOL USERS
// ============================================================================

/**
 * Get betting pool users
 * GET /api/betting-pools/{id}/users
 * @param bettingPoolId - Betting Pool ID
 * @returns Users list
 */
export const getBettingPoolUsers = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolUser[]>> => {
  const response = await api.get<BettingPoolUser[]>(`/betting-pools/${bettingPoolId}/users`)
  return wrapSuccess(response)
}

/**
 * Add user to betting pool
 * POST /api/betting-pools/{id}/users
 * @param bettingPoolId - Betting Pool ID
 * @param userId - User ID to add
 */
export const addUserToBettingPool = async (
  bettingPoolId: number,
  userId: number
): Promise<void> => {
  return api.post<void>(`/betting-pools/${bettingPoolId}/users`, { userId })
}

/**
 * Remove user from betting pool
 * DELETE /api/betting-pools/{id}/users/{userId}
 * @param bettingPoolId - Betting Pool ID
 * @param userId - User ID to remove
 */
export const removeUserFromBettingPool = async (
  bettingPoolId: number,
  userId: number
): Promise<void> => {
  return api.delete<void>(`/betting-pools/${bettingPoolId}/users/${userId}`)
}

// ============================================================================
// BETTING POOL DRAWS
// ============================================================================

/**
 * Get all betting pool draws
 * GET /api/betting-pool-draws
 * @returns All draws
 */
export const getAllBettingPoolDraws = async (): Promise<ApiResponse<BettingPoolDraw[]>> => {
  const response = await api.get<BettingPoolDraw[]>('/betting-pool-draws')
  return wrapSuccess(response)
}

/**
 * Get betting pool draws by betting pool ID
 * GET /api/betting-pool-draws/betting-pool/{bettingPoolId}
 * @param bettingPoolId - Betting Pool ID
 * @returns Draws for this betting pool
 */
export const getBettingPoolDraws = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolDraw[]>> => {
  const response = await api.get<BettingPoolDraw[]>(
    `/betting-pool-draws/betting-pool/${bettingPoolId}`
  )
  return wrapSuccess(response)
}

/**
 * Add draw to betting pool
 * POST /api/betting-pool-draws/betting-pool/{bettingPoolId}/draws
 * @param bettingPoolId - Betting Pool ID
 * @param data - Draw data
 * @returns Created betting pool draw
 */
export const addDrawToBettingPool = async (
  bettingPoolId: number,
  data: CreateBettingPoolDrawDto
): Promise<ApiResponse<BettingPoolDraw>> => {
  const response = await api.post<BettingPoolDraw>(
    `/betting-pool-draws/betting-pool/${bettingPoolId}/draws`,
    data
  )
  return wrapSuccess(response)
}

/**
 * Update betting pool draw
 * PUT /api/betting-pool-draws/{id}
 * @param bettingPoolDrawId - Betting Pool Draw ID
 * @param data - Update data
 * @returns Updated betting pool draw
 */
export const updateBettingPoolDraw = async (
  bettingPoolDrawId: number,
  data: UpdateBettingPoolDrawDto
): Promise<BettingPoolDraw> => {
  return api.put<BettingPoolDraw>(`/betting-pool-draws/${bettingPoolDrawId}`, data)
}

/**
 * Remove draw from betting pool
 * DELETE /api/betting-pool-draws/{id}
 * @param bettingPoolDrawId - Betting Pool Draw ID
 */
export const removeBettingPoolDraw = async (bettingPoolDrawId: number): Promise<void> => {
  return api.delete<void>(`/betting-pool-draws/${bettingPoolDrawId}`)
}

/**
 * Bulk add draws to betting pool
 * POST /api/betting-pool-draws/betting-pool/{bettingPoolId}/bulk-add
 * @param bettingPoolId - Betting Pool ID
 * @param drawIds - Array of Draw IDs to add
 * @returns Added betting pool draws
 */
export const bulkAddDraws = async (
  bettingPoolId: number,
  drawIds: number[]
): Promise<BettingPoolDraw[]> => {
  return api.post<BettingPoolDraw[]>(
    `/betting-pool-draws/betting-pool/${bettingPoolId}/bulk-add`,
    { drawIds }
  )
}

/**
 * Bulk remove draws from betting pool
 * DELETE /api/betting-pool-draws/betting-pool/{bettingPoolId}/bulk-remove
 * @param bettingPoolId - Betting Pool ID
 * @param drawIds - Array of Draw IDs to remove
 */
export const bulkRemoveDraws = async (bettingPoolId: number, drawIds: number[]): Promise<void> => {
  return api.post<void>(`/betting-pool-draws/betting-pool/${bettingPoolId}/bulk-remove`, {
    drawIds,
  })
}

// ============================================================================
// BETTING POOL PRIZES & COMMISSIONS
// ============================================================================

/**
 * Get betting pool prizes and commissions
 * GET /api/betting-pool-prizes/{bettingPoolId}
 * @param bettingPoolId - Betting Pool ID
 * @returns Prizes and commissions list
 */
export const getBettingPoolPrizes = async (
  bettingPoolId: number
): Promise<ApiResponse<BettingPoolPrizesCommission[]>> => {
  const response = await api.get<BettingPoolPrizesCommission[]>(
    `/betting-pool-prizes/${bettingPoolId}`
  )
  return wrapSuccess(response)
}

/**
 * Get betting pool prizes in flat format (keyed by gameType-lotteryId)
 * GET /api/betting-pool-prizes/{bettingPoolId}/flat
 * @param bettingPoolId - Betting Pool ID
 * @returns Flat prizes configuration
 */
export const getBettingPoolPrizesFlat = async (
  bettingPoolId: number
): Promise<ApiResponse<FlatPrizesConfigDto>> => {
  const response = await api.get<FlatPrizesConfigDto>(
    `/betting-pool-prizes/${bettingPoolId}/flat`
  )
  return wrapSuccess(response)
}

/**
 * Create betting pool prize/commission
 * POST /api/betting-pool-prizes/{bettingPoolId}
 * @param bettingPoolId - Betting Pool ID
 * @param data - Prize/commission data
 * @returns Created prize/commission
 */
export const createBettingPoolPrize = async (
  bettingPoolId: number,
  data: CreateBettingPoolPrizesCommissionDto
): Promise<ApiResponse<BettingPoolPrizesCommission>> => {
  const response = await api.post<BettingPoolPrizesCommission>(
    `/betting-pool-prizes/${bettingPoolId}`,
    data
  )
  return wrapSuccess(response)
}

/**
 * Update betting pool prize/commission
 * PUT /api/betting-pool-prizes/{id}
 * @param prizeCommissionId - Prize/Commission ID
 * @param data - Update data
 * @returns Updated prize/commission
 */
export const updateBettingPoolPrize = async (
  prizeCommissionId: number,
  data: UpdateBettingPoolPrizesCommissionDto
): Promise<BettingPoolPrizesCommission> => {
  return api.put<BettingPoolPrizesCommission>(`/betting-pool-prizes/${prizeCommissionId}`, data)
}

/**
 * Delete betting pool prize/commission
 * DELETE /api/betting-pool-prizes/{id}
 * @param prizeCommissionId - Prize/Commission ID
 */
export const deleteBettingPoolPrize = async (prizeCommissionId: number): Promise<void> => {
  return api.delete<void>(`/betting-pool-prizes/${prizeCommissionId}`)
}

/**
 * Update betting pool prizes in flat format (batch update)
 * PATCH /api/betting-pool-prizes/{bettingPoolId}/flat
 * @param bettingPoolId - Betting Pool ID
 * @param data - Flat prizes data
 * @returns Update result
 */
export const updateBettingPoolPrizesFlat = async (
  bettingPoolId: number,
  data: FlatPrizesConfigDto
): Promise<void> => {
  return api.patch<void>(`/betting-pool-prizes/${bettingPoolId}/flat`, data)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Search betting pools by name or code
 * @param query - Search query
 * @returns Search results
 */
export const searchBettingPools = async (query: string): Promise<BettingPoolListDto[]> => {
  const response = await getAllBettingPools({ search: query, pageSize: 50 })
  return response.data
}

/**
 * Get active betting pools only
 * @returns Active betting pools
 */
export const getActiveBettingPools = async (): Promise<BettingPoolListDto[]> => {
  const response = await getAllBettingPools({ isActive: true, pageSize: 1000 })
  return response.data
}

/**
 * Get betting pools by zone
 * @param zoneId - Zone ID
 * @returns Betting pools in zone
 */
export const getBettingPoolsByZone = async (zoneId: number): Promise<BettingPoolListDto[]> => {
  const response = await getAllBettingPools({ zoneId, pageSize: 1000 })
  return response.data
}

/**
 * Check if betting pool code is available
 * @param code - Code to check
 * @returns True if available
 */
export const checkBettingPoolCodeAvailability = async (code: string): Promise<boolean> => {
  try {
    const pools = await searchBettingPools(code)
    const exactMatch = pools.some(
      (pool) => pool.bettingPoolCode.toLowerCase() === code.toLowerCase()
    )
    return !exactMatch
  } catch (error) {
    console.error('Error checking betting pool code:', error)
    return false
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Main CRUD
  getAllBettingPools,
  getBettingPoolById,
  getBettingPoolWithConfig,
  getNextBettingPoolCode,
  createBettingPool,
  createBettingPoolWithConfig,
  updateBettingPool,
  deactivateBettingPool,
  activateBettingPool,
  massUpdateBettingPools,

  // Configuration
  getBettingPoolConfig,
  updateBettingPoolConfig,
  getBettingPoolDiscountConfig,
  updateBettingPoolDiscountConfig,
  getBettingPoolPrintConfig,
  updateBettingPoolPrintConfig,
  getBettingPoolFooter,
  updateBettingPoolFooter,

  // Schedules
  getBettingPoolSchedules,
  saveBettingPoolSchedules,

  // Users
  getBettingPoolUsers,
  addUserToBettingPool,
  removeUserFromBettingPool,

  // Draws
  getAllBettingPoolDraws,
  getBettingPoolDraws,
  addDrawToBettingPool,
  updateBettingPoolDraw,
  removeBettingPoolDraw,
  bulkAddDraws,
  bulkRemoveDraws,

  // Prizes & Commissions
  getBettingPoolPrizes,
  getBettingPoolPrizesFlat,
  createBettingPoolPrize,
  updateBettingPoolPrize,
  deleteBettingPoolPrize,
  updateBettingPoolPrizesFlat,

  // Utilities
  searchBettingPools,
  getActiveBettingPools,
  getBettingPoolsByZone,
  checkBettingPoolCodeAvailability,
}
