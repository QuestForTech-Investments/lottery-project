import { memo, type FC } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterToggleGroupProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Styled filter toggle button group
 *
 * @example
 * ```tsx
 * <FilterToggleGroup
 *   options={[
 *     { value: 'todos', label: 'Todos' },
 *     { value: 'activos', label: 'Activos' },
 *   ]}
 *   value={filterType}
 *   onChange={setFilterType}
 *   label="Filtros"
 * />
 * ```
 */
export const FilterToggleGroup: FC<FilterToggleGroupProps> = memo(({
  options,
  value,
  onChange,
  label,
  size = 'small',
}) => {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {label && (
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500 }}>
          {label}
        </Typography>
      )}
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size={size}
        sx={{
          // Single connected bar on desktop; on phones the buttons wrap so the
          // group doesn't push past the viewport when labels are long.
          border: { xs: 'none', sm: '2px solid #8b5cf6' },
          borderRadius: '6px',
          overflow: { xs: 'visible', sm: 'hidden' },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: { xs: 0.5, sm: 0 },
          '& .MuiToggleButton-root': {
            border: { xs: '2px solid #8b5cf6', sm: 'none' },
            borderRight: { xs: '2px solid #8b5cf6', sm: '2px solid #8b5cf6' },
            borderRadius: { xs: '6px', sm: 0 },
            px: 2,
            py: 0.6,
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            color: '#64748b',
            backgroundColor: '#fff',
            transition: 'all 0.15s ease',
            '&:last-of-type': {
              borderRight: { xs: '2px solid #8b5cf6', sm: 'none' },
            },
            '&:hover': {
              backgroundColor: '#f8f7ff',
              color: '#7c3aed',
            },
            '&.Mui-selected': {
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
});

FilterToggleGroup.displayName = 'FilterToggleGroup';

export default FilterToggleGroup;
