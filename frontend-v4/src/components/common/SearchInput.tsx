import { memo, type FC, type ChangeEvent } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
  size?: 'small' | 'medium';
  debounceMs?: number;
}

/**
 * Reusable search input with icon
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   placeholder="Buscar..."
 * />
 * ```
 */
export const SearchInput: FC<SearchInputProps> = memo(({
  value,
  onChange,
  placeholder = 'Filtro rápido',
  width = 300,
  size = 'small',
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      size={size}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{ width }}
    />
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
