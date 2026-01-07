/**
 * SelectionSection Component
 *
 * Reusable section for selecting items (betting pools or users).
 */

import { memo, type FC } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import type { SelectionSectionProps } from '../types';
import { SECTION_CONTAINER_STYLE, getChipStyle } from '../constants';

const SelectionSection: FC<SelectionSectionProps> = memo(({
  title,
  items,
  selectedIds,
  emptyMessage,
  onToggle,
}) => (
  <Box sx={SECTION_CONTAINER_STYLE}>
    <Typography variant="h6" sx={{ mb: 2, fontSize: '1.125rem', fontWeight: 500 }}>
      {title}
    </Typography>

    <Box className="multiselect-buttons-container-mui">
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          {emptyMessage}
        </Typography>
      ) : (
        items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <Chip
              key={item.id}
              label={item.label}
              onClick={() => onToggle(item.id)}
              className={isSelected ? 'selected' : ''}
              sx={getChipStyle(isSelected)}
            />
          );
        })
      )}
    </Box>
  </Box>
));

SelectionSection.displayName = 'SelectionSection';

export default SelectionSection;
