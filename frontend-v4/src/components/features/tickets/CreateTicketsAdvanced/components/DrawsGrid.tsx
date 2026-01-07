/**
 * DrawsGrid Component
 *
 * Displays available draws as clickable chips for multi-selection.
 */

import { memo, type FC } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import type { Draw } from '../types';
import { COLORS } from '../constants';

interface DrawsGridProps {
  draws: Draw[];
  selectedDraws: Draw[];
  onDrawToggle: (draw: Draw) => void;
}

const DrawsGrid: FC<DrawsGridProps> = memo(({ draws, selectedDraws, onDrawToggle }) => {
  return (
    <Paper sx={{ padding: 2, marginBottom: 3, bgcolor: COLORS.background }}>
      <Typography variant="subtitle2" sx={{ marginBottom: 1.5, fontWeight: 'bold' }}>
        Sorteos Disponibles (Seleccione uno o varios)
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {draws.map(draw => {
          const isSelected = selectedDraws.some(d => d.drawId === draw.drawId);
          return (
            <Chip
              key={draw.drawId}
              label={draw.drawName}
              onClick={() => onDrawToggle(draw)}
              sx={{
                bgcolor: isSelected ? COLORS.primary : '#fff',
                color: isSelected ? '#fff' : '#333',
                border: isSelected ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.primary}`,
                fontWeight: isSelected ? 'bold' : 'normal',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: isSelected ? COLORS.primaryHover : '#e0f7f7'
                }
              }}
            />
          );
        })}
      </Box>
    </Paper>
  );
});

DrawsGrid.displayName = 'DrawsGrid';

export default DrawsGrid;
