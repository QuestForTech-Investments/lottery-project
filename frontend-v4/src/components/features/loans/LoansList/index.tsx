import React, { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
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
  Button,
  IconButton,
  Chip,
  InputAdornment,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface Loan {
  id: number;
  loanNumber: string;
  totalLoaned: number;
  interestRate: number;
  totalPaid: number;
  totalToPay: number;
  createdAt: string;
  lastPayment: string;
  installment: number;
  pendingInstallments: number;
  frequency: string;
  paymentDay: string;
  status: string;
  hasPending: boolean;
}

interface Filters {
  onlyActive: boolean;
  filterByZones: boolean;
  bettingPoolNumber: string;
  quickFilter: string;
}

type SortDirection = 'asc' | 'desc';
type SortKey = keyof Loan | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface PaymentData {
  bank: string;
  amount: string;
}

const LoansList = (): React.ReactElement => {
  const [filters, setFilters] = useState<Filters>({
    onlyActive: true,
    filterByZones: false,
    bettingPoolNumber: '',
    quickFilter: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [activeTab, setActiveTab] = useState<number>(0);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    bank: '',
    amount: ''
  });

  // Mockup data - 20 loans
  const loansData: Loan[] = [
    { id: 1, loanNumber: 'LP-001', totalLoaned: 5000.00, interestRate: 5.0, totalPaid: 2500.00, totalToPay: 2750.00, createdAt: '15/01/2025', lastPayment: '15/11/2025', installment: 500.00, pendingInstallments: 5, frequency: 'Semanal', paymentDay: 'Viernes', status: 'Activo', hasPending: false },
    { id: 2, loanNumber: 'LP-002', totalLoaned: 10000.00, interestRate: 6.0, totalPaid: 10600.00, totalToPay: 0.00, createdAt: '20/01/2025', lastPayment: '10/11/2025', installment: 1000.00, pendingInstallments: 0, frequency: 'Mensual', paymentDay: '15', status: 'Completo', hasPending: false },
    { id: 3, loanNumber: 'LP-003', totalLoaned: 3000.00, interestRate: 4.5, totalPaid: 0.00, totalToPay: 3135.00, createdAt: '01/02/2025', lastPayment: '-', installment: 300.00, pendingInstallments: 10, frequency: 'Semanal', paymentDay: 'Lunes', status: 'Activo', hasPending: true },
    { id: 4, loanNumber: 'LP-004', totalLoaned: 15000.00, interestRate: 7.0, totalPaid: 8000.00, totalToPay: 8050.00, createdAt: '10/02/2025', lastPayment: '12/11/2025', installment: 1500.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '10', status: 'Activo', hasPending: false },
    { id: 5, loanNumber: 'LP-005', totalLoaned: 2000.00, interestRate: 3.0, totalPaid: 2060.00, totalToPay: 0.00, createdAt: '15/02/2025', lastPayment: '01/11/2025', installment: 200.00, pendingInstallments: 0, frequency: 'Diario', paymentDay: 'Todos', status: 'Completo', hasPending: false },
    { id: 6, loanNumber: 'LP-006', totalLoaned: 8000.00, interestRate: 5.5, totalPaid: 4000.00, totalToPay: 4440.00, createdAt: '01/03/2025', lastPayment: '10/11/2025', installment: 800.00, pendingInstallments: 5, frequency: 'Semanal', paymentDay: 'Miércoles', status: 'Activo', hasPending: true },
    { id: 7, loanNumber: 'LP-007', totalLoaned: 12000.00, interestRate: 6.5, totalPaid: 0.00, totalToPay: 12780.00, createdAt: '10/03/2025', lastPayment: '-', installment: 1200.00, pendingInstallments: 10, frequency: 'Mensual', paymentDay: '20', status: 'Activo', hasPending: false },
    { id: 8, loanNumber: 'LP-008', totalLoaned: 4000.00, interestRate: 4.0, totalPaid: 4160.00, totalToPay: 0.00, createdAt: '20/03/2025', lastPayment: '05/11/2025', installment: 400.00, pendingInstallments: 0, frequency: 'Semanal', paymentDay: 'Jueves', status: 'Completo', hasPending: false },
    { id: 9, loanNumber: 'LP-009', totalLoaned: 7000.00, interestRate: 5.0, totalPaid: 3500.00, totalToPay: 3850.00, createdAt: '01/04/2025', lastPayment: '08/11/2025', installment: 700.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '5', status: 'Activo', hasPending: false },
    { id: 10, loanNumber: 'LP-010', totalLoaned: 1500.00, interestRate: 3.5, totalPaid: 1552.50, totalToPay: 0.00, createdAt: '10/04/2025', lastPayment: '30/10/2025', installment: 150.00, pendingInstallments: 0, frequency: 'Diario', paymentDay: 'Todos', status: 'Completo', hasPending: false },
    { id: 11, loanNumber: 'LP-011', totalLoaned: 20000.00, interestRate: 8.0, totalPaid: 10000.00, totalToPay: 11600.00, createdAt: '15/04/2025', lastPayment: '14/11/2025', installment: 2000.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '15', status: 'Activo', hasPending: true },
    { id: 12, loanNumber: 'LP-012', totalLoaned: 6000.00, interestRate: 4.5, totalPaid: 6270.00, totalToPay: 0.00, createdAt: '01/05/2025', lastPayment: '02/11/2025', installment: 600.00, pendingInstallments: 0, frequency: 'Semanal', paymentDay: 'Martes', status: 'Completo', hasPending: false },
    { id: 13, loanNumber: 'LP-013', totalLoaned: 9000.00, interestRate: 5.5, totalPaid: 4500.00, totalToPay: 4995.00, createdAt: '10/05/2025', lastPayment: '11/11/2025', installment: 900.00, pendingInstallments: 5, frequency: 'Semanal', paymentDay: 'Viernes', status: 'Activo', hasPending: false },
    { id: 14, loanNumber: 'LP-014', totalLoaned: 3500.00, interestRate: 4.0, totalPaid: 0.00, totalToPay: 3640.00, createdAt: '20/05/2025', lastPayment: '-', installment: 350.00, pendingInstallments: 10, frequency: 'Semanal', paymentDay: 'Lunes', status: 'Inactivo', hasPending: false },
    { id: 15, loanNumber: 'LP-015', totalLoaned: 25000.00, interestRate: 7.5, totalPaid: 12500.00, totalToPay: 14375.00, createdAt: '01/06/2025', lastPayment: '13/11/2025', installment: 2500.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '1', status: 'Activo', hasPending: true },
    { id: 16, loanNumber: 'LP-016', totalLoaned: 4500.00, interestRate: 4.5, totalPaid: 4702.50, totalToPay: 0.00, createdAt: '10/06/2025', lastPayment: '04/11/2025', installment: 450.00, pendingInstallments: 0, frequency: 'Semanal', paymentDay: 'Miércoles', status: 'Completo', hasPending: false },
    { id: 17, loanNumber: 'LP-017', totalLoaned: 11000.00, interestRate: 6.0, totalPaid: 5500.00, totalToPay: 6160.00, createdAt: '20/06/2025', lastPayment: '09/11/2025', installment: 1100.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '20', status: 'Activo', hasPending: false },
    { id: 18, loanNumber: 'LP-018', totalLoaned: 5500.00, interestRate: 5.0, totalPaid: 0.00, totalToPay: 5775.00, createdAt: '01/07/2025', lastPayment: '-', installment: 550.00, pendingInstallments: 10, frequency: 'Semanal', paymentDay: 'Jueves', status: 'Inactivo', hasPending: false },
    { id: 19, loanNumber: 'LP-019', totalLoaned: 18000.00, interestRate: 7.0, totalPaid: 19260.00, totalToPay: 0.00, createdAt: '10/07/2025', lastPayment: '06/11/2025', installment: 1800.00, pendingInstallments: 0, frequency: 'Mensual', paymentDay: '10', status: 'Completo', hasPending: false },
    { id: 20, loanNumber: 'LP-020', totalLoaned: 7500.00, interestRate: 5.5, totalPaid: 3750.00, totalToPay: 4162.50, createdAt: '20/07/2025', lastPayment: '12/11/2025', installment: 750.00, pendingInstallments: 5, frequency: 'Semanal', paymentDay: 'Viernes', status: 'Activo', hasPending: true }
  ];

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked, type } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleSort = useCallback((key: keyof Loan): void => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Handler functions
  const handleOpenPaymentModal = useCallback((loan: Loan): void => {
    setSelectedLoan(loan);
    setPaymentData({ bank: '', amount: loan.installment.toString() });
    setShowPaymentModal(true);
  }, []);

  const handleClosePaymentModal = useCallback((): void => {
    setShowPaymentModal(false);
    setSelectedLoan(null);
    setPaymentData({ bank: '', amount: '' });
  }, []);

  const handlePayment = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    alert(`Pago registrado: $${paymentData.amount} para préstamo ${selectedLoan?.loanNumber}`);
    handleClosePaymentModal();
  }, [selectedLoan, paymentData, handleClosePaymentModal]);

  const handleOpenDeleteModal = useCallback((loan: Loan): void => {
    setSelectedLoan(loan);
    setShowDeleteModal(true);
  }, []);

  const handleCloseDeleteModal = useCallback((): void => {
    setShowDeleteModal(false);
    setSelectedLoan(null);
  }, []);

  const handleConfirmDelete = useCallback((): void => {
    alert(`Préstamo ${selectedLoan?.loanNumber} eliminado exitosamente`);
    handleCloseDeleteModal();
  }, [selectedLoan, handleCloseDeleteModal]);

  // Apply filters
  let filteredData = loansData;

  if (filters.onlyActive) {
    filteredData = filteredData.filter(loan => loan.status !== 'Inactivo');
  }

  if (filters.quickFilter) {
    const searchLower = filters.quickFilter.toLowerCase();
    filteredData = filteredData.filter(loan =>
      loan.loanNumber.toLowerCase().includes(searchLower) ||
      loan.status.toLowerCase().includes(searchLower) ||
      loan.frequency.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  if (sortConfig.key) {
    const key = sortConfig.key;
    filteredData = [...filteredData].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Calculate totals
  const totals = filteredData.reduce((acc, loan) => ({
    totalLoaned: acc.totalLoaned + loan.totalLoaned,
    totalPaid: acc.totalPaid + loan.totalPaid,
    totalToPay: acc.totalToPay + loan.totalToPay
  }), { totalLoaned: 0, totalPaid: 0, totalToPay: 0 });

  const getStatusChip = (status: string): React.ReactElement => {
    const colors: Record<string, 'success' | 'info' | 'error' | 'default'> = {
      'Activo': 'success',
      'Completo': 'info',
      'Inactivo': 'error'
    };
    return (
      <Chip
        label={status}
        color={colors[status] || 'default'}
        size="small"
        sx={{ fontSize: '11px', fontWeight: 500 }}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          {/* Title */}
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, color: '#2c2c2c' }}>
            Lista de préstamos
          </Typography>

          {/* Toggle Filters */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="onlyActive"
                  checked={filters.onlyActive}
                  onChange={handleFilterChange}
                />
              }
              label="Sólo préstamos activos"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="filterByZones"
                  checked={filters.filterByZones}
                  onChange={handleFilterChange}
                />
              }
              label="Filtrar por zonas"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
            />
          </Box>

          {/* Tab */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': { fontSize: '14px' },
                '& .Mui-selected': { color: '#51cbce' },
                '& .MuiTabs-indicator': { backgroundColor: '#51cbce' }
              }}
            >
              <Tab label="Bancas" />
            </Tabs>
          </Box>

          {/* Search Filters */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Numero de banca"
              name="bettingPoolNumber"
              value={filters.bettingPoolNumber}
              onChange={handleFilterChange}
              sx={{ maxWidth: '300px' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              size="small"
              placeholder="Filtrado rápido"
              name="quickFilter"
              value={filters.quickFilter}
              onChange={handleFilterChange}
              sx={{ maxWidth: '300px' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell onClick={() => handleSort('loanNumber')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>#</TableCell>
                  <TableCell onClick={() => handleSort('totalLoaned')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Total prestado</TableCell>
                  <TableCell onClick={() => handleSort('interestRate')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Tasa de interés</TableCell>
                  <TableCell onClick={() => handleSort('totalPaid')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Total pagado</TableCell>
                  <TableCell onClick={() => handleSort('totalToPay')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Total a pagar</TableCell>
                  <TableCell onClick={() => handleSort('createdAt')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Fecha de creación</TableCell>
                  <TableCell onClick={() => handleSort('lastPayment')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Último pago</TableCell>
                  <TableCell onClick={() => handleSort('installment')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Cuota</TableCell>
                  <TableCell onClick={() => handleSort('pendingInstallments')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Cuotas pend.</TableCell>
                  <TableCell onClick={() => handleSort('frequency')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Frecuencia</TableCell>
                  <TableCell onClick={() => handleSort('paymentDay')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Día de pago</TableCell>
                  <TableCell onClick={() => handleSort('status')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Pendientes</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', minWidth: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} sx={{ textAlign: 'center', py: 3 }}>
                      No hay entradas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((loan) => (
                    <TableRow key={loan.id} hover>
                      <TableCell>{loan.loanNumber}</TableCell>
                      <TableCell>${loan.totalLoaned.toFixed(2)}</TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell>${loan.totalPaid.toFixed(2)}</TableCell>
                      <TableCell>${loan.totalToPay.toFixed(2)}</TableCell>
                      <TableCell>{loan.createdAt}</TableCell>
                      <TableCell>{loan.lastPayment}</TableCell>
                      <TableCell>${loan.installment.toFixed(2)}</TableCell>
                      <TableCell>{loan.pendingInstallments}</TableCell>
                      <TableCell>{loan.frequency}</TableCell>
                      <TableCell>{loan.paymentDay}</TableCell>
                      <TableCell>{getStatusChip(loan.status)}</TableCell>
                      <TableCell>{loan.hasPending ? 'Sí' : 'No'}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton size="small" color="info" onClick={() => handleOpenPaymentModal(loan)} title="Pagar préstamo">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/loans/edit/${loan.id}`}
                          sx={{ color: '#51cbce', textDecoration: 'none' }}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleOpenDeleteModal(loan)} title="Eliminar">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {filteredData.length > 0 && (
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>${totals.totalLoaned.toFixed(2)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>${totals.totalPaid.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>${totals.totalToPay.toFixed(2)}</TableCell>
                  <TableCell colSpan={9}></TableCell>
                </TableRow>
              )}
            </Table>
          </TableContainer>

          {/* Footer */}
          <Typography variant="body2" sx={{ mt: 2, color: '#6c757d' }}>
            Mostrando {filteredData.length} de {loansData.length} entradas
          </Typography>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentModal} onClose={handleClosePaymentModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#51cbce', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Pagar préstamo
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClosePaymentModal}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handlePayment}>
          <DialogContent sx={{ pt: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="bank-select-label">Banco</InputLabel>
              <Select
                labelId="bank-select-label"
                value={paymentData.bank}
                label="Banco"
                onChange={(e) => setPaymentData({ ...paymentData, bank: e.target.value })}
                required
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="Banco Popular">Banco Popular</MenuItem>
                <MenuItem value="BanReservas">BanReservas</MenuItem>
                <MenuItem value="Banco BHD">Banco BHD</MenuItem>
                <MenuItem value="Banco Promerica">Banco Promerica</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Monto cuota"
              type="number"
              placeholder="Monto"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              inputProps={{ step: '0.01', min: '0' }}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                color: 'white',
                textTransform: 'none'
              }}
            >
              PAGAR
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteModal}
        onClose={handleCloseDeleteModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <WarningAmberIcon sx={{ fontSize: 64, color: '#f0ad4e', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 3, color: '#333' }}>
            ¿Está seguro que desea eliminar este préstamo?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmDelete}
              sx={{ minWidth: 100 }}
            >
              Eliminar
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCloseDeleteModal}
              sx={{ minWidth: 100 }}
            >
              Cancelar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoansList;
