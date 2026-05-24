import React, { useState, useEffect, useMemo, memo } from 'react';
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
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  type SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '@services/api';
import { formatCurrency } from '@/utils/formatCurrency';

interface WeekDay {
  key: string;
  label: string;
}

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface BettingPool {
  bettingPoolId?: number;
  id?: number;
  bettingPoolName?: string;
  name?: string;
  zone?: { id?: number };
  zoneId?: number;
}

interface PoolWithWeeklyData {
  bettingPoolId: number;
  bettingPoolCode?: string;
  bettingPoolName?: string;
  zoneId?: number;
  zoneName?: string;
  weekStart?: string;
  code: string;
  poolName: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  [key: string]: string | number | undefined;
}

type OrderDirection = 'asc' | 'desc';

const DaysWithoutSalesReport: React.FC = () => {
  const { t } = useTranslation();
  const WEEKDAYS: WeekDay[] = [
    { key: 'monday', label: t('bettingPoolsAdmin.monday') },
    { key: 'tuesday', label: t('bettingPoolsAdmin.tuesday') },
    { key: 'wednesday', label: t('bettingPoolsAdmin.wednesday') },
    { key: 'thursday', label: t('bettingPoolsAdmin.thursday') },
    { key: 'friday', label: t('bettingPoolsAdmin.friday') },
    { key: 'saturday', label: t('bettingPoolsAdmin.saturday') },
    { key: 'sunday', label: t('bettingPoolsAdmin.sunday') }
  ];
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PoolWithWeeklyData[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sorting state
  const [orderBy, setOrderBy] = useState<string>('code');
  const [order, setOrder] = useState<OrderDirection>('asc');

  // Load zones once on mount.
  useEffect(() => {
    (async () => {
      try {
        const zonesData = await api.get('/zones?pageSize=1000') as { items?: Zone[] } | Zone[];
        const zonesArray: Zone[] = Array.isArray(zonesData) ? zonesData : (zonesData?.items || []);
        setZones(zonesArray);
        setSelectedZones(zonesArray.map(z => z.zoneId || z.id || 0));
      } catch (err) {
        console.error('[SCHEDULE] Error loading zones:', err);
      }
    })();
  }, []);

  const handleSearch = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const zoneParam = selectedZones.length > 0 && selectedZones.length < zones.length
        ? `&zoneIds=${selectedZones.join(',')}`
        : '';
      const data = await api.get(
        `/betting-pools/weekly-sales?date=${selectedDate}${zoneParam}`,
      ) as Array<{
        bettingPoolId: number;
        bettingPoolCode?: string;
        bettingPoolName?: string;
        zoneId?: number;
        zoneName?: string;
        weekStart?: string;
        monday: number;
        tuesday: number;
        wednesday: number;
        thursday: number;
        friday: number;
        saturday: number;
        sunday: number;
      }>;
      const mapped: PoolWithWeeklyData[] = (data || []).map((p) => ({
        bettingPoolId: p.bettingPoolId,
        bettingPoolCode: p.bettingPoolCode,
        bettingPoolName: p.bettingPoolName,
        zoneId: p.zoneId,
        zoneName: p.zoneName,
        weekStart: p.weekStart,
        code: p.bettingPoolCode || `#${p.bettingPoolId}`,
        poolName: p.bettingPoolName || t('bettingPoolsAdmin.noNameFallback'),
        monday: p.monday || 0,
        tuesday: p.tuesday || 0,
        wednesday: p.wednesday || 0,
        thursday: p.thursday || 0,
        friday: p.friday || 0,
        saturday: p.saturday || 0,
        sunday: p.sunday || 0,
      }));
      setResults(mapped);
    } catch (err) {
      const error = err as Error;
      console.error('[SCHEDULE] Error searching:', error);
      setError(error.message || 'Error searching');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run when zones load + whenever the date changes.
  useEffect(() => {
    if (zones.length > 0) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones.length, selectedDate]);

  const handleSort = (property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleZoneChange = (event: SelectChangeEvent<number[]>): void => {
    const value = event.target.value;
    setSelectedZones(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  // Filter and sort the real backend results.
  const filteredAndSortedData = useMemo((): PoolWithWeeklyData[] => {
    let data = [...results];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        pool.code?.toLowerCase().includes(term) ||
        pool.poolName?.toLowerCase().includes(term)
      );
    }

    // Sort
    data.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (orderBy) {
        case 'code':
          aValue = (a.code || '').toLowerCase();
          bValue = (b.code || '').toLowerCase();
          break;
        case 'name':
          aValue = (a.poolName || '').toLowerCase();
          bValue = (b.poolName || '').toLowerCase();
          break;
        default:
          aValue = (a[orderBy] as number) || 0;
          bValue = (b[orderBy] as number) || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return order === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return data;
  }, [results, searchTerm, orderBy, order]);

  if (loading && results.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography color="error" variant="h6">
              {t('bettingPoolsAdmin.errorPrefix', { message: error })}
            </Typography>
            <Button onClick={handleSearch} sx={{ mt: 2 }}>
              {t('sales.retry')}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }


  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
            {t('bettingPoolsAdmin.daysWithoutSalesTitle')}
          </Typography>

          {/* Filters Section */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              type="date"
              label={t('bettingPoolsAdmin.dateLabel')}
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{ width: { xs: '100%', sm: 180 } }}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
              <InputLabel>{t('common.zones')}</InputLabel>
              <Select
                multiple
                value={selectedZones}
                onChange={handleZoneChange}
                input={<OutlinedInput label={t('common.zones')} />}
                renderValue={(selected) => t('bettingPoolsAdmin.selectedCount', { count: selected.length })}
              >
                {zones.map((zone) => (
                  <MenuItem key={zone.zoneId || zone.id} value={zone.zoneId || zone.id || 0}>
                    <Checkbox checked={selectedZones.indexOf(zone.zoneId || zone.id || 0) > -1} />
                    <ListItemText primary={zone.zoneName || zone.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              {t('bettingPoolsAdmin.viewSales')}
            </Button>
          </Box>

          {/* Quick Filter */}
          <Box sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder={t('bettingPoolsAdmin.quickFilter')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 300 } }}
            />
          </Box>

          {/* Data Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: { xs: 600, sm: 'auto' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'code'}
                      direction={orderBy === 'code' ? order : 'asc'}
                      onClick={() => handleSort('code')}
                    >
                      {t('bettingPoolsAdmin.tableCode')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      {t('bettingPoolsAdmin.tableName')}
                    </TableSortLabel>
                  </TableCell>
                  {WEEKDAYS.map(day => (
                    <TableCell key={day.key} align="right">
                      <TableSortLabel
                        active={orderBy === day.key}
                        direction={orderBy === day.key ? order : 'asc'}
                        onClick={() => handleSort(day.key)}
                      >
                        {day.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {t('bettingPoolsAdmin.noDataAvailable')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((pool) => (
                    <TableRow key={pool.bettingPoolId} hover>
                      <TableCell>{pool.code}</TableCell>
                      <TableCell>{pool.poolName}</TableCell>
                      {WEEKDAYS.map((day) => {
                        const amount = Number(pool[day.key] ?? 0);
                        // 0 → red, < 1000 → yellow, ≥ 1000 → green
                        const tone =
                          amount <= 0
                            ? { bg: '#fdecea', color: '#c62828' }
                            : amount < 1000
                              ? { bg: '#fff8e1', color: '#b26a00' }
                              : { bg: '#e8f5e9', color: '#2e7d32' };
                        return (
                          <TableCell
                            key={day.key}
                            align="right"
                            sx={{
                              backgroundColor: tone.bg,
                              color: tone.color,
                              fontWeight: 600,
                            }}
                          >
                            {formatCurrency(amount)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Entry Counter */}
          <Typography variant="body2" sx={{ mt: 2 }}>
            {t('common.showingEntries', { shown: filteredAndSortedData.length, total: filteredAndSortedData.length })}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default memo(DaysWithoutSalesReport);
