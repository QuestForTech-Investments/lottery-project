/**
 * SalesTable Component
 *
 * Data table for displaying sales with totals row.
 */

import { memo, type FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from '@mui/material';
import { formatCurrency } from '@/utils/formatCurrency';
import type { SalesTableProps } from '../types';

const SalesTable: FC<SalesTableProps> = memo(({ data, totals, columns, onCodeClick }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
      <Table size="small" stickyHeader>
        <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
          <TableRow>
            {columns.map(col => (
              <TableCell key={col.key} align={col.align} sx={{ backgroundColor: '#e3e3e3', fontWeight: 600 }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={15} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                No hay entradas para el sorteo y la fecha elegidos
              </TableCell>
            </TableRow>
          ) : (
            <>
              {data.map((row) => (
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
                  <TableCell align="right" sx={{ color: row.net < 0 ? 'error.main' : 'inherit' }}>
                    {formatCurrency(row.net)}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(row.fall)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.final)}</TableCell>
                  <TableCell align="right" sx={{ color: row.balance < 0 ? 'error.main' : 'success.main' }}>
                    {formatCurrency(row.balance)}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(row.accumulatedFall)}</TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                <TableCell>Totales</TableCell>
                <TableCell>-</TableCell>
                <TableCell align="center">{totals.p}</TableCell>
                <TableCell align="center">{totals.l}</TableCell>
                <TableCell align="center">{totals.w}</TableCell>
                <TableCell align="right">{totals.total}</TableCell>
                <TableCell align="right">{formatCurrency(totals.sales)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.commissions)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.discounts)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.prizes)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.net)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.fall)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.final)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.balance)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.accumulatedFall)}</TableCell>
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
