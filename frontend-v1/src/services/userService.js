/**
 * User Management Service
 * Handles all user-related API calls
 */

import api from './api'
import { API_URL, API_ENDPOINTS, buildApiUrl } from '../config/apiConfig'

/**
 * Get all users with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.roleId - Filter by role ID
 * @param {number} params.zoneId - Filter by zone ID
 * @returns {Promise} - Users list with pagination
 */
export const getAllUsers = async (params = {}) => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page)
  if (params.pageSize) queryParams.append('pageSize', params.pageSize)
  if (params.search) queryParams.append('search', params.search)
  if (params.roleId) queryParams.append('roleId', params.roleId)
  if (params.zoneId) queryParams.append('zoneId', params.zoneId)

  const query = queryParams.toString()
  const response = await api.get(`/users${query ? `?${query}` : ''}`)

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
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise} - User details wrapped in success response
 */
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`)

  // Wrap API response in success format for consistency
  return {
    success: true,
    data: response
  }
}

/**
 * Get user permissions
 * @param {number} userId - User ID
 * @returns {Promise} - User permissions
 */
export const getUserPermissions = async (userId) => {
  return api.get(`/users/${userId}/permissions`)
}

/**
 * Get users by role
 * @param {number} roleId - Role ID
 * @returns {Promise} - Users list
 */
export const getUsersByRole = async (roleId) => {
  return api.get(`/users/by-role/${roleId}`)
}

/**
 * Get users by zone
 * @param {number} zoneId - Zone ID
 * @returns {Promise} - Users list
 */
export const getUsersByZone = async (zoneId) => {
  return api.get(`/users/by-zone/${zoneId}`)
}

/**
 * Get users by branch
 * @param {number} branchId - Branch ID
 * @returns {Promise} - Users list
 */
export const getUsersByBranch = async (branchId) => {
  return api.get(`/users/by-branch/${branchId}`)
}

/**
 * Search users
 * @param {string} query - Search query
 * @returns {Promise} - Search results
 */
export const searchUsers = async (query) => {
  return api.get(`/users/search?query=${encodeURIComponent(query)}`)
}

/**
 * Create new user with permissions
 * According to API documentation: POST /api/users/with-permissions
 * @param {Object} userData - User data
 * @param {string} userData.username - Username (required)
 * @param {string} userData.password - Password (required - min 6 chars)
 * @param {string} userData.fullName - Full name (optional)
 * @param {string} userData.email - Email (optional)
 * @param {string} userData.phone - Phone number (optional)
 * @param {number} userData.roleId - Role ID (optional - auto-assigns if not provided)
 * @param {number} userData.zoneId - Zone ID (optional)
 * @param {number} userData.branchId - Branch ID (optional)
 * @param {number} userData.commissionRate - Commission rate (optional)
 * @param {boolean} userData.isActive - Active status (optional - default: true)
 * @param {Array<number>} userData.permissionIds - Permission IDs array (optional)
 * @returns {Promise} - Created user wrapped in success response
 */
export const createUser = async (userData) => {
  const response = await api.post('/users/with-permissions', userData)

  // Wrap API response in success format for consistency
  return {
    success: true,
    data: response
  }
}

/**
 * Update user
 * @param {number} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise} - Updated user
 */
export const updateUser = async (userId, userData) => {
  return api.put(`/users/${userId}`, userData)
}

/**
 * Update user permissions
 * @param {number} userId - User ID
 * @param {Object} permissionData - Permission data to update
 * @param {Array<number>} permissionData.permissionIds - Array of permission IDs
 * @returns {Promise} - Updated user permissions
 */
export const updateUserPermissions = async (userId, permissionData) => {
  return api.put(`/users/${userId}/permissions`, permissionData)
}

/**
 * Update user completely (permissions, zone, branch, role)
 * @param {number} userId - User ID
 * @param {Object} userData - Complete user data to update
 * @param {Array<number>} userData.permissionIds - Array of permission IDs
 * @param {number} userData.zoneId - Zone ID (optional)
 * @param {number} userData.branchId - Branch ID (optional)
 * @param {number} userData.roleId - Role ID (optional)
 * @returns {Promise} - Updated user
 */

/**
 * Change user password
 * @param {number} userId - User ID
 * @param {Object} passwordData - Password data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise} - Result
 */
export const changePassword = async (userId, passwordData) => {
  return api.put(`/users/${userId}/password`, passwordData)
}

/**
 * Deactivate user
 * @param {number} userId - User ID
 * @returns {Promise} - Result
 */
export const deactivateUser = async (userId) => {
  return api.delete(`/users/${userId}`)
}

/**
 * Activate user (reactivate a deactivated user)
 * @param {number} userId - User ID
 * @returns {Promise} - Result
 */
export const activateUser = async (userId) => {
  return api.put(`/users/${userId}`, { isActive: true })
}

/**
 * Validate username availability
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} - True if available
 */
export const checkUsernameAvailability = async (username) => {
  try {
    const response = await api.get(`/users/search?query=${encodeURIComponent(username)}`)
    // If we get results with exact match, username is taken
    const exactMatch = response.data?.some(
      user => user.username.toLowerCase() === username.toLowerCase()
    )
    return !exactMatch
  } catch (error) {
    console.error('Error checking username:', error)
    return false
  }
}

/**
 * Update user with complete data (permissions and zones)
 * @param {number} userId - User ID
 * @param {Object} userData - Complete user data
 * @returns {Promise} - Updated user
 */
export const updateUserComplete = async (userId, userData) => {
  const response = await api.put(`/users/${userId}/complete`, userData)
  return {
    success: true,
    data: response || { userId }
  }
}

export default {
  getAllUsers,
  getUserById,
  getUserPermissions,
  getUsersByRole,
  getUsersByZone,
  getUsersByBranch,
  searchUsers,
  createUser,
  updateUser,
  updateUserComplete,
  changePassword,
  deactivateUser,
  activateUser,
  checkUsernameAvailability
}

