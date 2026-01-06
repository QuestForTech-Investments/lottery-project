import { memo, type FC, type ReactNode } from 'react';
import { Box, Typography, Button, type SxProps, type Theme } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Main message */
  message?: string;
  /** Secondary description */
  description?: string;
  /** Custom icon */
  icon?: ReactNode;
  /** Action button text */
  actionText?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Custom styles */
  sx?: SxProps<Theme>;
}

/**
 * Display an empty state with optional action
 *
 * @example
 * ```tsx
 * // Basic usage
 * <EmptyState message="No hay datos disponibles" />
 *
 * // With action button
 * <EmptyState
 *   message="No hay tickets"
 *   description="Cree un nuevo ticket para comenzar"
 *   actionText="Crear ticket"
 *   onAction={() => navigate('/tickets/new')}
 * />
 *
 * // Custom icon
 * <EmptyState
 *   message="Sin resultados"
 *   icon={<SearchOffIcon sx={{ fontSize: 64 }} />}
 * />
 * ```
 */
export const EmptyState: FC<EmptyStateProps> = memo(({
  message = 'No hay datos disponibles',
  description,
  icon,
  actionText,
  onAction,
  sx,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
        textAlign: 'center',
        ...sx,
      }}
    >
      {icon || (
        <InboxOutlined
          sx={{
            fontSize: 64,
            color: 'text.disabled',
            mb: 2,
          }}
        />
      )}
      <Typography
        variant="h6"
        color="text.secondary"
        gutterBottom
      >
        {message}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ mb: 2, maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}
      {actionText && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
