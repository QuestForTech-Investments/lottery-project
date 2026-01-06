/**
 * Brand and UI colors
 * Use these constants instead of hardcoding color values
 */

export const colors = {
  // Brand colors (turquoise theme from original app)
  brand: {
    primary: '#51cbce',
    primaryHover: '#45b8bb',
    primaryLight: '#7dd9db',
    primaryDark: '#3ba8ab',
  },

  // Status colors
  status: {
    success: '#28a745',
    successLight: '#d4edda',
    error: '#dc3545',
    errorLight: '#f8d7da',
    warning: '#ffc107',
    warningLight: '#fff3cd',
    info: '#1976d2',
    infoLight: '#cce5ff',
  },

  // UI colors
  ui: {
    background: '#f5f5f5',
    backgroundDark: '#e0e0e0',
    paper: '#ffffff',
    border: '#e0e0e0',
    borderLight: '#f0f0f0',
  },

  // Text colors
  text: {
    primary: '#2c2c2c',
    secondary: '#666666',
    disabled: '#999999',
    inverse: '#ffffff',
  },

  // Table colors
  table: {
    headerBg: '#f5f5f5',
    rowHover: 'rgba(0, 0, 0, 0.04)',
    rowSelected: 'rgba(81, 203, 206, 0.08)',
  },
} as const;

/**
 * Get status color based on status value
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('ganador') || statusLower.includes('winner') || statusLower.includes('success')) {
    return colors.status.success;
  }
  if (statusLower.includes('cancelado') || statusLower.includes('cancel') || statusLower.includes('error')) {
    return colors.status.error;
  }
  if (statusLower.includes('pendiente') || statusLower.includes('pending') || statusLower.includes('warning')) {
    return colors.status.warning;
  }

  return colors.text.primary;
}

/**
 * Common button styles using brand colors
 */
export const buttonStyles = {
  primary: {
    bgcolor: colors.brand.primary,
    '&:hover': { bgcolor: colors.brand.primaryHover },
    color: colors.text.inverse,
    textTransform: 'none' as const,
  },
  primaryRounded: {
    bgcolor: colors.brand.primary,
    '&:hover': { bgcolor: colors.brand.primaryHover },
    color: colors.text.inverse,
    textTransform: 'uppercase' as const,
    borderRadius: '30px',
    px: 6,
    py: 1,
  },
} as const;
