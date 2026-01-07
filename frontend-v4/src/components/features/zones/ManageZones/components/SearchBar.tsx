/**
 * SearchBar Component
 *
 * Search input for filtering zones.
 */

import { memo, type FC } from 'react';
import { Box, TextField, InputAdornment, IconButton, Typography } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import type { SearchBarProps } from '../types';
import { SEARCH_INPUT_STYLE } from '../constants';

const SearchBar: FC<SearchBarProps> = memo(({
  searchText,
  onSearchChange,
  onClearSearch,
  resultCount,
}) => (
  <Box sx={{ p: 3, pb: 0 }}>
    <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
      <TextField
        fullWidth
        placeholder="Buscar zona por nombre o ID..."
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
          {resultCount} zona{resultCount !== 1 ? 's' : ''} encontrada{resultCount !== 1 ? 's' : ''}
        </Typography>
      )}
    </Box>
  </Box>
));

SearchBar.displayName = 'SearchBar';

export default SearchBar;
