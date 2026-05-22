import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
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
}) => {
  const { t } = useTranslation();
  return (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>{t('tickets.create.playsToday')}</Typography>
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
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>{t('tickets.create.globalSales')}</Typography>
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
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>{t('tickets.create.bettingPoolSales')}</Typography>
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
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>{t('tickets.create.discount')}</Typography>
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
      <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>{t('tickets.create.lotteryMultiplier')}</Typography>
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
  );
});

StatsRow.displayName = 'StatsRow';

export default StatsRow;
