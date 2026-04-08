import React, { memo, useRef, useState, useMemo } from 'react';
import { Box, Chip, IconButton, TextField, InputAdornment, Typography } from '@mui/material';
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
      {/* Search + Chips in one row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Search */}
        <TextField
          size="small"
          placeholder="Buscar..."
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
            <Chip label="Cargando sorteos..." variant="outlined" size="small" />
          ) : filteredDraws.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 0.5, px: 1 }}>
              Sin resultados
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
