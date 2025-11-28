import React, { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { FilterList, PictureAsPdf, Download } from '@mui/icons-material';

interface Zona {
  id: number;
  name: string;
}

interface ZonaSalesData {
  zona: string;
  bancas: number;
  ventas: number;
  comisiones: number;
  premios: number;
  neto: number;
}

interface Totals {
  bancas: number;
  ventas: number;
  comisiones: number;
  premios: number;
  neto: number;
}

const ZoneSales = (): React.ReactElement => {
  const [fechaInicial, setFechaInicial] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [filterType, setFilterType] = useState<string>('todos');
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [data, setData] = useState<ZonaSalesData[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [totals, setTotals] = useState<Totals>({ bancas: 0, ventas: 0, comisiones: 0, premios: 0, neto: 0 });

  const formatCurrency = useCallback((amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount), []);

  useEffect(() => {
    const mockData = [
      { zona: 'Zona Norte', bancas: 12, ventas: 45000, comisiones: 4500, premios: 15000, neto: 25500 },
      { zona: 'Zona Sur', bancas: 8, ventas: 32000, comisiones: 3200, premios: 18000, neto: 10800 },
      { zona: 'Zona Este', bancas: 15, ventas: 58000, comisiones: 5800, premios: 22000, neto: 30200 },
      { zona: 'Zona Oeste', bancas: 10, ventas: 41000, comisiones: 4100, premios: 12000, neto: 24900 },
      { zona: 'Zona Centro', bancas: 6, ventas: 28000, comisiones: 2800, premios: 35000, neto: -9800 }
    ];
    setData(mockData);

    setTotals({
      bancas: mockData.reduce((sum, d) => sum + d.bancas, 0),
      ventas: mockData.reduce((sum, d) => sum + d.ventas, 0),
      comisiones: mockData.reduce((sum, d) => sum + d.comisiones, 0),
      premios: mockData.reduce((sum, d) => sum + d.premios, 0),
      neto: mockData.reduce((sum, d) => sum + d.neto, 0)
    });

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' },
      { id: 5, name: 'Zona Centro' }
    ]);
  }, []);

  const FILTER_OPTIONS = [
    { value: 'todos', label: 'Todos' },
    { value: 'con_ventas', label: 'Con ventas' },
    { value: 'con_premios', label: 'Con premios' },
    { value: 'ventas_negativas', label: 'Ventas negativas' },
    { value: 'ventas_positivas', label: 'Ventas positivas' }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            Ventas por zona
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="date" label="Fecha inicial" value={fechaInicial}
                onChange={(e) => setFechaInicial(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="date" label="Fecha final" value={fechaFinal}
                onChange={(e) => setFechaFinal(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete multiple options={zonasList} getOptionLabel={(o) => o.name || ''} value={zonas}
                onChange={(e, v) => setZonas(v)} renderInput={(params) => <TextField {...params} label="Zonas" size="small" />} />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<FilterList />} sx={{ px: 4, borderRadius: '30px', textTransform: 'uppercase' }}>Ver ventas</Button>
            <Button variant="contained" startIcon={<Download />} sx={{ borderRadius: '30px', textTransform: 'uppercase' }}>CSV</Button>
            <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ borderRadius: '30px', textTransform: 'uppercase' }}>PDF</Button>
          </Stack>

          <Typography variant="h5" align="center" sx={{ mb: 3, color: '#1976d2' }}>
            Total Neto: {formatCurrency(totals.neto)}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Filtrar</Typography>
            <ToggleButtonGroup exclusive value={filterType} onChange={(e, v) => v && setFilterType(v)} size="small">
              {FILTER_OPTIONS.map(opt => (
                <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
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
                {['Zona', 'Bancas', 'Ventas', 'Comisiones', 'Premios', 'Neto'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                <TableCell sx={{ fontWeight: 600 }}>Totales</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{totals.bancas}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.ventas)}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.comisiones)}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.premios)}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: totals.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totals.neto)}</TableCell>
              </TableRow>
              {data.map((d, i) => (
                <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{d.zona}</TableCell>
                  <TableCell>{d.bancas}</TableCell>
                  <TableCell>{formatCurrency(d.ventas)}</TableCell>
                  <TableCell>{formatCurrency(d.comisiones)}</TableCell>
                  <TableCell>{formatCurrency(d.premios)}</TableCell>
                  <TableCell sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mostrando {data.length} entradas</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ZoneSales;
