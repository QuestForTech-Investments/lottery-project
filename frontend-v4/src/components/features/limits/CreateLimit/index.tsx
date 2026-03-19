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
  SelectChangeEvent,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import limitService, { handleLimitError } from '@/services/limitService';
import {
  LimitType,
  CreateLimitTypeLabels,
  LimitParams,
  CreateLimitRequest,
  BetTypes,
  DaysOfWeek,
  daysToBitmask,
  BetTypeAmounts,
  BancaSelectionMode,
  BettingPoolOption
} from '@/types/limits';

interface Amounts {
  [key: string]: string;
}

// Map frontend camelCase keys to DB UPPER_SNAKE_CASE codes
const BET_TYPE_CODE_MAP: Record<string, string> = {
  directo: 'DIRECTO', pale: 'PALE', tripleta: 'TRIPLETA',
  cash3Straight: 'CASH3_STRAIGHT', cash3Box: 'CASH3_BOX',
  cash3FrontStraight: 'CASH3_FRONT_STRAIGHT', cash3FrontBox: 'CASH3_FRONT_BOX',
  cash3BackStraight: 'CASH3_BACK_STRAIGHT', cash3BackBox: 'CASH3_BACK_BOX',
  play4Straight: 'PLAY4_STRAIGHT', play4Box: 'PLAY4_BOX',
  pick5Straight: 'PICK5_STRAIGHT', pick5Box: 'PICK5_BOX',
  superPale: 'SUPER_PALE', pickTwo: 'PICK2',
  pickTwoFront: 'PICK2_FRONT', pickTwoBack: 'PICK2_BACK', pickTwoMiddle: 'PICK2_MIDDLE',
  bolita1: 'BOLITA', bolita2: 'BOLITA',
  singulacion1: 'SINGULACION', singulacion2: 'SINGULACION', singulacion3: 'SINGULACION'
};

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

// Styles
const ACCENT = '#6366f1';
const ACCENT_HOVER = '#5558e6';

const styles = {
  container: { p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' },
  title: { textAlign: 'center', mb: 3, fontSize: '28px', fontWeight: 400, color: '#2c2c2c', fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif' },
  card: { bgcolor: 'white', borderRadius: '12px', boxShadow: 'rgba(0, 0, 0, 0.15) 0px 6px 10px -4px', p: 3 },
  columnHeader: { fontSize: '14px', fontWeight: 700, color: '#252422', textTransform: 'uppercase' as const, mb: 2 },
  label: { color: '#9a9a9a', fontSize: '12px', fontWeight: 400, mb: 0.5, display: 'block' },
  select: {
    height: '40px', fontSize: '14px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT }
  },
  chip: {
    display: 'inline-block', padding: '4px 10px', borderRadius: '4px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', margin: '2px', transition: 'all 0.2s ease',
    border: '1px solid #ddd', backgroundColor: 'white', color: '#9a9a9a',
    '&:hover': { borderColor: ACCENT, color: ACCENT }
  },
  chipSelected: {
    display: 'inline-block', padding: '4px 10px', borderRadius: '4px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', margin: '2px', transition: 'all 0.2s ease',
    border: `1px solid ${ACCENT}`, backgroundColor: ACCENT, color: 'white'
  },
  dayChip: {
    display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
    cursor: 'pointer', margin: '3px', transition: 'all 0.2s ease',
    border: '1px solid #ddd', backgroundColor: 'white', color: '#9a9a9a'
  },
  dayChipSelected: {
    display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
    cursor: 'pointer', margin: '3px', transition: 'all 0.2s ease',
    border: 'none', backgroundColor: ACCENT, color: 'white'
  },
  selectAllButton: {
    bgcolor: 'transparent', color: ACCENT, borderRadius: '30px', padding: '5px 23px',
    fontSize: '12px', fontWeight: 400, border: `1px solid ${ACCENT}`, textTransform: 'none' as const,
    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${ACCENT}` }
  },
  createButton: {
    bgcolor: ACCENT, color: 'white', borderRadius: '30px', padding: '11px 40px',
    fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const, boxShadow: 'none',
    '&:hover': { bgcolor: ACCENT_HOVER, boxShadow: 'none' },
    '&:disabled': { bgcolor: '#ccc', color: 'white' }
  },
  amountField: { display: 'flex', alignItems: 'center', mb: 1.5 },
  amountLabel: { color: '#66615b', fontSize: '14px', fontWeight: 400, minWidth: '150px' },
  amountInput: {
    '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: '14px', height: '36px' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' }
  }
};

const CreateLimit = (): React.ReactElement => {
  const navigate = useNavigate();

  // Form state
  const [limitType, setLimitType] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [selectedDraws, setSelectedDraws] = useState<number[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // Zone state (for Limite Zona)
  const [selectedZones, setSelectedZones] = useState<number[]>([]);

  // Banca state (for Limite Banca / Local Banca)
  const [bancaSelectionMode, setBancaSelectionMode] = useState<BancaSelectionMode>('specific');
  const [selectedBettingPool, setSelectedBettingPool] = useState<BettingPoolOption | null>(null);
  const [selectedBancaZones, setSelectedBancaZones] = useState<number[]>([]);

  const [amounts, setAmounts] = useState<Amounts>(() => {
    const initial: Amounts = {};
    BetTypes.forEach(bt => { initial[bt.key] = ''; });
    return initial;
  });

  // Allowed game types for selected draws
  const [allowedGameTypes, setAllowedGameTypes] = useState<string[] | null>(null); // null = all allowed

  // Global limit check
  const [hasGlobalLimits, setHasGlobalLimits] = useState<boolean>(true); // assume true until checked

  // API data state
  const [params, setParams] = useState<LimitParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Fetch allowed game types when draws change
  useEffect(() => {
    if (selectedDraws.length === 0) {
      setAllowedGameTypes(null); // no draws = show all
      return;
    }
    // If all draws selected, show all game types (no filtering needed)
    if (params && selectedDraws.length === params.draws.length) {
      setAllowedGameTypes(null);
      return;
    }
    const fetchTypes = async () => {
      const codes = await limitService.getDrawGameTypes(selectedDraws);
      if (codes.length > 0) {
        setAllowedGameTypes(codes);
      } else {
        setAllowedGameTypes(null); // fallback: show all if API returns empty
      }
    };
    fetchTypes();
  }, [selectedDraws, params]);

  useEffect(() => {
    const loadParams = async () => {
      try {
        setLoading(true);
        const [data, globalLimits] = await Promise.all([
          limitService.getLimitParams(),
          limitService.getLimits({ limitTypes: [LimitType.GeneralForGroup] })
        ]);
        setParams(data);
        setHasGlobalLimits(globalLimits.length > 0);
      } catch (err) {
        console.error('Error loading params:', err);
        setError('Error al cargar los parametros del formulario');
      } finally {
        setLoading(false);
      }
    };
    loadParams();
  }, []);

  const limitTypeNum = limitType ? parseInt(limitType) : 0;
  const isZoneType = limitTypeNum === LimitType.GeneralForZone;
  const isBancaType = limitTypeNum === LimitType.GeneralForBettingPool || limitTypeNum === LimitType.LocalForBettingPool;

  const handleLimitTypeChange = useCallback((value: string) => {
    setLimitType(value);
    setSelectedZones([]);
    setSelectedBettingPool(null);
    setBancaSelectionMode('specific');
    setSelectedBancaZones([]);
  }, []);

  const handleDrawToggle = useCallback((drawId: number) => {
    setSelectedDraws(prev => prev.includes(drawId) ? prev.filter(d => d !== drawId) : [...prev, drawId]);
  }, []);

  const handleDayToggle = useCallback((dayValue: number) => {
    setSelectedDays(prev => prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]);
  }, []);

  const handleSelectAllDraws = useCallback(() => {
    if (!params) return;
    setSelectedDraws(prev => prev.length === params.draws.length ? [] : params.draws.map(d => d.value));
  }, [params]);

  const handleSelectAllDays = useCallback(() => {
    setSelectedDays(prev => prev.length === DaysOfWeek.length ? [] : DaysOfWeek.map(d => d.value));
  }, []);

  const handleAmountChange = useCallback((key: string, value: string) => {
    setAmounts(prev => ({ ...prev, [key]: value }));
  }, []);

  const validateForm = (): boolean => {
    if (!limitType) { setError('Debe seleccionar un tipo de limite'); return false; }
    if (selectedDraws.length === 0) { setError('Debe seleccionar al menos un sorteo'); return false; }
    if (selectedDays.length === 0) { setError('Debe seleccionar al menos un dia'); return false; }

    if (isZoneType && selectedZones.length === 0) {
      setError('Debe seleccionar al menos una zona'); return false;
    }

    if (isBancaType) {
      if (bancaSelectionMode === 'specific' && !selectedBettingPool) {
        setError('Debe seleccionar una banca'); return false;
      }
      if (bancaSelectionMode === 'byZone' && selectedBancaZones.length === 0) {
        setError('Debe seleccionar al menos una zona'); return false;
      }
    }

    const hasAmount = Object.values(amounts).some(v => v && parseFloat(v) > 0);
    if (!hasAmount) { setError('Debe configurar al menos un monto'); return false; }

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

      // Parent validation for child limit types
      if (limitTypeNum !== LimitType.GeneralForGroup && selectedDraws.length > 0) {
        const result = await limitService.validateParentLimits({
          limitType: limitTypeNum,
          drawId: selectedDraws[0],
          zoneId: isZoneType ? selectedZones[0] : undefined,
          bettingPoolId: isBancaType && selectedBettingPool ? selectedBettingPool.value : undefined,
          amounts: amountsPayload as Record<string, number>
        });

        if (!result.isValid) {
          const violationList = result.violations.map(v =>
            `${v.gameType}: $${v.childAmount} excede ${v.parentType} ($${v.parentAmount})`
          ).join('\n');
          setError(`Los montos exceden los limites del nivel superior:\n${violationList}`);
          setSubmitting(false);
          return;
        }
      }

      const request: CreateLimitRequest = {
        limitType: limitTypeNum as LimitType,
        drawIds: selectedDraws,
        daysOfWeek: daysToBitmask(selectedDays),
        amounts: amountsPayload,
        effectiveTo: expirationDate || undefined,
      };

      // Add entity-specific fields
      if (isZoneType) {
        request.zoneIds = selectedZones;
      }

      if (isBancaType) {
        request.bancaSelectionMode = bancaSelectionMode;
        if (bancaSelectionMode === 'specific' && selectedBettingPool) {
          request.bettingPoolIds = [selectedBettingPool.value];
        } else if (bancaSelectionMode === 'byZone') {
          request.bancaZoneIds = selectedBancaZones;
        }
      }

      await limitService.createLimit(request);

      setSnackbar({ open: true, message: 'Limites creados exitosamente', severity: 'success' });
      setTimeout(() => navigate('/limits/list'), 1500);
    } catch (err) {
      const errorMsg = handleLimitError(err, 'crear limite');
      setError(errorMsg);
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: ACCENT }} />
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Typography sx={styles.title}>Crear limites</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Left Column - LÍMITES */}
        <Box sx={styles.card}>
          <Typography sx={styles.columnHeader}>Limites</Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Warning if no global limits */}
          {!hasGlobalLimits && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Debe crear primero un Limite Global antes de crear otros tipos de límites.
            </Alert>
          )}

          {/* Tipo de Límite - only 4 core types */}
          <Box sx={{ mb: 2 }}>
            <Typography component="label" sx={styles.label}>Tipo de Limite</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={limitType}
                onChange={(e: SelectChangeEvent) => handleLimitTypeChange(e.target.value)}
                displayEmpty
                sx={styles.select}
              >
                <MenuItem value=""><em style={{ color: '#9a9a9a' }}>Seleccione</em></MenuItem>
                {Object.entries(CreateLimitTypeLabels).map(([value, label]) => {
                  const isGlobal = value === String(LimitType.GeneralForGroup);
                  const disabled = !hasGlobalLimits && !isGlobal;
                  return (
                    <MenuItem key={value} value={value} disabled={disabled}>
                      {label}{disabled ? ' (requiere Limite Global)' : ''}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>

          {/* Zone multi-select (for Limite Zona) */}
          {isZoneType && params && (
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={styles.label}>Zona(s)</Typography>
              <Autocomplete
                multiple
                options={params.zones}
                getOptionLabel={(option) => option.label}
                value={params.zones.filter(z => selectedZones.includes(z.value))}
                onChange={(_, newValue) => setSelectedZones(newValue.map(z => z.value))}
                renderInput={(inputParams) => (
                  <TextField {...inputParams} placeholder="Seleccione zona(s)..." size="small" />
                )}
                size="small"
              />
            </Box>
          )}

          {/* Banca selection (for Limite Banca / Local Banca) */}
          {isBancaType && params && (
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={styles.label}>Seleccion de bancas</Typography>
              <RadioGroup
                value={bancaSelectionMode}
                onChange={(e) => {
                  setBancaSelectionMode(e.target.value as BancaSelectionMode);
                  setSelectedBettingPool(null);
                  setSelectedBancaZones([]);
                }}
                sx={{ mb: 1 }}
              >
                <FormControlLabel value="specific" control={<Radio size="small" />} label="Una banca especifica" />
                <FormControlLabel value="all" control={<Radio size="small" />} label="Todas las bancas" />
                <FormControlLabel value="byZone" control={<Radio size="small" />} label="Bancas de zona(s)" />
              </RadioGroup>

              {bancaSelectionMode === 'specific' && (
                <Autocomplete
                  options={params.bettingPools}
                  getOptionLabel={(option) => `${option.code || ''} - ${option.label} (${option.zoneName || ''})`}
                  value={selectedBettingPool}
                  onChange={(_, newValue) => setSelectedBettingPool(newValue)}
                  renderInput={(inputParams) => (
                    <TextField {...inputParams} placeholder="Buscar banca..." size="small" />
                  )}
                  size="small"
                />
              )}

              {bancaSelectionMode === 'byZone' && (
                <Autocomplete
                  multiple
                  options={params.zones}
                  getOptionLabel={(option) => option.label}
                  value={params.zones.filter(z => selectedBancaZones.includes(z.value))}
                  onChange={(_, newValue) => setSelectedBancaZones(newValue.map(z => z.value))}
                  renderInput={(inputParams) => (
                    <TextField {...inputParams} placeholder="Seleccione zona(s)..." size="small" />
                  )}
                  size="small"
                />
              )}
            </Box>
          )}

          {/* Fecha de expiración */}
          <Box sx={{ mb: 2 }}>
            <Typography component="label" sx={styles.label}>Fecha de expiracion (opcional)</Typography>
            <TextField
              type="date"
              fullWidth
              size="small"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Sorteos */}
          <Box sx={{ mb: 2 }}>
            <Typography component="label" sx={styles.label}>Sorteos</Typography>
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
            <Button variant="outlined" onClick={handleSelectAllDraws} sx={styles.selectAllButton}>
              {params && selectedDraws.length === params.draws.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </Button>
          </Box>
        </Box>

        {/* Right Column - MONTO */}
        <Box>
          <Box sx={styles.card}>
            <Typography sx={styles.columnHeader}>Monto</Typography>

            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
              {BetTypes.filter(({ key }) => {
                if (!allowedGameTypes) return true;
                const dbCode = BET_TYPE_CODE_MAP[key as string];
                return dbCode ? allowedGameTypes.includes(dbCode) : true;
              }).map(({ key, label }) => (
                <Box key={key} sx={styles.amountField}>
                  <Typography sx={styles.amountLabel}>{label}</Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={amounts[key as string]}
                    onChange={(e) => handleAmountChange(key as string, e.target.value)}
                    sx={{ ...styles.amountInput, flex: 1 }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Día de semana */}
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={styles.label}>Dia de semana</Typography>
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
              <Button variant="outlined" onClick={handleSelectAllDays} sx={styles.selectAllButton}>
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

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateLimit;
