/**
 * TotalsPanel Component
 *
 * Displays ticket totals (amounts, prizes, pending).
 */

import { memo, type FC } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { STYLES } from '../constants';
import type { TotalsPanelProps } from '../types';

const TotalsPanel: FC<TotalsPanelProps> = memo(({ totals }) => {
  return (
    <Box sx={STYLES.totalsContainer}>
      <Paper sx={STYLES.totalsPanel} elevation={0}>
        <Typography component="h3" sx={STYLES.totalsText}>
          Monto total: {formatCurrency(totals.montoTotal)}
        </Typography>
        <Typography component="h3" sx={STYLES.totalsText}>
          Total de premios: {formatCurrency(totals.totalPremios)}
        </Typography>
        <Typography component="h3" sx={STYLES.totalsText}>
          Total pendiente de pago: {formatCurrency(totals.totalPendiente)}
        </Typography>
      </Paper>
    </Box>
  );
});

TotalsPanel.displayName = 'TotalsPanel';

export default TotalsPanel;
