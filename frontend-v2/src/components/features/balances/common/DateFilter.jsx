import React, { useCallback } from 'react';
import { TextField, Box, Typography } from '@mui/material';

/**
 * DateFilter Component - Date picker for balance filtering
 * @param {string} value - Current date value (YYYY-MM-DD)
 * @param {Function} onChange - Callback when date changes
 * @param {string} label - Label text
 */
const DateFilter = React.memo(({
  value,
  onChange,
  label = 'Fecha'
}) => {
  const handleChange = useCallback((e) => {
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
