import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Grid, Typography, Tooltip } from '@mui/material';
import { Storefront as StorefrontIcon } from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatCurrency';
import useDashboard from './hooks/useDashboard';
import SalesBenefitChartWidget from '@components/features/dashboard/SalesBenefitChartWidget';
import SalesByHourWidget from '@components/features/dashboard/SalesByHourWidget';
import SalesByLotteryWidget from '@components/features/dashboard/SalesByLotteryWidget';
import TopPositiveBancasWidget from '@components/features/dashboard/TopPositiveBancasWidget';
import TopNegativeBancasWidget from '@components/features/dashboard/TopNegativeBancasWidget';
import BancasWithoutSalesWidget from '@components/features/dashboard/BancasWithoutSalesWidget';
import QuickBlockWidget from '@components/features/dashboard/QuickBlockWidget';

// Vibrant on-brand gradients for the per-day cards. "Hoy" keeps the signature
// indigo→purple of the brand; previous days use the success/info/warning
// gradients from the theme — same energy, different hue.
const TODAY_GRADIENT = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
const DAY_GRADIENTS: { gradient: string; shadow: string }[] = [
  { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: '0 10px 25px -8px rgba(16, 185, 129, 0.55)' },  // emerald
  { gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', shadow: '0 10px 25px -8px rgba(59, 130, 246, 0.55)' },  // blue
  { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: '0 10px 25px -8px rgba(245, 158, 11, 0.55)' },  // amber (fallback)
];

const DashboardMUI = () => {
  const { t, i18n } = useTranslation();
  const { bancasVendiendo } = useDashboard();

  // Day-of-week label from the active i18n locale — browsers ship these
  // translations natively so we don't have to maintain them ourselves.
  const localeTag = (lang: string | undefined): string => {
    switch ((lang ?? 'es').split('-')[0]) {
      case 'en': return 'en-US';
      case 'fr': return 'fr-FR';
      case 'ht': return 'ht-HT';
      case 'es':
      default:   return 'es-DO';
    }
  };
  const formatWeekday = (dateStr: string): string => {
    try {
      // YYYY-MM-DD at noon avoids any TZ/DST off-by-one when parsing.
      const d = new Date(`${dateStr}T12:00:00`);
      return d.toLocaleDateString(localeTag(i18n.language), { weekday: 'long' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.100', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
        {/* Row 1: Bancas vendiendo — one colored card per day. "Hoy" gets the
            brand gradient so the most actionable number pops; previous days use
            soft on-brand backgrounds for context. */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          {bancasVendiendo.length === 0 ? (
            <Paper elevation={2} sx={{ p: 2, flex: 1, textAlign: 'center', color: '#94a3b8' }}>
              {t('common.loading')}
            </Paper>
          ) : (
            bancasVendiendo.map((day, i) => {
              const isToday = day.isToday;
              const dayLabel = isToday
                ? t('common.today', { defaultValue: 'Hoy' })
                : formatWeekday(day.dateStr);
              const dayStyle = DAY_GRADIENTS[i % DAY_GRADIENTS.length];
              const gradient = isToday ? TODAY_GRADIENT : dayStyle.gradient;
              const baseShadow = isToday
                ? '0 10px 25px -8px rgba(99, 102, 241, 0.55)'
                : dayStyle.shadow;
              const hoverShadow = isToday
                ? '0 14px 30px -8px rgba(99, 102, 241, 0.7)'
                : dayStyle.shadow.replace('0.55', '0.7').replace('25px -8px', '30px -8px');
              // Hover breakdown — keeps the card itself uncluttered while
              // surfacing the $-level context (ventas, premios, comisiones, neto).
              const tooltipContent = (
                <Box sx={{ p: 0.5, minWidth: 200 }}>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      opacity: 0.85,
                      mb: 0.75,
                    }}
                  >
                    {dayLabel} — {day.count} {t('dashboard.poolsSelling').toLowerCase()}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'auto auto',
                      columnGap: 2,
                      rowGap: 0.5,
                      fontSize: '12.5px',
                    }}
                  >
                    <span>{t('dashboard.totalSales', { defaultValue: 'Ventas' })}</span>
                    <Box component="span" sx={{ textAlign: 'right', fontWeight: 700 }}>
                      {formatCurrency(day.totalSold)}
                    </Box>
                    <span>{t('dashboard.prizes', { defaultValue: 'Premios' })}</span>
                    <Box component="span" sx={{ textAlign: 'right' }}>
                      {formatCurrency(day.totalPrizes)}
                    </Box>
                    <span>{t('dashboard.commissions', { defaultValue: 'Comisiones' })}</span>
                    <Box component="span" sx={{ textAlign: 'right' }}>
                      {formatCurrency(day.totalCommissions)}
                    </Box>
                    <Box component="span" sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', pt: 0.4 }}>
                      {t('dashboard.netTotal', { defaultValue: 'Neto' })}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        textAlign: 'right',
                        fontWeight: 700,
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        pt: 0.4,
                      }}
                    >
                      {formatCurrency(day.totalNet)}
                    </Box>
                  </Box>
                </Box>
              );

              return (
                <Box
                  key={day.dateStr}
                  sx={{ flex: '1 1 220px', minWidth: 220 }}
                >
                  <Tooltip arrow placement="bottom" title={tooltipContent}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        height: '100%',
                        cursor: 'help',
                        background: gradient,
                        color: '#ffffff',
                        boxShadow: baseShadow,
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: hoverShadow,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <StorefrontIcon sx={{ fontSize: 26 }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                            opacity: 0.85,
                            lineHeight: 1.2,
                          }}
                        >
                          {dayLabel}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.25 }}>
                          <Typography sx={{ fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
                            {day.count}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', opacity: 0.85, fontWeight: 500 }}>
                            {t('dashboard.poolsSelling').toLowerCase()}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Tooltip>
                </Box>
              );
            })
          )}
        </Box>

        {/* Row 2: Four small cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Box sx={{ height: 460 }}>
              <QuickBlockWidget />
            </Box>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Box sx={{ height: 460 }}>
              <TopPositiveBancasWidget />
            </Box>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Box sx={{ height: 460 }}>
              <TopNegativeBancasWidget />
            </Box>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Box sx={{ height: 460 }}>
              <BancasWithoutSalesWidget />
            </Box>
          </Grid>
        </Grid>

        {/* Row 3: Two charts side by side */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 360 }}>
              <SalesBenefitChartWidget />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 360 }}>
              <SalesByHourWidget />
            </Box>
          </Grid>
        </Grid>

        {/* Row 4: Sales by draw full-width */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SalesByLotteryWidget />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default memo(DashboardMUI);
