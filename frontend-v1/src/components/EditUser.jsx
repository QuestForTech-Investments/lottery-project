import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from 'react-router-dom'
import { userService, permissionService } from '@/services'
import { handleApiError } from '@/utils'
import * as logger from '@/utils/logger'
import ReactMultiselect from './users/ReactMultiselect'
import '../assets/css/create-user.css'

export default function EditUser() {
  const navigate = useNavigate()
  const { userId } = useParams() // Get userId from route params
  
  const [formData, setFormData] = useState({
    username: "",
    zoneIds: [], // Array of zone IDs for many-to-many relationship
    permissionIds: []
  })

  const [permissionCategories, setPermissionCategories] = useState([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")

  // Load user data and permissions
  useEffect(() => {
    logger.info('EDIT_USER', `Component mounted. User ID from params: ${userId}`)
    loadPermissions()
    if (userId) {
      loadUserData(userId)
    } else {
      logger.error('EDIT_USER', 'No userId provided in URL params')
      setErrors({ submit: 'ID de usuario no proporcionado' })
      setLoadingUser(false)
      setLoadingPermissions(false)
    }
  }, [userId])

  const loadUserData = async (id) => {
    try {
      setLoadingUser(true)
      logger.info('EDIT_USER', `Loading user data for ID: ${id}`)
      
      // Get user data
      const userResponse = await userService.getUserById(id)
      
      if (userResponse.success && userResponse.data) {
        const user = userResponse.data

        console.log('🔵 User API Response:', user)

        // Extract zone IDs - Handle multiple API response formats
        let zoneIds = []
        // API returns ZoneIds (PascalCase) from UserDetailDto
        if (user.ZoneIds && Array.isArray(user.ZoneIds)) {
          zoneIds = user.ZoneIds
          console.log('🟢 ZONES: Extracted from user.ZoneIds (PascalCase):', user.ZoneIds)
        } else if (user.zoneIds && Array.isArray(user.zoneIds)) {
          // Fallback: camelCase (if API is configured for camelCase serialization)
          zoneIds = user.zoneIds
          console.log('🟢 ZONES: Extracted from user.zoneIds (camelCase):', user.zoneIds)
        } else if (user.zones && Array.isArray(user.zones)) {
          // Fallback: zones array of objects
          zoneIds = user.zones.map(z => z.zoneId || z.ZoneId)
          console.log('🟢 ZONES: Extracted from user.zones array:', user.zones)
        } else if (user.zoneId || user.ZoneId) {
          // Fallback: single zone (old structure)
          zoneIds = [user.zoneId || user.ZoneId]
          console.log('🟢 ZONES: Extracted from user.zoneId (single):', user.zoneId || user.ZoneId)
        } else {
          console.log('🔴 ZONES: No zone data found in user object')
        }
        console.log('🟢 ZONES: Final zoneIds array:', zoneIds)

        // Extract permission IDs - The GET /users/{id} endpoint already returns permissions
        let permissionIds = []
        const permissions = user.Permissions || user.permissions
        if (permissions && Array.isArray(permissions)) {
          permissionIds = permissions.map(p => p.PermissionId || p.permissionId)
          console.log('✅ Loaded permissions from user data:', permissionIds)
        }

        const username = user.Username || user.username || ''

        setFormData(prev => ({
          ...prev,
          username: username,
          zoneIds: zoneIds,
          permissionIds: permissionIds
        }))

        logger.success('EDIT_USER', `User loaded successfully`, {
          username: user.username,
          zonesCount: zoneIds.length,
          permissionsCount: permissionIds.length
        })
      } else {
        setErrors({ submit: 'No se pudo cargar el usuario' })
      }
    } catch (error) {
      logger.error('EDIT_USER', 'Failed to load user', { error: error.message })
      setErrors({ submit: 'Error al cargar usuario. Verifica que la API esté corriendo.' })
    } finally {
      setLoadingUser(false)
    }
  }

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true)
      // Clear any previous permission errors
      setErrors(prev => ({ ...prev, permissions: null }))
      const response = await permissionService.getPermissionCategories()
      
      if (response.success && response.data) {
        setPermissionCategories(response.data)
        // Clear any permission errors since we loaded successfully
        setErrors(prev => ({ ...prev, permissions: null }))
        logger.success('EDIT_USER', `Loaded ${response.data.length} permission categories`)
      } else {
        logger.warning('EDIT_USER', 'No permissions data received')
        setErrors(prev => ({ ...prev, permissions: 'No se pudieron cargar los permisos' }))
      }
    } catch (error) {
      logger.error('EDIT_USER', 'Failed to load permissions', { error: error.message })
      
      // Only show error if it's a real error, not a network timeout
      if (error.message !== 'Network Error' || permissionCategories.length === 0) {
        setErrors(prev => ({ ...prev, permissions: 'Error al cargar permisos. Verifica que la API esté corriendo.' }))
      }
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
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

    // Permissions validation (optional - no validation needed)
    // Permissions are now optional, user can be updated without changing permissions

    // Zones validation (optional - no validation needed)
    // Zones are now optional, user can be updated without zones

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    logger.info('EDIT_USER', 'Form submitted')
    setSuccessMessage("")
    
    if (!validateForm()) {
      logger.warning('EDIT_USER', 'Form validation failed', { errors })
      return
    }

    logger.info('EDIT_USER', 'Form validation passed')
    setLoading(true)

    try {
      const updateData = {
        permissionIds: formData.permissionIds,
        zoneIds: formData.zoneIds
      }

      console.log('🟢 EDIT USER - Data being sent:', updateData)
      console.log('🟢 EDIT USER - Permission IDs:', updateData.permissionIds)
      console.log('🟢 EDIT USER - Permission IDs count:', updateData.permissionIds.length)
      console.log('🟢 EDIT USER - Zone IDs:', updateData.zoneIds)
      console.log('🟢 EDIT USER - Zone IDs count:', updateData.zoneIds.length)

      logger.info('EDIT_USER', 'Updating user', {
        userId,
        username: formData.username,
        permissionsCount: updateData.permissionIds.length,
        zonesCount: updateData.zoneIds.length,
        zoneIds: updateData.zoneIds
      })

      // Update user completely using the /complete endpoint
      const response = await userService.updateUserComplete(userId, updateData)
      console.log('🟢 EDIT USER - API Response:', response)

      if (response.success) {
        logger.success('EDIT_USER', 'User updated successfully', {
          userId: response.data?.userId,
          username: response.data?.username
        })
        setSuccessMessage("✅ Usuario actualizado exitosamente")
        
        // Redirect to user list after 2 seconds
        setTimeout(() => {
          logger.info('EDIT_USER', 'Redirecting to user list')
          navigate('/usuarios/lista')
        }, 2000)
      }
    } catch (error) {
      logger.error('EDIT_USER', 'Failed to update user', {
        error: error.message,
        response: error.response
      })
      const errorMessage = handleApiError(error)
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  // Show loading only if no errors
  if ((loadingUser || loadingPermissions) && !errors.submit && !errors.permissions) {
    return (
      <div id="page-content" className="content">
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-3">Cargando datos del usuario...</p>
        </div>
      </div>
    )
  }

  // Show error if loading failed
  if ((errors.submit || errors.permissions) && (formData.username === "")) {
    return (
      <div id="page-content" className="content">
        <div className="text-center mt-5">
          <div className="alert alert-danger" role="alert" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h4>❌ Error al cargar el formulario</h4>
            <p><strong>Error:</strong> {errors.submit || errors.permissions}</p>
            <hr />
            <p className="mb-0">
              Verifica que la API esté corriendo en <code>http://localhost:5000</code> o <code>https://localhost:7001</code>
            </p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => {
                setErrors({})
                setLoadingUser(true)
                setLoadingPermissions(true)
                loadPermissions()
                if (userId) loadUserData(userId)
              }}
            >
              🔄 Reintentar
            </button>
            <button 
              className="btn btn-secondary mt-3 ml-2"
              onClick={() => navigate('/usuarios/lista')}
            >
              ← Volver a la lista
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="page-content" className="content">
      <div>
        <div className="card card-task">
          <div className="card-header">
            <h3 className="header text-center">
              <span>Actualizar Usuario</span>
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
                  {/* Username (Read-only) */}
                  <div className="form-group row align-items-center">
                    <label htmlFor="username" className="col-sm-2 offset-sm-2 col-form-label">
                      Usuario
                    </label>
                    <div className="col-sm-4">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="form-control"
                        value={formData.username}
                        disabled
                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  {/* Multi Zone Selector - Always visible */}
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
                            zoneIds: zoneIds
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
                                {categoryGroup.permissions && categoryGroup.permissions.map((permission, idx) => {
                                  const isSelected = formData.permissionIds.includes(permission.permissionId)
                                  
                                  // Debug first permission of first category
                                  if (groupIndex === 0 && idx === 0) {
                                    console.log('🔍 DEBUG Permission Check:')
                                    console.log('  - formData.permissionIds:', formData.permissionIds)
                                    console.log('  - permission.permissionId:', permission.permissionId, typeof permission.permissionId)
                                    console.log('  - isSelected:', isSelected)
                                  }
                                  
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
                        Actualizando...
                      </>
                    ) : (
                      'ACTUALIZAR'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


