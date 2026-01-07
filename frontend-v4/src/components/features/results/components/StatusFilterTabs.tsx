/**
 * StatusFilterTabs Component
 *
 * Filter buttons for result status (all, pending, completed).
 */

import { memo, type FC } from 'react';
import { Box, Button } from '@mui/material';
import { COLORS } from '../constants';

export type StatusFilterType = 'all' | 'pending' | 'completed';

interface FilterCounts {
  all: number;
  pending: number;
  completed: number;
}

interface StatusFilterTabsProps {
  statusFilter: StatusFilterType;
  filterCounts: FilterCounts;
  onFilterChange: (filter: StatusFilterType) => void;
}

const StatusFilterTabs: FC<StatusFilterTabsProps> = memo(({
  statusFilter,
  filterCounts,
  onFilterChange,
}) => {
  const baseButtonStyle = {
    borderRadius: 20,
    textTransform: 'none',
    fontWeight: 600,
    px: 2,
    py: 0.5,
    fontSize: '13px',
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Button
        variant={statusFilter === 'all' ? 'contained' : 'outlined'}
        size="small"
        onClick={() => onFilterChange('all')}
        sx={{
          ...baseButtonStyle,
          bgcolor: statusFilter === 'all' ? COLORS.primary : 'transparent',
          borderColor: statusFilter === 'all' ? COLORS.primary : '#ccc',
          color: statusFilter === 'all' ? '#fff' : '#666',
          '&:hover': {
            bgcolor: statusFilter === 'all' ? COLORS.primaryHover : '#f5f5f5',
            borderColor: COLORS.primary,
          },
        }}
      >
        Todos ({filterCounts.all})
      </Button>
      <Button
        variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
        size="small"
        onClick={() => onFilterChange('pending')}
        sx={{
          ...baseButtonStyle,
          bgcolor: statusFilter === 'pending' ? '#f5a623' : 'transparent',
          borderColor: statusFilter === 'pending' ? '#f5a623' : '#ccc',
          color: statusFilter === 'pending' ? '#fff' : '#666',
          '&:hover': {
            bgcolor: statusFilter === 'pending' ? '#e69500' : '#fff8e1',
            borderColor: '#f5a623',
          },
        }}
      >
        Sin resultado ({filterCounts.pending})
      </Button>
      <Button
        variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
        size="small"
        onClick={() => onFilterChange('completed')}
        sx={{
          ...baseButtonStyle,
          bgcolor: statusFilter === 'completed' ? '#4caf50' : 'transparent',
          borderColor: statusFilter === 'completed' ? '#4caf50' : '#ccc',
          color: statusFilter === 'completed' ? '#fff' : '#666',
          '&:hover': {
            bgcolor: statusFilter === 'completed' ? '#43a047' : '#e8f5e9',
            borderColor: '#4caf50',
          },
        }}
      >
        Con resultado ({filterCounts.completed})
      </Button>
    </Box>
  );
});

StatusFilterTabs.displayName = 'StatusFilterTabs';

export default StatusFilterTabs;
