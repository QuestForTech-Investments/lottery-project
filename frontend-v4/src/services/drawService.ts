/**
 * Draw Management Service
 * Handles all draw-related API calls
 */

import api from './api'

// Types
interface DrawParams {
  page?: number | string;
  pageSize?: number | string;
  search?: string;
  countryId?: number | string;
  isActive?: boolean;
  loadAll?: boolean;
}

interface Draw {
  drawId: number;
  drawName: string;
  drawTime?: string;
  lotteryId?: number;
  lotteryName?: string;
  countryId?: number;
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

interface DrawsResponse {
  success: boolean;
  data: Draw[];
  pagination?: Pagination;
}

interface DrawResponse {
  success: boolean;
  data?: Draw;
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
  items?: Draw[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

interface DrawCreateData {
  drawName: string;
  drawTime?: string;
  lotteryId?: number;
  isActive?: boolean;
  [key: string]: unknown;
}

interface DrawUpdateData {
  drawName?: string;
  drawTime?: string;
  lotteryId?: number;
  isActive?: boolean;
  [key: string]: unknown;
}

/**
 * Get all draws with pagination and filters
 */
export const getAllDraws = async (params: DrawParams = {}): Promise<DrawsResponse | PaginatedApiResponse> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', String(params.page))
  if (params.pageSize) queryParams.append('pageSize', String(params.pageSize))
  if (params.search) queryParams.append('search', params.search)
  if (params.countryId) queryParams.append('countryId', String(params.countryId))
  if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

  // Load all pages if loadAll is true
  if (params.loadAll) {
    queryParams.append('pageSize', '1000') // Load up to 1000 draws
  }

  const query = queryParams.toString()
  const response = await api.get(`/draws${query ? `?${query}` : ''}`) as PaginatedApiResponse

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
 * Get draw by ID
 */
export const getDrawById = async (id: number | string): Promise<DrawResponse> => {
  const response = await api.get(`/draws/${id}`) as Draw

  return {
    success: true,
    data: response
  }
}

/**
 * Create a new draw
 */
export const createDraw = async (drawData: DrawCreateData): Promise<DrawResponse> => {
  const response = await api.post('/draws', drawData) as Draw

  return {
    success: true,
    data: response
  }
}

/**
 * Update draw
 */
export const updateDraw = async (id: number | string, drawData: DrawUpdateData): Promise<DrawResponse> => {
  const response = await api.put(`/draws/${id}`, drawData) as Draw

  return {
    success: true,
    data: response
  }
}

/**
 * Delete draw
 */
export const deleteDraw = async (id: number | string): Promise<SuccessResponse> => {
  await api.delete(`/draws/${id}`)

  return {
    success: true
  }
}

/**
 * Get bet types available for a specific draw
 */
export const getBetTypesByDraw = async (drawId: number | string): Promise<BetTypesResponse> => {
  const response = await api.get(`/draws/${drawId}/bet-types`) as BetType[]

  return {
    success: true,
    data: response
  }
}
