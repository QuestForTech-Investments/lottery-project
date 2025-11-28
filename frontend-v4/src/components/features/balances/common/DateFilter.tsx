import React, { useCallback, type ChangeEvent } from 'react';
import { TextField, Box, Typography } from '@mui/material';

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/**
 * DateFilter Component - Date picker for balance filtering
 */
const DateFilter = React.memo(({
  value,
  onChange,
  label = 'Fecha'
}: DateFilterProps): React.ReactElement => {
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
          mb: 0.5,
          color: 'text.secondary',
          fontWeight: 500
        }}
      >
        {label}
      </Typography>
      <TextField
        type="date"
        size="small"
        value={value}
        onChange={handleChange}
        sx={{
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#fff',
          }
        }}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </Box>
  );
});

DateFilter.displayName = 'DateFilter';

export default DateFilter;
