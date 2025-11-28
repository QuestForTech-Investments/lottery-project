import { memo } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

/**
 * Fallback component for lazy-loaded routes
 * Shows a centered loading spinner with subtle animation
 */
function LazyLoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        gap: 2
      }}
    >
      <CircularProgress
        size={50}
        thickness={4}
        sx={{
          color: '#4dd4d4'
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: '#66615b',
          fontWeight: 500
        }}
      >
        Cargando...
      </Typography>
    </Box>
  )
}

export default memo(LazyLoadingFallback)
