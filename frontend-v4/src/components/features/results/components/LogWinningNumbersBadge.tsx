/**
 * LogWinningNumbersBadge Component
 *
 * Renders log winning numbers using pre-parsed fields from API.
 */

import { memo, type FC } from 'react';
import { Box, Typography } from '@mui/material';
import type { ResultLogDto } from '@services/resultsService';

interface NumberBadgeProps {
  label: string;
  value: string;
}

const NumberBadge: FC<NumberBadgeProps> = memo(({ label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
    <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}>
      {label}
    </Typography>
    <Box
      sx={{
        bgcolor: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        px: 0.8,
        py: 0.2,
        minWidth: '28px',
        textAlign: 'center',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '12px', color: '#333' }}>
        {value}
      </Typography>
    </Box>
  </Box>
));

NumberBadge.displayName = 'NumberBadge';

interface LogWinningNumbersBadgeProps {
  log: ResultLogDto;
}

const LogWinningNumbersBadge: FC<LogWinningNumbersBadgeProps> = memo(({ log }) => {
  const labels: { label: string; value: string }[] = [];

  // Add main numbers (1ra, 2da, 3ra) if present
  if (log.num1) labels.push({ label: '1ra', value: log.num1 });
  if (log.num2) labels.push({ label: '2da', value: log.num2 });
  if (log.num3) labels.push({ label: '3ra', value: log.num3 });

  // Add USA lottery bet types if present
  if (log.cash3) labels.push({ label: 'Pick 3', value: log.cash3 });
  if (log.play4) labels.push({ label: 'Pick 4', value: log.play4 });
  if (log.pick5) labels.push({ label: 'Pick 5', value: log.pick5 });

  // Add derived bet types (Bolita and Singulaccion) if present
  if (log.bolita1) labels.push({ label: 'Bolita 1', value: log.bolita1 });
  if (log.bolita2) labels.push({ label: 'Bolita 2', value: log.bolita2 });
  if (log.singulaccion1) labels.push({ label: 'Singulaccion 1', value: log.singulaccion1 });
  if (log.singulaccion2) labels.push({ label: 'Singulaccion 2', value: log.singulaccion2 });
  if (log.singulaccion3) labels.push({ label: 'Singulaccion 3', value: log.singulaccion3 });

  // If no labels, show fallback
  if (labels.length === 0) {
    return <>{log.winningNumbers || '-'}</>;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
      {labels.map((item, idx) => (
        <NumberBadge key={idx} label={item.label} value={item.value} />
      ))}
    </Box>
  );
});

LogWinningNumbersBadge.displayName = 'LogWinningNumbersBadge';

export default LogWinningNumbersBadge;
