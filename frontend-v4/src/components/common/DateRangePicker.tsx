import { memo, type FC } from 'react';
import { Box, TextField, Typography } from '@mui/material';

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startLabel?: string;
  endLabel?: string;
  size?: 'small' | 'medium';
}

/**
 * Reusable date range picker component
 *
 * @example
 * ```tsx
 * <DateRangePicker
 *   startDate={fechaInicial}
 *   endDate={fechaFinal}
 *   onStartDateChange={setFechaInicial}
 *   onEndDateChange={setFechaFinal}
 * />
 * ```
 */
export const DateRangePicker: FC<DateRangePickerProps> = memo(({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = 'Fecha inicial',
  endLabel = 'Fecha final',
  size = 'small',
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          {startLabel}
        </Typography>
        <TextField
          type="date"
          size={size}
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          sx={{ width: 200 }}
        />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          {endLabel}
        </Typography>
        <TextField
          type="date"
          size={size}
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          sx={{ width: 200 }}
        />
      </Box>
    </Box>
  );
});

DateRangePicker.displayName = 'DateRangePicker';

export default DateRangePicker;
