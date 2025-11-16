/**
 * Permission Management Service
 * Handles all permission-related API calls
 */

import api from './api'

/**
 * Get all permissions
 * @param {string} category - Filter by category (optional)
 * @returns {Promise} - Permissions list
 */
export const getAllPermissions = async (category = null) => {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return api.get(`/permissions${query}`)
}

/**
 * Get all permissions (flat list)
 * Correct endpoint according to API documentation
 * @returns {Promise} - All permissions list
 */
export const getAllPermissionsFlat = async () => {
  return api.get('/users/permissions/all')
}

/**
 * Get permission categories (grouped)
 * @returns {Promise} - Categories list with permissions
 */
export const getPermissionCategories = async () => {
  // Use the correct endpoint
  const response = await api.get('/permissions/categories')

  console.log('🟣 PERMISSION SERVICE - Raw response:', response)
  console.log('🟣 PERMISSION SERVICE - Is Array:', Array.isArray(response))
  console.log('🟣 PERMISSION SERVICE - Has success property:', 'success' in response)
  console.log('🟣 PERMISSION SERVICE - Response type:', typeof response)

  // Wrap array response in expected format
  if (Array.isArray(response)) {
    const transformed = {
      success: true,
      data: response
    }
    console.log('🟣 PERMISSION SERVICE - Transformed (array):', transformed)
    return transformed
  }

  // If response already has success and data, return as-is
  if (response && response.success && response.data) {
    console.log('🟣 PERMISSION SERVICE - Already formatted, returning as-is')
    return response
  }

  // Wrap any other response
  const wrapped = {
    success: true,
    data: response
  }
  console.log('🟣 PERMISSION SERVICE - Wrapped response:', wrapped)
  return wrapped
}

/**
 * Get permission by ID
 * @param {number} permissionId - Permission ID
 * @returns {Promise} - Permission details
 */
export const getPermissionById = async (permissionId) => {
  return api.get(`/permissions/${permissionId}`)
}

/**
 * Get roles that have a permission
 * @param {number} permissionId - Permission ID
 * @returns {Promise} - Roles list
 */
export const getPermissionRoles = async (permissionId) => {
  return api.get(`/permissions/${permissionId}/roles`)
}

/**
 * Search permissions
 * @param {string} query - Search query
 * @returns {Promise} - Search results
 */
export const searchPermissions = async (query) => {
  return api.get(`/permissions/search?query=${encodeURIComponent(query)}`)
}

/**
 * Get unassigned permissions for a role
 * @param {number} roleId - Role ID
 * @returns {Promise} - Unassigned permissions list
 */
export const getUnassignedPermissions = async (roleId) => {
  return api.get(`/permissions/unassigned/${roleId}`)
}

/**
 * Get permissions statistics
 * @returns {Promise} - Permissions statistics
 */
export const getPermissionsStats = async () => {
  return api.get('/permissions/stats')
}

/**
 * Create new permission
 * @param {Object} permissionData - Permission data
 * @param {string} permissionData.permissionCode - Permission code (required)
 * @param {string} permissionData.permissionName - Permission name (required)
 * @param {string} permissionData.category - Category (required)
 * @param {string} permissionData.description - Description (optional)
 * @param {boolean} permissionData.isActive - Active status (optional)
 * @returns {Promise} - Created permission
 */
export const createPermission = async (permissionData) => {
  return api.post('/permissions', permissionData)
}

/**
 * Update permission
 * @param {number} permissionId - Permission ID
 * @param {Object} permissionData - Permission data to update
 * @returns {Promise} - Updated permission
 */
export const updatePermission = async (permissionId, permissionData) => {
  return api.put(`/permissions/${permissionId}`, permissionData)
}

/**
 * Deactivate permission
 * @param {number} permissionId - Permission ID
 * @returns {Promise} - Result
 */
export const deactivatePermission = async (permissionId) => {
  return api.delete(`/permissions/${permissionId}`)
}

/**
 * Get active permissions only
 * @returns {Promise} - Active permissions list
 */
export const getActivePermissions = async () => {
  const response = await getAllPermissions()
  if (response.success && response.data) {
    return {
      ...response,
      data: response.data.filter(permission => permission.isActive)
    }
  }
  return response
}

/**
 * Get permissions grouped by category
 * @returns {Promise} - Permissions grouped by category
 */
export const getPermissionsGroupedByCategory = async () => {
  return getPermissionCategories()
}

/**
 * Check if permission exists
 * @param {string} permissionCode - Permission code to check
 * @returns {Promise<boolean>} - True if exists
 */
export const checkPermissionExists = async (permissionCode) => {
  try {
    const response = await searchPermissions(permissionCode)
    return response.data?.some(
      perm => perm.permissionCode.toLowerCase() === permissionCode.toLowerCase()
    )
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

export default {
  getAllPermissions,
  getPermissionCategories,
  getPermissionById,
  getPermissionRoles,
  searchPermissions,
  getUnassignedPermissions,
  getPermissionsStats,
  createPermission,
  updatePermission,
  deactivatePermission,
  getActivePermissions,
  getPermissionsGroupedByCategory,
  checkPermissionExists
}

