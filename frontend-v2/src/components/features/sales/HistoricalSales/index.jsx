import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack,
  Tabs, Tab, ToggleButtonGroup, ToggleButton, Table, TableHead, TableBody, TableRow, TableCell,
  Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import { FilterList, PictureAsPdf, Download, Search } from '@mui/icons-material';

const HistoricalSales = () => {
  const [mainTab, setMainTab] = useState(0);
  const [fechaInicial, setFechaInicial] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [mostrarComision2, setMostrarComision2] = useState(false);
  const [filterType, setFilterType] = useState('todos');
  const [filtroRapido, setFiltroRapido] = useState('');

  // Data for different tabs
  const [bancasData, setBancasData] = useState([]);
  const [sorteoData, setSorteoData] = useState([]);
  const [combinacionesData, setCombinacionesData] = useState([]);
  const [zonasData, setZonasData] = useState([]);

  const [zonasList, setZonasList] = useState([]);
  const [gruposList, setGruposList] = useState([]);
  const [totals, setTotals] = useState({ tickets: 0, venta: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0, caida: 0, final: 0 });

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    // Mock data for BANCAS (General tab)
    const mockBancas = [];
    for (let i = 1; i <= 15; i++) {
      const venta = Math.floor(Math.random() * 5000) + 100;
      const comisiones = venta * 0.1;
      const descuentos = venta * 0.02;
      const premios = Math.floor(Math.random() * 2000);
      const neto = venta - comisiones - descuentos - premios;
      const caida = Math.floor(Math.random() * 100);
      const final = neto - caida;

      mockBancas.push({
        ref: `B-${String(1000 + i).padStart(4, '0')}`,
        codigo: `RB00${i}`,
        tickets: Math.floor(Math.random() * 50) + 10,
        venta, comisiones, descuentos, premios, neto, caida, final
      });
    }
    setBancasData(mockBancas);

    // Mock data for SORTEOS (Por sorteo tab)
    const sorteos = [
      'DIARIA 11AM', 'DIARIA 12PM', 'DIARIA 3PM', 'DIARIA 6PM', 'DIARIA 9PM',
      'NEW YORK 10:30', 'NEW YORK 12:30', 'NEW YORK 7:30',
      'FLORIDA 1:30', 'FLORIDA 9:45',
      'SANTO DOMINGO', 'NACIONAL'
    ];
    const mockSorteos = sorteos.map(sorteo => {
      const venta = Math.floor(Math.random() * 10000) + 500;
      const comisiones = venta * 0.1;
      const descuentos = venta * 0.02;
      const premios = Math.floor(Math.random() * 4000);
      const neto = venta - comisiones - descuentos - premios;
      return {
        sorteo,
        tickets: Math.floor(Math.random() * 100) + 20,
        venta, comisiones, descuentos, premios, neto
      };
    });
    setSorteoData(mockSorteos);

    // Mock data for COMBINACIONES (Combinaciones tab)
    const tiposJugada = [
      { tipo: 'Directo', cantidad: Math.floor(Math.random() * 500) + 100 },
      { tipo: 'Palé', cantidad: Math.floor(Math.random() * 300) + 50 },
      { tipo: 'Tripleta', cantidad: Math.floor(Math.random() * 200) + 30 },
      { tipo: 'Super Palé', cantidad: Math.floor(Math.random() * 150) + 20 },
      { tipo: 'Pick 3', cantidad: Math.floor(Math.random() * 100) + 10 },
      { tipo: 'Pick 4', cantidad: Math.floor(Math.random() * 80) + 5 },
      { tipo: 'Quinela', cantidad: Math.floor(Math.random() * 60) + 10 },
      { tipo: 'Pick Two', cantidad: Math.floor(Math.random() * 40) + 5 }
    ];
    const mockCombinaciones = tiposJugada.map(t => {
      const montoTotal = t.cantidad * (Math.floor(Math.random() * 50) + 10);
      const premiosPagados = Math.floor(Math.random() * montoTotal * 0.8);
      const ganancia = montoTotal - premiosPagados;
      return {
        tipoJugada: t.tipo,
        cantidadJugadas: t.cantidad,
        montoTotal,
        premiosPagados,
        ganancia,
        porcentaje: ((ganancia / montoTotal) * 100).toFixed(2)
      };
    });
    setCombinacionesData(mockCombinaciones);

    // Mock data for ZONAS (Por zona tab)
    const zonasInfo = [
      { zona: 'Zona Norte', bancas: 12 },
      { zona: 'Zona Sur', bancas: 8 },
      { zona: 'Zona Este', bancas: 15 },
      { zona: 'Zona Oeste', bancas: 10 },
      { zona: 'Centro', bancas: 20 },
      { zona: 'Metropolitana', bancas: 25 }
    ];
    const mockZonas = zonasInfo.map(z => {
      const venta = z.bancas * (Math.floor(Math.random() * 3000) + 1000);
      const comisiones = venta * 0.1;
      const descuentos = venta * 0.02;
      const premios = Math.floor(Math.random() * venta * 0.3);
      const neto = venta - comisiones - descuentos - premios;
      return {
        zona: z.zona,
        bancasActivas: z.bancas,
        tickets: z.bancas * Math.floor(Math.random() * 30) + 50,
        venta, comisiones, descuentos, premios, neto
      };
    });
    setZonasData(mockZonas);

    // Calculate totals from bancas data
    setTotals({
      tickets: mockBancas.reduce((sum, d) => sum + d.tickets, 0),
      venta: mockBancas.reduce((sum, d) => sum + d.venta, 0),
      comisiones: mockBancas.reduce((sum, d) => sum + d.comisiones, 0),
      descuentos: mockBancas.reduce((sum, d) => sum + d.descuentos, 0),
      premios: mockBancas.reduce((sum, d) => sum + d.premios, 0),
      neto: mockBancas.reduce((sum, d) => sum + d.neto, 0),
      caida: mockBancas.reduce((sum, d) => sum + d.caida, 0),
      final: mockBancas.reduce((sum, d) => sum + d.final, 0)
    });

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' }
    ]);

    setGruposList([
      { id: 1, name: 'Grupo A' },
      { id: 2, name: 'Grupo B' },
      { id: 3, name: 'Grupo C' }
    ]);
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

      case 1: // Por sorteo
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
                    onChange={(e) => {
                      const selectedIds = e.target.value;
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

      case 2: // Combinaciones
        return (
          <>
            <Typography variant="h5" align="center" sx={{ mb: 3, color: '#1976d2' }}>
              Resumen por Tipo de Jugada
            </Typography>

            <Typography variant="h6" align="center" sx={{ mb: 3, color: '#666' }}>
              Total Jugadas: {combinacionesData.reduce((sum, d) => sum + d.cantidadJugadas, 0)} |
              Total Monto: {formatCurrency(combinacionesData.reduce((sum, d) => sum + d.montoTotal, 0))}
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  {['Tipo de Jugada', 'Cantidad', 'Monto Total', 'Premios Pagados', 'Ganancia', '% Ganancia'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Totales</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{combinacionesData.reduce((sum, d) => sum + d.cantidadJugadas, 0)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(combinacionesData.reduce((sum, d) => sum + d.montoTotal, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(combinacionesData.reduce((sum, d) => sum + d.premiosPagados, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>{formatCurrency(combinacionesData.reduce((sum, d) => sum + d.ganancia, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {((combinacionesData.reduce((sum, d) => sum + d.ganancia, 0) / combinacionesData.reduce((sum, d) => sum + d.montoTotal, 0)) * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
                {combinacionesData.map((d, i) => (
                  <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{d.tipoJugada}</TableCell>
                    <TableCell>{d.cantidadJugadas}</TableCell>
                    <TableCell>{formatCurrency(d.montoTotal)}</TableCell>
                    <TableCell>{formatCurrency(d.premiosPagados)}</TableCell>
                    <TableCell sx={{ color: d.ganancia >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.ganancia)}</TableCell>
                    <TableCell sx={{ color: parseFloat(d.porcentaje) >= 0 ? 'success.main' : 'error.main' }}>{d.porcentaje}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mostrando {combinacionesData.length} tipos de jugada</Typography>
          </>
        );

      case 3: // Por zona
        return (
          <>
            <Typography variant="h5" align="center" sx={{ mb: 3, color: '#1976d2' }}>
              Ventas por Zona Geográfica
            </Typography>

            <Typography variant="h6" align="center" sx={{ mb: 3, color: '#666' }}>
              Total Bancas Activas: {zonasData.reduce((sum, d) => sum + d.bancasActivas, 0)} |
              Total Venta: {formatCurrency(zonasData.reduce((sum, d) => sum + d.venta, 0))}
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  {['Zona', 'Bancas Activas', 'Tickets', 'Venta', 'Comisiones', 'Descuentos', 'Premios', 'Neto'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Totales</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{zonasData.reduce((sum, d) => sum + d.bancasActivas, 0)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{zonasData.reduce((sum, d) => sum + d.tickets, 0)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(zonasData.reduce((sum, d) => sum + d.venta, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(zonasData.reduce((sum, d) => sum + d.comisiones, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(zonasData.reduce((sum, d) => sum + d.descuentos, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(zonasData.reduce((sum, d) => sum + d.premios, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>{formatCurrency(zonasData.reduce((sum, d) => sum + d.neto, 0))}</TableCell>
                </TableRow>
                {zonasData.map((d, i) => (
                  <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{d.zona}</TableCell>
                    <TableCell>{d.bancasActivas}</TableCell>
                    <TableCell>{d.tickets}</TableCell>
                    <TableCell>{formatCurrency(d.venta)}</TableCell>
                    <TableCell>{formatCurrency(d.comisiones)}</TableCell>
                    <TableCell>{formatCurrency(d.descuentos)}</TableCell>
                    <TableCell>{formatCurrency(d.premios)}</TableCell>
                    <TableCell sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mostrando {zonasData.length} zonas</Typography>
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
