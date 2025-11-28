import React, { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { FilterList, PictureAsPdf } from '@mui/icons-material';

interface Zona {
  id: number;
  name: string;
}

interface Sorteo {
  id: number;
  name: string;
}

interface PlayTypeData {
  tipoJugada: string;
  ventas: number;
  premios: number;
  neto: number;
  porcentaje: string;
}

const PlayTypePrizes = (): React.ReactElement => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sorteo, setSorteo] = useState<Sorteo | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [data, setData] = useState<PlayTypeData[]>([]);
  const [sorteosList, setSorteosList] = useState<Sorteo[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);

  const formatCurrency = useCallback((amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount), []);

  useEffect(() => {
    const mockData = [
      { tipoJugada: 'Directo', ventas: 15000, premios: 8500, neto: 6500, porcentaje: '43.3%' },
      { tipoJugada: 'Palé', ventas: 8000, premios: 12000, neto: -4000, porcentaje: '-50.0%' },
      { tipoJugada: 'Tripleta', ventas: 3500, premios: 21000, neto: -17500, porcentaje: '-500.0%' },
      { tipoJugada: 'Pick Two', ventas: 5200, premios: 2800, neto: 2400, porcentaje: '46.2%' },
      { tipoJugada: 'Pick Three', ventas: 2100, premios: 4500, neto: -2400, porcentaje: '-114.3%' },
      { tipoJugada: 'Pick Four', ventas: 1800, premios: 0, neto: 1800, porcentaje: '100.0%' }
    ];
    setData(mockData);

    setSorteosList([
      { id: 1, name: 'Nacional 12PM' },
      { id: 2, name: 'Nacional 3PM' },
      { id: 3, name: 'NY 10:30AM' },
      { id: 4, name: 'Florida 1:30PM' }
    ]);

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' }
    ]);
  }, []);

  const totalVentas = data.reduce((sum, d) => sum + d.ventas, 0);
  const totalPremios = data.reduce((sum, d) => sum + d.premios, 0);
  const totalNeto = data.reduce((sum, d) => sum + d.neto, 0);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            Premios por jugada
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="date" label="Fecha" value={fecha}
                onChange={(e) => setFecha(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete options={sorteosList} getOptionLabel={(o) => o.name || ''} value={sorteo}
                onChange={(e, v) => setSorteo(v)} renderInput={(params) => <TextField {...params} label="Sorteo" size="small" />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete multiple options={zonasList} getOptionLabel={(o) => o.name || ''} value={zonas}
                onChange={(e, v) => setZonas(v)} renderInput={(params) => <TextField {...params} label="Zonas" size="small" />} />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<FilterList />} sx={{ px: 4, borderRadius: '30px', textTransform: 'uppercase' }}>Filtrar</Button>
            <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ borderRadius: '30px', textTransform: 'uppercase' }}>PDF</Button>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {['Tipo de jugada', 'Ventas', 'Premios', 'Neto', '% Ganancia'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                <TableCell sx={{ fontWeight: 600 }}>Totales</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totalVentas)}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totalPremios)}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: totalNeto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totalNeto)}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{((totalNeto / totalVentas) * 100).toFixed(1)}%</TableCell>
              </TableRow>
              {data.map((d, i) => (
                <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{d.tipoJugada}</TableCell>
                  <TableCell>{formatCurrency(d.ventas)}</TableCell>
                  <TableCell>{formatCurrency(d.premios)}</TableCell>
                  <TableCell sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                  <TableCell sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{d.porcentaje}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default PlayTypePrizes;
