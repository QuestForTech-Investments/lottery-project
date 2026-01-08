/**
 * TicketMonitoring Constants
 *
 * Local constants for the ticket monitoring feature.
 */

import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import type { TicketCounts, TicketTotals } from '../../../../services/ticketService';
import { buttonStyles } from '../../../../constants';

// ============================================================================
// iOS Style Switch
// ============================================================================

export const IOSSwitch = styled(Switch)(({ theme }) => ({
  width: 52,
  height: 28,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 3,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(24px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#8b5cf6',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#8b5cf6',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 300,
    }),
  },
}));

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

export const COMPACT_INPUT_STYLE = {
  '& .MuiInputBase-root': {
    height: 32,
    borderRadius: '12px',
  },
  '& .MuiInputBase-input': {
    py: 0.5,
    fontSize: '0.8rem',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#6366f1',
    borderWidth: '1px',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#818cf8',
    borderWidth: '2px',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#6366f1',
    borderWidth: '2px',
  },
};

export const STYLES = {
  container: { p: 1, pb: 0 },
  content: { p: 2, pb: 1 },
  title: { color: '#1976d2', mb: 1, fontWeight: 400, fontSize: '1.7rem' },
  alertMargin: { mb: 3 },
  filterButton: buttonStyles.primaryRounded,
  filtersRow: { display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap', alignItems: 'flex-end' },
  filterLabel: { color: 'text.secondary', mb: 0.5, display: 'block' },
  totalsContainer: { display: 'flex', justifyContent: 'center', mb: 0, mt: '-4px' },
  totalsPanel: { px: 4, py: 0.5, backgroundColor: '#e8f4f8', textAlign: 'center' as const, width: 'fit-content' },
  totalsText: {
    color: 'rgb(43, 134, 169)',
    fontSize: '28px',
    fontWeight: 400,
    lineHeight: '30px',
    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
  },
  quickSearch: { mb: 0, maxWidth: 200, '& .MuiInputBase-root': { height: 32 } },
  tableContainer: { maxWidth: 950 },
  tableHeader: { backgroundColor: '#e3e3e3' },
  tableHeaderCell: {
    fontWeight: 600,
    backgroundColor: '#e3e3e3',
  },
  loadingCell: { py: 5 },
  emptyCell: { py: 3, color: 'text.secondary' },
} as const;

// Column widths to match original app layout
export const COLUMN_WIDTHS: Record<string, number> = {
  'Número': 140,
  'Fecha': 130,
  'Usuario': 100,
  'Monto': 90,
  'Premio': 90,
  'Fecha de cancelación': 110,
  'Estado': 80,
  'Acciones': 90,
};

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
