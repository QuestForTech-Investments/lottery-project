/**
 * DailySales Constants
 *
 * Constants for the daily sales feature.
 */

import type { TableColumn, FilterOption, SalesTotals } from './types';

export const TABLE_COLUMNS: TableColumn[] = [
  { key: 'ref', label: 'Ref.', align: 'left' },
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'p', label: 'P', align: 'center' },
  { key: 'l', label: 'L', align: 'center' },
  { key: 'w', label: 'W', align: 'center' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'sales', label: 'Venta', align: 'right' },
  { key: 'commissions', label: 'Comisiones', align: 'right' },
  { key: 'discounts', label: 'Descuentos', align: 'right' },
  { key: 'prizes', label: 'Premios', align: 'right' },
  { key: 'net', label: 'Neto', align: 'right' },
  { key: 'fall', label: 'Caída', align: 'right' },
  { key: 'final', label: 'Final', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'accumulatedFall', label: 'Caida acumulada', align: 'right' }
];

export const MAIN_TABS = [
  'General',
  'Banca por sorteo',
  'Por sorteo',
  'Combinaciones',
  'Por zona',
  'Categoría de Premios',
  'Categoría de Premios para Pale'
];

export const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'with-sales', label: 'Con ventas' },
  { value: 'with-prizes', label: 'Con premios' },
  { value: 'pending-tickets', label: 'Con tickets pendientes' },
  { value: 'negative-net', label: 'Con ventas netas negativas' },
  { value: 'positive-net', label: 'Con ventas netas positivas' }
];

export const INITIAL_TOTALS: SalesTotals = {
  p: 0,
  l: 0,
  w: 0,
  total: 0,
  sales: 0,
  commissions: 0,
  discounts: 0,
  prizes: 0,
  net: 0,
  fall: 0,
  final: 0,
  balance: 0,
  accumulatedFall: 0
};

export const BUTTON_PILL_STYLE = {
  borderRadius: '20px',
  px: 2.5,
  py: 0.5,
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  fontWeight: 500
};

export const COMPACT_INPUT_STYLE = {
  '& .MuiInputBase-root': {
    height: 32,
  },
  '& .MuiInputBase-input': {
    py: 0.5,
    fontSize: '0.8rem',
  },
};

export const COMPACT_SELECT_STYLE = {
  '& .MuiInputBase-root': {
    height: 32,
  },
  '& .MuiSelect-select': {
    py: 0.5,
    fontSize: '0.8rem',
  },
};
