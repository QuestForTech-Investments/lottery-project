import React, { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import {
  getTransactionSummary,
  type TransactionSummaryItemAPI
} from '@services/transactionGroupService';
import { getBettingPools, type BettingPool } from '@services/bettingPoolService';

const formatCurrency = (val: number): string => {
  if (val < 0) return `-$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getNetColor = (val: number): string => {
  if (val > 0) return '#28a745';
  if (val < 0) return '#dc3545';
  return '#2c2c2c';
};

const getNetBgColor = (val: number): string => {
  if (val > 0) return '#e8f5e9';
  if (val < 0) return '#ffebee';
  return '#f5f5f5';
};

interface SummaryRowProps {
  label: string;
  value: string;
  highlighted?: boolean;
  color?: string;
  bgColor?: string;
}

const SummaryRow = ({ label, value, highlighted, color, bgColor }: SummaryRowProps): React.ReactElement => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 1.5,
      px: 2,
      borderBottom: '1px solid #f0f0f0',
      bgcolor: bgColor || 'transparent',
      ...(highlighted ? { borderLeft: '4px solid', borderLeftColor: color || '#51cbce' } : {})
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#555' }}>{label}</Typography>
    <Typography
      variant="body1"
      sx={{
        fontWeight: highlighted ? 700 : 500,
        color: color || '#2c2c2c',
        fontSize: highlighted ? '1.1rem' : '0.95rem'
      }}
    >
      {value}
    </Typography>
  </Box>
);

const TransactionsByBettingPool = (): React.ReactElement => {
  const today = new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [selectedPool, setSelectedPool] = useState<BettingPool | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<TransactionSummaryItemAPI | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [pools, setPools] = useState<BettingPool[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(true);

  useEffect(() => {
    const loadPools = async () => {
      try {
        const response = await getBettingPools({ isActive: true, pageSize: 1000 });
        const items = response?.items ?? [];
        setPools(items);
      } catch (err) {
        console.error('Error loading betting pools:', err);
      } finally {
        setPoolsLoading(false);
      }
    };
    loadPools();
  }, []);

  const handleViewSales = useCallback(async () => {
    if (!selectedPool) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await getTransactionSummary({
        startDate,
        endDate,
        bettingPoolId: selectedPool.bettingPoolId
      });
      setSummaryData(data.items?.[0] ?? null);
    } catch (err) {
      console.error('Error loading summary:', err);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPool, startDate, endDate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#2c2c2c' }}>
        Resumen por banca
      </Typography>

      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth size="small" type="date" label="Fecha inicial"
                value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth size="small" type="date" label="Fecha final"
                value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                size="small"
                options={pools}
                loading={poolsLoading}
                value={selectedPool}
                onChange={(_e, val) => setSelectedPool(val)}
                getOptionLabel={(opt) => `${opt.bettingPoolCode ?? ''} - ${opt.bettingPoolName}${opt.reference ? ` (${opt.reference})` : ''}`}
                filterOptions={(options, { inputValue }) => {
                  const lower = inputValue.toLowerCase();
                  return options.filter(o =>
                    (o.bettingPoolCode ?? '').toLowerCase().includes(lower) ||
                    o.bettingPoolName.toLowerCase().includes(lower) ||
                    (o.reference ?? '').toLowerCase().includes(lower)
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Banca" placeholder="Buscar banca..." />
                )}
                isOptionEqualToValue={(opt, val) => opt.bettingPoolId === val.bettingPoolId}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth variant="contained" onClick={handleViewSales}
                disabled={!selectedPool || loading}
                sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase' }}
              >
                Ver ventas
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : hasSearched && (
        <Card elevation={1} sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ bgcolor: '#f5f5f5', py: 2, px: 2, borderBottom: '2px solid #51cbce' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center', color: '#2c2c2c' }}>
                Resumen de transacciones
              </Typography>
            </Box>

            {!summaryData ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No se encontraron datos para esta banca en el período seleccionado</Typography>
              </Box>
            ) : (
              <Box>
                <SummaryRow label="Banca" value={summaryData.bettingPoolName} />
                <SummaryRow label="Código" value={summaryData.code} />

                <Box sx={{ bgcolor: '#fafafa', py: 0.5, px: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Flujo de caja
                  </Typography>
                </Box>
                <SummaryRow label="Cobros" value={formatCurrency(summaryData.collections)} />
                <SummaryRow label="Pagos" value={formatCurrency(summaryData.payments)} />
                <SummaryRow
                  label="Flujo de caja neto"
                  value={formatCurrency(summaryData.cashFlowNet)}
                  highlighted
                  color={getNetColor(summaryData.cashFlowNet)}
                  bgColor={getNetBgColor(summaryData.cashFlowNet)}
                />

                <Box sx={{ bgcolor: '#fafafa', py: 0.5, px: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Resultados de sorteo
                  </Typography>
                </Box>
                <SummaryRow label="Débito" value={formatCurrency(summaryData.drawDebit)} />
                <SummaryRow label="Crédito" value={formatCurrency(summaryData.drawCredit)} />
                <SummaryRow
                  label="Resultado de sorteos neto"
                  value={formatCurrency(summaryData.drawNet)}
                  highlighted
                  color={getNetColor(summaryData.drawNet)}
                  bgColor={getNetBgColor(summaryData.drawNet)}
                />

                <SummaryRow label="Caída" value={formatCurrency(summaryData.fall)} />
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TransactionsByBettingPool;
