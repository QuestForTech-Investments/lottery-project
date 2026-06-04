/**
 * SelectionSection Component
 *
 * Reusable section for selecting items (betting pools or users).
 * Provides natural-order sorting and a local search filter so large lists
 * (600+ bancas / users) stay navigable.
 */

import { memo, useMemo, useState, type ChangeEvent, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Chip, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import type { SelectionSectionProps } from '../types';
import { SECTION_CONTAINER_STYLE, SEARCH_INPUT_STYLE, getChipStyle } from '../constants';

// Numeric-aware comparator: "LA CENTRAL 2" comes before "LA CENTRAL 10".
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

// Only render the search box once the list gets large enough that scanning
// the chips by eye becomes a chore.
const SEARCH_THRESHOLD = 8;

const SelectionSection: FC<SelectionSectionProps> = memo(({
  title,
  items,
  selectedIds,
  emptyMessage,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  // Always sort the items, then filter by search. Sorted once per items
  // change, filtered on each keystroke.
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => collator.compare(a.label, b.label)),
    [items]
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedItems;
    return sortedItems.filter(i => i.label.toLowerCase().includes(q));
  }, [sortedItems, search]);

  const showSearch = sortedItems.length >= SEARCH_THRESHOLD;
  const matchCount = filteredItems.length;
  const totalCount = sortedItems.length;

  return (
    <Box sx={SECTION_CONTAINER_STYLE}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
          {title}
        </Typography>
        {showSearch && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {search.trim() ? `${matchCount} / ${totalCount}` : totalCount}
          </Typography>
        )}
      </Box>

      {showSearch && (
        <TextField
          size="small"
          fullWidth
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder={t('common.search', { defaultValue: 'Buscar…' })}
          sx={{ mb: 2, bgcolor: 'white', ...SEARCH_INPUT_STYLE }}
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

      <Box className="multiselect-buttons-container-mui">
        {totalCount === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {emptyMessage}
          </Typography>
        ) : filteredItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {t('common.noResults', { defaultValue: 'Sin coincidencias' })}
          </Typography>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <Chip
                key={item.id}
                label={item.label}
                onClick={() => onToggle(item.id)}
                className={isSelected ? 'selected' : ''}
                sx={getChipStyle(isSelected)}
              />
            );
          })
        )}
      </Box>
    </Box>
  );
});

SelectionSection.displayName = 'SelectionSection';

export default SelectionSection;
