/**
 * CommissionsSubTab Component
 *
 * Sub-tab content for commissions configuration.
 */

import { memo, type FC, type ChangeEvent } from 'react';
import { Grid, TextField } from '@mui/material';
import type { CommissionsSubTabProps } from '../types';
import { COMMISSION_FIELDS } from '../constants';

const CommissionsSubTab: FC<CommissionsSubTabProps> = memo(({ commissionsData, onCommissionChange }) => (
  <Grid container spacing={2}>
    {COMMISSION_FIELDS.map(({ label, gameType }) => (
      <Grid item xs={12} sm={6} md={4} key={gameType}>
        <TextField
          fullWidth
          label={label}
          value={commissionsData[gameType] || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onCommissionChange(gameType, e.target.value)}
          placeholder="0"
          size="small"
          InputProps={{
            sx: { textAlign: 'right' }
          }}
          sx={{
            '& input': { textAlign: 'right' }
          }}
        />
      </Grid>
    ))}
  </Grid>
));

CommissionsSubTab.displayName = 'CommissionsSubTab';

export default CommissionsSubTab;
