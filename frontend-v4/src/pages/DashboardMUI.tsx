import { memo } from 'react';
import { Box, Paper, Grid, Typography } from '@mui/material';
import useDashboard from './hooks/useDashboard';
import SalesBenefitChartWidget from '@components/features/dashboard/SalesBenefitChartWidget';
import SalesByHourWidget from '@components/features/dashboard/SalesByHourWidget';
import SalesByLotteryWidget from '@components/features/dashboard/SalesByLotteryWidget';
import TopPositiveBancasWidget from '@components/features/dashboard/TopPositiveBancasWidget';
import TopNegativeBancasWidget from '@components/features/dashboard/TopNegativeBancasWidget';
import BancasWithoutSalesWidget from '@components/features/dashboard/BancasWithoutSalesWidget';
import QuickBlockWidget from '@components/features/dashboard/QuickBlockWidget';

const ACCENT = '#6366f1';

const DashboardMUI = () => {
  const { bancasVendiendo } = useDashboard();

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.100', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
        {/* Row 1: Bancas vendiendo */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1" align="center" sx={{ fontWeight: 500 }}>
            Bancas vendiendo:{' '}
            {bancasVendiendo.length > 0 ? (
              bancasVendiendo.map((day, index) => (
                <span key={day.dayName}>
                  {index > 0 && ', '}
                  {day.dayName}: <Box component="span" sx={{ color: ACCENT, fontWeight: 'bold' }}>{day.count}</Box>
                </span>
              ))
            ) : (
              <Box component="span" sx={{ color: '#94a3b8' }}>Cargando...</Box>
            )}
          </Typography>
        </Paper>

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
