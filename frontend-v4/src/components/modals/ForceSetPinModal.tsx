import { useState } from 'react'
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
import { Pin as PinIcon } from '@mui/icons-material'
import * as userService from '@services/userService'
import { handleApiError } from '@utils/index'

interface Props {
  isOpen: boolean
  onCompleted: () => void
}

/**
 * Forced 4-digit PIN setup for admin users on first login.
 * Blocking: no close button, no escape, no click-outside.
 */
export default function ForceSetPinModal({ isOpen, onCompleted }: Props) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = /^\d{4}$/.test(pin)
  const matches = pin === confirmPin && confirmPin.length === 4
  const canSubmit = isValid && matches && !loading

  const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 4)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      await userService.setMyPin(pin)
      onCompleted()
    } catch (err) {
      setError(handleApiError(err) || 'No se pudo establecer el PIN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} disableEscapeKeyDown maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#e3f2fd', color: '#1565c0' }}>
        <PinIcon />
        <Typography component="span" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          Establece tu PIN de seguridad
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          Como usuario administrativo, debes definir un PIN de 4 dígitos para confirmar acciones sensibles.
        </Alert>

        <TextField
          label="PIN (4 dígitos)"
          type="password"
          value={pin}
          onChange={(e) => setPin(onlyDigits(e.target.value))}
          fullWidth
          margin="dense"
          autoFocus
          inputProps={{ inputMode: 'numeric', maxLength: 4, pattern: '\\d{4}' }}
        />
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
        />

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          fullWidth
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
            textTransform: 'none',
            py: 1.2,
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Establecer PIN'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
