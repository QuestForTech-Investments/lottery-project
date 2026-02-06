import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Checkbox,
  ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import limitService, { handleLimitError } from '@/services/limitService';
import {
  LimitRule,
  LimitFilter,
  LimitType,
  LimitTypeLabels,
  LimitParams,
  DaysOfWeek,
  bitmaskToDayLabels,
  daysToBitmask,
  getLimitTypeOptions
} from '@/types/limits';

const LimitsList = (): React.ReactElement => {
  // Filter state
  const [selectedLimitTypes, setSelectedLimitTypes] = useState<LimitType[]>([]);
  const [selectedDrawIds, setSelectedDrawIds] = useState<number[]>([]);
  const [selectedDayValues, setSelectedDayValues] = useState<number[]>([]);
  const [selectedBancaId, setSelectedBancaId] = useState<number | ''>('');
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');

  // Tab state for results view
  const [activeWeekDayIndex, setActiveWeekDayIndex] = useState<number>(0);
  const [activeLimitTypeIndex, setActiveLimitTypeIndex] = useState<number>(0);
  const [activeDrawIndex, setActiveDrawIndex] = useState<number>(0);

  // Data state
  const [limits, setLimits] = useState<LimitRule[]>([]);
  const [params, setParams] = useState<LimitParams | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paramsLoading, setParamsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UI feedback state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [limitToDelete, setLimitToDelete] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  // Week days for tabs
  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Build filter object from current selections
  const buildFilter = useCallback((): LimitFilter => {
    const filter: LimitFilter = {};

    if (selectedLimitTypes.length > 0) {
      filter.limitTypes = selectedLimitTypes;
    }
    if (selectedDrawIds.length > 0) {
      filter.drawIds = selectedDrawIds;
    }
    if (selectedDayValues.length > 0) {
      filter.daysOfWeek = selectedDayValues;
    }
    if (selectedBancaId !== '') {
      filter.bettingPoolId = selectedBancaId;
    }
    if (selectedZoneId !== '') {
      filter.zoneId = selectedZoneId;
    }
    if (selectedGroupId !== '') {
      filter.groupId = selectedGroupId;
    }

    return filter;
  }, [selectedLimitTypes, selectedDrawIds, selectedDayValues, selectedBancaId, selectedZoneId, selectedGroupId]);

  // Load params on mount
  useEffect(() => {
    const loadParams = async () => {
      try {
        setParamsLoading(true);
        const paramsData = await limitService.getLimitParams();
        setParams(paramsData);
      } catch (err) {
        console.error('Error loading params:', err);
        setSnackbar({
          open: true,
          message: 'Error al cargar parámetros de filtros',
          severity: 'error'
        });
      } finally {
        setParamsLoading(false);
      }
    };
    loadParams();
  }, []);

  // Load limits function
  const loadLimits = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const filter = buildFilter();
      const limitsData = await limitService.getLimits(filter);
      setLimits(limitsData);
    } catch (err) {
      const errorMessage = handleLimitError(err, 'cargar límites');
      setError(errorMessage);
      console.error('Error loading limits:', err);
    } finally {
      setLoading(false);
    }
  }, [buildFilter]);

  // Initial load
  useEffect(() => {
    loadLimits();
  }, []);

  // Handle refresh button click
  const handleRefresh = useCallback((): void => {
    if (selectedLimitTypes.length === 0 && selectedDrawIds.length === 0 && selectedDayValues.length === 0) {
      setSnackbar({
        open: true,
        message: 'Por favor seleccione al menos un filtro (Tipo de Límite, Sorteos o Días)',
        severity: 'info'
      });
    }
    loadLimits(true);
  }, [selectedLimitTypes, selectedDrawIds, selectedDayValues, loadLimits]);

  // Handle delete confirmation dialog
  const handleDeleteClick = useCallback((id: number): void => {
    setLimitToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  // Confirm delete
  const handleConfirmDelete = useCallback(async (): Promise<void> => {
    if (limitToDelete === null) return;

    try {
      await limitService.deleteLimit(limitToDelete);
      setLimits(prev => prev.filter(limit => limit.limitRuleId !== limitToDelete));
      setSnackbar({
        open: true,
        message: 'Límite eliminado correctamente',
        severity: 'success'
      });
    } catch (err) {
      const errorMessage = handleLimitError(err, 'eliminar límite');
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setLimitToDelete(null);
    }
  }, [limitToDelete]);

  // Handle amount change with debounce
  const handleAmountChange = useCallback(async (id: number, newAmount: string): Promise<void> => {
    const amount = parseFloat(newAmount) || 0;

    // Update local state immediately for responsive UI
    setLimits(prev => prev.map(limit =>
      limit.limitRuleId === id ? { ...limit, maxBetPerNumber: amount } : limit
    ));

    // Update on server
    setUpdating(id);
    try {
      const limitToUpdate = limits.find(l => l.limitRuleId === id);
      if (limitToUpdate) {
        await limitService.updateLimit(id, {
          limitRuleId: id,
          limitType: limitToUpdate.limitType,
          drawIds: limitToUpdate.drawId ? [limitToUpdate.drawId] : [],
          daysOfWeek: limitToUpdate.daysOfWeek,
          amounts: {
            directo: amount
          }
        });
        setSnackbar({
          open: true,
          message: 'Monto actualizado',
          severity: 'success'
        });
      }
    } catch (err) {
      const errorMessage = handleLimitError(err, 'actualizar monto');
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      // Reload to restore correct value
      loadLimits(false);
    } finally {
      setUpdating(null);
    }
  }, [limits, loadLimits]);

  // Close snackbar
  const handleCloseSnackbar = useCallback((): void => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Cancel delete dialog
  const handleCancelDelete = useCallback((): void => {
    setDeleteDialogOpen(false);
    setLimitToDelete(null);
  }, []);

  // Show conditional filters when certain limit types are selected
  const showConditionalFilters = selectedLimitTypes.some(lt =>
    lt === LimitType.GeneralForBettingPool ||
    lt === LimitType.ByNumberForBettingPool ||
    lt === LimitType.LocalForBettingPool ||
    lt === LimitType.GeneralForZone ||
    lt === LimitType.ByNumberForZone ||
    lt === LimitType.GeneralForGroup ||
    lt === LimitType.ByNumberForGroup
  ) || selectedLimitTypes.length === 0;

  // Get limit type options for dropdown
  const limitTypeOptions = getLimitTypeOptions();

  // Get draws from params for dropdown
  const drawOptions = params?.draws || [];

  // Get days options
  const dayOptions = [...DaysOfWeek];

  // Get betting pools, zones, groups from params
  const bettingPoolOptions = params?.bettingPools || [];
  const zoneOptions = params?.zones || [];
  const groupOptions = params?.groups || [];

  // Filter limits based on active tabs for display
  const filteredLimits = limits.filter(limit => {
    // Filter by active weekday tab (using bitmask)
    const dayBitmask = 1 << activeWeekDayIndex; // Convert index to bitmask
    if (limit.daysOfWeek !== undefined && (limit.daysOfWeek & dayBitmask) === 0) {
      return false;
    }

    // Filter by active limit type tab
    const displayedLimitTypes = limitTypeOptions.slice(0, 3);
    if (displayedLimitTypes[activeLimitTypeIndex]) {
      const activeLimitType = displayedLimitTypes[activeLimitTypeIndex].value;
      if (limit.limitType !== activeLimitType) {
        return false;
      }
    }

    // Filter by active draw tab
    const displayedDraws = drawOptions.slice(0, 5);
    if (displayedDraws[activeDrawIndex]) {
      const activeDrawId = displayedDraws[activeDrawIndex].value;
      if (limit.drawId !== activeDrawId) {
        return false;
      }
    }

    return true;
  });

  // Format expiration date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get game type label for a limit
  const getGameTypeLabel = (limit: LimitRule): string => {
    return limit.gameTypeName || 'Directo';
  };

  // Get amount to display
  const getDisplayAmount = (limit: LimitRule): number => {
    return limit.maxBetPerNumber || limit.maxBetPerTicket || limit.maxBetPerBettingPool || limit.maxBetGlobal || 0;
  };

  // Loading state for initial load
  if (loading && limits.length === 0 && !error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Title */}
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
        Lista de límites
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Main filters */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
            {/* Limit Type */}
            <FormControl fullWidth disabled={paramsLoading}>
              <InputLabel sx={{ fontSize: '12px' }}>Tipo de Límite *</InputLabel>
              <Select
                multiple
                value={selectedLimitTypes}
                onChange={(e) => setSelectedLimitTypes(e.target.value as LimitType[])}
                input={<OutlinedInput label="Tipo de Límite *" />}
                renderValue={(selected) => `${selected.length} seleccionada(s)`}
                sx={{ fontSize: '14px' }}
              >
                {limitTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: '14px' }}>
                    <Checkbox checked={selectedLimitTypes.indexOf(option.value) > -1} size="small" />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Draws */}
            <FormControl fullWidth disabled={paramsLoading}>
              <InputLabel sx={{ fontSize: '12px' }}>Sorteos *</InputLabel>
              <Select
                multiple
                value={selectedDrawIds}
                onChange={(e) => setSelectedDrawIds(e.target.value as number[])}
                input={<OutlinedInput label="Sorteos *" />}
                renderValue={(selected) => `${selected.length} seleccionada(s)`}
                sx={{ fontSize: '14px' }}
              >
                {drawOptions.map((draw) => (
                  <MenuItem key={draw.value} value={draw.value} sx={{ fontSize: '14px' }}>
                    <Checkbox checked={selectedDrawIds.indexOf(draw.value) > -1} size="small" />
                    <ListItemText primary={draw.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Days */}
            <FormControl fullWidth disabled={paramsLoading}>
              <InputLabel sx={{ fontSize: '12px' }}>Días *</InputLabel>
              <Select
                multiple
                value={selectedDayValues}
                onChange={(e) => setSelectedDayValues(e.target.value as number[])}
                input={<OutlinedInput label="Días *" />}
                renderValue={(selected) => `${selected.length} seleccionada(s)`}
                sx={{ fontSize: '14px' }}
              >
                {dayOptions.map((day) => (
                  <MenuItem key={day.value} value={day.value} sx={{ fontSize: '14px' }}>
                    <Checkbox checked={selectedDayValues.indexOf(day.value) > -1} size="small" />
                    <ListItemText primary={day.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Conditional filters */}
          {showConditionalFilters && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
              <FormControl fullWidth disabled={paramsLoading}>
                <InputLabel sx={{ fontSize: '12px' }}>Bancas</InputLabel>
                <Select
                  value={selectedBancaId}
                  onChange={(e) => setSelectedBancaId(e.target.value as number | '')}
                  sx={{ fontSize: '14px' }}
                  label="Bancas"
                >
                  <MenuItem value=""><em>Todas</em></MenuItem>
                  {bettingPoolOptions.map((banca) => (
                    <MenuItem key={banca.value} value={banca.value} sx={{ fontSize: '14px' }}>
                      {banca.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={paramsLoading}>
                <InputLabel sx={{ fontSize: '12px' }}>Zonas</InputLabel>
                <Select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value as number | '')}
                  sx={{ fontSize: '14px' }}
                  label="Zonas"
                >
                  <MenuItem value=""><em>Todas</em></MenuItem>
                  {zoneOptions.map((zone) => (
                    <MenuItem key={zone.value} value={zone.value} sx={{ fontSize: '14px' }}>
                      {zone.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={paramsLoading}>
                <InputLabel sx={{ fontSize: '12px' }}>Grupos</InputLabel>
                <Select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value as number | '')}
                  sx={{ fontSize: '14px' }}
                  label="Grupos"
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {groupOptions.map((group) => (
                    <MenuItem key={group.value} value={group.value} sx={{ fontSize: '14px' }}>
                      {group.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Refresh Button */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={handleRefresh}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
                '&:disabled': { background: '#ccc' },
                fontSize: '14px',
                px: 4,
                py: 1,
                textTransform: 'none'
              }}
            >
              {loading ? 'CARGANDO...' : 'REFRESCAR'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        {/* Week day tabs */}
        <Tabs
          value={activeWeekDayIndex}
          onChange={(e, newValue) => setActiveWeekDayIndex(newValue)}
          sx={{
            borderBottom: 2,
            borderColor: '#6366f1',
            '& .MuiTab-root': { fontSize: '14px', minWidth: 'auto' },
            '& .Mui-selected': { color: '#6366f1' }
          }}
          TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}
        >
          {weekDays.map((day) => (
            <Tab key={day} label={day} />
          ))}
        </Tabs>

        {/* Limit type chips */}
        <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderBottom: '1px solid #ddd', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {limitTypeOptions.slice(0, 3).map((option, index) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => setActiveLimitTypeIndex(index)}
              variant={activeLimitTypeIndex === index ? 'filled' : 'outlined'}
              sx={{
                fontSize: '12px',
                background: activeLimitTypeIndex === index ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: activeLimitTypeIndex === index ? 'white' : '#333',
                borderColor: activeLimitTypeIndex === index ? '#6366f1' : '#ddd',
                '&:hover': { background: activeLimitTypeIndex === index ? 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' : '#f5f5f5' }
              }}
            />
          ))}
        </Box>

        {/* Draw chips */}
        <Box sx={{ p: 2, borderBottom: '1px solid #ddd', display: 'flex', gap: 1, overflowX: 'auto' }}>
          {drawOptions.slice(0, 5).map((draw, index) => (
            <Chip
              key={draw.value}
              label={draw.label}
              onClick={() => setActiveDrawIndex(index)}
              variant={activeDrawIndex === index ? 'filled' : 'outlined'}
              sx={{
                fontSize: '12px',
                background: activeDrawIndex === index ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: activeDrawIndex === index ? 'white' : '#333',
                borderColor: activeDrawIndex === index ? '#6366f1' : '#ddd',
                whiteSpace: 'nowrap',
                '&:hover': { background: activeDrawIndex === index ? 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' : '#f5f5f5' }
              }}
            />
          ))}
        </Box>

        {/* Limits table */}
        <CardContent>
          {loading && limits.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={24} sx={{ color: '#667eea' }} />
            </Box>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#e3e3e3' }}>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Tipo de jugada</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Monto</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Fecha de expiración</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878', textAlign: 'center' }}>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLimits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#999' }}>
                      {loading ? 'Cargando límites...' : 'No se encontraron límites con los filtros seleccionados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLimits.map((limit) => (
                    <TableRow key={limit.limitRuleId} hover>
                      <TableCell sx={{ fontSize: '14px' }}>{getGameTypeLabel(limit)}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>
                        <TextField
                          type="number"
                          value={getDisplayAmount(limit)}
                          onChange={(e) => handleAmountChange(limit.limitRuleId, e.target.value)}
                          size="small"
                          disabled={updating === limit.limitRuleId}
                          sx={{ width: '120px' }}
                          InputProps={{
                            sx: { fontSize: '14px', textAlign: 'right' },
                            endAdornment: updating === limit.limitRuleId ? (
                              <CircularProgress size={16} sx={{ ml: 1 }} />
                            ) : null
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{formatDate(limit.effectiveTo)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          onClick={() => handleDeleteClick(limit.limitRuleId)}
                          size="small"
                          sx={{ color: '#dc3545' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#999',
              mt: 2
            }}
          >
            Mostrando {filteredLimits.length} de {limits.length} entradas
          </Typography>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este límite? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} sx={{ color: '#666' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            sx={{
              bgcolor: '#dc3545',
              color: 'white',
              '&:hover': { bgcolor: '#c82333' }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default LimitsList;
