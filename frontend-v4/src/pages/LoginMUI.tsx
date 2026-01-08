import { memo, type SyntheticEvent } from 'react';
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
import {
  Login as LoginIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import backgroundImage from '@/assets/images/6e432d72ffa8381a97638a0e3e0b8fa6.jpg';
import logoImage from '@/assets/images/logo.png';
import useLogin from './hooks/useLogin';

/**
 * LoginMUI Component
 * Modern Material-UI version of Login
 */
const LoginMUI = () => {
  const {
    username,
    password,
    errors,
    isLoading,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
  } = useLogin();

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
        p: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          bgcolor: 'rgba(239, 239, 239, 0.89)',
          border: { xs: '4px solid #394557', sm: '8px solid #394557' },
          borderRadius: { xs: '12px', sm: '16px' },
          px: { xs: 2, sm: 4 },
          py: { xs: 4, sm: 6, md: 8 },
          width: '100%',
          maxWidth: 384,
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          my: 'auto',
          maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 48px)' },
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src={logoImage}
          alt="logo"
          sx={{
            width: { xs: 150, sm: 200, md: 256 },
            height: { xs: 150, sm: 200, md: 256 },
            mb: { xs: 1, sm: 2 },
            mx: 'auto',
            objectFit: 'contain',
          }}
          onError={(e: SyntheticEvent<HTMLImageElement>) => {
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
              placeholder="Usuario"
              value={username}
              onChange={handleUsernameChange}
              error={!!errors.username}
              helperText={errors.username}
              InputProps={{
                endAdornment: errors.username && (
                  <InputAdornment position="end">
                    <ErrorIcon color="error" sx={{ fontSize: '1.25rem' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'white',
                  borderRadius: '50px',
                  textAlign: 'center',
                  '& input': {
                    textAlign: 'center',
                  },
                  '& input::placeholder': {
                    textAlign: 'center',
                  },
                },
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: 'center',
                  mx: 0,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#394557',
                  },
                },
              }}
            />
          </Box>

          {/* Password Field */}
          <Box>
            <TextField
              fullWidth
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={handlePasswordChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: errors.password && (
                  <InputAdornment position="end">
                    <ErrorIcon color="error" sx={{ fontSize: '1.25rem' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'white',
                  borderRadius: '50px',
                  textAlign: 'center',
                  '& input': {
                    textAlign: 'center',
                  },
                  '& input::placeholder': {
                    textAlign: 'center',
                  },
                },
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: 'center',
                  mx: 0,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#394557',
                  },
                },
              }}
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
          bottom: { xs: 8, sm: 16 },
          right: { xs: 8, sm: 16 },
          left: { xs: 8, sm: 'auto' },
          textAlign: { xs: 'center', sm: 'right' },
        }}
      >
        <Link
          href="https://printers.apk.lol"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: '#51cbce',
            fontSize: { xs: '0.875rem', sm: '1.125rem' },
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
            fontSize: { xs: '0.75rem', sm: '1rem' },
            display: { xs: 'none', sm: 'block' },
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

export default memo(LoginMUI);
