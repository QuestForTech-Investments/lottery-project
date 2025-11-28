/**
 * Permission Management Service
 * Handles all permission-related API calls
 */

import api from './api'

// Types - Export for re-use
export interface Permission {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  name?: string; // Alias for permissionName, used in some components
  category?: string;
  description?: string;
  isActive?: boolean;
}

interface PermissionsResponse {
  success: boolean;
  data: Permission[];
}

interface PermissionResponse {
  success: boolean;
  data: Permission;
}

export interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

export interface CategoriesResponse {
  success: boolean;
  data: PermissionCategory[];
}

interface PermissionCreateData {
  permissionCode: string;
  permissionName: string;
  category: string;
  description?: string;
  isActive?: boolean;
}

interface PermissionUpdateData {
  permissionCode?: string;
  permissionName?: string;
  category?: string;
  description?: string;
  isActive?: boolean;
}

interface Role {
  roleId: number;
  name: string;
}

interface PermissionStats {
  totalPermissions: number;
  activePermissions: number;
  categoriesCount: number;
}

/**
 * Get all permissions
 */
export const getAllPermissions = async (category: string | null = null): Promise<Permission[] | PermissionsResponse> => {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return api.get(`/permissions${query}`) as Promise<Permission[] | PermissionsResponse>
}

/**
 * Get all permissions (flat list)
 */
export const getAllPermissionsFlat = async (): Promise<Permission[]> => {
  return api.get('/users/permissions/all') as Promise<Permission[]>
}

/**
 * Get permission categories (grouped)
 */
export const getPermissionCategories = async (): Promise<CategoriesResponse> => {
  const response = await api.get('/permissions/categories') as PermissionCategory[] | CategoriesResponse

  // Wrap array response in expected format
  if (Array.isArray(response)) {
    return {
      success: true,
      data: response
    }
  }

  return response
}

/**
 * Get permission by ID
 */
export const getPermissionById = async (permissionId: number | string): Promise<Permission> => {
  return api.get(`/permissions/${permissionId}`) as Promise<Permission>
}

/**
 * Get roles that have a permission
 */
export const getPermissionRoles = async (permissionId: number | string): Promise<Role[]> => {
  return api.get(`/permissions/${permissionId}/roles`) as Promise<Role[]>
}

/**
 * Search permissions
 */
export const searchPermissions = async (query: string): Promise<Permission[] | { data: Permission[] }> => {
  return api.get(`/permissions/search?query=${encodeURIComponent(query)}`) as Promise<Permission[] | { data: Permission[] }>
}

/**
 * Get unassigned permissions for a role
 */
export const getUnassignedPermissions = async (roleId: number | string): Promise<Permission[]> => {
  return api.get(`/permissions/unassigned/${roleId}`) as Promise<Permission[]>
}

/**
 * Get permissions statistics
 */
export const getPermissionsStats = async (): Promise<PermissionStats> => {
  return api.get('/permissions/stats') as Promise<PermissionStats>
}

/**
 * Create new permission
 */
export const createPermission = async (permissionData: PermissionCreateData): Promise<Permission> => {
  return api.post('/permissions', permissionData) as Promise<Permission>
}

/**
 * Update permission
 */
export const updatePermission = async (permissionId: number | string, permissionData: PermissionUpdateData): Promise<Permission> => {
  return api.put(`/permissions/${permissionId}`, permissionData) as Promise<Permission>
}

/**
 * Deactivate permission
 */
export const deactivatePermission = async (permissionId: number | string): Promise<unknown> => {
  return api.delete(`/permissions/${permissionId}`)
}

/**
 * Get active permissions only
 */
export const getActivePermissions = async (): Promise<PermissionsResponse> => {
  const response = await getAllPermissions() as PermissionsResponse
  if (response.success && response.data) {
    return {
      ...response,
      data: response.data.filter((permission: Permission) => permission.isActive)
    }
  }
  return response
}

/**
 * Get permissions grouped by category
 */
export const getPermissionsGroupedByCategory = async (): Promise<CategoriesResponse> => {
  return getPermissionCategories()
}

/**
 * Check if permission exists
 */
export const checkPermissionExists = async (permissionCode: string): Promise<boolean> => {
  try {
    const response = await searchPermissions(permissionCode) as { data?: Permission[] }
    return response.data?.some(
      (perm: Permission) => perm.permissionCode.toLowerCase() === permissionCode.toLowerCase()
    ) || false
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
