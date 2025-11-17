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
  OutlinedInput
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '@services/api';

const WEEKDAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const DaysWithoutSalesReport = () => {
  console.log('📅 DaysWithoutSalesReport component mounted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bettingPools, setBettingPools] = useState([]);
  const [zones, setZones] = useState([]);

  // Filter state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedZones, setSelectedZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [orderBy, setOrderBy] = useState('code');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📅 Loading initial data...');
      const [poolsData, zonesData] = await Promise.all([
        api.get('/betting-pools'),
        api.get('/zones')
      ]);

      const poolsArray = poolsData?.items || poolsData || [];
      const zonesArray = zonesData?.items || zonesData || [];

      console.log('📅 Pools:', poolsArray.length, 'Zones:', zonesArray.length);

      setBettingPools(poolsArray);
      setZones(zonesArray);

      // Select all zones by default
      const allZoneIds = zonesArray.map(z => z.zoneId || z.id);
      setSelectedZones(allZoneIds);
    } catch (err) {
      console.error('📅 Error loading data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
      console.log('📅 Loading complete');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📅 Searching with date:', selectedDate, 'zones:', selectedZones);
      // TODO: Call actual API endpoint when available
      // const data = await api.get(`/betting-pools/weekly-sales?date=${selectedDate}&zoneIds=${selectedZones.join(',')}`);
      // setBettingPools(data?.items || data || []);
      setLoading(false);
    } catch (err) {
      console.error('📅 Error searching:', err);
      setError(err.message || 'Error searching');
      setLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleZoneChange = (event) => {
    const value = event.target.value;
    setSelectedZones(typeof value === 'string' ? value.split(',') : value);
  };

  // Generate mock weekly sales data for demo purposes
  const poolsWithWeeklyData = useMemo(() => {
    return bettingPools.map(pool => {
      // Generate random sales for each day of the week
      const weeklySales = {};
      WEEKDAYS.forEach(day => {
        // 30% chance of no sales, otherwise random amount
        const hasSales = Math.random() > 0.3;
        weeklySales[day.key] = hasSales ? Math.floor(Math.random() * 1000) + Math.random() * 100 : 0;
      });

      // Generate pool code like "LAN-0001"
      const poolId = pool.bettingPoolId || pool.id || 0;
      const code = `LAN-${poolId.toString().padStart(4, '0')}`;

      return {
        ...pool,
        code,
        poolName: pool.bettingPoolName || pool.name || 'Sin nombre',
        ...weeklySales
      };
    });
  }, [bettingPools]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = [...poolsWithWeeklyData];

    // Filter by selected zones
    if (selectedZones.length > 0 && selectedZones.length < zones.length) {
      data = data.filter(pool =>
        selectedZones.includes(pool.zoneId || pool.zone?.id)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        pool.code?.toLowerCase().includes(term) ||
        pool.poolName?.toLowerCase().includes(term)
      );
    }

    // Sort
    data.sort((a, b) => {
      let aValue, bValue;

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
          aValue = a[orderBy] || 0;
          bValue = b[orderBy] || 0;
      }

      if (typeof aValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return data;
  }, [poolsWithWeeklyData, selectedZones, zones.length, searchTerm, orderBy, order]);

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

  console.log('📅 Rendering DaysWithoutSalesReport, pools:', filteredAndSortedData.length);

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Bancas con dias sin vender
          </Typography>

          {/* Filters Section */}
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

            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              Ver ventas
            </Button>
          </Box>

          {/* Quick Filter */}
          <Box sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Filtrado rápido"
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
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'code'}
                      direction={orderBy === 'code' ? order : 'asc'}
                      onClick={() => handleSort('code')}
                    >
                      Código
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Nombre
                    </TableSortLabel>
                  </TableCell>
                  {WEEKDAYS.map(day => (
                    <TableCell key={day.key} align="right">
                      {day.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((pool) => (
                    <TableRow key={pool.bettingPoolId || pool.id} hover>
                      <TableCell>{pool.code}</TableCell>
                      <TableCell>{pool.poolName}</TableCell>
                      {WEEKDAYS.map(day => (
                        <TableCell
                          key={day.key}
                          align="right"
                          sx={{
                            color: pool[day.key] === 0 ? 'error.main' : 'inherit',
                            fontWeight: pool[day.key] === 0 ? 'bold' : 'normal'
                          }}
                        >
                          {formatCurrency(pool[day.key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Entry Counter */}
          <Typography variant="body2" sx={{ mt: 2 }}>
            Mostrando {filteredAndSortedData.length} de {filteredAndSortedData.length} entradas
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DaysWithoutSalesReport;
