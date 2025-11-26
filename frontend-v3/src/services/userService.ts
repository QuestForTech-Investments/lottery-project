/**
 * User Management Service
 * Handles all user-related API calls
 * Port from frontend-v2 with TypeScript typing
 */

import api from './api/client';

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
}

/**
 * User data interface
 */
export interface User {
  userId: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  roleName?: string;
  zoneId?: number;
  zoneName?: string;
  bettingPoolId?: number;
  bettingPoolName?: string;
  commissionRate?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User creation data
 */
export interface CreateUserData {
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

/**
 * User update data
 */
export interface UpdateUserData {
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

/**
 * Password change data
 */
export interface PasswordChangeData {
  currentPassword?: string;
  newPassword: string;
}

/**
 * Query parameters for getAllUsers
 */
export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: number;
  zoneId?: number;
}

/**
 * Get all users with pagination and filters
 * @param params - Query parameters
 * @returns Users list with pagination
 */
export const getAllUsers = async (params: GetUsersParams = {}): Promise<ApiResponse<User[]>> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.roleId) queryParams.append('roleId', params.roleId.toString());
  if (params.zoneId) queryParams.append('zoneId', params.zoneId.toString());

  const query = queryParams.toString();
  const response = await api.get<any>(`/users${query ? `?${query}` : ''}`);

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
        hasNextPage: response.hasNextPage,
      },
    };
  }

  return response;
};

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User details wrapped in success response
 */
export const getUserById = async (userId: number): Promise<ApiResponse<User>> => {
  const response = await api.get<User>(`/users/${userId}`);

  // Wrap API response in success format for consistency
  return {
    success: true,
    data: response,
  };
};

/**
 * Get user permissions
 * @param userId - User ID
 * @returns User permissions wrapped in success response
 */
export const getUserPermissions = async (userId: number): Promise<ApiResponse<number[]>> => {
  const response = await api.get<number[]>(`/users/${userId}/permissions`);

  // Wrap API response in success format for consistency
  return {
    success: true,
    data: response,
  };
};

/**
 * Get users by role
 * @param roleId - Role ID
 * @returns Users list
 */
export const getUsersByRole = async (roleId: number): Promise<User[]> => {
  return api.get<User[]>(`/users/by-role/${roleId}`);
};

/**
 * Get users by zone
 * @param zoneId - Zone ID
 * @returns Users list
 */
export const getUsersByZone = async (zoneId: number): Promise<User[]> => {
  return api.get<User[]>(`/users/by-zone/${zoneId}`);
};

/**
 * Get users by bettingPool
 * @param bettingPoolId - Branch ID
 * @returns Users list
 */
export const getUsersByBranch = async (bettingPoolId: number): Promise<User[]> => {
  return api.get<User[]>(`/users/by-bettingPool/${bettingPoolId}`);
};

/**
 * Search users
 * @param query - Search query
 * @returns Search results
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  return api.get<User[]>(`/users/search?query=${encodeURIComponent(query)}`);
};

/**
 * Create new user with permissions
 * According to API documentation: POST /api/users/with-permissions
 * @param userData - User data
 * @returns Created user
 */
export const createUser = async (userData: CreateUserData): Promise<ApiResponse<User>> => {
  const response = await api.post<User>('/users/with-permissions', userData);

  // Wrap API response in success format for consistency
  return {
    success: true,
    data: response,
  };
};

/**
 * Update user
 * @param userId - User ID
 * @param userData - User data to update
 * @returns Updated user
 */
export const updateUser = async (userId: number, userData: UpdateUserData): Promise<User> => {
  return api.put<User>(`/users/${userId}`, userData);
};

/**
 * Update user permissions
 * @param userId - User ID
 * @param permissionData - Permission data to update
 * @returns Updated user permissions
 */
export const updateUserPermissions = async (
  userId: number,
  permissionData: { permissionIds: number[] }
): Promise<void> => {
  return api.put<void>(`/users/${userId}/permissions`, permissionData);
};

/**
 * Change user password
 * @param userId - User ID
 * @param passwordData - Password data
 * @returns Result
 */
export const changePassword = async (
  userId: number,
  passwordData: PasswordChangeData
): Promise<void> => {
  return api.put<void>(`/users/${userId}/password`, passwordData);
};

/**
 * Admin reset user password (no current password required)
 * @param userId - User ID
 * @param passwordData - Password data
 * @returns Result
 */
export const adminResetPassword = async (
  userId: number,
  passwordData: { newPassword: string }
): Promise<void> => {
  return api.put<void>(`/users/${userId}/password/admin-reset`, passwordData);
};

/**
 * Deactivate user
 * @param userId - User ID
 * @returns Result
 */
export const deactivateUser = async (userId: number): Promise<void> => {
  return api.delete<void>(`/users/${userId}`);
};

/**
 * Activate user (reactivate a deactivated user)
 * @param userId - User ID
 * @returns Result
 */
export const activateUser = async (userId: number): Promise<User> => {
  return api.put<User>(`/users/${userId}`, { isActive: true });
};

/**
 * Validate username availability
 * @param username - Username to check
 * @returns True if available
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const response = await api.get<{ data?: User[] }>(`/users/search?query=${encodeURIComponent(username)}`);
    // If we get results with exact match, username is taken
    const exactMatch = response.data?.some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    return !exactMatch;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

/**
 * Update user with complete data (permissions and zones)
 * @param userId - User ID
 * @param userData - Complete user data
 * @returns Updated user
 */
export const updateUserComplete = async (
  userId: number,
  userData: UpdateUserData
): Promise<ApiResponse<User>> => {
  const response = await api.put<User>(`/users/${userId}/complete`, userData);
  return {
    success: true,
    data: response || ({ userId } as User),
  };
};

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
  updateUserPermissions,
  changePassword,
  adminResetPassword,
  deactivateUser,
  activateUser,
  checkUsernameAvailability,
};
