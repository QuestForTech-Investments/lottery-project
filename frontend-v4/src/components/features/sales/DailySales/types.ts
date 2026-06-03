/**
 * DailySales Types
 *
 * Type definitions for the daily sales feature.
 */

import type { SelectChangeEvent } from '@mui/material/Select';

// ============================================================================
// Data Types
// ============================================================================

export interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

export interface BettingPool {
  bettingPoolId?: number;
  id?: number;
  reference?: string;
}

export interface SalesRow {
  id: number;
  ref: string;
  code: string;
  p: number;
  l: number;
  w: number;
  total: number;
  sales: number;
  commissions: number;
  discounts: number;
  prizes: number;
  net: number;
  fall: number;
  final: number;
  balance: number;
  accumulatedFall: number;
}

export interface SalesTotals {
  p: number;
  l: number;
  w: number;
  total: number;
  sales: number;
  commissions: number;
  discounts: number;
  prizes: number;
  net: number;
  fall: number;
  final: number;
  balance: number;
  accumulatedFall: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface BettingPoolSalesDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  reference?: string;
  zoneId: number;
  zoneName: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalDiscounts: number;
  totalNet: number;
  fall: number;
  accumulatedFall: number;
  pendingCount: number;
  winnerCount: number;
  loserCount: number;
  balance: number;
}

// ============================================================================
// UI Types
// ============================================================================

export interface TableColumn {
  key: string;
  label: string;
  align: 'left' | 'center' | 'right';
}

export interface FilterOption {
  value: string;
  label: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Entries for the "Grupo" dropdown in Ventas del Día.
 *   - id="self"  → render local data
 *   - id="ext-<n>" → proxy through /api/external-tenants/<n>/today-sales*
 * The dropdown only appears when there's at least one partner; otherwise the
 * page behaves exactly like the single-tenant version.
 */
export interface GroupOption {
  id: string;
  label: string;
  /** External tenant id when id starts with "ext-"; undefined for self. */
  externalTenantId?: number;
}

export interface FiltersSectionProps {
  selectedDate: string;
  zones: Zone[];
  selectedZones: number[];
  onDateChange: (date: string) => void;
  onZoneChange: (event: SelectChangeEvent<number[]>) => void;
  /** Hide the dropdown when there's only one option (no partners configured). */
  groupOptions: GroupOption[];
  selectedGroupId: string;
  onGroupChange: (id: string) => void;
}

export interface ActionButtonsProps {
  loading: boolean;
  onSearch: () => void;
  onExportPdf: () => void;
  onExportCsv: () => void;
  onProcessTodayTickets: () => void;
  onProcessYesterdaySales: () => void;
}

export interface FilterTogglesProps {
  filterType: string;
  onFilterChange: (value: string) => void;
}

export interface SalesTableProps {
  data: SalesRow[];
  totals: SalesTotals;
  columns: TableColumn[];
  onCodeClick: (bettingPoolId: number) => void;
}
