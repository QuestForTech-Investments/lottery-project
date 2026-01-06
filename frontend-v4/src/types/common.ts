/**
 * Common types used across multiple components
 * Centralized to avoid duplication and ensure consistency
 */

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Betting pool entity
 */
export interface BettingPool {
  id: number;
  name: string;
  code: string;
}

/**
 * Lottery entity
 */
export interface Lottery {
  id: number;
  name: string;
}

/**
 * Zone entity
 */
export interface Zone {
  id: number;
  name: string;
}

/**
 * Draw (Sorteo) entity
 */
export interface Draw {
  id: number;
  name: string;
  lotteryId?: number;
}

/**
 * Bet type entity
 */
export interface BetType {
  id: number;
  name: string;
  code?: string;
}

// ============================================================================
// Generic Types
// ============================================================================

/**
 * Generic select option for dropdowns/autocomplete
 */
export interface SelectOption {
  id: number;
  name: string;
}

/**
 * Generic select option with value/label pattern
 */
export interface SelectOptionValueLabel<T = string> {
  value: T;
  label: string;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Ticket status filter values
 */
export type TicketStatusFilter = 'todos' | 'ganadores' | 'pendientes' | 'perdedores' | 'cancelados';

/**
 * Ticket status display values (Spanish UI)
 */
export type TicketStatus = 'Ganador' | 'Cancelado' | 'Pagado' | 'Pendiente' | 'Perdedor';

/**
 * Mapping from filter values to display values
 */
export const TICKET_STATUS_MAP: Record<Exclude<TicketStatusFilter, 'todos'>, TicketStatus> = {
  ganadores: 'Ganador',
  pendientes: 'Pendiente',
  perdedores: 'Perdedor',
  cancelados: 'Cancelado',
} as const;

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic paginated response from API
 */
export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages?: number;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================================================
// Form Types
// ============================================================================

/**
 * Generic form errors object
 */
export interface FormErrors {
  [key: string]: string | null | undefined;
}

/**
 * Generic form state
 */
export interface FormState<T> {
  values: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
}

// ============================================================================
// Table Types
// ============================================================================

/**
 * Sort order for tables
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Generic column definition for tables
 */
export interface TableColumn<T> {
  id: keyof T | string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string | number;
  render?: (value: unknown, row: T) => React.ReactNode;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
