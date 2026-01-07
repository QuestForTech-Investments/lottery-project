/**
 * ActionButtons Component
 *
 * Pill-style action buttons for daily sales.
 */

import { memo, type FC } from 'react';
import { Box, Button } from '@mui/material';
import { BUTTON_PILL_STYLE } from '../constants';
import type { ActionButtonsProps } from '../types';

const ActionButtons: FC<ActionButtonsProps> = memo(({
  loading,
  onSearch,
  onExportPdf,
  onExportCsv,
  onProcessTodayTickets,
  onProcessYesterdaySales,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
      <Button
        variant="contained"
        onClick={onSearch}
        disabled={loading}
        size="small"
        sx={BUTTON_PILL_STYLE}
      >
        Ver ventas
      </Button>
      <Button
        variant="contained"
        onClick={onExportPdf}
        size="small"
        sx={BUTTON_PILL_STYLE}
      >
        PDF
      </Button>
      <Button
        variant="contained"
        onClick={onExportCsv}
        size="small"
        sx={BUTTON_PILL_STYLE}
      >
        CSV
      </Button>
      <Button
        variant="contained"
        onClick={onProcessTodayTickets}
        size="small"
        sx={BUTTON_PILL_STYLE}
      >
        Procesar tickets de hoy
      </Button>
      <Button
        variant="contained"
        onClick={onProcessYesterdaySales}
        size="small"
        sx={BUTTON_PILL_STYLE}
      >
        Procesar ventas de ayer
      </Button>
    </Box>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
