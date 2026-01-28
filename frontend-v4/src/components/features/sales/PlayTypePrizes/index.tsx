import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, InputAdornment } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import api from '@services/api';

interface Zona {
  id: number;
  zoneId?: number;
  name: string;
  zoneName?: string;
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
  const [fechaInicial, setFechaInicial] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [data, setData] = useState<PlayTypeData[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  // Load zones on mount
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
        `/reports/sales/prize-categories?startDate=${fechaInicial}&endDate=${fechaFinal}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
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
          <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: 400 }}>
            Premios por tipo de jugada
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
                onChange={(e, v) => setZonas(v)}
                renderTags={() => null}
                renderInput={(params) => (
                  <TextField {...params} label="Zonas" size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: zonas.length > 0 ? (
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          {zonas.length === 1 ? zonas[0].name : `${zonas.length} seleccionadas`}
                        </InputAdornment>
                      ) : null
                    }}
                    placeholder={zonas.length === 0 ? "Seleccione" : ""} />
                )} />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
              sx={{
                px: 4,
                borderRadius: '30px',
                textTransform: 'uppercase'
              }}
            >
              Refrescar
            </Button>
            <Button
              variant="contained"
              sx={{
                borderRadius: '30px',
                textTransform: 'uppercase'
              }}
            >
              CSV
            </Button>
          </Stack>

          {data.length === 0 ? (
            <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              No hay entradas para el sorteo y la fecha elegidos
            </Typography>
          ) : (
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Tipo de jugada</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Ventas</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Premios</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Neto</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>% Ganancia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((d, i) => (
                  <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell>{d.tipoJugada}</TableCell>
                    <TableCell align="right">{formatCurrency(d.ventas)}</TableCell>
                    <TableCell align="right">{formatCurrency(d.premios)}</TableCell>
                    <TableCell align="right" sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                    <TableCell align="right" sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{d.porcentaje}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                  <TableCell>Totales</TableCell>
                  <TableCell align="right">{formatCurrency(totalVentas)}</TableCell>
                  <TableCell align="right">{formatCurrency(totalPremios)}</TableCell>
                  <TableCell align="right" sx={{ color: totalNeto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totalNeto)}</TableCell>
                  <TableCell align="right">{totalVentas > 0 ? ((totalNeto / totalVentas) * 100).toFixed(1) : '0.0'}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default PlayTypePrizes;
