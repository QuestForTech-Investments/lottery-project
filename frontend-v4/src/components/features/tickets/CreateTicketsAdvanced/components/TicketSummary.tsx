/**
 * TicketSummary Component
 *
 * Displays the ticket summary with line count and grand total.
 */

import { memo, type FC } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { Draw } from '../types';
import { COLORS } from '../constants';

interface TicketSummaryProps {
  lineCount: number;
  grandTotal: number;
  selectedDraws: Draw[];
}

const TicketSummary: FC<TicketSummaryProps> = memo(({ lineCount, grandTotal, selectedDraws }) => {
  return (
    <Paper sx={{ padding: 2, marginBottom: 3, bgcolor: COLORS.summaryBg }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Jugadas: {lineCount}
          </Typography>
          {selectedDraws.length > 0 && (
            <Typography variant="caption" sx={{ color: '#666' }}>
              Sorteos seleccionados: {selectedDraws.map(d => d.drawName).join(', ')}
            </Typography>
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.primary }}>
          TOTAL: ${grandTotal.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
});

TicketSummary.displayName = 'TicketSummary';

export default TicketSummary;
