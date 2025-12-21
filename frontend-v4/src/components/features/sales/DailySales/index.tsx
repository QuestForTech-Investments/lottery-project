import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Paper,
  CircularProgress,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Search as SearchIcon
} from '@mui/icons-material';
import api from '@services/api';

// Import tab components
import BancaPorSorteoTab from './tabs/BancaPorSorteoTab';
import PorSorteoTab from './tabs/PorSorteoTab';
import CombinacionesTab from './tabs/CombinacionesTab';
import PorZonaTab from './tabs/PorZonaTab';
import CategoriaPremiosTab from './tabs/CategoriaPremiosTab';
import CategoriaPremiosPaleTab from './tabs/CategoriaPremiosPaleTab';

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface BettingPool {
  bettingPoolId?: number;
  id?: number;
  reference?: string;
}

interface SalesRow {
  id: number;
  ref: string;
  code: string;
  p: number;
  l: number;
  w: number;
  total: number;
  sales: number;
  commissions: number;
  discounts: number;
  prizes: number;
  net: number;
  fall: number;
  final: number;
  balance: number;
  accumulatedFall: number;
}

// API response type
interface BettingPoolSalesDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  zoneId: number;
  zoneName: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface _SalesTotals {
  p: number;
  l: number;
  w: number;
  total: number;
  sales: number;
  commissions: number;
  discounts: number;
  prizes: number;
  net: number;
  fall: number;
  final: number;
  balance: number;
  accumulatedFall: number;
}

interface TableColumn {
  key: string;
  label: string;
  align: 'left' | 'center' | 'right';
}

interface _FilterOption {
  value: string;
  label: string;
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'ref', label: 'Ref.', align: 'left' },
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'p', label: 'P', align: 'center' },
  { key: 'l', label: 'L', align: 'center' },
  { key: 'w', label: 'W', align: 'center' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'sales', label: 'Venta', align: 'right' },
  { key: 'commissions', label: 'Comisiones', align: 'right' },
  { key: 'discounts', label: 'Descuentos', align: 'right' },
  { key: 'prizes', label: 'Premios', align: 'right' },
  { key: 'net', label: 'Neto', align: 'right' },
  { key: 'fall', label: 'Caída', align: 'right' },
  { key: 'final', label: 'Final', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'accumulatedFall', label: 'Caida acumulada', align: 'right' }
];

const MAIN_TABS = [
  'General',
  'Banca por sorteo',
  'Por sorteo',
  'Combinaciones',
  'Por zona',
  'Categoría de Premios',
  'Categoría de Premios para Pale'
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'with-sales', label: 'Con ventas' },
  { value: 'with-prizes', label: 'Con premios' },
  { value: 'pending-tickets', label: 'Con tickets pendientes' },
  { value: 'negative-net', label: 'Con ventas netas negativas' },
  { value: 'positive-net', label: 'Con ventas netas positivas' }
];

const DailySales = (): React.ReactElement => {
  console.log('[DATA] DailySales component mounted');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // Tab state
  const [mainTab, setMainTab] = useState<number>(0);

  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sales data from API
  const [salesData, setSalesData] = useState<SalesRow[]>([]);

  // Function to load sales data from API
  const loadSalesData = async (date: string) => {
    try {
      console.log('[DATA] Loading sales for date:', date);
      const response = await api.get<BettingPoolSalesDto[]>(
        `/reports/sales/by-betting-pool?startDate=${date}&endDate=${date}`
      );

      // Map API response to table row format
      const mappedData: SalesRow[] = (response || []).map((item: BettingPoolSalesDto) => ({
        id: item.bettingPoolId,
        ref: item.bettingPoolName,
        code: item.bettingPoolCode,
        p: 0, // Not available from this endpoint
        l: 0, // Not available from this endpoint
        w: 0, // Not available from this endpoint
        total: 0, // Not available from this endpoint
        sales: item.totalSold,
        commissions: item.totalCommissions,
        discounts: 0, // Not available from this endpoint
        prizes: item.totalPrizes,
        net: item.totalNet,
        fall: 0, // Not available from this endpoint
        final: item.totalNet, // Same as net for now
        balance: 0, // Not available from this endpoint
        accumulatedFall: 0, // Not available from this endpoint
      }));

      console.log('[DATA] Sales data loaded:', mappedData.length, 'records');
      setSalesData(mappedData);
    } catch (err) {
      console.error('[DATA] Error loading sales:', err);
      // Don't set error here, just log it - sales loading failure shouldn't block the UI
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DATA] Loading initial data...');
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

      console.log('[DATA] Pools:', poolsArray.length, 'Zones:', zonesArray.length);

      setBettingPools(poolsArray);
      setZones(zonesArray);

      const allZoneIds = zonesArray.map((z: Zone) => z.zoneId || z.id).filter((id): id is number => id !== undefined);
      setSelectedZones(allZoneIds);

      // Load sales data for today
      await loadSalesData(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error('[DATA] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      await loadSalesData(selectedDate);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    alert('Exportar a PDF - Funcionalidad pendiente');
  };

  const handleExportCsv = () => {
    alert('Exportar a CSV - Funcionalidad pendiente');
  };

  const handleProcessTodayTickets = () => {
    alert('Procesar tickets de hoy - Funcionalidad pendiente');
  };

  const handleProcessYesterdaySales = () => {
    alert('Procesar ventas de ayer - Funcionalidad pendiente');
  };

  const handleZoneChange = useCallback((event: SelectChangeEvent<number[]>): void => {
    const value = event.target.value;
    setSelectedZones(typeof value === 'string' ? value.split(',').map(Number) : value);
  }, []);

  // Note: salesData is now loaded from API via loadSalesData()
  // Removed mock data generation

  // Filter data
  const filteredData = useMemo(() => {
    let data = [...salesData];

    // Apply filter type
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
      default:
        break;
    }

    // Apply search filter
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
  const totals = useMemo(() => {
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
    }), {
      p: 0, l: 0, w: 0, total: 0, sales: 0, commissions: 0, discounts: 0,
      prizes: 0, net: 0, fall: 0, final: 0, balance: 0, accumulatedFall: 0
    });
  }, [filteredData]);

  const formatCurrency = useCallback((value: number): string => {
    return `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  if (loading && bettingPools.length === 0) {
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
      <Tabs value={mainTab} onChange={(e, v) => setMainTab(v)} sx={{ mb: 1 }}>
        {MAIN_TABS.map((tab, index) => (
          <Tab key={index} label={tab} />
        ))}
      </Tabs>

      {/* General Tab Content */}
      {mainTab === 0 && (
        <Card>
          <CardContent sx={{ pt: 1 }}>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Fecha
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  sx={{ width: 200 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Zonas
                </Typography>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <Select
                    multiple
                    value={selectedZones}
                    onChange={handleZoneChange}
                    input={<OutlinedInput />}
                    renderValue={(selected) => `${selected.length} seleccionadas`}
                  >
                    {zones.map((zone) => {
                      const zoneId = zone.zoneId || zone.id || 0;
                      return (
                        <MenuItem key={zoneId} value={zoneId}>
                          <Checkbox checked={selectedZones.indexOf(zoneId) > -1} />
                          <ListItemText primary={zone.zoneName || zone.name} />
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Grupo
                </Typography>
                <FormControl sx={{ minWidth: 150 }} size="small">
                  <Select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    <MenuItem value="group1">Grupo 1</MenuItem>
                    <MenuItem value="group2">Grupo 2</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Action Buttons - Pill Style */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.2,
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                Ver ventas
              </Button>
              <Button
                variant="contained"
                onClick={handleExportPdf}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.2,
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                PDF
              </Button>
              <Button
                variant="contained"
                onClick={handleExportCsv}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.2,
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                CSV
              </Button>
              <Button
                variant="contained"
                onClick={handleProcessTodayTickets}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.2,
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                Procesar tickets de hoy
              </Button>
              <Button
                variant="contained"
                onClick={handleProcessYesterdaySales}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.2,
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                Procesar ventas de ayer
              </Button>
            </Box>

            {/* Bancas Sub-Tab */}
            <Box sx={{ mb: 3 }}>
              <Tabs value={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tab label="Bancas" />
              </Tabs>

              {/* Total with highlighted background */}
              <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
                Venta del día Total: <Box component="span" sx={{
                  backgroundColor: '#e0f7fa',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  color: '#00838f'
                }}>{formatCurrency(totals.sales)}</Box>
              </Typography>

              {/* Filter Toggle Buttons */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                  Filtros
                </Typography>
                <ToggleButtonGroup
                  value={filterType}
                  exclusive
                  onChange={(e, newValue) => newValue && setFilterType(newValue)}
                  size="small"
                  sx={{
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    '& .MuiToggleButton-root': {
                      border: 'none',
                      borderRight: '1px solid #d1d5db',
                      borderRadius: 0,
                      px: 2,
                      py: 0.6,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'none',
                      color: '#64748b',
                      backgroundColor: '#fff',
                      transition: 'all 0.15s ease',
                      '&:last-of-type': {
                        borderRight: 'none',
                      },
                      '&:hover': {
                        backgroundColor: '#f8f7ff',
                        color: '#7c3aed',
                      },
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: '#fff',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        },
                      },
                    },
                  }}
                >
                  {FILTER_OPTIONS.map(option => (
                    <ToggleButton key={option.value} value={option.value}>
                      {option.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            </Box>

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

            {/* Data Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {TABLE_COLUMNS.map(col => (
                      <TableCell key={col.key} align={col.align}>
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} align="center">
                        No hay datos disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {filteredData.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{row.ref}</TableCell>
                          <TableCell>{row.code}</TableCell>
                          <TableCell align="center">{row.p}</TableCell>
                          <TableCell align="center">{row.l}</TableCell>
                          <TableCell align="center">{row.w}</TableCell>
                          <TableCell align="right">{row.total}</TableCell>
                          <TableCell align="right">{formatCurrency(row.sales)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.commissions)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.discounts)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.prizes)}</TableCell>
                          <TableCell align="right" sx={{ color: row.net < 0 ? 'error.main' : 'inherit' }}>
                            {formatCurrency(row.net)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(row.fall)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.final)}</TableCell>
                          <TableCell align="right" sx={{ color: row.balance < 0 ? 'error.main' : 'success.main' }}>
                            {formatCurrency(row.balance)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(row.accumulatedFall)}</TableCell>
                        </TableRow>
                      ))}
                      {/* Totals Row */}
                      <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell><strong>Totales</strong></TableCell>
                        <TableCell>-</TableCell>
                        <TableCell align="center">{totals.p}</TableCell>
                        <TableCell align="center">{totals.l}</TableCell>
                        <TableCell align="center">{totals.w}</TableCell>
                        <TableCell align="right">{totals.total}</TableCell>
                        <TableCell align="right">{formatCurrency(totals.sales)}</TableCell>
                        <TableCell align="right">{formatCurrency(totals.commissions)}</TableCell>
                        <TableCell align="right">{formatCurrency(totals.discounts)}</TableCell>
                        <TableCell align="right">{formatCurrency(totals.prizes)}</TableCell>
                        <TableCell align="right">{formatCurrency(totals.net)}</TableCell>
                        <TableCell align="right">{formatCurrency(totals.fall)}</TableCell>
                        <TableCell align="right">{formatCurrency(totals.final)}</TableCell>
                        <TableCell align="right">{formatCurrency(totals.balance)}</TableCell>
                        <TableCell align="right">{formatCurrency(totals.accumulatedFall)}</TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Entry Counter */}
            <Typography variant="body2" sx={{ mt: 2 }}>
              Mostrando {filteredData.length} entradas
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Banca por sorteo */}
      {mainTab === 1 && (
        <BancaPorSorteoTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          zones={zones}
          selectedZones={selectedZones}
          handleZoneChange={handleZoneChange}
        />
      )}

      {/* Tab 3: Por sorteo */}
      {mainTab === 2 && (
        <PorSorteoTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          zones={zones}
          selectedZones={selectedZones}
          handleZoneChange={handleZoneChange}
        />
      )}

      {/* Tab 4: Combinaciones */}
      {mainTab === 3 && (
        <CombinacionesTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          zones={zones}
          selectedZones={selectedZones}
          handleZoneChange={handleZoneChange}
        />
      )}

      {/* Tab 5: Por zona */}
      {mainTab === 4 && (
        <PorZonaTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          zones={zones}
          selectedZones={selectedZones}
          handleZoneChange={handleZoneChange}
        />
      )}

      {/* Tab 6: Categoría de Premios */}
      {mainTab === 5 && (
        <CategoriaPremiosTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}

      {/* Tab 7: Categoría de Premios para Pale */}
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
