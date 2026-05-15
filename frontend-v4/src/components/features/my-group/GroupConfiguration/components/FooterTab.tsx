/**
 * FooterTab Component
 *
 * Tab content for footer default lines (up to 8 lines, 30 chars each).
 * These defaults pre-populate new banca footers.
 */

import { memo, type FC } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import type { FooterTabProps, FooterData } from '../types';

const LINE_KEYS: (keyof FooterData)[] = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6', 'line7', 'line8'];

const FooterTab: FC<FooterTabProps> = memo(({ footerData, onFooterChange }) => (
  <Box>
    <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontSize: '18px', fontWeight: 600 }}>
      Pie de Página
    </Typography>

    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {LINE_KEYS.map((key, i) => {
        const value = footerData[key] || '';
        return (
          <TextField
            key={key}
            fullWidth
            label={`Línea ${i + 1}`}
            value={value}
            onChange={(e) => onFooterChange(key, e.target.value.slice(0, 30))}
            size="small"
            inputProps={{ maxLength: 30 }}
            helperText={`${value.length}/30`}
            sx={{ mb: 2 }}
          />
        );
      })}
    </Box>
  </Box>
));

FooterTab.displayName = 'FooterTab';

export default FooterTab;
