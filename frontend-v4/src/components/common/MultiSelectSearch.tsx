import { memo, type SyntheticEvent } from 'react';
import {
  Autocomplete,
  Box,
  Checkbox,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const SELECT_ALL_ID = -1;

export interface OptionItem {
  id: number;
  label: string;
}

export interface MultiSelectSearchProps {
  label?: string;
  placeholder?: string;
  options: OptionItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  /** Label shown on the synthetic "select all" row + as the summary when all are picked. */
  selectAllLabel?: string;
  minWidth?: number;
  size?: 'small' | 'medium';
}

/**
 * Multi-select dropdown with built-in typeahead and a "select all" toggle row.
 *
 * Caller passes a flat options array with `{id, label}`; selection is tracked
 * by id only so it stays decoupled from the underlying domain shape.
 */
export const MultiSelectSearch = memo(({
  label,
  placeholder = 'Seleccione',
  options,
  selectedIds,
  onChange,
  selectAllLabel = 'Todas',
  minWidth = 220,
  size = 'small',
}: MultiSelectSearchProps) => {
  const optionsWithAll: OptionItem[] = [
    { id: SELECT_ALL_ID, label: selectAllLabel },
    ...options,
  ];
  const selectedOptions: OptionItem[] = options.filter((o) => selectedIds.includes(o.id));

  const handleChange = (_e: SyntheticEvent, value: OptionItem[]) => {
    if (value.some((v) => v.id === SELECT_ALL_ID)) {
      onChange(selectedIds.length === options.length ? [] : options.map((o) => o.id));
      return;
    }
    onChange(value.map((v) => v.id));
  };

  const summary =
    selectedOptions.length === 0
      ? ''
      : selectedOptions.length === options.length && options.length > 0
        ? selectAllLabel
        : selectedOptions.length === 1
          ? selectedOptions[0].label
          : `${selectedOptions.length} seleccionada${selectAllLabel.endsWith('os') ? 's' : 's'}`;

  return (
    <Box>
      {label && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          {label}
        </Typography>
      )}
      <Autocomplete
        multiple
        disableCloseOnSelect
        size={size}
        sx={{ minWidth }}
        options={optionsWithAll}
        value={selectedOptions}
        onChange={handleChange}
        getOptionLabel={(o) => o.label}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        renderTags={() => null}
        ListboxProps={{ style: { maxHeight: 360 } }}
        renderOption={(props, option, { selected }) => {
          if (option.id === SELECT_ALL_ID) {
            const allSelected = options.length > 0 && selectedIds.length === options.length;
            const indeterminate = selectedIds.length > 0 && selectedIds.length < options.length;
            return (
              <li {...props} key="__all__">
                <Checkbox
                  size="small"
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  checked={allSelected}
                  indeterminate={indeterminate}
                  sx={{ mr: 1 }}
                />
                {option.label}
              </li>
            );
          }
          return (
            <li {...props} key={option.id}>
              <Checkbox
                size="small"
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                checked={selected}
                sx={{ mr: 1 }}
              />
              {option.label}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={selectedOptions.length === 0 ? placeholder : ''}
            InputProps={{
              ...params.InputProps,
              startAdornment: summary ? (
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  {summary}
                </InputAdornment>
              ) : null,
            }}
          />
        )}
      />
    </Box>
  );
});

MultiSelectSearch.displayName = 'MultiSelectSearch';

export default MultiSelectSearch;
