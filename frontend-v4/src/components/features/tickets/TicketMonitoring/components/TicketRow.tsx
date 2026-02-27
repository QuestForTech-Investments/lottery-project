/**
 * TicketRow Component
 *
 * Table row for displaying a single ticket with action buttons.
 */

import { memo, useCallback, type FC } from 'react';
import { TableRow, TableCell, Box, IconButton, Tooltip } from '@mui/material';
import { Print as PrintIcon, Cancel as CancelIcon, Send as SendIcon, Schedule as ScheduleIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { getEstadoColor } from '../constants';
import type { TicketRowProps } from '../types';

const TicketRow: FC<TicketRowProps> = memo(({ ticket, isSelected, onRowClick, onPrint, onSend, onCancel }) => {
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
      <TableCell sx={{ position: 'relative' }}>
        {ticket.numero}
        {(ticket.isOutOfScheduleSale || ticket.isPreviousDay || ticket.isFutureDay) && (
          <Box sx={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            {ticket.isOutOfScheduleSale && ticket.estado !== 'Cancelado' && (
              <Tooltip title="Venta fuera de horario" arrow>
                <ScheduleIcon sx={{ fontSize: 17, color: '#e53935' }} />
              </Tooltip>
            )}
            {ticket.estado === 'Cancelado' && ticket.isOutOfScheduleSale && (
              <Tooltip title="Cancelado con jugadas fuera de horario" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 17, color: '#9c27b0' }} />
                  <CancelIcon sx={{ fontSize: 17, color: '#9c27b0', ml: -0.3 }} />
                </Box>
              </Tooltip>
            )}
            {ticket.isPreviousDay && (
              <Tooltip title="Venta día anterior" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowBackIcon sx={{ fontSize: 17, color: '#ff9800', mr: -0.3 }} />
                  <ScheduleIcon sx={{ fontSize: 17, color: '#ff9800' }} />
                </Box>
              </Tooltip>
            )}
            {ticket.isFutureDay && (
              <Tooltip title="Venta futura" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 17, color: '#2196f3' }} />
                  <ArrowForwardIcon sx={{ fontSize: 17, color: '#2196f3', ml: -0.3 }} />
                </Box>
              </Tooltip>
            )}
          </Box>
        )}
      </TableCell>
      <TableCell>{ticket.fecha}</TableCell>
      <TableCell>{ticket.usuario}</TableCell>
      <TableCell>{formatCurrency(ticket.monto)}</TableCell>
      <TableCell>{formatCurrency(ticket.premio)}</TableCell>
      <TableCell>{ticket.fechaCancelacion || '-'}</TableCell>
      <TableCell sx={{ color: getEstadoColor(ticket.estado), textAlign: 'center', px: 0 }}>
        {ticket.estado}
      </TableCell>
      <TableCell sx={{ px: 0 }}>
        <Box sx={{ display: 'flex', gap: 0, justifyContent: 'center' }}>
          <IconButton size="small" color="primary" onClick={handlePrintClick} title="Imprimir ticket" sx={{ p: 0.25 }}>
            <PrintIcon sx={{ fontSize: 18 }} />
          </IconButton>
          {ticket.estado !== 'Cancelado' && (
            <IconButton size="small" color="error" onClick={handleCancelClick} title="Cancelar ticket" sx={{ p: 0.25 }}>
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
