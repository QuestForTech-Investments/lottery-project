import React, { useCallback, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
  label,
}: DateFilterProps): React.ReactElement => {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('common.date');
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
        {resolvedLabel}
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
