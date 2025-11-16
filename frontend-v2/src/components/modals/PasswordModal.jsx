import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import * as userService from '@/services/userService';
import { handleApiError } from '@/utils';
import * as logger from '@/utils/logger';

/**
 * PasswordModal Component - Material-UI version
 * Modal for generating and setting temporary or permanent passwords for users
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Close modal handler
 * @param {number} userId - User ID for password reset
 * @param {string} username - Username for display
 */
export default function PasswordModal({ isOpen, onClose, userId, username }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /**
   * Generate random password
   * @param {number} length - Password length
   * @param {boolean} temporary - Whether to generate temporary password (numeric only)
   * @returns {string} - Generated password
   */
  const generateRandomPassword = (length = 12, temporary = false) => {
    if (temporary) {
      // Temporary password: 6-digit number
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Permanent password: Strong password with uppercase, lowercase, numbers and symbols
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const all = uppercase + lowercase + numbers + symbols;

    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  /**
   * Handle temporary password generation
   */
  const handleTemporaryPassword = async () => {
    if (!userId) {
      setError('ID de usuario no disponible');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const newPassword = generateRandomPassword(6, true);
      logger.info('PASSWORD_MODAL', `Generating temporary password for user: ${username} (ID: ${userId})`);

      // Call API to reset password (admin reset - no current password needed)
      await userService.adminResetPassword(userId, {
        newPassword: newPassword
      });

      logger.success('PASSWORD_MODAL', 'Temporary password generated successfully');
      setSuccess(`Contraseña temporal: ${newPassword}`);

      // Close modal after 5 seconds to give time to copy the password
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 5000);
    } catch (err) {
      logger.error('PASSWORD_MODAL', 'Failed to generate temporary password', { error: err.message });
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle permanent password generation
   */
  const handlePermanentPassword = async () => {
    if (!userId) {
      setError('ID de usuario no disponible');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const newPassword = generateRandomPassword(12, false);
      logger.info('PASSWORD_MODAL', `Generating permanent password for user: ${username} (ID: ${userId})`);

      // Call API to reset password (admin reset - no current password needed)
      await userService.adminResetPassword(userId, {
        newPassword: newPassword
      });

      logger.success('PASSWORD_MODAL', 'Permanent password generated successfully');
      setSuccess(`Contraseña permanente: ${newPassword}`);

      // Close modal after 5 seconds to give time to copy the password
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 5000);
    } catch (err) {
      logger.error('PASSWORD_MODAL', 'Failed to generate permanent password', { error: err.message });
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle copy password to clipboard
   */
  const handleCopyPassword = () => {
    if (success) {
      const password = success.split(': ')[1];
      navigator.clipboard.writeText(password);
      logger.info('PASSWORD_MODAL', 'Password copied to clipboard');
    }
  };

  /**
   * Handle modal close with cleanup
   */
  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="password-modal-title"
    >
      <DialogTitle id="password-modal-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span">
            Generar contraseña
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="cerrar"
            disabled={isGenerating}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Username Display */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Nombre de usuario"
            value={username}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />
        </Box>

        {/* Success Message */}
        {success && (
          <Alert
            severity="success"
            icon={false}
            action={
              <Button
                color="success"
                size="small"
                startIcon={<CopyIcon />}
                onClick={handleCopyPassword}
              >
                Copiar
              </Button>
            }
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" fontWeight="bold">
              {success}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Esta ventana se cerrará automáticamente en 5 segundos.
            </Typography>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {isGenerating && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Generando contraseña...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isGenerating}
          color="inherit"
        >
          Cerrar
        </Button>
        <Button
          onClick={handleTemporaryPassword}
          disabled={isGenerating}
          variant="outlined"
          color="error"
          startIcon={<WarningIcon />}
        >
          Contraseña temporal
        </Button>
        <Button
          onClick={handlePermanentPassword}
          disabled={isGenerating}
          variant="contained"
          color="primary"
          startIcon={<WarningIcon />}
        >
          Contraseña permanente
        </Button>
      </DialogActions>
    </Dialog>
  );
}
