import { memo, type FC } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  type CircularProgressProps,
} from '@mui/material';

/**
 * Props for LoadingOverlay component
 */
export interface LoadingOverlayProps {
  /** Whether loading is active */
  isLoading: boolean;
  /** Message to display below spinner */
  message?: string;
  /** Use backdrop (covers entire screen) vs inline */
  fullScreen?: boolean;
  /** Spinner size */
  size?: CircularProgressProps['size'];
  /** Custom z-index for backdrop */
  zIndex?: number;
}

/**
 * Display a loading indicator with optional message
 *
 * @example
 * ```tsx
 * // Inline loading
 * <LoadingOverlay isLoading={loading} message="Cargando datos..." />
 *
 * // Full screen backdrop
 * <LoadingOverlay isLoading={loading} fullScreen />
 *
 * // Custom size
 * <LoadingOverlay isLoading={loading} size={60} />
 * ```
 */
export const LoadingOverlay: FC<LoadingOverlayProps> = memo(({
  isLoading,
  message,
  fullScreen = false,
  size = 40,
  zIndex = 1300,
}) => {
  if (!isLoading) return null;

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography
          variant="body2"
          color={fullScreen ? 'white' : 'text.secondary'}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Backdrop
        open={isLoading}
        sx={{
          zIndex,
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        {content}
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
        width: '100%',
      }}
    >
      {content}
    </Box>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export default LoadingOverlay;
