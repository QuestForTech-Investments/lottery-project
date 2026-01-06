/**
 * TicketMonitoring Constants
 *
 * Local constants for the ticket monitoring feature.
 */

import type { TicketCounts, TicketTotals } from '../../../../services/ticketService';
import { buttonStyles } from '../../../../constants';

// ============================================================================
// Initial State Values
// ============================================================================

export const INITIAL_COUNTS: TicketCounts = {
  todos: 0,
  ganadores: 0,
  pendientes: 0,
  perdedores: 0,
  cancelados: 0,
};

export const INITIAL_TOTALS: TicketTotals = {
  montoTotal: 0,
  totalPremios: 0,
  totalPendiente: 0,
};

// ============================================================================
// Style Constants
// ============================================================================

export const STYLES = {
  container: { p: 2 },
  content: { p: 3 },
  title: { color: '#1976d2', mb: 4, fontWeight: 400 },
  alertMargin: { mb: 3 },
  filterButton: buttonStyles.primaryRounded,
  totalsContainer: { display: 'flex', justifyContent: 'center', mb: 3 },
  totalsPanel: { px: 4, py: 2, backgroundColor: '#f5f5f5', textAlign: 'center' as const, width: 'fit-content' },
  totalsText: { color: '#1976d2' },
  quickSearch: { mb: 2, maxWidth: 300 },
  tableHeader: { backgroundColor: '#f5f5f5' },
  tableHeaderCell: { fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' },
  loadingCell: { py: 5 },
  emptyCell: { py: 3, color: 'text.secondary' },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

export function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'Ganador':
      return 'success.main';
    case 'Cancelado':
      return 'error.main';
    default:
      return 'inherit';
  }
}
