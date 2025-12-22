import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import api from '@services/api';

interface Zona {
  id: number;
  zoneId?: number;
  name: string;
  zoneName?: string;
}

interface PercentageData {
  tipoJugada: string;
  porcentajeVentas: string;
  porcentajePremios: string;
  porcentajeNeto: string;
}

// API Response interface
interface PercentageCategoryDto {
  betTypeName: string;
  salesPercentage: number;
  prizesPercentage: number;
  netPercentage: number;
}

const PlayTypePrizesPercentages = (): React.ReactElement => {
  const [fechaInicial, setFechaInicial] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [data, setData] = useState<PercentageData[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };
    loadZones();
  }, []);

  // Load percentages
  const handleSearch = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<PercentageCategoryDto[]>(
        `/reports/sales/prize-percentages?startDate=${fechaInicial}&endDate=${fechaFinal}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: PercentageData[] = (response || []).map(item => ({
        tipoJugada: item.betTypeName,
        porcentajeVentas: `${item.salesPercentage.toFixed(1)}%`,
        porcentajePremios: `${item.prizesPercentage.toFixed(1)}%`,
        porcentajeNeto: `${item.netPercentage.toFixed(1)}%`
      }));

      setData(mapped);
    } catch (error) {
      console.error('Error loading percentages:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FilterList />}
              sx={{ px: 6, borderRadius: '30px', textTransform: 'uppercase' }}
            >
              Filtrar
            </Button>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3e3e3' }}>
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
