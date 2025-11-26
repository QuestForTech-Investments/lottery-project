/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated or token is expired
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, isTokenExpired, logout } from '@/services/api/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = getToken();

  // Check if token exists
  if (!token) {
    console.warn('[PrivateRoute] No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    console.warn('[PrivateRoute] Token expired, clearing session and redirecting to login');
    logout(); // Clear expired token
    return <Navigate to="/login" replace />;
  }

  // User is authenticated with valid token, render the children
  return <>{children}</>;
};

export default PrivateRoute;
