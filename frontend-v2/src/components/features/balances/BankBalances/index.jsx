import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TablePagination
} from '@mui/material';

import BalanceTable from '../common/BalanceTable';
import QuickFilter from '../common/QuickFilter';

// Mock data for development
const MOCK_DATA = [
  { id: 1, nombre: 'BANCO POPULAR', codigo: 'BP001', zona: 'ZONA NORTE', balance: 15250.50 },
  { id: 2, nombre: 'BANCO BHD LEON', codigo: 'BHD002', zona: 'ZONA NORTE', balance: 8730.25 },
  { id: 3, nombre: 'BANCO RESERVAS', codigo: 'BR003', zona: 'ZONA SUR', balance: -2450.00 },
  { id: 4, nombre: 'BANCO SANTA CRUZ', codigo: 'BSC004', zona: 'ZONA SUR', balance: 12100.75 },
  { id: 5, nombre: 'BANCO CARIBE', codigo: 'BC005', zona: 'ZONA ESTE', balance: 5680.30 },
  { id: 6, nombre: 'BANCO PROMERICA', codigo: 'BPR006', zona: 'ZONA ESTE', balance: -890.45 },
  { id: 7, nombre: 'BANCO LOPEZ DE HARO', codigo: 'BLH007', zona: 'ZONA OESTE', balance: 22340.80 },
  { id: 8, nombre: 'BANCO VIMENCA', codigo: 'BV008', zona: 'ZONA OESTE', balance: 0.00 },
];

const COLUMNS = [
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'codigo', label: 'Código', sortable: true },
  { key: 'zona', label: 'Zona', sortable: true },
  { key: 'balance', label: 'Balance', sortable: true, format: 'currency', align: 'right' },
];

const BankBalances = () => {
  // State
  const [quickFilter, setQuickFilter] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);
  const [data] = useState(MOCK_DATA);

  // Handlers
  const handleQuickFilterChange = useCallback((value) => {
    setQuickFilter(value);
    setPage(0); // Reset to first page on filter
  }, []);

  const handlePageSizeChange = useCallback((event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    let result = data;

    // Quick filter
    if (quickFilter) {
      const search = quickFilter.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(search)
        )
      );
    }

    return result;
  }, [data, quickFilter]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      balance: filteredData.reduce((sum, item) => sum + item.balance, 0),
    };
  }, [filteredData]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          Balances de bancos
        </Typography>

        {/* Filters Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          {/* Entries per page */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Entradas por página
            </Typography>
            <FormControl size="small">
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                sx={{ minWidth: 80 }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={1000}>Todos</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Quick Filter */}
          <Box sx={{ minWidth: 250 }}>
            <QuickFilter
              value={quickFilter}
              onChange={handleQuickFilterChange}
              placeholder="Filtrado rápido"
            />
          </Box>
        </Box>

        {/* Data Table */}
        <BalanceTable
          columns={COLUMNS}
          data={paginatedData}
          totals={totals}
        />

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          labelRowsPerPage=""
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, to, count }) =>
            `Mostrando ${from}-${to} de ${count} entradas`
          }
        />
      </Paper>
    </Box>
  );
};

export default React.memo(BankBalances);
