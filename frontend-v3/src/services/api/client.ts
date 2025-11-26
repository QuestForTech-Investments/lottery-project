/**
 * Base API Service
 * Handles all HTTP requests to the backend API
 * Cloned from frontend-v2 with TypeScript typing
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Log API configuration on load
console.log('[API_CONFIG] API Base URL:', API_BASE_URL, {
  env: import.meta.env.VITE_API_BASE_URL,
  fallback: '/api',
});

interface ApiFetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Make an API fetch request with base configuration
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @returns Promise - API response data
 */
const apiFetch = async <T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authentication token if available
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  // Log request
  console.log(`[API_REQUEST] ${options.method || 'GET'} ${endpoint}`, {
    url,
    method: options.method || 'GET',
    hasBody: !!options.body,
  });

  try {
    const response = await fetch(url, config);

    // Handle different HTTP status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Log error response
      console.error(`[API_ERROR] ${response.status} ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      const error: any = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      error.response = {
        status: response.status,
        data: errorData,
      };
      throw error;
    }

    // Handle 204 No Content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    const data = await response.json();

    // Log successful response
    console.log(`[API_SUCCESS] ${options.method || 'GET'} ${endpoint}`, {
      status: response.status,
      dataReceived: !!data,
    });

    return data;
  } catch (error: any) {
    // If it's already our formatted error, re-throw it
    if (error.response) {
      throw error;
    }

    // Handle network errors (connection refused, server not available, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('[NETWORK_ERROR] ⚠️ No hay conexión con el servidor API', {
        endpoint,
        baseUrl: API_BASE_URL,
        error: error.message,
        hint: 'Verifica que el API esté corriendo',
      });

      const networkError: any = new Error('Network Error');
      networkError.response = { status: 0, data: {} };
      networkError.code = 'ECONNREFUSED';
      throw networkError;
    }

    // Re-throw other errors
    console.error(`[API_UNKNOWN_ERROR] Unknown error on ${endpoint}`, {
      error: error.message,
      stack: error.stack,
    });
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * HTTP Methods
 */
export const api = {
  get: <T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options: ApiFetchOptions = {}): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options: ApiFetchOptions = {}): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any, options: ApiFetchOptions = {}): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
