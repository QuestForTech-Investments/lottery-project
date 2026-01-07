/**
 * FiltersSection Component
 *
 * Date, zone, and group filters for daily sales.
 */

import { memo, type FC } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import { COMPACT_INPUT_STYLE, COMPACT_SELECT_STYLE } from '../constants';
import type { FiltersSectionProps } from '../types';

const FiltersSection: FC<FiltersSectionProps> = memo(({
  selectedDate,
  zones,
  selectedZones,
  selectedGroup,
  onDateChange,
  onZoneChange,
  onGroupChange,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {/* Date Filter */}
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          Fecha
        </Typography>
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          sx={{ width: 200, ...COMPACT_INPUT_STYLE }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Zones Filter */}
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          Zonas
        </Typography>
        <FormControl sx={{ minWidth: 200, ...COMPACT_SELECT_STYLE }} size="small">
          <Select
            multiple
            value={selectedZones}
            onChange={onZoneChange}
            input={<OutlinedInput />}
            renderValue={(selected) => {
              if (selected.length === 1) {
                const zone = zones.find(z => (z.zoneId || z.id) === selected[0]);
                return zone?.zoneName || zone?.name || '1 seleccionada';
              }
              return `${selected.length} seleccionadas`;
            }}
          >
            {zones.map((zone) => {
              const zoneId = zone.zoneId || zone.id || 0;
              return (
                <MenuItem key={zoneId} value={zoneId}>
                  <Checkbox checked={selectedZones.indexOf(zoneId) > -1} />
                  <ListItemText primary={zone.zoneName || zone.name} />
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>

      {/* Group Filter */}
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          Grupo
        </Typography>
        <FormControl sx={{ minWidth: 150, ...COMPACT_SELECT_STYLE }} size="small">
          <Select
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Seleccione</MenuItem>
            <MenuItem value="group1">Grupo 1</MenuItem>
            <MenuItem value="group2">Grupo 2</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
});

FiltersSection.displayName = 'FiltersSection';

export default FiltersSection;
