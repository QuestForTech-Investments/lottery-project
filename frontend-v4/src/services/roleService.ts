/**
 * Role Management Service
 * Handles all role-related API calls
 */

import api from './api'

// Types
interface Role {
  roleId: number;
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: Permission[];
}

interface Permission {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  category?: string;
}

interface RolesResponse {
  success: boolean;
  data: Role[];
}

interface RoleResponse {
  success: boolean;
  data: Role;
}

interface RoleCreateData {
  name: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
}

interface RoleUpdateData {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
}

interface PermissionAssignData {
  permissionIds: number[];
}

/**
 * Get all roles
 */
export const getAllRoles = async (includePermissions: boolean = false): Promise<Role[] | RolesResponse> => {
  const query = includePermissions ? '?includePermissions=true' : ''
  return api.get(`/roles${query}`) as Promise<Role[] | RolesResponse>
}

/**
 * Get role by ID
 */
export const getRoleById = async (roleId: number | string): Promise<Role | RoleResponse> => {
  return api.get(`/roles/${roleId}`) as Promise<Role | RoleResponse>
}

/**
 * Get role permissions
 */
export const getRolePermissions = async (roleId: number | string): Promise<Permission[] | { data: Permission[] }> => {
  return api.get(`/roles/${roleId}/permissions`) as Promise<Permission[] | { data: Permission[] }>
}

/**
 * Create new role
 */
export const createRole = async (roleData: RoleCreateData): Promise<Role> => {
  return api.post('/roles', roleData) as Promise<Role>
}

/**
 * Update role
 */
export const updateRole = async (roleId: number | string, roleData: RoleUpdateData): Promise<Role> => {
  return api.put(`/roles/${roleId}`, roleData) as Promise<Role>
}

/**
 * Assign permissions to role
 */
export const assignPermissionsToRole = async (roleId: number | string, permissionIds: number[]): Promise<unknown> => {
  return api.post(`/roles/${roleId}/permissions`, { permissionIds } as PermissionAssignData)
}

/**
 * Remove permission from role
 */
export const removePermissionFromRole = async (roleId: number | string, permissionId: number | string): Promise<unknown> => {
  return api.delete(`/roles/${roleId}/permissions/${permissionId}`)
}

/**
 * Deactivate role
 */
export const deactivateRole = async (roleId: number | string): Promise<unknown> => {
  return api.delete(`/roles/${roleId}`)
}

/**
 * Get active roles only
 */
export const getActiveRoles = async (): Promise<RolesResponse> => {
  const response = await getAllRoles(false) as RolesResponse
  if (response.success && response.data) {
    return {
      ...response,
      data: response.data.filter((role: Role) => role.isActive)
    }
  }
  return response
}

/**
 * Get role with full details (permissions and users)
 */
export const getRoleFullDetails = async (roleId: number | string): Promise<RoleResponse> => {
  try {
    const [roleResponse, permissionsResponse] = await Promise.all([
      getRoleById(roleId),
      getRolePermissions(roleId)
    ]) as [Role | RoleResponse, Permission[] | { data: Permission[] }]

    const roleData = 'data' in roleResponse ? roleResponse.data : roleResponse
    const permissionsData = Array.isArray(permissionsResponse)
      ? permissionsResponse
      : permissionsResponse.data

    return {
      success: true,
      data: {
        ...roleData,
        permissions: permissionsData
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
