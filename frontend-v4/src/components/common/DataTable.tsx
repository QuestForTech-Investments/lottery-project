import { memo, useMemo, useState, type FC, type ReactNode } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableSortLabel,
  Paper,
  Typography,
} from '@mui/material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown, row: T) => ReactNode;
  width?: number | string;
  /** Disable sorting on this column. Sorting is enabled by default. */
  sortable?: boolean;
  /** Optional accessor for derived sort values (e.g. computed totals). */
  sortAccessor?: (row: T) => string | number | null | undefined;
}

export type SortOrder = 'asc' | 'desc';

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
  /** Initial sort column id. If undefined the data renders in input order. */
  defaultSortBy?: keyof T | string;
  defaultSortOrder?: SortOrder;
}

/**
 * Reusable data table component with optional totals row and column sorting.
 *
 * Sorting is on by default for every column; opt out per-column with `sortable: false`.
 * For derived values (computed columns, currency strings, etc.) pass `sortAccessor`.
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
  defaultSortBy,
  defaultSortOrder = 'asc',
}: DataTableProps<T>): React.ReactElement {
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortBy ? String(defaultSortBy) : undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);

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

  const handleSort = (columnId: string, isNumeric: boolean) => {
    if (sortBy === columnId) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnId);
      // Numeric columns are usually most useful sorted high-to-low first.
      setSortOrder(isNumeric ? 'desc' : 'asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    const column = columns.find((c) => String(c.id) === sortBy);
    if (!column) return data;
    const dir = sortOrder === 'asc' ? 1 : -1;
    const accessor = (row: T): string | number => {
      const raw = column.sortAccessor ? column.sortAccessor(row) : row[column.id as keyof T];
      if (raw == null) return '';
      return raw as string | number;
    };
    return data.slice().sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [data, columns, sortBy, sortOrder]);

  return (
    <TableContainer
      component={maxHeight ? Paper : 'div'}
      sx={{
        overflowX: 'auto',
        // Tighter cell padding on phones so more columns stay visible before
        // horizontal scroll kicks in. Header cells get the same treatment.
        '& .MuiTableCell-root': {
          px: { xs: 1, sm: 1.5, md: 2 },
        },
        ...(maxHeight ? { maxHeight } : {}),
      }}
    >
      <Table size={size} stickyHeader={stickyHeader}>
        <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
          <TableRow>
            {columns.map((column) => {
              const id = String(column.id);
              const isSortable = column.sortable !== false;
              const isActive = sortBy === id;
              // We probe the first row to guess whether the column is numeric.
              const firstValue = column.sortAccessor
                ? data[0] && column.sortAccessor(data[0])
                : data[0] && (data[0] as Record<string, unknown>)[id];
              const isNumeric = typeof firstValue === 'number';
              return (
                <TableCell
                  key={id}
                  align={column.align || 'left'}
                  sortDirection={isActive ? sortOrder : false}
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    width: column.width,
                  }}
                >
                  {isSortable ? (
                    <TableSortLabel
                      active={isActive}
                      direction={isActive ? sortOrder : 'asc'}
                      onClick={() => handleSort(id, isNumeric)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, index) => (
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
          {totals && sortedData.length > 0 && (
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
