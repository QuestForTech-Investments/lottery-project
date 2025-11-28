import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { FilterList, PictureAsPdf } from '@mui/icons-material';

const WinningPlays = () => {
  const [fechaInicial, setFechaInicial] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState(new Date().toISOString().split('T')[0]);
  const [sorteo, setSorteo] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [data, setData] = useState([]);
  const [sorteosList, setSorteosList] = useState([]);
  const [zonasList, setZonasList] = useState([]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    const mockData = [
      { tipoJugada: 'Directo', jugada: '45', venta: formatCurrency(1250), premio: formatCurrency(70000), total: formatCurrency(-68750) },
      { tipoJugada: 'Palé', jugada: '12-45', venta: formatCurrency(850), premio: formatCurrency(42500), total: formatCurrency(-41650) },
      { tipoJugada: 'Tripleta', jugada: '12-45-78', venta: formatCurrency(320), premio: formatCurrency(96000), total: formatCurrency(-95680) },
      { tipoJugada: 'Directo', jugada: '23', venta: formatCurrency(980), premio: formatCurrency(54880), total: formatCurrency(-53900) },
      { tipoJugada: 'Pick Two', jugada: '67-89', venta: formatCurrency(450), premio: formatCurrency(18000), total: formatCurrency(-17550) },
      { tipoJugada: 'Directo', jugada: '99', venta: formatCurrency(2100), premio: formatCurrency(117600), total: formatCurrency(-115500) },
      { tipoJugada: 'Palé', jugada: '33-77', venta: formatCurrency(670), premio: formatCurrency(33500), total: formatCurrency(-32830) },
      { tipoJugada: 'Tripleta', jugada: '11-22-33', venta: formatCurrency(180), premio: formatCurrency(54000), total: formatCurrency(-53820) }
    ];
    setData(mockData);

    setSorteosList([
      { id: 1, name: 'Nacional 12PM' },
      { id: 2, name: 'Nacional 3PM' },
      { id: 3, name: 'NY 10:30AM' },
      { id: 4, name: 'Florida 1:30PM' },
      { id: 5, name: 'DIARIA 11AM' }
    ]);

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
            Jugadas ganadoras
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Fecha inicial" value={fechaInicial}
                onChange={(e) => setFechaInicial(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Fecha final" value={fechaFinal}
                onChange={(e) => setFechaFinal(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete options={sorteosList} getOptionLabel={(o) => o.name || ''} value={sorteo}
                onChange={(e, v) => setSorteo(v)} renderInput={(params) => <TextField {...params} label="Sorteo" size="small" />} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete multiple options={zonasList} getOptionLabel={(o) => o.name || ''} value={zonas}
                onChange={(e, v) => setZonas(v)} renderInput={(params) => <TextField {...params} label="Zonas" size="small"
                  helperText={zonas.length > 0 ? `${zonas.length} seleccionadas` : ''} />} />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<FilterList />} sx={{ textTransform: 'uppercase' }}>Filtrar</Button>
            <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ textTransform: 'uppercase' }}>PDF</Button>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {['Tipo de jugada', 'Jugada', 'Venta', 'Premio', 'Total'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: '#1976d2' }}>No hay entradas disponibles</TableCell></TableRow>
              ) : data.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.tipoJugada}</TableCell><TableCell>{r.jugada}</TableCell><TableCell>{r.venta}</TableCell>
                  <TableCell>{r.premio}</TableCell><TableCell>{r.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default WinningPlays;
