import React, { memo } from 'react';
import { Box, Typography, TextField, Switch } from '@mui/material';

interface StatsRowProps {
  dailyBets: number;
  soldInGroup: string;
  soldInPool: string;
  discountActive: boolean;
  multiLotteryMode: boolean;
  onDiscountChange: (checked: boolean) => void;
  onMultiLotteryChange: (checked: boolean) => void;
}

/**
 * StatsRow Component
 *
 * Displays daily stats and toggle controls.
 */
const StatsRow: React.FC<StatsRowProps> = memo(({
  dailyBets,
  soldInGroup,
  soldInPool,
  discountActive,
  multiLotteryMode,
  onDiscountChange,
  onMultiLotteryChange,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Jugadas del dia</Typography>
      <TextField
        size="medium"
        value={dailyBets}
        disabled
        sx={{
          width: 100,
          bgcolor: 'white',
          '& input': {
            textAlign: 'center',
            py: 1,
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }}
      />
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Vendido en grupo</Typography>
      <TextField
        size="medium"
        value={soldInGroup}
        disabled
        sx={{
          width: 180,
          bgcolor: 'white',
          '& input': {
            py: 1,
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }}
      />
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Vendido en banca</Typography>
      <TextField
        size="medium"
        value={soldInPool}
        disabled
        sx={{
          width: 180,
          bgcolor: 'white',
          '& input': {
            py: 1,
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }}
      />
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Desc.</Typography>
      <Switch
        checked={discountActive}
        onChange={(e) => onDiscountChange(e.target.checked)}
        sx={{
          transform: 'scale(1.3)',
          '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4caf50' },
        }}
      />
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Mult. lot</Typography>
      <Switch
        checked={multiLotteryMode}
        onChange={(e) => onMultiLotteryChange(e.target.checked)}
        sx={{
          transform: 'scale(1.3)',
          '& .MuiSwitch-switchBase.Mui-checked': { color: '#f44336' },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#f44336' },
        }}
      />
    </Box>
  </Box>
));

StatsRow.displayName = 'StatsRow';

export default StatsRow;
