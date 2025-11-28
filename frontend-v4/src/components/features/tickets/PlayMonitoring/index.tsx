import React, { useState, useEffect, memo } from 'react';
import { Box, Paper, Typography, TextField, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { Refresh, PictureAsPdf, Print } from '@mui/icons-material';

interface Sorteo {
  id: number;
  name: string;
}

interface Zona {
  id: number;
  name: string;
}

interface PlayData {
  numero: string;
  ventas: number;
  limite: number;
  disponible: number;
  porcentaje: string;
}

const PlayMonitoring: React.FC = () => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sorteo, setSorteo] = useState<Sorteo | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [banca, setBanca] = useState<string>('');
  const [data, setData] = useState<PlayData[]>([]);
  const [sorteosList, setSorteosList] = useState<Sorteo[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);

  const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    // Mock play monitoring data - grid format with numbers 00-99
    const mockData = [];
    for (let i = 0; i < 100; i++) {
      const num = i.toString().padStart(2, '0');
      const ventas = Math.floor(Math.random() * 500) + 10;
      const limite = 1000;
      mockData.push({
        numero: num,
        ventas: ventas,
        limite: limite,
        disponible: limite - ventas,
        porcentaje: ((ventas / limite) * 100).toFixed(1)
      });
    }
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
            Monitoreo de jugadas
          </Typography>

          <Box sx={{ mb: 2, maxWidth: 400 }}>
            <TextField fullWidth type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }} size="small" />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Autocomplete options={sorteosList} getOptionLabel={(o) => o.name || ''} value={sorteo}
              onChange={(e, v) => setSorteo(v)} renderInput={(params) => <TextField {...params} label="Sorteos" size="small" />} />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Autocomplete multiple options={zonasList} getOptionLabel={(o) => o.name || ''} value={zonas}
              onChange={(e, v) => setZonas(v)} renderInput={(params) => <TextField {...params} label="Zonas" size="small"
                helperText={zonas.length > 0 ? `${zonas.length} seleccionadas` : ''} />} />
          </Box>

          <Box sx={{ mb: 3, maxWidth: 400 }}>
            <TextField fullWidth label="Banca" value={banca} onChange={(e) => setBanca(e.target.value)} size="small" />
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<Refresh />} sx={{ textTransform: 'uppercase' }}>Refrescar</Button>
            <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ textTransform: 'uppercase' }}>PDF</Button>
            <Button variant="contained" startIcon={<Print />} sx={{ textTransform: 'uppercase' }}>Imprimir</Button>
          </Stack>

          {data.length === 0 ? (
            <Typography variant="h6" sx={{ fontWeight: 400 }}>
              No hay entradas para el sorteo y la fecha elegidos
            </Typography>
          ) : (
            <>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Total de números: {data.length} | Ventas totales: {formatCurrency(data.reduce((sum, d) => sum + d.ventas, 0))}
                </Typography>
              </Paper>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {['Número', 'Ventas', 'Límite', 'Disponible', '% Vendido'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', fontSize: '0.75rem' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((d, i) => (
                      <TableRow key={i} sx={{
                        '&:hover': { backgroundColor: 'action.hover' },
                        backgroundColor: parseFloat(d.porcentaje) > 80 ? 'error.light' : parseFloat(d.porcentaje) > 50 ? 'warning.light' : 'inherit'
                      }}>
                        <TableCell sx={{ fontWeight: 600 }}>{d.numero}</TableCell>
                        <TableCell>{formatCurrency(d.ventas)}</TableCell>
                        <TableCell>{formatCurrency(d.limite)}</TableCell>
                        <TableCell>{formatCurrency(d.disponible)}</TableCell>
                        <TableCell sx={{
                          color: parseFloat(d.porcentaje) > 80 ? 'error.main' : parseFloat(d.porcentaje) > 50 ? 'warning.main' : 'success.main',
                          fontWeight: 500
                        }}>{d.porcentaje}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(PlayMonitoring);
