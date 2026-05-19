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
import { exportToPdf, type ExportColumn } from '@/utils/exportTable';

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
  /** Display code like "LB-0001". */
  bettingPoolCode?: string;
  code?: string;
  reference?: string;
  zoneName?: string;
  zone?: { id?: number; name?: string };
  zoneId?: number;
  balance?: number;
}

interface PoolWithDaysData extends BettingPool {
  daysWithoutSales: number;
  lastSaleDate: string | null;
  [key: string]: string | number | null | { id?: number; name?: string } | undefined;
}

type OrderDirection = 'asc' | 'desc';

const BettingPoolsWithoutSales: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PoolWithDaysData[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // Filter state
  const [daysWithoutSales, setDaysWithoutSales] = useState<number>(7);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sorting state
  const [orderBy, setOrderBy] = useState<string>('days');
  const [order, setOrder] = useState<OrderDirection>('desc');

  // Load zones once, then run the search.
  useEffect(() => {
    (async () => {
      try {
        const zonesData = await api.get('/zones?pageSize=1000') as { items?: Zone[] } | Zone[];
        const zonesArray: Zone[] = Array.isArray(zonesData) ? zonesData : (zonesData?.items || []);
        setZones(zonesArray);
        setSelectedZones(zonesArray.map(z => z.zoneId || z.id || 0));
      } catch (err) {
        console.error('[DATA] Error loading zones:', err);
      }
    })();
  }, []);

  // Fetch the actual report from the backend whenever the user clicks Ver ventas.
  // The first load runs once the zones list resolves.
  const handleSearch = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Send zoneIds only when narrowed below the full list.
      const zoneParam = selectedZones.length > 0 && selectedZones.length < zones.length
        ? `&zoneIds=${selectedZones.join(',')}`
        : '';
      const data = await api.get(
        `/betting-pools/without-sales?minDays=${daysWithoutSales}${zoneParam}`,
      ) as PoolWithDaysData[];
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err as Error;
      console.error('[DATA] Error searching:', error);
      setError(error.message || 'Error searching');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount + whenever the days threshold changes (debounced is overkill — number input).
  useEffect(() => {
    if (zones.length > 0) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones.length, daysWithoutSales]);

  const handleExportPdf = (): void => {
    if (filteredAndSortedData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const columns: ExportColumn<Record<string, unknown>>[] = [
      { key: 'number', label: 'Número', align: 'left',
        getValue: (r) => String(r.bettingPoolCode ?? r.code ?? r.bettingPoolId ?? r.id ?? '') },
      { key: 'name', label: 'Nombre', align: 'left',
        getValue: (r) => String(r.bettingPoolName ?? r.name ?? '') },
      { key: 'reference', label: 'Referencia', align: 'left',
        getValue: (r) => String(r.reference ?? '-') },
      { key: 'days', label: 'Días', align: 'right',
        getValue: (r) => String(r.daysWithoutSales ?? 0) },
      { key: 'lastSale', label: 'Última venta', align: 'left',
        getValue: (r) => String(r.lastSaleDate ?? 'Nunca') },
      { key: 'zone', label: 'Zona', align: 'left',
        getValue: (r) => String(r.zoneName ?? '') },
      { key: 'balance', label: 'Balance', align: 'right',
        getValue: (r) => `$${Number(r.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    ];
    exportToPdf(
      filteredAndSortedData as unknown as Record<string, unknown>[],
      columns,
      `Bancas sin ventas — últimos ${daysWithoutSales} días`,
    );
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

  // Filter and sort the real backend results.
  const filteredAndSortedData = useMemo((): PoolWithDaysData[] => {
    let data = [...results];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        (pool.bettingPoolCode || pool.code || '').toLowerCase().includes(term) ||
        (pool.bettingPoolId || pool.id)?.toString().includes(term) ||
        (pool.bettingPoolName || pool.name)?.toLowerCase().includes(term) ||
        (pool.reference || '')?.toLowerCase().includes(term) ||
        (pool.zoneName || '').toLowerCase().includes(term)
      );
    }

    // Sort
    data.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (orderBy) {
        case 'number':
          aValue = (a.bettingPoolCode || a.code || '').toLowerCase();
          bValue = (b.bettingPoolCode || b.code || '').toLowerCase();
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
              Error: {error}
            </Typography>
            <Button onClick={handleSearch} sx={{ mt: 2 }}>
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
                  filteredAndSortedData.map((pool) => {
                    const bal = pool.balance ?? 0;
                    // Green/red accent driven by the sign of the balance.
                    const balColor = bal > 0 ? '#2e7d32' : bal < 0 ? '#c62828' : 'inherit';
                    return (
                      <TableRow key={pool.bettingPoolId || pool.id} hover>
                        <TableCell>{pool.bettingPoolCode || pool.code || `#${pool.bettingPoolId || pool.id}`}</TableCell>
                        <TableCell>{pool.bettingPoolName || pool.name}</TableCell>
                        <TableCell>{pool.reference || '-'}</TableCell>
                        <TableCell>{pool.daysWithoutSales}</TableCell>
                        <TableCell>{pool.lastSaleDate || 'Nunca'}</TableCell>
                        <TableCell>{pool.zoneName}</TableCell>
                        <TableCell sx={{ color: balColor, fontWeight: 600 }}>
                          ${bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    );
                  })
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
