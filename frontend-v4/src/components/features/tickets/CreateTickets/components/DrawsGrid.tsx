import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Autocomplete,
  TextField,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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
  const { t } = useTranslation();
  const theme = useTheme();
  // Phones can't fit the full draws-as-chips grid — too many sorteos. Swap to
  // a searchable Autocomplete that supports the same single/multi selection
  // and disabled states as the desktop grid.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Filter draws based on betting pool restrictions
  const filteredDraws = draws.filter((draw) => {
    if (!selectedPool) return true;
    if (allowedDrawIds.size === 0) return true;
    return allowedDrawIds.has(draw.id);
  });

  if (isMobile) {
    if (loadingDraws) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, p: 1.5, mb: 2, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1, minHeight: 60 }}>
          <CircularProgress size={20} sx={{ color: '#8b5cf6' }} />
          <Typography sx={{ fontSize: '12px', color: '#666' }}>{t('tickets.create.loadingDraws')}</Typography>
        </Box>
      );
    }
    if (filteredDraws.length === 0) {
      return (
        <Box sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
          <Typography sx={{ fontSize: '12px', color: '#666' }}>{t('tickets.create.noDrawsAvailable')}</Typography>
        </Box>
      );
    }

    const isOptionDisabled = (draw: Draw): boolean => {
      const noPool = !selectedPool;
      return noPool || !!draw.disabled || loadingAllowedDraws;
    };

    if (multiLotteryMode) {
      return (
        <Box sx={{ mb: 2 }}>
          <Autocomplete
            multiple
            options={filteredDraws}
            value={selectedDraws}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            getOptionDisabled={isOptionDisabled}
            disableCloseOnSelect
            // We pipe each toggle through onDrawClick so the parent state and
            // side effects stay identical to the desktop grid.
            onChange={(_, newValue, _reason, details) => {
              const target = details?.option;
              if (target) onDrawClick(target);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  size="small"
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.id}
                  sx={{ bgcolor: option.color || '#8b5cf6', color: '#fff', fontWeight: 600, fontSize: '11px' }}
                />
              ))
            }
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '3px',
                    overflow: 'hidden',
                    bgcolor: option.imageUrl ? 'transparent' : option.color || '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {option.imageUrl ? (
                    <Box component="img" src={option.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Dices size={14} color="white" />
                  )}
                </Box>
                <Box sx={{ flex: 1, fontSize: '14px', textTransform: 'uppercase' }}>{option.name}</Box>
                {option.isClosed && (
                  <Typography component="span" sx={{ fontSize: '10px', color: '#888' }}>(Cerrado)</Typography>
                )}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder={t('tickets.create.searchDrawPlaceholder', { defaultValue: 'Buscar sorteo…' })}
                sx={{ bgcolor: '#fff' }}
              />
            )}
          />
        </Box>
      );
    }

    // Single-select mode
    return (
      <Box sx={{ mb: 2 }}>
        <Autocomplete
          options={filteredDraws}
          value={selectedDraw}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          getOptionDisabled={isOptionDisabled}
          onChange={(_, newValue) => { if (newValue) onDrawClick(newValue); }}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '3px',
                  overflow: 'hidden',
                  bgcolor: option.imageUrl ? 'transparent' : option.color || '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {option.imageUrl ? (
                  <Box component="img" src={option.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Dices size={14} color="white" />
                )}
              </Box>
              <Box sx={{ flex: 1, fontSize: '14px', textTransform: 'uppercase' }}>{option.name}</Box>
              {option.isClosed && (
                <Typography component="span" sx={{ fontSize: '10px', color: '#888' }}>(Cerrado)</Typography>
              )}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder={t('tickets.create.searchDrawPlaceholder', { defaultValue: 'Buscar sorteo…' })}
              sx={{ bgcolor: '#fff' }}
            />
          )}
        />
      </Box>
    );
  }

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
          <Typography sx={{ fontSize: '12px', color: '#666' }}>{t('tickets.create.loadingDraws')}</Typography>
        </Box>
      ) : filteredDraws.length === 0 ? (
        <Typography sx={{ fontSize: '12px', color: '#666' }}>{t('tickets.create.noDrawsAvailable')}</Typography>
      ) : (
        filteredDraws.map((draw) => {
          const isSelected = multiLotteryMode
            ? selectedDraws.some(s => s.id === draw.id)
            : selectedDraw?.id === draw.id;
          const isClosed = !!draw.isClosed;
          const noPool = !selectedPool;
          const isDrawDisabled = draw.disabled || loadingAllowedDraws;
          const isClickable = !noPool && !isDrawDisabled;

          const c = draw.color;
          const isTooLight = !c || (c.length >= 7 && parseInt(c.slice(1, 3), 16) > 240 && parseInt(c.slice(3, 5), 16) > 240 && parseInt(c.slice(5, 7), 16) > 240);
          const drawColor = isTooLight ? '#607D8B' : c;

          return (
            <Box
              key={draw.id}
              onClick={() => isClickable && onDrawClick(draw)}
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor: isSelected ? '#fff' : drawColor,
                color: isSelected ? '#333' : 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '4px',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: isClickable ? 1 : 0.55,
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
                pointerEvents: isClickable ? 'auto' : 'none',
                '&:hover': {
                  opacity: isClickable ? 0.85 : undefined,
                  transform: isClickable ? 'translateY(-1px)' : 'none',
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
              {isClosed && (
                <Typography component="span" sx={{ fontSize: '9px', ml: 0.5, opacity: 0.8, fontWeight: 'normal' }}>
                  (Cerrado)
                </Typography>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
});

DrawsGrid.displayName = 'DrawsGrid';

export default DrawsGrid;
