import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton
} from '@mui/material';
import { Settings, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import DateFilter from '../../balances/common/DateFilter';
import QuickFilter from '../../balances/common/QuickFilter';
import CreateTransactionModal from '../CreateTransactionModal';

// Mock data for development
const MOCK_TRANSACTIONS = [
  {
    id: 1,
    numero: 'CP-001',
    fecha: '18/11/2025',
    hora: '09:30:00',
    creadoPor: 'admin',
    notas: 'Cobro banca LA CENTRAL 01'
  },
  {
    id: 2,
    numero: 'CP-002',
    fecha: '18/11/2025',
    hora: '10:15:00',
    creadoPor: 'admin',
    notas: 'Pago a LA CENTRAL 10'
  },
  {
    id: 3,
    numero: 'CP-003',
    fecha: '18/11/2025',
    hora: '11:00:00',
    creadoPor: 'supervisor',
    notas: 'Cobro banca LA CENTRAL 16'
  },
  {
    id: 4,
    numero: 'CP-004',
    fecha: '18/11/2025',
    hora: '12:30:00',
    creadoPor: 'admin',
    notas: 'Pago mensual CARIBBEAN 186'
  },
  {
    id: 5,
    numero: 'CP-005',
    fecha: '18/11/2025',
    hora: '14:00:00',
    creadoPor: 'supervisor',
    notas: 'Cobro semanal grupo Guyana'
  },
  {
    id: 6,
    numero: 'CP-006',
    fecha: '17/11/2025',
    hora: '16:45:00',
    creadoPor: 'admin',
    notas: 'Pago comisiones LA CENTRAL 63'
  },
  {
    id: 7,
    numero: 'CP-007',
    fecha: '17/11/2025',
    hora: '17:30:00',
    creadoPor: 'supervisor',
    notas: 'Cobro balance negativo LA CENTRAL 101'
  },
  {
    id: 8,
    numero: 'CP-008',
    fecha: '17/11/2025',
    hora: '18:00:00',
    creadoPor: 'admin',
    notas: 'Pago premios CARIBBEAN 198'
  }
];

/**
 * CollectionsPaymentsList
 * EXACT replica of Vue.js app: https://la-numbers.apk.lol/#/simplified-accountable-transaction-groups
 * Material-UI version with consistent styling
 */
const CollectionsPaymentsList = () => {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [quickFilter, setQuickFilter] = useState('');
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleFilter = useCallback(() => {
    console.log('Filtering...', { startDate, endDate });
    // TODO: Call API endpoint when confirmed
  }, [startDate, endDate]);

  const handleSort = useCallback((column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const handleCreate = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    let result = [...transactions];

    // Quick filter
    if (quickFilter) {
      const search = quickFilter.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(search)
        )
      );
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [transactions, quickFilter, sortColumn, sortDirection]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            fontWeight: 400,
            mb: 3
          }}
        >
          Cobros y pagos
        </Typography>

        {/* Filters Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
            {/* Start Date Filter */}
            <DateFilter
              value={startDate}
              onChange={setStartDate}
              label="Fecha inicial"
            />

            {/* End Date Filter */}
            <DateFilter
              value={endDate}
              onChange={setEndDate}
              label="Fecha final"
            />
          </Box>
        </Box>

        {/* Action Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleFilter}
            sx={{
              backgroundColor: '#51cbce',
              '&:hover': { backgroundColor: '#3fb5b8' },
              textTransform: 'uppercase',
              fontWeight: 600
            }}
          >
            Filtrar
          </Button>
        </Box>

        {/* Quick Filter */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <QuickFilter
            value={quickFilter}
            onChange={setQuickFilter}
            placeholder="Filtrado rápido"
          />
        </Box>

        {/* Data Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell
                  onClick={() => handleSort('numero')}
                  sx={{
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    py: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Número
                    {sortColumn === 'numero' && (
                      sortDirection === 'asc' ?
                        <ArrowUpward sx={{ fontSize: '16px' }} /> :
                        <ArrowDownward sx={{ fontSize: '16px' }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>Fecha</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>Hora</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>Creado por</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>Notas</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5, textAlign: 'center' }}>
                  <Settings sx={{ fontSize: '18px' }} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 4 }}>
                    <Alert
                      severity="info"
                      sx={{
                        bgcolor: '#d1ecf1',
                        color: '#0c5460',
                        border: '1px solid #bee5eb',
                        '& .MuiAlert-icon': {
                          color: '#0c5460'
                        }
                      }}
                    >
                      No hay entradas disponibles
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell sx={{ fontSize: '13px' }}>{transaction.numero}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{transaction.fecha}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{transaction.hora}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{transaction.creadoPor}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{transaction.notas}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton size="small">
                        <Settings sx={{ fontSize: '16px' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
            Mostrando {filteredData.length} de {transactions.length} entradas
          </Typography>
        </Box>

        {/* Create Button - Centered */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{
              backgroundColor: '#51cbce',
              '&:hover': { backgroundColor: '#3fb5b8' },
              textTransform: 'uppercase',
              fontWeight: 600,
              px: 5,
              py: 1.25,
              minWidth: '120px'
            }}
          >
            Crear
          </Button>
        </Box>
      </Paper>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </Box>
  );
};

export default CollectionsPaymentsList;
