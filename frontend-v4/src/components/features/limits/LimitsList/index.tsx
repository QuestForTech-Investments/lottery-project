import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import limitService, { handleLimitError } from '@/services/limitService';
import {
  LimitRule,
  LimitFilter,
  LimitType,
  LimitParams,
  DaysOfWeek,
  getLimitTypeOptions
} from '@/types/limits';

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
    mb: '20px',
    border: 'none'
  },
  cardContent: {
    p: 3
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
  // Refresh button - using our primary color #51cbce
  refreshButton: {
    bgcolor: '#51cbce',
    color: 'white',
    borderRadius: '30px',
    padding: '11px 23px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    border: 'none',
    boxShadow: 'none',
    minWidth: '120px',
    '&:hover': {
      bgcolor: '#45b8bb'
    },
    '&:disabled': {
      bgcolor: '#ccc',
      color: 'white'
    }
  },
  tableHeader: {
    bgcolor: '#e3e3e3',
    '& th': {
      fontSize: '12px',
      fontWeight: 600,
      color: '#787878',
      borderBottom: 'none',
      py: 1.5
    }
  },
  tableCell: {
    fontSize: '14px',
    color: '#2c2c2c',
    py: 1.5
  }
};

const LimitsList = (): React.ReactElement => {
  // Simple filter state - single selections like original
  const [selectedLimitType, setSelectedLimitType] = useState<string>('');
  const [selectedDrawId, setSelectedDrawId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Data state
  const [limits, setLimits] = useState<LimitRule[]>([]);
  const [params, setParams] = useState<LimitParams | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

  // Build filter object from current selections
  const buildFilter = useCallback((): LimitFilter => {
    const filter: LimitFilter = {};

    if (selectedLimitType) {
      filter.limitTypes = [selectedLimitType as LimitType];
    }
    if (selectedDrawId) {
      filter.drawIds = [parseInt(selectedDrawId)];
    }
    if (selectedDay) {
      filter.daysOfWeek = [parseInt(selectedDay)];
    }

    return filter;
  }, [selectedLimitType, selectedDrawId, selectedDay]);

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
  const loadLimits = useCallback(async () => {
    try {
      setLoading(true);
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

  // Handle refresh button click
  const handleRefresh = useCallback((): void => {
    loadLimits();
  }, [loadLimits]);

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

  // Handle amount change
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
      loadLimits();
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

  // Get limit type options for dropdown
  const limitTypeOptions = getLimitTypeOptions();

  // Get draws from params for dropdown
  const drawOptions = params?.draws || [];

  // Get days options
  const dayOptions = [...DaysOfWeek];

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

  return (
    <Box sx={styles.container}>
      {/* Title - exactly like original */}
      <Typography sx={styles.title}>
        Lista de límites
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters Card - exactly like original */}
      <Box sx={styles.card}>
        <Box sx={styles.cardContent}>
          {/* 3 simple dropdowns in a row - exactly like original */}
          <Box sx={{
            display: 'flex',
            gap: 3,
            mb: 3,
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            justifyContent: 'center'
          }}>
            {/* Tipo de Límite */}
            <Box sx={{ minWidth: 210 }}>
              <Typography component="label" sx={styles.label}>
                Tipo de Límite
              </Typography>
              <FormControl fullWidth size="small" disabled={paramsLoading}>
                <Select
                  value={selectedLimitType}
                  onChange={(e: SelectChangeEvent) => setSelectedLimitType(e.target.value)}
                  displayEmpty
                  sx={styles.select}
                >
                  <MenuItem value="">
                    <em style={{ color: '#9a9a9a' }}>Seleccione</em>
                  </MenuItem>
                  {limitTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Sorteos */}
            <Box sx={{ minWidth: 210 }}>
              <Typography component="label" sx={styles.label}>
                Sorteos
              </Typography>
              <FormControl fullWidth size="small" disabled={paramsLoading}>
                <Select
                  value={selectedDrawId}
                  onChange={(e: SelectChangeEvent) => setSelectedDrawId(e.target.value)}
                  displayEmpty
                  sx={styles.select}
                >
                  <MenuItem value="">
                    <em style={{ color: '#9a9a9a' }}>Seleccione</em>
                  </MenuItem>
                  {drawOptions.map((draw) => (
                    <MenuItem key={draw.value} value={draw.value.toString()}>
                      {draw.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Dias */}
            <Box sx={{ minWidth: 210 }}>
              <Typography component="label" sx={styles.label}>
                Dias
              </Typography>
              <FormControl fullWidth size="small" disabled={paramsLoading}>
                <Select
                  value={selectedDay}
                  onChange={(e: SelectChangeEvent) => setSelectedDay(e.target.value)}
                  displayEmpty
                  sx={styles.select}
                >
                  <MenuItem value="">
                    <em style={{ color: '#9a9a9a' }}>Seleccione</em>
                  </MenuItem>
                  {dayOptions.map((day) => (
                    <MenuItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Refresh Button - turquoise like original */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={handleRefresh}
              disabled={loading}
              disableElevation
              sx={styles.refreshButton}
            >
              {loading ? 'Cargando...' : 'Refrescar'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Results Table Card */}
      {limits.length > 0 && (
        <Box sx={styles.card}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={styles.tableHeader}>
                  <TableCell>Tipo de jugada</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Fecha de expiración</TableCell>
                  <TableCell align="center">Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {limits.map((limit) => (
                  <TableRow key={limit.limitRuleId} hover>
                    <TableCell sx={styles.tableCell}>{getGameTypeLabel(limit)}</TableCell>
                    <TableCell sx={styles.tableCell}>
                      <TextField
                        type="number"
                        value={getDisplayAmount(limit)}
                        onChange={(e) => handleAmountChange(limit.limitRuleId, e.target.value)}
                        size="small"
                        disabled={updating === limit.limitRuleId}
                        sx={{
                          width: '120px',
                          '& .MuiOutlinedInput-root': {
                            fontSize: '14px'
                          }
                        }}
                        InputProps={{
                          endAdornment: updating === limit.limitRuleId ? (
                            <CircularProgress size={16} sx={{ ml: 1 }} />
                          ) : null
                        }}
                      />
                    </TableCell>
                    <TableCell sx={styles.tableCell}>{formatDate(limit.effectiveTo)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleDeleteClick(limit.limitRuleId)}
                        size="small"
                        sx={{ color: '#dc3545' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#999',
              py: 2
            }}
          >
            Mostrando {limits.length} entradas
          </Typography>
        </Box>
      )}

      {/* Empty state */}
      {!loading && limits.length === 0 && (
        <Box sx={{ ...styles.card, p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: '#9a9a9a', fontSize: '14px' }}>
            Seleccione los filtros y presione "Refrescar" para ver los límites
          </Typography>
        </Box>
      )}

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#51cbce' }} />
        </Box>
      )}

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
