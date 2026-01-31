import React, { memo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Dices } from 'lucide-react';
import type { Draw, BettingPool } from '../types';

interface DrawsGridProps {
  draws: Draw[];
  selectedDraw: Draw | null;
  selectedDraws: Draw[];
  selectedPool: BettingPool | null;
  multiLotteryMode: boolean;
  loadingDraws: boolean;
  loadingAllowedDraws: boolean;
  allowedDrawIds: Set<number>;
  onDrawClick: (draw: Draw) => void;
}

/**
 * DrawsGrid Component
 *
 * Displays a grid of available lottery draws for selection.
 */
const DrawsGrid: React.FC<DrawsGridProps> = memo(({
  draws,
  selectedDraw,
  selectedDraws,
  selectedPool,
  multiLotteryMode,
  loadingDraws,
  loadingAllowedDraws,
  allowedDrawIds,
  onDrawClick,
}) => {
  // Filter draws based on betting pool restrictions
  const filteredDraws = draws.filter((draw) => {
    if (!selectedPool) return true;
    if (allowedDrawIds.size === 0) return true;
    return allowedDrawIds.has(draw.id);
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        mb: 2,
        p: 1,
        bgcolor: 'rgba(255,255,255,0.5)',
        borderRadius: 1,
        minHeight: 60,
        alignItems: loadingDraws ? 'center' : 'flex-start',
        justifyContent: loadingDraws ? 'center' : 'flex-start',
      }}
    >
      {loadingDraws ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} sx={{ color: '#8b5cf6' }} />
          <Typography sx={{ fontSize: '12px', color: '#666' }}>Cargando sorteos...</Typography>
        </Box>
      ) : filteredDraws.length === 0 ? (
        <Typography sx={{ fontSize: '12px', color: '#666' }}>No hay sorteos disponibles</Typography>
      ) : (
        filteredDraws.map((draw) => {
          const isSelected = multiLotteryMode
            ? selectedDraws.some(s => s.id === draw.id)
            : selectedDraw?.id === draw.id;
          const isDisabled = !selectedPool || draw.disabled || loadingAllowedDraws;

          return (
            <Box
              key={draw.id}
              onClick={() => !isDisabled && onDrawClick(draw)}
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor: isSelected ? '#fff' : isDisabled ? '#bdbdbd' : draw.color,
                color: isSelected ? '#333' : 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '4px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 0.75,
                border: isSelected ? '4px solid #000' : '1px solid transparent',
                boxShadow: isSelected ? '0 3px 8px rgba(0,0,0,0.35)' : 'none',
                transition: 'all 0.15s ease',
                pointerEvents: isDisabled ? 'none' : 'auto',
                '&:hover': {
                  opacity: isDisabled ? 0.5 : 0.85,
                  transform: isDisabled ? 'none' : 'translateY(-1px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: draw.imageUrl ? 'transparent' : 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              >
                {draw.imageUrl ? (
                  <Box
                    component="img"
                    src={draw.imageUrl}
                    alt=""
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Dices size={16} color={isSelected ? '#666' : 'white'} style={{ opacity: 0.8 }} />
                )}
              </Box>
              {draw.name}
            </Box>
          );
        })
      )}
    </Box>
  );
});

DrawsGrid.displayName = 'DrawsGrid';

export default DrawsGrid;
