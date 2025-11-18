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
import DateFilter from '../common/DateFilter';

// Mock data for development - Based on original app screenshot
const MOCK_DATA = [
  { id: 1, nombre: '#Consorcio GS', balance: -7955.85 },
  { id: 2, nombre: '#Consorcio JC', balance: 3420.50 },
  { id: 3, nombre: '#Consorcio MP', balance: 5680.75 },
  { id: 4, nombre: '#Consorcio RD', balance: 4230.90 },
  { id: 5, nombre: '#Consorcio TA', balance: 3075.61 },
];

const COLUMNS = [
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'balance', label: 'Balance', sortable: true, format: 'currency', align: 'right' },
];

const GroupBalances = () => {
  // State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickFilter, setQuickFilter] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);
  const [data] = useState(MOCK_DATA);

  // Handlers
  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
    setPage(0); // Reset to first page on date change
  }, []);

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
          Balances de grupos
        </Typography>

        {/* Date Filter */}
        <Box sx={{ mb: 3 }}>
          <DateFilter
            value={selectedDate}
            onChange={handleDateChange}
          />
        </Box>

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

export default React.memo(GroupBalances);
