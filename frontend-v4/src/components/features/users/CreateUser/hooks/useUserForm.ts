/**
 * Custom hook for CreateUser form logic
 * Handles form state, validation, and submission
 *
 * OPTIMIZED: useCallback added for all handlers (2025-10-30)
 */

import { useState, useEffect, useCallback, useMemo, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService, permissionService } from '@/services'
import { handleApiError } from '@/utils'
import * as logger from '@/utils/logger'
import type { User, UserFormData, FormErrors, PermissionCategory, ApiResponse } from '@/types/user'

interface ApiError {
  message: string;
  stack?: string;
  response?: unknown;
}

const useUserForm = () => {
  const navigate = useNavigate()

  // Form state — password is auto-generated server-side
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    permissionIds: [],
    zoneIds: [],
    assignBanca: false,
    bettingPoolId: null
  })

  // Temp credential dialog state
  const [tempCredential, setTempCredential] = useState<{ open: boolean; username: string; password: string }>({
    open: false,
    username: '',
    password: '',
  })

  // Permissions state
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(true)

  /**
   * Banca (POS) users can only receive permissions from two groups:
   *   - Acceso al sistema (full)
   *   - Tickets → only SELL_TICKETS
   * For admin users, the full list is shown.
   */
  const visiblePermissionCategories = useMemo<PermissionCategory[]>(() => {
    if (!formData.assignBanca) return permissionCategories
    return permissionCategories
      .map(cat => {
        if (cat.category === 'Acceso al sistema') {
          // POS users don't need the admin dashboard; only basic system access.
          return {
            ...cat,
            permissions: cat.permissions.filter(p => p.permissionCode !== 'ADMIN_DASHBOARD')
          }
        }
        if (cat.category === 'Tickets') {
          return {
            ...cat,
            permissions: cat.permissions.filter(p => p.permissionCode === 'SELL_TICKETS')
          }
        }
        return { ...cat, permissions: [] }
      })
      .filter(cat => cat.permissions.length > 0)
  }, [permissionCategories, formData.assignBanca])

  // Prune any selected permissions that are no longer visible (e.g. user toggled assignBanca on).
  const allowedPermissionIds = useMemo(
    () => new Set(visiblePermissionCategories.flatMap(c => c.permissions.map(p => p.permissionId))),
    [visiblePermissionCategories]
  )
  useEffect(() => {
    setFormData(prev => {
      const filtered = prev.permissionIds.filter(id => allowedPermissionIds.has(id))
      return filtered.length === prev.permissionIds.length ? prev : { ...prev, permissionIds: filtered }
    })
  }, [allowedPermissionIds])

  // UI state
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState<string>('')

  /**
   * Load permissions from API
   * useCallback: Prevents recreation on every render
   */
  const loadPermissions = useCallback(async () => {
    try {
      setLoadingPermissions(true)
      setErrors(prev => ({ ...prev, permissions: null }))

      logger.info('CREATE_USER_MUI', 'Loading permissions from API...')

      const response = await permissionService.getPermissionCategories() as ApiResponse<PermissionCategory[]>

      logger.debug('CREATE_USER_MUI', 'Permissions API response received', {
        success: response.success,
        hasData: !!response.data,
        dataLength: response.data?.length
      })

      if (response.success && response.data) {
        setPermissionCategories(response.data)
        setErrors(prev => ({ ...prev, permissions: null }))

        logger.success('CREATE_USER_MUI', `Loaded ${response.data.length} permission categories`, {
          categories: response.data.map((c: PermissionCategory) => ({
            name: c.category,
            count: c.permissions?.length || 0
          }))
        })
      } else {
        logger.warning('CREATE_USER_MUI', 'API response success=false or no data')
        setErrors(prev => ({ ...prev, permissions: 'No se pudieron cargar los permisos' }))
      }
    } catch (err) {
      const error = err as ApiError
      logger.error('CREATE_USER_MUI', 'Failed to load permissions', {
        error: error.message,
        stack: error.stack
      })

      if (error.message !== 'Network Error' || permissionCategories.length === 0) {
        setErrors(prev => ({ ...prev, permissions: `Error al cargar permisos: ${error.message}` }))
      }
    } finally {
      setLoadingPermissions(false)
    }
  }, [permissionCategories.length]) // Dependencies: only recreate if needed

  // Load permissions on mount
  useEffect(() => {
    loadPermissions()
  }, [loadPermissions])

  /**
   * Handle form field changes
   * useCallback: Prevents recreation on every render
   */
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target

    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }, [errors]) // Dependencies: errors (to clear field errors)

  /**
   * Handle permission checkbox changes
   * useCallback: Prevents recreation on every render
   */
  const handlePermissionChange = useCallback((permissionId: number, checked: boolean) => {
    logger.debug('PERMISSION_CHANGE', `Permission ${permissionId} ${checked ? 'selected' : 'deselected'}`)

    setFormData(prev => ({
      ...prev,
      permissionIds: checked
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter(id => id !== permissionId)
    }))

    // Clear permissions error when user selects a permission
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: null }))
    }
  }, [errors.permissions]) // Dependencies: errors.permissions

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
    }))

    if (errors.zones) {
      setErrors(prev => ({ ...prev, zones: null }))
    }
  }, [errors.zones]) // Dependencies: errors.zones

  /**
   * Handle bettingPool selection changes
   * useCallback: Prevents recreation on every render
   */
  const handleBranchChange = useCallback((bettingPoolId: number | null) => {
    setFormData(prev => ({
      ...prev,
      bettingPoolId: bettingPoolId
    }))

    if (errors.bettingPool) {
      setErrors(prev => ({ ...prev, bettingPool: null }))
    }
  }, [errors.bettingPool]) // Dependencies: errors.bettingPool

  /**
   * Validate form before submission
   * useCallback: Prevents recreation on every render
   */
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido'
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres'
    }

    // Password is auto-generated by the server, no client validation needed.

    // Permissions validation (at least one permission required)
    if (formData.permissionIds.length === 0) {
      newErrors.permissions = 'Debe seleccionar al menos un permiso'
    }

    // Branch validation (required if assignBanca is true)
    if (formData.assignBanca && !formData.bettingPoolId) {
      newErrors.bettingPool = 'Debe seleccionar una banca'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData]) // Dependencies: formData (validates current form data)

  /**
   * Handle form submission
   * useCallback: Prevents recreation on every render
   */
  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    logger.info('CREATE_USER_MUI', 'Form submitted')

    // Clear previous messages
    setSuccessMessage('')

    // Validate form
    if (!validateForm()) {
      logger.warning('CREATE_USER_MUI', 'Form validation failed', { errors })
      return
    }

    logger.info('CREATE_USER_MUI', 'Form validation passed')
    setLoading(true)

    try {
      // Server auto-generates the temp password. Don't send one.
      const userData = {
        username: formData.username,
        permissionIds: formData.permissionIds,
        zoneIds: formData.zoneIds,
        bettingPoolId: formData.assignBanca && formData.bettingPoolId ? formData.bettingPoolId : undefined
      }

      logger.info('CREATE_USER_MUI', 'Sending user data to API', {
        username: userData.username,
        permissionsCount: userData.permissionIds.length,
        permissionIds: userData.permissionIds,
        zonesCount: userData.zoneIds.length,
        zoneIds: userData.zoneIds,
        endpoint: '/users/with-permissions'
      })

      const response = await userService.createUser(userData) as ApiResponse<User>

      if (response.success) {
        logger.success('CREATE_USER_MUI', 'User created successfully', {
          userId: response.data?.userId,
          username: response.data?.username
        })

        const created = response.data
        if (created?.temporaryPassword) {
          // Show one-time temp credential — admin closes it and we navigate.
          setTempCredential({
            open: true,
            username: created.username || formData.username,
            password: created.temporaryPassword,
          })
        } else {
          setSuccessMessage('Usuario creado exitosamente')
          setTimeout(() => navigate('/users/list'), 2000)
        }
      }
    } catch (err) {
      const error = err as ApiError
      logger.error('CREATE_USER_MUI', 'Failed to create user', {
        error: error.message,
        response: error.response
      })

      const errorMessage = handleApiError(error)
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- errors is set inside, not a dependency
  }, [formData, validateForm, navigate]) // Dependencies: formData, validateForm, navigate

  /**
   * Reset form to initial state
   * useCallback: Prevents recreation on every render
   */
  const resetForm = useCallback(() => {
    setFormData({
      username: '',
      permissionIds: [],
      zoneIds: [],
      assignBanca: false,
      bettingPoolId: null
    })
    setErrors({})
    setSuccessMessage('')
  }, []) // Dependencies: none (only uses setters)

  const closeTempCredentialAndNavigate = useCallback(() => {
    setTempCredential({ open: false, username: '', password: '' })
    navigate('/users/list')
  }, [navigate])

  return {
    // Form data
    formData,

    // Permissions
    permissionCategories: visiblePermissionCategories,
    loadingPermissions,
    loadPermissions,

    // UI state
    loading,
    errors,
    successMessage,
    setSuccessMessage,
    tempCredential,
    closeTempCredentialAndNavigate,

    // Handlers
    handleChange,
    handlePermissionChange,
    handleZoneChange,
    handleBranchChange,
    handleSubmit,
    resetForm
  }
}

export default useUserForm
