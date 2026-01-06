/**
 * DrawsTab Component
 *
 * Draws selection and early closing settings.
 */

import { memo, type FC } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import type { DrawsTabProps } from '../types';

const DrawsTab: FC<DrawsTabProps> = memo(({ draws, formData, onInputChange }) => {
  return (
    <Box>
      {/* Sorteos activos */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Sorteos activos
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
          <Grid container spacing={1}>
            {draws.map(draw => {
              const id = draw.drawId || draw.id || 0;
              const isActive = formData.activeDraws?.includes(id) || false;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isActive}
                        onChange={(e) => {
                          const newActiveDraws = e.target.checked
                            ? [...(formData.activeDraws || []), id]
                            : (formData.activeDraws || []).filter(drawId => drawId !== id);
                          onInputChange('activeDraws', newActiveDraws);
                        }}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {draw.drawName || draw.name}
                      </Typography>
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Box>

      {/* Aplicar cierre anticipado */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>Aplicar cierre anticipado a</Typography>
        <FormControl sx={{ minWidth: 300 }} size="small">
          <Select
            value={formData.earlyClosingDrawId || ''}
            displayEmpty
            onChange={(e) => onInputChange('earlyClosingDrawId', e.target.value)}
          >
            <MenuItem value="">
              <em>Ninguno</em>
            </MenuItem>
            {draws.map(draw => (
              <MenuItem key={draw.drawId || draw.id} value={draw.drawId || draw.id}>
                {draw.drawName || draw.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
});

DrawsTab.displayName = 'DrawsTab';

export default DrawsTab;
