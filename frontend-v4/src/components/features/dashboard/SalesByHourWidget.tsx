import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart, Bar } from 'recharts';
import { getSalesByHour, type SalesByHourItem } from '@/services/dashboardService';
import { formatCurrency } from '@/utils/formatCurrency';

const ACCENT = '#6366f1';
const SECONDARY = '#f59e0b';

const SalesByHourWidget: React.FC = () => {
  const [data, setData] = useState<SalesByHourItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getSalesByHour();
        if (alive) setData(rows);
      } catch {
        if (alive) setData([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const hasData = data.some(d => d.ventas > 0 || d.tickets > 0);

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 1 }}>
        Ventas por Hora del Día
      </Typography>
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: ACCENT }} size={24} />
        </Box>
      ) : !hasData ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">Sin ventas hoy</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'Ventas' ? formatCurrency(value) : value
                }
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar yAxisId="right" dataKey="tickets" name="Tickets" fill={SECONDARY} radius={[4, 4, 0, 0]} opacity={0.7} />
              <Line yAxisId="left" type="monotone" dataKey="ventas" name="Ventas" stroke={ACCENT} strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default SalesByHourWidget;
