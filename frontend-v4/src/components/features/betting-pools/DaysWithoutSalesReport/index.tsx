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
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '@services/api';

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

interface PoolWithWeeklyData extends BettingPool {
  code: string;
  poolName: string;
  monday?: number;
  tuesday?: number;
  wednesday?: number;
  thursday?: number;
  friday?: number;
  saturday?: number;
  sunday?: number;
  [key: string]: string | number | undefined | { id?: number };
}

type OrderDirection = 'asc' | 'desc';

const WEEKDAYS: WeekDay[] = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const DaysWithoutSalesReport: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
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

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [poolsData, zonesData] = await Promise.all([
        api.get('/betting-pools') as Promise<{ items?: BettingPool[] } | BettingPool[]>,
        api.get('/zones') as Promise<{ items?: Zone[] } | Zone[]>
      ]);

      const poolsArray: BettingPool[] = Array.isArray(poolsData) ? poolsData : (poolsData?.items || []);
      const zonesArray: Zone[] = Array.isArray(zonesData) ? zonesData : (zonesData?.items || []);


      setBettingPools(poolsArray);
      setZones(zonesArray);

      // Select all zones by default
      const allZoneIds = zonesArray.map(z => z.zoneId || z.id || 0);
      setSelectedZones(allZoneIds);
    } catch (err) {
      const error = err as Error;
      console.error('[SCHEDULE] Error loading data:', error);
      setError(error.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Call actual API endpoint when available
      // const data = await api.get(`/betting-pools/weekly-sales?date=${selectedDate}&zoneIds=${selectedZones.join(',')}`);
      // setBettingPools(data?.items || data || []);
      setLoading(false);
    } catch (err) {
      const error = err as Error;
      console.error('[SCHEDULE] Error searching:', error);
      setError(error.message || 'Error searching');
      setLoading(false);
    }
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

  // Generate mock weekly sales data for demo purposes
  const poolsWithWeeklyData = useMemo((): PoolWithWeeklyData[] => {
    return bettingPools.map((pool): PoolWithWeeklyData => {
      // Generate random sales for each day of the week
      const weeklySales: Record<string, number> = {};
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
  const filteredAndSortedData = useMemo((): PoolWithWeeklyData[] => {
    let data = [...poolsWithWeeklyData];

    // Filter by selected zones
    if (selectedZones.length > 0 && selectedZones.length < zones.length) {
      data = data.filter(pool =>
        selectedZones.includes((pool.zoneId as number) || (pool.zone as { id?: number })?.id || 0)
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
  }, [poolsWithWeeklyData, selectedZones, zones.length, searchTerm, orderBy, order]);

  const formatCurrency = (value: number | undefined): string => {
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
                          {formatCurrency(pool[day.key] as number)}
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

export default memo(DaysWithoutSalesReport);
