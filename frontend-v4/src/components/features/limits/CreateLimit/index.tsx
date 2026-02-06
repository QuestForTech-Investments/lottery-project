import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor,
  Autocomplete,
  SelectChangeEvent
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

// Styles using our app's design system colors
const styles = {
  container: {
    p: 3,
    bgcolor: '#f5f5f5',
    minHeight: '100vh'
  },
  title: {
    textAlign: 'center',
    mb: 3,
    fontSize: '28px',
    fontWeight: 400,
    color: '#2c2c2c',
    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif'
  },
  card: {
    bgcolor: 'white',
    borderRadius: '12px',
    boxShadow: 'rgba(0, 0, 0, 0.15) 0px 6px 10px -4px',
    p: 3
  },
  columnHeader: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#252422',
    textTransform: 'uppercase' as const,
    mb: 2
  },
  label: {
    color: '#9a9a9a',
    fontSize: '12px',
    fontWeight: 400,
    mb: 0.5,
    display: 'block'
  },
  select: {
    height: '40px',
    fontSize: '14px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ddd'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ccc'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#51cbce'
    }
  },
  // Chip/badge for sorteos and days - exactly like original
  chip: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    margin: '2px',
    transition: 'all 0.2s ease',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#9a9a9a',
    '&:hover': {
      borderColor: '#51cbce',
      color: '#51cbce'
    }
  },
  chipSelected: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    margin: '2px',
    transition: 'all 0.2s ease',
    border: '1px solid #51cbce',
    backgroundColor: '#51cbce',
    color: 'white'
  },
  // Day chip - orange/coral color like original
  dayChip: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    margin: '3px',
    transition: 'all 0.2s ease',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#9a9a9a'
  },
  dayChipSelected: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    margin: '3px',
    transition: 'all 0.2s ease',
    border: 'none',
    backgroundColor: '#ef8157', // Orange/coral like original
    color: 'white'
  },
  selectAllButton: {
    bgcolor: 'transparent',
    color: '#51cbce',
    borderRadius: '30px',
    padding: '5px 23px',
    fontSize: '12px',
    fontWeight: 400,
    border: '1px solid #51cbce',
    textTransform: 'none' as const,
    '&:hover': {
      bgcolor: 'rgba(81, 203, 206, 0.1)',
      border: '1px solid #51cbce'
    }
  },
  createButton: {
    bgcolor: '#51cbce',
    color: 'white',
    borderRadius: '30px',
    padding: '11px 40px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    boxShadow: 'none',
    '&:hover': {
      bgcolor: '#45b8bb',
      boxShadow: 'none'
    },
    '&:disabled': {
      bgcolor: '#ccc',
      color: 'white'
    }
  },
  amountField: {
    display: 'flex',
    alignItems: 'center',
    mb: 1.5
  },
  amountLabel: {
    color: '#66615b',
    fontSize: '14px',
    fontWeight: 400,
    minWidth: '150px'
  },
  amountInput: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '5px',
      fontSize: '14px',
      height: '36px'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ddd'
    }
  }
};

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

    if (requiresBettingPool(limitType) && !selectedBettingPool) {
      setError('Debe seleccionar una banca para este tipo de limite');
      return false;
    }

    if (requiresZone(limitType) && !selectedZone) {
      setError('Debe seleccionar una zona para este tipo de limite');
      return false;
    }

    if (requiresNumberPattern(limitType) && !betNumberPattern.trim()) {
      setError('Debe ingresar un patron de numero para este tipo de limite');
      return false;
    }

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#51cbce' }} />
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Typography sx={styles.title}>
        Crear limites
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Left Column - LÍMITES */}
        <Box sx={styles.card}>
          <Typography sx={styles.columnHeader}>
            Limites
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Tipo de Límite */}
          <Box sx={{ mb: 2 }}>
            <Typography component="label" sx={styles.label}>
              Tipo de Limite
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={limitType}
                onChange={(e: SelectChangeEvent) => {
                  setLimitType(e.target.value);
                  setSelectedBettingPool(null);
                  setSelectedZone(null);
                  setBetNumberPattern('');
                }}
                displayEmpty
                sx={styles.select}
              >
                <MenuItem value="">
                  <em style={{ color: '#9a9a9a' }}>Seleccione</em>
                </MenuItem>
                {Object.entries(LimitTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Betting Pool selector (conditional) */}
          {requiresBettingPool(limitType) && params && (
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={styles.label}>
                Banca
              </Typography>
              <Autocomplete
                options={params.bettingPools}
                getOptionLabel={(option) => option.label}
                value={params.bettingPools.find(bp => bp.value === selectedBettingPool) || null}
                onChange={(_, newValue) => setSelectedBettingPool(newValue?.value || null)}
                renderInput={(inputParams) => (
                  <TextField
                    {...inputParams}
                    placeholder="Buscar banca..."
                    size="small"
                  />
                )}
                size="small"
              />
            </Box>
          )}

          {/* Zone selector (conditional) */}
          {requiresZone(limitType) && params && (
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={styles.label}>
                Zona
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedZone || ''}
                  onChange={(e: SelectChangeEvent<number | string>) => setSelectedZone(e.target.value as number)}
                  displayEmpty
                  sx={styles.select}
                >
                  <MenuItem value="">
                    <em style={{ color: '#9a9a9a' }}>Seleccione</em>
                  </MenuItem>
                  {params.zones.map(zone => (
                    <MenuItem key={zone.value} value={zone.value}>{zone.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Number pattern (conditional) */}
          {requiresNumberPattern(limitType) && (
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={styles.label}>
                Patron de Numero
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={betNumberPattern}
                onChange={(e) => setBetNumberPattern(e.target.value)}
                placeholder="Ej: 12, 123, 1234"
              />
            </Box>
          )}

          {/* Fecha de expiración */}
          <Box sx={{ mb: 2 }}>
            <Typography component="label" sx={styles.label}>
              Fecha de expiracion
            </Typography>
            <TextField
              type="date"
              fullWidth
              size="small"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Sorteos - as chips like original */}
          <Box sx={{ mb: 2 }}>
            <Typography component="label" sx={styles.label}>
              Sorteos
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {params?.draws.map(draw => (
                <Box
                  key={draw.value}
                  onClick={() => handleDrawToggle(draw.value)}
                  sx={selectedDraws.includes(draw.value) ? styles.chipSelected : styles.chip}
                >
                  {draw.label}
                </Box>
              ))}
            </Box>
            <Button
              variant="outlined"
              onClick={handleSelectAllDraws}
              sx={styles.selectAllButton}
            >
              {params && selectedDraws.length === params.draws.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </Button>
          </Box>
        </Box>

        {/* Right Column - MONTO */}
        <Box>
          <Box sx={styles.card}>
            <Typography sx={styles.columnHeader}>
              Monto
            </Typography>

            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
              {BetTypes.map(({ key, label }) => (
                <Box key={key} sx={styles.amountField}>
                  <Typography sx={styles.amountLabel}>
                    {label}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={amounts[key]}
                    onChange={(e) => handleAmountChange(key, e.target.value)}
                    sx={{ ...styles.amountInput, flex: 1 }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Día de semana - as chips like original */}
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={styles.label}>
                Dia de semana
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {DaysOfWeek.map(day => (
                  <Box
                    key={day.value}
                    onClick={() => handleDayToggle(day.value)}
                    sx={selectedDays.includes(day.value) ? styles.dayChipSelected : styles.dayChip}
                  >
                    {day.label}
                  </Box>
                ))}
              </Box>
              <Button
                variant="outlined"
                onClick={handleSelectAllDays}
                sx={styles.selectAllButton}
              >
                {selectedDays.length === DaysOfWeek.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </Button>
            </Box>
          </Box>

          {/* Create Button */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              disableElevation
              sx={styles.createButton}
            >
              {submitting ? 'Creando...' : 'Crear'}
            </Button>
          </Box>
        </Box>
      </Box>

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
