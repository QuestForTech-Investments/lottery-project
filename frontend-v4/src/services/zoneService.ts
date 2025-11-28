/**
 * Zone Management Service
 * Handles all zone-related API calls
 */

import api from './api'

// Types
interface ZoneParams {
  page?: number | string;
  pageSize?: number | string;
  search?: string;
  countryId?: number | string;
  isActive?: boolean;
}

interface Zone {
  zoneId: number;
  zoneName: string;
  description?: string;
  isActive?: boolean;
  countryId?: number;
}

interface ZoneCreateData {
  zoneName: string;
  description?: string;
  isActive?: boolean;
}

interface ZoneUpdateData {
  zoneName?: string;
  description?: string;
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

interface ZonesResponse {
  success: boolean;
  data: Zone[];
  pagination?: Pagination;
}

interface ZoneResponse {
  success: boolean;
  data: Zone;
}

interface BettingPool {
  bettingPoolId: number;
  bettingPoolName: string;
  branchCode?: string;
}

interface User {
  userId: number;
  username: string;
  fullName?: string;
}

interface AssignmentResult {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  results?: PromiseSettledResult<unknown>[];
}

interface BatchAssignmentResult {
  success: boolean;
  bettingPools: AssignmentResult;
  users: AssignmentResult;
  summary: {
    totalAssignments: number;
    successful: number;
    failed: number;
  };
}

interface PaginatedResponse {
  items?: Zone[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

interface ApiDataResponse<T> {
  data?: T;
}

/**
 * Get all zones with pagination and filters
 */
export const getAllZones = async (params: ZoneParams = {}): Promise<ZonesResponse | PaginatedResponse> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', String(params.page))
  if (params.pageSize) queryParams.append('pageSize', String(params.pageSize))
  if (params.search) queryParams.append('search', params.search)
  if (params.countryId) queryParams.append('countryId', String(params.countryId))
  if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

  const query = queryParams.toString()
  const response = await api.get(`/zones${query ? `?${query}` : ''}`) as PaginatedResponse

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
 * Get zone by ID
 */
export const getZoneById = async (zoneId: number | string): Promise<Zone> => {
  return api.get(`/zones/${zoneId}`) as Promise<Zone>
}

/**
 * Get bettingPools in a zone
 */
export const getZoneBranches = async (zoneId: number | string): Promise<BettingPool[]> => {
  return api.get(`/zones/${zoneId}/bettingPools`) as Promise<BettingPool[]>
}

/**
 * Get users in a zone
 */
export const getZoneUsers = async (zoneId: number | string): Promise<User[]> => {
  return api.get(`/zones/${zoneId}/users`) as Promise<User[]>
}

/**
 * Get zones statistics
 */
export const getZonesStats = async (): Promise<unknown> => {
  return api.get('/zones/stats')
}

/**
 * Create new zone
 */
export const createZone = async (zoneData: ZoneCreateData): Promise<Zone> => {
  return api.post('/zones', zoneData) as Promise<Zone>
}

/**
 * Update zone
 */
export const updateZone = async (zoneId: number | string, zoneData: ZoneUpdateData): Promise<Zone> => {
  return api.put(`/zones/${zoneId}`, zoneData) as Promise<Zone>
}

/**
 * Deactivate zone
 */
export const deactivateZone = async (zoneId: number | string): Promise<void> => {
  return api.delete(`/zones/${zoneId}`) as Promise<void>
}

/**
 * Get active zones only
 */
export const getActiveZones = async (): Promise<ZonesResponse | PaginatedResponse> => {
  const response = await getAllZones({ isActive: true, pageSize: 1000 })
  return response
}

/**
 * Get zone with full details (bettingPools and users)
 */
export const getZoneFullDetails = async (zoneId: number | string): Promise<ZoneResponse & { data: Zone & { bettingPools: BettingPool[]; users: User[] } }> => {
  try {
    const [zoneResponse, branchesResponse, usersResponse] = await Promise.all([
      getZoneById(zoneId),
      getZoneBranches(zoneId),
      getZoneUsers(zoneId)
    ])

    return {
      success: true,
      data: {
        ...zoneResponse,
        bettingPools: branchesResponse,
        users: usersResponse
      }
    }
  } catch (error) {
    console.error('Error fetching zone details:', error)
    throw error
  }
}

/**
 * Assign betting pools to a zone
 */
export const assignBettingPoolsToZone = async (zoneId: number | string, bettingPoolIds: number[]): Promise<AssignmentResult> => {
  try {
    // Update each betting pool in parallel
    const updatePromises = bettingPoolIds.map(poolId =>
      api.put(`/betting-pools/${poolId}`, { zoneId })
    )

    const results = await Promise.allSettled(updatePromises)

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return {
      success: failed === 0,
      total: bettingPoolIds.length,
      successful,
      failed,
      results
    }
  } catch (error) {
    console.error('Error assigning betting pools to zone:', error)
    throw error
  }
}

/**
 * Assign users to a zone
 */
export const assignUsersToZone = async (zoneId: number | string, userIds: number[]): Promise<AssignmentResult> => {
  try {
    // Update each user in parallel
    const updatePromises = userIds.map(userId =>
      api.put(`/users/${userId}`, { zoneId })
    )

    const results = await Promise.allSettled(updatePromises)

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return {
      success: failed === 0,
      total: userIds.length,
      successful,
      failed,
      results
    }
  } catch (error) {
    console.error('Error assigning users to zone:', error)
    throw error
  }
}

/**
 * Batch assign betting pools and users to a zone
 */
export const assignToZone = async (zoneId: number | string, { bettingPoolIds = [], userIds = [] }: { bettingPoolIds?: number[]; userIds?: number[] }): Promise<BatchAssignmentResult> => {
  try {
    const [bettingPoolsResult, usersResult] = await Promise.all([
      bettingPoolIds.length > 0 ? assignBettingPoolsToZone(zoneId, bettingPoolIds) : Promise.resolve({ success: true, total: 0, successful: 0, failed: 0 }),
      userIds.length > 0 ? assignUsersToZone(zoneId, userIds) : Promise.resolve({ success: true, total: 0, successful: 0, failed: 0 })
    ])

    return {
      success: bettingPoolsResult.success && usersResult.success,
      bettingPools: bettingPoolsResult,
      users: usersResult,
      summary: {
        totalAssignments: bettingPoolsResult.total + usersResult.total,
        successful: bettingPoolsResult.successful + usersResult.successful,
        failed: bettingPoolsResult.failed + usersResult.failed
      }
    }
  } catch (error) {
    console.error('Error in batch assignment:', error)
    throw error
  }
}

export default {
  getAllZones,
  getZoneById,
  getZoneBranches,
  getZoneUsers,
  getZonesStats,
  createZone,
  updateZone,
  deactivateZone,
  getActiveZones,
  getZoneFullDetails,
  assignBettingPoolsToZone,
  assignUsersToZone,
  assignToZone
}
