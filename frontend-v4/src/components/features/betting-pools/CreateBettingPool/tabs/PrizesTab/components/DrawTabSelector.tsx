import React, { memo, useRef } from 'react';
import { Box, Chip, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import type { Draw } from '../types';

interface DrawTabSelectorProps {
  draws: Draw[];
  activeDraw: string;
  loadingDraws: boolean;
  onDrawSelect: (drawId: string) => void;
}

/**
 * DrawTabSelector Component
 *
 * Horizontal scrollable selector for lottery draws.
 * Shows chips for each draw with scroll buttons.
 */
const DrawTabSelector: React.FC<DrawTabSelectorProps> = memo(({
  draws,
  activeDraw,
  loadingDraws,
  onDrawSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (): void => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = (): void => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Box sx={{ mb: 3, position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Scroll Left Button */}
      <IconButton
        onClick={scrollLeft}
        disabled={loadingDraws}
        size="small"
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <ChevronLeft />
      </IconButton>

      {/* Draw Tabs Container */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          pb: 1.5,
          '&::-webkit-scrollbar': {
            height: 6
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'action.hover',
            borderRadius: 1
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'primary.main',
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }
        }}
      >
        {loadingDraws ? (
          <Chip label="Cargando sorteos..." variant="outlined" />
        ) : (
          draws.map((draw) => (
            <Chip
              key={draw.id}
              label={draw.name}
              onClick={() => onDrawSelect(draw.id)}
              color={activeDraw === draw.id ? 'primary' : 'default'}
              variant={activeDraw === draw.id ? 'filled' : 'outlined'}
              sx={{
                cursor: 'pointer',
                fontWeight: activeDraw === draw.id ? 'bold' : 'normal',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            />
          ))
        )}
      </Box>

      {/* Scroll Right Button */}
      <IconButton
        onClick={scrollRight}
        disabled={loadingDraws}
        size="small"
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
});

DrawTabSelector.displayName = 'DrawTabSelector';

export default DrawTabSelector;
