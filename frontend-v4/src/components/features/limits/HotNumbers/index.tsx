import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Checkbox,
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
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
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

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedNumbers([]);
  };

  // Select all numbers
  const handleSelectAll = () => {
    setSelectedNumbers(numbers);
  };

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [numbersData, limitsData] = await Promise.all([
        hotNumberService.getHotNumbers(),
        hotNumberService.getHotNumberLimits()
      ]);

      const selected = numbersData.selectedNumbers || [];
      setSelectedNumbers(selected);
      setInitialNumbers(selected);
      setHotNumberLimits(limitsData || []);
      setSnackbar({
        open: true,
        message: 'Datos actualizados',
        severity: 'info'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: handleHotNumberError(err, 'actualizar datos'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
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
    // Validate
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
    if (!window.confirm('¿Eliminar este limite?')) return;

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
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 500, color: '#2c2c2c' }}>
          Numeros calientes
        </Typography>
        <Tooltip title="Actualizar datos">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 2,
            borderColor: '#6366f1',
            '& .MuiTab-root': { fontSize: '14px' },
            '& .Mui-selected': { color: '#6366f1' }
          }}
          TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}
        >
          <Tab label="Numeros calientes" />
          <Tab label="Limites" />
        </Tabs>

        <CardContent sx={{ p: 4 }}>
          {/* Tab 1: Hot Numbers Grid */}
          {activeTab === 0 && (
            <Box>
              {/* Action buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSelectAll}
                    sx={{ textTransform: 'none' }}
                  >
                    Seleccionar todos
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearSelection}
                    sx={{ textTransform: 'none' }}
                  >
                    Limpiar seleccion
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {selectedNumbers.length} numeros seleccionados
                </Typography>
              </Box>

              {/* Numbers grid 10x10 */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 1, mb: 3 }}>
                {numbers.map(num => {
                  const isSelected = selectedNumbers.includes(num);
                  const displayNum = String(num).padStart(2, '0');

                  return (
                    <Box
                      key={num}
                      onClick={() => handleNumberClick(num)}
                      sx={{
                        textAlign: 'center',
                        p: 1.5,
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        bgcolor: isSelected ? '#6366f1' : 'white',
                        color: isSelected ? 'white' : '#333',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: isSelected ? '#5558d3' : '#f0f0f0',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                        size="small"
                        sx={{
                          p: 0,
                          mr: 0.5,
                          color: isSelected ? 'white' : '#6366f1',
                          '&.Mui-checked': { color: 'white' }
                        }}
                      />
                      <Typography component="span" sx={{ fontSize: '14px', fontWeight: 500 }}>
                        {displayNum}
                      </Typography>
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
                  startIcon={savingNumbers ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    bgcolor: '#6366f1',
                    color: 'white',
                    '&:hover': { bgcolor: '#5558d3' },
                    '&:disabled': { bgcolor: '#ccc' },
                    fontSize: '14px',
                    px: 5,
                    py: 1.5,
                    textTransform: 'none'
                  }}
                >
                  {savingNumbers ? 'Guardando...' : 'GUARDAR'}
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
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Sorteos</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }} align="right">Directo</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }} align="right">Pale 1 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }} align="right">Pale 2 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }} align="right">Tripleta 1 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }} align="right">Tripleta 2 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }} align="right">Tripleta 3 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }} align="center">Acciones</TableCell>
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
        </CardContent>
      </Card>

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
