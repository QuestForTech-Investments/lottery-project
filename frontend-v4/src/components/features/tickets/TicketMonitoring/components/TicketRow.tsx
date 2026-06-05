/**
 * TicketRow Component
 *
 * Table row for displaying a single ticket with action buttons.
 */

import { memo, useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { TableRow, TableCell, Box, IconButton, Tooltip } from '@mui/material';
import { Print as PrintIcon, Cancel as CancelIcon, Send as SendIcon, Schedule as ScheduleIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { getEstadoColor } from '../constants';
import type { TicketRowProps } from '../types';

// Backend returns Spanish status strings (legacy schema). Map to i18n keys for
// display while keeping the raw value for filters and styling logic.
const STATUS_I18N_KEY: Record<string, string> = {
  'Activo': 'ticketStatus.active',
  'Ganador': 'ticketStatus.winner',
  'Cancelado': 'ticketStatus.cancelled',
  'Pendiente': 'ticketStatus.pending',
  'Pagado': 'ticketStatus.paid',
  'Sin pagar': 'ticketStatus.unpaid',
  'Bloqueado': 'ticketStatus.blocked',
};

// Extract the YYYY-MM-DD prefix from the backend payload and reformat as
// DD/MM/YYYY. We intentionally avoid `new Date(...)` here — DrawDate is a
// calendar date in the lottery's local TZ, so parsing it as a Date and then
// converting to another TZ can shift the day (e.g. midnight in UTC becomes
// the previous day in Santo Domingo).
const formatDrawDateList = (dates?: string[]): string => {
  if (!dates || dates.length === 0) return '';
  return dates
    .map((d) => {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
      if (m) return `${m[3]}/${m[2]}/${m[1]}`;
      return d;
    })
    .join(', ');
};

const TicketRow: FC<TicketRowProps> = memo(({ ticket, isSelected, onRowClick, onPrint, onSend, onCancel }) => {
  const { t } = useTranslation();
  const handleRowClick = useCallback(() => {
    onRowClick(ticket.id);
  }, [ticket.id, onRowClick]);

  const handlePrintClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint(ticket.id);
  }, [ticket.id, onPrint]);

  const handleSendClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSend(ticket.id);
  }, [ticket.id, onSend]);

  const handleCancelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel(ticket.id);
  }, [ticket.id, onCancel]);

  return (
    <TableRow
      sx={{
        cursor: 'pointer',
        fontSize: '0.8rem',
        backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'inherit',
        borderLeft: isSelected ? '3px solid #8b5cf6' : '3px solid transparent',
        '&:hover': { backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.18)' : 'action.hover' },
        '& .MuiTableCell-root': { fontSize: '0.75rem', textAlign: 'center', whiteSpace: 'nowrap' },
      }}
      onClick={handleRowClick}
    >
      <TableCell>{ticket.numero}</TableCell>
      <TableCell sx={{ px: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.25 }}>
          {ticket.isOutOfScheduleSale && ticket.estado === 'Ganador' && (
            <Tooltip title={t('tickets.monitoring.winnerOutOfSchedule')} arrow>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 18, color: '#e53935' }} />
                <VisibilityIcon sx={{ fontSize: 18, color: '#e53935' }} />
              </Box>
            </Tooltip>
          )}
          {ticket.isOutOfScheduleSale && ticket.estado !== 'Cancelado' && ticket.estado !== 'Ganador' && (
            <Tooltip title={t('tickets.monitoring.saleOutOfSchedule')} arrow>
              <ScheduleIcon sx={{ fontSize: 18, color: '#e53935' }} />
            </Tooltip>
          )}
          {ticket.estado === 'Cancelado' && ticket.isOutOfScheduleSale && (
            <Tooltip title={t('tickets.monitoring.cancelledOutOfSchedule')} arrow>
              <ScheduleIcon sx={{ fontSize: 18, color: '#9c27b0' }} />
            </Tooltip>
          )}
          {ticket.isCancelledOutOfTime && (
            <Tooltip title={t('tickets.monitoring.cancelledOutOfTime')} arrow>
              <CancelIcon sx={{ fontSize: 18, color: '#e65100' }} />
            </Tooltip>
          )}
          {ticket.isPreviousDay && (
            <Tooltip
              title={
                ticket.previousDrawDates && ticket.previousDrawDates.length > 0
                  ? t('tickets.monitoring.previousDaySaleFor', { date: formatDrawDateList(ticket.previousDrawDates) })
                  : t('tickets.monitoring.previousDaySale')
              }
              arrow
            >
              <ArrowBackIcon sx={{ fontSize: 18, color: '#ff9800' }} />
            </Tooltip>
          )}
          {ticket.isFutureDay && (
            <Tooltip
              title={
                ticket.futureDrawDates && ticket.futureDrawDates.length > 0
                  ? t('tickets.monitoring.futureDaySaleFor', { date: formatDrawDateList(ticket.futureDrawDates) })
                  : t('tickets.monitoring.futureDaySale')
              }
              arrow
            >
              <ArrowForwardIcon sx={{ fontSize: 18, color: '#2196f3' }} />
            </Tooltip>
          )}
        </Box>
      </TableCell>
      <TableCell>{ticket.fecha}</TableCell>
      <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>
        <Tooltip title={ticket.usuario || ''} arrow>
          <Box component="span" sx={{ display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'middle' }}>
            {ticket.usuario}
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell>{formatCurrency(ticket.monto)}</TableCell>
      <TableCell>{formatCurrency(ticket.premio)}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {ticket.fechaCancelacion
          ? `${ticket.fechaCancelacion}${ticket.canceladoPor ? ` (${ticket.canceladoPor})` : ''}`
          : '-'}
      </TableCell>
      <TableCell sx={{ color: getEstadoColor(ticket.estado), textAlign: 'center', px: 0 }}>
        {STATUS_I18N_KEY[ticket.estado] ? t(STATUS_I18N_KEY[ticket.estado]) : ticket.estado}
      </TableCell>
      <TableCell sx={{ px: 0 }}>
        <Box sx={{ display: 'flex', gap: 0, justifyContent: 'center' }}>
          <IconButton size="small" color="primary" onClick={handlePrintClick} title={t('tickets.monitoring.printTicket')} sx={{ p: 0.25 }}>
            <PrintIcon sx={{ fontSize: 18 }} />
          </IconButton>
          {ticket.estado !== 'Cancelado' && (
            <IconButton size="small" color="error" onClick={handleCancelClick} title={t('tickets.detail.cancel')} sx={{ p: 0.25 }}>
              <CancelIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
});

TicketRow.displayName = 'TicketRow';

export default TicketRow;
