/**
 * ValueChip Component
 *
 * Selectable chip for allowed values.
 */

import { memo, type FC } from 'react';
import { Chip } from '@mui/material';
import type { ValueChipProps } from '../types';

const ValueChip: FC<ValueChipProps> = memo(({ value, isSelected, onClick }) => (
  <Chip
    label={value}
    onClick={onClick}
    sx={{
      fontSize: '12px',
      height: '28px',
      bgcolor: isSelected ? '#6366f1' : 'white',
      color: isSelected ? 'white' : '#6366f1',
      border: '1px solid #6366f1',
      cursor: 'pointer',
      '&:hover': {
        bgcolor: isSelected ? '#5568d3' : '#eef2ff'
      }
    }}
  />
));

ValueChip.displayName = 'ValueChip';

export default ValueChip;
