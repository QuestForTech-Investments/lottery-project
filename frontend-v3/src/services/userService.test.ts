import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAllUsers,
  getUserById,
  getUserPermissions,
  getUsersByRole,
  getUsersByZone,
  getUsersByBranch,
  searchUsers,
  createUser,
  updateUser,
  updateUserPermissions,
  changePassword,
  adminResetPassword,
  deactivateUser,
  activateUser,
  checkUsernameAvailability,
  updateUserComplete,
  type User,
  type CreateUserData,
  type UpdateUserData,
  type PasswordChangeData,
} from './userService'

// Mock API client
vi.mock('./api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from './api/client'

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUser: User = {
    userId: 1,
    username: 'testuser',
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    roleId: 2,
    roleName: 'Admin',
    zoneId: 1,
    zoneName: 'Zone A',
    bettingPoolId: 1,
    bettingPoolName: 'Pool A',
    commissionRate: 5.5,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  }

  describe('getAllUsers', () => {
    it('should fetch all users with pagination', async () => {
      const mockResponse = {
        items: [mockUser],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await getAllUsers({ page: 1, pageSize: 10 })

      expect(api.get).toHaveBeenCalledWith('/users?page=1&pageSize=10')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockUser])
      expect(result.pagination).toEqual({
        pageNumber: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      })
    })

    it('should build query params correctly with all filters', async () => {
      const mockResponse = { items: [mockUser] }
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      await getAllUsers({
        page: 2,
        pageSize: 20,
        search: 'test',
        roleId: 3,
        zoneId: 5,
      })

      expect(api.get).toHaveBeenCalledWith('/users?page=2&pageSize=20&search=test&roleId=3&zoneId=5')
    })

    it('should handle non-paginated response', async () => {
      const mockResponse = { success: true, data: [mockUser] }
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await getAllUsers()

      expect(result).toEqual(mockResponse)
    })

    it('should work without query parameters', async () => {
      const mockResponse = { items: [mockUser] }
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      await getAllUsers()

      expect(api.get).toHaveBeenCalledWith('/users')
    })
  })

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      vi.mocked(api.get).mockResolvedValue(mockUser)

      const result = await getUserById(1)

      expect(api.get).toHaveBeenCalledWith('/users/1')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
    })

    it('should handle different user IDs', async () => {
      vi.mocked(api.get).mockResolvedValue(mockUser)

      await getUserById(42)

      expect(api.get).toHaveBeenCalledWith('/users/42')
    })
  })

  describe('getUserPermissions', () => {
    it('should fetch user permissions', async () => {
      const mockPermissions = [1, 2, 3, 4, 5]
      vi.mocked(api.get).mockResolvedValue(mockPermissions)

      const result = await getUserPermissions(1)

      expect(api.get).toHaveBeenCalledWith('/users/1/permissions')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPermissions)
    })

    it('should handle empty permissions', async () => {
      vi.mocked(api.get).mockResolvedValue([])

      const result = await getUserPermissions(1)

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })
  })

  describe('getUsersByRole', () => {
    it('should fetch users by role', async () => {
      const mockUsers = [mockUser]
      vi.mocked(api.get).mockResolvedValue(mockUsers)

      const result = await getUsersByRole(2)

      expect(api.get).toHaveBeenCalledWith('/users/by-role/2')
      expect(result).toEqual(mockUsers)
    })
  })

  describe('getUsersByZone', () => {
    it('should fetch users by zone', async () => {
      const mockUsers = [mockUser]
      vi.mocked(api.get).mockResolvedValue(mockUsers)

      const result = await getUsersByZone(1)

      expect(api.get).toHaveBeenCalledWith('/users/by-zone/1')
      expect(result).toEqual(mockUsers)
    })
  })

  describe('getUsersByBranch', () => {
    it('should fetch users by betting pool', async () => {
      const mockUsers = [mockUser]
      vi.mocked(api.get).mockResolvedValue(mockUsers)

      const result = await getUsersByBranch(1)

      expect(api.get).toHaveBeenCalledWith('/users/by-bettingPool/1')
      expect(result).toEqual(mockUsers)
    })
  })

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const mockUsers = [mockUser]
      vi.mocked(api.get).mockResolvedValue(mockUsers)

      const result = await searchUsers('test')

      expect(api.get).toHaveBeenCalledWith('/users/search?query=test')
      expect(result).toEqual(mockUsers)
    })

    it('should encode special characters in search query', async () => {
      vi.mocked(api.get).mockResolvedValue([])

      await searchUsers('test@example.com')

      expect(api.get).toHaveBeenCalledWith('/users/search?query=test%40example.com')
    })
  })

  describe('createUser', () => {
    it('should create new user with all data', async () => {
      const createData: CreateUserData = {
        username: 'newuser',
        password: 'SecurePass123',
        fullName: 'New User',
        email: 'new@example.com',
        phone: '9876543210',
        roleId: 2,
        zoneId: 1,
        bettingPoolId: 1,
        commissionRate: 3.5,
        isActive: true,
        permissionIds: [1, 2, 3],
      }

      vi.mocked(api.post).mockResolvedValue(mockUser)

      const result = await createUser(createData)

      expect(api.post).toHaveBeenCalledWith('/users/with-permissions', createData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
    })

    it('should create user with minimal data', async () => {
      const minimalData: CreateUserData = {
        username: 'minimal',
        password: 'Pass123',
      }

      vi.mocked(api.post).mockResolvedValue(mockUser)

      const result = await createUser(minimalData)

      expect(api.post).toHaveBeenCalledWith('/users/with-permissions', minimalData)
      expect(result.success).toBe(true)
    })
  })

  describe('updateUser', () => {
    it('should update user with full data', async () => {
      const updateData: UpdateUserData = {
        fullName: 'Updated Name',
        email: 'updated@example.com',
        phone: '1111111111',
        roleId: 3,
        zoneId: 2,
        bettingPoolId: 2,
        commissionRate: 7.5,
        isActive: false,
        permissionIds: [4, 5, 6],
      }

      vi.mocked(api.put).mockResolvedValue(mockUser)

      const result = await updateUser(1, updateData)

      expect(api.put).toHaveBeenCalledWith('/users/1', updateData)
      expect(result).toEqual(mockUser)
    })

    it('should update user with partial data', async () => {
      const partialData: UpdateUserData = {
        fullName: 'Partial Update',
      }

      vi.mocked(api.put).mockResolvedValue(mockUser)

      await updateUser(1, partialData)

      expect(api.put).toHaveBeenCalledWith('/users/1', partialData)
    })
  })

  describe('updateUserPermissions', () => {
    it('should update user permissions', async () => {
      const permissionData = { permissionIds: [1, 2, 3, 4] }

      vi.mocked(api.put).mockResolvedValue(undefined)

      await updateUserPermissions(1, permissionData)

      expect(api.put).toHaveBeenCalledWith('/users/1/permissions', permissionData)
    })

    it('should handle empty permissions', async () => {
      const permissionData = { permissionIds: [] }

      vi.mocked(api.put).mockResolvedValue(undefined)

      await updateUserPermissions(1, permissionData)

      expect(api.put).toHaveBeenCalledWith('/users/1/permissions', permissionData)
    })
  })

  describe('changePassword', () => {
    it('should change password with current password', async () => {
      const passwordData: PasswordChangeData = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
      }

      vi.mocked(api.put).mockResolvedValue(undefined)

      await changePassword(1, passwordData)

      expect(api.put).toHaveBeenCalledWith('/users/1/password', passwordData)
    })

    it('should change password without current password (first login)', async () => {
      const passwordData: PasswordChangeData = {
        newPassword: 'NewPass456',
      }

      vi.mocked(api.put).mockResolvedValue(undefined)

      await changePassword(1, passwordData)

      expect(api.put).toHaveBeenCalledWith('/users/1/password', passwordData)
    })
  })

  describe('adminResetPassword', () => {
    it('should reset password as admin', async () => {
      const passwordData = { newPassword: 'AdminResetPass123' }

      vi.mocked(api.put).mockResolvedValue(undefined)

      await adminResetPassword(1, passwordData)

      expect(api.put).toHaveBeenCalledWith('/users/1/password/admin-reset', passwordData)
    })
  })

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined)

      await deactivateUser(1)

      expect(api.delete).toHaveBeenCalledWith('/users/1')
    })

    it('should deactivate different user', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined)

      await deactivateUser(99)

      expect(api.delete).toHaveBeenCalledWith('/users/99')
    })
  })

  describe('activateUser', () => {
    it('should activate user', async () => {
      vi.mocked(api.put).mockResolvedValue(mockUser)

      const result = await activateUser(1)

      expect(api.put).toHaveBeenCalledWith('/users/1', { isActive: true })
      expect(result).toEqual(mockUser)
    })
  })

  describe('checkUsernameAvailability', () => {
    it('should return true for available username', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [] })

      const result = await checkUsernameAvailability('newuser')

      expect(api.get).toHaveBeenCalledWith('/users/search?query=newuser')
      expect(result).toBe(true)
    })

    it('should return false for taken username (exact match)', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [{ ...mockUser, username: 'testuser' }],
      })

      const result = await checkUsernameAvailability('testuser')

      expect(result).toBe(false)
    })

    it('should be case-insensitive', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [{ ...mockUser, username: 'TestUser' }],
      })

      const result = await checkUsernameAvailability('testuser')

      expect(result).toBe(false)
    })

    it('should return true if only partial matches exist', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [{ ...mockUser, username: 'testuser123' }],
      })

      const result = await checkUsernameAvailability('testuser')

      expect(result).toBe(true)
    })

    it('should return false on API error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

      const result = await checkUsernameAvailability('testuser')

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('updateUserComplete', () => {
    it('should update user with complete data', async () => {
      const updateData: UpdateUserData = {
        fullName: 'Complete Update',
        email: 'complete@example.com',
        permissionIds: [1, 2, 3],
      }

      vi.mocked(api.put).mockResolvedValue(mockUser)

      const result = await updateUserComplete(1, updateData)

      expect(api.put).toHaveBeenCalledWith('/users/1/complete', updateData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
    })

    it('should handle null response from API', async () => {
      const updateData: UpdateUserData = { fullName: 'Test' }

      vi.mocked(api.put).mockResolvedValue(null)

      const result = await updateUserComplete(42, updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ userId: 42 })
    })

    it('should handle undefined response from API', async () => {
      const updateData: UpdateUserData = { fullName: 'Test' }

      vi.mocked(api.put).mockResolvedValue(undefined)

      const result = await updateUserComplete(42, updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ userId: 42 })
    })
  })
})
