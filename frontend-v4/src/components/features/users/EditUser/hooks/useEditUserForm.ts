import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, permissionService } from '@/services';
import * as logger from '@/utils/logger';
import { handleApiError } from '@/utils';
import type { User, UserFormData, FormErrors, PermissionCategory, ApiResponse } from '@/types/user';

interface ApiError {
  message: string;
  stack?: string;
}

// User response from API (handles both PascalCase and camelCase)
interface UserApiData {
  Username?: string;
  username?: string;
  ZoneIds?: number[];
  zoneIds?: number[];
  zones?: Array<{ zoneId?: number; ZoneId?: number }>;
  zoneId?: number;
  ZoneId?: number;
  BettingPoolId?: number | null;
  bettingPoolId?: number | null;
}

// Permissions response formats
interface PermissionItem {
  PermissionId?: number;
  permissionId?: number;
}

interface PermissionsApiData {
  directPermissions?: PermissionItem[];
  flatPermissions?: PermissionItem[];
}

interface EditUserFormData {
  username: string;
  assignBanca: boolean;
  zoneIds: number[];
  bettingPoolId: number | null;
  permissionIds: number[];
}

/**
 * Custom hook for managing edit user form state and operations
 * Handles loading existing user data, form validation, and updates
 */
const useEditUserForm = (userId: string | undefined) => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<EditUserFormData>({
    username: '',
    assignBanca: false,
    zoneIds: [],
    bettingPoolId: null,
    permissionIds: [],
  });

  // Permissions state
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(true);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<boolean>(false);

  /**
   * Load permissions categories on mount
   */
  useEffect(() => {
    loadPermissions();
  }, []);

  /**
   * Load user data from API
   */
  useEffect(() => {
    if (!userId) {
      logger.error('EDIT_USER_MUI', 'No userId provided');
      setErrors({ submit: 'ID de usuario no proporcionado' });
      setLoadingUser(false);
      return;
    }

    loadUserData();
  }, [userId]);

  /**
   * Load permissions from API
   */
  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      logger.info('EDIT_USER_MUI', 'Loading permission categories...');

      const response = await permissionService.getPermissionCategories() as ApiResponse<PermissionCategory[]>;

      if (response.success && response.data) {
        setPermissionCategories(response.data);
        logger.success('EDIT_USER_MUI', `Loaded ${response.data.length} permission categories`);
      }
    } catch (err) {
      const error = err as ApiError;
      logger.error('EDIT_USER_MUI', 'Failed to load permissions', {
        message: error.message,
        stack: error.stack
      });

      if (error.message !== 'Network Error') {
        setErrors(prev => ({ ...prev, permissions: `Error al cargar permisos: ${error.message}` }));
      }
    } finally {
      setLoadingPermissions(false);
    }
  };

  /**
   * Load user data and permissions
   */
  const loadUserData = async () => {
    try {
      setLoadingUser(true);
      setErrors({});
      logger.info('EDIT_USER_MUI', `Loading user data for ID: ${userId}`);

      // Load user basic data
      const userResponse = await userService.getUserById(userId || '') as ApiResponse<UserApiData>;

      if (!userResponse.success || !userResponse.data) {
        setErrors({ submit: 'No se pudo cargar el usuario' });
        setLoadingUser(false);
        return;
      }

      const user: UserApiData = userResponse.data;

      // Parse zone IDs from different possible formats
      // API returns ZoneIds (PascalCase) from UserDetailDto
      let zoneIds: number[] = [];
      if (user.ZoneIds && Array.isArray(user.ZoneIds)) {
        zoneIds = user.ZoneIds;
      } else if (user.zoneIds && Array.isArray(user.zoneIds)) {
        // Fallback: camelCase (if API is configured for camelCase serialization)
        zoneIds = user.zoneIds;
      } else if (user.zones && Array.isArray(user.zones)) {
        // Fallback: zones array of objects
        zoneIds = user.zones.map(z => z.zoneId || z.ZoneId).filter((id): id is number => id !== undefined);
      } else if (user.zoneId || user.ZoneId) {
        // Fallback: single zone (old structure)
        const singleZone = user.zoneId || user.ZoneId;
        if (singleZone) zoneIds = [singleZone];
      }

      // Extract user fields handling both PascalCase and camelCase
      const username = user.Username || user.username || '';
      const bettingPoolId = user.BettingPoolId !== undefined ? user.BettingPoolId : user.bettingPoolId;

      // Set basic user data
      setFormData(prev => ({
        ...prev,
        username: username,
        zoneIds: zoneIds,
        bettingPoolId: bettingPoolId || null,
        assignBanca: !!bettingPoolId,
      }));

      // Load user permissions
      try {
        const permsResponse = await userService.getUserPermissions(userId || '') as ApiResponse<PermissionsApiData | PermissionItem[]>;
        logger.debug('EDIT_USER_MUI', 'Permissions response:', permsResponse);

        if (permsResponse.success && permsResponse.data) {
          let permissionsArray: PermissionItem[] = [];

          // Handle different response formats
          const data = permsResponse.data;
          if (!Array.isArray(data) && data.directPermissions && Array.isArray(data.directPermissions)) {
            permissionsArray = data.directPermissions;
          } else if (!Array.isArray(data) && data.flatPermissions && Array.isArray(data.flatPermissions)) {
            permissionsArray = data.flatPermissions;
          } else if (Array.isArray(data)) {
            permissionsArray = data;
          }

          // Handle both PascalCase and camelCase for permission IDs
          const permIds = permissionsArray
            .map(p => p.PermissionId || p.permissionId)
            .filter((id): id is number => id !== undefined);

          setFormData(prev => ({
            ...prev,
            permissionIds: permIds,
          }));

          logger.success('EDIT_USER_MUI', `Loaded user with ${permIds.length} permissions`);
        }
      } catch (permErr) {
        const permError = permErr as ApiError;
        logger.warning('EDIT_USER_MUI', 'Could not load permissions', { error: permError.message });
        // Don't block loading, just log the warning
      }
    } catch (err) {
      const error = err as ApiError;
      logger.error('EDIT_USER_MUI', 'Failed to load user', { error: error.message });
      setErrors({ submit: 'Error al cargar usuario. Verifica que la API esté corriendo.' });
    } finally {
      setLoadingUser(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /**
   * Handle zone selection changes
   */
  const handleZoneChange = (zoneIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      zoneIds: zoneIds,
    }));

    // Clear zone error
    if (errors.zones) {
      setErrors(prev => ({ ...prev, zones: null }));
    }
  };

  /**
   * Handle bettingPool selection changes
   */
  const handleBranchChange = (bettingPoolId: number | null) => {
    setFormData(prev => ({
      ...prev,
      bettingPoolId: bettingPoolId,
    }));

    // Clear bettingPool error
    if (errors.bettingPool) {
      setErrors(prev => ({ ...prev, bettingPool: null }));
    }
  };

  /**
   * Handle assignBanca toggle
   */
  const handleAssignBancaChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignBanca: checked,
      bettingPoolId: checked ? prev.bettingPoolId : null,
    }));

    // Clear bettingPool error if unchecked
    if (!checked && errors.bettingPool) {
      setErrors(prev => ({ ...prev, bettingPool: null }));
    }
  };

  /**
   * Handle permission checkbox changes (individual toggle)
   */
  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    logger.debug('PERMISSION_CHANGE', `Permission ${permissionId} ${checked ? 'selected' : 'deselected'}`);

    setFormData(prev => ({
      ...prev,
      permissionIds: checked
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter(id => id !== permissionId),
    }));

    // Clear permissions error
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: null }));
    }
  };

  /**
   * Handle permission selection changes (bulk update)
   */
  const handlePermissionsChange = (permissionIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: permissionIds,
    }));

    // Clear permissions error
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: null }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Zone validation - required if assignBanca is true
    if (formData.assignBanca && formData.zoneIds.length === 0) {
      newErrors.zones = 'Debe seleccionar al menos una zona';
    }

    // Branch validation - required if assignBanca is true
    if (formData.assignBanca && !formData.bettingPoolId) {
      newErrors.bettingPool = 'Debe seleccionar una banca';
    }

    // Permissions validation
    if (formData.permissionIds.length === 0) {
      newErrors.permissions = 'Debe seleccionar al menos un permiso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    logger.info('EDIT_USER_MUI', 'Form submitted');
    setSuccess(false);

    if (!validateForm()) {
      logger.warning('EDIT_USER_MUI', 'Form validation failed', { errors });
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        permissionIds: formData.permissionIds,
        zoneIds: formData.assignBanca ? formData.zoneIds : [],
        bettingPoolId: formData.assignBanca && formData.bettingPoolId ? formData.bettingPoolId : undefined,
      };

      logger.info('EDIT_USER_MUI', 'Updating user', {
        userId,
        username: formData.username,
        permissionsCount: updateData.permissionIds.length,
        zonesCount: updateData.zoneIds.length,
      });

      const response = await userService.updateUserComplete(userId || '', updateData);

      if (response.success) {
        logger.success('EDIT_USER_MUI', 'User updated successfully');
        setSuccess(true);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/users/list');
        }, 2000);
      }
    } catch (err) {
      const error = err as ApiError;
      logger.error('EDIT_USER_MUI', 'Failed to update user', { error: error.message });
      const errorMessage = handleApiError(error);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retry loading user data
   */
  const handleRetry = () => {
    setErrors({});
    setLoadingUser(true);
    loadUserData();
  };

  return {
    // Form data
    formData,

    // Permissions
    permissionCategories,
    loadingPermissions,
    loadPermissions,

    // UI state
    loading,
    loadingUser,
    errors,
    success,

    // Handlers
    handleChange,
    handleZoneChange,
    handleBranchChange,
    handleAssignBancaChange,
    handlePermissionChange,
    handlePermissionsChange,
    handleSubmit,
    handleRetry,
  };
};

export default useEditUserForm;
