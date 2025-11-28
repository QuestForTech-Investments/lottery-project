/**
 * Authentication Service
 * Handles user authentication (login, register, logout)
 */

import api from './api'
import * as logger from '../utils/logger'

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<Object>} - { token, expiresAt, user }
 */
export const login = async (username, password) => {
  try {
    logger.info('AUTH_LOGIN', `Attempting login for user: ${username}`)

    const response = await api.post('/auth/login', {
      username,
      password
    })

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token)
      logger.success('AUTH_LOGIN_SUCCESS', `Token stored for user: ${username}`, {
        expiresAt: response.expiresAt
      })
    }

    return response
  } catch (error) {
    logger.error('AUTH_LOGIN_ERROR', `Login failed for user: ${username}`, {
      error: error.message,
      status: error.response?.status
    })
    throw error
  }
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - { token, expiresAt, user }
 */
export const register = async (userData) => {
  try {
    logger.info('AUTH_REGISTER', `Attempting registration for: ${userData.username}`)

    const response = await api.post('/auth/register', userData)

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token)
      logger.success('AUTH_REGISTER_SUCCESS', `Token stored for new user: ${userData.username}`)
    }

    return response
  } catch (error) {
    logger.error('AUTH_REGISTER_ERROR', `Registration failed`, {
      error: error.message,
      status: error.response?.status
    })
    throw error
  }
}

/**
 * Logout user
 * Clears token from localStorage
 */
export const logout = () => {
  logger.info('AUTH_LOGOUT', 'User logging out')
  localStorage.removeItem('authToken')
  logger.success('AUTH_LOGOUT_SUCCESS', 'Token removed from localStorage')
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken')
  return !!token
}

/**
 * Get current auth token
 * @returns {string|null} - Auth token or null
 */
export const getToken = () => {
  return localStorage.getItem('authToken')
}

/**
 * Decode JWT token (without verification)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null
 */
export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (error) {
    logger.error('AUTH_DECODE_ERROR', 'Failed to decode token', { error: error.message })
    return null
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return true
  }

  const expirationDate = new Date(decoded.exp * 1000)
  const now = new Date()

  return expirationDate < now
}

/**
 * Get current user from token
 * @returns {Object|null} - User data or null
 */
export const getCurrentUser = () => {
  const token = getToken()
  if (!token) {
    return null
  }

  if (isTokenExpired(token)) {
    logger.warn('AUTH_TOKEN_EXPIRED', 'Token has expired')
    logout()
    return null
  }

  const decoded = decodeToken(token)
  return decoded ? {
    id: decoded.sub,
    username: decoded.unique_name,
    // Add more fields as needed from your JWT payload
  } : null
}

export default {
  login,
  register,
  logout,
  isAuthenticated,
  getToken,
  decodeToken,
  isTokenExpired,
  getCurrentUser
}
