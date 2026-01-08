/**
 * TicketMonitoring Types
 *
 * Type definitions for the ticket monitoring feature.
 */

import type { MappedTicket, TicketCounts, TicketTotals } from '../../../../services/ticketService';

// ============================================================================
// API Response Types
// ============================================================================

export interface BettingPoolApiResponse {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface TicketRowProps {
  ticket: MappedTicket;
  isSelected?: boolean;
  onRowClick: (id: number) => void;
  onPrint: (id: number) => void;
  onSend: (id: number) => void;
  onCancel: (id: number) => void;
}

export interface TicketDetailPanelProps {
  ticket: MappedTicket;
  onClose: () => void;
}

export interface FiltersSectionProps {
  fecha: string;
  banca: import('../../../../types').BettingPool | null;
  bancas: import('../../../../types').BettingPool[];
  loteria: import('../../../../types').Lottery | null;
  loterias: import('../../../../types').Lottery[];
  tipoJugada: import('../../../../types').SelectOption | null;
  numero: string;
  pendientesPago: boolean;
  soloGanadores: boolean;
  zona: import('../../../../types').SelectOption | null;
  isLoading: boolean;
  isInitialLoad: boolean;
  isCompactView: boolean;
  onFechaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBancaChange: (e: React.SyntheticEvent, value: import('../../../../types').BettingPool | null) => void;
  onLoteriaChange: (e: React.SyntheticEvent, value: import('../../../../types').Lottery | null) => void;
  onTipoJugadaChange: (e: React.SyntheticEvent, value: import('../../../../types').SelectOption | null) => void;
  onNumeroChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPendientesPagoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSoloGanadoresChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onZonaChange: (e: React.SyntheticEvent, value: import('../../../../types').SelectOption | null) => void;
  onFilterClick: () => void;
}

export interface StatusToggleProps {
  filtroEstado: FilterEstado;
  counts: TicketCounts;
  onFilterChange: (event: React.MouseEvent<HTMLElement>, value: FilterEstado | null) => void;
}

export interface TotalsPanelProps {
  totals: TicketTotals;
  isCompact?: boolean;
}

// ============================================================================
// Filter Types
// ============================================================================

export type FilterEstado = 'todos' | 'ganadores' | 'pendientes' | 'perdedores' | 'cancelados';

// Re-export for convenience
export type { MappedTicket, TicketCounts, TicketTotals };
