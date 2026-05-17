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
import { SELECT_ALL, applySelectAllToggle } from '../selectAllHelper';

const FiltersSection: FC<FiltersSectionProps> = memo(({
  selectedDate,
  zones,
  selectedZones,
  onDateChange,
  onZoneChange,
}) => {
  return (
    <Box sx={{
      display: 'flex',
      gap: 2,
      mb: 2,
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      flexDirection: { xs: 'column', sm: 'row' },
    }}>
      {/* Date Filter */}
      <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          Fecha
        </Typography>
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          sx={{ width: { xs: '100%', sm: 200 }, ...COMPACT_INPUT_STYLE }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Zones Filter */}
      <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          Zonas
        </Typography>
        <FormControl sx={{ width: { xs: '100%', sm: 200 }, minWidth: { sm: 200 }, ...COMPACT_SELECT_STYLE }} size="small">
          <Select
            multiple
            value={selectedZones}
            onChange={(e) => {
              const allIds = zones.map(z => z.zoneId || z.id || 0).filter(Boolean);
              const next = applySelectAllToggle(e.target.value as number[] | string, selectedZones, allIds);
              onZoneChange({ ...e, target: { ...e.target, value: next } } as typeof e);
            }}
            input={<OutlinedInput />}
            MenuProps={{
              disableAutoFocusItem: true,
              PaperProps: { sx: { maxHeight: 360 } },
            }}
            renderValue={(selected) => {
              if (selected.length === 0) return '';
              if (selected.length === zones.length) return 'Todas';
              if (selected.length === 1) {
                const zone = zones.find(z => (z.zoneId || z.id) === selected[0]);
                return zone?.zoneName || zone?.name || '1 seleccionada';
              }
              return `${selected.length} seleccionadas`;
            }}
          >
            <MenuItem value={SELECT_ALL}>
              <Checkbox
                checked={zones.length > 0 && selectedZones.length === zones.length}
                indeterminate={selectedZones.length > 0 && selectedZones.length < zones.length}
              />
              <ListItemText primary="Todas" />
            </MenuItem>
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
    </Box>
  );
});

FiltersSection.displayName = 'FiltersSection';

export default FiltersSection;
