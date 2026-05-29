/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */

import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import * as authService from '@services/authService'
import * as logger from '@utils/logger'

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const location = useLocation()

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated()

  // Check if token is expired
  const token = authService.getToken()
  const isExpired = token ? authService.isTokenExpired(token) : true

  if (!isAuthenticated || isExpired) {
    // Distinguish "session expired" (had a token, JWT is past its exp) from
    // "never logged in" (deep link clicked without a session). Only the first
    // case should surface the "your session expired" warning on the login page.
    const wasLoggedIn = isExpired && !!token
    if (wasLoggedIn) {
      logger.warn('PRIVATE_ROUTE', 'Token expired, redirecting to login')
      authService.logout() // Clear expired token
    } else {
      logger.warn('PRIVATE_ROUTE', 'User not authenticated, redirecting to login')
    }

    // Preserve where the user was headed (e.g. an email deep link to
    // /tickets/plays?drawId=&date=) so login can send them back there.
    const intended = location.pathname + location.search
    const isLoginPath = location.pathname === '/login' || location.pathname === '/'
    const params = new URLSearchParams()
    if (wasLoggedIn) params.set('reason', 'session-expired')
    if (!isLoginPath) params.set('redirect', intended)
    const qs = params.toString()
    const loginUrl = qs ? `/login?${qs}` : '/login'

    return <Navigate to={loginUrl} replace />
  }

  // User is authenticated, render children
  return <>{children}</>
}

export default PrivateRoute
