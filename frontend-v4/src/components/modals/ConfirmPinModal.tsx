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
import { Lock as LockIcon } from '@mui/icons-material'
import * as userService from '@services/userService'
import { handleApiError } from '@utils/index'

interface Props {
  isOpen: boolean
  title?: string
  description?: string
  onConfirmed: () => void
  onCancel: () => void
}

/**
 * Generic PIN gate for sensitive admin actions.
 * Caller wires this to confirm any sensitive operation by passing onConfirmed.
 */
export default function ConfirmPinModal({
  isOpen,
  title = 'Confirma con tu PIN',
  description = 'Esta acción requiere confirmación con tu PIN de 4 dígitos.',
  onConfirmed,
  onCancel,
}: Props) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setPin('')
      setError(null)
    }
  }, [isOpen])

  const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 4)
  const isValid = /^\d{4}$/.test(pin)

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    setError(null)
    try {
      const res = await userService.verifyMyPin(pin)
      if (res.valid) {
        onConfirmed()
      } else {
        setError(res.mustSetPin ? 'No tienes un PIN configurado' : 'PIN incorrecto')
      }
    } catch (err) {
      setError(handleApiError(err) || 'Error verificando el PIN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LockIcon sx={{ color: '#6366f1' }} />
        <Typography component="span" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
          {description}
        </Typography>
        <TextField
          label="PIN"
          type="password"
          value={pin}
          onChange={(e) => setPin(onlyDigits(e.target.value))}
          fullWidth
          autoFocus
          inputProps={{ inputMode: 'numeric', maxLength: 4, pattern: '\\d{4}' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isValid && !loading) handleSubmit()
          }}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onCancel} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
            textTransform: 'none',
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
