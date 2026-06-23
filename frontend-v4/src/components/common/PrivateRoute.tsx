/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */

import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import * as authService from '@services/authService'
import * as logger from '@utils/logger'

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const location = useLocation()

  // React to mid-session token swaps. Another tab (or a stray script) can
  // overwrite localStorage.authToken — if the replacement belongs to a POS
  // user we have to bounce them out of the admin shell. We bump a counter
  // on every 'storage' event so this component re-runs its checks.
  const [storageTick, setStorageTick] = useState(0)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === null) {
        setStorageTick((t) => t + 1)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated()

  // Check if token is expired
  const token = authService.getToken()
  const isExpired = token ? authService.isTokenExpired(token) : true

  // Admin shell is for non-POS users only. If the active token belongs to a
  // POS user (e.g. swapped in from a punto-de-venta tab), we have to log
  // them out of the admin context and show the "not-admin" message — the
  // POS shell lives at a different host.
  const isPosToken = !isExpired && !!token && authService.isPosUser()

  if (!isAuthenticated || isExpired || isPosToken) {
    // Distinguish "session expired" (had a token, JWT is past its exp) from
    // "never logged in" (deep link clicked without a session). Only the first
    // case should surface the "your session expired" warning on the login page.
    const wasLoggedIn = isExpired && !!token
    if (isPosToken) {
      logger.warn('PRIVATE_ROUTE', 'POS token detected in admin shell, logging out')
      authService.logout()
    } else if (wasLoggedIn) {
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
    if (isPosToken) params.set('reason', 'not-admin')
    else if (wasLoggedIn) params.set('reason', 'session-expired')
    if (!isLoginPath) params.set('redirect', intended)
    const qs = params.toString()
    const loginUrl = qs ? `/login?${qs}` : '/login'

    return <Navigate to={loginUrl} replace />
  }

  // Track storageTick to satisfy the linter — actual reactivity is from the
  // re-render the setter triggers, the value itself is intentionally unused.
  void storageTick
  // User is authenticated, render children
  return <>{children}</>
}

export default PrivateRoute
