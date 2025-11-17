import { useState, useEffect, useMemo } from 'react';
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
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '@services/api';

const TABLE_COLUMNS = [
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

const DailySales = () => {
  console.log('📊 DailySales component mounted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bettingPools, setBettingPools] = useState([]);
  const [zones, setZones] = useState([]);

  // Tab state
  const [mainTab, setMainTab] = useState(0);

  // Filter state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [filterType, setFilterType] = useState('with-sales');
  const [searchTerm, setSearchTerm] = useState('');

  // Summary data
  const [netTotal, setNetTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Loading initial data...');
      const [poolsData, zonesData] = await Promise.all([
        api.get('/betting-pools'),
        api.get('/zones')
      ]);

      const poolsArray = poolsData?.items || poolsData || [];
      const zonesArray = zonesData?.items || zonesData || [];

      console.log('📊 Pools:', poolsArray.length, 'Zones:', zonesArray.length);

      setBettingPools(poolsArray);
      setZones(zonesArray);

      const allZoneIds = zonesArray.map(z => z.zoneId || z.id);
      setSelectedZones(allZoneIds);
    } catch (err) {
      console.error('📊 Error loading data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log('📊 Searching sales for date:', selectedDate);
      // TODO: Call actual API endpoint
      setLoading(false);
    } catch (err) {
      console.error('📊 Error searching:', err);
      setError(err.message);
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

  const handleZoneChange = (event) => {
    const value = event.target.value;
    setSelectedZones(typeof value === 'string' ? value.split(',') : value);
  };

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
        id: pool.bettingPoolId || pool.id,
        ref: pool.reference || `REF-${pool.bettingPoolId || pool.id}`,
        code: `LAN-${(pool.bettingPoolId || pool.id).toString().padStart(4, '0')}`,
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

  const formatCurrency = (value) => {
    return `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
            <Typography variant="h5" gutterBottom>
              Venta del día
            </Typography>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                type="date"
                label="Fecha"
                size="small"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                sx={{ width: 180 }}
                InputLabelProps={{ shrink: true }}
              />

              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel>Zonas</InputLabel>
                <Select
                  multiple
                  value={selectedZones}
                  onChange={handleZoneChange}
                  input={<OutlinedInput label="Zonas" />}
                  renderValue={(selected) => `${selected.length} seleccionadas`}
                >
                  {zones.map((zone) => (
                    <MenuItem key={zone.zoneId || zone.id} value={zone.zoneId || zone.id}>
                      <Checkbox checked={selectedZones.indexOf(zone.zoneId || zone.id) > -1} />
                      <ListItemText primary={zone.zoneName || zone.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Grupo</InputLabel>
                <Select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  label="Grupo"
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  <MenuItem value="group1">Grupo 1</MenuItem>
                  <MenuItem value="group2">Grupo 2</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                Ver ventas
              </Button>
              <Button variant="outlined" startIcon={<PdfIcon />} onClick={handleExportPdf}>
                PDF
              </Button>
              <Button variant="outlined" startIcon={<CsvIcon />} onClick={handleExportCsv}>
                CSV
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleProcessTodayTickets}>
                Procesar tickets de hoy
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleProcessYesterdaySales}>
                Procesar ventas de ayer
              </Button>
            </Box>

            {/* Net Total Summary */}
            <Typography variant="h6" gutterBottom>
              Neto (banca/grupos/agentes): {formatCurrency(totals.net)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Bancas Section */}
            <Typography variant="h6" gutterBottom>
              Total: {formatCurrency(totals.sales)}
            </Typography>

            {/* Filter Radio Group */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Filtros</FormLabel>
              <RadioGroup
                row
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {FILTER_OPTIONS.map(option => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio size="small" />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* Quick Filter */}
            <Box sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Filtro rapido"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
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

      {/* Placeholder for other tabs */}
      {mainTab > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6">
              {MAIN_TABS[mainTab]} - Funcionalidad pendiente
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DailySales;
