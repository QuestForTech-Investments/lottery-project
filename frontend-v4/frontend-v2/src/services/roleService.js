/**
 * Role Management Service
 * Handles all role-related API calls
 */

import api from './api'

/**
 * Get all roles
 * @param {boolean} includePermissions - Include permissions in response
 * @returns {Promise} - Roles list
 */
export const getAllRoles = async (includePermissions = false) => {
  const query = includePermissions ? '?includePermissions=true' : ''
  return api.get(`/roles${query}`)
}

/**
 * Get role by ID
 * @param {number} roleId - Role ID
 * @returns {Promise} - Role details
 */
export const getRoleById = async (roleId) => {
  return api.get(`/roles/${roleId}`)
}

/**
 * Get role permissions
 * @param {number} roleId - Role ID
 * @returns {Promise} - Role permissions
 */
export const getRolePermissions = async (roleId) => {
  return api.get(`/roles/${roleId}/permissions`)
}

/**
 * Create new role
 * @param {Object} roleData - Role data
 * @param {string} roleData.name - Role name (required)
 * @param {string} roleData.description - Role description (optional)
 * @param {boolean} roleData.isActive - Active status (optional)
 * @param {Array<number>} roleData.permissionIds - Permission IDs (optional)
 * @returns {Promise} - Created role
 */
export const createRole = async (roleData) => {
  return api.post('/roles', roleData)
}

/**
 * Update role
 * @param {number} roleId - Role ID
 * @param {Object} roleData - Role data to update
 * @returns {Promise} - Updated role
 */
export const updateRole = async (roleId, roleData) => {
  return api.put(`/roles/${roleId}`, roleData)
}

/**
 * Assign permissions to role
 * @param {number} roleId - Role ID
 * @param {Array<number>} permissionIds - Permission IDs to assign
 * @returns {Promise} - Result
 */
export const assignPermissionsToRole = async (roleId, permissionIds) => {
  return api.post(`/roles/${roleId}/permissions`, { permissionIds })
}

/**
 * Remove permission from role
 * @param {number} roleId - Role ID
 * @param {number} permissionId - Permission ID to remove
 * @returns {Promise} - Result
 */
export const removePermissionFromRole = async (roleId, permissionId) => {
  return api.delete(`/roles/${roleId}/permissions/${permissionId}`)
}

/**
 * Deactivate role
 * @param {number} roleId - Role ID
 * @returns {Promise} - Result
 */
export const deactivateRole = async (roleId) => {
  return api.delete(`/roles/${roleId}`)
}

/**
 * Get active roles only
 * @returns {Promise} - Active roles list
 */
export const getActiveRoles = async () => {
  const response = await getAllRoles(false)
  if (response.success && response.data) {
    return {
      ...response,
      data: response.data.filter(role => role.isActive)
    }
  }
  return response
}

/**
 * Get role with full details (permissions and users)
 * @param {number} roleId - Role ID
 * @returns {Promise} - Complete role information
 */
export const getRoleFullDetails = async (roleId) => {
  try {
    const [roleResponse, permissionsResponse] = await Promise.all([
      getRoleById(roleId),
      getRolePermissions(roleId)
    ])
    
    return {
      success: true,
      data: {
        ...roleResponse.data,
        permissions: permissionsResponse.data
      }
    }
  } catch (error) {
    console.error('Error fetching role details:', error)
    throw error
  }
}

export default {
  getAllRoles,
  getRoleById,
  getRolePermissions,
  createRole,
  updateRole,
  assignPermissionsToRole,
  removePermissionFromRole,
  deactivateRole,
  getActiveRoles,
  getRoleFullDetails
}

