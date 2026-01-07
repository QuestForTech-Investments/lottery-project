/**
 * WinningNumbersBadge Component
 *
 * Renders winning numbers with styled badges.
 */

import { memo, type FC } from 'react';
import { Box, Typography } from '@mui/material';

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

interface WinningNumbersBadgeProps {
  winningNumbers: string;
}

/**
 * Parse and render winning numbers with formatted badges
 */
const WinningNumbersBadge: FC<WinningNumbersBadgeProps> = memo(({ winningNumbers }) => {
  if (!winningNumbers) return <>-</>;

  // Check if already formatted with labels (e.g., "1ra: 40, 2da: 56, 3ra: 91")
  if (winningNumbers.includes(':') || winningNumbers.includes('1ra')) {
    const parts = winningNumbers.split(/[,;]/).map(p => p.trim()).filter(Boolean);
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        {parts.map((part, idx) => {
          const match = part.match(/^(.+?)[:.]?\s*(\d+)$/);
          if (match) {
            const [, label, value] = match;
            return <NumberBadge key={idx} label={label.trim()} value={value} />;
          }
          return null;
        })}
      </Box>
    );
  }

  // Parse raw numbers (e.g., "405691" = 40, 56, 91)
  const cleanNumbers = winningNumbers.replace(/\D/g, '');

  if (cleanNumbers.length >= 6) {
    const labels: { label: string; value: string }[] = [
      { label: '1ra', value: cleanNumbers.substring(0, 2) },
      { label: '2da', value: cleanNumbers.substring(2, 4) },
      { label: '3ra', value: cleanNumbers.substring(4, 6) },
    ];

    const remaining = cleanNumbers.substring(6);

    // Parse additional numbers (Pick 3, Pick 4, Pick 5)
    if (remaining.length >= 3) {
      labels.push({ label: 'Pick 3', value: remaining.substring(0, 3) });
      const afterCash3 = remaining.substring(3);
      if (afterCash3.length >= 4) {
        labels.push({ label: 'Pick 4', value: afterCash3.substring(0, 4) });
        const afterPlay4 = afterCash3.substring(4);
        if (afterPlay4.length >= 5) {
          labels.push({ label: 'Pick 5', value: afterPlay4.substring(0, 5) });
        }
      }
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        {labels.map((item, idx) => (
          <NumberBadge key={idx} label={item.label} value={item.value} />
        ))}
      </Box>
    );
  }

  // Fallback: show raw string
  return <>{winningNumbers}</>;
});

WinningNumbersBadge.displayName = 'WinningNumbersBadge';

export default WinningNumbersBadge;
