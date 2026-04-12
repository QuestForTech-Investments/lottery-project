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
  Radio,
  Chip,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import limitService, { handleLimitError } from '@/services/limitService';
import {
  LimitType,
  CreateLimitTypeLabels,
  CreateByNumberLimitTypeLabels,
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

// Number format per game type: how many digit groups, digits per group, separator
const GAME_TYPE_NUMBER_FORMAT: Record<string, { groups: number; digitsPerGroup: number; placeholder: string }> = {
  directo: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  pale: { groups: 2, digitsPerGroup: 2, placeholder: '##-##' },
  tripleta: { groups: 3, digitsPerGroup: 2, placeholder: '##-##-##' },
  superPale: { groups: 2, digitsPerGroup: 2, placeholder: '##-##' },
  cash3Straight: { groups: 1, digitsPerGroup: 3, placeholder: '###' },
  cash3Box: { groups: 1, digitsPerGroup: 3, placeholder: '###' },
  cash3FrontStraight: { groups: 1, digitsPerGroup: 3, placeholder: '###' },
  cash3FrontBox: { groups: 1, digitsPerGroup: 3, placeholder: '###' },
  cash3BackStraight: { groups: 1, digitsPerGroup: 3, placeholder: '###' },
  cash3BackBox: { groups: 1, digitsPerGroup: 3, placeholder: '###' },
  play4Straight: { groups: 1, digitsPerGroup: 4, placeholder: '####' },
  play4Box: { groups: 1, digitsPerGroup: 4, placeholder: '####' },
  pick5Straight: { groups: 1, digitsPerGroup: 5, placeholder: '#####' },
  pick5Box: { groups: 1, digitsPerGroup: 5, placeholder: '#####' },
  pickTwo: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  pickTwoFront: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  pickTwoBack: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  pickTwoMiddle: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  bolita1: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  bolita2: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  singulacion1: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  singulacion2: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  singulacion3: { groups: 1, digitsPerGroup: 2, placeholder: '##' },
  panama: { groups: 1, digitsPerGroup: 3, placeholder: '###' },
};

const formatBetNumber = (rawDigits: string, format: { groups: number; digitsPerGroup: number }): string => {
  const digits = rawDigits.replace(/\D/g, '');
  const maxDigits = format.groups * format.digitsPerGroup;
  const truncated = digits.slice(0, maxDigits);
  if (format.groups === 1) return truncated;
  // Insert dashes between groups
  const parts: string[] = [];
  for (let i = 0; i < truncated.length; i += format.digitsPerGroup) {
    parts.push(truncated.slice(i, i + format.digitsPerGroup));
  }
  return parts.join('-');
};

const isNumberComplete = (value: string, format: { groups: number; digitsPerGroup: number }): boolean => {
  const digits = value.replace(/\D/g, '');
  return digits.length === format.groups * format.digitsPerGroup;
};

const generateDoubles = (format: { groups: number; digitsPerGroup: number }): string[] => {
  const doubles: string[] = [];
  if (format.digitsPerGroup === 2) {
    for (let i = 0; i <= 99; i++) {
      const n = i.toString().padStart(2, '0');
      if (format.groups === 1) {
        // Directo doubles: 00, 11, 22, ..., 99
        const d1 = Math.floor(i / 10), d2 = i % 10;
        if (d1 === d2) doubles.push(n);
      } else {
        // Pale/Tripleta doubles: same group repeated
        doubles.push(Array(format.groups).fill(n).join('-'));
      }
    }
  } else if (format.digitsPerGroup === 3) {
    for (let i = 0; i <= 9; i++) {
      doubles.push(String(i).repeat(3));
    }
  } else if (format.digitsPerGroup === 4) {
    for (let i = 0; i <= 9; i++) {
      doubles.push(String(i).repeat(4));
    }
  }
  return doubles;
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
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [betNumbers, setBetNumbers] = useState<Array<{ number: string; gameType: string; label: string }>>([]);
  const [betNumberInput, setBetNumberInput] = useState<string>('');
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
  const isZoneType = limitTypeNum === LimitType.GeneralForZone || limitTypeNum === LimitType.ByNumberForZone;
  const isBancaType = limitTypeNum === LimitType.GeneralForBettingPool || limitTypeNum === LimitType.LocalForBettingPool || limitTypeNum === LimitType.ByNumberForBettingPool;
  const isByNumberType = limitTypeNum === LimitType.ByNumberForGroup || limitTypeNum === LimitType.ByNumberForZone || limitTypeNum === LimitType.ByNumberForBettingPool;

  const handleLimitTypeChange = useCallback((value: string) => {
    setLimitType(value);
    setSelectedGameType('');
    setBetNumbers([]);
    setBetNumberInput('');
    // Reset amounts when switching to/from ByNumber
    setAmounts(() => { const initial: Amounts = {}; BetTypes.forEach(bt => { initial[bt.key] = ''; }); return initial; });
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
    if (isByNumberType && betNumbers.length === 0) { setError('Debe agregar al menos un numero'); return false; }
    if (isByNumberType) {
      // Check that each number's game type has an amount set
      const gameTypesUsed = [...new Set(betNumbers.map(b => b.gameType))];
      const missing = gameTypesUsed.filter(gt => !amounts[gt] || parseFloat(amounts[gt]) <= 0);
      if (missing.length > 0) {
        const labels = missing.map(gt => BetTypes.find(bt => bt.key === gt)?.label || gt);
        setError(`Falta configurar monto para: ${labels.join(', ')}`);
        return false;
      }
    }
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

      // Build base request fields
      const baseRequest: Partial<CreateLimitRequest> = {
        limitType: limitTypeNum as LimitType,
        drawIds: selectedDraws,
        daysOfWeek: daysToBitmask(selectedDays),
        effectiveTo: expirationDate || undefined,
      };

      if (isZoneType) {
        baseRequest.zoneIds = selectedZones;
      }
      if (isBancaType) {
        baseRequest.bancaSelectionMode = bancaSelectionMode;
        if (bancaSelectionMode === 'specific' && selectedBettingPool) {
          baseRequest.bettingPoolIds = [selectedBettingPool.value];
        } else if (bancaSelectionMode === 'byZone') {
          baseRequest.bancaZoneIds = selectedBancaZones;
        }
      }

      if (isByNumberType) {
        // Group numbers by game type, send one request per group with only its matching amount
        const groups = new Map<string, string[]>();
        betNumbers.forEach(({ number, gameType }) => {
          if (!groups.has(gameType)) groups.set(gameType, []);
          groups.get(gameType)!.push(number);
        });

        for (const [gameTypeKey, numbers] of groups) {
          const amt = parseFloat(amounts[gameTypeKey] || '0');
          if (amt <= 0) continue;
          await limitService.createLimit({
            ...baseRequest,
            amounts: { [gameTypeKey]: amt },
            betNumberPatterns: numbers,
          } as CreateLimitRequest);
        }
      } else {
        await limitService.createLimit({
          ...baseRequest,
          amounts: amountsPayload,
        } as CreateLimitRequest);
      }

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
                <Divider />
                {Object.entries(CreateByNumberLimitTypeLabels).map(([value, label]) => {
                  const disabled = !hasGlobalLimits;
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

          {/* Game type + Numbers (for ByNumber types) */}
          {isByNumberType && (
            <>
              {/* Game type selector — single select */}
              <Box sx={{ mb: 2 }}>
                <Typography component="label" sx={styles.label}>Jugada</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {BetTypes.filter(({ key }) => {
                    if (!allowedGameTypes) return true;
                    const dbCode = BET_TYPE_CODE_MAP[key as string];
                    return dbCode ? allowedGameTypes.includes(dbCode) : true;
                  }).map(({ key, label }) => (
                    <Box
                      key={key}
                      onClick={() => {
                        setSelectedGameType(prev => prev === key ? '' : key as string);
                        setBetNumberInput('');
                      }}
                      sx={selectedGameType === key ? styles.chipSelected : styles.chip}
                    >
                      {label}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Numbers input — only when a game type is selected */}
              {selectedGameType && GAME_TYPE_NUMBER_FORMAT[selectedGameType] && (() => {
                const fmt = GAME_TYPE_NUMBER_FORMAT[selectedGameType];
                const gameTypeLabel = BetTypes.find(bt => bt.key === selectedGameType)?.label || selectedGameType;
                const addNumber = () => {
                  const val = betNumberInput.trim();
                  if (val && isNumberComplete(val, fmt) && !betNumbers.some(b => b.number === val && b.gameType === selectedGameType)) {
                    setBetNumbers(prev => [...prev, { number: val, gameType: selectedGameType, label: gameTypeLabel }]);
                    setBetNumberInput('');
                  }
                };
                return (
                  <Box sx={{ mb: 2 }}>
                    <Typography component="label" sx={styles.label}>Numeros</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        value={betNumberInput}
                        onChange={(e) => {
                          setBetNumberInput(formatBetNumber(e.target.value, fmt));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addNumber();
                          }
                        }}
                        placeholder={fmt.placeholder}
                        sx={{ flex: 1 }}
                        inputProps={{ inputMode: 'numeric' }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={addNumber}>
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      {['directo', 'cash3Straight', 'cash3FrontStraight', 'cash3BackStraight'].includes(selectedGameType) && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            const existing = new Set(betNumbers.filter(b => b.gameType === selectedGameType).map(b => b.number));
                            const doubles = generateDoubles(fmt)
                              .filter(d => !existing.has(d))
                              .map(d => ({ number: d, gameType: selectedGameType, label: gameTypeLabel }));
                            setBetNumbers(prev => [...prev, ...doubles]);
                          }}
                          sx={{ ...styles.selectAllButton, whiteSpace: 'nowrap', fontSize: '11px' }}
                        >
                          Agregar dobles
                        </Button>
                      )}
                    </Box>
                    {betNumbers.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {betNumbers.map((item, idx) => (
                          <Chip
                            key={`${item.gameType}-${item.number}-${idx}`}
                            label={`${item.number} (${item.label})`}
                            size="small"
                            onDelete={() => setBetNumbers(prev => prev.filter((_, i) => i !== idx))}
                            sx={{ bgcolor: ACCENT, color: 'white', fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } } }}
                          />
                        ))}
                        {betNumbers.length > 3 && (
                          <Chip
                            label="Limpiar todos"
                            size="small"
                            variant="outlined"
                            onClick={() => setBetNumbers([])}
                            sx={{ color: '#ef8157', borderColor: '#ef8157' }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })()}
            </>
          )}
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
