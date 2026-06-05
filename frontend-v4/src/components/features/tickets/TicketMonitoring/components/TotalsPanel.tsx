/**
 * TotalsPanel Component
 *
 * Three stat cards (monto / premios / pendiente) replacing the legacy single
 * purple block. Each card has its own accent color and icon so totals are
 * scannable at a glance.
 */

import { memo, type FC, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, Typography } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import type { TotalsPanelProps } from '../types';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  /** Hex value used for the icon tint, accent bar and gradient highlight. */
  accent: string;
  /** When true, the value is rendered in the accent color to draw attention. */
  highlight?: boolean;
}

const StatCard: FC<StatCardProps> = memo(({ label, value, icon, accent, highlight }) => (
  <Card
    elevation={0}
    sx={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: { xs: 2, sm: 2.5 },
      py: { xs: 1.5, sm: 2 },
      borderRadius: '14px',
      border: '1px solid #e6e8ec',
      backgroundColor: '#fff',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      // Subtle wash of the accent color in the upper-left to anchor each card
      // visually to its metric without competing with the value text.
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
        backgroundColor: accent,
      },
      '&:hover': {
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
        transform: 'translateY(-1px)',
      },
    }}
  >
    <Box
      sx={{
        flexShrink: 0,
        width: 44,
        height: 44,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accent,
        backgroundColor: `${accent}15`, // ~8% opacity hex suffix
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#64748b',
          lineHeight: 1.1,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: '1.15rem', sm: '1.35rem' },
          fontWeight: 700,
          lineHeight: 1.1,
          color: highlight ? accent : '#1e293b',
          letterSpacing: '-0.01em',
        }}
      >
        {formatCurrency(value)}
      </Typography>
    </Box>
  </Card>
));

StatCard.displayName = 'StatCard';

const TotalsPanel: FC<TotalsPanelProps> = memo(({ totals }) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: { xs: 1.5, sm: 2 },
        mb: 2,
      }}
    >
      <StatCard
        label={t('tickets.monitoring.totalAmount')}
        value={totals.montoTotal}
        icon={<AccountBalanceWalletOutlinedIcon />}
        accent="#6366f1"
      />
      <StatCard
        label={t('tickets.detail.totalPrizes')}
        value={totals.totalPremios}
        icon={<EmojiEventsOutlinedIcon />}
        accent="#10b981"
        highlight={totals.totalPremios > 0}
      />
      <StatCard
        label={t('tickets.monitoring.totalPending')}
        value={totals.totalPendiente}
        icon={<ScheduleOutlinedIcon />}
        accent="#f59e0b"
        highlight={totals.totalPendiente > 0}
      />
    </Box>
  );
});

TotalsPanel.displayName = 'TotalsPanel';

export default TotalsPanel;
