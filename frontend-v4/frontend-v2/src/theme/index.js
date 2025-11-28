import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo vibrante - Modern Gradient
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#8b5cf6', // Purple vibrante
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff'
    },
    error: {
      main: '#ef4444',
      light: '#fecaca',
      dark: '#dc2626'
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#d97706'
    },
    success: {
      main: '#10b981',
      light: '#d1fae5',
      dark: '#059669'
    },
    info: {
      main: '#3b82f6',
      light: '#dbeafe',
      dark: '#2563eb'
    },
    background: {
      default: '#f8fafc', // Gris muy claro - Modern
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600
    },
    button: {
      textTransform: 'none', // Evitar MAYUSCULAS automaticas
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 12 // Bordes más redondeados - Modern
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          textTransform: 'none',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '0',
            height: '0',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.6s, height 0.6s'
          },
          '&:active::before': {
            width: '300px',
            height: '300px'
          }
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-3px) scale(1.02)'
          },
          '&:active': {
            transform: 'translateY(-1px) scale(0.98)',
            transition: 'transform 0.1s'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: '200% 200%',
          '&:hover': {
            background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
            backgroundPosition: 'right center'
          }
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small'
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#818cf8',
                borderWidth: '2px'
              }
            },
            '&.Mui-focused': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.1)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
                borderWidth: '2px'
              }
            }
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
            transition: 'left 0.5s'
          },
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.15), 0 8px 10px -6px rgba(99, 102, 241, 0.1)',
            transform: 'translateY(-6px) scale(1.02)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            '&::before': {
              left: '100%'
            }
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          color: '#f8fafc',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          color: '#1e293b',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            transform: 'translateX(4px)'
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderLeft: '3px solid #6366f1',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.2)'
            }
          }
        }
      }
    }
  }
})

