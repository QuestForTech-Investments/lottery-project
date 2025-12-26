import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, InputAdornment } from '@mui/material';
import { Refresh, PictureAsPdf, Search } from '@mui/icons-material';
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
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(d => d.tipoJugada.toLowerCase().includes(term));
  }, [data, searchTerm]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: 400 }}>
            Reporte de porcentaje de jugadas
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
              startIcon={<PictureAsPdf />}
              sx={{
                borderRadius: '30px',
                textTransform: 'uppercase'
              }}
            >
              PDF
            </Button>
          </Stack>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <TextField
              size="small"
              placeholder="Filtrado rápido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {filteredData.length === 0 ? (
            <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              No hay entradas disponibles
            </Typography>
          ) : (
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
                <TableRow>
                  {['Tipo de jugada', '% de Ventas', '% de Premios', '% de Neto'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((d, i) => (
                  <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{d.tipoJugada}</TableCell>
                    <TableCell>{d.porcentajeVentas}</TableCell>
                    <TableCell>{d.porcentajePremios}</TableCell>
                    <TableCell sx={{ color: d.porcentajeNeto.includes('-') ? 'error.main' : 'success.main' }}>{d.porcentajeNeto}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
            Mostrando {filteredData.length} de {data.length} entradas
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PlayTypePrizesPercentages;
