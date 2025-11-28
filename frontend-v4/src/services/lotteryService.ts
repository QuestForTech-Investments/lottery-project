/**
 * Lottery Management Service
 * Handles all lottery-related API calls
 */

import api from './api'

// Types
interface LotteryParams {
  page?: number | string;
  pageSize?: number | string;
  search?: string;
  countryId?: number | string;
  isActive?: boolean;
  loadAll?: boolean;
}

interface Lottery {
  lotteryId: number;
  lotteryName: string;
  lotteryCode?: string;
  countryId?: number;
  countryName?: string;
  isActive?: boolean;
}

interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface LotteriesResponse {
  success: boolean;
  data: Lottery[];
  pagination?: Pagination;
}

interface LotteryResponse {
  success: boolean;
  data?: Lottery;
}

interface SuccessResponse {
  success: boolean;
}

interface BetType {
  betTypeId: number;
  betTypeName: string;
  betTypeCode?: string;
  prizeTypes?: unknown[];
}

interface BetTypesResponse {
  success: boolean;
  data: BetType[];
}

interface PaginatedApiResponse {
  items?: Lottery[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

interface LotteryCreateData {
  lotteryName: string;
  lotteryCode?: string;
  countryId?: number;
  isActive?: boolean;
  [key: string]: unknown;
}

interface LotteryUpdateData {
  lotteryName?: string;
  lotteryCode?: string;
  countryId?: number;
  isActive?: boolean;
  [key: string]: unknown;
}

/**
 * Get all lotteries with pagination and filters
 */
export const getAllLotteries = async (params: LotteryParams = {}): Promise<LotteriesResponse | PaginatedApiResponse> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', String(params.page))
  if (params.pageSize) queryParams.append('pageSize', String(params.pageSize))
  if (params.search) queryParams.append('search', params.search)
  if (params.countryId) queryParams.append('countryId', String(params.countryId))
  if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

  // Load all pages if loadAll is true
  if (params.loadAll) {
    queryParams.append('pageSize', '1000') // Load up to 1000 lotteries
  }

  const query = queryParams.toString()
  const response = await api.get(`/lotteries${query ? `?${query}` : ''}`) as PaginatedApiResponse

  // Transform paginated response to expected format
  if (response && response.items) {
    return {
      success: true,
      data: response.items,
      pagination: {
        pageNumber: response.pageNumber || 1,
        pageSize: response.pageSize || 20,
        totalCount: response.totalCount || 0,
        totalPages: response.totalPages || 0,
        hasPreviousPage: response.hasPreviousPage || false,
        hasNextPage: response.hasNextPage || false
      }
    }
  }

  return response
}

/**
 * Get lottery by ID
 */
export const getLotteryById = async (id: number | string): Promise<LotteryResponse> => {
  const response = await api.get(`/lotteries/${id}`) as Lottery

  return {
    success: true,
    data: response
  }
}

/**
 * Create a new lottery
 */
export const createLottery = async (lotteryData: LotteryCreateData): Promise<LotteryResponse> => {
  const response = await api.post('/lotteries', lotteryData) as Lottery

  return {
    success: true,
    data: response
  }
}

/**
 * Update lottery
 */
export const updateLottery = async (id: number | string, lotteryData: LotteryUpdateData): Promise<LotteryResponse> => {
  const response = await api.put(`/lotteries/${id}`, lotteryData) as Lottery

  return {
    success: true,
    data: response
  }
}

/**
 * Delete lottery
 */
export const deleteLottery = async (id: number | string): Promise<SuccessResponse> => {
  await api.delete(`/lotteries/${id}`)

  return {
    success: true
  }
}

/**
 * Get bet types available for a specific lottery
 */
export const getBetTypesByLottery = async (lotteryId: number | string): Promise<BetTypesResponse> => {
  const response = await api.get(`/lotteries/${lotteryId}/bet-types`) as BetType[]

  return {
    success: true,
    data: response
  }
}
