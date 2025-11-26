/**
 * Custom hook for CreateUser form logic
 * Handles form state, validation, and submission
 *
 * OPTIMIZED: useCallback added for all handlers (2025-10-30)
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, permissionService } from '@/services';
import { validatePassword, handleApiError } from '@/utils';
import * as logger from '@/utils/logger';

/**
 * Permission interface
 */
interface Permission {
  permissionId: number;
  name?: string;
  permissionName?: string;
}

/**
 * Permission Category interface
 */
interface PermissionCategory {
  category: string;
  permissions?: Permission[];
}

/**
 * Form Data interface
 */
interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  permissionIds: number[];
  zoneIds: number[];
  assignBanca: boolean;
  bettingPoolId: number | null;
}

/**
 * Errors interface
 */
interface Errors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  permissions?: string;
  zones?: string;
  bettingPool?: string;
  submit?: string;
  [key: string]: string | undefined;
}

const useUserForm = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    permissionIds: [],
    zoneIds: [],
    assignBanca: false,
    bettingPoolId: null
  });

  // Permissions state
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(true);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  /**
   * Load permissions from API
   * useCallback: Prevents recreation on every render
   */
  const loadPermissions = useCallback(async () => {
    try {
      setLoadingPermissions(true);
      setErrors(prev => ({ ...prev, permissions: undefined }));

      logger.info('CREATE_USER_MUI', 'Loading permissions from API...');

      const response: any = await permissionService.getPermissionCategories();

      logger.debug('CREATE_USER_MUI', 'Permissions API response received', {
        success: response.success,
        hasData: !!response.data,
        dataLength: response.data?.length
      });

      if (response.success && response.data) {
        setPermissionCategories(response.data);
        setErrors(prev => ({ ...prev, permissions: undefined }));

        logger.success('CREATE_USER_MUI', `Loaded ${response.data.length} permission categories`, {
          categories: response.data.map((c: PermissionCategory) => ({
            name: c.category,
            count: c.permissions?.length || 0
          }))
        });
      } else {
        logger.warning('CREATE_USER_MUI', 'API response success=false or no data', response);
        setErrors(prev => ({ ...prev, permissions: 'No se pudieron cargar los permisos' }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('CREATE_USER_MUI', 'Failed to load permissions', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });

      if (errorMessage !== 'Network Error' || permissionCategories.length === 0) {
        setErrors(prev => ({ ...prev, permissions: `Error al cargar permisos: ${errorMessage}` }));
      }
    } finally {
      setLoadingPermissions(false);
    }
  }, [permissionCategories.length]); // Dependencies: only recreate if needed

  // Load permissions on mount
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  /**
   * Handle form field changes
   * useCallback: Prevents recreation on every render
   */
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;

    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, [errors]); // Dependencies: errors (to clear field errors)

  /**
   * Handle permission checkbox changes
   * useCallback: Prevents recreation on every render
   */
  const handlePermissionChange = useCallback((permissionId: number, checked: boolean) => {
    logger.debug('PERMISSION_CHANGE', `Permission ${permissionId} ${checked ? 'selected' : 'deselected'}`);

    setFormData(prev => ({
      ...prev,
      permissionIds: checked
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter(id => id !== permissionId)
    }));

    // Clear permissions error when user selects a permission
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: undefined }));
    }
  }, [errors.permissions]); // Dependencies: errors.permissions

  /**
   * Handle zone selection changes
   * useCallback: Prevents recreation on every render
   */
  const handleZoneChange = useCallback((zoneIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      zoneIds: zoneIds,
      // Reset bettingPool selection if zones change
      bettingPoolId: null
    }));

    if (errors.zones) {
      setErrors(prev => ({ ...prev, zones: undefined }));
    }
  }, [errors.zones]); // Dependencies: errors.zones

  /**
   * Handle bettingPool selection changes
   * useCallback: Prevents recreation on every render
   */
  const handleBranchChange = useCallback((bettingPoolId: number | null) => {
    setFormData(prev => ({
      ...prev,
      bettingPoolId: bettingPoolId
    }));

    if (errors.bettingPool) {
      setErrors(prev => ({ ...prev, bettingPool: undefined }));
    }
  }, [errors.bettingPool]); // Dependencies: errors.bettingPool

  /**
   * Validate form before submission
   * useCallback: Prevents recreation on every render
   */
  const validateForm = useCallback(() => {
    const newErrors: Errors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Permissions validation (at least one permission required)
    if (formData.permissionIds.length === 0) {
      newErrors.permissions = 'Debe seleccionar al menos un permiso';
    }

    // Branch validation (required if assignBanca is true)
    if (formData.assignBanca && !formData.bettingPoolId) {
      newErrors.bettingPool = 'Debe seleccionar una banca';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Dependencies: formData (validates current form data)

  /**
   * Handle form submission
   * useCallback: Prevents recreation on every render
   */
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    logger.info('CREATE_USER_MUI', 'Form submitted');

    // Clear previous messages
    setSuccessMessage('');

    // Validate form
    if (!validateForm()) {
      logger.warning('CREATE_USER_MUI', 'Form validation failed', { errors });
      return;
    }

    logger.info('CREATE_USER_MUI', 'Form validation passed');
    setLoading(true);

    try {
      // Prepare data for API
      const userData = {
        username: formData.username,
        password: formData.password,
        permissionIds: formData.permissionIds,
        zoneIds: formData.zoneIds,
        bettingPoolId: formData.assignBanca ? formData.bettingPoolId : null
      };

      logger.info('CREATE_USER_MUI', 'Sending user data to API', {
        username: userData.username,
        permissionsCount: userData.permissionIds.length,
        permissionIds: userData.permissionIds,
        zonesCount: userData.zoneIds.length,
        zoneIds: userData.zoneIds,
        endpoint: '/users/with-permissions'
      });

      // Create user with permissions
      const response: any = await userService.createUser(userData);

      if (response.success) {
        logger.success('CREATE_USER_MUI', 'User created successfully', {
          userId: response.data?.userId,
          username: response.data?.username
        });

        setSuccessMessage('Usuario creado exitosamente');

        // Redirect to user list after 2 seconds
        setTimeout(() => {
          logger.info('CREATE_USER_MUI', 'Redirecting to user list');
          navigate('/users/list');
        }, 2000);
      }
    } catch (error) {
      logger.error('CREATE_USER_MUI', 'Failed to create user', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        response: error
      });

      const errorMessage = handleApiError(error);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, navigate, errors]); // Dependencies: formData, validateForm, navigate

  /**
   * Reset form to initial state
   * useCallback: Prevents recreation on every render
   */
  const resetForm = useCallback(() => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      permissionIds: [],
      zoneIds: [],
      assignBanca: false,
      bettingPoolId: null
    });
    setErrors({});
    setSuccessMessage('');
  }, []); // Dependencies: none (only uses setters)

  return {
    // Form data
    formData,

    // Permissions
    permissionCategories,
    loadingPermissions,
    loadPermissions,

    // UI state
    loading,
    errors,
    successMessage,
    setSuccessMessage,

    // Handlers
    handleChange,
    handlePermissionChange,
    handleZoneChange,
    handleBranchChange,
    handleSubmit,
    resetForm
  };
};

export default useUserForm;
