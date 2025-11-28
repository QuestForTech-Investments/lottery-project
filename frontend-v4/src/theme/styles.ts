import type { SxProps, Theme } from '@mui/material'

/**
 * Common reusable styles for MUI components
 * These prevent creating new object references on every render
 */

// Primary gradient button styles
export const primaryButtonStyles: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
  },
}

// Primary button with full styling
export const primaryButtonFullStyles: SxProps<Theme> = {
  ...primaryButtonStyles,
  borderRadius: '25px',
  py: 1.5,
}

// Secondary/gray button styles
export const secondaryButtonStyles: SxProps<Theme> = {
  bgcolor: '#9e9e9e',
  color: 'white',
  '&:hover': {
    bgcolor: '#757575',
  },
}

// Turquoise button styles (app primary color)
export const turquoiseButtonStyles: SxProps<Theme> = {
  bgcolor: '#51cbce',
  color: 'white',
  '&:hover': {
    bgcolor: '#45b8bb',
  },
}

// Success/green button styles
export const successButtonStyles: SxProps<Theme> = {
  bgcolor: '#4caf50',
  color: 'white',
  '&:hover': {
    bgcolor: '#388e3c',
  },
}

// Danger/error button styles
export const dangerButtonStyles: SxProps<Theme> = {
  bgcolor: '#f44336',
  color: 'white',
  '&:hover': {
    bgcolor: '#d32f2f',
  },
}

// Disabled button styles
export const disabledButtonStyles: SxProps<Theme> = {
  bgcolor: '#ccc',
  color: 'white',
  cursor: 'not-allowed',
}

// Large action button (used in Dashboard)
export const largeActionButtonStyles: SxProps<Theme> = {
  ...primaryButtonStyles,
  py: 2,
  fontSize: '1rem',
  fontWeight: 600,
}

// Card header styles
export const cardHeaderStyles: SxProps<Theme> = {
  bgcolor: 'grey.100',
  p: 2,
  borderBottom: 1,
  borderColor: 'divider',
}

// Card footer styles
export const cardFooterStyles: SxProps<Theme> = {
  p: 2,
  bgcolor: 'grey.100',
  borderTop: 1,
  borderColor: 'divider',
}

// Centered loading container
export const loadingContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  width: '100%',
}

// Form input with large text
export const largeInputStyles: SxProps<Theme> = {
  bgcolor: 'white',
  '& input': {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    py: 2,
  },
}

// Table header cell styles
export const tableHeaderCellStyles: SxProps<Theme> = {
  fontWeight: 'bold',
  fontSize: '0.75rem',
  p: 1,
}

// Flex row with gap
export const flexRowStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
}

// Flex column with gap
export const flexColumnStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}

// Page container styles
export const pageContainerStyles: SxProps<Theme> = {
  p: 3,
}

// Full height container
export const fullHeightContainerStyles: SxProps<Theme> = {
  minHeight: '100vh',
}

// Switch styles for green toggle
export const greenSwitchStyles: SxProps<Theme> = {
  transform: 'scale(1.3)',
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4caf50' },
}

// Switch styles for red toggle
export const redSwitchStyles: SxProps<Theme> = {
  transform: 'scale(1.3)',
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#f44336' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#f44336' },
}
