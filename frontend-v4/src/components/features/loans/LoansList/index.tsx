import React, { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  Button,
  IconButton,
  Chip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import { getLoans, createLoanPayment, updateLoan, cancelLoan, type LoanAPI } from '@services/loanService';

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  annual: 'Anual'
};

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const formatCurrency = (val: number): string =>
  `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

type SortKey = keyof LoanAPI;

const LoansList = (): React.ReactElement => {
  const [loans, setLoans] = useState<LoanAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyActive, setOnlyActive] = useState(true);
  const [quickFilter, setQuickFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  // Payment modal
  const [paymentLoan, setPaymentLoan] = useState<LoanAPI | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // Edit modal
  const [editLoan, setEditLoan] = useState<LoanAPI | null>(null);
  const [editInstallment, setEditInstallment] = useState('');
  const [editFrequency, setEditFrequency] = useState('');
  const [editPaymentDay, setEditPaymentDay] = useState<number>(0);
  const [editInterestRate, setEditInterestRate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete modal
  const [deleteLoan, setDeleteLoan] = useState<LoanAPI | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLoans(onlyActive ? { status: 'active' } : undefined);
      setLoans(data);
    } catch (err) {
      console.error('Error loading loans:', err);
    } finally {
      setLoading(false);
    }
  }, [onlyActive]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const filteredAndSorted = useMemo(() => {
    let data = loans;

    if (quickFilter) {
      const lower = quickFilter.toLowerCase();
      data = data.filter(l =>
        l.loanNumber.toLowerCase().includes(lower) ||
        l.entityName.toLowerCase().includes(lower) ||
        l.entityCode.toLowerCase().includes(lower)
      );
    }

    if (sortConfig.key) {
      const key = sortConfig.key;
      data = [...data].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const cmp = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
          return sortConfig.direction === 'asc' ? cmp : -cmp;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [loans, quickFilter, sortConfig]);

  const totals = useMemo(() => {
    return filteredAndSorted.reduce((acc, l) => ({
      principal: acc.principal + l.principalAmount,
      totalPaid: acc.totalPaid + l.totalPaid,
      remaining: acc.remaining + l.remainingBalance
    }), { principal: 0, totalPaid: 0, remaining: 0 });
  }, [filteredAndSorted]);

  const handleOpenPayment = (loan: LoanAPI) => {
    setPaymentLoan(loan);
    setPaymentAmount(loan.installmentAmount.toString());
    setPaymentNotes('');
  };

  const handlePayment = async () => {
    if (!paymentLoan || !paymentAmount) return;
    setPaymentSubmitting(true);
    try {
      await createLoanPayment(paymentLoan.loanId, {
        amountPaid: parseFloat(paymentAmount),
        notes: paymentNotes || undefined
      });
      setSnackbar({ open: true, message: 'Pago registrado exitosamente', severity: 'success' });
      setPaymentLoan(null);
      loadLoans();
    } catch (err) {
      console.error('Error creating payment:', err);
      setSnackbar({ open: true, message: 'Error al registrar pago', severity: 'error' });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleOpenEdit = (loan: LoanAPI) => {
    setEditLoan(loan);
    setEditInstallment(loan.installmentAmount.toString());
    setEditFrequency(loan.frequency);
    setEditPaymentDay(loan.paymentDay ?? 0);
    setEditInterestRate(loan.interestRate.toString());
    setEditNotes(loan.notes ?? '');
  };

  const handleEdit = async () => {
    if (!editLoan) return;
    setEditSubmitting(true);
    try {
      await updateLoan(editLoan.loanId, {
        installmentAmount: parseFloat(editInstallment),
        frequency: editFrequency,
        paymentDay: editFrequency === 'weekly' ? editPaymentDay : undefined,
        interestRate: parseFloat(editInterestRate) || 0,
        notes: editNotes
      });
      setSnackbar({ open: true, message: 'Préstamo actualizado exitosamente', severity: 'success' });
      setEditLoan(null);
      loadLoans();
    } catch (err) {
      console.error('Error updating loan:', err);
      setSnackbar({ open: true, message: 'Error al actualizar préstamo', severity: 'error' });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleEarlyPay = () => {
    if (!paymentLoan) return;
    setPaymentAmount(paymentLoan.remainingBalance.toString());
  };

  const handleCancelLoan = async () => {
    if (!deleteLoan) return;
    setDeleteSubmitting(true);
    try {
      await cancelLoan(deleteLoan.loanId);
      setSnackbar({ open: true, message: 'Préstamo cancelado exitosamente', severity: 'success' });
      setDeleteLoan(null);
      loadLoans();
    } catch (err) {
      console.error('Error cancelling loan:', err);
      setSnackbar({ open: true, message: 'Error al cancelar préstamo', severity: 'error' });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const getStatusChip = (status: string): React.ReactElement => {
    const config: Record<string, { label: string; color: 'success' | 'info' | 'error' | 'default' }> = {
      active: { label: 'Activo', color: 'success' },
      completed: { label: 'Completado', color: 'info' },
      cancelled: { label: 'Cancelado', color: 'error' }
    };
    const c = config[status] ?? { label: status, color: 'default' as const };
    return <Chip label={c.label} color={c.color} size="small" sx={{ fontSize: '11px', fontWeight: 500 }} />;
  };

  const getPaymentDayLabel = (loan: LoanAPI): string => {
    if (loan.frequency === 'daily') return 'Todos';
    if (loan.frequency === 'weekly' && loan.paymentDay != null) return DAY_LABELS[loan.paymentDay] ?? '-';
    if (loan.frequency === 'monthly' && loan.paymentDay != null) return `Día ${loan.paymentDay}`;
    return '-';
  };

  const headerCell = (key: SortKey, label: string) => (
    <TableCell
      onClick={() => handleSort(key)}
      sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: '12px' }}
    >
      {label} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
    </TableCell>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: '#2c2c2c', fontWeight: 600 }}>
              Lista de préstamos
            </Typography>
            <Button
              component={Link}
              to="/loans/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, textTransform: 'none' }}
            >
              Crear préstamo
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Checkbox checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />}
              label="Sólo activos"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Filtro rápido"
              value={quickFilter}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuickFilter(e.target.value)}
              sx={{ maxWidth: '300px' }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      {headerCell('loanNumber', '#')}
                      {headerCell('entityName', 'Banca')}
                      {headerCell('principalAmount', 'Total prestado')}
                      {headerCell('interestRate', 'Tasa %')}
                      {headerCell('totalPaid', 'Total pagado')}
                      {headerCell('remainingBalance', 'Pendiente')}
                      {headerCell('installmentAmount', 'Cuota')}
                      {headerCell('frequency', 'Frecuencia')}
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '12px' }}>Día</TableCell>
                      {headerCell('startDate', 'Inicio')}
                      {headerCell('status', 'Estado')}
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '12px' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndSorted.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} sx={{ textAlign: 'center', py: 3 }}>
                          No hay préstamos disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSorted.map((loan) => (
                        <TableRow key={loan.loanId} hover>
                          <TableCell sx={{ fontSize: '13px' }}>{loan.loanNumber}</TableCell>
                          <TableCell sx={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                            {loan.entityCode} - {loan.entityName}
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{formatCurrency(loan.principalAmount)}</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{loan.interestRate}%</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{formatCurrency(loan.totalPaid)}</TableCell>
                          <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: loan.remainingBalance > 0 ? '#dc3545' : '#28a745' }}>
                            {formatCurrency(loan.remainingBalance)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{formatCurrency(loan.installmentAmount)}</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{FREQUENCY_LABELS[loan.frequency] ?? loan.frequency}</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{getPaymentDayLabel(loan)}</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{formatDate(loan.startDate)}</TableCell>
                          <TableCell>{getStatusChip(loan.status)}</TableCell>
                          <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {loan.status === 'active' && (
                              <>
                                <IconButton size="small" color="primary" onClick={() => handleOpenPayment(loan)} title="Registrar pago">
                                  <PaymentIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ color: '#8b5cf6' }} onClick={() => handleOpenEdit(loan)} title="Editar préstamo">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => setDeleteLoan(loan)} title="Cancelar préstamo">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {filteredAndSorted.length > 0 && (
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        <TableCell />
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.principal)}</TableCell>
                        <TableCell />
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.totalPaid)}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.remaining)}</TableCell>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" sx={{ mt: 2, color: '#6c757d' }}>
                Mostrando {filteredAndSorted.length} préstamo{filteredAndSorted.length !== 1 ? 's' : ''}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={!!paymentLoan} onClose={() => setPaymentLoan(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#8b5cf6', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Registrar pago — {paymentLoan?.loanNumber}
          <IconButton edge="end" color="inherit" onClick={() => setPaymentLoan(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Banca: <strong>{paymentLoan?.entityCode} - {paymentLoan?.entityName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pendiente: <strong style={{ color: '#dc3545' }}>{formatCurrency(paymentLoan?.remainingBalance ?? 0)}</strong>
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="Monto del pago"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Notas (opcional)"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleEarlyPay}
            sx={{ textTransform: 'none' }}
          >
            Pagar todo ({formatCurrency(paymentLoan?.remainingBalance ?? 0)})
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setPaymentLoan(null)} sx={{ textTransform: 'none' }}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || paymentSubmitting}
              sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, textTransform: 'none' }}
            >
              {paymentSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Registrar pago'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!deleteLoan} onClose={() => setDeleteLoan(null)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <WarningAmberIcon sx={{ fontSize: 64, color: '#f0ad4e', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>
            ¿Cancelar préstamo {deleteLoan?.loanNumber}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pendiente: {formatCurrency(deleteLoan?.remainingBalance ?? 0)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelLoan}
              disabled={deleteSubmitting}
              sx={{ minWidth: 100 }}
            >
              {deleteSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Cancelar préstamo'}
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => setDeleteLoan(null)} sx={{ minWidth: 100 }}>
              Volver
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editLoan} onClose={() => setEditLoan(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#8b5cf6', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Editar préstamo — {editLoan?.loanNumber}
          <IconButton edge="end" color="inherit" onClick={() => setEditLoan(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Banca: <strong>{editLoan?.entityCode} - {editLoan?.entityName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monto prestado: <strong>{formatCurrency(editLoan?.principalAmount ?? 0)}</strong> | Pendiente: <strong style={{ color: '#dc3545' }}>{formatCurrency(editLoan?.remainingBalance ?? 0)}</strong>
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="Monto cuota"
            type="number"
            value={editInstallment}
            onChange={(e) => setEditInstallment(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Frecuencia</Typography>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <RadioGroup
              row
              value={editFrequency}
              onChange={(e) => setEditFrequency(e.target.value)}
            >
              {[
                { value: 'daily', label: 'Diario' },
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensual' },
                { value: 'annual', label: 'Anual' }
              ].map(f => (
                <FormControlLabel key={f.value} value={f.value} control={<Radio size="small" />} label={f.label} sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }} />
              ))}
            </RadioGroup>
          </FormControl>
          {editFrequency === 'weekly' && (
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <Select
                value={editPaymentDay}
                onChange={(e: SelectChangeEvent<number>) => setEditPaymentDay(e.target.value as number)}
              >
                {DAY_LABELS.map((label, idx) => (
                  <MenuItem key={idx} value={idx}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            fullWidth
            label="Tasa de interés (%)"
            type="number"
            value={editInterestRate}
            onChange={(e) => setEditInterestRate(e.target.value)}
            inputProps={{ min: 0, max: 100, step: 0.1 }}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Notas"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditLoan(null)} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleEdit}
            disabled={editSubmitting}
            sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, textTransform: 'none' }}
          >
            {editSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoansList;
