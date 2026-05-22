/**
 * StatusToggle Component
 *
 * Toggle button group for filtering tickets by status.
 */

import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import type { StatusToggleProps } from '../types';

const StatusToggle: FC<StatusToggleProps> = memo(({ filtroEstado, counts, onFilterChange }) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Typography
        variant="subtitle1"
        sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500 }}
      >
        {t('common.filter')}
      </Typography>
      <ToggleButtonGroup
        exclusive
        value={filtroEstado}
        onChange={onFilterChange}
        size="small"
        sx={{
          border: '2px solid #8b5cf6',
          borderRadius: '6px',
          overflow: 'hidden',
          flexWrap: 'wrap',
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
        <ToggleButton value="todos">{t('common.all')} ({counts.todos})</ToggleButton>
        <ToggleButton value="ganadores">{t('ticketStatus.winner')} ({counts.ganadores})</ToggleButton>
        <ToggleButton value="pendientes">{t('ticketStatus.pending')} ({counts.pendientes})</ToggleButton>
        <ToggleButton value="perdedores">{t('ticketStatus.loser')} ({counts.perdedores})</ToggleButton>
        <ToggleButton value="cancelados">{t('ticketStatus.cancelled')} ({counts.cancelados})</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
});

StatusToggle.displayName = 'StatusToggle';

export default StatusToggle;
