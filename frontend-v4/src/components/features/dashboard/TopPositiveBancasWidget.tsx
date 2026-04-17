import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { getTopPositiveBancas, type BancaBalanceItem } from '@/services/dashboardService';
import { formatCurrency } from '@/utils/formatCurrency';

const ACCENT = '#6366f1';
const SUCCESS = '#2e7d32';

const TopPositiveBancasWidget: React.FC = () => {
  const [data, setData] = useState<BancaBalanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getTopPositiveBancas(10);
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
        Top 10 Bancas con Balance Positivo
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
        <TableContainer sx={{ flex: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#f5f5f5' }}>Banca</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.bettingPoolId} hover>
                  <TableCell sx={{ fontSize: 12, py: 0.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{row.name}</Typography>
                      {row.reference && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10 }}>{row.reference}</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, color: SUCCESS, fontWeight: 600 }}>
                    {formatCurrency(row.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default TopPositiveBancasWidget;
