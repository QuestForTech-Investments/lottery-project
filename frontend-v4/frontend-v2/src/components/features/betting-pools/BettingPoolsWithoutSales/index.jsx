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
  OutlinedInput,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '@services/api';

const BettingPoolsWithoutSales = () => {
  console.log('📊 BettingPoolsWithoutSales component mounted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bettingPools, setBettingPools] = useState([]);
  const [zones, setZones] = useState([]);

  // Filter state
  const [daysWithoutSales, setDaysWithoutSales] = useState(7);
  const [selectedZones, setSelectedZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [orderBy, setOrderBy] = useState('number');
  const [order, setOrder] = useState('asc');

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

      // Select all zones by default
      const allZoneIds = zonesArray.map(z => z.zoneId || z.id);
      setSelectedZones(allZoneIds);
    } catch (err) {
      console.error('📊 Error loading data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
      console.log('📊 Loading complete');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Searching with days:', daysWithoutSales, 'zones:', selectedZones);
      // TODO: Call actual API endpoint when available
      // const data = await api.get(`/betting-pools/without-sales?days=${daysWithoutSales}&zoneIds=${selectedZones.join(',')}`);
      // setBettingPools(data?.items || data || []);

      // For now, filter existing pools (mock behavior)
      // In production, this would be an API call
      setLoading(false);
    } catch (err) {
      console.error('📊 Error searching:', err);
      setError(err.message || 'Error searching');
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    // TODO: Implement PDF export
    alert('Exportar a PDF - Funcionalidad pendiente');
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

  // Generate mock "days without sales" data for demo purposes
  const poolsWithDaysData = useMemo(() => {
    return bettingPools.map(pool => {
      // Generate random days without sales (1-7) for demo
      const daysNoSales = Math.floor(Math.random() * daysWithoutSales) + 1;
      const lastSaleDate = new Date();
      lastSaleDate.setDate(lastSaleDate.getDate() - daysNoSales);

      return {
        ...pool,
        daysWithoutSales: daysNoSales,
        lastSaleDate: lastSaleDate.toISOString().split('T')[0],
        zoneName: pool.zoneName || pool.zone?.name || 'Sin zona'
      };
    });
  }, [bettingPools, daysWithoutSales]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = [...poolsWithDaysData];

    // Filter by selected zones
    if (selectedZones.length > 0 && selectedZones.length < zones.length) {
      data = data.filter(pool =>
        selectedZones.includes(pool.zoneId || pool.zone?.id)
      );
    }

    // Filter by days
    data = data.filter(pool => pool.daysWithoutSales <= daysWithoutSales);

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        (pool.bettingPoolId || pool.id)?.toString().includes(term) ||
        (pool.bettingPoolName || pool.name)?.toLowerCase().includes(term) ||
        (pool.reference || '')?.toLowerCase().includes(term) ||
        pool.zoneName?.toLowerCase().includes(term)
      );
    }

    // Sort
    data.sort((a, b) => {
      let aValue, bValue;

      switch (orderBy) {
        case 'number':
          aValue = a.bettingPoolId || a.id || 0;
          bValue = b.bettingPoolId || b.id || 0;
          break;
        case 'name':
          aValue = (a.bettingPoolName || a.name || '').toLowerCase();
          bValue = (b.bettingPoolName || b.name || '').toLowerCase();
          break;
        case 'reference':
          aValue = (a.reference || '').toLowerCase();
          bValue = (b.reference || '').toLowerCase();
          break;
        case 'days':
          aValue = a.daysWithoutSales || 0;
          bValue = b.daysWithoutSales || 0;
          break;
        case 'lastSale':
          aValue = a.lastSaleDate || '';
          bValue = b.lastSaleDate || '';
          break;
        case 'zone':
          aValue = (a.zoneName || '').toLowerCase();
          bValue = (b.zoneName || '').toLowerCase();
          break;
        case 'balance':
          aValue = a.balance || 0;
          bValue = b.balance || 0;
          break;
        default:
          aValue = a[orderBy];
          bValue = b[orderBy];
      }

      if (typeof aValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return data;
  }, [poolsWithDaysData, selectedZones, zones.length, daysWithoutSales, searchTerm, orderBy, order]);

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

  console.log('📊 Rendering BettingPoolsWithoutSales, pools:', filteredAndSortedData.length);

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Lista de bancas sin ventas
          </Typography>

          {/* Filters Section */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>En los últimos</Typography>
              <TextField
                type="number"
                size="small"
                value={daysWithoutSales}
                onChange={(e) => setDaysWithoutSales(parseInt(e.target.value) || 7)}
                sx={{ width: 80 }}
                inputProps={{ min: 1, max: 365 }}
              />
              <Typography>Días</Typography>
            </Box>

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

            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={handleExportPdf}
            >
              PDF
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
                      active={orderBy === 'number'}
                      direction={orderBy === 'number' ? order : 'asc'}
                      onClick={() => handleSort('number')}
                    >
                      Número
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
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'reference'}
                      direction={orderBy === 'reference' ? order : 'asc'}
                      onClick={() => handleSort('reference')}
                    >
                      Referencia
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'days'}
                      direction={orderBy === 'days' ? order : 'asc'}
                      onClick={() => handleSort('days')}
                    >
                      Días
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'lastSale'}
                      direction={orderBy === 'lastSale' ? order : 'asc'}
                      onClick={() => handleSort('lastSale')}
                    >
                      Última venta
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'zone'}
                      direction={orderBy === 'zone' ? order : 'asc'}
                      onClick={() => handleSort('zone')}
                    >
                      Zona
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'balance'}
                      direction={orderBy === 'balance' ? order : 'asc'}
                      onClick={() => handleSort('balance')}
                    >
                      Balance
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay bancas sin ventas en el período seleccionado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((pool) => (
                    <TableRow key={pool.bettingPoolId || pool.id} hover>
                      <TableCell>{pool.bettingPoolId || pool.id}</TableCell>
                      <TableCell>{pool.bettingPoolName || pool.name}</TableCell>
                      <TableCell>{pool.reference || '-'}</TableCell>
                      <TableCell>{pool.daysWithoutSales}</TableCell>
                      <TableCell>{pool.lastSaleDate}</TableCell>
                      <TableCell>{pool.zoneName}</TableCell>
                      <TableCell>
                        ${(pool.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
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

export default BettingPoolsWithoutSales;
