import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material'
import { WarningAmber } from '@mui/icons-material'

interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  severity?: 'warning' | 'danger' | 'info'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const SEVERITY_COLORS: Record<NonNullable<Props['severity']>, { bg: string; fg: string; btn: string; btnHover: string }> = {
  warning: { bg: '#fff3e0', fg: '#e65100', btn: '#ed6c02', btnHover: '#c95800' },
  danger:  { bg: '#ffebee', fg: '#c62828', btn: '#d32f2f', btnHover: '#b71c1c' },
  info:    { bg: '#e3f2fd', fg: '#1565c0', btn: '#6366f1', btnHover: '#4f46e5' },
}

/**
 * Reusable confirmation dialog. Replaces native window.confirm() for a consistent UX.
 */
export default function ConfirmActionDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  severity = 'warning',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const c = SEVERITY_COLORS[severity]
  return (
    <Dialog
      open={isOpen}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: c.bg, color: c.fg }}>
        <WarningAmber />
        <Typography component="span" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#444' }}>
            {message}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onCancel} disabled={loading} sx={{ textTransform: 'none' }}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            bgcolor: c.btn,
            '&:hover': { bgcolor: c.btnHover },
            textTransform: 'none',
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
