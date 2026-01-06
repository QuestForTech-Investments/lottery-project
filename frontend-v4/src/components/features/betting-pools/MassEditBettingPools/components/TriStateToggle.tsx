/**
 * TriStateToggle Component
 *
 * Toggle button group with three states: On, Off, No change.
 */

import { memo, type FC } from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';

interface TriStateToggleProps {
  value: string;
  onChange: (value: string) => void;
}

const TriStateToggle: FC<TriStateToggleProps> = memo(({ value, onChange }) => (
  <ToggleButtonGroup
    value={value}
    exclusive
    onChange={(_, newVal) => newVal && onChange(newVal)}
    size="small"
    sx={{ flexWrap: 'wrap' }}
  >
    <ToggleButton value="on" color="success">
      Encender
    </ToggleButton>
    <ToggleButton value="off" color="error">
      Apagar
    </ToggleButton>
    <ToggleButton value="no_change" color="primary">
      No cambiar
    </ToggleButton>
  </ToggleButtonGroup>
));

TriStateToggle.displayName = 'TriStateToggle';

export default TriStateToggle;
