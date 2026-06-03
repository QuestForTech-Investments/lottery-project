/**
 * FiltersSection Component
 *
 * Date, zone, and group filters for daily sales.
 */

import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  groupOptions,
  selectedGroupId,
  onGroupChange,
}) => {
  const { t } = useTranslation();
  // The "Grupo" dropdown only appears when there's more than one option
  // (i.e., at least one partner with can_view_today_sales=true is
  // configured). Tenants without partners see exactly the legacy UI.
  const showGroupSelector = groupOptions.length > 1;
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
          {t('common.date')}
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
          {t('common.zones')}
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
              if (selected.length === zones.length) return t('common.all');
              if (selected.length === 1) {
                const zone = zones.find(z => (z.zoneId || z.id) === selected[0]);
                return zone?.zoneName || zone?.name || t('balances.selectedCount', { count: 1 });
              }
              return t('balances.selectedCount', { count: selected.length });
            }}
          >
            <MenuItem value={SELECT_ALL}>
              <Checkbox
                checked={zones.length > 0 && selectedZones.length === zones.length}
                indeterminate={selectedZones.length > 0 && selectedZones.length < zones.length}
              />
              <ListItemText primary={t('common.all')} />
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

      {/* Group Filter — last in the row, only shown when there are partners
          with can_view_today_sales=true. The group selector is the most
          "context-switching" filter, so it sits at the end. */}
      {showGroupSelector && (
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
            {t('sales.daily.group', { defaultValue: 'Grupo' })}
          </Typography>
          <FormControl sx={{ width: { xs: '100%', sm: 200 }, minWidth: { sm: 200 }, ...COMPACT_SELECT_STYLE }} size="small">
            <Select
              value={selectedGroupId}
              onChange={(e) => onGroupChange(String(e.target.value))}
              input={<OutlinedInput />}
            >
              {groupOptions.map(opt => (
                <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
});

FiltersSection.displayName = 'FiltersSection';

export default FiltersSection;
