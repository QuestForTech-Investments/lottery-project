/**
 * SearchBar Component
 *
 * Search input for filtering zones.
 */

import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, InputAdornment, IconButton, Typography } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import type { SearchBarProps } from '../types';
import { SEARCH_INPUT_STYLE } from '../constants';

const SearchBar: FC<SearchBarProps> = memo(({
  searchText,
  onSearchChange,
  onClearSearch,
  resultCount,
}) => {
  const { t } = useTranslation();
  return (
  <Box sx={{ p: 3, pb: 0 }}>
    <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
      <TextField
        fullWidth
        placeholder={t('zonesAdmin.searchZonePlaceholder')}
        value={searchText}
        onChange={onSearchChange}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchText && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={onClearSearch} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={SEARCH_INPUT_STYLE}
      />
      {searchText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {t('zonesAdmin.zonesFoundCount', { count: resultCount })}
        </Typography>
      )}
    </Box>
  </Box>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
