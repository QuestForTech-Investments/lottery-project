import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSalesBenefitChart, type SalesBenefitItem } from '@/services/dashboardService';
import { formatCurrency } from '@/utils/formatCurrency';

const ACCENT = '#6366f1';
const SUCCESS = '#2e7d32';
const DANGER = '#c62828';

const CustomLegend: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1, fontSize: 12 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 12, height: 12, bgcolor: ACCENT, borderRadius: '2px' }} />
      <span>Ventas</span>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 12, height: 12, bgcolor: SUCCESS, borderRadius: '2px' }} />
      <span>Beneficio</span>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 12, height: 12, bgcolor: DANGER, borderRadius: '2px' }} />
      <span>Pérdida</span>
    </Box>
  </Box>
);

const SalesBenefitChartWidget: React.FC = () => {
  const [data, setData] = useState<SalesBenefitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getSalesBenefitChart(7);
        if (alive) setData(rows);
      } catch {
        if (alive) setData([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 1 }}>
        Ventas y Beneficio - Últimos 7 días
      </Typography>
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: ACCENT }} size={24} />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">Sin datos</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 260, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="ventas" name="Ventas" fill={ACCENT} radius={[4, 4, 0, 0]} />
                <Bar dataKey="beneficio" name="Beneficio" radius={[4, 4, 0, 0]}>
                  {data.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.beneficio < 0 ? DANGER : SUCCESS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <CustomLegend />
        </Box>
      )}
    </Paper>
  );
};

export default SalesBenefitChartWidget;
