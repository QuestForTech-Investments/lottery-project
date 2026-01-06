import { memo, type FC, type ReactNode } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  Box,
} from '@mui/material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown, row: T) => ReactNode;
  width?: number | string;
  sortable?: boolean;
}

export interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  totals?: Partial<T>;
  totalsLabel?: string;
  emptyMessage?: string;
  size?: 'small' | 'medium';
  stickyHeader?: boolean;
  maxHeight?: number | string;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: keyof T | ((row: T, index: number) => string | number);
}

/**
 * Reusable data table component with optional totals row
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { id: 'name', label: 'Nombre' },
 *     { id: 'amount', label: 'Monto', align: 'right', format: (v) => formatCurrency(v as number) },
 *   ]}
 *   data={items}
 *   totals={{ amount: totalAmount }}
 *   emptyMessage="No hay datos"
 * />
 * ```
 */
function DataTableInner<T extends object>({
  columns,
  data,
  totals,
  totalsLabel = 'Totales',
  emptyMessage = 'No hay datos disponibles',
  size = 'small',
  stickyHeader = false,
  maxHeight,
  onRowClick,
  rowKey,
}: DataTableProps<T>): React.ReactElement {
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') return rowKey(row, index);
    if (rowKey) return String(row[rowKey]);
    return index;
  };

  const getCellValue = (row: T, column: Column<T>): ReactNode => {
    const value = row[column.id as keyof T];
    if (column.format) return column.format(value, row);
    return value as ReactNode;
  };

  return (
    <TableContainer
      component={maxHeight ? Paper : 'div'}
      sx={maxHeight ? { maxHeight } : undefined}
    >
      <Table size={size} stickyHeader={stickyHeader}>
        <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={String(column.id)}
                align={column.align || 'left'}
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  width: column.width,
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={getRowKey(row, index)}
                hover
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                {columns.map((column) => (
                  <TableCell key={String(column.id)} align={column.align || 'left'}>
                    {getCellValue(row, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
          {totals && data.length > 0 && (
            <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
              {columns.map((column, index) => (
                <TableCell key={String(column.id)} align={column.align || 'left'}>
                  {index === 0
                    ? totalsLabel
                    : totals[column.id as keyof T] !== undefined
                    ? column.format
                      ? column.format(totals[column.id as keyof T], {} as T)
                      : String(totals[column.id as keyof T])
                    : '-'}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;

export default DataTable;
