/**
 * SalesTable Component
 *
 * Data table for displaying sales with totals row.
 */

import React, { memo, useMemo, useState, type FC } from 'react';
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
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflowX: 'auto', mx: 'auto' }}>
      <Table size="small" stickyHeader sx={{ width: '100%' }}>
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
                    hideSortIcon
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
              <TableCell colSpan={columns.length} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                {t('sales.noEntriesForDrawDate')}
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sortedData.map((row) => {
                // Per-column data cell renderers, keyed by column.key. Rendered
                // in whatever order `columns` provides — letting callers swap
                // column ordering (e.g. surface Venta before P on mobile).
                const cells: Record<string, React.ReactNode> = {
                  ref: <TableCell key="ref" sx={{ whiteSpace: 'nowrap' }}>{row.ref}</TableCell>,
                  code: (
                    <TableCell key="code" sx={{ whiteSpace: 'nowrap' }}>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => onCodeClick(row.id)}
                        sx={{
                          cursor: 'pointer',
                          color: '#1976d2',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {row.code}
                      </Link>
                    </TableCell>
                  ),
                  p: <TableCell key="p" align="center">{row.p}</TableCell>,
                  l: <TableCell key="l" align="center">{row.l}</TableCell>,
                  w: <TableCell key="w" align="center">{row.w}</TableCell>,
                  total: <TableCell key="total" align="right">{row.total}</TableCell>,
                  sales: <TableCell key="sales" align="right">{formatCurrency(row.sales)}</TableCell>,
                  commissions: <TableCell key="commissions" align="right">{formatCurrency(row.commissions)}</TableCell>,
                  discounts: <TableCell key="discounts" align="right">{formatCurrency(row.discounts)}</TableCell>,
                  prizes: <TableCell key="prizes" align="right">{formatCurrency(row.prizes)}</TableCell>,
                  net: (
                    <TableCell key="net" align="right" sx={{ color: row.net > 0 ? '#2e7d32' : row.net < 0 ? '#c62828' : '#1565c0', fontWeight: 600 }}>
                      {formatCurrency(row.net)}
                    </TableCell>
                  ),
                  fall: <TableCell key="fall" align="right" sx={{ color: row.fall > 0 ? '#2e7d32' : 'inherit' }}>{formatCurrency(row.fall)}</TableCell>,
                  final: (
                    <TableCell key="final" align="right" sx={{ color: row.final > 0 ? '#2e7d32' : row.final < 0 ? '#c62828' : '#1565c0', fontWeight: 600 }}>
                      {formatCurrency(row.final)}
                    </TableCell>
                  ),
                  balance: (
                    <TableCell key="balance" align="right" sx={{ color: row.balance > 0 ? '#2e7d32' : row.balance < 0 ? '#c62828' : '#1565c0', fontWeight: 600 }}>
                      {formatCurrency(row.balance)}
                    </TableCell>
                  ),
                  accumulatedFall: (
                    <TableCell key="accumulatedFall" align="right" sx={{ color: row.accumulatedFall >= 0 ? '#2e7d32' : '#c62828', fontWeight: 600 }}>
                      {formatCurrency(row.accumulatedFall)}
                    </TableCell>
                  ),
                };
                return (
                  <TableRow key={row.id} hover>
                    {columns.map(col => cells[col.key])}
                  </TableRow>
                );
              })}
              {/* Totals Row — same renderer pattern so the column order stays
                  in sync with the data and header rows. */}
              <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                {(() => {
                  const totalsCells: Record<string, React.ReactNode> = {
                    ref: <TableCell key="ref">{t('balances.totals')}</TableCell>,
                    code: <TableCell key="code">-</TableCell>,
                    p: <TableCell key="p" align="center">{totals.p}</TableCell>,
                    l: <TableCell key="l" align="center">{totals.l}</TableCell>,
                    w: <TableCell key="w" align="center">{totals.w}</TableCell>,
                    total: <TableCell key="total" align="right">{totals.total}</TableCell>,
                    sales: <TableCell key="sales" align="right">{formatCurrency(totals.sales)}</TableCell>,
                    commissions: <TableCell key="commissions" align="right">{formatCurrency(totals.commissions)}</TableCell>,
                    discounts: <TableCell key="discounts" align="right">{formatCurrency(totals.discounts)}</TableCell>,
                    prizes: <TableCell key="prizes" align="right">{formatCurrency(totals.prizes)}</TableCell>,
                    net: <TableCell key="net" align="right" sx={{ color: totals.net > 0 ? '#2e7d32' : totals.net < 0 ? '#c62828' : '#1565c0' }}>{formatCurrency(totals.net)}</TableCell>,
                    fall: <TableCell key="fall" align="right" sx={{ color: totals.fall > 0 ? '#2e7d32' : 'inherit' }}>{formatCurrency(totals.fall)}</TableCell>,
                    final: <TableCell key="final" align="right" sx={{ color: totals.final > 0 ? '#2e7d32' : totals.final < 0 ? '#c62828' : '#1565c0' }}>{formatCurrency(totals.final)}</TableCell>,
                    balance: <TableCell key="balance" align="right" sx={{ color: totals.balance > 0 ? '#2e7d32' : totals.balance < 0 ? '#c62828' : '#1565c0' }}>{formatCurrency(totals.balance)}</TableCell>,
                    accumulatedFall: <TableCell key="accumulatedFall" align="right" sx={{ color: totals.accumulatedFall >= 0 ? '#2e7d32' : '#c62828', fontWeight: 600 }}>{formatCurrency(totals.accumulatedFall)}</TableCell>,
                  };
                  return columns.map(col => totalsCells[col.key]);
                })()}
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
