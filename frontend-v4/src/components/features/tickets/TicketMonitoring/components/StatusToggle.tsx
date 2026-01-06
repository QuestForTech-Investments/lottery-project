/**
 * StatusToggle Component
 *
 * Toggle button group for filtering tickets by status.
 */

import { memo, type FC } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import type { StatusToggleProps } from '../types';

const StatusToggle: FC<StatusToggleProps> = memo(({ filtroEstado, counts, onFilterChange }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', mb: 1, display: 'block' }}
      >
        Filtrar
      </Typography>
      <ToggleButtonGroup
        exclusive
        value={filtroEstado}
        onChange={onFilterChange}
        size="small"
        sx={{ flexWrap: 'wrap' }}
      >
        <ToggleButton value="todos">TODOS ({counts.todos})</ToggleButton>
        <ToggleButton value="ganadores">GANADORES ({counts.ganadores})</ToggleButton>
        <ToggleButton value="pendientes">PENDIENTES ({counts.pendientes})</ToggleButton>
        <ToggleButton value="perdedores">PERDEDORES ({counts.perdedores})</ToggleButton>
        <ToggleButton value="cancelados">CANCELADO ({counts.cancelados})</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
});

StatusToggle.displayName = 'StatusToggle';

export default StatusToggle;
