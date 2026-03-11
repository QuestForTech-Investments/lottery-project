import React, { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TablePagination,
  CircularProgress,
  type SelectChangeEvent
} from '@mui/material';

import BalanceTable from '../common/BalanceTable';
import QuickFilter from '../common/QuickFilter';
import { getBettingPoolBalances } from '@/services/balanceService';

interface ZoneBalance {
  id: number;
  nombre: string;
  balance: number;
  loans: number;
}

interface ColumnDefinition {
  key: string;
  label: string;
  sortable?: boolean;
  format?: string;
  align?: 'left' | 'center' | 'right';
}

const COLUMNS: ColumnDefinition[] = [
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'balance', label: 'Balance', sortable: true, format: 'currency', align: 'right' },
  { key: 'loans', label: 'Préstamos', sortable: true, format: 'currency', align: 'right' },
];

const ZoneBalances = (): React.ReactElement => {
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(0);
  const [data, setData] = useState<ZoneBalance[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const balances = await getBettingPoolBalances();

      // Aggregate by zone
      const zoneMap = new Map<number, { name: string; balance: number; loans: number }>();
      balances.forEach(bp => {
        if (!bp.zoneId) return;
        const existing = zoneMap.get(bp.zoneId);
        if (existing) {
          existing.balance += bp.balance;
          existing.loans += bp.prestamos;
        } else {
          zoneMap.set(bp.zoneId, { name: bp.zona || 'Sin zona', balance: bp.balance, loans: bp.prestamos });
        }
      });

      const zones: ZoneBalance[] = Array.from(zoneMap.entries()).map(([id, z]) => ({
        id,
        nombre: z.name,
        balance: z.balance,
        loans: z.loans,
      }));

      zones.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setData(zones);
    } catch (err) {
      console.error('Error loading zone balances:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleQuickFilterChange = useCallback((value: string) => {
    setQuickFilter(value);
    setPage(0);
  }, []);

  const handlePageSizeChange = useCallback((event: SelectChangeEvent<number>) => {
    setPageSize(parseInt(event.target.value as string, 10));
    setPage(0);
  }, []);

  const handlePageChange = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const filteredData = useMemo(() => {
    if (!quickFilter) return data;
    const search = quickFilter.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(search))
    );
  }, [data, quickFilter]);

  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totals = useMemo(() => ({
    balance: filteredData.reduce((sum, item) => sum + item.balance, 0),
    loans: filteredData.reduce((sum, item) => sum + item.loans, 0),
  }), [filteredData]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          Balances de zonas
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
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

          <Box sx={{ minWidth: 250 }}>
            <QuickFilter
              value={quickFilter}
              onChange={handleQuickFilterChange}
              placeholder="Filtrado rápido"
            />
          </Box>
        </Box>

        <BalanceTable
          columns={COLUMNS}
          data={paginatedData as unknown as Array<Record<string, unknown> & { id?: number | string }>}
          totals={totals}
        />

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
