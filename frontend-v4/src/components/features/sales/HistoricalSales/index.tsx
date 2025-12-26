import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack,
  Tabs, Tab, ToggleButtonGroup, ToggleButton, Table, TableHead, TableBody, TableRow, TableCell,
  Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem, InputAdornment,
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { FilterList, PictureAsPdf, Download, Search } from '@mui/icons-material';
import api from '@services/api';

interface Zona {
  id: number;
  zoneId?: number;
  name: string;
  zoneName?: string;
}

interface Grupo {
  id: number;
  name: string;
}

interface BancaData {
  ref: string;
  codigo: string;
  tickets: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  caida: number;
  gastos: number;
  final: number;
}

interface SorteoData {
  sorteo: string;
  tickets: number;
  lineas: number;
  ganadores: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
}

interface CombinacionData {
  combinacion: string;
  sorteo: string;
  tipoApuesta: string;
  lineas: number;
  totalVendido: number;
  comisiones: number;
  comisiones2: number;
  premios: number;
  balances: number;
}

interface ZonaData {
  zona?: string;
  nombre?: string;
  bancasActivas?: number;
  tickets?: number;
  lineas?: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  p?: number;
  l?: number;
  w?: number;
  total?: number;
  caida?: number;
  final?: number;
  balance?: number;
}

interface Totals {
  tickets: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  caida: number;
  gastos: number;
  final: number;
}

// API Response interfaces
interface BettingPoolSalesDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface DrawSalesDto {
  drawId: number;
  drawName: string;
  ticketCount: number;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface DrawSalesResponse {
  draws: DrawSalesDto[];
  summary: { totalSold: number; totalPrizes: number; totalCommissions: number; totalNet: number };
}

interface CombinationSalesDto {
  betNumber: string;
  drawName: string;
  betTypeName: string;
  lineCount: number;
  totalSold: number;
  totalCommissions: number;
  totalPrizes: number;
  balance: number;
}

interface CombinationSalesResponse {
  combinations: CombinationSalesDto[];
  summary: { totalSold: number; totalPrizes: number; totalCommissions: number; totalNet: number };
}

interface ZoneSalesDto {
  zoneId: number;
  zoneName: string;
  bettingPoolCount: number;
  ticketCount: number;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalDiscounts: number;
  totalNet: number;
  fall: number;
  final: number;
  balance: number;
}

interface ZoneSalesResponse {
  zones: ZoneSalesDto[];
  summary: { totalSold: number; totalPrizes: number; totalCommissions: number; totalNet: number };
}

const HistoricalSales = (): React.ReactElement => {
  const [mainTab, setMainTab] = useState<number>(0);
  const [fechaInicial, setFechaInicial] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [grupo, setGrupo] = useState<string | number>('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Data for different tabs
  const [bancasData, setBancasData] = useState<BancaData[]>([]);
  const [sorteoData, setSorteoData] = useState<SorteoData[]>([]);
  const [combinacionesData, setCombinacionesData] = useState<CombinacionData[]>([]);
  const [zonasData, setZonasData] = useState<ZonaData[]>([]);

  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [gruposList, setGruposList] = useState<Grupo[]>([]);
  const [totals, setTotals] = useState<Totals>({ tickets: 0, venta: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0, caida: 0, gastos: 0, final: 0 });

  const formatCurrency = useCallback((amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount), []);

  // Load zones on mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await api.get<{ items?: Zona[] } | Zona[]>('/zones');
        const zonesArray = (response && typeof response === 'object' && 'items' in response)
          ? (response.items || [])
          : (response as Zona[] || []);

        const normalizedZones = zonesArray.map((z: Zona) => ({
          id: z.zoneId || z.id,
          name: z.zoneName || z.name
        }));
        setZonasList(normalizedZones);
        setZonas(normalizedZones); // Select all by default
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };
    loadZones();
  }, []);

  // Load sales by betting pool (General tab)
  const loadBancasData = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<BettingPoolSalesDto[]>(
        `/reports/sales/by-betting-pool?startDate=${fechaInicial}&endDate=${fechaFinal}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: BancaData[] = (response || []).map(item => ({
        ref: item.bettingPoolName,
        codigo: item.bettingPoolCode,
        tickets: 0,
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: 0,
        premios: item.totalPrizes,
        neto: item.totalNet,
        caida: 0,
        gastos: 0,
        final: item.totalNet
      }));

      setBancasData(mapped);

      const newTotals = mapped.reduce((acc, row) => ({
        tickets: acc.tickets + row.tickets,
        venta: acc.venta + row.venta,
        comisiones: acc.comisiones + row.comisiones,
        descuentos: acc.descuentos + row.descuentos,
        premios: acc.premios + row.premios,
        neto: acc.neto + row.neto,
        caida: acc.caida + row.caida,
        gastos: acc.gastos + row.gastos,
        final: acc.final + row.final
      }), { tickets: 0, venta: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0, caida: 0, gastos: 0, final: 0 });

      setTotals(newTotals);
    } catch (error) {
      console.error('Error loading bancas data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load sales by draw (Por sorteo tab)
  const loadSorteoData = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<DrawSalesResponse>(
        `/reports/sales/by-draw?date=${fechaInicial}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: SorteoData[] = (response?.draws || []).map(item => ({
        sorteo: item.drawName,
        tickets: item.ticketCount,
        lineas: item.lineCount,
        ganadores: item.winnerCount,
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: 0,
        premios: item.totalPrizes,
        neto: item.totalNet
      }));

      setSorteoData(mapped);
    } catch (error) {
      console.error('Error loading sorteo data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load combinations (Combinaciones tab)
  const loadCombinacionesData = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<CombinationSalesResponse>(
        `/reports/sales/combinations?date=${fechaInicial}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: CombinacionData[] = (response?.combinations || []).map(item => ({
        combinacion: item.betNumber,
        sorteo: item.drawName,
        tipoApuesta: item.betTypeName,
        lineas: item.lineCount,
        totalVendido: item.totalSold,
        comisiones: item.totalCommissions,
        comisiones2: 0,
        premios: item.totalPrizes,
        balances: item.balance
      }));

      setCombinacionesData(mapped);
    } catch (error) {
      console.error('Error loading combinaciones data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load sales by zone (Por zona tab)
  const loadZonasData = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<ZoneSalesResponse>(
        `/reports/sales/by-zone?date=${fechaInicial}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: ZonaData[] = (response?.zones || []).map(item => ({
        nombre: item.zoneName,
        bancasActivas: item.bettingPoolCount,
        tickets: item.ticketCount,
        lineas: item.lineCount,
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: item.totalDiscounts,
        premios: item.totalPrizes,
        neto: item.totalNet,
        p: 0,
        l: 0,
        w: item.winnerCount,
        total: item.lineCount,
        caida: item.fall,
        final: item.final,
        balance: item.balance
      }));

      setZonasData(mapped);
    } catch (error) {
      console.error('Error loading zonas data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search based on current tab
  const handleSearch = () => {
    switch (mainTab) {
      case 0:
        loadBancasData();
        break;
      case 1:
        loadSorteoData();
        break;
      case 2:
        loadCombinacionesData();
        break;
      case 3:
        loadZonasData();
        break;
    }
  };

  const FILTER_OPTIONS = [
    { value: 'todos', label: 'Todos' },
    { value: 'con_ventas', label: 'Con ventas' },
    { value: 'con_premios', label: 'Con premios' },
    { value: 'con_tickets_pendientes', label: 'Con tickets pendientes' },
    { value: 'ventas_negativas', label: 'Con ventas netas negativas' },
    { value: 'ventas_positivas', label: 'Con ventas netas positivas' }
  ];

  // Render content based on selected tab
  const renderTabContent = () => {
    switch (mainTab) {
      case 0: // General - Bancas
        return (
          <>
            <Box sx={{ mb: 2 }}>
              <Tabs value={0}><Tab label="Bancas" /></Tabs>
            </Box>

            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
              Total: <Box component="span" sx={{
                backgroundColor: '#e0f7fa',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                color: '#00838f'
              }}>{formatCurrency(totals.final)}</Box>
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Filtrar</Typography>
              <ToggleButtonGroup
                exclusive
                value={filterType}
                onChange={(e, v) => v && setFilterType(v)}
                size="small"
                sx={{
                  border: '2px solid #8b5cf6',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRight: '2px solid #8b5cf6',
                    borderRadius: 0,
                    px: 2,
                    py: 0.6,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
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
                {FILTER_OPTIONS.map(opt => (
                  <ToggleButton key={opt.value} value={opt.value}>
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <TextField fullWidth placeholder="Filtro rapido" value={filtroRapido} onChange={(e) => setFiltroRapido(e.target.value)}
              size="small" sx={{ mb: 2, maxWidth: 300 }} />

            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
                <TableRow>
                  {['Ref.', 'Código', 'Tickets', 'Venta', 'Comisiones', 'Descuentos', 'Premios', 'Neto', 'Caída', 'Gastos', 'Final'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {bancasData.map((d, i) => (
                  <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell>{d.ref}</TableCell>
                    <TableCell>{d.codigo}</TableCell>
                    <TableCell>{d.tickets}</TableCell>
                    <TableCell>{formatCurrency(d.venta)}</TableCell>
                    <TableCell>{formatCurrency(d.comisiones)}</TableCell>
                    <TableCell>{formatCurrency(d.descuentos)}</TableCell>
                    <TableCell>{formatCurrency(d.premios)}</TableCell>
                    <TableCell>{formatCurrency(d.neto)}</TableCell>
                    <TableCell>{formatCurrency(d.caida)}</TableCell>
                    <TableCell>{formatCurrency(d.gastos)}</TableCell>
                    <TableCell sx={{ color: d.final >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.final)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                  <TableCell>Totales</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{totals.tickets}</TableCell>
                  <TableCell>{formatCurrency(totals.venta)}</TableCell>
                  <TableCell>{formatCurrency(totals.comisiones)}</TableCell>
                  <TableCell>{formatCurrency(totals.descuentos)}</TableCell>
                  <TableCell>{formatCurrency(totals.premios)}</TableCell>
                  <TableCell>{formatCurrency(totals.neto)}</TableCell>
                  <TableCell>{formatCurrency(totals.caida)}</TableCell>
                  <TableCell>{formatCurrency(totals.gastos)}</TableCell>
                  <TableCell sx={{ color: totals.final >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totals.final)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mostrando {bancasData.length} entradas</Typography>
          </>
        );

      case 1: {
        // Por sorteo
        const totalNeto = sorteoData.reduce((sum, d) => sum + d.neto, 0);
        const totalVendido = sorteoData.reduce((sum, d) => sum + d.venta, 0);
        const totalPremios = sorteoData.reduce((sum, d) => sum + d.premios, 0);
        const totalComisiones = sorteoData.reduce((sum, d) => sum + d.comisiones, 0);

        return (
          <>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.75rem' }}>
              Ventas por sorteo
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Fecha inicial
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={fechaInicial}
                  onChange={(e) => setFechaInicial(e.target.value)}
                  sx={{ width: 200 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Fecha final
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={fechaFinal}
                  onChange={(e) => setFechaFinal(e.target.value)}
                  sx={{ width: 200 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Zonas
                </Typography>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <Select
                    multiple
                    value={zonas.map(z => z.id)}
                    onChange={(e: SelectChangeEvent<number[]>) => {
                      const selectedIds = e.target.value as number[];
                      setZonas(zonasList.filter(z => selectedIds.includes(z.id)));
                    }}
                    renderValue={(selected) => selected.length === 1 ? zonasList.find(z => z.id === selected[0])?.name || '1 seleccionada' : `${selected.length} seleccionadas`}
                  >
                    {zonasList.map((zone) => (
                      <MenuItem key={zone.id} value={zone.id}>
                        <Checkbox checked={zonas.map(z => z.id).indexOf(zone.id) > -1} />
                        {zone.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                size="small"
                sx={{
                  borderRadius: '20px',
                  px: 2.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                {loading ? <CircularProgress size={16} color="inherit" /> : 'Ver ventas'}
              </Button>
            </Box>

            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
              Total neto: <Box component="span" sx={{
                backgroundColor: '#e0f7fa',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                color: '#00838f'
              }}>{formatCurrency(totalNeto)}</Box>
            </Typography>

            <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.25rem' }}>
              {sorteoData.length === 0 ? 'No hay entradas para la fecha elegida' : ''}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Filtrado rápido"
                value={filtroRapido}
                onChange={(e) => setFiltroRapido(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>

            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
                <TableRow>
                  <TableCell sx={{ cursor: 'pointer', fontWeight: 600 }}>Sorteo</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total Vendido</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total premios</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total comisiones</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total neto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sorteoData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No hay entradas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  sorteoData.map((d, i) => (
                    <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell sx={{ fontWeight: 500 }}>{d.sorteo}</TableCell>
                      <TableCell align="right">{formatCurrency(d.venta)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.premios)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.comisiones)}</TableCell>
                      <TableCell align="right" sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                  <TableCell>Totales</TableCell>
                  <TableCell align="right">{formatCurrency(totalVendido)}</TableCell>
                  <TableCell align="right">{formatCurrency(totalPremios)}</TableCell>
                  <TableCell align="right">{formatCurrency(totalComisiones)}</TableCell>
                  <TableCell align="right">{formatCurrency(totalNeto)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Typography variant="body2" sx={{ mt: 2 }}>
              Mostrando {sorteoData.length} de {sorteoData.length} entradas
            </Typography>
          </>
        );
      }

      case 2: // Combinaciones
        return (
          <>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.75rem' }}>
              Combinaciones
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Fecha inicial
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={fechaInicial}
                  onChange={(e) => setFechaInicial(e.target.value)}
                  sx={{ width: 200 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Fecha final
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={fechaFinal}
                  onChange={(e) => setFechaFinal(e.target.value)}
                  sx={{ width: 200 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Sorteos
                </Typography>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <Select
                    multiple
                    value={[]}
                    renderValue={(selected) => selected.length === 0 ? 'Seleccione' : `${selected.length} seleccionadas`}
                    displayEmpty
                  >
                    <MenuItem value={1}>Sorteo 1</MenuItem>
                    <MenuItem value={2}>Sorteo 2</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Zonas
                </Typography>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <Select
                    multiple
                    value={zonas.map(z => z.id)}
                    onChange={(e: SelectChangeEvent<number[]>) => {
                      const selectedIds = e.target.value as number[];
                      setZonas(zonasList.filter(z => selectedIds.includes(z.id)));
                    }}
                    renderValue={(selected) => selected.length === 1 ? zonasList.find(z => z.id === selected[0])?.name || '1 seleccionada' : `${selected.length} seleccionadas`}
                  >
                    {zonasList.map((zone) => (
                      <MenuItem key={zone.id} value={zone.id}>
                        <Checkbox checked={zonas.map(z => z.id).indexOf(zone.id) > -1} />
                        {zone.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Bancas
                </Typography>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <Select
                    value=""
                    displayEmpty
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    <MenuItem value={1}>Banca 1</MenuItem>
                    <MenuItem value={2}>Banca 2</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                size="small"
                sx={{
                  borderRadius: '20px',
                  px: 2.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                {loading ? <CircularProgress size={16} color="inherit" /> : 'Ver ventas'}
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Filtrado rápido"
                value={filtroRapido}
                onChange={(e) => setFiltroRapido(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>

            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
                <TableRow>
                  <TableCell sx={{ cursor: 'pointer', fontWeight: 600 }}>Combinación</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total Vendido</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total comisiones</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total comisiones 2</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total premios</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Balances</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {combinacionesData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No hay entradas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  combinacionesData.map((d, i) => (
                    <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell sx={{ fontWeight: 500 }}>{d.combinacion}</TableCell>
                      <TableCell align="right">{formatCurrency(d.totalVendido)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.comisiones)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.comisiones2)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.premios)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.balances)}</TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                  <TableCell>Totales</TableCell>
                  <TableCell align="right">$0.00</TableCell>
                  <TableCell align="right">$0.00</TableCell>
                  <TableCell align="right">$0.00</TableCell>
                  <TableCell align="right">$0.00</TableCell>
                  <TableCell align="right">$0.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Typography variant="body2" sx={{ mt: 2 }}>
              Mostrando {combinacionesData.length} de {combinacionesData.length} entradas
            </Typography>
          </>
        );

      case 3: // Por zona
        return (
          <>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
              Zonas
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Fecha inicial
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={fechaInicial}
                  onChange={(e) => setFechaInicial(e.target.value)}
                  sx={{
                    width: 200,
                    '& .MuiInputBase-root': { height: 32 },
                    '& .MuiInputBase-input': { py: 0.5, fontSize: '0.8rem' },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Fecha final
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={fechaFinal}
                  onChange={(e) => setFechaFinal(e.target.value)}
                  sx={{
                    width: 200,
                    '& .MuiInputBase-root': { height: 32 },
                    '& .MuiInputBase-input': { py: 0.5, fontSize: '0.8rem' },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Zonas
                </Typography>
                <FormControl
                  sx={{
                    minWidth: 200,
                    '& .MuiInputBase-root': { height: 32 },
                    '& .MuiSelect-select': { py: 0.5, fontSize: '0.8rem' },
                  }}
                  size="small"
                >
                  <Select
                    multiple
                    value={zonas.map(z => z.id)}
                    onChange={(e: SelectChangeEvent<number[]>) => {
                      const selectedIds = e.target.value as number[];
                      setZonas(zonasList.filter(z => selectedIds.includes(z.id)));
                    }}
                    renderValue={(selected) => selected.length === 1 ? zonasList.find(z => z.id === selected[0])?.name || '1 seleccionada' : `${selected.length} seleccionadas`}
                  >
                    {zonasList.map((zone) => (
                      <MenuItem key={zone.id} value={zone.id}>
                        <Checkbox checked={zonas.map(z => z.id).indexOf(zone.id) > -1} />
                        {zone.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                size="small"
                sx={{
                  borderRadius: '20px',
                  px: 2.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                {loading ? <CircularProgress size={16} color="inherit" /> : 'Ver ventas'}
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{
                  borderRadius: '20px',
                  px: 2.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                PDF
              </Button>
            </Box>

            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
              Total: <Box component="span" sx={{
                backgroundColor: '#e0f7fa',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                color: '#00838f'
              }}>{formatCurrency(zonasData.reduce((sum, d) => sum + d.neto, 0))}</Box>
            </Typography>

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
                  border: '2px solid #8b5cf6',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRight: '2px solid #8b5cf6',
                    borderRadius: 0,
                    px: 2,
                    py: 0.6,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
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
                <ToggleButton value="todos">Todos</ToggleButton>
                <ToggleButton value="con-ventas">Con ventas</ToggleButton>
                <ToggleButton value="con-premios">Con premios</ToggleButton>
                <ToggleButton value="tickets-pendientes">Con tickets pendientes</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ mb: 2, textAlign: 'right' }}>
              <TextField
                size="small"
                placeholder="Filtrado rápido"
                value={filtroRapido}
                onChange={(e) => setFiltroRapido(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>

            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>P</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>L</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>W</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Venta</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Comisiones</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Descuentos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Premios</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Neto</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Caída</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Final</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {zonasData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No hay entradas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {zonasData.map((d, i) => (
                      <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{d.nombre}</TableCell>
                        <TableCell align="center">{d.p}</TableCell>
                        <TableCell align="center">{d.l}</TableCell>
                        <TableCell align="center">{d.w}</TableCell>
                        <TableCell align="right">{d.total}</TableCell>
                        <TableCell align="right">{formatCurrency(d.venta)}</TableCell>
                        <TableCell align="right">{formatCurrency(d.comisiones)}</TableCell>
                        <TableCell align="right">{formatCurrency(d.descuentos)}</TableCell>
                        <TableCell align="right">{formatCurrency(d.premios)}</TableCell>
                        <TableCell align="right" sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                        <TableCell align="right">{formatCurrency(d.caida || 0)}</TableCell>
                        <TableCell align="right">{formatCurrency(d.final || 0)}</TableCell>
                        <TableCell align="right">{formatCurrency(d.balance || 0)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                      <TableCell>Totales</TableCell>
                      <TableCell align="center">{zonasData.reduce((sum, d) => sum + (d.p || 0), 0)}</TableCell>
                      <TableCell align="center">{zonasData.reduce((sum, d) => sum + (d.l || 0), 0)}</TableCell>
                      <TableCell align="center">{zonasData.reduce((sum, d) => sum + (d.w || 0), 0)}</TableCell>
                      <TableCell align="right">{zonasData.reduce((sum, d) => sum + (d.total || 0), 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(zonasData.reduce((sum, d) => sum + d.venta, 0))}</TableCell>
                      <TableCell align="right">{formatCurrency(zonasData.reduce((sum, d) => sum + d.comisiones, 0))}</TableCell>
                      <TableCell align="right">{formatCurrency(zonasData.reduce((sum, d) => sum + d.descuentos, 0))}</TableCell>
                      <TableCell align="right">{formatCurrency(zonasData.reduce((sum, d) => sum + d.premios, 0))}</TableCell>
                      <TableCell align="right">{formatCurrency(zonasData.reduce((sum, d) => sum + d.neto, 0))}</TableCell>
                      <TableCell align="right">{formatCurrency(zonasData.reduce((sum, d) => sum + (d.caida || 0), 0))}</TableCell>
                      <TableCell align="right">{formatCurrency(zonasData.reduce((sum, d) => sum + (d.final || 0), 0))}</TableCell>
                      <TableCell align="right">{formatCurrency(zonasData.reduce((sum, d) => sum + (d.balance || 0), 0))}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>

            <Typography variant="body2" sx={{ mt: 2 }}>
              Mostrando {zonasData.length} de {zonasData.length} entradas
            </Typography>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={mainTab} onChange={(e, v) => setMainTab(v)}>
            <Tab label="General" />
            <Tab label="Por sorteo" />
            <Tab label="Combinaciones" />
            <Tab label="Por zona" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {mainTab === 0 && (
            <>
              <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 2, fontWeight: 400 }}>
                Reportes
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth type="date" label="Fecha inicial" value={fechaInicial}
                    onChange={(e) => setFechaInicial(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth type="date" label="Fecha final" value={fechaFinal}
                    onChange={(e) => setFechaFinal(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete multiple options={zonasList} getOptionLabel={(o) => o.name || ''} value={zonas}
                    onChange={(e, v) => setZonas(v)}
                    renderTags={() => null}
                    renderInput={(params) => (
                      <TextField {...params} label="Zonas" size="small"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: zonas.length > 0 ? (
                            <InputAdornment position="start" sx={{ ml: 1 }}>
                              {zonas.length === 1 ? zonas[0].name : `${zonas.length} seleccionadas`}
                            </InputAdornment>
                          ) : null
                        }}
                        placeholder={zonas.length === 0 ? "Seleccione" : ""} />
                    )} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Grupo</InputLabel>
                    <Select value={grupo} label="Grupo" onChange={(e) => setGrupo(e.target.value)}>
                      <MenuItem value="">Seleccione</MenuItem>
                      {gruposList.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                  onClick={handleSearch}
                  disabled={loading}
                  size="small"
                  sx={{
                    borderRadius: '20px',
                    px: 2.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 500
                  }}
                >
                  Ver ventas
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    borderRadius: '20px',
                    px: 2.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 500
                  }}
                >
                  CSV
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    borderRadius: '20px',
                    px: 2.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 500
                  }}
                >
                  PDF
                </Button>
              </Stack>
            </>
          )}

          {renderTabContent()}
        </Box>
      </Paper>
    </Box>
  );
};

export default HistoricalSales;
