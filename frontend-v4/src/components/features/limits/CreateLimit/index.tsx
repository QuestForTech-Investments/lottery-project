import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor,
  Autocomplete
} from '@mui/material';
import limitService, { handleLimitError } from '@/services/limitService';
import {
  LimitType,
  LimitTypeLabels,
  LimitParams,
  CreateLimitRequest,
  BetTypes,
  DaysOfWeek,
  daysToBitmask,
  BetTypeAmounts
} from '@/types/limits';

interface Amounts {
  [key: string]: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const CreateLimit = (): React.ReactElement => {
  const navigate = useNavigate();

  // Form state
  const [limitType, setLimitType] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [selectedDraws, setSelectedDraws] = useState<number[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedBettingPool, setSelectedBettingPool] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [betNumberPattern, setBetNumberPattern] = useState<string>('');

  const [amounts, setAmounts] = useState<Amounts>(() => {
    const initial: Amounts = {};
    BetTypes.forEach(bt => {
      initial[bt.key] = '';
    });
    return initial;
  });

  // API data state
  const [params, setParams] = useState<LimitParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load form parameters from API
  useEffect(() => {
    const loadParams = async () => {
      try {
        setLoading(true);
        const data = await limitService.getLimitParams();
        setParams(data);
      } catch (err) {
        console.error('Error loading params:', err);
        setError('Error al cargar los parametros del formulario');
      } finally {
        setLoading(false);
      }
    };
    loadParams();
  }, []);

  // Determine if the limit type requires a betting pool or zone
  const requiresBettingPool = (type: string): boolean => {
    const t = parseInt(type);
    return [
      LimitType.GeneralForBettingPool,
      LimitType.ByNumberForBettingPool,
      LimitType.LocalForBettingPool
    ].includes(t);
  };

  const requiresZone = (type: string): boolean => {
    const t = parseInt(type);
    return [
      LimitType.GeneralForZone,
      LimitType.ByNumberForZone
    ].includes(t);
  };

  const requiresNumberPattern = (type: string): boolean => {
    const t = parseInt(type);
    return [
      LimitType.ByNumberForGroup,
      LimitType.ByNumberForBettingPool,
      LimitType.ByNumberForZone,
      LimitType.ByNumberForExternalGroup
    ].includes(t);
  };

  const handleDrawToggle = useCallback((drawId: number): void => {
    setSelectedDraws(prev =>
      prev.includes(drawId) ? prev.filter(d => d !== drawId) : [...prev, drawId]
    );
  }, []);

  const handleDayToggle = useCallback((dayValue: number): void => {
    setSelectedDays(prev =>
      prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
  }, []);

  const handleSelectAllDraws = useCallback((): void => {
    if (!params) return;
    setSelectedDraws(prev =>
      prev.length === params.draws.length ? [] : params.draws.map(d => d.value)
    );
  }, [params]);

  const handleSelectAllDays = useCallback((): void => {
    setSelectedDays(prev =>
      prev.length === DaysOfWeek.length ? [] : DaysOfWeek.map(d => d.value)
    );
  }, []);

  const handleAmountChange = useCallback((key: string, value: string): void => {
    setAmounts(prev => ({ ...prev, [key]: value }));
  }, []);

  const validateForm = (): boolean => {
    if (!limitType) {
      setError('Debe seleccionar un tipo de limite');
      return false;
    }

    if (selectedDraws.length === 0) {
      setError('Debe seleccionar al menos un sorteo');
      return false;
    }

    if (selectedDays.length === 0) {
      setError('Debe seleccionar al menos un dia');
      return false;
    }

    // Check if betting pool is required
    if (requiresBettingPool(limitType) && !selectedBettingPool) {
      setError('Debe seleccionar una banca para este tipo de limite');
      return false;
    }

    // Check if zone is required
    if (requiresZone(limitType) && !selectedZone) {
      setError('Debe seleccionar una zona para este tipo de limite');
      return false;
    }

    // Check if number pattern is required
    if (requiresNumberPattern(limitType) && !betNumberPattern.trim()) {
      setError('Debe ingresar un patron de numero para este tipo de limite');
      return false;
    }

    // Check that at least one amount is configured
    const hasAmount = Object.values(amounts).some(v => v && parseFloat(v) > 0);
    if (!hasAmount) {
      setError('Debe configurar al menos un monto');
      return false;
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    setError(null);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Build amounts object with only non-zero values
      const amountsPayload: BetTypeAmounts = {};
      Object.entries(amounts).forEach(([key, value]) => {
        if (value && parseFloat(value) > 0) {
          amountsPayload[key] = parseFloat(value);
        }
      });

      const request: CreateLimitRequest = {
        limitType: parseInt(limitType) as LimitType,
        drawIds: selectedDraws,
        daysOfWeek: daysToBitmask(selectedDays),
        amounts: amountsPayload,
        effectiveTo: expirationDate || undefined,
        bettingPoolId: selectedBettingPool || undefined,
        zoneId: selectedZone || undefined,
        betNumberPattern: betNumberPattern.trim() || undefined
      };

      await limitService.createLimit(request);

      setSnackbar({
        open: true,
        message: 'Limite creado exitosamente',
        severity: 'success'
      });

      // Redirect after showing success message
      setTimeout(() => navigate('/limits/list'), 1500);
    } catch (err) {
      const errorMsg = handleLimitError(err, 'crear limite');
      setError(errorMsg);
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnackbarClose = (): void => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Show loading spinner while loading params
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontSize: '24px', fontWeight: 500, color: '#2c2c2c' }}>
        Crear limites
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Left Column - LIMITES */}
            <Box>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#2c2c2c', mb: 2, borderBottom: '2px solid #6366f1', pb: 1 }}>
                LIMITES
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ fontSize: '12px' }}>Tipo de Limite *</InputLabel>
                <Select
                  value={limitType}
                  onChange={(e) => {
                    setLimitType(e.target.value);
                    // Reset related fields when type changes
                    setSelectedBettingPool(null);
                    setSelectedZone(null);
                    setBetNumberPattern('');
                  }}
                  label="Tipo de Limite *"
                  sx={{ fontSize: '14px' }}
                >
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {Object.entries(LimitTypeLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value} sx={{ fontSize: '14px' }}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Betting Pool selector (conditional) */}
              {requiresBettingPool(limitType) && params && (
                <Autocomplete
                  options={params.bettingPools}
                  getOptionLabel={(option) => option.label}
                  value={params.bettingPools.find(bp => bp.value === selectedBettingPool) || null}
                  onChange={(_, newValue) => setSelectedBettingPool(newValue?.value || null)}
                  renderInput={(inputParams) => (
                    <TextField
                      {...inputParams}
                      label="Banca *"
                      placeholder="Buscar banca..."
                      InputLabelProps={{ sx: { fontSize: '12px' } }}
                    />
                  )}
                  sx={{ mb: 2 }}
                  size="small"
                />
              )}

              {/* Zone selector (conditional) */}
              {requiresZone(limitType) && params && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ fontSize: '12px' }}>Zona *</InputLabel>
                  <Select
                    value={selectedZone || ''}
                    onChange={(e) => setSelectedZone(e.target.value as number)}
                    label="Zona *"
                    sx={{ fontSize: '14px' }}
                  >
                    <MenuItem value=""><em>Seleccione</em></MenuItem>
                    {params.zones.map(zone => (
                      <MenuItem key={zone.value} value={zone.value} sx={{ fontSize: '14px' }}>
                        {zone.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Number pattern (conditional) */}
              {requiresNumberPattern(limitType) && (
                <TextField
                  label="Patron de Numero *"
                  fullWidth
                  value={betNumberPattern}
                  onChange={(e) => setBetNumberPattern(e.target.value)}
                  placeholder="Ej: 12, 123, 1234"
                  InputLabelProps={{ sx: { fontSize: '12px' } }}
                  sx={{ mb: 2 }}
                />
              )}

              <TextField
                type="date"
                label="Fecha de expiracion"
                fullWidth
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { fontSize: '12px' } }}
                sx={{ mb: 2 }}
                helperText="Opcional - dejar vacio para limite permanente"
              />

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontSize: '12px', color: '#787878' }}>
                    Sorteos *
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleSelectAllDraws}
                    sx={{ fontSize: '11px', bgcolor: '#6366f1', color: 'white', '&:hover': { bgcolor: '#5568d3' }, textTransform: 'none' }}
                  >
                    {params && selectedDraws.length === params.draws.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </Button>
                </Box>
                <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', p: 1, borderRadius: '4px', bgcolor: 'white' }}>
                  {params?.draws.map(draw => (
                    <FormControlLabel
                      key={draw.value}
                      control={
                        <Checkbox
                          checked={selectedDraws.includes(draw.value)}
                          onChange={() => handleDrawToggle(draw.value)}
                          size="small"
                        />
                      }
                      label={draw.label}
                      sx={{ display: 'block', mb: 0.5, '& .MuiFormControlLabel-label': { fontSize: '13px' } }}
                    />
                  ))}
                  {(!params || params.draws.length === 0) && (
                    <Typography sx={{ fontSize: '13px', color: '#999', textAlign: 'center', py: 2 }}>
                      No hay sorteos disponibles
                    </Typography>
                  )}
                </Box>
                <Typography sx={{ fontSize: '11px', color: '#999', mt: 0.5 }}>
                  {selectedDraws.length} seleccionado(s)
                </Typography>
              </Box>
            </Box>

            {/* Right Column - MONTO */}
            <Box>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#2c2c2c', mb: 2, borderBottom: '2px solid #6366f1', pb: 1 }}>
                MONTO
              </Typography>

              <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
                {BetTypes.map(({ key, label }) => (
                  <TextField
                    key={key}
                    type="number"
                    label={label}
                    fullWidth
                    value={amounts[key]}
                    onChange={(e) => handleAmountChange(key, e.target.value)}
                    placeholder="0.00"
                    InputLabelProps={{ sx: { fontSize: '12px' } }}
                    InputProps={{ sx: { fontSize: '14px', textAlign: 'right' } }}
                    sx={{ mb: 2 }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Days of Week Section */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#2c2c2c' }}>
                DIA DE SEMANA *
              </Typography>
              <Button
                size="small"
                onClick={handleSelectAllDays}
                sx={{ fontSize: '11px', bgcolor: '#6366f1', color: 'white', '&:hover': { bgcolor: '#5568d3' }, textTransform: 'none' }}
              >
                {selectedDays.length === DaysOfWeek.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {DaysOfWeek.map(day => (
                <FormControlLabel
                  key={day.value}
                  control={
                    <Checkbox
                      checked={selectedDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      size="small"
                    />
                  }
                  label={day.label}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '13px' } }}
                />
              ))}
            </Box>
            <Typography sx={{ fontSize: '11px', color: '#999', mt: 1 }}>
              {selectedDays.length} dia(s) seleccionado(s)
            </Typography>
          </Box>

          {/* Create Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                bgcolor: '#6366f1',
                color: 'white',
                fontSize: '14px',
                px: 5,
                py: 1.5,
                '&:hover': { bgcolor: '#5568d3' },
                '&:disabled': { bgcolor: '#9ca3af', color: 'white' },
                textTransform: 'none'
              }}
            >
              {submitting ? 'Creando...' : 'CREAR'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateLimit;
