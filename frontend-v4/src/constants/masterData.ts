/**
 * Master data constants
 * Static data used across the application
 */

import type { SelectOption } from '../types/common';

// ============================================================================
// Bet Types (Tipos de Jugada)
// ============================================================================

export const BET_TYPES: SelectOption[] = [
  { id: 1, name: 'Directo' },
  { id: 2, name: 'Pale' },
  { id: 3, name: 'Tripleta' },
  { id: 4, name: 'Pick Two' },
  { id: 5, name: 'Pick Three' },
  { id: 6, name: 'Pick Four' },
] as const;

export const BET_TYPE_MAP: Record<number, string> = {
  1: 'Directo',
  2: 'Pale',
  3: 'Tripleta',
  4: 'Pick Two',
  5: 'Pick Three',
  6: 'Pick Four',
} as const;

// ============================================================================
// Zones (Zonas)
// ============================================================================

export const ZONES: SelectOption[] = [
  { id: 1, name: 'Zona Norte' },
  { id: 2, name: 'Zona Sur' },
  { id: 3, name: 'Zona Este' },
  { id: 4, name: 'Zona Oeste' },
] as const;

// ============================================================================
// Ticket Status
// ============================================================================

export type TicketStatusKey = 'todos' | 'ganadores' | 'pendientes' | 'perdedores' | 'cancelados';
export type TicketStatusValue = 'Ganador' | 'Cancelado' | 'Pagado' | 'Pendiente' | 'Perdedor';

export const TICKET_STATUS_FILTERS: { key: TicketStatusKey; label: string }[] = [
  { key: 'todos', label: 'TODOS' },
  { key: 'ganadores', label: 'GANADORES' },
  { key: 'pendientes', label: 'PENDIENTES' },
  { key: 'perdedores', label: 'PERDEDORES' },
  { key: 'cancelados', label: 'CANCELADO' },
] as const;

export const TICKET_STATUS_MAP: Record<Exclude<TicketStatusKey, 'todos'>, TicketStatusValue> = {
  ganadores: 'Ganador',
  pendientes: 'Pendiente',
  perdedores: 'Perdedor',
  cancelados: 'Cancelado',
} as const;

// ============================================================================
// Table Headers
// ============================================================================

export const TICKET_TABLE_HEADERS = [
  'Número',
  'Fecha',
  'Usuario',
  'Monto',
  'Premio',
  'Fecha de cancelación',
  'Estado',
  'Acciones',
] as const;

// ============================================================================
// Pagination
// ============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ============================================================================
// Debounce
// ============================================================================

export const DEBOUNCE_DELAY = 300;
export const SEARCH_DEBOUNCE_DELAY = 500;

// ============================================================================
// Date/Time
// ============================================================================

export const SANTO_DOMINGO_TIMEZONE = 'America/Santo_Domingo';
export const DEFAULT_DATE_FORMAT = 'es-ES';
