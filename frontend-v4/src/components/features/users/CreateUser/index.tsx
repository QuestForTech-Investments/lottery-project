/**
 * CreateUserMUI Component
 * Material-UI version of CreateUser component
 * Uses Strangler Fig Pattern - new implementation alongside original
 */

import { useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
  Container,
  IconButton,
  Collapse
} from '@mui/material'
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  List as ListIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import useUserForm from './hooks/useUserForm'
import PermissionsSelector from './PermissionsSelector'
import ReactMultiselect from '@components/common/ReactMultiselect'
import BettingPoolSelector from '@components/common/BettingPoolSelector'

const CreateUserMUI = () => {
  const navigate = useNavigate()

  const {
    formData,
    permissionCategories,
    loadingPermissions,
    loadPermissions,
    loading,
    errors,
    successMessage,
    setSuccessMessage,
    handleChange,
    handlePermissionChange,
    handleZoneChange,
    handleBranchChange,
    handleSubmit,
    resetForm
  } = useUserForm()

  /**
   * Wrapper for zone change to adapt types
   * ReactMultiselect provides (string | number)[] but hook expects number[]
   */
  const handleZoneChangeWrapper = useCallback((zoneIds: (string | number)[]) => {
    handleZoneChange(zoneIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id))
  }, [handleZoneChange])

  /**
   * Wrapper for branch change to adapt types
   * BettingPoolSelector provides string | number | null but hook expects number | null
   */
  const handleBranchChangeWrapper = useCallback((value: string | number | null) => {
    handleBranchChange(typeof value === 'string' ? parseInt(value, 10) : value)
  }, [handleBranchChange])

  /**
   * Success state - show success message with actions
   */
  if (successMessage) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />

            <Typography variant="h5" gutterBottom>
              Usuario Creado Exitosamente
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              El usuario ha sido creado correctamente en el sistema
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSuccessMessage('')
                  resetForm()
                }}
                startIcon={<ClearIcon />}
              >
                Crear Otro Usuario
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate('/users/list')}
                startIcon={<ListIcon />}
              >
                Ver Lista de Usuarios
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    )
  }

  /**
   * Main form render
   */
  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Crear Nuevo Usuario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete el formulario para crear un nuevo usuario en el sistema
          </Typography>
        </Box>

        {/* Global Error Message */}
        <Collapse in={!!errors.submit}>
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <IconButton
                size="small"
                onClick={() => {
                  const newErrors = { ...errors }
                  delete newErrors.submit
                  // This would need to be exposed from the hook
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <Typography variant="body2" fontWeight="medium">
              Error al crear usuario
            </Typography>
            <Typography variant="caption">{errors.submit}</Typography>
          </Alert>
        </Collapse>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Basic Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Información Básica
            </Typography>

            <Grid container spacing={3}>
              {/* Username */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre de Usuario"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username || 'Mínimo 3 caracteres'}
                  disabled={loading}
                  autoFocus
                  autoComplete="off"
                  placeholder="Ingrese el nombre de usuario"
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  label="Contraseña"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={
                    errors.password || 'Mín. 8 caracteres, 1 mayúscula, 1 número'
                  }
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="Ingrese la contraseña"
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword || 'Repita la contraseña'}
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="Confirme la contraseña"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Zones and Branch Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Zonas y Banca
            </Typography>

            <Grid container spacing={3}>
              {/* Zones Selection */}
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Zonas (Opcional)
                  </Typography>
                  <ReactMultiselect
                    value={formData.zoneIds}
                    onChange={handleZoneChangeWrapper}
                    placeholder="Seleccionar zonas..."
                    required={false}
                  />
                  {errors.zones && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.zones}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Assign Branch Toggle */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.assignBanca}
                      onChange={handleChange}
                      name="assignBanca"
                      disabled={loading || formData.zoneIds.length === 0}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">Asignar Banca</Typography>
                      {formData.zoneIds.length === 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Selecciona zonas primero para habilitar la asignación de banca
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </Grid>

              {/* Branch Selection */}
              {formData.assignBanca && formData.zoneIds.length > 0 && (
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Banca <span style={{ color: '#d32f2f' }}>*</span>
                    </Typography>
                    <BettingPoolSelector
                      value={formData.bettingPoolId}
                      onChange={handleBranchChangeWrapper}
                      selectedZoneIds={formData.zoneIds}
                      placeholder="Seleccionar banca..."
                      required={formData.assignBanca}
                    />
                    {errors.bettingPool && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.bettingPool}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Permissions Section */}
          <Box sx={{ mb: 4 }}>
            <PermissionsSelector
              permissionCategories={permissionCategories}
              selectedPermissionIds={formData.permissionIds}
              onPermissionChange={handlePermissionChange}
              loading={loadingPermissions}
              error={errors.permissions}
              onRetry={loadPermissions}
              required={true}
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={resetForm}
              disabled={loading}
              size="large"
            >
              Limpiar Formulario
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={loading || loadingPermissions}
              size="large"
            >
              {loading ? 'Creando Usuario...' : 'Crear Usuario'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default CreateUserMUI
