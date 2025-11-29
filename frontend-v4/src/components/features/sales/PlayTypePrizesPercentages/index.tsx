import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { FilterList } from '@mui/icons-material';

interface Zona {
  id: number;
  name: string;
}

interface PercentageData {
  tipoJugada: string;
  porcentajeVentas: string;
  porcentajePremios: string;
  porcentajeNeto: string;
}

const PlayTypePrizesPercentages = (): React.ReactElement => {
  const [fechaInicial, setFechaInicial] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [data, setData] = useState<PercentageData[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);

  useEffect(() => {
    const mockData = [
      { tipoJugada: 'Directo', porcentajeVentas: '42.1%', porcentajePremios: '17.4%', porcentajeNeto: '48.9%' },
      { tipoJugada: 'Palé', porcentajeVentas: '22.5%', porcentajePremios: '24.5%', porcentajeNeto: '-30.1%' },
      { tipoJugada: 'Tripleta', porcentajeVentas: '9.8%', porcentajePremios: '42.9%', porcentajeNeto: '-131.6%' },
      { tipoJugada: 'Pick Two', porcentajeVentas: '14.6%', porcentajePremios: '5.7%', porcentajeNeto: '18.0%' },
      { tipoJugada: 'Pick Three', porcentajeVentas: '5.9%', porcentajePremios: '9.2%', porcentajeNeto: '-18.0%' },
      { tipoJugada: 'Pick Four', porcentajeVentas: '5.1%', porcentajePremios: '0.0%', porcentajeNeto: '13.5%' }
    ];
    setData(mockData);

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' }
    ]);
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            Porcentajes de premios por jugada
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
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

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button variant="contained" startIcon={<FilterList />} sx={{ px: 6, borderRadius: '30px', textTransform: 'uppercase' }}>
              Filtrar
            </Button>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {['Tipo de jugada', '% de Ventas', '% de Premios', '% de Neto'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((d, i) => (
                <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{d.tipoJugada}</TableCell>
                  <TableCell>{d.porcentajeVentas}</TableCell>
                  <TableCell>{d.porcentajePremios}</TableCell>
                  <TableCell sx={{ color: d.porcentajeNeto.includes('-') ? 'error.main' : 'success.main' }}>{d.porcentajeNeto}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default PlayTypePrizesPercentages;
