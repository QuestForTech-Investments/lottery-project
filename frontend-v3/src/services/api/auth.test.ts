import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { login, logout, getToken, isTokenExpired, isAuthenticated } from './auth'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock API client
vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from './client'

describe('Auth Service', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsImV4cCI6OTk5OTk5OTk5OX0.test',
          user: { userId: 11, username: 'admin' },
        },
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await login('admin', 'password123')

      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'admin',
        password: 'password123',
      })
      expect(result.success).toBe(true)
      expect(result.data?.token).toBeDefined()
      expect(getToken()).toBe(mockResponse.data.token)
    })

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid credentials',
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await login('admin', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(getToken()).toBeNull()
    })

    it('should handle network error', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      const result = await login('admin', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('logout', () => {
    it('should clear token from localStorage', () => {
      localStorageMock.setItem('authToken', 'test-token')
      expect(getToken()).toBe('test-token')

      logout()

      expect(getToken()).toBeNull()
    })

    it('should work even if no token exists', () => {
      expect(getToken()).toBeNull()
      expect(() => logout()).not.toThrow()
      expect(getToken()).toBeNull()
    })
  })

  describe('getToken', () => {
    it('should return token if exists', () => {
      const token = 'test-token-123'
      localStorageMock.setItem('authToken', token)

      expect(getToken()).toBe(token)
    })

    it('should return null if no token', () => {
      expect(getToken()).toBeNull()
    })
  })

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      // Token expires in year 2286 (exp: 9999999999)
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsImV4cCI6OTk5OTk5OTk5OX0.test'

      expect(isTokenExpired(validToken)).toBe(false)
    })

    it('should return true for expired token', () => {
      // Token expired in 1970 (exp: 1)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsImV4cCI6MX0.test'

      expect(isTokenExpired(expiredToken)).toBe(true)
    })

    it('should return true for malformed token', () => {
      expect(isTokenExpired('not-a-jwt')).toBe(true)
      expect(isTokenExpired('malformed.token')).toBe(true)
      expect(isTokenExpired('')).toBe(true)
    })

    it('should return true for token without exp claim', () => {
      // Token without exp field
      const noExpToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSJ9.test'

      expect(isTokenExpired(noExpToken)).toBe(true)
    })
  })

  describe('isAuthenticated', () => {
    it('should return true if valid token exists', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsImV4cCI6OTk5OTk5OTk5OX0.test'
      localStorageMock.setItem('authToken', validToken)

      expect(isAuthenticated()).toBe(true)
    })

    it('should return false if token is expired', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsImV4cCI6MX0.test'
      localStorageMock.setItem('authToken', expiredToken)

      expect(isAuthenticated()).toBe(false)
    })

    it('should return false if no token exists', () => {
      expect(isAuthenticated()).toBe(false)
    })

    it('should return false for malformed token', () => {
      localStorageMock.setItem('authToken', 'invalid-token')

      expect(isAuthenticated()).toBe(false)
    })
  })
})
