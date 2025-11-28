import React, { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell, Checkbox, FormControlLabel, InputAdornment } from '@mui/material';
import { PictureAsPdf, Search } from '@mui/icons-material';

interface Banca {
  id: number;
  codigo: string;
  nombre: string;
}

interface Zona {
  id: number;
  name: string;
}

interface SalesData {
  fecha: string;
  venta: number;
  premios: number;
  comisiones: number;
  descuentos: number;
  caida: number;
  neto: number;
}

interface Totals {
  venta: number;
  premios: number;
  comisiones: number;
  descuentos: number;
  caida: number;
  neto: number;
}

const SalesByDate = (): React.ReactElement => {
  const [fechaInicial, setFechaInicial] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bancas, setBancas] = useState<Banca[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [mostrarComision2, setMostrarComision2] = useState<boolean>(false);
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [data, setData] = useState<SalesData[]>([]);
  const [bancasList, setBancasList] = useState<Banca[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [totals, setTotals] = useState<Totals>({ venta: 0, premios: 0, comisiones: 0, descuentos: 0, caida: 0, neto: 0 });

  const formatCurrency = useCallback((amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount), []);

  useEffect(() => {
    const mockData = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const venta = Math.floor(Math.random() * 10000) + 1000;
      const premios = Math.floor(Math.random() * 3000);
      const comisiones = venta * 0.1;
      const descuentos = venta * 0.02;
      const caida = Math.floor(Math.random() * 500);
      const neto = venta - comisiones - descuentos - premios;

      mockData.push({
        fecha: date.toLocaleDateString(),
        venta, premios, comisiones, descuentos, caida, neto
      });
    }
    setData(mockData);

    setTotals({
      venta: mockData.reduce((sum, d) => sum + d.venta, 0),
      premios: mockData.reduce((sum, d) => sum + d.premios, 0),
      comisiones: mockData.reduce((sum, d) => sum + d.comisiones, 0),
      descuentos: mockData.reduce((sum, d) => sum + d.descuentos, 0),
      caida: mockData.reduce((sum, d) => sum + d.caida, 0),
      neto: mockData.reduce((sum, d) => sum + d.neto, 0)
    });

    setBancasList([
      { id: 1, codigo: 'RB001', nombre: 'Banca Central' },
      { id: 2, codigo: 'RB002', nombre: 'Banca Norte' },
      { id: 3, codigo: 'RB003', nombre: 'Banca Sur' },
      { id: 4, codigo: 'RB004', nombre: 'Banca Este' },
      { id: 5, codigo: 'RB005', nombre: 'Banca Oeste' }
    ]);

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' },
      { id: 5, name: 'Centro' },
      { id: 6, name: 'Metropolitana' },
      { id: 7, name: 'Rural' },
      { id: 8, name: 'Industrial' },
      { id: 9, name: 'Comercial' },
      { id: 10, name: 'Residencial' }
    ]);
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            Ventas por fecha
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
              <Autocomplete multiple options={bancasList} getOptionLabel={(o) => `${o.codigo} - ${o.nombre}` || ''} value={bancas}
                onChange={(e, v) => setBancas(v)} renderInput={(params) => <TextField {...params} label="Bancas" size="small" />} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete multiple options={zonasList} getOptionLabel={(o) => o.name || ''} value={zonas}
                onChange={(e, v) => setZonas(v)}
                renderInput={(params) => <TextField {...params} label="Zonas" size="small"
                  placeholder={zonas.length === 0 ? "Seleccione" : `${zonas.length} seleccionadas`} />} />
            </Grid>
          </Grid>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={mostrarComision2} onChange={(e) => setMostrarComision2(e.target.checked)} />}
              label="Mostrar comisión #2"
            />
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
              px: 4,
              borderRadius: '30px',
              textTransform: 'uppercase',
              color: 'white'
            }}>Ver ventas</Button>
            <Button variant="contained" startIcon={<PictureAsPdf />} sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
              borderRadius: '30px',
              textTransform: 'uppercase',
              color: 'white'
            }}>PDF</Button>
          </Stack>

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

          <Typography variant="h5" align="center" sx={{ mb: 3, color: '#1976d2' }}>
            Total Neto: {formatCurrency(totals.neto)}
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {['Fecha', 'Venta', 'Premios', 'Comisiones', 'Descuentos', 'Caída', 'Neto'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No hay entradas disponibles
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {data.map((d, i) => (
                    <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell>{d.fecha}</TableCell>
                      <TableCell>{formatCurrency(d.venta)}</TableCell>
                      <TableCell>{formatCurrency(d.premios)}</TableCell>
                      <TableCell>{formatCurrency(d.comisiones)}</TableCell>
                      <TableCell>{formatCurrency(d.descuentos)}</TableCell>
                      <TableCell>{formatCurrency(d.caida)}</TableCell>
                      <TableCell sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Totales</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.venta)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.premios)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.comisiones)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.descuentos)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.caida)}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: totals.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totals.neto)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mostrando {data.length} entradas</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SalesByDate;
