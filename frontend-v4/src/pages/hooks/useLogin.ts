import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    data?: {
      message?: string;
      reason?: string;  // 'invalid' | 'locked' | 'ip_blocked'
      // ASP.NET Core ValidationProblemDetails shape:
      title?: string;
      errors?: Record<string, string[]>;
    };
  };
}

type ApiErrorData = NonNullable<NonNullable<ApiError['response']>['data']>;

/**
 * Pull a readable message out of an ASP.NET ValidationProblemDetails body.
 * Returns the first per-field error, or the title, or null if neither exists.
 */
const extractValidationMessage = (data: ApiErrorData | undefined): string | null => {
  if (!data) return null;
  if (data.errors) {
    const first = Object.values(data.errors).flat().find(Boolean);
    if (first) return first;
  }
  return data.title ?? null;
};

/**
 * Custom hook for managing Login state and logic
 */
const useLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      newErrors.username = t('login.usernameRequired');
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = t('login.passwordRequired');
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

      // Store betting pool info for POS users — clear any stale value when admin logs in
      if (response.bettingPoolId) {
        localStorage.setItem('bettingPoolId', response.bettingPoolId.toString());
        localStorage.setItem('bettingPoolName', response.bettingPoolName || '');
      } else {
        localStorage.removeItem('bettingPoolId');
        localStorage.removeItem('bettingPoolName');
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
      const status = error.response?.status;
      const reason = error.response?.data?.reason;
      const apiMessage = error.response?.data?.message;

      logger.error('LOGIN_FAILED', `Login failed for user ${username}`, {
        error: error.message,
        status,
        reason
      });

      // Map backend reason → localized user-facing message.
      // Locked + ip_blocked must clearly say "contact admin" so the user
      // knows credentials weren't the problem.
      let general: string;
      if (status === 401 && reason === 'locked') {
        general = t('login.errors.locked');
      } else if (status === 401 && reason === 'ip_blocked') {
        general = t('login.errors.ipBlocked');
      } else if (status === 401) {
        general = t('login.errors.invalid');
      } else if (status === 400) {
        // ASP.NET model validation (e.g. empty body, unparseable JSON).
        // For login, treat any 400 as "invalid credentials" so we don't leak
        // server-side validation rules to the client.
        general = t('login.errors.invalid');
      } else if (status === 0 || status === undefined) {
        // status === 0 is set by our fetch wrapper for network errors
        general = t('login.errors.network');
      } else if (status === 429) {
        general = t('login.errors.tooMany');
      } else if (status >= 500) {
        general = t('login.errors.server');
      } else {
        general =
          apiMessage ||
          extractValidationMessage(error.response?.data) ||
          error.message ||
          t('login.errors.generic');
      }

      setErrors(prev => ({ ...prev, general }));
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
    // Clear the temp password from the login form so it doesn't leak into the new session.
    setPassword('');
    navigate('/login?changed=1');
  }, [navigate]);

  /**
   * Called by ForcePasswordChangeModal when password change succeeds.
   * Admins ALWAYS go through the PIN step next (security policy: keep both
   * credentials fresh, regardless of the stale must_set_pin flag in DB).
   * POS users finish here.
   */
  const onPasswordChanged = useCallback(() => {
    setMustChangePassword(false);
    if (isPosUser) {
      finishForcedFlow();
    } else {
      // Force admin into the PIN setup flow even if the server flag is false.
      setMustSetPin(true);
    }
  }, [isPosUser, finishForcedFlow]);

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
