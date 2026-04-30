import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  VpnKey,
  Close as CloseIcon,
} from '@mui/icons-material'

interface Props {
  isOpen: boolean
  username: string
  password: string
  onClose: () => void
}

/**
 * One-time dialog shown to admins after generating a temp password.
 * The password cannot be recovered after closing — admin must communicate it to the user.
 */
export default function TempCredentialDialog({ isOpen, username, password, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#e8f5e9', color: '#2e7d32' }}>
        <VpnKey />
        <Typography component="span" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', flex: 1 }}>
          Clave temporal generada
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#2e7d32' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
          Comunícale esta clave al usuario. <b>No se mostrará de nuevo</b>. El usuario deberá cambiarla al iniciar sesión.
        </Alert>

        <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
          Usuario:
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
          {username}
        </Typography>

        <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
          Clave temporal:
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#f5f5f5',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: 2,
              color: '#2c2c2c',
            }}
          >
            {password}
          </Typography>
          <Tooltip title={copied ? 'Copiado' : 'Copiar al portapapeles'}>
            <IconButton onClick={copy} size="small">
              {copied ? <CheckIcon sx={{ color: '#2e7d32' }} /> : <CopyIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
          fullWidth
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
            textTransform: 'none',
          }}
        >
          Listo
        </Button>
      </DialogActions>
    </Dialog>
  )
}
