import { useState, useCallback, useMemo, useEffect } from 'react';
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
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '@services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import PayoutBancasDialog from './PayoutBancasDialog';
import { useTableSort } from '@/utils/useTableSort';

interface PayoutGroupDto {
  multiplier: number;
  label: string;
  lineCount: number;
  pendingCount: number;
  loserCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalNet: number;
}

interface PayoutGroupResponse {
  date: string;
  category: string;
  groups: PayoutGroupDto[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
  totalCount: number;
}

interface CategoriaPremiosTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const CategoriaPremiosTab = ({ selectedDate, setSelectedDate }: CategoriaPremiosTabProps): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PayoutGroupDto[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogMultiplier, setDialogMultiplier] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<PayoutGroupResponse>(
        `/reports/sales/prize-categories-by-payout?date=${selectedDate}&category=quiniela`
      );
      setData(response?.groups || []);
      setSummary(response?.summary || { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
    } catch (error) {
      console.error('Error loading quiniela payout groups:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Auto-load when the tab mounts or the shared date changes.
  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((d) => d.label.toLowerCase().includes(term));
  }, [data, searchTerm]);

  const { sortedData, getSortProps } = useTableSort(
    filteredData,
    (row, key) => {
      if (key === 'total') return row.pendingCount + row.loserCount + row.winnerCount;
      return (row as unknown as Record<string, string | number>)[key];
    },
    { sortBy: 'multiplier', sortOrder: 'asc' },
  );

  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => ({
      pendingCount: acc.pendingCount + row.pendingCount,
      loserCount: acc.loserCount + row.loserCount,
      winnerCount: acc.winnerCount + row.winnerCount,
      totalSold: acc.totalSold + row.totalSold,
      totalPrizes: acc.totalPrizes + row.totalPrizes,
      totalNet: acc.totalNet + row.totalNet,
    }), {
      pendingCount: 0, loserCount: 0, winnerCount: 0, totalSold: 0, totalPrizes: 0, totalNet: 0,
    });
  }, [filteredData]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
          Total: <Box component="span" sx={{
            backgroundColor: '#ede9fe',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: '#6d28d9'
          }}>{formatCurrency(summary.totalSold)}</Box>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Fecha
            </Typography>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{
                width: 200,
                '& .MuiInputBase-root': { height: 32 },
                '& .MuiInputBase-input': { py: 0.5, fontSize: '0.8rem' },
              }}
            />
          </Box>
          <Button
            variant="contained"
            onClick={loadData}
            disabled={loading}
            size="small"
            sx={{
              borderRadius: '20px',
              px: 2.5,
              py: 0.5,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {loading ? <CircularProgress size={16} color="inherit" /> : 'Ver reporte'}
          </Button>
        </Box>

        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <TextField
            size="small"
            placeholder="Filtrado rápido"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('multiplier')}>Premio</TableSortLabel></TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('pendingCount')}>P</TableSortLabel></TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('loserCount')}>L</TableSortLabel></TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('winnerCount')}>W</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('total')}>Total</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalSold')}>Venta</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Comisiones</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalPrizes')}>Premios</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalNet')}>Neto</TableSortLabel></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? 'Cargando...' : 'No hay entradas para el sorteo y la fecha elegidos'}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {sortedData.map((row) => (
                    <TableRow
                      key={row.multiplier}
                      hover
                      onClick={() => setDialogMultiplier(row.multiplier)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ color: '#1976d2', textDecoration: 'underline' }}>{row.label}</TableCell>
                      <TableCell align="center">{row.pendingCount}</TableCell>
                      <TableCell align="center">{row.loserCount}</TableCell>
                      <TableCell align="center">{row.winnerCount}</TableCell>
                      <TableCell align="right">{row.pendingCount + row.loserCount + row.winnerCount}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalSold)}</TableCell>
                      <TableCell align="right">{formatCurrency(0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalPrizes)}</TableCell>
                      <TableCell align="right" sx={{ color: row.totalNet < 0 ? 'error.main' : 'inherit' }}>
                        {formatCurrency(row.totalNet)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                    <TableCell>Totales</TableCell>
                    <TableCell align="center">{totals.pendingCount}</TableCell>
                    <TableCell align="center">{totals.loserCount}</TableCell>
                    <TableCell align="center">{totals.winnerCount}</TableCell>
                    <TableCell align="right">{totals.pendingCount + totals.loserCount + totals.winnerCount}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalSold)}</TableCell>
                    <TableCell align="right">{formatCurrency(0)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalPrizes)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalNet)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Mostrando {filteredData.length} grupo(s) de pago
        </Typography>

        <PayoutBancasDialog
          open={dialogMultiplier !== null}
          onClose={() => setDialogMultiplier(null)}
          category="quiniela"
          multiplier={dialogMultiplier}
          selectedDate={selectedDate}
        />
      </CardContent>
    </Card>
  );
};

export default CategoriaPremiosTab;
