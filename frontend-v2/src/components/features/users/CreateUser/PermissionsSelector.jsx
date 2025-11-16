/**
 * PermissionsSelector Component
 * Material-UI component for selecting permissions grouped by category
 */

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Button
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material'

const PermissionsSelector = ({
  permissionCategories = [],
  selectedPermissionIds = [],
  onPermissionChange,
  loading = false,
  error = null,
  onRetry = null,
  required = false
}) => {
  /**
   * Check if all permissions in a category are selected
   */
  const isCategoryFullySelected = (category) => {
    if (!category.permissions || category.permissions.length === 0) return false

    return category.permissions.every(permission =>
      selectedPermissionIds.includes(permission.permissionId)
    )
  }

  /**
   * Check if some (but not all) permissions in a category are selected
   */
  const isCategoryPartiallySelected = (category) => {
    if (!category.permissions || category.permissions.length === 0) return false

    const selectedCount = category.permissions.filter(permission =>
      selectedPermissionIds.includes(permission.permissionId)
    ).length

    return selectedCount > 0 && selectedCount < category.permissions.length
  }

  /**
   * Toggle all permissions in a category
   */
  const handleCategoryToggle = (category) => {
    const categoryPermissionIds = category.permissions.map(p => p.permissionId)
    const allSelected = isCategoryFullySelected(category)

    if (allSelected) {
      // Deselect all permissions in this category
      categoryPermissionIds.forEach(id => {
        if (selectedPermissionIds.includes(id)) {
          onPermissionChange(id, false)
        }
      })
    } else {
      // Select all permissions in this category
      categoryPermissionIds.forEach(id => {
        if (!selectedPermissionIds.includes(id)) {
          onPermissionChange(id, true)
        }
      })
    }
  }

  /**
   * Loading state
   */
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Cargando permisos desde la API...
        </Typography>
      </Box>
    )
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Reintentar
            </Button>
          )
        }
      >
        <Typography variant="body2" fontWeight="medium">
          {error}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          Verifica que la API esté corriendo en http://localhost:5000
        </Typography>
      </Alert>
    )
  }

  /**
   * Empty state
   */
  if (permissionCategories.length === 0) {
    return (
      <Alert severity="warning">
        <Typography variant="body2" fontWeight="medium">
          No se pudieron cargar los permisos
        </Typography>
        {onRetry && (
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ mt: 1 }}
          >
            Reintentar
          </Button>
        )}
      </Alert>
    )
  }

  /**
   * Main render
   */
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography variant="h6" component="div">
          PRIVILEGIOS
        </Typography>
        {required && (
          <Chip label="Requerido" color="error" size="small" />
        )}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {selectedPermissionIds.length} seleccionados
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {permissionCategories.map((categoryGroup, groupIndex) => {
          const isFullySelected = isCategoryFullySelected(categoryGroup)
          const isPartiallySelected = isCategoryPartiallySelected(categoryGroup)

          return (
            <Grid item xs={12} md={6} key={groupIndex}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  bgcolor: isFullySelected ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 2
                  }
                }}
              >
                <CardContent>
                  {/* Category Header with Select All */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      pb: 1,
                      borderBottom: 1,
                      borderColor: 'divider'
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isFullySelected}
                          indeterminate={isPartiallySelected}
                          onChange={() => handleCategoryToggle(categoryGroup)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {categoryGroup.category}
                        </Typography>
                      }
                    />
                    <Chip
                      label={categoryGroup.permissions?.length || 0}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>

                  {/* Permission Checkboxes */}
                  <FormGroup>
                    {categoryGroup.permissions?.map((permission) => {
                      const isSelected = selectedPermissionIds.includes(permission.permissionId)

                      return (
                        <FormControlLabel
                          key={permission.permissionId}
                          control={
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) =>
                                onPermissionChange(permission.permissionId, e.target.checked)
                              }
                              size="small"
                              checkedIcon={<CheckBoxIcon />}
                              icon={<CheckBoxOutlineBlankIcon />}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isSelected ? 500 : 400,
                                color: isSelected ? 'primary.main' : 'text.primary'
                              }}
                            >
                              {permission.name || permission.permissionName}
                            </Typography>
                          }
                          sx={{
                            ml: 1,
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                      )
                    })}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default PermissionsSelector
