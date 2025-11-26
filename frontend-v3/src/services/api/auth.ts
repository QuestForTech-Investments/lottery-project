/**
 * Authentication Service
 * Handles user authentication (login, register, logout)
 * Cloned from frontend-v2 with TypeScript typing
 */

import api from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  username: string;
  email?: string;
  fullName?: string;
  role?: string | null;
}

export interface User {
  id: string;
  username: string;
}

/**
 * Login user
 * @param username - Username
 * @param password - Password
 * @returns Promise<LoginResponse> - { token, expiresAt, user }
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('[AUTH_LOGIN] Attempting login for user:', username);

    const response = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
    });

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      console.log('[AUTH_LOGIN_SUCCESS] Token stored for user:', username, {
        expiresAt: response.expiresAt,
      });
    }

    return response;
  } catch (error: any) {
    console.error('[AUTH_LOGIN_ERROR] Login failed for user:', username, {
      error: error.message,
      status: error.response?.status,
    });
    throw error;
  }
};

/**
 * Register new user
 * @param userData - User registration data
 * @returns Promise<LoginResponse> - { token, expiresAt, user }
 */
export const register = async (userData: any): Promise<LoginResponse> => {
  try {
    console.log('[AUTH_REGISTER] Attempting registration for:', userData.username);

    const response = await api.post<LoginResponse>('/auth/register', userData);

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      console.log('[AUTH_REGISTER_SUCCESS] Token stored for new user:', userData.username);
    }

    return response;
  } catch (error: any) {
    console.error('[AUTH_REGISTER_ERROR] Registration failed', {
      error: error.message,
      status: error.response?.status,
    });
    throw error;
  }
};

/**
 * Logout user
 * Clears token from localStorage
 */
export const logout = (): void => {
  console.log('[AUTH_LOGOUT] User logging out');
  localStorage.removeItem('authToken');
  console.log('[AUTH_LOGOUT_SUCCESS] Token removed from localStorage');
};

/**
 * Check if user is authenticated
 * @returns boolean - True if token exists
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

/**
 * Get current auth token
 * @returns string | null - Auth token or null
 */
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Decode JWT token (without verification)
 * @param token - JWT token
 * @returns Object | null - Decoded payload or null
 */
export const decodeToken = (token: string): any | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error: any) {
    console.error('[AUTH_DECODE_ERROR] Failed to decode token', { error: error.message });
    return null;
  }
};

/**
 * Check if token is expired
 * @param token - JWT token
 * @returns boolean - True if expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expirationDate = new Date(decoded.exp * 1000);
  const now = new Date();

  return expirationDate < now;
};

/**
 * Get current user from token
 * @returns User | null - User data or null
 */
export const getCurrentUser = (): User | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    console.warn('[AUTH_TOKEN_EXPIRED] Token has expired');
    logout();
    return null;
  }

  const decoded = decodeToken(token);
  return decoded
    ? {
        id: decoded.sub,
        username: decoded.unique_name,
      }
    : null;
};

export default {
  login,
  register,
  logout,
  isAuthenticated,
  getToken,
  decodeToken,
  isTokenExpired,
  getCurrentUser,
};
