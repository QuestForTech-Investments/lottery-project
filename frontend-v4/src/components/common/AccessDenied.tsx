import { Box, Paper, Typography } from '@mui/material'
import { LockOutlined } from '@mui/icons-material'

interface AccessDeniedProps {
  message?: string
}

/**
 * Friendly "no access" placeholder shown when a user reaches a feature they
 * don't have permission for. Used by PermissionGuard and can be reused inline
 * elsewhere (e.g., a widget shows it when the API returns 403).
 */
const AccessDenied = ({ message = 'No tiene acceso para ver este contenido' }: AccessDeniedProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', p: 3 }}>
      <Paper
        elevation={2}
        sx={{
          p: 5,
          textAlign: 'center',
          maxWidth: 480,
          width: '100%',
          borderRadius: 2,
        }}
      >
        <LockOutlined sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#2c2c2c', mb: 1, fontWeight: 600 }}>
          Acceso restringido
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          {message}
        </Typography>
      </Paper>
    </Box>
  )
}

export default AccessDenied
