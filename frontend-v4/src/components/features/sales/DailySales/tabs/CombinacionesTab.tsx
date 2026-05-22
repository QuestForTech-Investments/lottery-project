import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import type { SelectChangeEvent } from '@mui/material/Select';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '@services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { MultiSelectSearch } from '@/components/common';
import { useTableSort } from '@/utils/useTableSort';

/**
 * Map the raw game-type name (from `game_types.game_name`) to the user-facing
 * label used in the new column names (Pick3 / Pick4 / Quiniela …).
 * Unknown names fall through unchanged.
 */
const prettyBetTypeName = (raw: string | null | undefined): string => {
  if (!raw) return '';
  return raw
    .replace(/^Cash3\b/i, 'Pick3')
    .replace(/^Play4\b/i, 'Pick4')
    .replace(/^Directo\b/i, 'Quiniela');
};

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface CombinationSalesDto {
  betNumber: string;
  drawId: number;
  drawName: string;
  betTypeId: number;
  betTypeName: string;
  lineCount: number;
  totalSold: number;
  totalCommissions: number;
  totalPrizes: number;
  balance: number;
}

interface CombinationsResponse {
  date: string;
  drawId: number | null;
  combinations: CombinationSalesDto[];
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
  lotteryName?: string;
}

interface BettingPool {
  id: number;
  bettingPoolId?: number;
  name?: string;
  code?: string;
}

interface CombinacionesTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  zones: Zone[];
  selectedZones: number[];
  handleZoneChange: (event: SelectChangeEvent<number[]>) => void;
}

const CombinacionesTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }: CombinacionesTabProps): React.ReactElement => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CombinationSalesDto[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [draws, setDraws] = useState<Draw[]>([]);
  const [selectedDraws, setSelectedDraws] = useState<number[]>([]);
  const [bancas, setBancas] = useState<BettingPool[]>([]);
  const [selectedBancas, setSelectedBancas] = useState<number[]>([]);

  // Load draws and bancas on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        // Load draws
        const drawsResponse = await api.get<{ items?: Draw[] } | Draw[]>('/draws?pageSize=500');
        const drawsArray = (drawsResponse && typeof drawsResponse === 'object' && 'items' in drawsResponse)
          ? (drawsResponse.items || [])
          : (drawsResponse as Draw[] || []);
        setDraws(drawsArray);
        setSelectedDraws(drawsArray.map(d => d.drawId));

        // Load bancas
        const bancasResponse = await api.get<{ items?: BettingPool[] } | BettingPool[]>('/betting-pools?pageSize=1000');
        const bancasArray = (bancasResponse && typeof bancasResponse === 'object' && 'items' in bancasResponse)
          ? (bancasResponse.items || [])
          : (bancasResponse as BettingPool[] || []);
        const normalizedBancas = bancasArray.map((b: BettingPool) => ({
          id: b.bettingPoolId || b.id,
          name: b.name || '',
          code: b.code || ''
        }));
        setBancas(normalizedBancas);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  }, []);


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<CombinationsResponse>(
        `/reports/sales/combinations?date=${selectedDate}`
      );
      setData(response?.combinations || []);
      setSummary(response?.summary || { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
    } catch (error) {
      console.error('Error loading combinations:', error);
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
    return data.filter(d =>
      d.betNumber.includes(term) ||
      d.drawName.toLowerCase().includes(term) ||
      d.betTypeName.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  /**
   * Combinations grouped by bet type — one row per type with summed totals.
   * Search still narrows the underlying rows (so filtering by "25" only counts
   * the plays that include that number), then we aggregate what's left.
   */
  type AggRow = {
    betTypeId: number;
    betTypeName: string;
    lineCount: number;
    totalSold: number;
    totalCommissions: number;
    totalPrizes: number;
    balance: number;
  };
  const groupedData = useMemo<AggRow[]>(() => {
    const map = new Map<number, AggRow>();
    for (const row of filteredData) {
      const existing = map.get(row.betTypeId);
      if (existing) {
        existing.lineCount += row.lineCount;
        existing.totalSold += row.totalSold;
        existing.totalCommissions += row.totalCommissions;
        existing.totalPrizes += row.totalPrizes;
        existing.balance += row.balance;
      } else {
        map.set(row.betTypeId, {
          betTypeId: row.betTypeId,
          betTypeName: row.betTypeName,
          lineCount: row.lineCount,
          totalSold: row.totalSold,
          totalCommissions: row.totalCommissions,
          totalPrizes: row.totalPrizes,
          balance: row.balance,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      prettyBetTypeName(a.betTypeName).localeCompare(prettyBetTypeName(b.betTypeName)),
    );
  }, [filteredData]);

  const { sortedData, getSortProps } = useTableSort(
    groupedData,
    (row, key) => {
      if (key === 'betTypeName') return prettyBetTypeName(row.betTypeName);
      return (row as unknown as Record<string, string | number>)[key];
    },
    { sortBy: 'betTypeName', sortOrder: 'asc' },
  );

  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => ({
      lineCount: acc.lineCount + row.lineCount,
      totalSold: acc.totalSold + row.totalSold,
      totalCommissions: acc.totalCommissions + row.totalCommissions,
      totalPrizes: acc.totalPrizes + row.totalPrizes,
      balance: acc.balance + row.balance
    }), {
      lineCount: 0, totalSold: 0, totalCommissions: 0, totalPrizes: 0, balance: 0
    });
  }, [filteredData]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          {t('sales.tabs.combinaciones')}
        </Typography>

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

          <MultiSelectSearch
            label={t('common.bettingPools')}
            selectAllLabel={t('common.all')}
            options={bancas.map((b) => ({ id: b.id, label: `${b.code} - ${b.name}` }))}
            selectedIds={selectedBancas}
            onChange={setSelectedBancas}
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
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('betTypeName')}>{t('sales.combination')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('totalSold')}>{t('sales.totalSold')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('totalCommissions')}>{t('sales.totalCommissions')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}>{t('sales.totalCommissions2')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('totalPrizes')}>{t('sales.totalPrizes')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}><TableSortLabel {...getSortProps('balance')}>{t('sales.balances')}</TableSortLabel></TableCell>
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
                  {sortedData.map((row) => (
                    <TableRow key={row.betTypeId} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {prettyBetTypeName(row.betTypeName)} ({row.lineCount})
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(row.totalSold)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalCommissions)}</TableCell>
                      <TableCell align="right">{formatCurrency(0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalPrizes)}</TableCell>
                      <TableCell align="right" sx={{ color: row.balance > 0 ? '#2e7d32' : row.balance < 0 ? '#c62828' : '#1565c0', fontWeight: 600 }}>
                        {formatCurrency(row.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                    <TableCell>{t('balances.totals')}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalSold)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalCommissions)}</TableCell>
                    <TableCell align="right">{formatCurrency(0)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalPrizes)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.balance)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="body2" sx={{ mt: 2 }}>
          {t('sales.showingPlayTypes', { count: groupedData.length })}
          {' '}({t('sales.combinationsCount', { filtered: filteredData.length, total: data.length })})
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CombinacionesTab;
