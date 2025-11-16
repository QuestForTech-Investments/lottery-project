/**
 * Base API Service
 * Handles all HTTP requests to the backend API
 */

import * as logger from '../utils/logger'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Log API configuration on load
logger.info('API_CONFIG', `API Base URL: ${API_BASE_URL}`, {
  env: import.meta.env.VITE_API_BASE_URL,
  fallback: '/api'
})

/**
 * Make an API fetch request with base configuration
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} - API response
 */
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add authentication token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Log request
  logger.info('API_REQUEST', `${options.method || 'GET'} ${endpoint}`, {
    url,
    method: options.method || 'GET',
    hasBody: !!options.body
  })

  try {
    const response = await fetch(url, config)

    // 🚀 CODE VERSION: 2025-10-24-12:40 🚀
    if (endpoint === '/zones') {
      console.log('🚀 API.JS VERSION 2.0 - Zones endpoint called')
      console.log('🚀 Full URL:', url)
      console.log('🚀 Has token:', !!config.headers.Authorization)
    }

    // Handle different HTTP status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Log error response
      logger.error('API_ERROR', `${response.status} ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`)
      error.response = {
        status: response.status,
        data: errorData
      }
      throw error
    }

    // Handle 204 No Content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null
    }

    const data = await response.json()

    // 🚀 DEBUG: Log zones response
    if (endpoint === '/zones' || endpoint.startsWith('/zones')) {
      console.log('🚀 ZONES API RESPONSE DATA:', data)
      console.log('🚀 Has items:', !!data.items)
      console.log('🚀 Items count:', data.items?.length)
    }

    // 🟣 DEBUG: Log permissions response
    if (endpoint === '/permissions/categories' || endpoint.startsWith('/permissions')) {
      console.log('🟣 PERMISSIONS API RESPONSE DATA:', data)
      console.log('🟣 Response is Array:', Array.isArray(data))
      console.log('🟣 Response type:', typeof data)
      console.log('🟣 Response keys:', Object.keys(data || {}))
    }

    // Log successful response
    logger.success('API_SUCCESS', `${options.method || 'GET'} ${endpoint}`, {
      status: response.status,
      dataReceived: !!data
    })

    return data
  } catch (error) {
    // If it's already our formatted error, re-throw it
    if (error.response) {
      throw error
    }
    
    // Handle network errors (connection refused, server not available, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      logger.error('NETWORK_ERROR', `⚠️ No hay conexión con el servidor API`, {
        endpoint,
        baseUrl: API_BASE_URL,
        error: error.message,
        hint: 'Verifica que el API esté corriendo en http://localhost:5000'
      })

      const networkError = new Error('Network Error')
      networkError.response = { status: 0, data: {} }
      networkError.code = 'ECONNREFUSED'
      throw networkError
    }
    
    // Re-throw other errors
    logger.error('API_UNKNOWN_ERROR', `Unknown error on ${endpoint}`, {
      error: error.message,
      stack: error.stack
    })
    console.error('API Error:', error)
    throw error
  }
}

/**
 * Métodos HTTP
 */
export const api = {
  get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (endpoint, data, options = {}) => apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  patch: (endpoint, data, options = {}) => apiFetch(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  delete: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
}

export default api

