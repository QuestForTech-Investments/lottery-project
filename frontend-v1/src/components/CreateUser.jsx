import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { userService, permissionService } from '@/services'
import { validatePassword, handleApiError } from '@/utils'
import * as logger from '@/utils/logger'
import ReactMultiselect from './users/ReactMultiselect'
import BranchSelector from './users/BranchSelector'
import '../assets/css/create-user.css'
import '../assets/css/branch-selector.css'

export default function CreateUser() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    permissionIds: [],
    zoneIds: [], // Array of selected zone IDs
    assignBanca: false, // Toggle for assigning a specific branch
    branchId: null // Selected branch ID
  })

  const [permissionCategories, setPermissionCategories] = useState([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")

  // Load permissions on component mount
  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true)
      // Clear any previous permission errors
      setErrors(prev => ({ ...prev, permissions: null }))
      logger.info('CREATE_USER', 'Loading permissions from API...')
      
      const response = await permissionService.getPermissionCategories()
      
      logger.debug('CREATE_USER', 'Permissions API response received', {
        success: response.success,
        hasData: !!response.data,
        dataLength: response.data?.length,
        fullResponse: response
      })
      
      if (response.success && response.data) {
        setPermissionCategories(response.data)
        // Clear any permission errors since we loaded successfully
        setErrors(prev => ({ ...prev, permissions: null }))
        logger.success('CREATE_USER', `✅ Loaded ${response.data.length} permission categories`, {
          categories: response.data.map(c => ({
            name: c.category,
            count: c.permissions?.length || 0
          })),
          totalPermissions: response.data.reduce((sum, c) => sum + (c.permissions?.length || 0), 0)
        })
      } else {
        logger.warning('CREATE_USER', 'API response success=false or no data', response)
        setErrors(prev => ({ ...prev, permissions: 'No se pudieron cargar los permisos' }))
      }
    } catch (error) {
      logger.error('CREATE_USER', '❌ Failed to load permissions', {
        error: error.message,
        stack: error.stack,
        response: error.response
      })
      console.error('Error loading permissions:', error)
      
      // Only show error if it's a real error, not a network timeout
      if (error.message !== 'Network Error' || permissionCategories.length === 0) {
        setErrors(prev => ({ ...prev, permissions: `Error al cargar permisos: ${error.message}` }))
      }
    } finally {
      setLoadingPermissions(false)
      logger.info('CREATE_USER', `Permissions loading finished. State: ${permissionCategories.length} categories`)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handlePermissionChange = (permissionId, checked) => {
    logger.debug('PERMISSION_CHANGE', `Permission ${permissionId} ${checked ? 'selected' : 'deselected'}`)
    
    setFormData(prev => ({
      ...prev,
      permissionIds: checked 
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter(id => id !== permissionId)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "El usuario es requerido"
    } else if (formData.username.length < 3) {
      newErrors.username = "El usuario debe tener al menos 3 caracteres"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    // Permissions validation (optional - no validation needed)
    // Permissions are now optional, user can be created without permissions

    // Zones validation (optional - no validation needed)
    // Zones are now optional, user can be created without zones

    // Branch validation (required if assignBanca is true)
    if (formData.assignBanca && !formData.branchId) {
      newErrors.branch = "Debe seleccionar una banca"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    logger.info('CREATE_USER', 'Form submitted')
    
    // Clear previous messages
    setSuccessMessage("")
    
    // Validate form
    if (!validateForm()) {
      logger.warning('CREATE_USER', 'Form validation failed', { errors })
      return
    }

    logger.info('CREATE_USER', 'Form validation passed')
    setLoading(true)

    try {
      // Prepare data for API (only send what's needed)
    const userData = {
      username: formData.username,
      password: formData.password,
      permissionIds: formData.permissionIds,
      zoneIds: formData.zoneIds,
      branchId: formData.assignBanca ? formData.branchId : null
    }

      console.log('🟢 CREATE USER - Data being sent:', userData)
      console.log('🟢 CREATE USER - Permission IDs:', userData.permissionIds)
      console.log('🟢 CREATE USER - Permission IDs count:', userData.permissionIds.length)
      console.log('🟢 CREATE USER - Zone IDs:', userData.zoneIds)
      console.log('🟢 CREATE USER - Zone IDs count:', userData.zoneIds.length)

      logger.info('CREATE_USER', 'Sending user data to API', {
        username: userData.username,
        permissionsCount: userData.permissionIds.length,
        permissionIds: userData.permissionIds,
        zonesCount: userData.zoneIds.length,
        zoneIds: userData.zoneIds,
        endpoint: '/users/with-permissions'
      })

      // Create user with permissions
      const response = await userService.createUser(userData)
      
      console.log('🟢 CREATE USER - API Response:', response)

      if (response.success) {
        logger.success('CREATE_USER', 'User created successfully', {
          userId: response.data?.userId,
          username: response.data?.username
        })
        setSuccessMessage("✅ Usuario creado exitosamente")
        
        // Reset form
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          permissionIds: []
        })
        
        // Redirect to user list after 2 seconds
        setTimeout(() => {
          logger.info('CREATE_USER', 'Redirecting to user list')
          navigate('/usuarios/lista')
        }, 2000)
      }
    } catch (error) {
      logger.error('CREATE_USER', 'Failed to create user', {
        error: error.message,
        response: error.response
      })
      const errorMessage = handleApiError(error)
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }


  return (
    <div id="page-content" className="content">
      <div>
        <div className="card card-task">
          <div className="card-header">
            <h3 className="header text-center">
              <span>Crear usuario</span>
            </h3>
          </div>
          
          <div className="card-body">
            {/* Success Message */}
            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <strong>{successMessage}</strong>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => setSuccessMessage("")}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Error:</strong> {errors.submit}
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => setErrors(prev => ({ ...prev, submit: null }))}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Basic Fields */}
              <div className="row justify-content-center">
                <div className="col-12">
                  {/* Username */}
                  <div className="form-group row align-items-center">
                    <label htmlFor="username" className="col-sm-2 offset-sm-2 col-form-label">
                      Usuario <span className="text-danger">*</span>
                    </label>
                    <div className="col-sm-4">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        autoFocus
                        autoComplete="off"
                        placeholder="Nombre de usuario"
                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                      {errors.username && (
                        <div className="invalid-feedback d-block">{errors.username}</div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                    <div className="form-group row align-items-center">
                      <label htmlFor="password" className="col-sm-2 offset-sm-2 col-form-label">
                      Contraseña <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-4">
                          <input
                            type="password"
                            id="password"
                            name="password"
                        autoComplete="new-password"
                        placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            value={formData.password}
                            onChange={handleChange}
                        required
                      />
                      {errors.password && (
                        <div className="invalid-feedback d-block">{errors.password}</div>
                      )}
                    </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group row align-items-center">
                    <label htmlFor="confirmPassword" className="col-sm-2 offset-sm-2 col-form-label">
                      Confirmar <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-4">
                          <input
                            type="password"
                        id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Confirmar contraseña"
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        required
                          />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                      )}
                        </div>
                      </div>

                    {/* Zones Selection */}
                    <div className="form-group row align-items-start">
                      <label htmlFor="zoneIds" className="col-sm-2 offset-sm-2 col-form-label">
                        Zonas
                      </label>
                      <div className="col-sm-6">
                        <ReactMultiselect
                          value={formData.zoneIds}
                          onChange={(zoneIds) => {
                            setFormData(prev => ({
                              ...prev,
                              zoneIds: zoneIds,
                              // Reset branch selection if zones change
                              branchId: null
                            }))
                            if (errors.zones) {
                              setErrors(prev => ({ ...prev, zones: null }))
                            }
                          }}
                          placeholder="Seleccionar zonas..."
                          required={false}
                        />
                        {errors.zones && (
                          <div className="text-danger mt-1">{errors.zones}</div>
                        )}
                      </div>
                    </div>

                    {/* Privilegios Label */}
                    <div className="row">
                      <div className="col-sm-8 offset-sm-2">
                        <div className="privilegios-title">PRIVILEGIOS</div>
                      </div>
                    </div>

                    {/* Assign Branch Toggle */}
                    {/* <div className="form-group row align-items-center">
                      <label htmlFor="assignBanca" className="col-sm-2 offset-sm-2 col-form-label">
                        Asignar Banca
                      </label>
                      <div className="col-sm-6">
                        <label className="simple-toggle">
                          <input
                            type="checkbox"
                            id="assignBanca"
                            name="assignBanca"
                            checked={formData.assignBanca}
                            onChange={handleChange}
                            disabled={formData.zoneIds.length === 0}
                          />
                          <span className="simple-slider"></span>
                        </label>
                        {formData.zoneIds.length === 0 && (
                          <small className="text-muted d-block mt-1">
                            <i className="fas fa-info-circle"></i> Selecciona zonas primero para habilitar la asignación de banca
                          </small>
                        )}
                      </div>
                    </div> */}

                    {/* Branch Selection */}
                    {/* {formData.assignBanca && formData.zoneIds.length > 0 && (
                      <div className="form-group row align-items-start">
                        <label htmlFor="branchId" className="col-sm-2 offset-sm-2 col-form-label">
                          Banca <span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-6">
                          <BranchSelector
                            value={formData.branchId}
                            onChange={(branchId) => {
                              setFormData(prev => ({
                                ...prev,
                                branchId: branchId
                              }))
                              if (errors.branch) {
                                setErrors(prev => ({ ...prev, branch: null }))
                              }
                            }}
                            selectedZoneIds={formData.zoneIds}
                            placeholder="Seleccionar banca..."
                            required={formData.assignBanca}
                          />
                          {errors.branch && (
                            <div className="text-danger mt-1">{errors.branch}</div>
                          )}
                        </div>
                      </div>
                    )} */}

                </div>
              </div>

              {/* Permissions */}
              <div className="form-group checkboxes">
                {errors.permissions && (
                  <div className="row">
                    <div className="col-12 text-center">
                      <div className="alert alert-danger" role="alert">
                        {errors.permissions}
                      </div>
                    </div>
                  </div>
                )}

                {loadingPermissions ? (
                  <div className="row">
                    <div className="col-12 text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Cargando permisos...</span>
                      </div>
                      <p className="mt-2">Cargando permisos desde la API...</p>
                    </div>
                  </div>
                ) : permissionCategories.length === 0 ? (
                  <div className="row">
                    <div className="col-12 text-center">
                      <div className="alert alert-warning" role="alert">
                        <strong>No se pudieron cargar los permisos</strong>
                        <p>Verifica que la API esté corriendo en http://localhost:5000</p>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-primary mt-2"
                          onClick={loadPermissions}
                        >
                          🔄 Reintentar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="row permissions-cards-row">
                    {permissionCategories.map((categoryGroup, groupIndex) => (
                      <div key={groupIndex} className="col-md-6">
                        <div className="card col-12" data-background-color="gray">
                          <div className="card-body">
                            <div className="row">
                              <div className="margin-bottom-5 col-12">
                                {categoryGroup.category}
                              </div>
                              <div className="col-12">
                                {categoryGroup.permissions && categoryGroup.permissions.map((permission) => {
                                  const isSelected = formData.permissionIds.includes(permission.permissionId)
                                  
                                  return (
                                    <div key={permission.permissionId} className="form-check form-check-inline privilege-container">
                                      <label className={`btn btn-outline-primary btn-round btn-primary btn-sm margin-bottom-5 ${isSelected ? 'selected' : ''}`}>
                                        <input
                                          type="checkbox"
                                          value={permission.permissionId}
                                          checked={isSelected}
                                          onChange={(e) => handlePermissionChange(permission.permissionId, e.target.checked)}
                                        />
                                        {permission.name || permission.permissionName}
                                      </label>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="form-group row align-items-center mt-4">
                <div className="col-sm-4 offset-sm-4">
                  <button 
                    type="submit" 
                    className="btn btn-round btn-block btn-info"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                        Creando usuario...
                      </>
                    ) : (
                      'CREAR'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
