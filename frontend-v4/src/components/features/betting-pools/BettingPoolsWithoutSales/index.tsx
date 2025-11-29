import React, { useState, useEffect, useMemo, memo } from 'react';
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
  PictureAsPdf as PdfIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '@services/api';

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
  reference?: string;
  zoneName?: string;
  zone?: { id?: number; name?: string };
  zoneId?: number;
  balance?: number;
}

interface PoolWithDaysData extends BettingPool {
  daysWithoutSales: number;
  lastSaleDate: string;
  [key: string]: string | number | { id?: number; name?: string } | undefined;
}

type OrderDirection = 'asc' | 'desc';

const BettingPoolsWithoutSales: React.FC = () => {
  console.log('[DATA] BettingPoolsWithoutSales component mounted');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // Filter state
  const [daysWithoutSales, setDaysWithoutSales] = useState<number>(7);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sorting state
  const [orderBy, setOrderBy] = useState<string>('number');
  const [order, setOrder] = useState<OrderDirection>('asc');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DATA] Loading initial data...');
      const [poolsData, zonesData] = await Promise.all([
        api.get('/betting-pools') as Promise<{ items?: BettingPool[] } | BettingPool[]>,
        api.get('/zones') as Promise<{ items?: Zone[] } | Zone[]>
      ]);

      const poolsArray: BettingPool[] = Array.isArray(poolsData) ? poolsData : (poolsData?.items || []);
      const zonesArray: Zone[] = Array.isArray(zonesData) ? zonesData : (zonesData?.items || []);

      console.log('[DATA] Pools:', poolsArray.length, 'Zones:', zonesArray.length);

      setBettingPools(poolsArray);
      setZones(zonesArray);

      // Select all zones by default
      const allZoneIds = zonesArray.map(z => z.zoneId || z.id || 0);
      setSelectedZones(allZoneIds);
    } catch (err) {
      const error = err as Error;
      console.error('[DATA] Error loading data:', error);
      setError(error.message || 'Error loading data');
    } finally {
      setLoading(false);
      console.log('[DATA] Loading complete');
    }
  };

  const handleSearch = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DATA] Searching with days:', daysWithoutSales, 'zones:', selectedZones);
      // TODO: Call actual API endpoint when available
      // const data = await api.get(`/betting-pools/without-sales?days=${daysWithoutSales}&zoneIds=${selectedZones.join(',')}`);
      // setBettingPools(data?.items || data || []);

      // For now, filter existing pools (mock behavior)
      // In production, this would be an API call
      setLoading(false);
    } catch (err) {
      const error = err as Error;
      console.error('[DATA] Error searching:', error);
      setError(error.message || 'Error searching');
      setLoading(false);
    }
  };

  const handleExportPdf = (): void => {
    // TODO: Implement PDF export
    alert('Exportar a PDF - Funcionalidad pendiente');
  };

  const handleSort = (property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleZoneChange = (event: SelectChangeEvent<number[]>): void => {
    const value = event.target.value;
    setSelectedZones(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  // Generate mock "days without sales" data for demo purposes
  const poolsWithDaysData = useMemo((): PoolWithDaysData[] => {
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
  const filteredAndSortedData = useMemo((): PoolWithDaysData[] => {
    let data = [...poolsWithDaysData];

    // Filter by selected zones
    if (selectedZones.length > 0 && selectedZones.length < zones.length) {
      data = data.filter(pool =>
        selectedZones.includes(pool.zoneId || pool.zone?.id || 0)
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
      let aValue: string | number;
      let bValue: string | number;

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
          aValue = (a[orderBy] as number) || 0;
          bValue = (b[orderBy] as number) || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return order === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
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

  console.log('[DATA] Rendering BettingPoolsWithoutSales, pools:', filteredAndSortedData.length);

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

export default memo(BettingPoolsWithoutSales);
