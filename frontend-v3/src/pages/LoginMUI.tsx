/**
 * LoginMUI Component
 * Modern Material-UI version of Login
 * Optimized version with extracted styles and better performance
 */

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Login as LoginIcon, Error as ErrorIcon } from '@mui/icons-material';
import backgroundImage from '@/assets/images/6e432d72ffa8381a97638a0e3e0b8fa6.jpg';
import logoImage from '@/assets/images/logo.png';
import useLogin from '@/hooks/useLogin';

// Extracted constant styles outside component to avoid recreation
const INPUT_STYLES = {
  backgroundColor: 'white',
  borderRadius: '50px',
  textAlign: 'center' as const,
  '& input': {
    textAlign: 'center',
  },
  '& input::placeholder': {
    textAlign: 'center',
  },
};

const FIELD_STYLES = {
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#394557',
    },
  },
};

const HELPER_TEXT_STYLES = {
  textAlign: 'center' as const,
  mx: 0,
};

const LoginMUI: React.FC = () => {
  const {
    username,
    password,
    errors,
    isLoading,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
  } = useLogin();

  // Memoize error adornment to avoid recreation
  const usernameErrorAdornment = useMemo(
    () =>
      errors.username && (
        <InputAdornment position="end">
          <ErrorIcon color="error" sx={{ fontSize: '1.25rem' }} />
        </InputAdornment>
      ),
    [errors.username]
  );

  const passwordErrorAdornment = useMemo(
    () =>
      errors.password && (
        <InputAdornment position="end">
          <ErrorIcon color="error" sx={{ fontSize: '1.25rem' }} />
        </InputAdornment>
      ),
    [errors.password]
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          bgcolor: 'rgba(239, 239, 239, 0.89)',
          border: '8px solid #394557',
          borderRadius: '16px',
          px: 4,
          py: 8,
          width: 384,
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          mt: '-200px',
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src={logoImage}
          alt="logo"
          sx={{
            width: 256,
            height: 256,
            mb: 2,
            mx: 'auto',
            objectFit: 'contain',
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            console.error('Error loading logo:', e);
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Error Alert */}
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Username Field */}
          <Box>
            <TextField
              fullWidth
              id="username"
              name="username"
              placeholder="Usuario"
              value={username}
              onChange={handleUsernameChange}
              error={!!errors.username}
              helperText={errors.username}
              autoComplete="username"
              InputProps={{
                endAdornment: usernameErrorAdornment,
                sx: INPUT_STYLES,
              }}
              FormHelperTextProps={{
                sx: HELPER_TEXT_STYLES,
              }}
              sx={FIELD_STYLES}
            />
          </Box>

          {/* Password Field */}
          <Box>
            <TextField
              fullWidth
              id="password"
              name="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={handlePasswordChange}
              error={!!errors.password}
              helperText={errors.password}
              autoComplete="current-password"
              InputProps={{
                endAdornment: passwordErrorAdornment,
                sx: INPUT_STYLES,
              }}
              FormHelperTextProps={{
                sx: HELPER_TEXT_STYLES,
              }}
              sx={FIELD_STYLES}
            />
          </Box>

          {/* Submit Button */}
          <Button
            id="log-in"
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
            sx={{
              bgcolor: '#121648',
              color: 'white',
              textTransform: 'uppercase',
              fontWeight: 600,
              py: 1.5,
              px: 3,
              borderRadius: '50px',
              width: '75%',
              mx: 'auto',
              '&:hover': {
                bgcolor: '#1a1f5e',
                filter: 'brightness(1.1)',
              },
              '&:disabled': {
                bgcolor: '#394557',
                color: 'rgba(255, 255, 255, 0.5)',
              },
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </Box>
      </Paper>

      {/* Footer Link - Bottom Right */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          textAlign: 'right',
        }}
      >
        <Link
          href="https://printers.apk.lol"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: '#51cbce',
            fontSize: '1.125rem',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Descargar Drivers de printers
        </Link>
        <Typography
          variant="body1"
          sx={{
            color: 'white',
            mt: 0.5,
          }}
        >
          Firefox Silent Print:{' '}
          <Box component="span" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
            print.always_print_silent
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginMUI;
