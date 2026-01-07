/**
 * DailySales Component
 *
 * Main daily sales view with multiple tabs and filters.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '@services/api';
import { formatCurrency } from '@/utils/formatCurrency';

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
import { TABLE_COLUMNS, MAIN_TABS, INITIAL_TOTALS } from './constants';

// ============================================================================
// Main Component
// ============================================================================

const DailySales = (): React.ReactElement => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // Tab state
  const [mainTab, setMainTab] = useState<number>(0);
  const [subTab, setSubTab] = useState<number>(0);

  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
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
        ref: item.bettingPoolName,
        code: item.bettingPoolCode,
        p: item.pendingCount || 0,
        l: item.loserCount || 0,
        w: item.winnerCount || 0,
        total: (item.pendingCount || 0) + (item.loserCount || 0) + (item.winnerCount || 0),
        sales: item.totalSold,
        commissions: item.totalCommissions,
        discounts: 0,
        prizes: item.totalPrizes,
        net: item.totalNet,
        fall: 0,
        final: item.totalNet,
        balance: 0,
        accumulatedFall: 0,
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
        api.get<{ items?: BettingPool[] } | BettingPool[]>('/betting-pools'),
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

      await loadSalesData(new Date().toISOString().split('T')[0]);
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

  const handleExportPdf = useCallback(() => {
    alert('Exportar a PDF - Funcionalidad pendiente');
  }, []);

  const handleExportCsv = useCallback(() => {
    alert('Exportar a CSV - Funcionalidad pendiente');
  }, []);

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
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, pt: 0 }}>
      {/* Main Tabs */}
      <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ mb: 1 }}>
        {MAIN_TABS.map((tab, index) => (
          <Tab key={index} label={tab} />
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
              selectedGroup={selectedGroup}
              onDateChange={setSelectedDate}
              onZoneChange={handleZoneChange}
              onGroupChange={setSelectedGroup}
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
                <Tab label="Bancas" />
                <Tab label="Resultados" />
              </Tabs>

              {/* Bancas Sub-Tab */}
              {subTab === 0 && (
                <>
                  <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
                    Venta del día Total: <Box component="span" sx={{
                      backgroundColor: '#e0f7fa',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      color: '#00838f'
                    }}>{formatCurrency(totals.sales)}</Box>
                  </Typography>

                  <FilterToggles
                    filterType={filterType}
                    onFilterChange={setFilterType}
                  />
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
                {/* Quick Filter */}
                <Box sx={{ mb: 2, textAlign: 'right' }}>
                  <TextField
                    size="small"
                    placeholder="Filtro rapido"
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

                {/* Sales Table */}
                <SalesTable
                  data={filteredData}
                  totals={totals}
                  columns={TABLE_COLUMNS}
                  onCodeClick={handleCodeClick}
                />

                {/* Entry Counter */}
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Mostrando {filteredData.length} entradas
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
