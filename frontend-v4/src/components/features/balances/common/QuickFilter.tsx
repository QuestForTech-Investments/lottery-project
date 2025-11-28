import React, { useCallback, type ChangeEvent } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

interface QuickFilterProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * QuickFilter Component - Real-time search filter for tables
 */
const QuickFilter = React.memo(({
  value = '',
  onChange,
  placeholder = 'Filtro rápido'
}: QuickFilterProps): React.ReactElement => {
  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <ClearIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        minWidth: 250,
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#fff',
        }
      }}
    />
  );
});

QuickFilter.displayName = 'QuickFilter';

export default QuickFilter;
