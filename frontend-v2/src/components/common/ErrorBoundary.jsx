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

import React from 'react';
import * as logger from '@utils/logger';
import ErrorFallback from '@components/common/ErrorFallback';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  /**
   * Log error details for debugging
   */
  componentDidCatch(error, errorInfo) {
    // Log to console
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);

    // Log to our logging system
    logger.error('ERROR_BOUNDARY', 'Component error caught', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // Optional: Send to external error tracking service (Sentry, LogRocket, etc.)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  /**
   * Reset error boundary state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Optional: Navigate to a safe route
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  /**
   * Reload the page (nuclear option)
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Show custom fallback UI if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback;
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
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
