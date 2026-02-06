import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Search';
import limitService, { handleLimitError } from '@/services/limitService';
import {
  LimitType,
  LimitTypeLabels,
  LimitFilter,
  LimitParams,
  BetTypes,
  DaysOfWeek,
  BetTypeDefinition,
  DayOfWeekOption
} from '@/types/limits';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const DeleteLimits = (): React.ReactElement => {
  // Form state
  const [limitType, setLimitType] = useState<string>('');
  const [selectedBetTypes, setSelectedBetTypes] = useState<string[]>([]);
  const [selectedDraws, setSelectedDraws] = useState<number[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // Data state
  const [params, setParams] = useState<LimitParams | null>(null);
  const [loading, setLoading] = useState(true);

  // Preview state
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load params on mount
  useEffect(() => {
    const loadParams = async () => {
      try {
        const data = await limitService.getLimitParams();
        setParams(data);
      } catch (err) {
        console.error('Error loading params:', err);
        setSnackbar({
          open: true,
          message: handleLimitError(err, 'cargar parametros'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    loadParams();
  }, []);

  // Build filter from current selections
  const buildFilter = (): LimitFilter => {
    const filter: LimitFilter = {};

    if (limitType) {
      filter.limitTypes = [parseInt(limitType) as LimitType];
    }

    if (selectedDraws.length > 0) {
      filter.drawIds = selectedDraws;
    }

    if (selectedDays.length > 0) {
      filter.daysOfWeek = selectedDays;
    }

    return filter;
  };

  // Check if any filter is selected
  const hasFilters = (): boolean => {
    return (
      limitType !== '' ||
      selectedBetTypes.length > 0 ||
      selectedDraws.length > 0 ||
      selectedDays.length > 0
    );
  };

  // Preview handler - get count of limits matching filter
  const handlePreview = async () => {
    if (!hasFilters()) {
      setSnackbar({
        open: true,
        message: 'Seleccione al menos un filtro para previsualizar',
        severity: 'warning'
      });
      return;
    }

    setLoadingPreview(true);
    try {
      const filter = buildFilter();
      const limits = await limitService.getLimits(filter);
      setPreviewCount(limits.length);

      if (limits.length === 0) {
        setSnackbar({
          open: true,
          message: 'No se encontraron limites con los filtros seleccionados',
          severity: 'info'
        });
      }
    } catch (err) {
      console.error('Error previewing:', err);
      setSnackbar({
        open: true,
        message: handleLimitError(err, 'previsualizar'),
        severity: 'error'
      });
      setPreviewCount(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!hasFilters()) {
      setSnackbar({
        open: true,
        message: 'Seleccione al menos un filtro para eliminar',
        severity: 'warning'
      });
      return;
    }

    // Show confirmation dialog
    const countText = previewCount !== null ? previewCount.toString() : 'los';
    const confirmed = window.confirm(
      `¿Esta seguro de eliminar ${countText} limite(s) que coinciden con los filtros seleccionados?\n\nEsta accion no se puede deshacer.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const filter = buildFilter();
      const result = await limitService.deleteLimitsBatch(filter);

      setSnackbar({
        open: true,
        message: `${result.deletedCount} limite(s) eliminado(s) exitosamente`,
        severity: 'success'
      });

      // Clear form after successful deletion
      setLimitType('');
      setSelectedBetTypes([]);
      setSelectedDraws([]);
      setSelectedDays([]);
      setPreviewCount(null);
    } catch (err) {
      console.error('Error deleting:', err);
      setSnackbar({
        open: true,
        message: handleLimitError(err, 'eliminar'),
        severity: 'error'
      });
    } finally {
      setDeleting(false);
    }
  };

  // Toggle bet type selection
  const handleBetTypeToggle = (betTypeKey: string) => {
    setSelectedBetTypes(prev =>
      prev.includes(betTypeKey)
        ? prev.filter(t => t !== betTypeKey)
        : [...prev, betTypeKey]
    );
    // Reset preview when selection changes
    setPreviewCount(null);
  };

  // Toggle draw selection
  const handleDrawToggle = (drawId: number) => {
    setSelectedDraws(prev =>
      prev.includes(drawId)
        ? prev.filter(d => d !== drawId)
        : [...prev, drawId]
    );
    // Reset preview when selection changes
    setPreviewCount(null);
  };

  // Toggle day selection
  const handleDayToggle = (dayValue: number) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
    // Reset preview when selection changes
    setPreviewCount(null);
  };

  // Handle limit type change
  const handleLimitTypeChange = (value: string) => {
    setLimitType(value);
    // Reset preview when selection changes
    setPreviewCount(null);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Get limit type options from LimitTypeLabels
  const limitTypeOptions = Object.entries(LimitTypeLabels).map(([value, label]) => ({
    value,
    label
  }));

  // Get draws from params or use empty array
  const draws = params?.draws || [];

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#51cbce' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          mb: 3,
          fontSize: '24px',
          fontWeight: 500,
          color: '#2c2c2c'
        }}
      >
        Eliminar limites en lote
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              mb: 2,
              borderBottom: '2px solid #6366f1',
              pb: 1
            }}
          >
            LIMITES
          </Typography>

          {/* Limit Type Select */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Limite</InputLabel>
            <Select
              value={limitType}
              onChange={(e) => handleLimitTypeChange(e.target.value)}
              label="Tipo de Limite"
            >
              <MenuItem value="">
                <em>Todos los tipos</em>
              </MenuItem>
              {limitTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Bet Types Checkboxes */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '12px', color: '#787878', mb: 1 }}>
              Tipos de jugada (opcional)
            </Typography>
            <Box
              sx={{
                maxHeight: '150px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                p: 1,
                borderRadius: '4px'
              }}
            >
              {BetTypes.map((betType: BetTypeDefinition) => (
                <FormControlLabel
                  key={betType.key}
                  control={
                    <Checkbox
                      checked={selectedBetTypes.includes(betType.key)}
                      onChange={() => handleBetTypeToggle(betType.key)}
                      sx={{
                        '&.Mui-checked': { color: '#51cbce' }
                      }}
                    />
                  }
                  label={betType.label}
                  sx={{ display: 'block' }}
                />
              ))}
            </Box>
          </Box>

          {/* Draws Checkboxes */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '12px', color: '#787878', mb: 1 }}>
              Sorteos
            </Typography>
            <Box
              sx={{
                maxHeight: '150px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                p: 1,
                borderRadius: '4px'
              }}
            >
              {draws.length > 0 ? (
                draws.map(draw => (
                  <FormControlLabel
                    key={draw.value}
                    control={
                      <Checkbox
                        checked={selectedDraws.includes(draw.value)}
                        onChange={() => handleDrawToggle(draw.value)}
                        sx={{
                          '&.Mui-checked': { color: '#51cbce' }
                        }}
                      />
                    }
                    label={draw.label}
                    sx={{ display: 'block' }}
                  />
                ))
              ) : (
                <Typography sx={{ color: '#999', fontSize: '14px', p: 1 }}>
                  No hay sorteos disponibles
                </Typography>
              )}
            </Box>
          </Box>

          {/* Days of Week */}
          <Typography
            variant="h6"
            sx={{ fontSize: '16px', fontWeight: 600, mt: 3, mb: 2 }}
          >
            DIA DE SEMANA
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {DaysOfWeek.map((day: DayOfWeekOption) => (
              <FormControlLabel
                key={day.value}
                control={
                  <Checkbox
                    checked={selectedDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    sx={{
                      '&.Mui-checked': { color: '#51cbce' }
                    }}
                  />
                }
                label={day.label}
              />
            ))}
          </Box>

          {/* Preview Alert */}
          {previewCount !== null && (
            <Alert
              severity={previewCount > 0 ? 'warning' : 'info'}
              sx={{ my: 2 }}
            >
              {previewCount > 0 ? (
                <>
                  Se eliminaran <strong>{previewCount}</strong> limite(s)
                </>
              ) : (
                'No se encontraron limites con los filtros seleccionados'
              )}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ textAlign: 'center', mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={handlePreview}
              disabled={loadingPreview || !hasFilters()}
              startIcon={loadingPreview ? <CircularProgress size={20} /> : <PreviewIcon />}
              sx={{
                borderColor: '#51cbce',
                color: '#51cbce',
                '&:hover': {
                  borderColor: '#45b8bb',
                  bgcolor: 'rgba(81, 203, 206, 0.1)'
                },
                fontSize: '14px',
                px: 4,
                py: 1.5,
                textTransform: 'none'
              }}
            >
              {loadingPreview ? 'Cargando...' : 'Ver cantidad'}
            </Button>

            <Button
              variant="contained"
              onClick={handleDelete}
              disabled={deleting || previewCount === 0 || !hasFilters()}
              startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
              sx={{
                bgcolor: '#dc3545',
                '&:hover': { bgcolor: '#c82333' },
                '&:disabled': { bgcolor: '#f5c6cb', color: '#721c24' },
                fontSize: '14px',
                px: 5,
                py: 1.5,
                textTransform: 'none'
              }}
            >
              {deleting ? 'Eliminando...' : 'ELIMINAR'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeleteLimits;
