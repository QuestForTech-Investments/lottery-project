import { memo, type FC } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

const SELECT_ALL = -1;

export interface Zone {
  id: number;
  name: string;
}

export interface ZoneMultiSelectProps {
  zones: Zone[];
  selectedZoneIds: number[];
  onChange: (selectedIds: number[]) => void;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  minWidth?: number;
}

/**
 * Reusable zone multi-select component
 *
 * @example
 * ```tsx
 * <ZoneMultiSelect
 *   zones={zonasList}
 *   selectedZoneIds={selectedZones}
 *   onChange={setSelectedZones}
 * />
 * ```
 */
export const ZoneMultiSelect: FC<ZoneMultiSelectProps> = memo(({
  zones,
  selectedZoneIds,
  onChange,
  label = 'Zonas',
  placeholder = 'Seleccione',
  size = 'small',
  minWidth = 200,
}) => {
  const handleChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    const arr = typeof value === 'string' ? [] : value;
    if (arr.includes(SELECT_ALL)) {
      // "Todas" toggled: clear if all were selected, otherwise select every zone.
      onChange(selectedZoneIds.length === zones.length ? [] : zones.map(z => z.id));
      return;
    }
    onChange(arr);
  };

  const renderValue = (selected: number[]) => {
    if (selected.length === 0) return placeholder;
    if (selected.length === zones.length && zones.length > 0) return 'Todas';
    if (selected.length === 1) {
      const zone = zones.find((z) => z.id === selected[0]);
      return zone?.name || '1 seleccionada';
    }
    return `${selected.length} seleccionadas`;
  };

  return (
    <Box>
      {label && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          {label}
        </Typography>
      )}
      <FormControl sx={{ minWidth }} size={size}>
        <Select
          multiple
          value={selectedZoneIds}
          onChange={handleChange}
          renderValue={renderValue}
          displayEmpty
          MenuProps={{
            disableAutoFocusItem: true,
            PaperProps: { sx: { maxHeight: 360 } },
          }}
        >
          <MenuItem value={SELECT_ALL}>
            <Checkbox
              checked={zones.length > 0 && selectedZoneIds.length === zones.length}
              indeterminate={selectedZoneIds.length > 0 && selectedZoneIds.length < zones.length}
            />
            <ListItemText primary="Todas" />
          </MenuItem>
          {zones.map((zone) => (
            <MenuItem key={zone.id} value={zone.id}>
              <Checkbox checked={selectedZoneIds.includes(zone.id)} />
              {zone.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
});

ZoneMultiSelect.displayName = 'ZoneMultiSelect';

export default ZoneMultiSelect;
