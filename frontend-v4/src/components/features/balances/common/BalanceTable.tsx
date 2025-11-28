import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Typography
} from '@mui/material';
import { formatCurrency } from '@utils/formatCurrency';

type SortOrder = 'asc' | 'desc';

interface ColumnDefinition {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  format?: 'currency' | string;
}

// Generic row data - allows any object with an optional id
type RowData = Record<string, unknown> & { id?: number | string };

interface Totals {
  [key: string]: number;
}

interface BalanceTableProps {
  columns?: ColumnDefinition[];
  data?: RowData[];
  totals?: Totals;
  loading?: boolean;
}

/**
 * BalanceTable Component - Sortable table with totals for balance data
 */
const BalanceTable = React.memo(({
  columns = [],
  data = [],
  totals = {},
  loading = false
}: BalanceTableProps): React.ReactElement => {
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<SortOrder>('asc');

  const handleSort = useCallback((columnKey: string) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  }, [orderBy, order]);

  const sortedData = useMemo(() => {
    if (!orderBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[orderBy] as string | number | undefined;
      const bValue = b[orderBy] as string | number | undefined;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();

      if (order === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [data, orderBy, order]);

  const formatValue = useCallback((value: unknown, format?: string): string => {
    if (format === 'currency') {
      return formatCurrency(value as number);
    }
    return value !== undefined && value !== null ? String(value) : '-';
  }, []);

  const getCellStyle = useCallback((value: unknown, format?: string): React.CSSProperties => {
    if (format === 'currency' && typeof value === 'number') {
      if (value < 0) {
        return {
          backgroundColor: '#ffebee',
          color: '#c62828',
          fontWeight: 600
        };
      }
      if (value > 0) {
        return {
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          fontWeight: 600
        };
      }
    }
    return {};
  }, []);

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: '#f5f5f5',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.key}
                      direction={orderBy === column.key ? order : 'asc'}
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4, color: 'text.secondary' }}
                >
                  No hay entradas disponibles
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  hover
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align || 'left'}
                      sx={getCellStyle(row[column.key], column.format)}
                    >
                      {formatValue(row[column.key], column.format)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {/* Totals Row */}
            {Object.keys(totals).length > 0 && sortedData.length > 0 && (
              <TableRow sx={{ backgroundColor: '#e0f7fa' }}>
                {columns.map((column, idx) => (
                  <TableCell
                    key={column.key}
                    align={column.align || 'left'}
                    sx={{ fontWeight: 700 }}
                  >
                    {idx === 0 ? (
                      'Totales'
                    ) : totals[column.key] !== undefined ? (
                      formatValue(totals[column.key], column.format)
                    ) : (
                      '-'
                    )}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="body2"
        sx={{ mt: 1, color: 'text.secondary' }}
      >
        Mostrando {sortedData.length} entradas
      </Typography>
    </Box>
  );
});

BalanceTable.displayName = 'BalanceTable';

export default BalanceTable;
