import React, { useState, useEffect, useMemo, useCallback, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  IconButton,
  InputAdornment,
  CircularProgress,
  Grid,
  type SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import {
  getTransactionSummary,
  type TransactionSummaryItemAPI,
  type OtherTransactionsSummaryAPI
} from '@services/transactionGroupService';
import { getAllZones } from '@services/zoneService';

type SortDirection = 'asc' | 'desc';
type SortKey = 'code' | 'bettingPoolName' | 'zoneName' | 'collections' | 'payments' | 'cashFlowNet' | 'drawDebit' | 'drawCredit' | 'drawNet' | 'fall' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface ZoneOption {
  zoneId: number;
  zoneName: string;
}

const formatCurrency = (val: number): string => {
  if (val < 0) return `-$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getNetColor = (val: number): string => {
  if (val > 0) return '#28a745';
  if (val < 0) return '#dc3545';
  return '#2c2c2c';
};

const TransactionsSummary = (): React.ReactElement => {
  const today = new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<TransactionSummaryItemAPI[]>([]);
  const [otherTransactions, setOtherTransactions] = useState<OtherTransactionsSummaryAPI>({ cashWithdrawals: 0, debit: 0, credit: 0 });
  const [zones, setZones] = useState<ZoneOption[]>([]);

  // Load zones on mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await getAllZones({ isActive: true, pageSize: 1000 });
        const data = (response as { data?: ZoneOption[] }).data ?? (response as ZoneOption[]);
        if (Array.isArray(data)) {
          setZones(data.map((z: ZoneOption) => ({ zoneId: z.zoneId, zoneName: z.zoneName })));
        }
      } catch (err) {
        console.error('Error loading zones:', err);
      }
    };
    loadZones();
  }, []);

  const loadSummary = useCallback(async () => {
    if (selectedZoneIds.length === 0) return;
    setLoading(true);
    try {
      const data = await getTransactionSummary({
        startDate,
        endDate,
        zoneIds: selectedZoneIds
      });
      setItems(data.items ?? []);
      setOtherTransactions(data.otherTransactions ?? { cashWithdrawals: 0, debit: 0, credit: 0 });
    } catch (err) {
      console.error('Error loading summary:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedZoneIds]);

  const handleFilter = useCallback(() => {
    loadSummary();
  }, [loadSummary]);

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleZoneChange = useCallback((e: SelectChangeEvent<number[]>) => {
    const value = e.target.value;
    if (typeof value === 'string') return;

    // Handle "all" toggle
    if (value.includes(-1)) {
      if (selectedZoneIds.length === zones.length) {
        setSelectedZoneIds([]);
      } else {
        setSelectedZoneIds(zones.map(z => z.zoneId));
      }
    } else {
      setSelectedZoneIds(value);
    }
  }, [zones, selectedZoneIds]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = items;

    if (quickFilter) {
      const lower = quickFilter.toLowerCase();
      filtered = filtered.filter(item =>
        item.code.toLowerCase().includes(lower) ||
        item.bettingPoolName.toLowerCase().includes(lower) ||
        item.zoneName.toLowerCase().includes(lower)
      );
    }

    if (sortConfig.key) {
      const key = sortConfig.key;
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [items, quickFilter, sortConfig]);

  const totals = useMemo(() => {
    return filteredAndSortedData.reduce(
      (acc, item) => ({
        collections: acc.collections + item.collections,
        payments: acc.payments + item.payments,
        cashFlowNet: acc.cashFlowNet + item.cashFlowNet,
        drawDebit: acc.drawDebit + item.drawDebit,
        drawCredit: acc.drawCredit + item.drawCredit,
        drawNet: acc.drawNet + item.drawNet,
        fall: acc.fall + item.fall
      }),
      { collections: 0, payments: 0, cashFlowNet: 0, drawDebit: 0, drawCredit: 0, drawNet: 0, fall: 0 }
    );
  }, [filteredAndSortedData]);

  const renderSortHeader = (key: SortKey, label: string, align: 'left' | 'right' | 'center' = 'left', extraSx?: Record<string, unknown>) => (
    <TableCell align={align} sx={{ ...extraSx }}>
      <TableSortLabel
        active={sortConfig.key === key}
        direction={sortConfig.key === key ? sortConfig.direction : 'asc'}
        onClick={() => handleSort(key)}
        sx={{ fontWeight: 600 }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#2c2c2c' }}>
        Resumen de transacciones
      </Typography>

      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth size="small" label="Fecha inicial" type="date"
                value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth size="small" label="Fecha final" type="date"
                value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Zonas</InputLabel>
                <Select
                  multiple
                  value={selectedZoneIds}
                  onChange={handleZoneChange}
                  input={<OutlinedInput label="Zonas" />}
                  renderValue={(selected) => {
                    if (selected.length === zones.length && zones.length > 0) return 'Todas';
                    return `${selected.length} seleccionada${selected.length !== 1 ? 's' : ''}`;
                  }}
                >
                  <MenuItem value={-1}>
                    <em>{selectedZoneIds.length === zones.length ? 'Deseleccionar todas' : 'Seleccionar todas'}</em>
                  </MenuItem>
                  {zones.map((zone) => (
                    <MenuItem key={zone.zoneId} value={zone.zoneId}>{zone.zoneName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                fullWidth variant="contained" onClick={handleFilter}
                disabled={selectedZoneIds.length === 0}
                sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase' }}
              >
                Filtrar
              </Button>
            </Grid>
          </Grid>

          <TextField
            fullWidth size="small" placeholder="Filtro rápido"
            value={quickFilter} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuickFilter(e.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small"><SearchIcon fontSize="small" /></IconButton></InputAdornment> }}
          />
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell rowSpan={2} sx={{ fontWeight: 600, verticalAlign: 'middle', borderRight: '1px solid #e0e0e0' }}>Código</TableCell>
                  <TableCell rowSpan={2} sx={{ fontWeight: 600, verticalAlign: 'middle', borderRight: '1px solid #e0e0e0' }}>Banca</TableCell>
                  <TableCell rowSpan={2} sx={{ fontWeight: 600, verticalAlign: 'middle', borderRight: '1px solid #e0e0e0' }}>Zona</TableCell>
                  <TableCell colSpan={3} align="center" sx={{ fontWeight: 600, borderBottom: '2px solid #51cbce', borderRight: '1px solid #e0e0e0' }}>Flujo de caja</TableCell>
                  <TableCell colSpan={3} align="center" sx={{ fontWeight: 600, borderBottom: '2px solid #51cbce', borderRight: '1px solid #e0e0e0' }}>Resultados de Sorteo</TableCell>
                  <TableCell rowSpan={2} sx={{ fontWeight: 600, verticalAlign: 'middle' }}>Caída</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  {renderSortHeader('collections', 'Cobros', 'right')}
                  {renderSortHeader('payments', 'Pagos', 'right')}
                  {renderSortHeader('cashFlowNet', 'Neto', 'right', { borderRight: '1px solid #e0e0e0', bgcolor: '#e8f5e9' })}
                  {renderSortHeader('drawDebit', 'Débito', 'right')}
                  {renderSortHeader('drawCredit', 'Crédito', 'right')}
                  {renderSortHeader('drawNet', 'Neto', 'right', { borderRight: '1px solid #e0e0e0', bgcolor: '#e8f5e9' })}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {items.length === 0 ? 'Seleccione zonas y haga clic en Filtrar' : 'No hay datos que coincidan con el filtro'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredAndSortedData.map((item, idx) => (
                      <TableRow key={`${item.code}-${idx}`} hover>
                        <TableCell sx={{ borderRight: '1px solid #f0f0f0' }}>{item.code}</TableCell>
                        <TableCell sx={{ borderRight: '1px solid #f0f0f0' }}>{item.bettingPoolName}</TableCell>
                        <TableCell sx={{ borderRight: '1px solid #f0f0f0' }}>{item.zoneName}</TableCell>
                        <TableCell align="right">{formatCurrency(item.collections)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.payments)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: getNetColor(item.cashFlowNet), bgcolor: '#f9fdf9', borderRight: '1px solid #f0f0f0' }}>
                          {formatCurrency(item.cashFlowNet)}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.drawDebit)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.drawCredit)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: getNetColor(item.drawNet), bgcolor: '#f9fdf9', borderRight: '1px solid #f0f0f0' }}>
                          {formatCurrency(item.drawNet)}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.fall)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Totales</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>-</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totals.collections)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totals.payments)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: getNetColor(totals.cashFlowNet), bgcolor: '#e8f5e9', borderRight: '1px solid #e0e0e0' }}>
                        {formatCurrency(totals.cashFlowNet)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totals.drawDebit)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totals.drawCredit)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: getNetColor(totals.drawNet), bgcolor: '#e8f5e9', borderRight: '1px solid #e0e0e0' }}>
                        {formatCurrency(totals.drawNet)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totals.fall)}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Mostrando {filteredAndSortedData.length} de {items.length} entradas
          </Typography>

          {/* Other transactions summary */}
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 600, color: '#2c2c2c' }}>
            Resumen otras transacciones
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell colSpan={3} align="center" sx={{ fontWeight: 600, borderBottom: '2px solid #51cbce' }}>Ajustes</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Retiros de efectivo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Débito</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Crédito</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell align="right">{formatCurrency(otherTransactions.cashWithdrawals)}</TableCell>
                  <TableCell align="right">{formatCurrency(otherTransactions.debit)}</TableCell>
                  <TableCell align="right">{formatCurrency(otherTransactions.credit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default TransactionsSummary;
