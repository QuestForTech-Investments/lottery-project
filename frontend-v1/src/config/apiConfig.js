/**
 * API Configuration
 * Configuración centralizada para las URLs de la API
 */

// URL base de la API - puede ser configurada via variable de entorno
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configuración de endpoints
export const API_ENDPOINTS = {
  // Users
  USERS: '/api/users',
  USERS_WITH_PERMISSIONS: '/api/users/with-permissions',
  
  // Branches (Betting Pools)
  BETTING_POOLS: '/api/betting-pools',
  BETTING_POOLS_NEXT_CODE: '/api/betting-pools/next-code',
  
  // Permissions
  PERMISSIONS: '/api/permissions',
  PERMISSION_CATEGORIES: '/api/permissions/categories',
  
  // Zones
  ZONES: '/api/zones',
  
  // Lotteries
  LOTTERIES: '/api/lotteries',
  
  // Authentication
  AUTH: '/api/auth',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout'
};

/**
 * Construir URL completa para un endpoint
 * @param {string} endpoint - Endpoint de la API
 * @returns {string} URL completa
 */
export const buildApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`;
};

/**
 * Configuración de fetch por defecto
 */
export const defaultFetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Configuración de desarrollo
 */
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Log de configuración en desarrollo
if (isDevelopment) {
  console.log('🔧 API Configuration:', {
    API_URL,
    NODE_ENV: import.meta.env.MODE,
    isDevelopment,
    isProduction
  });
}
