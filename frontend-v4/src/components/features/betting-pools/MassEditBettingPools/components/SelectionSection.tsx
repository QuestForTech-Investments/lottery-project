/**
 * SelectionSection Component
 *
 * Bottom section with chip-based selection for draws, pools, and zones.
 */

import { memo, type FC } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  FormControlLabel,
  Switch,
} from '@mui/material';
import type { SelectionSectionProps } from '../types';

const SelectionSection: FC<SelectionSectionProps> = memo(({
  draws,
  bettingPools,
  zones,
  selectedDraws,
  selectedBettingPools,
  selectedZones,
  updateGeneralValues,
  onDrawToggle,
  onPoolToggle,
  onZoneToggle,
  onUpdateGeneralValuesChange,
}) => {
  return (
    <>
      {/* Sorteos */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Sorteos
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflowY: 'auto' }}>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {draws.map(draw => {
              const id = draw.drawId || draw.id || 0;
              const isSelected = selectedDraws.includes(id);
              return (
                <Chip
                  key={id}
                  label={draw.drawName || draw.name}
                  onClick={() => onDrawToggle(id)}
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              );
            })}
          </Stack>
        </Paper>
      </Box>

      {/* Bancas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Bancas
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, maxHeight: 150, overflowY: 'auto' }}>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {bettingPools.map(pool => {
              const id = pool.bettingPoolId || pool.id || 0;
              const isSelected = selectedBettingPools.includes(id);
              return (
                <Chip
                  key={id}
                  label={pool.bettingPoolName || pool.name || `Pool ${id}`}
                  onClick={() => onPoolToggle(id)}
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              );
            })}
          </Stack>
        </Paper>
      </Box>

      {/* Zonas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Zonas
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, maxHeight: 150, overflowY: 'auto' }}>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {zones.map(zone => {
              const id = zone.zoneId || zone.id || 0;
              const isSelected = selectedZones.includes(id);
              return (
                <Chip
                  key={id}
                  label={zone.zoneName || zone.name}
                  onClick={() => onZoneToggle(id)}
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              );
            })}
          </Stack>
        </Paper>
      </Box>

      {/* Actualizar valores generales */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={updateGeneralValues}
              onChange={(e) => onUpdateGeneralValuesChange(e.target.checked)}
            />
          }
          label="Actualizar valores generales"
        />
      </Box>
    </>
  );
});

SelectionSection.displayName = 'SelectionSection';

export default SelectionSection;
