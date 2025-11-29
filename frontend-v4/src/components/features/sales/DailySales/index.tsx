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

interface _SalesRow {
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
  const [filterType, setFilterType] = useState<string>('with-sales');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Summary data
  const [_netTotal, _setNetTotal] = useState<number>(0);
  const [_grandTotal, _setGrandTotal] = useState<number>(0);

  useEffect(() => {
    loadInitialData();
  }, []);

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
    } catch (err) {
      console.error('[DATA] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log('[DATA] Searching sales for date:', selectedDate);
      // TODO: Call actual API endpoint
      setLoading(false);
    } catch (err) {
      console.error('[DATA] Error searching:', err);
      setError(err instanceof Error ? err.message : 'Error searching');
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

  // Generate mock sales data
  const salesData = useMemo(() => {
    return bettingPools.map(pool => {
      const sales = Math.random() > 0.3 ? Math.floor(Math.random() * 5000) : 0;
      const commissions = sales * 0.1;
      const discounts = sales * 0.02;
      const prizes = Math.random() > 0.7 ? Math.floor(Math.random() * 1000) : 0;
      const net = sales - commissions - discounts - prizes;
      const fall = Math.random() > 0.5 ? Math.floor(Math.random() * 500) : 0;
      const final = net - fall;
      const balance = Math.floor(Math.random() * 2000) - 1000;
      const accumulatedFall = Math.floor(Math.random() * 3000);

      return {
        id: pool.bettingPoolId || pool.id || 0,
        ref: pool.reference || `REF-${pool.bettingPoolId || pool.id || 0}`,
        code: `LAN-${(pool.bettingPoolId || pool.id || 0).toString().padStart(4, '0')}`,
        p: Math.floor(Math.random() * 10),
        l: Math.floor(Math.random() * 10),
        w: Math.floor(Math.random() * 10),
        total: Math.floor(Math.random() * 20),
        sales,
        commissions,
        discounts,
        prizes,
        net,
        fall,
        final,
        balance,
        accumulatedFall
      };
    });
  }, [bettingPools]);

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
    <Box sx={{ p: 3 }}>
      {/* Main Tabs */}
      <Tabs value={mainTab} onChange={(e, v) => setMainTab(v)} sx={{ mb: 2 }}>
        {MAIN_TABS.map((tab, index) => (
          <Tab key={index} label={tab} />
        ))}
      </Tabs>

      {/* General Tab Content */}
      {mainTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
              Venta del día
            </Typography>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
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

            {/* Net Total Summary */}
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
              Neto (banca/grupos/agentes): {formatCurrency(totals.net)}
            </Typography>

            {/* Bancas Sub-Tab */}
            <Box sx={{ mb: 3 }}>
              <Tabs value={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tab label="Bancas" />
              </Tabs>

              {/* Total with highlighted background */}
              <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
                Total: <Box component="span" sx={{
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
                  sx={{ flexWrap: 'wrap' }}
                >
                  {FILTER_OPTIONS.map(option => (
                    <ToggleButton
                      key={option.value}
                      value={option.value}
                      sx={{
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        px: 2,
                        py: 0.8
                      }}
                    >
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
                </TableHead>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} align="center">
                        No hay datos disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row) => (
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
                    ))
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
