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
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import backgroundImage from '@/assets/images/login-background.jpg';
import logoImage from '@/assets/images/lottobook-logo.png';
// Card background image from public folder
const cardBackgroundImage = '/images/bannerlotto-02.jpg';
import useLogin from './hooks/useLogin';

/**
 * LoginMUI Component
 * Casual & Elegant Lottery Login
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
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(15, 25, 35, 0.7) 0%, rgba(20, 40, 50, 0.5) 100%)',
          zIndex: 0,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 1,
          backgroundImage: `url(${cardBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: { xs: '20px', sm: '28px' },
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 5 },
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          my: 'auto',
          maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 48px)' },
          overflowY: 'auto',
          overflow: 'hidden',
          animation: 'fadeInUp 0.6s ease-out',
          '@keyframes fadeInUp': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src={logoImage}
          alt="Lottobook"
          sx={{
            width: { xs: 180, sm: 241 },
            height: { xs: 180, sm: 241 },
            mb: 2,
            mx: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
            animation: 'fadeIn 0.8s ease-out 0.2s both',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
          onError={(e: SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Welcome Text */}
        <Typography
          variant="h6"
          sx={{
            color: '#1e293b',
            fontWeight: 600,
            mb: 0.5,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            letterSpacing: '-0.02em',
          }}
        >
          Welcome
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 3,
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
          }}
        >
          Enter your credentials to continue
        </Typography>

        {/* Error Alert */}
        {errors.general && (
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              borderRadius: '12px',
              '& .MuiAlert-icon': {
                alignItems: 'center',
              },
            }}
          >
            {errors.general}
          </Alert>
        )}

        {/* Login Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Username Field */}
          <TextField
            fullWidth
            id="username"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            error={!!errors.username}
            helperText={errors.username}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#94a3b8', fontSize: '1.3rem' }} />
                </InputAdornment>
              ),
              endAdornment: errors.username && (
                <InputAdornment position="end">
                  <ErrorIcon color="error" sx={{ fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                px: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
                '& input': {
                  py: 1.5,
                  fontSize: '0.95rem',
                },
                '& input::placeholder': {
                  color: '#94a3b8',
                  opacity: 1,
                },
              },
            }}
            FormHelperTextProps={{
              sx: {
                mx: 1.5,
                mt: 0.5,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e2e8f0',
                  borderWidth: '1.5px',
                  transition: 'border-color 0.2s ease',
                },
                '&:hover fieldset': {
                  borderColor: '#cbd5e1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                  borderWidth: '2px',
                },
              },
            }}
          />

          {/* Password Field */}
          <TextField
            fullWidth
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#94a3b8', fontSize: '1.3rem' }} />
                </InputAdornment>
              ),
              endAdornment: errors.password && (
                <InputAdornment position="end">
                  <ErrorIcon color="error" sx={{ fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                px: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
                '& input': {
                  py: 1.5,
                  fontSize: '0.95rem',
                },
                '& input::placeholder': {
                  color: '#94a3b8',
                  opacity: 1,
                },
              },
            }}
            FormHelperTextProps={{
              sx: {
                mx: 1.5,
                mt: 0.5,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e2e8f0',
                  borderWidth: '1.5px',
                  transition: 'border-color 0.2s ease',
                },
                '&:hover fieldset': {
                  borderColor: '#cbd5e1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                  borderWidth: '2px',
                },
              },
            }}
          />

          {/* Submit Button */}
          <Button
            id="log-in"
            type="submit"
            variant="contained"
            color="inherit"
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.7)' }} />
              ) : (
                <LoginIcon />
              )
            }
            sx={{
              mt: 1,
              py: 1.6,
              px: 4,
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '0.01em',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
              transition: 'all 0.25s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&.Mui-disabled': {
                background: '#cbd5e1',
                color: 'rgba(255, 255, 255, 0.7)',
                boxShadow: 'none',
              },
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>

      {/* Footer Link - Bottom Left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 12, sm: 20 },
          left: { xs: 12, sm: 24 },
          textAlign: 'left',
          zIndex: 1,
        }}
      >
        <Link
          href="https://printers.apk.lol"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: { xs: '0.7rem', sm: '0.8rem' },
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.2s ease',
            '&:hover': {
              color: '#fff',
              textDecoration: 'underline',
            },
          }}
        >
          Download Printer Drivers
        </Link>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            mt: 0.5,
            fontSize: { xs: '0.6rem', sm: '0.7rem' },
            display: { xs: 'none', sm: 'block' },
          }}
        >
          Firefox Silent Print:{' '}
          <Box component="span" sx={{ fontWeight: 600, fontStyle: 'italic' }}>
            print.always_print_silent
          </Box>
        </Typography>
      </Box>

      {/* Version - Bottom Right */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 12, sm: 20 },
          right: { xs: 12, sm: 24 },
          textAlign: 'right',
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          Lottobook Version 777
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(LoginMUI);
