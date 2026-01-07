/**
 * PrizesSubTab Component
 *
 * Sub-tab content for prizes configuration.
 */

import { memo, useCallback, type FC, type ChangeEvent } from 'react';
import { Box, Typography, TextField, Grid } from '@mui/material';
import type { PrizesSubTabProps, PrizesData } from '../types';
import { PRIZE_FIELDS_CONFIG } from '../constants';

const PrizesSubTab: FC<PrizesSubTabProps> = memo(({ prizesData, onPrizeChange }) => {
  const renderPrizesFields = useCallback(
    (title: string, gameType: keyof PrizesData, fields: Record<string, string>) => {
      const prizeData = prizesData[gameType] as Record<string, string>;
      return (
        <Box key={gameType} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mb: 1, color: '#2c2c2c' }}>
            {title}
          </Typography>
          <Grid container spacing={1.5}>
            {Object.entries(fields).map(([fieldKey, fieldLabel]) => (
              <Grid item xs={12} sm={6} md={4} key={fieldKey}>
                <TextField
                  fullWidth
                  label={fieldLabel}
                  value={prizeData?.[fieldKey] || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onPrizeChange(gameType, fieldKey, e.target.value)}
                  placeholder="0"
                  size="small"
                  InputProps={{
                    sx: { textAlign: 'right' }
                  }}
                  sx={{
                    '& input': { textAlign: 'right' }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    },
    [prizesData, onPrizeChange]
  );

  return (
    <Box>
      {PRIZE_FIELDS_CONFIG.map(({ title, gameType, fields }) =>
        renderPrizesFields(title, gameType, fields)
      )}
    </Box>
  );
});

PrizesSubTab.displayName = 'PrizesSubTab';

export default PrizesSubTab;
