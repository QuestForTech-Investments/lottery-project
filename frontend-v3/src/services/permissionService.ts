/**
 * Permission Management Service
 * Handles all permission-related API calls
 * Port from frontend-v2 with TypeScript typing
 */

import api from './api/client';

/**
 * Permission interface
 */
export interface Permission {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Permission category interface
 */
export interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Get all permissions
 * @param category - Filter by category (optional)
 * @returns Permissions list
 */
export const getAllPermissions = async (category: string | null = null): Promise<Permission[]> => {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return api.get<Permission[]>(`/permissions${query}`);
};

/**
 * Get all permissions (flat list)
 * Correct endpoint according to API documentation
 * @returns All permissions list
 */
export const getAllPermissionsFlat = async (): Promise<Permission[]> => {
  return api.get<Permission[]>('/users/permissions/all');
};

/**
 * Get permission categories (grouped)
 * @returns Categories list with permissions
 */
export const getPermissionCategories = async (): Promise<ApiResponse<PermissionCategory[]>> => {
  // Use the correct endpoint
  const response = await api.get<any>('/permissions/categories');

  // Wrap array response in expected format
  if (Array.isArray(response)) {
    return {
      success: true,
      data: response,
    };
  }

  return response;
};

/**
 * Get permission by ID
 * @param permissionId - Permission ID
 * @returns Permission details
 */
export const getPermissionById = async (permissionId: number): Promise<Permission> => {
  return api.get<Permission>(`/permissions/${permissionId}`);
};

/**
 * Get roles that have a permission
 * @param permissionId - Permission ID
 * @returns Roles list
 */
export const getPermissionRoles = async (permissionId: number): Promise<any[]> => {
  return api.get<any[]>(`/permissions/${permissionId}/roles`);
};

/**
 * Search permissions
 * @param query - Search query
 * @returns Search results
 */
export const searchPermissions = async (query: string): Promise<Permission[]> => {
  return api.get<Permission[]>(`/permissions/search?query=${encodeURIComponent(query)}`);
};

/**
 * Get unassigned permissions for a role
 * @param roleId - Role ID
 * @returns Unassigned permissions list
 */
export const getUnassignedPermissions = async (roleId: number): Promise<Permission[]> => {
  return api.get<Permission[]>(`/permissions/unassigned/${roleId}`);
};

/**
 * Get permissions statistics
 * @returns Permissions statistics
 */
export const getPermissionsStats = async (): Promise<any> => {
  return api.get<any>('/permissions/stats');
};

/**
 * Create permission data
 */
export interface CreatePermissionData {
  permissionCode: string;
  permissionName: string;
  category: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Create new permission
 * @param permissionData - Permission data
 * @returns Created permission
 */
export const createPermission = async (permissionData: CreatePermissionData): Promise<Permission> => {
  return api.post<Permission>('/permissions', permissionData);
};

/**
 * Update permission
 * @param permissionId - Permission ID
 * @param permissionData - Permission data to update
 * @returns Updated permission
 */
export const updatePermission = async (
  permissionId: number,
  permissionData: Partial<CreatePermissionData>
): Promise<Permission> => {
  return api.put<Permission>(`/permissions/${permissionId}`, permissionData);
};

/**
 * Deactivate permission
 * @param permissionId - Permission ID
 * @returns Result
 */
export const deactivatePermission = async (permissionId: number): Promise<void> => {
  return api.delete<void>(`/permissions/${permissionId}`);
};

/**
 * Get active permissions only
 * @returns Active permissions list
 */
export const getActivePermissions = async (): Promise<ApiResponse<Permission[]>> => {
  const response = await getAllPermissions();
  if (Array.isArray(response)) {
    return {
      success: true,
      data: response.filter((permission) => permission.isActive),
    };
  }
  return { success: true, data: response };
};

/**
 * Get permissions grouped by category
 * @returns Permissions grouped by category
 */
export const getPermissionsGroupedByCategory = async (): Promise<ApiResponse<PermissionCategory[]>> => {
  return getPermissionCategories();
};

/**
 * Check if permission exists
 * @param permissionCode - Permission code to check
 * @returns True if exists
 */
export const checkPermissionExists = async (permissionCode: string): Promise<boolean> => {
  try {
    const response = await searchPermissions(permissionCode);
    return response.some(
      (perm) => perm.permissionCode.toLowerCase() === permissionCode.toLowerCase()
    );
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

export default {
  getAllPermissions,
  getAllPermissionsFlat,
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
  checkPermissionExists,
};
