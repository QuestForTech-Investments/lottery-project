/**
 * CreateUserMUI Component
 * Material-UI version of CreateUser component
 * Uses Strangler Fig Pattern - new implementation alongside original
 */

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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
import TempCredentialDialog from '@components/modals/TempCredentialDialog'

const CreateUserMUI = () => {
  const { t } = useTranslation()
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
    tempCredential,
    closeTempCredentialAndNavigate,
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
              {t('usersAdmin.createSuccessTitle')}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {t('usersAdmin.createSuccessSubtitle')}
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
                {t('usersAdmin.createAnother')}
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate('/users/list')}
                startIcon={<ListIcon />}
              >
                {t('usersAdmin.viewUsersList')}
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
            {t('usersAdmin.createNewUser')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('usersAdmin.createNewUserSubtitle')}
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
              {t('usersAdmin.createError')}
            </Typography>
            <Typography variant="caption">{errors.submit}</Typography>
          </Alert>
        </Collapse>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Basic Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {t('usersAdmin.basicInfo')}
            </Typography>

            <Grid container spacing={3}>
              {/* Username — stored in uppercase regardless of input casing */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label={t('usersAdmin.usernameLabel')}
                  name="username"
                  value={formData.username}
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase();
                    handleChange({
                      ...e,
                      target: { ...e.target, name: 'username', value: upper },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  error={!!errors.username}
                  helperText={errors.username || t('usersAdmin.usernameHint')}
                  disabled={loading}
                  autoFocus
                  autoComplete="off"
                  placeholder={t('usersAdmin.usernamePlaceholder')}
                  sx={{ '& input': { textTransform: 'uppercase' } }}
                />
              </Grid>

              {/* Password is auto-generated by the server. The admin will see
                  the temporary credential after creation in a one-time dialog. */}
              <Grid item xs={12} md={6}>
                <Alert severity="info" sx={{ height: '100%' }}>
                  {t('usersAdmin.tempPasswordAutoGeneratedInfo')}
                </Alert>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Zones and Branch Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {t('usersAdmin.zonesAndBettingPools')}
            </Typography>

            <Grid container spacing={3}>
              {/* Zones Selection */}
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('usersAdmin.zonesOptional')}
                  </Typography>
                  <ReactMultiselect
                    value={formData.zoneIds}
                    onChange={handleZoneChangeWrapper}
                    placeholder={t('usersAdmin.selectZonesPlaceholder')}
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
                      disabled={loading}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body1">{t('usersAdmin.assignBettingPool')}</Typography>}
                />
              </Grid>

              {/* Branch Selection */}
              {formData.assignBanca && (
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t('common.bettingPool')} <span style={{ color: '#d32f2f' }}>*</span>
                    </Typography>
                    <BettingPoolSelector
                      value={formData.bettingPoolId}
                      onChange={handleBranchChangeWrapper}
                      selectedZoneIds={formData.zoneIds}
                      placeholder={t('usersAdmin.selectBettingPoolPlaceholder')}
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
              {t('usersAdmin.clearForm')}
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
              {loading ? t('usersAdmin.creatingUser') : t('usersAdmin.createTitle')}
            </Button>
          </Box>
        </Box>
      </Paper>

      <TempCredentialDialog
        isOpen={tempCredential.open}
        username={tempCredential.username}
        password={tempCredential.password}
        onClose={closeTempCredentialAndNavigate}
      />
    </Container>
  )
}

export default CreateUserMUI
