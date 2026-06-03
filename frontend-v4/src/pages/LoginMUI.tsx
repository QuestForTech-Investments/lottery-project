import { memo, useState, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Login as LoginIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Print as PrintIcon,
  Android as AndroidIcon,
} from '@mui/icons-material';
import tenantLogo from '@tenant/assets/logo.png';
import tenantLoginBackground from '@tenant/loginBackground';
import { tenantConfig } from '@/tenant';
// Card background image from public folder
const cardBackgroundImage = '/images/bannerlotto-02.jpg';
import useLogin from './hooks/useLogin';
import ForcePasswordChangeModal from '@components/modals/ForcePasswordChangeModal';
import ForceSetPinModal from '@components/modals/ForceSetPinModal';

/**
 * LoginMUI Component
 * Casual & Elegant Lottery Login
 */
const LoginMUI = () => {
  const { t } = useTranslation();
  const {
    username,
    password,
    errors,
    isLoading,
    mustChangePassword,
    mustSetPin,
    isPosUser,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
    onPasswordChanged,
    onPinSet,
  } = useLogin();

  // Press-and-hold reveal for the password field. The button only flips the
  // visibility while held — release reverts it.
  const [showPassword, setShowPassword] = useState(false);
  const showWhileHeld = () => setShowPassword(true);
  const hideOnRelease = () => setShowPassword(false);

  // Query-param signals from the various logout paths (api 401, expired-token
  // guard, idle timeout). Query params survive the full-page reload that
  // `window.location.href` does, unlike React Router's `location.state`.
  const loginQuery = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;
  const justChanged = loginQuery?.get('changed') === '1';
  const sessionExpired = loginQuery?.get('reason') === 'session-expired';

  const isVideoBg = tenantLoginBackground.type === 'video';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Image background goes here directly; video gets rendered as a
        // <video> element underneath (sx can't take a media source).
        backgroundImage: isVideoBg ? 'none' : `url(${tenantLoginBackground.src})`,
        backgroundColor: isVideoBg ? '#0f172a' : undefined, // fallback while video loads
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          // Bare-layout tenants get a radial vignette on top of the linear
          // gradient — concentrates focus on the form while keeping the
          // peripheral background (lottery balls / video) visible.
          background: tenantConfig.login.bareLayout
            ? 'radial-gradient(ellipse 65% 75% at center, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.45) 35%, rgba(0, 0, 0, 0.15) 65%, rgba(0, 0, 0, 0) 90%), linear-gradient(135deg, rgba(15, 25, 35, 0.4) 0%, rgba(20, 40, 50, 0.3) 100%)'
            : 'linear-gradient(135deg, rgba(15, 25, 35, 0.7) 0%, rgba(20, 40, 50, 0.5) 100%)',
          zIndex: 1,
        },
      }}
    >
      {isVideoBg && (
        <Box
          component="video"
          src={tenantLoginBackground.src}
          autoPlay
          muted
          playsInline
          // Avoid taking focus on iOS — purely decorative.
          aria-hidden="true"
          // Seamless loop: instead of the native `loop` attribute (which
          // flashes any black frame at end/start), we rewind just before
          // the last frame and skip the very first one. Imperceptible jump,
          // no black flash. The native `onEnded` is a safety net in case
          // timeupdate fires too sparsely.
          onTimeUpdate={(e) => {
            const v = e.currentTarget as HTMLVideoElement
            if (v.duration && v.duration - v.currentTime < 0.2) {
              v.currentTime = 0.05
            }
          }}
          onEnded={(e) => {
            const v = e.currentTarget as HTMLVideoElement
            v.currentTime = 0.05
            void v.play()
          }}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
      )}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          // z-stack: video=0, gradient overlay (::before)=1, card=2.
          zIndex: 2,
          // Bare layout (e.g. La Central): no card chrome — logo + inputs
          // float directly over the video background. Default layout keeps
          // the white/translucent card with the desktop banner image.
          backgroundImage: tenantConfig.login.bareLayout
            ? 'none'
            : { xs: 'none', sm: `url(${cardBackgroundImage})` },
          backgroundColor: tenantConfig.login.bareLayout
            ? 'transparent'
            : { xs: 'rgba(255, 255, 255, 0.97)', sm: 'transparent' },
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: { xs: '16px', sm: '28px' },
          // Mobile: dark blue border like original app (skip when bare).
          border: tenantConfig.login.bareLayout
            ? 'none'
            : { xs: '3px solid #2d3748', sm: 'none' },
          px: tenantConfig.login.bareLayout ? { xs: 2, sm: 3 } : { xs: 2.5, sm: 5 },
          py: { xs: 3, sm: 5 },
          width: '100%',
          // Bare layout needs more room so the larger logo fits centered with
          // the inputs (instead of overflowing and clipping on the right).
          maxWidth: tenantConfig.login.bareLayout ? { xs: 320, sm: 540 } : { xs: 340, sm: 400 },
          textAlign: 'center',
          boxShadow: tenantConfig.login.bareLayout ? 'none' : {
            xs: '0 10px 40px rgba(0, 0, 0, 0.3)',
            sm: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          },
          // Bare-layout tenants sit higher in the viewport so the brand
          // breathes from the top half; classic tenants stay centered.
          mt: tenantConfig.login.bareLayout ? { xs: 3, sm: 6 } : 'auto',
          mb: 'auto',
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
          src={tenantLogo}
          alt={tenantConfig.login.logoAlt}
          sx={{
            // Bare-layout tenants (e.g. La Central) get a noticeably larger
            // logo since the card chrome is gone and the logo carries more
            // of the visual weight.
            width: tenantConfig.login.bareLayout ? { xs: 200, sm: 360 } : { xs: 140, sm: 241 },
            height: tenantConfig.login.bareLayout ? { xs: 200, sm: 360 } : { xs: 140, sm: 241 },
            mb: { xs: 1.5, sm: 2 },
            mx: 'auto',
            objectFit: 'contain',
            // Bare-layout tenants (La Central) layer a deeper drop shadow with
            // a soft white halo + faint navy glow — anchors the logo over the
            // video background without a card chrome. Classic tenants keep the
            // light card-style shadow.
            filter: tenantConfig.login.bareLayout
              ? 'drop-shadow(0 10px 28px rgba(0, 0, 0, 0.45)) drop-shadow(0 0 32px rgba(255, 255, 255, 0.12)) drop-shadow(0 0 60px rgba(59, 130, 246, 0.08))'
              : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
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

        {/* Welcome Text — hidden in bare layout */}
        {!tenantConfig.login.bareLayout && (
          <>
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
              {t('login.welcome')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
              }}
            >
              {t('login.subtitle')}
            </Typography>
          </>
        )}

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

        {justChanged && !errors.general && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }}>
            {t('login.passwordUpdated')}
          </Alert>
        )}

        {sessionExpired && !errors.general && !justChanged && (
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '12px' }}>
            {t('login.sessionExpired', {
              defaultValue: 'Tu sesión expiró. Por favor inicia sesión nuevamente.',
            })}
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
            // Cap input width independently of the Paper. Bare-layout tenants
            // use a wider Paper to fit the larger logo, but the inputs should
            // stay at a comfortable form width.
            width: '100%',
            maxWidth: tenantConfig.login.bareLayout ? 460 : 'none',
            mx: 'auto',
          }}
        >
          {/* Username Field */}
          <TextField
            fullWidth
            id="username"
            placeholder={t('login.username')}
            value={username}
            onChange={handleUsernameChange}
            error={!!errors.username}
            helperText={errors.username}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#94a3b8', fontSize: { xs: '1.1rem', sm: '1.3rem' } }} />
                </InputAdornment>
              ),
              endAdornment: errors.username && (
                <InputAdornment position="end">
                  <ErrorIcon color="error" sx={{ fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: { xs: '#fff', sm: '#f8fafc' },
                // More rounded on mobile like original app
                borderRadius: { xs: '25px', sm: '14px' },
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
                  py: { xs: 1.2, sm: 1.5 },
                  fontSize: { xs: '16px', sm: '24px' },
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
                  borderColor: { xs: '#cbd5e1', sm: '#e2e8f0' },
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
            type={showPassword ? 'text' : 'password'}
            placeholder={t('login.password')}
            value={password}
            onChange={handlePasswordChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#94a3b8', fontSize: { xs: '1.1rem', sm: '1.3rem' } }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {errors.password && (
                    <ErrorIcon color="error" sx={{ fontSize: '1.2rem', mr: 0.5 }} />
                  )}
                  <IconButton
                    aria-label="Mantener pulsado para mostrar la contraseña"
                    size="small"
                    tabIndex={-1}
                    onMouseDown={showWhileHeld}
                    onMouseUp={hideOnRelease}
                    onMouseLeave={hideOnRelease}
                    onTouchStart={showWhileHeld}
                    onTouchEnd={hideOnRelease}
                    onTouchCancel={hideOnRelease}
                    onContextMenu={(e) => e.preventDefault()}
                    sx={{ color: '#94a3b8', p: 0.5 }}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon sx={{ fontSize: '1.2rem' }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: '1.2rem' }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: { xs: '#fff', sm: '#f8fafc' },
                // More rounded on mobile like original app
                borderRadius: { xs: '25px', sm: '14px' },
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
                  py: { xs: 1.2, sm: 1.5 },
                  fontSize: { xs: '16px', sm: '24px' },
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
                  borderColor: { xs: '#cbd5e1', sm: '#e2e8f0' },
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

          {/* Submit Button — red across all sizes (mobile used to flip teal to
              mimic the original Vue app; user prefers the desktop red on phones too). */}
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
              mt: { xs: 1.5, sm: 1.5 },
              py: { xs: 1.3, sm: 1.6 },
              px: 4,
              // More rounded on mobile like original app
              borderRadius: { xs: '25px', sm: '14px' },
              fontSize: { xs: '0.95rem', sm: '1rem' },
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'white',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              // Bare-layout tenants (La Central) get a richer multi-stop
              // gradient with an inset highlight, brand-tinted drop shadow,
              // and a subtle white border so the CTA reads as premium
              // against the glass inputs and dark video background.
              background: tenantConfig.login.bareLayout
                ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              border: tenantConfig.login.bareLayout
                ? '1px solid rgba(255, 255, 255, 0.18)'
                : 'none',
              boxShadow: tenantConfig.login.bareLayout
                ? '0 12px 32px rgba(220, 38, 38, 0.5), 0 2px 6px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                : '0 4px 14px rgba(220, 38, 38, 0.4)',
              '&:hover': {
                background: tenantConfig.login.bareLayout
                  ? 'linear-gradient(180deg, #f87171 0%, #ef4444 50%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: tenantConfig.login.bareLayout
                  ? '0 16px 40px rgba(220, 38, 38, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.35)'
                  : '0 6px 20px rgba(220, 38, 38, 0.5)',
                borderColor: tenantConfig.login.bareLayout
                  ? 'rgba(255, 255, 255, 0.28)'
                  : undefined,
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: tenantConfig.login.bareLayout
                  ? '0 6px 16px rgba(220, 38, 38, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                  : undefined,
              },
              '&.Mui-disabled': {
                background: tenantConfig.login.bareLayout
                  ? 'rgba(255, 255, 255, 0.08)'
                  : '#cbd5e1',
                color: tenantConfig.login.bareLayout
                  ? 'rgba(255, 255, 255, 0.4)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: tenantConfig.login.bareLayout
                  ? '1px solid rgba(255, 255, 255, 0.12)'
                  : 'none',
                boxShadow: 'none',
              },
            }}
          >
            {isLoading ? t('login.signingIn') : t('login.signIn')}
          </Button>
        </Box>
      </Paper>

      {/* Bottom-left action buttons — Printer + Android. Click is a no-op
          for now; handlers will be wired to native bridges later. */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 12, sm: 20 },
          left: { xs: 12, sm: 24 },
          display: 'flex',
          gap: 1,
          zIndex: 2,
        }}
      >
        {[
          { key: 'printer', Icon: PrintIcon, title: 'Printer' },
          { key: 'android', Icon: AndroidIcon, title: 'Android' },
        ].map(({ key, Icon, title }) => (
          <IconButton
            key={key}
            size="small"
            title={title}
            aria-label={title}
            onClick={() => { /* TODO: wire up handler */ }}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.4)',
              // Size + border-radius match the version chip on the right
              // (~48px tall, 14px corners) so the bottom row reads as a set.
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: '14px',
              // Inset top highlight mirrors the SignIn button — adds depth
              // and ties the bottom row visually to the CTA.
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.18)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.55)',
                borderColor: 'rgba(255,255,255,0.7)',
                transform: 'translateY(-2px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 6px 18px rgba(0, 0, 0, 0.35)',
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.25)',
              },
            }}
          >
            <Icon fontSize="small" />
          </IconButton>
        ))}
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
        {tenantConfig.versionLink ? (
          <Box
            component="a"
            href={tenantConfig.versionLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              color: '#fff',
              textDecoration: 'none',
              textAlign: 'left',
              // Extra left padding to make room for the brand accent stripe.
              pl: 2,
              pr: 1.75,
              py: 0.85,
              borderRadius: '14px',
              backgroundColor: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.4)',
              // Inset top highlight matches the icon buttons + SignIn — bottom
              // row reads as a coordinated set.
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.18)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              // Vertical brand accent — picks up the red from the SignIn
              // button and the logo's shield, tying the corner to the CTA.
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
                borderTopLeftRadius: '14px',
                borderBottomLeftRadius: '14px',
              },
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.55)',
                borderColor: 'rgba(255,255,255,0.7)',
                transform: 'translateY(-2px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 6px 18px rgba(0, 0, 0, 0.35)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                fontWeight: 700,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
              }}
            >
              {tenantConfig.versionLabel}
            </Box>
            {tenantConfig.versionSubLabel && (
              <Box
                component="span"
                sx={{
                  fontSize: { xs: '0.65rem', sm: '0.72rem' },
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                  mt: 0.2,
                  lineHeight: 1.1,
                }}
              >
                {tenantConfig.versionSubLabel}
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                fontWeight: 500,
                letterSpacing: '0.02em',
                lineHeight: 1.2,
              }}
            >
              {tenantConfig.versionLabel}
            </Typography>
            {tenantConfig.versionSubLabel && (
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: { xs: '0.65rem', sm: '0.72rem' },
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                }}
              >
                {tenantConfig.versionSubLabel}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <ForcePasswordChangeModal
        isOpen={mustChangePassword}
        isPos={isPosUser}
        onCompleted={onPasswordChanged}
      />
      <ForceSetPinModal
        isOpen={!mustChangePassword && mustSetPin}
        onCompleted={onPinSet}
      />
    </Box>
  );
};

export default memo(LoginMUI);
