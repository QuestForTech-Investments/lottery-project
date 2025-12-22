import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress } from '@mui/material';
import { FilterList, PictureAsPdf } from '@mui/icons-material';
import api from '@services/api';

interface Zona {
  id: number;
  zoneId?: number;
  name: string;
  zoneName?: string;
}

interface Sorteo {
  id: number;
  drawId?: number;
  name: string;
  drawName?: string;
}

interface PlayTypeData {
  tipoJugada: string;
  ventas: number;
  premios: number;
  neto: number;
  porcentaje: string;
}

// API Response interface
interface PrizeCategoryDto {
  betTypeName: string;
  totalSold: number;
  totalPrizes: number;
  totalNet: number;
  percentage: number;
}

const PlayTypePrizes = (): React.ReactElement => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sorteo, setSorteo] = useState<Sorteo | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [data, setData] = useState<PlayTypeData[]>([]);
  const [sorteosList, setSorteosList] = useState<Sorteo[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const formatCurrency = useCallback((amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount), []);

  // Load zones and draws on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        // Load zones
        const zonesResponse = await api.get<{ items?: Zona[] } | Zona[]>('/zones');
        const zonesArray = (zonesResponse && typeof zonesResponse === 'object' && 'items' in zonesResponse)
          ? (zonesResponse.items || [])
          : (zonesResponse as Zona[] || []);
        const normalizedZones = zonesArray.map((z: Zona) => ({
          id: z.zoneId || z.id,
          name: z.zoneName || z.name
        }));
        setZonasList(normalizedZones);

        // Load draws
        const drawsResponse = await api.get<{ items?: Sorteo[] } | Sorteo[]>('/draws');
        const drawsArray = (drawsResponse && typeof drawsResponse === 'object' && 'items' in drawsResponse)
          ? (drawsResponse.items || [])
          : (drawsResponse as Sorteo[] || []);
        const normalizedDraws = drawsArray.map((d: Sorteo) => ({
          id: d.drawId || d.id,
          name: d.drawName || d.name
        }));
        setSorteosList(normalizedDraws);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  }, []);

  // Load prize categories
  const handleSearch = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<PrizeCategoryDto[]>(
        `/reports/sales/prize-categories?date=${fecha}${sorteo ? `&drawId=${sorteo.id}` : ''}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: PlayTypeData[] = (response || []).map(item => ({
        tipoJugada: item.betTypeName,
        ventas: item.totalSold,
        premios: item.totalPrizes,
        neto: item.totalNet,
        porcentaje: `${item.percentage.toFixed(1)}%`
      }));

      setData(mapped);
    } catch (error) {
      console.error('Error loading prize categories:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FilterList />}
              sx={{ px: 4, borderRadius: '30px', textTransform: 'uppercase' }}
            >
              Filtrar
            </Button>
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
                <TableCell sx={{ fontWeight: 600 }}>{totalVentas > 0 ? ((totalNeto / totalVentas) * 100).toFixed(1) : '0.0'}%</TableCell>
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
