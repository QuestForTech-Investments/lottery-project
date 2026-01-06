import { memo, type FC, type ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  type ButtonProps,
} from '@mui/material';
import { buttonStyles } from '../../constants';

/**
 * Props for ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message/content */
  message: ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button color */
  confirmColor?: ButtonProps['color'];
  /** Called when confirm is clicked */
  onConfirm: () => void;
  /** Called when cancel is clicked or dialog is closed */
  onCancel: () => void;
  /** Whether confirm action is loading */
  isLoading?: boolean;
  /** Whether this is a destructive action (changes confirm button to red) */
  destructive?: boolean;
}

/**
 * Reusable confirmation dialog
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ConfirmDialog
 *   open={showConfirm}
 *   title="Confirmar acción"
 *   message="¿Está seguro de que desea continuar?"
 *   onConfirm={handleConfirm}
 *   onCancel={() => setShowConfirm(false)}
 * />
 *
 * // Destructive action
 * <ConfirmDialog
 *   open={showDelete}
 *   title="Eliminar registro"
 *   message="Esta acción no se puede deshacer."
 *   confirmText="Eliminar"
 *   destructive
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDelete(false)}
 * />
 * ```
 */
export const ConfirmDialog: FC<ConfirmDialogProps> = memo(({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor,
  onConfirm,
  onCancel,
  isLoading = false,
  destructive = false,
}) => {
  const resolvedConfirmColor = confirmColor || (destructive ? 'error' : 'primary');

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        {typeof message === 'string' ? (
          <DialogContentText id="confirm-dialog-description">
            {message}
          </DialogContentText>
        ) : (
          message
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="outlined"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color={resolvedConfirmColor}
          autoFocus
          sx={!destructive ? buttonStyles.primary : undefined}
        >
          {isLoading ? 'Procesando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;
