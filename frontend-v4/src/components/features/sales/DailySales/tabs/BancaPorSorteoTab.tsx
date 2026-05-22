import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
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
  CircularProgress,
  InputAdornment
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '@services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { MultiSelectSearch } from '@/components/common';
import { useTableSort } from '@/utils/useTableSort';

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface DrawSalesDetail {
  drawId: number;
  drawName: string;
  sold: number;
  prizes: number;
  commissions: number;
  net: number;
}

interface BettingPoolDrawSales {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  reference?: string;
  zoneId: number;
  zoneName: string;
  drawSales: DrawSalesDetail[];
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface DrawTotals {
  drawId: number;
  drawName: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface BettingPoolDrawResponse {
  date: string;
  bettingPools: BettingPoolDrawSales[];
  drawTotals: DrawTotals[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
  totalCount: number;
}

interface Draw {
  drawId: number;
  drawName?: string;
  lotteryId?: number;
  lotteryName?: string;
}

interface BancaPorSorteoTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  zones: Zone[];
  selectedZones: number[];
  handleZoneChange: (event: SelectChangeEvent<number[]>) => void;
}

const BancaPorSorteoTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }: BancaPorSorteoTabProps): React.ReactElement => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDrawId = searchParams.get('drawId');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BettingPoolDrawSales[]>([]);
  const [drawTotals, setDrawTotals] = useState<DrawTotals[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  const [draws, setDraws] = useState<Draw[]>([]);
  const [selectedDraws, setSelectedDraws] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoSearch, setAutoSearch] = useState(false);

  // Load draws on mount
  useEffect(() => {
    const loadDraws = async () => {
      try {
        const response = await api.get<{ items?: Draw[] } | Draw[]>('/draws?pageSize=500');
        const drawsArray = (response && typeof response === 'object' && 'items' in response)
          ? (response.items || [])
          : (response as Draw[] || []);
        setDraws(drawsArray);

        // If a drawId is in the URL, pre-select only that draw and auto-trigger search
        if (urlDrawId) {
          const dId = parseInt(urlDrawId);
          const match = drawsArray.find(d => d.drawId === dId);
          setSelectedDraws(match ? [dId] : drawsArray.map(d => d.drawId));
          // Consume the param so it doesn't re-apply on subsequent renders
          searchParams.delete('drawId');
          setSearchParams(searchParams, { replace: true });
          // Auto-trigger search for today
          setAutoSearch(true);
        } else {
          setSelectedDraws(drawsArray.map(d => d.drawId));
        }
      } catch (error) {
        console.error('Error loading draws:', error);
      }
    };
    loadDraws();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger auto-search after draws are loaded (e.g., when arriving via a dashboard link)
  useEffect(() => {
    if (autoSearch && selectedDraws.length > 0) {
      setAutoSearch(false);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSearch, selectedDraws]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<BettingPoolDrawResponse>(
        `/reports/sales/betting-pool-by-draw?startDate=${selectedDate}&endDate=${selectedDate}`
      );
      setData(response?.bettingPools || []);
      setDrawTotals(response?.drawTotals || []);
      setSummary(response?.summary || { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
    } catch (error) {
      console.error('Error loading betting pool by draw:', error);
      setData([]);
      setDrawTotals([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Auto-load when the tab mounts or the shared date changes.
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(d =>
      d.bettingPoolName.toLowerCase().includes(term) ||
      d.bettingPoolCode.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const { sortedData, getSortProps } = useTableSort(
    filteredData,
    (row, key) => {
      if (key === 'reference') return row.reference ?? '';
      return (row as unknown as Record<string, string | number>)[key];
    },
    { sortBy: 'bettingPoolCode', sortOrder: 'asc' },
  );

  // Get unique draws from data for columns
  const uniqueDraws = drawTotals;

  // Calculate totals for the filtered data
  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => ({
      totalSold: acc.totalSold + row.totalSold,
      totalPrizes: acc.totalPrizes + row.totalPrizes,
      totalCommissions: acc.totalCommissions + row.totalCommissions,
      totalNet: acc.totalNet + row.totalNet
    }), { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  }, [filteredData]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          {t('sales.amountsByDrawPool')}
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              {t('common.date')}
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

          <MultiSelectSearch
            label={t('common.draws')}
            selectAllLabel={t('common.all')}
            options={draws.map((d) => ({
              id: d.drawId,
              label: d.drawName || d.lotteryName || `Draw ${d.drawId}`,
            }))}
            selectedIds={selectedDraws}
            onChange={setSelectedDraws}
          />

          <MultiSelectSearch
            label={t('common.zones')}
            selectAllLabel={t('common.all')}
            options={zones.map((z) => ({ id: z.zoneId || z.id || 0, label: z.zoneName || z.name || '' }))}
            selectedIds={selectedZones}
            onChange={(ids) => {
              handleZoneChange({ target: { value: ids } } as unknown as SelectChangeEvent<number[]>);
            }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
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
              fontWeight: 500
            }}
          >
            {loading ? <CircularProgress size={16} color="inherit" /> : t('transactions.viewSales')}
          </Button>
        </Box>

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
          {t('sales.totalNet')}: <Box component="span" sx={{
            backgroundColor: '#ede9fe',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: '#6d28d9'
          }}>{formatCurrency(totals.totalNet)}</Box>
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder={t('common.filterQuick')}
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

        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
          <Table size="small" stickyHeader>
            <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('reference')}>{t('sales.ref')}</TableSortLabel></TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('bettingPoolName')}>{t('common.bettingPool')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('totalSold')}>{t('sales.totalSold')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('totalPrizes')}>{t('sales.totalPrizes')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('totalCommissions')}>{t('sales.totalCommissions')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('totalNet')}>{t('sales.totalNet')}</TableSortLabel></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? t('common.loading') : t('sales.noEntriesForDrawDate')}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {sortedData.map((pool) => (
                    <TableRow key={pool.bettingPoolId} hover>
                      <TableCell>{pool.reference || ''}</TableCell>
                      <TableCell>{pool.bettingPoolName}</TableCell>
                      <TableCell align="right">{formatCurrency(pool.totalSold)}</TableCell>
                      <TableCell align="right">{formatCurrency(pool.totalPrizes)}</TableCell>
                      <TableCell align="right">{formatCurrency(pool.totalCommissions)}</TableCell>
                      <TableCell align="right" sx={{ color: pool.totalNet < 0 ? 'error.main' : 'inherit' }}>
                        {formatCurrency(pool.totalNet)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                    <TableCell colSpan={2}>{t('balances.totals')}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalSold)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalPrizes)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalCommissions)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalNet)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Mostrando {filteredData.length} de {data.length} entradas
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BancaPorSorteoTab;
