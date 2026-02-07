/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Prevents entire app from crashing when a component fails
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import * as logger from '@utils/logger'
import ErrorFallback from '@components/common/ErrorFallback'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  /**
   * Log error details for debugging
   */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Auto-reload on chunk load failures (happens after a new deploy changes file hashes)
    if (
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Importing a module script failed')
    ) {
      const lastReload = sessionStorage.getItem('chunk-reload');
      if (!lastReload || Date.now() - Number(lastReload) > 10000) {
        sessionStorage.setItem('chunk-reload', String(Date.now()));
        window.location.reload();
        return;
      }
    }

    // Log to console
    console.error('[ERROR] ErrorBoundary caught an error:', error, errorInfo)

    // Log to our logging system
    logger.error('ERROR_BOUNDARY', 'Component error caught', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1,
    })

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    })
  }

  /**
   * Reset error boundary state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    // Optional: Navigate to a safe route
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  /**
   * Reload the page (nuclear option)
   */
  handleReload = () => {
    window.location.reload()
  }

  override render() {
    if (this.state.hasError) {
      // Show custom fallback UI if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Use default ErrorFallback component
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorCount={this.state.errorCount}
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      )
    }

    // No error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary
