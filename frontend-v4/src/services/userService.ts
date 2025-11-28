/**
 * User Management Service
 * Handles all user-related API calls
 */

import api from './api'

// Types
interface UserParams {
  page?: number | string;
  pageSize?: number | string;
  search?: string;
  roleId?: number | string;
  zoneId?: number | string;
}

interface User {
  userId: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  roleName?: string;
  zoneId?: number;
  bettingPoolId?: number;
  commissionRate?: number;
  isActive?: boolean;
}

interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  pagination?: Pagination;
}

interface UserResponse {
  success: boolean;
  data: User;
}

interface Permission {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  category?: string;
}

interface PermissionsResponse {
  success: boolean;
  data: Permission[];
}

interface PaginatedApiResponse {
  items?: User[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  data?: User[];
}

interface UserCreateData {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  zoneId?: number;
  bettingPoolId?: number;
  commissionRate?: number;
  isActive?: boolean;
  permissionIds?: number[];
}

interface UserUpdateData {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  zoneId?: number;
  bettingPoolId?: number;
  commissionRate?: number;
  isActive?: boolean;
  permissionIds?: number[];
  [key: string]: unknown;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface AdminPasswordResetData {
  newPassword: string;
}

interface PermissionUpdateData {
  permissionIds: number[];
}

/**
 * Get all users with pagination and filters
 */
export const getAllUsers = async (params: UserParams = {}): Promise<UsersResponse | PaginatedApiResponse> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', String(params.page))
  if (params.pageSize) queryParams.append('pageSize', String(params.pageSize))
  if (params.search) queryParams.append('search', params.search)
  if (params.roleId) queryParams.append('roleId', String(params.roleId))
  if (params.zoneId) queryParams.append('zoneId', String(params.zoneId))

  const query = queryParams.toString()
  const response = await api.get(`/users${query ? `?${query}` : ''}`) as PaginatedApiResponse

  // Transform paginated response to expected format
  if (response && response.items) {
    return {
      success: true,
      data: response.items,
      pagination: {
        pageNumber: response.pageNumber || 1,
        pageSize: response.pageSize || 20,
        totalCount: response.totalCount || 0,
        totalPages: response.totalPages || 0,
        hasPreviousPage: response.hasPreviousPage || false,
        hasNextPage: response.hasNextPage || false
      }
    }
  }

  return response
}

/**
 * Get user by ID
 */
export const getUserById = async (userId: number | string): Promise<UserResponse> => {
  const response = await api.get(`/users/${userId}`) as User

  // Wrap API response in success format for consistency
  return {
    success: true,
    data: response
  }
}

/**
 * Get user permissions
 */
export const getUserPermissions = async (userId: number | string): Promise<PermissionsResponse> => {
  const response = await api.get(`/users/${userId}/permissions`) as Permission[]

  // Wrap API response in success format for consistency
  return {
    success: true,
    data: response
  }
}

/**
 * Get users by role
 */
export const getUsersByRole = async (roleId: number | string): Promise<User[]> => {
  return api.get(`/users/by-role/${roleId}`) as Promise<User[]>
}

/**
 * Get users by zone
 */
export const getUsersByZone = async (zoneId: number | string): Promise<User[]> => {
  return api.get(`/users/by-zone/${zoneId}`) as Promise<User[]>
}

/**
 * Get users by bettingPool
 */
export const getUsersByBranch = async (bettingPoolId: number | string): Promise<User[]> => {
  return api.get(`/users/by-bettingPool/${bettingPoolId}`) as Promise<User[]>
}

/**
 * Search users
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  return api.get(`/users/search?query=${encodeURIComponent(query)}`) as Promise<User[]>
}

/**
 * Create new user with permissions
 */
export const createUser = async (userData: UserCreateData): Promise<UserResponse> => {
  const response = await api.post('/users/with-permissions', userData) as User

  // Wrap API response in success format for consistency
  return {
    success: true,
    data: response
  }
}

/**
 * Update user
 */
export const updateUser = async (userId: number | string, userData: UserUpdateData): Promise<User> => {
  return api.put(`/users/${userId}`, userData) as Promise<User>
}

/**
 * Update user permissions
 */
export const updateUserPermissions = async (userId: number | string, permissionData: PermissionUpdateData): Promise<unknown> => {
  return api.put(`/users/${userId}/permissions`, permissionData)
}

/**
 * Change user password
 */
export const changePassword = async (userId: number | string, passwordData: PasswordChangeData): Promise<unknown> => {
  return api.put(`/users/${userId}/password`, passwordData)
}

/**
 * Admin reset user password (no current password required)
 */
export const adminResetPassword = async (userId: number | string, passwordData: AdminPasswordResetData): Promise<unknown> => {
  return api.put(`/users/${userId}/password/admin-reset`, passwordData)
}

/**
 * Deactivate user
 */
export const deactivateUser = async (userId: number | string): Promise<unknown> => {
  return api.delete(`/users/${userId}`)
}

/**
 * Activate user (reactivate a deactivated user)
 */
export const activateUser = async (userId: number | string): Promise<unknown> => {
  return api.put(`/users/${userId}`, { isActive: true })
}

/**
 * Validate username availability
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const response = await api.get(`/users/search?query=${encodeURIComponent(username)}`) as PaginatedApiResponse
    // If we get results with exact match, username is taken
    const exactMatch = response.data?.some(
      (user: User) => user.username.toLowerCase() === username.toLowerCase()
    )
    return !exactMatch
  } catch (error) {
    console.error('Error checking username:', error)
    return false
  }
}

/**
 * Update user with complete data (permissions and zones)
 */
export const updateUserComplete = async (userId: number | string, userData: UserUpdateData): Promise<UserResponse> => {
  const response = await api.put(`/users/${userId}/complete`, userData) as User | null
  return {
    success: true,
    data: response || { userId: Number(userId) } as User
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
  adminResetPassword,
  deactivateUser,
  activateUser,
  checkUsernameAvailability
}
