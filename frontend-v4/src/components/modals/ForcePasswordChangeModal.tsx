import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Check as CheckIcon,
  Clear as ClearIcon,
  LockReset,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import * as userService from '@services/userService'
import * as authService from '@services/authService'
import { handleApiError } from '@utils/index'

interface Props {
  isOpen: boolean
  isPos: boolean
  onCompleted: () => void
}

/**
 * Forced password change after login when must_change_password flag is set.
 * Blocking: no close button, no escape, no click-outside.
 */
export default function ForcePasswordChangeModal({ isOpen, isPos, onCompleted }: Props) {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validation = useMemo(() => {
    if (isPos) {
      return {
        minLength: { ok: newPassword.length >= 6, label: t('modals.forcePassword.minLength6') },
      }
    }
    return {
      minLength: { ok: newPassword.length >= 7, label: t('modals.forcePassword.minLength7') },
      hasLetter: { ok: /[a-zA-Z]/.test(newPassword), label: t('modals.forcePassword.atLeastOneLetter') },
      hasNumber: { ok: /\d/.test(newPassword), label: t('modals.forcePassword.atLeastOneNumber') },
    }
  }, [newPassword, isPos, t])

  const isValid = Object.values(validation).every((r) => r.ok)
  const matches = newPassword === confirmPassword && confirmPassword.length > 0
  const canSubmit = currentPassword.length > 0 && isValid && matches && !loading

  const handleSubmit = async () => {
    const me = authService.getCurrentUser()
    if (!me?.id) {
      setError(t('modals.forcePassword.invalidSession'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      await userService.changePassword(me.id, { currentPassword, newPassword })
      onCompleted()
    } catch (err) {
      const msg = handleApiError(err)
      setError(msg || t('modals.forcePassword.couldNotChange'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff3e0', color: '#e65100' }}>
        <LockReset />
        <Typography component="span" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          {t('modals.forcePassword.title')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          {t('modals.forcePassword.info')}
        </Alert>

        <TextField
          label={t('modals.forcePassword.currentPasswordLabel')}
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          fullWidth
          margin="dense"
          autoFocus
        />
        <TextField
          label={t('usersAdmin.newPassword')}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          margin="dense"
        />
        <TextField
          label={t('usersAdmin.confirmPassword')}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          margin="dense"
          error={confirmPassword.length > 0 && !matches}
          helperText={confirmPassword.length > 0 && !matches ? t('usersAdmin.passwordMustMatch') : ''}
        />

        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" sx={{ mb: 0.5, color: '#666' }}>
            {t('modals.forcePassword.requirements')}
          </Typography>
          <List dense disablePadding>
            {Object.values(validation).map((rule, i) => (
              <ListItem key={i} disablePadding sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {rule.ok ? (
                    <CheckIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
                  ) : (
                    <ClearIcon sx={{ color: '#bbb', fontSize: 18 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={rule.label}
                  primaryTypographyProps={{ fontSize: 13, color: rule.ok ? '#2e7d32' : '#888' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

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
          {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : t('modals.forcePassword.changePassword')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
