/**
 * FilterToggles Component
 *
 * Toggle button group for filter type selection.
 */

import { memo, type FC } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { FILTER_OPTIONS } from '../constants';
import type { FilterTogglesProps } from '../types';

const FilterToggles: FC<FilterTogglesProps> = memo(({ filterType, onFilterChange }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
        Filtros
      </Typography>
      <ToggleButtonGroup
        value={filterType}
        exclusive
        onChange={(_, newValue) => newValue && onFilterChange(newValue)}
        size="small"
        sx={{
          border: '2px solid #8b5cf6',
          borderRadius: '6px',
          overflow: 'hidden',
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRight: '2px solid #8b5cf6',
            borderRadius: 0,
            px: 2,
            py: 0.6,
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            color: '#64748b',
            backgroundColor: '#fff',
            transition: 'all 0.15s ease',
            '&:last-of-type': {
              borderRight: 'none',
            },
            '&:hover': {
              backgroundColor: '#f8f7ff',
              color: '#7c3aed',
            },
            '&.Mui-selected': {
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              },
            },
          },
        }}
      >
        {FILTER_OPTIONS.map(option => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
});

FilterToggles.displayName = 'FilterToggles';

export default FilterToggles;
