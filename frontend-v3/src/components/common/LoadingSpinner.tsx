/**
 * LoadingSpinner Component
 * Centered loading indicator with brand colors
 */

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullHeight?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  message = 'Cargando...',
  size = 40,
  fullHeight = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullHeight ? '400px' : 'auto',
        gap: 2,
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          color: '#51cbce',
        }}
      />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
