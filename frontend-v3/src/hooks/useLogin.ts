/**
 * useLogin Hook
 * Custom hook for managing Login state and logic
 * Optimized version with reduced re-renders and better performance
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/api/auth';
import * as logger from '../utils/logger';

interface LoginErrors {
  username: string;
  password: string;
  general: string;
}

interface UseLoginReturn {
  // State
  username: string;
  password: string;
  errors: LoginErrors;
  isLoading: boolean;

  // Handlers
  handleUsernameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

// Constants outside component to avoid recreation
const EMPTY_ERRORS: LoginErrors = {
  username: '',
  password: '',
  general: '',
};

/**
 * Custom hook for managing Login state and logic
 * Optimized with functional updates to reduce dependencies
 */
const useLogin = (): UseLoginReturn => {
  const navigate = useNavigate();

  // State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>(EMPTY_ERRORS);

  /**
   * Handle username change
   * Optimized: no dependencies on errors state
   */
  const handleUsernameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    // Clear errors using functional update - no dependency needed
    setErrors((prev) =>
      prev.username || prev.general
        ? { ...prev, username: '', general: '' }
        : prev
    );
  }, []);

  /**
   * Handle password change
   * Optimized: no dependencies on errors state
   */
  const handlePasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    // Clear errors using functional update - no dependency needed
    setErrors((prev) =>
      prev.password || prev.general
        ? { ...prev, password: '', general: '' }
        : prev
    );
  }, []);

  /**
   * Validate form
   * Inline validation - no need for separate function
   */
  const validateForm = useCallback((user: string, pass: string): boolean => {
    const newErrors: LoginErrors = {
      username: user.trim() ? '' : 'El campo Usuario es obligatorio',
      password: pass.trim() ? '' : 'El campo Contraseña es obligatorio',
      general: '',
    };

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  }, []);

  /**
   * Handle form submit
   * Optimized: uses current state values instead of closure
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Get current values from form instead of closure
      const formData = new FormData(event.currentTarget);
      const user = (formData.get('username') as string) || username;
      const pass = (formData.get('password') as string) || password;

      // Validate form with current values
      if (!validateForm(user, pass)) {
        return;
      }

      setIsLoading(true);
      setErrors(EMPTY_ERRORS);

      try {
        // Call login API
        logger.info('LOGIN_ATTEMPT', `User ${user} attempting login`);

        const response = await authService.login(user, pass);

        logger.success('LOGIN_SUCCESS', `User ${user} logged in successfully`, {
          token: response.token ? 'Token received' : 'No token',
          expiresAt: response.expiresAt,
        });

        // Navigate to dashboard after successful login
        navigate('/dashboard');
      } catch (error: any) {
        logger.error('LOGIN_FAILED', `Login failed for user ${user}`, {
          error: error.message,
          status: error.response?.status,
        });

        // Handle different error types
        const errorMsg =
          error.response?.status === 401
            ? 'Usuario o contraseña incorrectos'
            : error.response?.status === 0
            ? 'No se pudo conectar con el servidor. Verifica tu conexión.'
            : error.message || 'Error al iniciar sesión. Intenta nuevamente.';

        setErrors((prev) => ({ ...prev, general: errorMsg }));
      } finally {
        setIsLoading(false);
      }
    },
    [username, password, validateForm, navigate]
  );

  return {
    // State
    username,
    password,
    errors,
    isLoading,

    // Handlers
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
  };
};

export default useLogin;
