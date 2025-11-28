import React, { useState, useCallback, useMemo, type ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TablePagination,
  type SelectChangeEvent
} from '@mui/material';

import BalanceTable from '../common/BalanceTable';
import QuickFilter from '../common/QuickFilter';

interface ZoneData {
  id: number;
  nombre: string;
  balance: number;
}

interface ColumnDefinition {
  key: string;
  label: string;
  sortable?: boolean;
  format?: string;
  align?: 'left' | 'center' | 'right';
}

// Mock data for development
const MOCK_DATA: ZoneData[] = [
  { id: 1, nombre: 'ZONA NORTE', balance: 45320.75 },
  { id: 2, nombre: 'ZONA SUR', balance: 28450.30 },
  { id: 3, nombre: 'ZONA ESTE', balance: -3240.50 },
  { id: 4, nombre: 'ZONA OESTE', balance: 52180.90 },
  { id: 5, nombre: 'ZONA CENTRAL', balance: 15670.25 },
];

const COLUMNS: ColumnDefinition[] = [
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'balance', label: 'Balance', sortable: true, format: 'currency', align: 'right' },
];

const ZoneBalances = (): React.ReactElement => {
  // State
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(0);
  const [data] = useState<ZoneData[]>(MOCK_DATA);

  // Handlers
  const handleQuickFilterChange = useCallback((value: string) => {
    setQuickFilter(value);
    setPage(0); // Reset to first page on filter
  }, []);

  const handlePageSizeChange = useCallback((event: SelectChangeEvent<number>) => {
    setPageSize(parseInt(event.target.value as string, 10));
    setPage(0);
  }, []);

  const handlePageChange = useCallback((_event: unknown, newPage: number) => {
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
          Balances de zonas
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
          data={paginatedData as unknown as Array<Record<string, unknown> & { id?: number | string }>}
          totals={totals}
        />

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e: ChangeEvent<HTMLInputElement>) => handlePageSizeChange({ target: { value: e.target.value } } as SelectChangeEvent<number>)}
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

export default React.memo(ZoneBalances);
