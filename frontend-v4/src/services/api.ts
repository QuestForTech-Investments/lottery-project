/**
 * Base API Service
 * Handles all HTTP requests to the backend API
 */

import * as logger from '../utils/logger'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export interface ApiErrorResponse<T = unknown> {
  status: number
  data: T
}

export class ApiError<T = unknown> extends Error {
  response?: ApiErrorResponse<T>
  code?: string
}

export type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | null
  headers?: HeadersInit & Record<string, string>
}

// Log API configuration on load
logger.info('API_CONFIG', `API Base URL: ${API_BASE_URL}`, {
  env: import.meta.env.VITE_API_BASE_URL,
  fallback: 'http://localhost:5000/api'
})

/**
 * Make an API fetch request with base configuration
 */
const apiFetch = async <T = unknown>(endpoint: string, options: ApiFetchOptions = {}): Promise<T | null> => {
  const url = `${API_BASE_URL}${endpoint}`

  const { headers, ...rest } = options
  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  }
  
  const config: RequestInit = {
    ...rest,
    headers: mergedHeaders,
  }

  // Add authentication token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`
  }

  // Log request
  logger.info('API_REQUEST', `${options.method || 'GET'} ${endpoint}`, {
    url,
    method: options.method || 'GET',
    hasBody: !!options.body
  })

  try {
    const response = await fetch(url, config)
    
    // Handle different HTTP status codes
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>
      
      // Log error response
      logger.error('API_ERROR', `${response.status} ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      
      const error = new ApiError(errorData.message as string || `HTTP error! status: ${response.status}`)
      error.response = {
        status: response.status,
        data: errorData,
      }
      throw error
    }

    // Handle 204 No Content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null
    }

    const data = await response.json()
    
    // Log successful response
    logger.success('API_SUCCESS', `${options.method || 'GET'} ${endpoint}`, {
      status: response.status,
      dataReceived: !!data
    })
    
    return data
  } catch (error) {
    // If it's already our formatted error, re-throw it
    if (error instanceof ApiError && error.response) {
      throw error
    }
    
    // Handle network errors (connection refused, server not available, etc.)
    if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
      logger.error('NETWORK_ERROR', `⚠️ No hay conexión con el servidor API`, {
        endpoint,
        baseUrl: API_BASE_URL,
        error: error.message,
        hint: 'Verifica que el API esté corriendo en http://localhost:5000'
      })

      const networkError = new ApiError('Network Error')
      networkError.response = { status: 0, data: {} }
      networkError.code = 'ECONNREFUSED'
      throw networkError
    }
    
    // Re-throw other errors
    logger.error('API_UNKNOWN_ERROR', `Unknown error on ${endpoint}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    console.error('API Error:', error)
    throw error
  }
}

/**
 * Métodos HTTP
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = unknown>(endpoint: string, data?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data ?? {}),
    }),
  put: <T = unknown>(endpoint: string, data?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data ?? {}),
    }),
  patch: <T = unknown>(endpoint: string, data?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data ?? {}),
    }),
  delete: <T = unknown>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
}

export default api
