import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    secondary: {
      main: '#66615b',
      light: '#8a857f',
      dark: '#4a453f',
    },
    background: {
      default: '#f4f3ef',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          color: 'white',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#e8e5e0',
          color: '#66615b',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.15)',
            },
          },
        },
      },
    },
  },
});

