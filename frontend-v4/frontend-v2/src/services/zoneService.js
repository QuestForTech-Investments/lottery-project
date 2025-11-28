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

  // Transform paginated response to expected format
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
        hasNextPage: response.hasNextPage
      }
    }
  }

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
 * Get bettingPools in a zone
 * @param {number} zoneId - Zone ID
 * @returns {Promise} - Branches list
 */
export const getZoneBranches = async (zoneId) => {
  return api.get(`/zones/${zoneId}/bettingPools`)
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
 * Get zone with full details (bettingPools and users)
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
        bettingPools: branchesResponse.data,
        users: usersResponse.data
      }
    }
  } catch (error) {
    console.error('Error fetching zone details:', error)
    throw error
  }
}

/**
 * Assign betting pools to a zone
 * Updates multiple betting pools to set their zoneId
 * @param {number} zoneId - Zone ID to assign to
 * @param {Array<number>} bettingPoolIds - Array of betting pool IDs to assign
 * @returns {Promise} - Results of assignments
 */
export const assignBettingPoolsToZone = async (zoneId, bettingPoolIds) => {
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
 * Updates multiple users to set their zoneId
 * @param {number} zoneId - Zone ID to assign to
 * @param {Array<number>} userIds - Array of user IDs to assign
 * @returns {Promise} - Results of assignments
 */
export const assignUsersToZone = async (zoneId, userIds) => {
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
 * Convenience method to assign both at once
 * @param {number} zoneId - Zone ID
 * @param {Object} assignments - Assignments object
 * @param {Array<number>} assignments.bettingPoolIds - Betting pool IDs
 * @param {Array<number>} assignments.userIds - User IDs
 * @returns {Promise} - Combined results
 */
export const assignToZone = async (zoneId, { bettingPoolIds = [], userIds = [] }) => {
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

