import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Pin as PinIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import * as userService from '@/services/userService';
import * as authService from '@/services/authService';
import { handleApiError } from '@/utils';
import * as logger from '@/utils/logger';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordValidation {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

type Step = 'password' | 'pin' | 'done';

/**
 * Modal for the logged-in user to change their own password.
 * For admin users, after a successful password change it transitions
 * to a PIN change step (security policy: keep both credentials fresh).
 */
export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('password');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // PIN state
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const isAdmin = !authService.isPosUser();

  // Validate password requirements in real-time
  useEffect(() => {
    setValidation({
      minLength: newPassword.length >= 8,
      hasLetter: /[a-zA-Z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  }, [newPassword]);

  // Reset state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('password');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewPin('');
      setConfirmPin('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const isPasswordValid = Object.values(validation).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmitPassword = currentPassword.length > 0 && isPasswordValid && passwordsMatch && !isLoading;

  const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 4);
  const isPinValid = /^\d{4}$/.test(newPin);
  const pinsMatch = newPin === confirmPin && confirmPin.length === 4;
  const canSubmitPin = isPinValid && pinsMatch && !isLoading;

  const handleClose = () => {
    setStep('password');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNewPin('');
    setConfirmPin('');
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmitPassword = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.id) {
      setError(t('modals.changePassword.errors.noCurrentUser'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info('CHANGE_PASSWORD', `Changing password for user ID: ${currentUser.id}`);
      await userService.changePassword(currentUser.id, { currentPassword, newPassword });
      logger.success('CHANGE_PASSWORD', 'Password changed successfully');

      // Admins go to PIN step. POS users finish here.
      if (isAdmin) {
        setStep('pin');
      } else {
        setStep('done');
        setTimeout(() => handleClose(), 2000);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      if (errorMessage.toLowerCase().includes('actual') || errorMessage.toLowerCase().includes('current') || errorMessage.toLowerCase().includes('incorrect')) {
        setError(t('modals.changePassword.errors.currentIncorrect'));
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await userService.setMyPin(newPin);
      setStep('done');
      setTimeout(() => handleClose(), 2000);
    } catch (err) {
      setError(handleApiError(err) || t('modals.changePassword.errors.couldNotSetPin'));
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <ListItem dense sx={{ py: 0 }}>
      <ListItemIcon sx={{ minWidth: 28 }}>
        {valid ? <CheckIcon fontSize="small" color="success" /> : <ClearIcon fontSize="small" color="error" />}
      </ListItemIcon>
      <ListItemText
        primary={text}
        primaryTypographyProps={{
          variant: 'caption',
          color: valid ? 'success.main' : 'text.secondary',
        }}
      />
    </ListItem>
  );

  const titleText =
    step === 'pin' ? t('modals.changePassword.titlePin')
    : step === 'done' ? t('modals.changePassword.titleDone')
    : t('modals.changePassword.title');

  return (
    <Dialog
      open={isOpen}
      onClose={isLoading || step === 'pin' ? undefined : handleClose}
      disableEscapeKeyDown={step === 'pin'}
      maxWidth="sm"
      fullWidth
      aria-labelledby="change-password-modal-title"
    >
      <DialogTitle id="change-password-modal-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {step === 'pin' && <PinIcon sx={{ color: '#6366f1' }} />}
            <Typography variant="h6" component="span">
              {titleText}
            </Typography>
          </Box>
          {step !== 'pin' && (
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              aria-label="cerrar"
              disabled={isLoading}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {step === 'done' && (
          <Alert severity="success">
            <Typography variant="body2" fontWeight="bold">
              {t('modals.changePassword.doneMsg')}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {t('modals.changePassword.autoClose')}
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {step === 'password' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label={t('modals.changePassword.currentPassword')}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              autoComplete="current-password"
              error={!!error && error.includes('actual')}
            />

            <TextField
              label={t('usersAdmin.newPassword')}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              autoComplete="new-password"
              error={newPassword.length > 0 && !isPasswordValid}
            />

            <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                {t('modals.changePassword.requirements')}
              </Typography>
              <List dense disablePadding>
                <ValidationItem valid={validation.minLength} text={t('modals.changePassword.minLength8')} />
                <ValidationItem valid={validation.hasLetter} text={t('modals.changePassword.atLeastLetter')} />
                <ValidationItem valid={validation.hasNumber} text={t('modals.changePassword.atLeastNumber')} />
                <ValidationItem valid={validation.hasSpecial} text={t('modals.changePassword.atLeastSpecial')} />
              </List>
            </Box>

            <TextField
              label={t('usersAdmin.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              autoComplete="new-password"
              error={confirmPassword.length > 0 && !passwordsMatch}
              helperText={confirmPassword.length > 0 && !passwordsMatch ? t('usersAdmin.passwordMustMatch') : ''}
            />
          </Box>
        )}

        {step === 'pin' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="warning">
              {t('modals.changePassword.pinWarning')}
            </Alert>

            <TextField
              label={t('confirmPin.newPinLabel')}
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(onlyDigits(e.target.value))}
              fullWidth
              autoFocus
              disabled={isLoading}
              inputProps={{ inputMode: 'numeric', maxLength: 4, pattern: '\\d{4}' }}
            />

            <TextField
              label={t('confirmPin.confirmPinLabel')}
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(onlyDigits(e.target.value))}
              fullWidth
              disabled={isLoading}
              inputProps={{ inputMode: 'numeric', maxLength: 4, pattern: '\\d{4}' }}
              error={confirmPin.length > 0 && !pinsMatch}
              helperText={confirmPin.length > 0 && !pinsMatch ? t('confirmPin.pinsDontMatch') : ''}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 'password' && (
          <>
            <Button onClick={handleClose} disabled={isLoading} color="inherit">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmitPassword}
              disabled={!canSubmitPassword}
              variant="contained"
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? t('modals.changePassword.changing') : t('modals.changePassword.change')}
            </Button>
          </>
        )}

        {step === 'pin' && (
          <Button
            onClick={handleSubmitPin}
            disabled={!canSubmitPin}
            variant="contained"
            fullWidth
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? t('common.saving') : t('modals.changePassword.savePin')}
          </Button>
        )}

        {step === 'done' && (
          <Button onClick={handleClose} color="inherit">
            {t('common.close')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
