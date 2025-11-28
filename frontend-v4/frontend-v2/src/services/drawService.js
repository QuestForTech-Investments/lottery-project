/**
 * Draw Management Service
 * Handles all draw-related API calls
 */

import api from './api'

/**
 * Get all draws with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.countryId - Filter by country ID
 * @param {boolean} params.isActive - Filter by active status
 * @param {boolean} params.loadAll - Load all draws (no pagination)
 * @returns {Promise} - Draws list with pagination
 */
export const getAllDraws = async (params = {}) => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page)
  if (params.pageSize) queryParams.append('pageSize', params.pageSize)
  if (params.search) queryParams.append('search', params.search)
  if (params.countryId) queryParams.append('countryId', params.countryId)
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive)

  // Load all pages if loadAll is true
  if (params.loadAll) {
    queryParams.append('pageSize', '1000') // Load up to 1000 draws
  }

  const query = queryParams.toString()
  const response = await api.get(`/draws${query ? `?${query}` : ''}`)

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
 * Get draw by ID
 * @param {number} id - Draw ID
 * @returns {Promise} - Draw data
 */
export const getDrawById = async (id) => {
  const response = await api.get(`/draws/${id}`)

  return {
    success: true,
    data: response
  }
}

/**
 * Create a new draw
 * @param {Object} drawData - Draw data
 * @returns {Promise} - Created draw
 */
export const createDraw = async (drawData) => {
  const response = await api.post('/draws', drawData)

  return {
    success: true,
    data: response
  }
}

/**
 * Update draw
 * @param {number} id - Draw ID
 * @param {Object} drawData - Updated draw data
 * @returns {Promise} - Updated draw
 */
export const updateDraw = async (id, drawData) => {
  const response = await api.put(`/draws/${id}`, drawData)

  return {
    success: true,
    data: response
  }
}

/**
 * Delete draw
 * @param {number} id - Draw ID
 * @returns {Promise} - Success status
 */
export const deleteDraw = async (id) => {
  await api.delete(`/draws/${id}`)

  return {
    success: true
  }
}

/**
 * Get bet types available for a specific draw
 * @param {number} drawId - Draw ID
 * @returns {Promise} - Bet types with their prize types
 */
export const getBetTypesByDraw = async (drawId) => {
  const response = await api.get(`/draws/${drawId}/bet-types`)

  return {
    success: true,
    data: response
  }
}
