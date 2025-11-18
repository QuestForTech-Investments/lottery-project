import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../../../../services/api';

/**
 * CollectionsPaymentsList
 * Material-UI version of Collections/Payments list
 * Based on Vue.js app analysis
 */
const CollectionsPaymentsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all', // 'all', 'collection', 'payment'
    bettingPoolCode: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Verify exact endpoint from original app
      // For now, using mock data until API endpoint is confirmed

      // Mock data for demonstration
      const mockData = [
        {
          id: 1,
          type: 'collection',
          bettingPoolCode: 'LAN-0001',
          bettingPoolName: 'Banca Central',
          bankName: 'Banco Popular',
          amount: 5000.00,
          createdAt: '2025-11-18T10:30:00',
          createdBy: 'admin'
        },
        {
          id: 2,
          type: 'payment',
          bettingPoolCode: 'LAN-0010',
          bettingPoolName: 'Banca Norte',
          bankName: 'Banco BHD',
          amount: 3000.00,
          createdAt: '2025-11-18T11:15:00',
          createdBy: 'admin'
        },
        {
          id: 3,
          type: 'collection',
          bettingPoolCode: 'LAN-0016',
          bettingPoolName: 'Banca Sur',
          bankName: 'Banco Popular',
          amount: 7500.00,
          createdAt: '2025-11-18T12:00:00',
          createdBy: 'admin'
        }
      ];

      setTransactions(mockData);
    } catch (err) {
      console.error('Error loading collections/payments:', err);
      setError('Error al cargar los cobros y pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredTransactions = transactions.filter(t => {
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.bettingPoolCode && !t.bettingPoolCode.includes(filters.bettingPoolCode)) return false;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((sum, t) => {
      return sum + (t.type === 'collection' ? t.amount : -t.amount);
    }, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Cobros & Pagos - Lista
          </Typography>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha inicio"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha fin"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="collection">Cobros</MenuItem>
                  <MenuItem value="payment">Pagos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Código de banca"
                placeholder="Filtrar por código..."
                value={filters.bettingPoolCode}
                onChange={(e) => handleFilterChange('bettingPoolCode', e.target.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadTransactions}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': {
                  bgcolor: '#45b0b3'
                }
              }}
            >
              Refrescar
            </Button>
          </Box>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading state */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Table */}
          {!loading && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código Banca</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre Banca</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Banco</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Monto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Creado por</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron transacciones
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>
                          <Chip
                            label={transaction.type === 'collection' ? 'COBRO' : 'PAGO'}
                            size="small"
                            sx={{
                              bgcolor: transaction.type === 'collection' ? 'success.main' : 'error.main',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>{transaction.bettingPoolCode}</TableCell>
                        <TableCell>{transaction.bettingPoolName}</TableCell>
                        <TableCell>{transaction.bankName || '-'}</TableCell>
                        <TableCell
                          sx={{
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: transaction.type === 'collection' ? 'success.main' : 'error.main'
                          }}
                        >
                          {transaction.type === 'collection' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>{transaction.createdBy}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {filteredTransactions.length > 0 && (
                  <TableFooter>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell colSpan={5} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                        TOTAL:
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'right',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          color: getTotalAmount() >= 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {formatCurrency(getTotalAmount())}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'right', fontSize: '0.875rem', color: 'text.secondary' }}>
                        {filteredTransactions.length} transaccion(es)
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CollectionsPaymentsList;
