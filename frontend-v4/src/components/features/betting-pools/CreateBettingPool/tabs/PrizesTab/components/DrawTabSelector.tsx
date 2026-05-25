import React, { memo, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, IconButton, TextField, InputAdornment, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight, Search, Clear } from '@mui/icons-material';
import type { Draw } from '../types';

interface DrawTabSelectorProps {
  draws: Draw[];
  activeDraw: string;
  loadingDraws: boolean;
  onDrawSelect: (drawId: string) => void;
}

const DrawTabSelector: React.FC<DrawTabSelectorProps> = memo(({
  draws,
  activeDraw,
  loadingDraws,
  onDrawSelect,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  // On phones the search + chevrons + chip row + count crammed onto one line
  // left so little space for the chips that even "General" was clipped to "G".
  // Switch to a 2-row layout (search on top, chips row below) when isMobile.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  const filteredDraws = useMemo(() => {
    if (!search.trim()) return draws;
    const lower = search.toLowerCase();
    return draws.filter(d => d.id === 'general' || d.name.toLowerCase().includes(lower));
  }, [draws, search]);

  const scrollLeft = (): void => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (): void => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Mobile-only: search occupies its own row so the chip strip below
          gets the full width to show full draw names. */}
      {isMobile && (
        <TextField
          size="small"
          fullWidth
          placeholder={t('createBettingPool.prizes.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              height: 36,
              fontSize: '0.85rem',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0 }}>
                <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end" sx={{ ml: 0 }}>
                <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                  <Clear sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      )}

      {/* Search + Chips in one row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Desktop-only: search inline with the chip strip. */}
        {!isMobile && (
          <TextField
            size="small"
            placeholder={t('createBettingPool.prizes.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              minWidth: 160,
              maxWidth: 180,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                height: 36,
                fontSize: '0.85rem',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0 }}>
                  <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end" sx={{ ml: 0 }}>
                  <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                    <Clear sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        )}

        {/* Scroll Left */}
        <IconButton
          onClick={scrollLeft}
          disabled={loadingDraws}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            width: 32,
            height: 32,
            flexShrink: 0,
          }}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>

        {/* Chips */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            display: 'flex',
            gap: 0.75,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            py: 0.5,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'primary.light',
              borderRadius: 2,
            },
          }}
        >
          {loadingDraws ? (
            <Chip label={t('createBettingPool.prizes.loadingDraws')} variant="outlined" size="small" />
          ) : filteredDraws.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 0.5, px: 1 }}>
              {t('createBettingPool.prizes.noResults')}
            </Typography>
          ) : (
            filteredDraws.map((draw) => (
              <Chip
                key={draw.id}
                label={draw.name}
                onClick={() => onDrawSelect(draw.id)}
                color={activeDraw === draw.id ? 'primary' : 'default'}
                variant={activeDraw === draw.id ? 'filled' : 'outlined'}
                size="small"
                sx={{
                  cursor: 'pointer',
                  fontWeight: activeDraw === draw.id ? 600 : 400,
                  whiteSpace: 'nowrap',
                  height: 30,
                }}
              />
            ))
          )}
        </Box>

        {/* Scroll Right */}
        <IconButton
          onClick={scrollRight}
          disabled={loadingDraws}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            width: 32,
            height: 32,
            flexShrink: 0,
          }}
        >
          <ChevronRight fontSize="small" />
        </IconButton>

        {/* Count badge */}
        {search && (
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            {filteredDraws.length}/{draws.length}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

DrawTabSelector.displayName = 'DrawTabSelector';

export default DrawTabSelector;
