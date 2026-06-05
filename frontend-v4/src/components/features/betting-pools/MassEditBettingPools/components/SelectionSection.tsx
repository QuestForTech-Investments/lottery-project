/**
 * SelectionSection Component
 *
 * Bottom section with chip-based selection for draws, pools, and zones.
 * Each group gets natural-order sorting and a local search box so large
 * lists (e.g. La Central with 600+ bancas) stay navigable.
 */

import { memo, useMemo, useState, type FC, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import type { SelectionSectionProps } from '../types';

// Numeric-aware comparator so "LC-2" comes before "LC-10".
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

// Show the search input once the list passes this size — under that it's
// faster to scan visually than to type.
const SEARCH_THRESHOLD = 8;

interface ChipItem {
  id: number;
  label: string;
}

interface ChipGroupProps {
  title: string;
  items: ChipItem[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  /** When undefined, the chip container grows to fit all chips with no scroll. */
  maxHeight?: number;
  /**
   * Bulk selection callback. Receives the ids currently VISIBLE (after
   * search/sort) and a flag: true → ensure all are selected, false → remove
   * them all from the selection. Parent decides how to merge into its own
   * state (e.g. zone toggles also auto-toggle bancas).
   */
  onBulkSelect?: (ids: number[], shouldSelect: boolean) => void;
}

const ChipGroup: FC<ChipGroupProps> = ({ title, items, selectedIds, onToggle, maxHeight, onBulkSelect }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const sorted = useMemo(
    () => [...items].sort((a, b) => collator.compare(a.label, b.label)),
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(i => i.label.toLowerCase().includes(q));
  }, [sorted, search]);

  const showSearch = sorted.length >= SEARCH_THRESHOLD;

  // "Select all" toggles between two states based on whether every VISIBLE
  // item is currently selected. With search active this only affects the
  // matched subset, so users can e.g. type "QUI" → Seleccionar todos to
  // tick only the Quiniela-style sorteos.
  const visibleIds = useMemo(() => filtered.map(i => i.id), [filtered]);
  const allVisibleSelected = visibleIds.length > 0
    && visibleIds.every(id => selectedIds.includes(id));
  const handleBulk = () => onBulkSelect?.(visibleIds, !allVisibleSelected);

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
        {showSearch && (
          <Typography variant="caption" color="text.secondary">
            {search.trim() ? `${filtered.length} / ${sorted.length}` : sorted.length}
          </Typography>
        )}
        {onBulkSelect && filtered.length > 0 && (
          <Button
            size="small"
            variant="text"
            onClick={handleBulk}
            sx={{ textTransform: 'none', minWidth: 0, py: 0, fontSize: '0.75rem', ml: 'auto' }}
          >
            {allVisibleSelected
              ? t('common.clearSelection', { defaultValue: 'Limpiar selección' })
              : t('common.selectAll', { defaultValue: 'Seleccionar todos' })}
          </Button>
        )}
      </Box>

      {showSearch && (
        <TextField
          size="small"
          fullWidth
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder={t('common.search', { defaultValue: 'Buscar…' })}
          sx={{ mb: 1, bgcolor: 'white' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: '1.1rem' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')} aria-label="clear search">
                  <ClearIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          ...(maxHeight !== undefined && { maxHeight, overflowY: 'auto' }),
        }}
      >
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1, textAlign: 'center' }}>
            {t('common.noResults', { defaultValue: 'Sin coincidencias' })}
          </Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {filtered.map(item => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <Chip
                  key={item.id}
                  label={item.label}
                  onClick={() => onToggle(item.id)}
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

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
  onDrawsBulkSelect,
  onPoolsBulkSelect,
  onZonesBulkSelect,
  onUpdateGeneralValuesChange,
}) => {
  const { t } = useTranslation();

  // Normalize each source list to the shape ChipGroup expects.
  const drawItems = useMemo<ChipItem[]>(() =>
    draws.map(d => ({
      id: d.drawId || d.id || 0,
      label: (d.drawName || d.name) ?? '',
    })),
    [draws]
  );

  const poolItems = useMemo<ChipItem[]>(() =>
    bettingPools.map(p => {
      const id = p.bettingPoolId || p.id || 0;
      return {
        id,
        label: p.bettingPoolName || p.name || t('massEditBettingPools.poolFallback', { id }),
      };
    }),
    [bettingPools, t]
  );

  const zoneItems = useMemo<ChipItem[]>(() =>
    zones.map(z => ({
      id: z.zoneId || z.id || 0,
      label: (z.zoneName || z.name) ?? '',
    })),
    [zones]
  );

  return (
    <>
      <ChipGroup
        title={t('massEditBettingPools.draws')}
        items={drawItems}
        selectedIds={selectedDraws}
        onToggle={onDrawToggle}
        onBulkSelect={onDrawsBulkSelect}
        maxHeight={200}
      />

      {/* Bancas — sin maxHeight para que crezca tanto como haga falta y no
          aparezca un scroll interno. La búsqueda+orden mantienen la lista
          manejable aunque sean 600+. */}
      <ChipGroup
        title={t('massEditBettingPools.bettingPools')}
        items={poolItems}
        selectedIds={selectedBettingPools}
        onToggle={onPoolToggle}
        onBulkSelect={onPoolsBulkSelect}
      />

      <ChipGroup
        title={t('massEditBettingPools.zones')}
        items={zoneItems}
        selectedIds={selectedZones}
        onToggle={onZoneToggle}
        onBulkSelect={onZonesBulkSelect}
        maxHeight={150}
      />

      {/* Actualizar valores generales */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={updateGeneralValues}
              onChange={(e) => onUpdateGeneralValuesChange(e.target.checked)}
            />
          }
          label={t('massEditBettingPools.updateGeneralValues')}
        />
      </Box>
    </>
  );
});

SelectionSection.displayName = 'SelectionSection';

export default SelectionSection;
