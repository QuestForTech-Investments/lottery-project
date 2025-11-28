import React, { memo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import useEditUserForm from './hooks/useEditUserForm';
import PermissionsSelector from '@components/features/users/CreateUser/PermissionsSelector';
import ReactMultiselect from '@components/common/ReactMultiselect';
import BettingPoolSelector from '@components/common/BettingPoolSelector';
import * as logger from '@/utils/logger';

/**
 * EditUserMUI Component
 * Modern Material-UI version of EditUser
 */
const EditUserMUI = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const {
    formData,
    permissionCategories,
    loadingPermissions,
    loadPermissions,
    loading,
    loadingUser,
    errors,
    success,
    handleChange,
    handleZoneChange,
    handleBranchChange,
    handleAssignBancaChange,
    handlePermissionChange,
    handlePermissionsChange,
    handleSubmit,
    handleRetry,
  } = useEditUserForm(userId);

  /**
   * Wrapper for zone change to adapt types
   */
  const handleZoneChangeWrapper = useCallback((zoneIds: (string | number)[]) => {
    handleZoneChange(zoneIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id));
  }, [handleZoneChange]);

  /**
   * Wrapper for branch change to adapt types
   */
  const handleBranchChangeWrapper = useCallback((value: string | number | null) => {
    handleBranchChange(typeof value === 'string' ? parseInt(value, 10) : value);
  }, [handleBranchChange]);

  /**
   * Render loading state
   */
  if (loadingUser && !errors.submit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Cargando datos del usuario...
          </Typography>
        </Box>
      </Box>
    );
  }

  /**
   * Render error state (initial load failed)
   */
  if (errors.submit && formData.username === '') {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%' }}>
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRetry}
                startIcon={<RefreshIcon />}
              >
                Reintentar
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom>
              Error al cargar el formulario
            </Typography>
            <Typography variant="body2">
              {errors.submit}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Verifica que la API esté corriendo en http://localhost:5000
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users/list')}
            fullWidth
          >
            Volver a la lista
          </Button>
        </Paper>
      </Box>
    );
  }

  /**
   * Render success screen
   */
  if (success) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <Typography variant="h5" color="success.main" gutterBottom>
            ✅ Usuario actualizado exitosamente
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Serás redirigido a la lista de usuarios en unos segundos...
          </Typography>
          <CircularProgress size={40} />
        </Paper>
      </Box>
    );
  }

  /**
   * Render main form
   */
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" align="center">
            Actualizar Usuario
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ p: 3 }}>
          {/* Submit Error Alert */}
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
              {errors.submit}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Username (Read-only) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Usuario"
                  name="username"
                  value={formData.username}
                  disabled
                  helperText="El nombre de usuario no se puede modificar"
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      backgroundColor: 'action.disabledBackground',
                    },
                  }}
                />
              </Grid>

              {/* Spacer */}
              <Grid item xs={12} md={6} />

              {/* Divider */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Zonas y Bancas
                </Typography>
              </Grid>

              {/* Zones Multi-selector */}
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Zonas
                  </Typography>
                  <ReactMultiselect
                    value={formData.zoneIds}
                    onChange={handleZoneChangeWrapper}
                    placeholder="Seleccionar zonas..."
                    required={false}
                  />
                  {errors.zones && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.zones}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Assign Banca Toggle */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.assignBanca}
                      onChange={(e) => handleAssignBancaChange(e.target.checked)}
                      disabled={formData.zoneIds.length === 0}
                    />
                  }
                  label="Asignar Banca"
                />
                {formData.zoneIds.length === 0 && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                    Selecciona zonas primero para habilitar la asignación de banca
                  </Typography>
                )}
              </Grid>

              {/* Branch Selector (conditional) */}
              {formData.assignBanca && formData.zoneIds.length > 0 && (
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Banca <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <BettingPoolSelector
                      value={formData.bettingPoolId}
                      onChange={handleBranchChangeWrapper}
                      selectedZoneIds={formData.zoneIds}
                      placeholder="Seleccionar banca..."
                      required={formData.assignBanca}
                    />
                    {errors.bettingPool && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {errors.bettingPool}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}

              {/* Divider */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Privilegios <span style={{ color: 'red' }}>*</span>
                </Typography>
              </Grid>

              {/* Permissions Selector */}
              <Grid item xs={12}>
                <PermissionsSelector
                  permissionCategories={permissionCategories}
                  selectedPermissionIds={formData.permissionIds}
                  onPermissionChange={handlePermissionChange}
                  loading={loadingPermissions}
                  error={errors.permissions}
                  onRetry={loadPermissions}
                  required={true}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/users/list')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Usuario'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(EditUserMUI);
