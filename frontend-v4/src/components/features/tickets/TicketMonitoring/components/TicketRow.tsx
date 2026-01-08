/**
 * TicketRow Component
 *
 * Table row for displaying a single ticket with action buttons.
 */

import { memo, useCallback, type FC } from 'react';
import { TableRow, TableCell, Box, IconButton } from '@mui/material';
import { Print as PrintIcon, Cancel as CancelIcon, Send as SendIcon } from '@mui/icons-material';
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
        backgroundColor: isSelected ? 'rgba(81, 203, 206, 0.15)' : 'inherit',
        borderLeft: isSelected ? '3px solid #51cbce' : '3px solid transparent',
        '&:hover': { backgroundColor: isSelected ? 'rgba(81, 203, 206, 0.25)' : 'action.hover' },
      }}
      onClick={handleRowClick}
    >
      <TableCell>{ticket.numero}</TableCell>
      <TableCell>{ticket.fecha}</TableCell>
      <TableCell>{ticket.usuario}</TableCell>
      <TableCell>{formatCurrency(ticket.monto)}</TableCell>
      <TableCell>{formatCurrency(ticket.premio)}</TableCell>
      <TableCell>{ticket.fechaCancelacion || '-'}</TableCell>
      <TableCell sx={{ color: getEstadoColor(ticket.estado) }}>
        {ticket.estado}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <IconButton size="small" color="primary" onClick={handlePrintClick} title="Imprimir ticket">
            <PrintIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info" onClick={handleSendClick} title="Enviar ticket">
            <SendIcon fontSize="small" />
          </IconButton>
          {ticket.estado !== 'Cancelado' && (
            <IconButton size="small" color="error" onClick={handleCancelClick} title="Cancelar ticket">
              <CancelIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
});

TicketRow.displayName = 'TicketRow';

export default TicketRow;
