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
} from '@mui/icons-material';
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

/**
 * ChangePasswordModal Component
 * Modal for logged-in user to change their own password
 * Requires current password verification
 */
export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Validate password requirements in real-time
  useEffect(() => {
    setValidation({
      minLength: newPassword.length >= 8,
      hasLetter: /[a-zA-Z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  }, [newPassword]);

  const isPasswordValid = Object.values(validation).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = currentPassword.length > 0 && isPasswordValid && passwordsMatch && !isLoading;

  const handleSubmit = async () => {
    // Get current user
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.id) {
      setError('No se pudo obtener el usuario actual. Por favor, inicie sesión nuevamente.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info('CHANGE_PASSWORD', `Changing password for user ID: ${currentUser.id}`);

      await userService.changePassword(currentUser.id, {
        currentPassword,
        newPassword,
      });

      logger.success('CHANGE_PASSWORD', 'Password changed successfully');
      setSuccess(true);

      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      const error = err as Error;
      logger.error('CHANGE_PASSWORD', 'Failed to change password', { error: error.message });

      // Check for specific error messages
      const errorMessage = handleApiError(err);
      if (errorMessage.toLowerCase().includes('incorrect') || errorMessage.toLowerCase().includes('current')) {
        setError('La contraseña actual es incorrecta');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    setIsLoading(false);
    onClose();
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <ListItem dense sx={{ py: 0 }}>
      <ListItemIcon sx={{ minWidth: 28 }}>
        {valid ? (
          <CheckIcon fontSize="small" color="success" />
        ) : (
          <ClearIcon fontSize="small" color="error" />
        )}
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

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="change-password-modal-title"
    >
      <DialogTitle id="change-password-modal-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span">
            Cambiar contraseña
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="cerrar"
            disabled={isLoading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              ¡Contraseña cambiada exitosamente!
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              Esta ventana se cerrará automáticamente.
            </Typography>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!success && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Current Password */}
            <TextField
              label="Contraseña actual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              autoComplete="current-password"
              error={!!error && error.includes('actual')}
            />

            {/* New Password */}
            <TextField
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              autoComplete="new-password"
              error={newPassword.length > 0 && !isPasswordValid}
            />

            {/* Password Requirements */}
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                Requisitos de contraseña:
              </Typography>
              <List dense disablePadding>
                <ValidationItem valid={validation.minLength} text="Mínimo 8 caracteres" />
                <ValidationItem valid={validation.hasLetter} text="Al menos una letra" />
                <ValidationItem valid={validation.hasNumber} text="Al menos un número" />
                <ValidationItem valid={validation.hasSpecial} text="Al menos un carácter especial (!@#$%^&*)" />
              </List>
            </Box>

            {/* Confirm Password */}
            <TextField
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              autoComplete="new-password"
              error={confirmPassword.length > 0 && !passwordsMatch}
              helperText={
                confirmPassword.length > 0 && !passwordsMatch
                  ? 'Las contraseñas no coinciden'
                  : ''
              }
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          color="inherit"
        >
          {success ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!success && (
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            variant="contained"
            sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
            }}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
