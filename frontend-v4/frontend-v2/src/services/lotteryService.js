/**
 * Lottery Management Service
 * Handles all lottery-related API calls
 */

import api from './api'

/**
 * Get all lotteries with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.countryId - Filter by country ID
 * @param {boolean} params.isActive - Filter by active status
 * @param {boolean} params.loadAll - Load all lotteries (no pagination)
 * @returns {Promise} - Lotteries list with pagination
 */
export const getAllLotteries = async (params = {}) => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page)
  if (params.pageSize) queryParams.append('pageSize', params.pageSize)
  if (params.search) queryParams.append('search', params.search)
  if (params.countryId) queryParams.append('countryId', params.countryId)
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive)

  // Load all pages if loadAll is true
  if (params.loadAll) {
    queryParams.append('pageSize', '1000') // Load up to 1000 lotteries
  }

  const query = queryParams.toString()
  const response = await api.get(`/lotteries${query ? `?${query}` : ''}`)

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
 * Get lottery by ID
 * @param {number} id - Lottery ID
 * @returns {Promise} - Lottery data
 */
export const getLotteryById = async (id) => {
  const response = await api.get(`/lotteries/${id}`)

  return {
    success: true,
    data: response
  }
}

/**
 * Create a new lottery
 * @param {Object} lotteryData - Lottery data
 * @returns {Promise} - Created lottery
 */
export const createLottery = async (lotteryData) => {
  const response = await api.post('/lotteries', lotteryData)

  return {
    success: true,
    data: response
  }
}

/**
 * Update lottery
 * @param {number} id - Lottery ID
 * @param {Object} lotteryData - Updated lottery data
 * @returns {Promise} - Updated lottery
 */
export const updateLottery = async (id, lotteryData) => {
  const response = await api.put(`/lotteries/${id}`, lotteryData)

  return {
    success: true,
    data: response
  }
}

/**
 * Delete lottery
 * @param {number} id - Lottery ID
 * @returns {Promise} - Success status
 */
export const deleteLottery = async (id) => {
  await api.delete(`/lotteries/${id}`)

  return {
    success: true
  }
}

/**
 * Get bet types available for a specific lottery
 * @param {number} lotteryId - Lottery ID
 * @returns {Promise} - Bet types with their prize types
 */
export const getBetTypesByLottery = async (lotteryId) => {
  const response = await api.get(`/lotteries/${lotteryId}/bet-types`)

  return {
    success: true,
    data: response
  }
}
