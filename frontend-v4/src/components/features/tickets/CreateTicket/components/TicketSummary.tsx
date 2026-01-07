/**
 * TicketSummary Component
 *
 * Summary totals and action buttons.
 */

import { memo, type FC } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Receipt, RotateCcw } from 'lucide-react';
import type { TicketSummaryProps } from '../types';
import { SECTION_TITLE_STYLE, PRIMARY_COLOR, CREATE_BUTTON_STYLE, RESET_BUTTON_STYLE } from '../constants';

const TicketSummary: FC<TicketSummaryProps> = memo(({
  linesCount,
  totals,
  onCreateTicket,
  onReset,
}) => (
  <Paper sx={{ padding: 3, bgcolor: '#e9ecef' }}>
    <Typography variant="h6" sx={SECTION_TITLE_STYLE}>
      Resumen del Ticket
    </Typography>

    <Box sx={{ marginBottom: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
        <Typography><strong>Total Lineas:</strong></Typography>
        <Typography>{linesCount}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
        <Typography><strong>Total Apostado:</strong></Typography>
        <Typography>${totals.totalBet}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
        <Typography><strong>Comision (10%):</strong></Typography>
        <Typography sx={{ color: '#dc3545' }}>-${totals.totalCommission}</Typography>
      </Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: 2,
        borderTop: `2px solid ${PRIMARY_COLOR}`
      }}>
        <Typography variant="h6"><strong>TOTAL A COBRAR:</strong></Typography>
        <Typography variant="h6" sx={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}>
          ${totals.grandTotal}
        </Typography>
      </Box>
    </Box>

    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        fullWidth
        variant="contained"
        startIcon={<Receipt size={20} />}
        onClick={onCreateTicket}
        disabled={linesCount === 0}
        sx={CREATE_BUTTON_STYLE(linesCount > 0)}
      >
        CREAR TICKET
      </Button>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<RotateCcw size={20} />}
        onClick={onReset}
        sx={RESET_BUTTON_STYLE}
      >
        LIMPIAR
      </Button>
    </Box>
  </Paper>
));

TicketSummary.displayName = 'TicketSummary';

export default TicketSummary;
