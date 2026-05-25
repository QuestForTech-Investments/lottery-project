/**
 * DailySales Component
 *
 * Main daily sales view with multiple tabs and filters.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '@services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { getTodayDate } from '@/utils/formatters';
import { exportToCsv, exportToPdf, type ExportColumn } from '@/utils/exportTable';

// Tab components
import BancaPorSorteoTab from './tabs/BancaPorSorteoTab';
import PorSorteoTab from './tabs/PorSorteoTab';
import CombinacionesTab from './tabs/CombinacionesTab';
import PorZonaTab from './tabs/PorZonaTab';
import CategoriaPremiosTab from './tabs/CategoriaPremiosTab';
import CategoriaPremiosPaleTab from './tabs/CategoriaPremiosPaleTab';
import ResultadosSubTab from './tabs/ResultadosSubTab';

// Local components
import { FiltersSection, ActionButtons, FilterToggles, SalesTable } from './components';

// Local types and constants
import type { Zone, BettingPool, SalesRow, BettingPoolSalesDto, SalesTotals } from './types';
import { TABLE_COLUMNS, TABLE_COLUMNS_MOBILE, MAIN_TABS, INITIAL_TOTALS } from './constants';

// ============================================================================
// Main Component
// ============================================================================

const DailySales = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  // Mobile reorders the table so Venta appears right after Código.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const tableColumns = isMobile ? TABLE_COLUMNS_MOBILE : TABLE_COLUMNS;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // Tab state — can be pre-selected via ?tab=<index> in URL
  const [searchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [mainTab, setMainTab] = useState<number>(isNaN(initialTab) ? 0 : initialTab);
  const [subTab, setSubTab] = useState<number>(0);

  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getTodayDate();
  });
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sales data
  const [salesData, setSalesData] = useState<SalesRow[]>([]);

  // Load sales data
  const loadSalesData = useCallback(async (date: string) => {
    try {
      const response = await api.get<BettingPoolSalesDto[]>(
        `/reports/sales/by-betting-pool?startDate=${date}&endDate=${date}`
      );

      const mappedData: SalesRow[] = (response || []).map((item) => ({
        id: item.bettingPoolId,
        ref: item.reference || '',
        code: item.bettingPoolCode,
        p: item.pendingCount || 0,
        l: item.loserCount || 0,
        w: item.winnerCount || 0,
        total: (item.pendingCount || 0) + (item.loserCount || 0) + (item.winnerCount || 0),
        sales: item.totalSold,
        commissions: item.totalCommissions,
        discounts: item.totalDiscounts,
        prizes: item.totalPrizes,
        net: item.totalNet,
        fall: item.fall || 0,
        final: item.totalNet - (item.fall || 0),
        balance: item.balance || 0,
        accumulatedFall: item.accumulatedFall || 0,
      }));

      setSalesData(mappedData);
    } catch (err) {
      console.error('[DATA] Error loading sales:', err);
    }
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [poolsData, zonesData] = await Promise.all([
        api.get<{ items?: BettingPool[] } | BettingPool[]>('/betting-pools?pageSize=1000'),
        api.get<{ items?: Zone[] } | Zone[]>('/zones')
      ]);

      const poolsArray = (poolsData && typeof poolsData === 'object' && 'items' in poolsData)
        ? (poolsData.items || [])
        : (poolsData as BettingPool[] || []);
      const zonesArray = (zonesData && typeof zonesData === 'object' && 'items' in zonesData)
        ? (zonesData.items || [])
        : (zonesData as Zone[] || []);

      setBettingPools(poolsArray);
      setZones(zonesArray);

      const allZoneIds = zonesArray.map((z) => z.zoneId || z.id).filter((id): id is number => id !== undefined);
      setSelectedZones(allZoneIds);

      await loadSalesData(getTodayDate());
    } catch (err) {
      console.error('[DATA] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [loadSalesData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Event handlers
  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      await loadSalesData(selectedDate);
    } finally {
      setLoading(false);
    }
  }, [loadSalesData, selectedDate]);


  const handleProcessTodayTickets = useCallback(() => {
    alert('Procesar tickets de hoy - Funcionalidad pendiente');
  }, []);

  const handleProcessYesterdaySales = useCallback(() => {
    alert('Procesar ventas de ayer - Funcionalidad pendiente');
  }, []);

  const handleZoneChange = useCallback((event: SelectChangeEvent<number[]>): void => {
    const value = event.target.value;
    setSelectedZones(typeof value === 'string' ? value.split(',').map(Number) : value);
  }, []);

  const handleCodeClick = useCallback((bettingPoolId: number) => {
    navigate(`/tickets/monitoring?bettingPoolId=${bettingPoolId}&date=${selectedDate}`);
  }, [navigate, selectedDate]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data = [...salesData];

    switch (filterType) {
      case 'with-sales':
        data = data.filter(d => d.sales > 0);
        break;
      case 'with-prizes':
        data = data.filter(d => d.prizes > 0);
        break;
      case 'pending-tickets':
        data = data.filter(d => d.p > 0);
        break;
      case 'negative-net':
        data = data.filter(d => d.net < 0);
        break;
      case 'positive-net':
        data = data.filter(d => d.net > 0);
        break;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(d =>
        d.ref.toLowerCase().includes(term) ||
        d.code.toLowerCase().includes(term)
      );
    }

    return data;
  }, [salesData, filterType, searchTerm]);

  // Calculate totals
  const totals = useMemo<SalesTotals>(() => {
    return filteredData.reduce((acc, row) => ({
      p: acc.p + row.p,
      l: acc.l + row.l,
      w: acc.w + row.w,
      total: acc.total + row.total,
      sales: acc.sales + row.sales,
      commissions: acc.commissions + row.commissions,
      discounts: acc.discounts + row.discounts,
      prizes: acc.prizes + row.prizes,
      net: acc.net + row.net,
      fall: acc.fall + row.fall,
      final: acc.final + row.final,
      balance: acc.balance + row.balance,
      accumulatedFall: acc.accumulatedFall + row.accumulatedFall
    }), INITIAL_TOTALS);
  }, [filteredData]);

  // Map TABLE_COLUMNS → export columns. Money cells get currency-formatted so
  // the CSV/PDF mirror what's on screen.
  const exportColumns = useMemo<ExportColumn<Record<string, unknown>>[]>(() => {
    const moneyKeys = new Set([
      'total', 'sales', 'commissions', 'discounts', 'prizes',
      'net', 'fall', 'final', 'balance', 'accumulatedFall',
    ]);
    return TABLE_COLUMNS.map(col => ({
      key: col.key,
      label: col.label,
      align: col.align as 'left' | 'right' | 'center',
      getValue: moneyKeys.has(col.key)
        ? (row) => formatCurrency(Number(row[col.key] ?? 0))
        : undefined,
    }));
  }, []);

  const totalsAsRow = useMemo<Record<string, unknown>>(
    () => ({ ref: 'Totales', code: '', ...totals }),
    [totals],
  );

  const handleExportPdf = useCallback(() => {
    if (filteredData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    exportToPdf(
      filteredData as unknown as Record<string, unknown>[],
      exportColumns,
      `Ventas del día — ${selectedDate}`,
      totalsAsRow,
    );
  }, [filteredData, exportColumns, selectedDate, totalsAsRow]);

  const handleExportCsv = useCallback(() => {
    if (filteredData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    exportToCsv(
      filteredData as unknown as Record<string, unknown>[],
      exportColumns,
      `ventas-${selectedDate}`,
      totalsAsRow,
    );
  }, [filteredData, exportColumns, selectedDate, totalsAsRow]);

  // Loading state
  if (loading && bettingPools.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography color="error" variant="h6">
              Error: {error}
            </Typography>
            <Button onClick={loadInitialData} sx={{ mt: 2 }}>
              {t('sales.retry')}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, pt: 0 }}>
      {/* Main Tabs */}
      <Tabs
        value={mainTab}
        onChange={(_, v) => setMainTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 1 }}
      >
        {MAIN_TABS.map((tabKey, index) => (
          <Tab key={index} label={t(tabKey)} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
        ))}
      </Tabs>

      {/* General Tab Content */}
      {mainTab === 0 && (
        <Card>
          <CardContent sx={{ pt: 1 }}>
            {/* Filters */}
            <FiltersSection
              selectedDate={selectedDate}
              zones={zones}
              selectedZones={selectedZones}
              onDateChange={setSelectedDate}
              onZoneChange={handleZoneChange}
            />

            {/* Action Buttons */}
            <ActionButtons
              loading={loading}
              onSearch={handleSearch}
              onExportPdf={handleExportPdf}
              onExportCsv={handleExportCsv}
              onProcessTodayTickets={handleProcessTodayTickets}
              onProcessYesterdaySales={handleProcessYesterdaySales}
            />

            {/* Sub-Tabs */}
            <Box sx={{ mb: 3 }}>
              <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tab label={t('sales.tabs.bancas')} />
                <Tab label={t('sales.tabs.resultados')} />
              </Tabs>

              {/* Bancas Sub-Tab */}
              {subTab === 0 && (
                <>
                  <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
                    {t('sales.finalSaleOfDay')}: <Box component="span" sx={{
                      backgroundColor: totals.final > 0 ? '#e8f5e9' : totals.final < 0 ? '#ffebee' : '#e3f2fd',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      color: totals.final > 0 ? '#2e7d32' : totals.final < 0 ? '#c62828' : '#1565c0'
                    }}>{formatCurrency(totals.final)}</Box>
                  </Typography>

                  {/* Filter controls - left-aligned on desktop, centered on mobile */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' }, gap: 2, mb: 3 }}>
                    <FilterToggles
                      filterType={filterType}
                      onFilterChange={setFilterType}
                    />

                    {/* Quick Filter */}
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
                      sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                  </Box>
                </>
              )}

              {/* Resultados Sub-Tab */}
              {subTab === 1 && (
                <ResultadosSubTab selectedDate={selectedDate} />
              )}
            </Box>

            {/* Bancas Tab Content */}
            {subTab === 0 && (
              <>

                {/* Sales Table */}
                <SalesTable
                  data={filteredData}
                  totals={totals}
                  columns={tableColumns}
                  onCodeClick={handleCodeClick}
                />

                {/* Entry Counter */}
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {t('sales.showingEntries', { count: filteredData.length })}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other Tabs */}
      {mainTab === 1 && (
        <BancaPorSorteoTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          zones={zones}
          selectedZones={selectedZones}
          handleZoneChange={handleZoneChange}
        />
      )}

      {mainTab === 2 && (
        <PorSorteoTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          zones={zones}
          selectedZones={selectedZones}
          handleZoneChange={handleZoneChange}
        />
      )}

      {mainTab === 3 && (
        <CombinacionesTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          zones={zones}
          selectedZones={selectedZones}
          handleZoneChange={handleZoneChange}
        />
      )}

      {mainTab === 4 && (
        <PorZonaTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          zones={zones}
          selectedZones={selectedZones}
          handleZoneChange={handleZoneChange}
        />
      )}

      {mainTab === 5 && (
        <CategoriaPremiosTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}

      {mainTab === 6 && (
        <CategoriaPremiosPaleTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}
    </Box>
  );
};

export default DailySales;
