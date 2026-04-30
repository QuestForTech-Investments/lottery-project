import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import * as logger from '../../utils/logger';

interface LoginErrors {
  username: string;
  password: string;
  general: string;
}

interface ApiError {
  message: string;
  response?: {
    status: number;
  };
}

/**
 * Custom hook for managing Login state and logic
 */
const useLogin = () => {
  const navigate = useNavigate();

  // State
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({
    username: '',
    password: '',
    general: '',
  });

  // Forced post-login flow state
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);
  const [mustSetPin, setMustSetPin] = useState<boolean>(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [isPosUser, setIsPosUser] = useState<boolean>(false);

  /**
   * Handle username change
   */
  const handleUsernameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    // Clear errors when user starts typing
    if (errors.username || errors.general) {
      setErrors(prev => ({ ...prev, username: '', general: '' }));
    }
  }, [errors.username, errors.general]);

  /**
   * Handle password change
   */
  const handlePasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    // Clear errors when user starts typing
    if (errors.password || errors.general) {
      setErrors(prev => ({ ...prev, password: '', general: '' }));
    }
  }, [errors.password, errors.general]);

  /**
   * Validate form
   */
  const validateForm = useCallback(() => {
    const newErrors = {
      username: '',
      password: '',
      general: '',
    };

    // Validate username
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    // Return true if no errors
    return !newErrors.username && !newErrors.password;
  }, [username, password]);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ username: '', password: '', general: '' });

    try {
      // Call login API
      logger.info('LOGIN_ATTEMPT', `User ${username} attempting login`);

      const response = await authService.login(username, password);

      logger.success('LOGIN_SUCCESS', `User ${username} logged in successfully`, {
        token: response.token ? 'Token received' : 'No token',
        role: response.role,
        bettingPoolId: response.bettingPoolId,
        bettingPoolName: response.bettingPoolName,
        expiresAt: response.expiresAt
      });

      // Store betting pool info for POS users
      if (response.bettingPoolId) {
        localStorage.setItem('bettingPoolId', response.bettingPoolId.toString());
        localStorage.setItem('bettingPoolName', response.bettingPoolName || '');
      }

      // Set cookie on parent domain for cross-subdomain auth
      // This allows POS subdomain to read the same token
      if (response.token) {
        const isProduction = window.location.hostname.includes('lottobook.net');
        const expiresInSeconds = 86400; // 24 hours
        const expires = new Date(Date.now() + expiresInSeconds * 1000).toUTCString();

        if (isProduction) {
          // Production: set cookie on parent domain so all subdomains can access it
          document.cookie = `lottery_auth_token=${response.token}; domain=.lottobook.net; path=/; expires=${expires}; secure; samesite=lax`;
        } else {
          // Development: set cookie without domain restriction
          document.cookie = `lottery_auth_token=${response.token}; path=/; expires=${expires}; samesite=lax`;
        }
      }

      // Compute target redirect URL but don't navigate yet —
      // forced password change / PIN must complete first.
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect');
      const isPos = response.role === 'POS';
      let target: string;
      if (redirectUrl && redirectUrl.startsWith('https://pos.lottobook.net')) {
        target = redirectUrl;
      } else if (isPos) {
        target = window.location.hostname.includes('lottobook.net')
          ? 'https://pos.lottobook.net'
          : 'http://localhost:5173';
      } else {
        target = '/dashboard';
      }

      setIsPosUser(isPos);

      if (response.mustChangePassword || response.mustSetPin) {
        // Defer redirect — modals run first
        setPendingRedirect(target);
        setMustChangePassword(!!response.mustChangePassword);
        setMustSetPin(!!response.mustSetPin);
        return;
      }

      // No forced steps — navigate immediately
      if (target.startsWith('http')) {
        window.location.href = target;
      } else {
        navigate(target);
      }
    } catch (err) {
      const error = err as ApiError;
      logger.error('LOGIN_FAILED', `Login failed for user ${username}`, {
        error: error.message,
        status: error.response?.status
      });

      // Handle different error types
      if (error.response?.status === 401) {
        setErrors(prev => ({
          ...prev,
          general: 'Invalid username or password'
        }));
      } else if (error.response?.status === 0) {
        setErrors(prev => ({
          ...prev,
          general: 'Could not connect to server. Please check your connection.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: error.message || 'Login failed. Please try again.'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [username, password, validateForm, navigate]);

  /** After all forced steps done: log out and redirect to login so user re-authenticates with fresh JWT. */
  const finishForcedFlow = useCallback(() => {
    // Clear the just-issued token: the JWT still carries the old must_change_password claim,
    // forcing the user to log back in ensures the next session has a clean token.
    authService.logout();
    setPendingRedirect(null);
    navigate('/login?changed=1');
  }, [navigate]);

  /** Called by ForcePasswordChangeModal when password change succeeds. */
  const onPasswordChanged = useCallback(() => {
    setMustChangePassword(false);
    if (!mustSetPin) {
      finishForcedFlow();
    }
  }, [mustSetPin, finishForcedFlow]);

  /** Called by ForceSetPinModal when PIN is set. */
  const onPinSet = useCallback(() => {
    setMustSetPin(false);
    finishForcedFlow();
  }, [finishForcedFlow]);

  return {
    // State
    username,
    password,
    errors,
    isLoading,
    mustChangePassword,
    mustSetPin,
    isPosUser,

    // Handlers
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
    onPasswordChanged,
    onPinSet,
  };
};

export default useLogin;
