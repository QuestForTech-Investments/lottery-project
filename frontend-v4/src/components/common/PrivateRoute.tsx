/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */

import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import * as authService from '@services/authService'
import * as logger from '@utils/logger'

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated()

  // Check if token is expired
  const token = authService.getToken()
  const isExpired = token ? authService.isTokenExpired(token) : true

  if (!isAuthenticated || isExpired) {
    if (isExpired && token) {
      logger.warn('PRIVATE_ROUTE', 'Token expired, redirecting to login')
      authService.logout() // Clear expired token
    } else {
      logger.warn('PRIVATE_ROUTE', 'User not authenticated, redirecting to login')
    }

    // Redirect to login
    return <Navigate to="/login" replace />
  }

  // User is authenticated, render children
  return <>{children}</>
}

export default PrivateRoute
