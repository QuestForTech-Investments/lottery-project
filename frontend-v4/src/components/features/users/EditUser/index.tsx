import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import useEditUserForm from './hooks/useEditUserForm';
import PermissionsSelector from '@components/features/users/CreateUser/PermissionsSelector';
import { FlagES, FlagUS, FlagFR, FlagHT } from '@components/common/LanguageFlags';
import ReactMultiselect from '@components/common/ReactMultiselect';
import BettingPoolSelector from '@components/common/BettingPoolSelector';

/**
 * EditUserMUI Component
 * Modern Material-UI version of EditUser
 */
const EditUserMUI = () => {
  const { t } = useTranslation();
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
    handlePermissionsChange: _handlePermissionsChange,
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
            {t('usersAdmin.loadingUserData')}
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
      <Box sx={{ p: { xs: 1, sm: 3 }, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 4 }, maxWidth: 600, width: '100%' }}>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              '& .MuiAlert-message': { wordBreak: 'break-word', minWidth: 0, flex: 1 },
              '& .MuiAlert-action': { flexShrink: 0, alignItems: 'flex-start', pt: 0 },
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRetry}
                startIcon={<RefreshIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {t('sales.retry')}
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {t('usersAdmin.formLoadError')}
            </Typography>
            <Typography variant="body2">
              {errors.submit}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {t('usersAdmin.apiRunningHint')}
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users/list')}
            fullWidth
          >
            {t('usersAdmin.backToList')}
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
            ✅ {t('usersAdmin.updateSuccess')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('usersAdmin.redirectingToList')}
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
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: { xs: 1.5, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" align="center" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
            {t('usersAdmin.updateUser')}
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
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
                  label={t('usersAdmin.username')}
                  name="username"
                  value={formData.username}
                  disabled
                  helperText={t('usersAdmin.usernameImmutableHint')}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      backgroundColor: 'action.disabledBackground',
                    },
                  }}
                />
              </Grid>

              {/* Auto-logout (idle session timeout) — applies to admin users.
                  Blank = system default, 0 = disabled, max 60 min. */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="autoLogoutMinutes"
                  label={t('usersAdmin.autoLogoutMinutes', { defaultValue: 'Auto-logout (minutos)' })}
                  value={formData.autoLogoutMinutes}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 60, step: 1 }}
                  helperText={t('usersAdmin.autoLogoutMinutesHint', {
                    defaultValue: 'Vacío = predeterminado (15 min). 0 = deshabilitado. Máx 60.',
                  })}
                />
              </Grid>

              {/* Default UI language for this user. Empty = follow tenant
                  default; otherwise persists across devices. */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="preferredLanguage"
                  label={t('usersAdmin.preferredLanguage', { defaultValue: 'Idioma predeterminado' })}
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  helperText={t('usersAdmin.preferredLanguageHint', {
                    defaultValue: 'Idioma inicial de la interfaz. El usuario puede cambiarlo después.',
                  })}
                >
                  <MenuItem value="">{t('usersAdmin.preferredLanguageDefault', { defaultValue: '(predeterminado del sistema)' })}</MenuItem>
                  <MenuItem value="es">
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <FlagES size={14} /> Español
                    </Box>
                  </MenuItem>
                  <MenuItem value="en">
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <FlagUS size={14} /> English
                    </Box>
                  </MenuItem>
                  <MenuItem value="fr">
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <FlagFR size={14} /> Français
                    </Box>
                  </MenuItem>
                  <MenuItem value="ht">
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <FlagHT size={14} /> Kreyòl
                    </Box>
                  </MenuItem>
                </TextField>
              </Grid>

              {/* Divider */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {t('usersAdmin.zonesAndBettingPools')}
                </Typography>
              </Grid>

              {/* Zones Multi-selector */}
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('common.zones')}
                  </Typography>
                  <ReactMultiselect
                    value={formData.zoneIds}
                    onChange={handleZoneChangeWrapper}
                    placeholder={t('usersAdmin.selectZonesPlaceholder')}
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
                    />
                  }
                  label={t('usersAdmin.assignBettingPool')}
                />
              </Grid>

              {/* Branch Selector (conditional) */}
              {formData.assignBanca && (
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('common.bettingPool')} <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <BettingPoolSelector
                      value={formData.bettingPoolId}
                      onChange={handleBranchChangeWrapper}
                      selectedZoneIds={formData.zoneIds}
                      placeholder={t('usersAdmin.selectBettingPoolPlaceholder')}
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
                  {t('usersAdmin.privileges')} <span style={{ color: 'red' }}>*</span>
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
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? t('usersAdmin.updating') : t('usersAdmin.updateUser')}
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
