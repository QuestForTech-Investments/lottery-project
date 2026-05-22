/**
 * TotalsPanel Component
 *
 * Displays ticket totals (amounts, prizes, pending).
 */

import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography } from '@mui/material';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { STYLES } from '../constants';
import type { TotalsPanelProps } from '../types';

const TotalsPanel: FC<TotalsPanelProps> = memo(({ totals }) => {
  const { t } = useTranslation();
  return (
    <Box sx={STYLES.totalsContainer}>
      <Paper sx={STYLES.totalsPanel} elevation={0}>
        <Typography component="h3" sx={STYLES.totalsText}>
          {t('tickets.monitoring.totalAmount')}: {formatCurrency(totals.montoTotal)}
        </Typography>
        <Typography component="h3" sx={STYLES.totalsText}>
          {t('tickets.detail.totalPrizes')}: {formatCurrency(totals.totalPremios)}
        </Typography>
        <Typography component="h3" sx={STYLES.totalsText}>
          {t('tickets.monitoring.totalPending')}: {formatCurrency(totals.totalPendiente)}
        </Typography>
      </Paper>
    </Box>
  );
});

TotalsPanel.displayName = 'TotalsPanel';

export default TotalsPanel;
