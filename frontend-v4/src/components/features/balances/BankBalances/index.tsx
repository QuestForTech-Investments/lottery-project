import React, { useState, useCallback, useMemo, useEffect, type ChangeEvent } from 'react';
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
import { getAccountableEntities, type AccountableEntityAPI } from '../../../../services/accountableEntityService';

interface BankData {
  id: number;
  nombre: string;
  codigo: string;
  zona: string;
  balance: number;
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
  { key: 'codigo', label: 'Código', sortable: true },
  { key: 'zona', label: 'Zona', sortable: true },
  { key: 'balance', label: 'Balance', sortable: true, format: 'currency', align: 'right' },
];

const BankBalances = (): React.ReactElement => {
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(0);
  const [data, setData] = useState<BankData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanks = async () => {
      setLoading(true);
      try {
        const entities: AccountableEntityAPI[] = await getAccountableEntities({
          entityType: 'Banco',
          isActive: true
        });
        setData(entities.map(e => ({
          id: e.entityId,
          nombre: e.entityName,
          codigo: e.entityCode,
          zona: e.zoneName || '',
          balance: e.currentBalance
        })));
      } catch (err) {
        console.error('Error loading bank balances:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBanks();
  }, []);

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
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
  }, [data, quickFilter]);

  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totals = useMemo(() => ({
    balance: filteredData.reduce((sum, item) => sum + item.balance, 0),
  }), [filteredData]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          Balances de bancos
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
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
          </>
        )}
      </Paper>
    </Box>
  );
};

export default React.memo(BankBalances);
