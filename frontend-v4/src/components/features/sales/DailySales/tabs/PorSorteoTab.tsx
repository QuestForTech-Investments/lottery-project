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
import { MultiSelectSearch } from '@/components/common';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTableSort } from '@/utils/useTableSort';

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface DrawSalesDto {
  drawId: number;
  drawName: string;
  lotteryName: string | null;
  drawTime: string;
  drawColor: string | null;
  lotteryImageUrl: string | null;
  ticketCount: number;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface DrawSalesResponse {
  date: string;
  draws: DrawSalesDto[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
  totalCount: number;
}

interface PorSorteoTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  zones: Zone[];
  selectedZones: number[];
  handleZoneChange: (event: SelectChangeEvent<number[]>) => void;
}

const PorSorteoTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }: PorSorteoTabProps): React.ReactElement => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DrawSalesDto[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<DrawSalesResponse>(
        `/reports/sales/by-draw?date=${selectedDate}`
      );
      setData(response?.draws || []);
      setSummary(response?.summary || { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
    } catch (error) {
      console.error('Error loading sales by draw:', error);
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
      d.drawName.toLowerCase().includes(term) ||
      (d.lotteryName && d.lotteryName.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const { sortedData, getSortProps } = useTableSort(
    filteredData,
    (row, key) => (row as unknown as Record<string, string | number>)[key],
    { sortBy: 'drawName', sortOrder: 'asc' },
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.75rem' }}>
          {t('sales.salesByDraw')}
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

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.7rem' }}>
          {t('sales.totalNet')}: <Box component="span" sx={{
            backgroundColor: '#ede9fe',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: '#6d28d9'
          }}>{formatCurrency(summary.totalNet)}</Box>
        </Typography>

        {data.length === 0 && !loading && (
          <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.25rem' }}>
            {t('sales.noEntriesForDrawDate')}
          </Typography>
        )}

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

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('drawName')}>{t('common.draw')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalSold')}>{t('sales.totalSold')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalPrizes')}>{t('sales.totalPrizes')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalCommissions')}>{t('sales.totalCommissions')}</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalNet')}>{t('sales.totalNet')}</TableSortLabel></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? t('common.loading') : t('sales.noEntriesForDrawDate')}
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row) => (
                  <TableRow key={row.drawId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {row.lotteryImageUrl ? (
                          <Box
                            component="img"
                            src={row.lotteryImageUrl}
                            alt={row.lotteryName || row.drawName}
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              objectFit: 'cover',
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              // Fallback to colored circle if the image fails to load.
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : row.drawColor ? (
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: row.drawColor,
                          }} />
                        ) : null}
                        {row.drawName}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(row.totalSold)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.totalPrizes)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.totalCommissions)}</TableCell>
                    <TableCell align="right" sx={{ color: row.totalNet < 0 ? 'error.main' : 'inherit' }}>
                      {formatCurrency(row.totalNet)}
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                <TableCell>{t('balances.totals')}</TableCell>
                <TableCell align="right">{formatCurrency(summary.totalSold)}</TableCell>
                <TableCell align="right">{formatCurrency(summary.totalPrizes)}</TableCell>
                <TableCell align="right">{formatCurrency(summary.totalCommissions)}</TableCell>
                <TableCell align="right">{formatCurrency(summary.totalNet)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="body2" sx={{ mt: 2 }}>
          {t('common.showingEntries', { shown: filteredData.length, total: data.length })}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PorSorteoTab;
