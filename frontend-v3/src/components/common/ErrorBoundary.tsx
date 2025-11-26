import { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Button, Container, Paper, Typography } from '@mui/material'
import { ErrorOutline, Refresh } from '@mui/icons-material'
import * as logger from '@/utils/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Production behavior:
 * - Shows user-friendly error UI
 * - Logs error details to logger (errors logged in production)
 * - Provides recovery options (reload, go home)
 *
 * Development behavior:
 * - Shows detailed error stack trace
 * - Full error information for debugging
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to our centralized logger
    logger.error('ERROR_BOUNDARY', 'Uncaught error in component tree', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      stack: error.stack,
    })

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // If custom fallback provided, use it
      if (fallback) {
        return fallback
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderLeft: '4px solid #f44336',
              backgroundColor: '#fff5f5',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <ErrorOutline sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
              <Typography variant="h4" color="error" gutterBottom>
                Algo salió mal
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Lo sentimos, ha ocurrido un error inesperado en la aplicación.
              </Typography>
            </Box>

            {/* Development: Show detailed error */}
            {import.meta.env.DEV && error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Error Details (DEV only):
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    mb: 1,
                  }}
                >
                  {error.toString()}
                </Typography>
                {errorInfo && (
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: '#666',
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}
                  >
                    {errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}

            {/* Production: Show generic message */}
            {!import.meta.env.DEV && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Se ha registrado el error y nuestro equipo está trabajando para solucionarlo.
                  Por favor, intenta recargar la página o volver al inicio.
                </Typography>
              </Box>
            )}

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                sx={{
                  bgcolor: '#51cbce',
                  '&:hover': { bgcolor: '#45b8bb' },
                  textTransform: 'none',
                }}
              >
                Recargar página
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleGoHome}
                sx={{
                  borderColor: '#51cbce',
                  color: '#51cbce',
                  '&:hover': {
                    borderColor: '#45b8bb',
                    bgcolor: 'rgba(81, 203, 206, 0.04)',
                  },
                  textTransform: 'none',
                }}
              >
                Ir al inicio
              </Button>
              {import.meta.env.DEV && (
                <Button
                  variant="text"
                  onClick={this.handleReset}
                  sx={{
                    color: '#666',
                    textTransform: 'none',
                  }}
                >
                  Reintentar (DEV)
                </Button>
              )}
            </Box>
          </Paper>
        </Container>
      )
    }

    return children
  }
}

export default ErrorBoundary
