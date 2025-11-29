import { useState, type ErrorInfo } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Collapse,
  Alert,
  Stack,
} from '@mui/material'
import { ErrorOutline, Refresh, Home, ExpandMore, ExpandLess, BugReport } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
  onReset: () => void
  onReload: () => void
}

const ErrorFallback = ({ error, errorInfo, errorCount, onReset, onReload }: ErrorFallbackProps) => {
  const [showDetails, setShowDetails] = useState(false)
  const navigate = useNavigate()
  const { t: _t } = useTranslation()

  const handleGoHome = () => {
    onReset()
    navigate('/dashboard')
  }

  const handleToggleDetails = () => {
    setShowDetails((prev) => !prev)
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Error Icon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 80,
                color: 'error.main',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
          </Box>

          {/* Title */}
          <Typography variant="h4" gutterBottom color="error" fontWeight="bold">
            ¡Oops! Algo salió mal
          </Typography>

          {/* Description */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Lo sentimos, ocurrió un error inesperado. No te preocupes, tus datos están seguros.
          </Typography>

          {/* Error count alert (if multiple errors) */}
          {errorCount > 1 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Este error ha ocurrido {errorCount} veces. Considera recargar la página.
            </Alert>
          )}

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 3 }}
          >
            <Button variant="contained" color="primary" size="large" startIcon={<Refresh />} onClick={onReset}>
              Intentar de nuevo
            </Button>

            <Button variant="outlined" color="primary" size="large" startIcon={<Home />} onClick={handleGoHome}>
              Ir al inicio
            </Button>

            <Button variant="outlined" color="secondary" size="large" startIcon={<Refresh />} onClick={onReload}>
              Recargar página
            </Button>
          </Stack>

          {/* Show/Hide Details Button */}
          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={handleToggleDetails}
            startIcon={<BugReport />}
            endIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
            sx={{ mb: 2 }}
          >
            {showDetails ? 'Ocultar detalles técnicos' : 'Ver detalles técnicos'}
          </Button>

          {/* Error Details (Collapsible) */}
          <Collapse in={showDetails}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'left',
                backgroundColor: 'grey.100',
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="error">
                Error Message:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  mb: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }}
              >
                {error?.toString()}
              </Typography>

              {errorInfo && (
                <>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="error">
                    Component Stack:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                  >
                    {errorInfo.componentStack}
                  </Typography>
                </>
              )}
            </Paper>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              💡 Tip: Captura esta pantalla y envíala al equipo de desarrollo para ayudar a solucionar el problema.
            </Typography>
          </Collapse>

          {/* Additional Help Text */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
            Si el problema persiste, contacta al soporte técnico.
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default ErrorFallback
