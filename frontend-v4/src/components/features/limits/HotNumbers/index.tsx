import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import hotNumberService, { handleHotNumberError } from '@/services/hotNumberService';
import limitService from '@/services/limitService';
import type {
  HotNumberLimit,
  LimitParams,
  LimitSelectOption
} from '@/types/limits';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Styles matching the original app exactly
const styles = {
  container: {
    p: 3,
    bgcolor: '#f4f3ef',
    minHeight: '100vh'
  },
  card: {
    bgcolor: 'white',
    borderRadius: '12px',
    boxShadow: 'rgba(0, 0, 0, 0.15) 0px 6px 10px -4px'
  },
  // Number cell - unselected (turquoise border)
  numberCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    padding: '11px 10px',
    border: '2px solid #51cbce',
    borderRadius: '3px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '70px',
    '&:hover': {
      backgroundColor: 'rgba(81, 203, 206, 0.1)'
    }
  },
  // Number cell - selected (yellow/orange background)
  numberCellSelected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    padding: '11px 10px',
    border: '2px solid #fbc658',
    borderRadius: '3px',
    backgroundColor: '#fbc658',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '70px',
    '&:hover': {
      backgroundColor: '#f5b741'
    }
  },
  // Fire icon - inactive (gray)
  fireIconInactive: {
    color: '#9a9a9a',
    fontSize: '16px'
  },
  // Fire icon - active (red/orange)
  fireIconActive: {
    color: '#ff6b35',
    fontSize: '16px'
  },
  // Number text
  numberText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#66615b'
  },
  numberTextSelected: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'white'
  },
  // Tab styles
  tabs: {
    bgcolor: '#f5f5f5',
    '& .MuiTab-root': {
      fontSize: '14px',
      textTransform: 'none',
      minHeight: '48px'
    },
    '& .Mui-selected': {
      color: '#495057',
      bgcolor: 'white'
    }
  },
  // Save button
  saveButton: {
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
  }
};

const HotNumbers = (): React.ReactElement => {
  // Tab state
  const [activeTab, setActiveTab] = useState<number>(0);

  // Hot numbers (Tab 1) state
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [initialNumbers, setInitialNumbers] = useState<number[]>([]);

  // Limits (Tab 2) state
  const [hotNumberLimits, setHotNumberLimits] = useState<HotNumberLimit[]>([]);
  const [newLimit, setNewLimit] = useState<Omit<HotNumberLimit, 'id'>>({
    drawIds: [],
    directo: 0,
    pale1Caliente: 0,
    pale2Caliente: 0,
    tripleta1Caliente: 0,
    tripleta2Caliente: 0,
    tripleta3Caliente: 0
  });

  // Form params (draws dropdown)
  const [params, setParams] = useState<LimitParams | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingNumbers, setSavingNumbers] = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);
  const [deletingLimitId, setDeletingLimitId] = useState<number | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Generate numbers 00-99
  const numbers = Array.from({ length: 100 }, (_, i) => i);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [numbersData, limitsData, paramsData] = await Promise.all([
          hotNumberService.getHotNumbers(),
          hotNumberService.getHotNumberLimits(),
          limitService.getLimitParams()
        ]);

        const selected = numbersData.selectedNumbers || [];
        setSelectedNumbers(selected);
        setInitialNumbers(selected);
        setHotNumberLimits(limitsData || []);
        setParams(paramsData);
      } catch (err) {
        console.error('Error loading hot numbers:', err);
        setSnackbar({
          open: true,
          message: handleHotNumberError(err, 'cargar datos'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if numbers have changed
  const hasNumbersChanged = useCallback(() => {
    if (selectedNumbers.length !== initialNumbers.length) return true;
    const sortedCurrent = [...selectedNumbers].sort((a, b) => a - b);
    const sortedInitial = [...initialNumbers].sort((a, b) => a - b);
    return sortedCurrent.some((num, idx) => num !== sortedInitial[idx]);
  }, [selectedNumbers, initialNumbers]);

  // Toggle number selection
  const handleNumberClick = useCallback((num: number) => {
    setSelectedNumbers(prev =>
      prev.includes(num)
        ? prev.filter(n => n !== num)
        : [...prev, num]
    );
  }, []);

  // Save selected numbers
  const handleSaveNumbers = async () => {
    setSavingNumbers(true);
    try {
      await hotNumberService.updateHotNumbers(selectedNumbers);
      setInitialNumbers(selectedNumbers);
      setSnackbar({
        open: true,
        message: 'Numeros calientes guardados exitosamente',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving hot numbers:', err);
      setSnackbar({
        open: true,
        message: handleHotNumberError(err, 'guardar numeros'),
        severity: 'error'
      });
    } finally {
      setSavingNumbers(false);
    }
  };

  // Handle new limit form changes
  const handleLimitFieldChange = (field: keyof Omit<HotNumberLimit, 'id'>, value: number | number[]) => {
    setNewLimit(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save new limit
  const handleSaveLimit = async () => {
    if (newLimit.drawIds.length === 0) {
      setSnackbar({
        open: true,
        message: 'Debe seleccionar al menos un sorteo',
        severity: 'warning'
      });
      return;
    }

    setSavingLimit(true);
    try {
      const saved = await hotNumberService.createHotNumberLimit(newLimit);
      setHotNumberLimits(prev => [...prev, saved]);
      setNewLimit({
        drawIds: [],
        directo: 0,
        pale1Caliente: 0,
        pale2Caliente: 0,
        tripleta1Caliente: 0,
        tripleta2Caliente: 0,
        tripleta3Caliente: 0
      });
      setSnackbar({
        open: true,
        message: 'Limite guardado exitosamente',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving limit:', err);
      setSnackbar({
        open: true,
        message: handleHotNumberError(err, 'guardar limite'),
        severity: 'error'
      });
    } finally {
      setSavingLimit(false);
    }
  };

  // Delete limit
  const handleDeleteLimit = async (id: number) => {
    if (!window.confirm('Eliminar este limite?')) return;

    setDeletingLimitId(id);
    try {
      await hotNumberService.deleteHotNumberLimit(id);
      setHotNumberLimits(prev => prev.filter(l => l.id !== id));
      setSnackbar({
        open: true,
        message: 'Limite eliminado exitosamente',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting limit:', err);
      setSnackbar({
        open: true,
        message: handleHotNumberError(err, 'eliminar limite'),
        severity: 'error'
      });
    } finally {
      setDeletingLimitId(null);
    }
  };

  // Get draw names for display
  const getDrawNames = (drawIds: number[]): string => {
    if (!params?.draws) return drawIds.join(', ');
    return drawIds
      .map(id => params.draws.find(d => d.value === id)?.label || id.toString())
      .join(', ');
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#51cbce' }} />
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.card}>
        {/* Tabs - like original */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={styles.tabs}
        >
          <Tab label="Numeros calientes" />
          <Tab label="Limites" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 1: Hot Numbers Grid - exactly like original */}
          {activeTab === 0 && (
            <Box>
              {/* Numbers grid - flex wrap like original */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {numbers.map(num => {
                  const isSelected = selectedNumbers.includes(num);
                  const displayNum = String(num).padStart(2, '0');

                  return (
                    <Box
                      key={num}
                      onClick={() => handleNumberClick(num)}
                      sx={isSelected ? styles.numberCellSelected : styles.numberCell}
                    >
                      <Typography
                        component="span"
                        sx={isSelected ? styles.numberTextSelected : styles.numberText}
                      >
                        {displayNum}
                      </Typography>
                      <LocalFireDepartmentIcon
                        sx={isSelected ? styles.fireIconActive : styles.fireIconInactive}
                      />
                    </Box>
                  );
                })}
              </Box>

              {/* Save button */}
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveNumbers}
                  disabled={savingNumbers || !hasNumbersChanged()}
                  disableElevation
                  sx={styles.saveButton}
                >
                  {savingNumbers ? 'Guardando...' : 'Guardar'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 2: Limits Table */}
          {activeTab === 1 && (
            <Box>
              {/* New limit form */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: '#fafafa',
                  borderRadius: 1,
                  border: '1px solid #eee'
                }}
              >
                {/* Draw selector */}
                <FormControl size="small" sx={{ gridColumn: 'span 2' }}>
                  <InputLabel>Sorteos</InputLabel>
                  <Select
                    multiple
                    value={newLimit.drawIds}
                    onChange={e => handleLimitFieldChange('drawIds', e.target.value as number[])}
                    input={<OutlinedInput label="Sorteos" />}
                    renderValue={selected => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as number[]).map(id => {
                          const draw = params?.draws.find(d => d.value === id);
                          return (
                            <Chip
                              key={id}
                              label={draw?.label || id}
                              size="small"
                              sx={{ bgcolor: '#e8e8fc' }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {params?.draws.map((draw: LimitSelectOption) => (
                      <MenuItem key={draw.value} value={draw.value}>
                        {draw.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Amount fields */}
                <TextField
                  label="Directo"
                  type="number"
                  size="small"
                  value={newLimit.directo}
                  onChange={e => handleLimitFieldChange('directo', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Pale 1 Caliente"
                  type="number"
                  size="small"
                  value={newLimit.pale1Caliente}
                  onChange={e => handleLimitFieldChange('pale1Caliente', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Pale 2 Caliente"
                  type="number"
                  size="small"
                  value={newLimit.pale2Caliente}
                  onChange={e => handleLimitFieldChange('pale2Caliente', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Tripleta 1 Caliente"
                  type="number"
                  size="small"
                  value={newLimit.tripleta1Caliente}
                  onChange={e => handleLimitFieldChange('tripleta1Caliente', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Tripleta 2 Caliente"
                  type="number"
                  size="small"
                  value={newLimit.tripleta2Caliente}
                  onChange={e => handleLimitFieldChange('tripleta2Caliente', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Tripleta 3 Caliente"
                  type="number"
                  size="small"
                  value={newLimit.tripleta3Caliente}
                  onChange={e => handleLimitFieldChange('tripleta3Caliente', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                />

                {/* Add button */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveLimit}
                    disabled={savingLimit || newLimit.drawIds.length === 0}
                    startIcon={savingLimit ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                    sx={{
                      bgcolor: '#28a745',
                      '&:hover': { bgcolor: '#218838' },
                      textTransform: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Agregar
                  </Button>
                </Box>
              </Box>

              {/* Limits table */}
              <Table sx={{ mb: 3 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#e3e3e3' }}>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Sorteos</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }} align="right">Directo</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }} align="right">Pale 1 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }} align="right">Pale 2 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }} align="right">Tripleta 1</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }} align="right">Tripleta 2</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }} align="right">Tripleta 3</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hotNumberLimits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', fontSize: '13px', color: '#999', py: 3 }}>
                        No hay limites configurados
                      </TableCell>
                    </TableRow>
                  ) : (
                    hotNumberLimits.map(limit => (
                      <TableRow key={limit.id} hover>
                        <TableCell sx={{ fontSize: '13px', maxWidth: 200 }}>
                          <Tooltip title={getDrawNames(limit.drawIds)}>
                            <Box
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {getDrawNames(limit.drawIds)}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '13px' }}>
                          {limit.directo.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '13px' }}>
                          {limit.pale1Caliente.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '13px' }}>
                          {limit.pale2Caliente.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '13px' }}>
                          {limit.tripleta1Caliente.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '13px' }}>
                          {limit.tripleta2Caliente.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '13px' }}>
                          {limit.tripleta3Caliente.toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Eliminar limite">
                            <IconButton
                              size="small"
                              onClick={() => limit.id && handleDeleteLimit(limit.id)}
                              disabled={deletingLimitId === limit.id}
                              sx={{
                                color: '#dc3545',
                                '&:hover': { bgcolor: '#fde8ea' }
                              }}
                            >
                              {deletingLimitId === limit.id ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                <DeleteIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HotNumbers;
