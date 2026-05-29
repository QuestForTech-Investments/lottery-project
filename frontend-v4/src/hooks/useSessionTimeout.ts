/**
 * useSessionTimeout Hook
 * Automatically logs out user after period of inactivity
 */

import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import * as logger from '../utils/logger'

interface UseSessionTimeoutOptions {
  /** Timeout in milliseconds (default: 15 minutes) */
  timeoutMs?: number
  /** Events to track as user activity */
  events?: string[]
  /** Callback before logout (optional) */
  onTimeout?: () => void
}

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes
const DEFAULT_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click'
]

/**
 * Hook that monitors user activity and logs out after inactivity timeout
 * @param options - Configuration options
 */
export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    events = DEFAULT_EVENTS,
    onTimeout
  } = options

  const navigate = useNavigate()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Handle session timeout
  const handleTimeout = useCallback(() => {
    logger.warn('SESSION_TIMEOUT', 'Session expired due to inactivity')

    // Call custom callback if provided
    if (onTimeout) {
      onTimeout()
    }

    // Logout and redirect. Use a query param (instead of router state) so the
    // "session expired" alert still appears if the navigation happens via a
    // full-page reload elsewhere — and so all three logout paths share the
    // same signal contract.
    authService.logout()
    navigate('/login?reason=session-expired', { replace: true })
  }, [navigate, onTimeout])

  // Reset the timeout timer
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now()

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // A non-positive timeout means "disabled" — caller passed 0 (or negative)
    // to opt out of the inactivity check entirely.
    if (timeoutMs > 0) {
      timeoutRef.current = setTimeout(handleTimeout, timeoutMs)
    }
  }, [handleTimeout, timeoutMs])

  // Handle user activity
  const handleActivity = useCallback(() => {
    // Only reset if user is authenticated
    if (authService.isAuthenticated()) {
      resetTimeout()
    }
  }, [resetTimeout])

  useEffect(() => {
    // Only set up timeout if user is authenticated
    if (!authService.isAuthenticated()) {
      return
    }

    logger.info('SESSION_TIMEOUT_INIT', `Session timeout initialized: ${timeoutMs / 1000 / 60} minutes`)

    // Initial timeout setup
    resetTimeout()

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [events, handleActivity, resetTimeout, timeoutMs])

  // Return utilities for external use
  return {
    /** Manually reset the timeout (e.g., after API call) */
    resetTimeout,
    /** Get time since last activity in ms */
    getIdleTime: () => Date.now() - lastActivityRef.current,
    /** Get remaining time before timeout in ms */
    getRemainingTime: () => {
      const elapsed = Date.now() - lastActivityRef.current
      return Math.max(0, timeoutMs - elapsed)
    }
  }
}

export default useSessionTimeout
