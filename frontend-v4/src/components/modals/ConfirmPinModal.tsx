import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
  CircularProgress,
} from '@mui/material'
import { Lock as LockIcon, Pin as PinIcon } from '@mui/icons-material'
import * as userService from '@services/userService'
import * as authService from '@services/authService'
import { handleApiError } from '@utils/index'

interface Props {
  isOpen: boolean
  title?: string
  description?: string
  onConfirmed: () => void
  onCancel: () => void
}

type Mode = 'verify' | 'setup'

/**
 * PIN gate for sensitive admin actions.
 * - If the admin already has a PIN: prompt for verification.
 * - If the admin does NOT have a PIN yet: switch into setup mode and let
 *   them create it inline. Successful setup also unlocks the action.
 */
export default function ConfirmPinModal({
  isOpen,
  title = 'Confirma con tu PIN',
  description = 'Esta acción requiere confirmación con tu PIN de 4 dígitos.',
  onConfirmed,
  onCancel,
}: Props) {
  const initialMode: Mode = authService.getCurrentUser()?.mustSetPin ? 'setup' : 'verify'
  const [mode, setMode] = useState<Mode>(initialMode)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setMode(authService.getCurrentUser()?.mustSetPin ? 'setup' : 'verify')
      setPin('')
      setConfirmPin('')
      setError(null)
    }
  }, [isOpen])

  const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 4)
  const isValidPin = /^\d{4}$/.test(pin)
  const matches = pin === confirmPin && confirmPin.length === 4

  const handleVerify = async () => {
    if (!isValidPin) return
    setLoading(true)
    setError(null)
    try {
      const res = await userService.verifyMyPin(pin)
      if (res.valid) {
        onConfirmed()
        return
      }
      // Fallback: server says no PIN even though JWT didn't flag it. Switch to setup.
      if (res.mustSetPin) {
        setMode('setup')
        setConfirmPin('')
        setError(null)
      } else {
        setError('PIN incorrecto')
      }
    } catch (err) {
      setError(handleApiError(err) || 'Error verificando el PIN')
    } finally {
      setLoading(false)
    }
  }

  const handleSetup = async () => {
    if (!isValidPin || !matches) return
    setLoading(true)
    setError(null)
    try {
      await userService.setMyPin(pin)
      onConfirmed()
    } catch (err) {
      setError(handleApiError(err) || 'No se pudo establecer el PIN')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = mode === 'setup' ? handleSetup : handleVerify
  const canSubmit = mode === 'setup' ? (isValidPin && matches && !loading) : (isValidPin && !loading)

  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {mode === 'setup' ? <PinIcon sx={{ color: '#6366f1' }} /> : <LockIcon sx={{ color: '#6366f1' }} />}
        <Typography component="span" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          {mode === 'setup' ? 'Establece tu PIN de seguridad' : title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
          {mode === 'setup'
            ? 'Aún no tienes un PIN configurado. Defínelo ahora para continuar con esta acción.'
            : description}
        </Typography>

        <TextField
          label={mode === 'setup' ? 'Nuevo PIN (4 dígitos)' : 'PIN'}
          type="password"
          value={pin}
          onChange={(e) => setPin(onlyDigits(e.target.value))}
          fullWidth
          autoFocus
          inputProps={{ inputMode: 'numeric', maxLength: 4, pattern: '\\d{4}' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) handleSubmit()
          }}
        />

        {mode === 'setup' && (
          <TextField
            label="Confirmar PIN"
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(onlyDigits(e.target.value))}
            fullWidth
            margin="dense"
            inputProps={{ inputMode: 'numeric', maxLength: 4, pattern: '\\d{4}' }}
            error={confirmPin.length > 0 && !matches}
            helperText={confirmPin.length > 0 && !matches ? 'Los PIN no coinciden' : ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSubmit) handleSubmit()
            }}
            sx={{ mt: 1 }}
          />
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onCancel} sx={{ textTransform: 'none' }} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
            textTransform: 'none',
          }}
        >
          {loading
            ? <CircularProgress size={20} sx={{ color: 'white' }} />
            : mode === 'setup' ? 'Establecer y continuar' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
