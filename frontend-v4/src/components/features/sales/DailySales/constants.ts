/**
 * DailySales Constants
 *
 * Constants for the daily sales feature.
 */

import type { TableColumn, FilterOption, SalesTotals } from './types';

// Columns and tabs use i18n keys in `label`. Components resolve them with t().
export const TABLE_COLUMNS: TableColumn[] = [
  { key: 'ref', label: 'sales.ref', align: 'left' },
  { key: 'code', label: 'common.code', align: 'left' },
  { key: 'p', label: 'sales.pendingShort', align: 'center' },
  { key: 'l', label: 'sales.loserShort', align: 'center' },
  { key: 'w', label: 'sales.winnerShort', align: 'center' },
  { key: 'total', label: 'common.total', align: 'right' },
  { key: 'sales', label: 'sales.venta', align: 'right' },
  { key: 'commissions', label: 'sales.comisiones', align: 'right' },
  { key: 'discounts', label: 'sales.descuentos', align: 'right' },
  { key: 'prizes', label: 'sales.premios', align: 'right' },
  { key: 'net', label: 'sales.neto', align: 'right' },
  { key: 'fall', label: 'sales.caida', align: 'right' },
  { key: 'final', label: 'sales.final', align: 'right' },
  { key: 'balance', label: 'common.balance', align: 'right' },
  { key: 'accumulatedFall', label: 'sales.accumulatedFall', align: 'right' }
];

// Mobile column order — Venta surfaces right after Código so the user sees
// the sales amount without scrolling. The remaining columns trail behind and
// are reachable via horizontal scroll.
export const TABLE_COLUMNS_MOBILE: TableColumn[] = [
  { key: 'ref', label: 'sales.ref', align: 'left' },
  { key: 'code', label: 'common.code', align: 'left' },
  { key: 'sales', label: 'sales.venta', align: 'right' },
  { key: 'p', label: 'sales.pendingShort', align: 'center' },
  { key: 'l', label: 'sales.loserShort', align: 'center' },
  { key: 'w', label: 'sales.winnerShort', align: 'center' },
  { key: 'total', label: 'common.total', align: 'right' },
  { key: 'commissions', label: 'sales.comisiones', align: 'right' },
  { key: 'discounts', label: 'sales.descuentos', align: 'right' },
  { key: 'prizes', label: 'sales.premios', align: 'right' },
  { key: 'net', label: 'sales.neto', align: 'right' },
  { key: 'fall', label: 'sales.caida', align: 'right' },
  { key: 'final', label: 'sales.final', align: 'right' },
  { key: 'balance', label: 'common.balance', align: 'right' },
  { key: 'accumulatedFall', label: 'sales.accumulatedFall', align: 'right' }
];

export const MAIN_TABS = [
  'sales.tabs.general',
  'sales.tabs.bancaPorSorteo',
  'sales.tabs.porSorteo',
  'sales.tabs.combinaciones',
  'sales.tabs.porZona',
  'sales.tabs.categoriaPremios',
  'sales.tabs.categoriaPremiosPale'
];

export const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'common.all' },
  { value: 'with-sales', label: 'sales.filters.withSales' },
  { value: 'with-prizes', label: 'sales.filters.withPrizes' },
  { value: 'pending-tickets', label: 'sales.filters.pendingTickets' },
  { value: 'negative-net', label: 'sales.filters.negativeNet' },
  { value: 'positive-net', label: 'sales.filters.positiveNet' }
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
