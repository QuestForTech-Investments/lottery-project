/**
 * FootersTab Component
 *
 * Footer settings for ticket printing.
 */

import { memo, type FC } from 'react';
import { Box, Typography, TextField, Switch } from '@mui/material';
import type { FootersTabProps } from '../types';

const FootersTab: FC<FootersTabProps> = memo(({ formData, onInputChange }) => {
  return (
    <Box sx={{ maxWidth: 600 }}>
      {/* Footer automático */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>Footer automático</Typography>
        <Switch
          checked={formData.autoFooter}
          onChange={(e) => onInputChange('autoFooter', e.target.checked)}
        />
      </Box>

      {/* Primer pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>Primer pie de página</Typography>
        <TextField
          value={formData.footer1}
          onChange={(e) => onInputChange('footer1', e.target.value)}
          size="small"
          fullWidth
          placeholder="Texto del primer pie de página"
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer1 || '').length}/30`}
        />
      </Box>

      {/* Segundo pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>Segundo pie de página</Typography>
        <TextField
          value={formData.footer2}
          onChange={(e) => onInputChange('footer2', e.target.value)}
          size="small"
          fullWidth
          placeholder="Texto del segundo pie de página"
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer2 || '').length}/30`}
        />
      </Box>

      {/* Tercer pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>Tercer pie de página</Typography>
        <TextField
          value={formData.footer3}
          onChange={(e) => onInputChange('footer3', e.target.value)}
          size="small"
          fullWidth
          placeholder="Texto del tercer pie de página"
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer3 || '').length}/30`}
        />
      </Box>

      {/* Cuarto pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>Cuarto pie de página</Typography>
        <TextField
          value={formData.footer4}
          onChange={(e) => onInputChange('footer4', e.target.value)}
          size="small"
          fullWidth
          placeholder="Texto del cuarto pie de página"
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer4 || '').length}/30`}
        />
      </Box>
    </Box>
  );
});

FootersTab.displayName = 'FootersTab';

export default FootersTab;
