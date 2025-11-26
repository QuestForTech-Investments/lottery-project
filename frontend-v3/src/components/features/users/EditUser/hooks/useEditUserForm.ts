import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, permissionService } from '@/services';
import * as logger from '@/utils/logger';
import { handleApiError } from '@/utils';

/**
 * Permission interface
 */
interface Permission {
  permissionId?: number;
  PermissionId?: number;
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
  assignBanca: boolean;
  zoneIds: number[];
  bettingPoolId: number | null;
  permissionIds: number[];
}

/**
 * Errors interface
 */
interface Errors {
  zones?: string;
  bettingPool?: string;
  permissions?: string;
  submit?: string;
  [key: string]: string | undefined;
}

/**
 * Custom hook for managing edit user form state and operations
 * Handles loading existing user data, form validation, and updates
 */
const useEditUserForm = (userId: string | undefined) => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<FormData>({
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
  const [errors, setErrors] = useState<Errors>({});
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

      const response: any = await permissionService.getPermissionCategories();

      if (response.success && response.data) {
        setPermissionCategories(response.data);
        logger.success('EDIT_USER_MUI', `Loaded ${response.data.length} permission categories`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('EDIT_USER_MUI', 'Failed to load permissions', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });

      if (errorMessage !== 'Network Error' || permissionCategories.length === 0) {
        setErrors(prev => ({ ...prev, permissions: `Error al cargar permisos: ${errorMessage}` }));
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
      const userResponse: any = await userService.getUserById(userId!);

      if (!userResponse.success || !userResponse.data) {
        setErrors({ submit: 'No se pudo cargar el usuario' });
        setLoadingUser(false);
        return;
      }

      const user = userResponse.data;

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
        zoneIds = user.zones.map((z: any) => z.zoneId || z.ZoneId);
      } else if (user.zoneId || user.ZoneId) {
        // Fallback: single zone (old structure)
        zoneIds = [user.zoneId || user.ZoneId];
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
        const permsResponse: any = await userService.getUserPermissions(userId!);
        console.log('🔵 EDIT_USER_MUI - Full permissions response:', permsResponse);
        logger.debug('EDIT_USER_MUI', 'Permissions response:', permsResponse);

        if (permsResponse.success && permsResponse.data) {
          console.log('🔵 EDIT_USER_MUI - permsResponse.data:', permsResponse.data);
          let permissionsArray: Permission[] = [];

          // Handle different response formats
          if (permsResponse.data.directPermissions && Array.isArray(permsResponse.data.directPermissions)) {
            permissionsArray = permsResponse.data.directPermissions;
            console.log('🔵 EDIT_USER_MUI - Using directPermissions:', permissionsArray);
          } else if (permsResponse.data.flatPermissions && Array.isArray(permsResponse.data.flatPermissions)) {
            permissionsArray = permsResponse.data.flatPermissions;
            console.log('🔵 EDIT_USER_MUI - Using flatPermissions:', permissionsArray);
          } else if (Array.isArray(permsResponse.data)) {
            permissionsArray = permsResponse.data;
            console.log('🔵 EDIT_USER_MUI - Using permsResponse.data as array:', permissionsArray);
          } else {
            console.log('🔴 EDIT_USER_MUI - Unknown permissions format:', permsResponse.data);
          }

          // Handle both PascalCase and camelCase for permission IDs
          const permIds = permissionsArray.map((p: Permission) => p.PermissionId || p.permissionId).filter(Boolean) as number[];
          console.log('🔵 EDIT_USER_MUI - Extracted permission IDs:', permIds);

          setFormData(prev => ({
            ...prev,
            permissionIds: permIds,
          }));

          logger.success('EDIT_USER_MUI', `Loaded user with ${permIds.length} permissions`);
        } else {
          console.log('🔴 EDIT_USER_MUI - permsResponse invalid:', permsResponse);
        }
      } catch (permError) {
        console.error('🔴 EDIT_USER_MUI - Permission loading error:', permError);
        logger.warning('EDIT_USER_MUI', 'Could not load permissions', { error: permError instanceof Error ? permError.message : 'Unknown error' });
        // Don't block loading, just log the warning
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('EDIT_USER_MUI', 'Failed to load user', { error: errorMessage });
      setErrors({ submit: 'Error al cargar usuario. Verifica que la API esté corriendo.' });
    } finally {
      setLoadingUser(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
      setErrors(prev => ({ ...prev, zones: undefined }));
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
      setErrors(prev => ({ ...prev, bettingPool: undefined }));
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
      setErrors(prev => ({ ...prev, bettingPool: undefined }));
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
      setErrors(prev => ({ ...prev, permissions: undefined }));
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
      setErrors(prev => ({ ...prev, permissions: undefined }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Errors = {};

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
  const handleSubmit = async (e: React.FormEvent) => {
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
        bettingPoolId: formData.assignBanca ? formData.bettingPoolId : null,
      };

      logger.info('EDIT_USER_MUI', 'Updating user', {
        userId,
        username: formData.username,
        permissionsCount: updateData.permissionIds.length,
        zonesCount: updateData.zoneIds.length,
      });

      const response: any = await userService.updateUserComplete(userId!, updateData);

      if (response.success) {
        logger.success('EDIT_USER_MUI', 'User updated successfully');
        setSuccess(true);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/users/list');
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('EDIT_USER_MUI', 'Failed to update user', { error: errorMessage });
      const errorMsg = handleApiError(error);
      setErrors({ submit: errorMsg });
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
