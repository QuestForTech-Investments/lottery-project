/**
 * TicketDetailPanel Component
 *
 * Side panel showing detailed ticket information including plays/lines.
 */

import { memo, type FC } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import type { TicketDetailPanelProps } from '../types';

const TicketDetailPanel: FC<TicketDetailPanelProps> = memo(({ ticket, onClose }) => {
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        bgcolor: '#51cbce',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          Ticket #{ticket.numero}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
        {/* Status Chip */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Chip
            label={ticket.estado}
            color={
              ticket.estado === 'Ganador' ? 'success' :
              ticket.estado === 'Cancelado' ? 'error' :
              ticket.estado === 'Pendiente' ? 'warning' : 'default'
            }
            size="medium"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
        </Box>

        {/* Ticket Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Información del Ticket
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Número</Typography>
              <Typography variant="body1" fontWeight="bold">{ticket.numero}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Usuario</Typography>
              <Typography variant="body1" fontWeight="bold">{ticket.usuario}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Fecha</Typography>
              <Typography variant="body1">{ticket.fecha}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Monto</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                {formatCurrency(ticket.monto)}
              </Typography>
            </Grid>
            {ticket.premio > 0 && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Premio</Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  {formatCurrency(ticket.premio)}
                </Typography>
              </Grid>
            )}
            {ticket.fechaCancelacion && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Fecha Cancelación</Typography>
                <Typography variant="body1" color="error.main">{ticket.fechaCancelacion}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Ticket Lines (Plays) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Jugadas del Ticket
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {ticket.lines && ticket.lines.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Sorteo</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Número</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tipo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Monto</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Premio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ticket.lines.map((line, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>{line.drawName || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{line.betNumber}</TableCell>
                    <TableCell>{line.betTypeName || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(line.betAmount)}</TableCell>
                    <TableCell align="right" sx={{ color: line.prizeAmount > 0 ? 'success.main' : 'inherit' }}>
                      {formatCurrency(line.prizeAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No hay jugadas disponibles
            </Typography>
          )}
        </Box>
      </Box>

      {/* Actions Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PrintIcon />}
          onClick={() => {/* TODO: Implement print */}}
        >
          Imprimir
        </Button>
        {ticket.estado !== 'Cancelado' && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CancelIcon />}
            onClick={() => {/* TODO: Implement cancel */}}
          >
            Cancelar
          </Button>
        )}
      </Box>
    </Paper>
  );
});

TicketDetailPanel.displayName = 'TicketDetailPanel';

export default TicketDetailPanel;
