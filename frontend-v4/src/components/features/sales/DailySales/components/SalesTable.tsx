/**
 * SalesTable Component
 *
 * Data table for displaying sales with totals row.
 */

import { memo, useMemo, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Link,
} from '@mui/material';
import { formatCurrency } from '@/utils/formatCurrency';
import type { SalesTableProps, SalesRow } from '../types';

type SortOrder = 'asc' | 'desc';

const SalesTable: FC<SalesTableProps> = memo(({ data, totals, columns, onCodeClick }) => {
  const { t } = useTranslation();
  // Default sort matches the previous static order (by code asc).
  const [sortBy, setSortBy] = useState<keyof SalesRow>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (key: keyof SalesRow) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      const sample = data[0]?.[key];
      setSortOrder(typeof sample === 'number' ? 'desc' : 'asc');
    }
  };

  const sortedData = useMemo(() => {
    if (data.length === 0) return data;
    const dir = sortOrder === 'asc' ? 1 : -1;
    return data.slice().sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [data, sortBy, sortOrder]);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
      <Table size="small" stickyHeader>
        <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
          <TableRow>
            {columns.map(col => {
              const key = col.key as keyof SalesRow;
              const isActive = sortBy === key;
              return (
                <TableCell
                  key={col.key}
                  align={col.align}
                  sx={{ backgroundColor: '#e3e3e3', fontWeight: 600 }}
                  sortDirection={isActive ? sortOrder : false}
                >
                  <TableSortLabel
                    active={isActive}
                    direction={isActive ? sortOrder : 'asc'}
                    onClick={() => handleSort(key)}
                  >
                    {t(col.label)}
                  </TableSortLabel>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={15} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                {t('sales.noEntriesForDrawDate')}
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sortedData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.ref}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => onCodeClick(row.id)}
                      sx={{
                        cursor: 'pointer',
                        color: '#1976d2',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {row.code}
                    </Link>
                  </TableCell>
                  <TableCell align="center">{row.p}</TableCell>
                  <TableCell align="center">{row.l}</TableCell>
                  <TableCell align="center">{row.w}</TableCell>
                  <TableCell align="right">{row.total}</TableCell>
                  <TableCell align="right">{formatCurrency(row.sales)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.commissions)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.discounts)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.prizes)}</TableCell>
                  <TableCell align="right" sx={{ color: row.net > 0 ? '#2e7d32' : row.net < 0 ? '#c62828' : '#1565c0', fontWeight: 600 }}>
                    {formatCurrency(row.net)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: row.fall > 0 ? '#2e7d32' : 'inherit' }}>{formatCurrency(row.fall)}</TableCell>
                  <TableCell align="right" sx={{ color: row.final > 0 ? '#2e7d32' : row.final < 0 ? '#c62828' : '#1565c0', fontWeight: 600 }}>
                    {formatCurrency(row.final)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: row.balance > 0 ? '#2e7d32' : row.balance < 0 ? '#c62828' : '#1565c0', fontWeight: 600 }}>
                    {formatCurrency(row.balance)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: row.accumulatedFall >= 0 ? '#2e7d32' : '#c62828', fontWeight: 600 }}>{formatCurrency(row.accumulatedFall)}</TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                <TableCell>{t('balances.totals')}</TableCell>
                <TableCell>-</TableCell>
                <TableCell align="center">{totals.p}</TableCell>
                <TableCell align="center">{totals.l}</TableCell>
                <TableCell align="center">{totals.w}</TableCell>
                <TableCell align="right">{totals.total}</TableCell>
                <TableCell align="right">{formatCurrency(totals.sales)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.commissions)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.discounts)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.prizes)}</TableCell>
                <TableCell align="right" sx={{ color: totals.net > 0 ? '#2e7d32' : totals.net < 0 ? '#c62828' : '#1565c0' }}>{formatCurrency(totals.net)}</TableCell>
                <TableCell align="right" sx={{ color: totals.fall > 0 ? '#2e7d32' : 'inherit' }}>{formatCurrency(totals.fall)}</TableCell>
                <TableCell align="right" sx={{ color: totals.final > 0 ? '#2e7d32' : totals.final < 0 ? '#c62828' : '#1565c0' }}>{formatCurrency(totals.final)}</TableCell>
                <TableCell align="right" sx={{ color: totals.balance > 0 ? '#2e7d32' : totals.balance < 0 ? '#c62828' : '#1565c0' }}>{formatCurrency(totals.balance)}</TableCell>
                <TableCell align="right" sx={{ color: totals.accumulatedFall >= 0 ? '#2e7d32' : '#c62828', fontWeight: 600 }}>{formatCurrency(totals.accumulatedFall)}</TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

SalesTable.displayName = 'SalesTable';

export default SalesTable;
