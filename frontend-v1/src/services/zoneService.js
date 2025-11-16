/**
 * Zone Management Service
 * Handles all zone-related API calls
 */

import api from './api'

/**
 * Get all zones with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.countryId - Filter by country ID
 * @param {boolean} params.isActive - Filter by active status
 * @returns {Promise} - Zones list with pagination
 */
export const getAllZones = async (params = {}) => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page)
  if (params.pageSize) queryParams.append('pageSize', params.pageSize)
  if (params.search) queryParams.append('search', params.search)
  if (params.countryId) queryParams.append('countryId', params.countryId)
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive)

  const query = queryParams.toString()
  const response = await api.get(`/zones${query ? `?${query}` : ''}`)

  console.log('🔧 ZONE SERVICE - Raw response from api.get:', response)
  console.log('🔧 ZONE SERVICE - Has items:', !!response.items)

  // Transform paginated response to expected format
  if (response && response.items) {
    const transformed = {
      success: true,
      data: response.items,
      pagination: {
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage
      }
    }
    console.log('🔧 ZONE SERVICE - Transformed response:', {
      success: transformed.success,
      dataLength: transformed.data?.length,
      totalCount: transformed.pagination.totalCount
    })
    return transformed
  }

  console.log('🔧 ZONE SERVICE - No items, returning raw response')
  return response
}

/**
 * Get zone by ID
 * @param {number} zoneId - Zone ID
 * @returns {Promise} - Zone details
 */
export const getZoneById = async (zoneId) => {
  return api.get(`/zones/${zoneId}`)
}

/**
 * Get branches in a zone
 * @param {number} zoneId - Zone ID
 * @returns {Promise} - Branches list
 */
export const getZoneBranches = async (zoneId) => {
  return api.get(`/zones/${zoneId}/branches`)
}

/**
 * Get users in a zone
 * @param {number} zoneId - Zone ID
 * @returns {Promise} - Users list
 */
export const getZoneUsers = async (zoneId) => {
  return api.get(`/zones/${zoneId}/users`)
}

/**
 * Get zones statistics
 * @returns {Promise} - Zones statistics
 */
export const getZonesStats = async () => {
  return api.get('/zones/stats')
}

/**
 * Create new zone
 * @param {Object} zoneData - Zone data
 * @param {string} zoneData.zoneName - Zone name (required)
 * @param {string} zoneData.description - Description (optional)
 * @param {boolean} zoneData.isActive - Active status (optional)
 * @returns {Promise} - Created zone
 */
export const createZone = async (zoneData) => {
  return api.post('/zones', zoneData)
}

/**
 * Update zone
 * @param {number} zoneId - Zone ID
 * @param {Object} zoneData - Zone data to update
 * @returns {Promise} - Updated zone
 */
export const updateZone = async (zoneId, zoneData) => {
  return api.put(`/zones/${zoneId}`, zoneData)
}

/**
 * Deactivate zone
 * @param {number} zoneId - Zone ID
 * @returns {Promise} - Result
 */
export const deactivateZone = async (zoneId) => {
  return api.delete(`/zones/${zoneId}`)
}

/**
 * Get active zones only
 * @returns {Promise} - Active zones list
 */
export const getActiveZones = async () => {
  const response = await getAllZones({ isActive: true, pageSize: 1000 })
  return response
}

/**
 * Get zone with full details (branches and users)
 * @param {number} zoneId - Zone ID
 * @returns {Promise} - Complete zone information
 */
export const getZoneFullDetails = async (zoneId) => {
  try {
    const [zoneResponse, branchesResponse, usersResponse] = await Promise.all([
      getZoneById(zoneId),
      getZoneBranches(zoneId),
      getZoneUsers(zoneId)
    ])
    
    return {
      success: true,
      data: {
        ...zoneResponse.data,
        branches: branchesResponse.data,
        users: usersResponse.data
      }
    }
  } catch (error) {
    console.error('Error fetching zone details:', error)
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
  getZoneFullDetails
}

