/**
 * ErrorBoundaryTest Component
 * Use this component to test ErrorBoundary functionality
 *
 * HOW TO TEST:
 * 1. Import this component in any page
 * 2. Click the "Throw Error" button
 * 3. Verify ErrorFallback UI appears
 * 4. Try recovery options (Reset, Go Home, Reload)
 *
 * REMOVE THIS COMPONENT IN PRODUCTION or keep it behind a flag
 */

import { useState } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  Alert,
  Divider
} from '@mui/material'
import {
  BugReport,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material'

const ErrorBoundaryTest = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false)

  // This will throw an error during render
  if (shouldThrowError) {
    throw new Error('🧪 Test Error: This is an intentional error to test ErrorBoundary!')
  }

  const handleThrowError = () => {
    setShouldThrowError(true)
  }

  const handleThrowAsyncError = () => {
    setTimeout(() => {
      throw new Error('🧪 Async Test Error: This is an async error (will not be caught by ErrorBoundary)')
    }, 100)
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        backgroundColor: '#fff3e0',
        border: '2px dashed #ff9800'
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1}>
          <BugReport color="warning" sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight="bold" color="warning.dark">
            Error Boundary Test Component
          </Typography>
        </Box>

        <Alert severity="info" icon={<Warning />}>
          <strong>Este es un componente de prueba.</strong> Úsalo para verificar que ErrorBoundary funciona correctamente.
        </Alert>

        <Divider />

        {/* Test Instructions */}
        <Typography variant="body2" color="text.secondary">
          <strong>Instrucciones:</strong>
          <br />
          1. Click en "Throw Render Error" para simular un error durante el render
          <br />
          2. Verifica que aparece la pantalla de error (ErrorFallback)
          <br />
          3. Prueba las opciones de recuperación (Intentar de nuevo, Ir al inicio, Recargar)
        </Typography>

        {/* Test Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            color="error"
            startIcon={<ErrorIcon />}
            onClick={handleThrowError}
            fullWidth
          >
            Throw Render Error (Will be caught)
          </Button>

          <Button
            variant="outlined"
            color="warning"
            startIcon={<Warning />}
            onClick={handleThrowAsyncError}
            fullWidth
          >
            Throw Async Error (Won't be caught)
          </Button>
        </Stack>

        {/* Notes */}
        <Alert severity="warning" icon={<Warning />}>
          <Typography variant="caption">
            <strong>Nota:</strong> Los errores asíncronos (setTimeout, Promises) NO son capturados por ErrorBoundary.
            Solo errores durante el render lifecycle son capturados.
          </Typography>
        </Alert>

        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          💡 Recuerda remover este componente en producción o ponerlo detrás de un feature flag.
        </Typography>
      </Stack>
    </Paper>
  )
}

export default ErrorBoundaryTest
