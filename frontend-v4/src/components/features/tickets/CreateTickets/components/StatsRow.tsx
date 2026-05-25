import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, TextField, Switch, useMediaQuery, useTheme } from '@mui/material';

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
  const theme = useTheme();
  // Phones get a dashboard-style 3-tile stat grid + a separate row for the
  // toggle switches. The desktop view keeps the original inline label+input
  // layout because there's enough horizontal room.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    // Compact tile renderer used for the three stat cards. The label area is
    // forced to 2 lines so labels of different lengths still produce tiles of
    // equal height — keeping the value numbers visually aligned across all
    // three tiles.
    const Tile = ({ label, value }: { label: string; value: React.ReactNode }) => (
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: 'white',
          borderRadius: 1,
          border: '1px solid #e0e0e0',
          px: 1,
          py: 0.75,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontSize: '10px',
            color: '#888',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            lineHeight: 1.2,
            // Reserve exactly 2 lines so values land on the same baseline
            // regardless of label length.
            minHeight: '2.4em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
    );

    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 0.75, mb: 1, alignItems: 'stretch' }}>
          <Tile label={t('tickets.create.playsToday')} value={dailyBets} />
          <Tile label={t('tickets.create.globalSales')} value={soldInGroup} />
          <Tile label={t('tickets.create.bettingPoolSales')} value={soldInPool} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>{t('tickets.create.discount')}</Typography>
            <Switch
              checked={discountActive}
              onChange={(e) => onDiscountChange(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4caf50' },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>{t('tickets.create.lotteryMultiplier')}</Typography>
            <Switch
              checked={multiLotteryMode}
              onChange={(e) => onMultiLotteryChange(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#f44336' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#f44336' },
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

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
