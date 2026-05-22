/**
 * TriStateToggle Component
 *
 * Toggle button group with three states: On, Off, No change.
 */

import { memo, type FC } from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface TriStateToggleProps {
  value: string;
  onChange: (value: string) => void;
}

const TriStateToggle: FC<TriStateToggleProps> = memo(({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, newVal) => newVal && onChange(newVal)}
      size="small"
      sx={{ flexWrap: 'wrap' }}
    >
      <ToggleButton value="on" color="success">
        {t('massEditBettingPools.triState.on')}
      </ToggleButton>
      <ToggleButton value="off" color="error">
        {t('massEditBettingPools.triState.off')}
      </ToggleButton>
      <ToggleButton value="no_change" color="primary">
        {t('massEditBettingPools.triState.noChange')}
      </ToggleButton>
    </ToggleButtonGroup>
  );
});

TriStateToggle.displayName = 'TriStateToggle';

export default TriStateToggle;
