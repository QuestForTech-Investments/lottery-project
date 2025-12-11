import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack,
  Tabs, Tab, ToggleButtonGroup, ToggleButton, Table, TableHead, TableBody, TableRow, TableCell,
  Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { FilterList, PictureAsPdf, Download, Search } from '@mui/icons-material';

interface Zona {
  id: number;
  name: string;
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
  final: number;
}

interface SorteoData {
  sorteo: string;
  tickets: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
}

interface CombinacionData {
  combinacion: string;
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
  final: number;
}

const HistoricalSales = (): React.ReactElement => {
  const [mainTab, setMainTab] = useState<number>(0);
  const [fechaInicial, setFechaInicial] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [grupo, setGrupo] = useState<string | number>('');
  const [mostrarComision2, setMostrarComision2] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('todos');
  const [filtroRapido, setFiltroRapido] = useState<string>('');

  // Data for different tabs
  const [bancasData, setBancasData] = useState<BancaData[]>([]);
  const [sorteoData, setSorteoData] = useState<SorteoData[]>([]);
  const [combinacionesData, setCombinacionesData] = useState<CombinacionData[]>([]);
  const [zonasData, setZonasData] = useState<ZonaData[]>([]);

  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [gruposList, setGruposList] = useState<Grupo[]>([]);
  const [totals, setTotals] = useState<Totals>({ tickets: 0, venta: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0, caida: 0, final: 0 });

  const formatCurrency = useCallback((amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount), []);

  useEffect(() => {
    // Initialize with empty data - will be loaded from API when implemented
    setBancasData([]);
    setSorteoData([]);
    setCombinacionesData([]);
    setZonasData([]);
    setTotals({ tickets: 0, venta: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0, caida: 0, final: 0 });
    setZonasList([]);
    setGruposList([]);
  }, []);

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

            <Typography variant="h5" align="center" sx={{ mb: 3, color: '#1976d2' }}>
              Total: {formatCurrency(totals.final)}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Filtrar</Typography>
              <ToggleButtonGroup exclusive value={filterType} onChange={(e, v) => v && setFilterType(v)} size="small">
                {FILTER_OPTIONS.map(opt => (
                  <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <TextField fullWidth placeholder="Filtro rapido" value={filtroRapido} onChange={(e) => setFiltroRapido(e.target.value)}
              size="small" sx={{ mb: 2, maxWidth: 300 }} />

            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  {['Ref.', 'Código', 'Tickets', 'Venta', 'Comisiones', 'Descuentos', 'Premios', 'Neto', 'Caída', 'Final'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Totales</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{totals.tickets}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.venta)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.comisiones)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.descuentos)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.premios)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.neto)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.caida)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: totals.final >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totals.final)}</TableCell>
                </TableRow>
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
                    <TableCell sx={{ color: d.final >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.final)}</TableCell>
                  </TableRow>
                ))}
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
                    renderValue={(selected) => `${selected.length} seleccionadas`}
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
                sx={{
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5568d3' },
                  borderRadius: '20px',
                  px: 4,
                  py: 1,
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                VER VENTAS
              </Button>
            </Box>

            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.5rem' }}>
              Total neto: {formatCurrency(totalNeto)}
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
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ cursor: 'pointer' }}>Sorteo</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer' }}>Total Vendido</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer' }}>Total premios</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer' }}>Total comisiones</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer' }}>Total neto</TableCell>
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
                <TableRow sx={{ backgroundColor: 'grey.200' }}>
                  <TableCell><strong>Totales</strong></TableCell>
                  <TableCell align="right"><strong>{formatCurrency(totalVendido)}</strong></TableCell>
                  <TableCell align="right"><strong>{formatCurrency(totalPremios)}</strong></TableCell>
                  <TableCell align="right"><strong>{formatCurrency(totalComisiones)}</strong></TableCell>
                  <TableCell align="right"><strong>{formatCurrency(totalNeto)}</strong></TableCell>
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
                    renderValue={(selected) => `${selected.length} seleccionadas`}
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
                sx={{
                  bgcolor: '#51cbce',
                  '&:hover': { bgcolor: '#45b8bb' },
                  borderRadius: '20px',
                  px: 4,
                  py: 1,
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                VER VENTAS
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
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ cursor: 'pointer' }}>Combinación</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer' }}>Total Vendido</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer' }}>Total comisiones</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer' }}>Total comisiones 2</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer' }}>Total premios</TableCell>
                  <TableCell align="right" sx={{ cursor: 'pointer' }}>Balances</TableCell>
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
                <TableRow sx={{ backgroundColor: 'grey.200' }}>
                  <TableCell><strong>Totales</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
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
                  Fecha
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
                    renderValue={(selected) => `${selected.length} seleccionadas`}
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

            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#51cbce',
                  '&:hover': { bgcolor: '#45b8bb' },
                  borderRadius: '30px',
                  px: 4,
                  py: 1.2,
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  color: 'white'
                }}
              >
                Ver ventas
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#51cbce',
                  '&:hover': { bgcolor: '#45b8bb' },
                  borderRadius: '30px',
                  px: 4,
                  py: 1.2,
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  color: 'white'
                }}
              >
                PDF
              </Button>
            </Box>

            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
              Total: $0.00
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
                sx={{ flexWrap: 'wrap' }}
              >
                <ToggleButton value="todos" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', px: 2, py: 0.8 }}>
                  Todos
                </ToggleButton>
                <ToggleButton value="con-ventas" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', px: 2, py: 0.8 }}>
                  Con ventas
                </ToggleButton>
                <ToggleButton value="con-premios" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', px: 2, py: 0.8 }}>
                  Con premios
                </ToggleButton>
                <ToggleButton value="tickets-pendientes" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', px: 2, py: 0.8 }}>
                  Con tickets pendientes
                </ToggleButton>
                <ToggleButton value="negativas" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', px: 2, py: 0.8 }}>
                  Con ventas netas negativas
                </ToggleButton>
                <ToggleButton value="positivas" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', px: 2, py: 0.8 }}>
                  Con ventas netas positivas
                </ToggleButton>
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
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell align="center">P</TableCell>
                  <TableCell align="center">L</TableCell>
                  <TableCell align="center">W</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Venta</TableCell>
                  <TableCell align="right">Comisiones</TableCell>
                  <TableCell align="right">Descuentos</TableCell>
                  <TableCell align="right">Premios</TableCell>
                  <TableCell align="right">Neto</TableCell>
                  <TableCell align="right">Caída</TableCell>
                  <TableCell align="right">Final</TableCell>
                  <TableCell align="right">Balance</TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: 'grey.200' }}>
                  <TableCell><strong>Totales</strong></TableCell>
                  <TableCell align="center"><strong>0</strong></TableCell>
                  <TableCell align="center"><strong>0</strong></TableCell>
                  <TableCell align="center"><strong>0</strong></TableCell>
                  <TableCell align="right"><strong>0</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
                  <TableCell align="right"><strong>$0.00</strong></TableCell>
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
                  zonasData.map((d, i) => (
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
                  ))
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
              <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
                Reportes
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
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
                    onChange={(e, v) => setZonas(v)} renderInput={(params) => <TextField {...params} label="Zonas" size="small"
                      helperText={zonas.length > 0 ? `${zonas.length} seleccionadas` : ''} />} />
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

              <Box sx={{ mb: 3 }}>
                <FormControlLabel control={<Checkbox checked={mostrarComision2} onChange={(e) => setMostrarComision2(e.target.checked)} />}
                  label="Mostrar comisión #2" />
              </Box>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button variant="contained" startIcon={<FilterList />} sx={{ px: 4, borderRadius: '30px', textTransform: 'uppercase' }}>Ver ventas</Button>
                <Button variant="contained" startIcon={<Download />} sx={{ borderRadius: '30px', textTransform: 'uppercase' }}>CSV</Button>
                <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ borderRadius: '30px', textTransform: 'uppercase' }}>PDF</Button>
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
