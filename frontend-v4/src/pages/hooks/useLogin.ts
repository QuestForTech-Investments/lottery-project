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
      newErrors.username = 'El campo Usuario es obligatorio';
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'El campo Contraseña es obligatorio';
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
        expiresAt: response.expiresAt
      });

      // Navigate to dashboard after successful login
      navigate('/dashboard');
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
          general: 'Usuario o contraseña incorrectos'
        }));
      } else if (error.response?.status === 0) {
        setErrors(prev => ({
          ...prev,
          general: 'No se pudo conectar con el servidor. Verifica tu conexión.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: error.message || 'Error al iniciar sesión. Intenta nuevamente.'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [username, password, validateForm, navigate]);

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
