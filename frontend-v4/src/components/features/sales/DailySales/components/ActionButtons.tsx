/**
 * ActionButtons Component
 *
 * Pill-style action buttons for daily sales.
 */

import { memo, type FC } from 'react';
import { Box, Button } from '@mui/material';
import { BUTTON_PILL_STYLE } from '../constants';
import type { ActionButtonsProps } from '../types';

// Responsive button style - teal on mobile, default on desktop
const responsiveButtonStyle = {
  ...BUTTON_PILL_STYLE,
  width: { xs: '100%', sm: 'auto' },
  py: { xs: 1, sm: 0.5 },
  background: { xs: 'linear-gradient(135deg, #319795 0%, #2c7a7b 100%)', sm: undefined },
  '&:hover': {
    background: { xs: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)', sm: undefined },
  },
};

const ActionButtons: FC<ActionButtonsProps> = memo(({
  loading,
  onSearch,
  onExportPdf,
  onExportCsv,
  onProcessTodayTickets,
  onProcessYesterdaySales,
}) => {
  return (
    <Box sx={{
      display: 'flex',
      gap: 1,
      mb: 3,
      flexWrap: 'wrap',
      flexDirection: { xs: 'column', sm: 'row' },
    }}>
      <Button
        variant="contained"
        onClick={onSearch}
        disabled={loading}
        size="small"
        sx={responsiveButtonStyle}
      >
        Ver ventas
      </Button>
      <Button
        variant="contained"
        onClick={onExportPdf}
        size="small"
        sx={responsiveButtonStyle}
      >
        PDF
      </Button>
      <Button
        variant="contained"
        onClick={onExportCsv}
        size="small"
        sx={responsiveButtonStyle}
      >
        CSV
      </Button>
      <Button
        variant="contained"
        onClick={onProcessTodayTickets}
        size="small"
        sx={responsiveButtonStyle}
      >
        Procesar tickets de hoy
      </Button>
      <Button
        variant="contained"
        onClick={onProcessYesterdaySales}
        size="small"
        sx={responsiveButtonStyle}
      >
        Procesar ventas de ayer
      </Button>
    </Box>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
