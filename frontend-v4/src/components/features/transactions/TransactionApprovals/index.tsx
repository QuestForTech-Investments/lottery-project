import React, { useState, useEffect, useMemo, useCallback, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
  Grid,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import {
  getPendingApprovals,
  approveTransactionGroup,
  rejectTransactionGroup,
  type TransactionGroupAPI
} from '@services/transactionGroupService';
import { useUserPermissions } from '@hooks/useUserPermissions';

type SortDirection = 'asc' | 'desc';
type SortKey = 'groupNumber' | 'createdAt' | 'createdByName' | 'status' | 'entities' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const TransactionApprovals = (): React.ReactElement => {
  const { hasPermission } = useUserPermissions();
  const canApprove = hasPermission('TRANSACTION_APPROVE');

  const today = new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [groups, setGroups] = useState<TransactionGroupAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectGroupId, setRejectGroupId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const loadGroups = useCallback(async (start?: string, end?: string) => {
    try {
      setLoading(true);
      const data = await getPendingApprovals({
        startDate: start || undefined,
        endDate: end || undefined
      });
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups(today, today);
  }, [loadGroups, today]);

  const handleFilter = useCallback(() => {
    loadGroups(startDate, endDate);
  }, [startDate, endDate, loadGroups]);

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const parseUtc = (dateStr: string): Date => {
    return new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    return parseUtc(dateStr).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr: string | null): string => {
    if (!dateStr) return '';
    return parseUtc(dateStr).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getPendingAction = (status: string): string => {
    if (status === 'PendienteAprobacion') return 'Creación';
    if (status === 'PendienteEliminacion') return 'Eliminación';
    return status;
  };

  const getPendingActionColor = (status: string): string => {
    if (status === 'PendienteAprobacion') return '#1976d2';
    if (status === 'PendienteEliminacion') return '#e65100';
    return '#757575';
  };

  const getTotalDebit = (group: TransactionGroupAPI): number => {
    return (group.lines ?? []).reduce((sum, l) => sum + l.debit, 0);
  };

  const getTotalCredit = (group: TransactionGroupAPI): number => {
    return (group.lines ?? []).reduce((sum, l) => sum + l.credit, 0);
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = groups;

    if (quickFilter) {
      const lower = quickFilter.toLowerCase();
      filtered = filtered.filter((item) =>
        item.groupNumber.toLowerCase().includes(lower) ||
        (item.createdByName && item.createdByName.toLowerCase().includes(lower)) ||
        (item.notes && item.notes.toLowerCase().includes(lower)) ||
        (item.entities && item.entities.toLowerCase().includes(lower)) ||
        getPendingAction(item.status).toLowerCase().includes(lower)
      );
    }

    if (sortConfig.key) {
      const key = sortConfig.key;
      filtered = [...filtered].sort((a, b) => {
        let aVal: string = '';
        let bVal: string = '';

        switch (key) {
          case 'groupNumber': aVal = a.groupNumber; bVal = b.groupNumber; break;
          case 'createdAt': aVal = a.createdAt ?? ''; bVal = b.createdAt ?? ''; break;
          case 'createdByName': aVal = a.createdByName ?? ''; bVal = b.createdByName ?? ''; break;
          case 'status': aVal = a.status; bVal = b.status; break;
          case 'entities': aVal = a.entities ?? ''; bVal = b.entities ?? ''; break;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [groups, quickFilter, sortConfig]);

  const handleApprove = useCallback(async (id: number) => {
    try {
      setActionLoading(id);
      await approveTransactionGroup(id);
      setSnackbar({ open: true, message: 'Transacción aprobada exitosamente', severity: 'success' });
      await loadGroups(startDate, endDate);
    } catch (err) {
      console.error('Error approving group:', err);
      setSnackbar({ open: true, message: 'Error al aprobar la transacción', severity: 'error' });
    } finally {
      setActionLoading(null);
    }
  }, [loadGroups, startDate, endDate]);

  const openRejectDialog = useCallback((id: number) => {
    setRejectGroupId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  }, []);

  const handleRejectConfirm = useCallback(async () => {
    if (!rejectGroupId || !rejectReason.trim()) return;
    try {
      setActionLoading(rejectGroupId);
      setRejectDialogOpen(false);
      await rejectTransactionGroup(rejectGroupId, rejectReason.trim());
      setSnackbar({ open: true, message: 'Transacción rechazada exitosamente', severity: 'success' });
      await loadGroups(startDate, endDate);
    } catch (err) {
      console.error('Error rejecting group:', err);
      setSnackbar({ open: true, message: 'Error al rechazar la transacción', severity: 'error' });
    } finally {
      setActionLoading(null);
      setRejectGroupId(null);
      setRejectReason('');
    }
  }, [rejectGroupId, rejectReason, loadGroups, startDate, endDate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#2c2c2c' }}>
        Aprobaciones de transacciones
      </Typography>

      <Card elevation={1}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth size="small" label="Fecha inicial" type="date"
                value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth size="small" label="Fecha final" type="date"
                value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button fullWidth variant="contained" onClick={handleFilter} sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase' }}>
                Filtrar
              </Button>
            </Grid>
          </Grid>

          <TextField
            fullWidth size="small" placeholder="Filtro rápido"
            value={quickFilter} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuickFilter(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small"><SearchIcon fontSize="small" /></IconButton></InputAdornment> }}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell><TableSortLabel active={sortConfig.key === 'groupNumber'} direction={sortConfig.key === 'groupNumber' ? sortConfig.direction : 'asc'} onClick={() => handleSort('groupNumber')} sx={{ fontWeight: 600 }}>Número</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'status'} direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'} onClick={() => handleSort('status')} sx={{ fontWeight: 600 }}>Tipo</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'createdAt'} direction={sortConfig.key === 'createdAt' ? sortConfig.direction : 'asc'} onClick={() => handleSort('createdAt')} sx={{ fontWeight: 600 }}>Fecha</TableSortLabel></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hora</TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'createdByName'} direction={sortConfig.key === 'createdByName' ? sortConfig.direction : 'asc'} onClick={() => handleSort('createdByName')} sx={{ fontWeight: 600 }}>Creado por</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'entities'} direction={sortConfig.key === 'entities' ? sortConfig.direction : 'asc'} onClick={() => handleSort('entities')} sx={{ fontWeight: 600 }}>Entidades</TableSortLabel></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total Débito</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total Crédito</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, width: '120px' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">No hay aprobaciones pendientes</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedData.map((item) => (
                      <TableRow key={item.groupId} hover>
                        <TableCell>{item.groupNumber}</TableCell>
                        <TableCell>
                          <Chip
                            label={getPendingAction(item.status)}
                            size="small"
                            sx={{
                              fontSize: '12px',
                              fontWeight: 600,
                              bgcolor: item.status === 'PendienteEliminacion' ? '#fff3e0' : '#e3f2fd',
                              color: getPendingActionColor(item.status)
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>{formatTime(item.createdAt)}</TableCell>
                        <TableCell>{item.createdByName ?? ''}</TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {(() => {
                            if (!item.entities) return '';
                            const refs = item.entities.split(',').map(r => r.trim()).filter(Boolean);
                            const visible = refs.slice(0, 3);
                            const remaining = refs.slice(3);
                            return (
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                {visible.map((ref, i) => (
                                  <Chip key={i} label={ref} size="small" sx={{ fontSize: '12px' }} />
                                ))}
                                {remaining.length > 0 && (
                                  <Tooltip title={remaining.join(', ')} arrow>
                                    <Chip label={`+${remaining.length}`} size="small" sx={{ fontSize: '12px', cursor: 'pointer', bgcolor: '#e0e0e0' }} />
                                  </Tooltip>
                                )}
                              </Box>
                            );
                          })()}
                        </TableCell>
                        <TableCell align="right">${getTotalDebit(item).toFixed(2)}</TableCell>
                        <TableCell align="right">${getTotalCredit(item).toFixed(2)}</TableCell>
                        <TableCell>{item.notes ?? ''}</TableCell>
                        <TableCell align="center">
                          {!canApprove ? (
                            <Typography variant="caption" color="text.secondary">Sin permiso</Typography>
                          ) : actionLoading === item.groupId ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              <Tooltip title="Aprobar" arrow>
                                <IconButton size="small" onClick={() => handleApprove(item.groupId)} sx={{ color: '#28a745' }}>
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Rechazar" arrow>
                                <IconButton size="small" onClick={() => openRejectDialog(item.groupId)} sx={{ color: '#dc3545' }}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Mostrando {filteredAndSortedData.length} entradas pendientes
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Reject reason dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rechazar transacción</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Razón del rechazo"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
          >
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionApprovals;
