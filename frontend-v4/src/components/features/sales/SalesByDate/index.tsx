import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell, Switch, FormControlLabel, InputAdornment, CircularProgress } from '@mui/material';
import { PictureAsPdf, Search } from '@mui/icons-material';
import api from '@services/api';

interface Banca {
  id: number;
  bettingPoolId?: number;
  codigo: string;
  code?: string;
  nombre: string;
  name?: string;
}

interface Zona {
  id: number;
  zoneId?: number;
  name: string;
  zoneName?: string;
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

// API Response interface
interface DailySalesDto {
  date: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalDiscounts: number;
  fall: number;
  totalNet: number;
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
  const [loading, setLoading] = useState<boolean>(false);

  const formatCurrency = useCallback((amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount), []);

  // Load zones and bancas on mount
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

        // Load bancas (betting pools)
        const bancasResponse = await api.get<{ items?: Banca[] } | Banca[]>('/betting-pools');
        const bancasArray = (bancasResponse && typeof bancasResponse === 'object' && 'items' in bancasResponse)
          ? (bancasResponse.items || [])
          : (bancasResponse as Banca[] || []);
        const normalizedBancas = bancasArray.map((b: Banca) => ({
          id: b.bettingPoolId || b.id,
          codigo: b.code || b.codigo || '',
          nombre: b.name || b.nombre || ''
        }));
        setBancasList(normalizedBancas);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  }, []);

  // Load sales by date
  const handleSearch = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const bancaIds = bancas.map(b => b.id).join(',');
      const response = await api.get<DailySalesDto[]>(
        `/reports/sales/daily-summary?startDate=${fechaInicial}&endDate=${fechaFinal}${zoneIds ? `&zoneIds=${zoneIds}` : ''}${bancaIds ? `&bettingPoolIds=${bancaIds}` : ''}`
      );

      const mapped: SalesData[] = (response || []).map(item => ({
        fecha: new Date(item.date).toLocaleDateString('es-ES'),
        venta: item.totalSold,
        premios: item.totalPrizes,
        comisiones: item.totalCommissions,
        descuentos: item.totalDiscounts,
        caida: item.fall || 0,
        neto: item.totalNet
      }));

      setData(mapped);

      const newTotals = mapped.reduce((acc, row) => ({
        venta: acc.venta + row.venta,
        premios: acc.premios + row.premios,
        comisiones: acc.comisiones + row.comisiones,
        descuentos: acc.descuentos + row.descuentos,
        caida: acc.caida + row.caida,
        neto: acc.neto + row.neto
      }), { venta: 0, premios: 0, comisiones: 0, descuentos: 0, caida: 0, neto: 0 });

      setTotals(newTotals);
    } catch (error) {
      console.error('Error loading sales by date:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: 400 }}>
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
              control={<Switch checked={mostrarComision2} onChange={(e) => setMostrarComision2(e.target.checked)} color="primary" />}
              label="Mostrar comisión #2"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
            />
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                px: 4,
                borderRadius: '30px',
                textTransform: 'uppercase',
                color: 'white'
              }}
            >
              Ver ventas
            </Button>
            <Button variant="contained" startIcon={<PictureAsPdf />} sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
              borderRadius: '30px',
              textTransform: 'uppercase',
              color: 'white'
            }}>PDF</Button>
          </Stack>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
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

          <Table size="small">
            <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
              <TableRow>
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
                  <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                    <TableCell>Totales</TableCell>
                    <TableCell>{formatCurrency(totals.venta)}</TableCell>
                    <TableCell>{formatCurrency(totals.premios)}</TableCell>
                    <TableCell>{formatCurrency(totals.comisiones)}</TableCell>
                    <TableCell>{formatCurrency(totals.descuentos)}</TableCell>
                    <TableCell>{formatCurrency(totals.caida)}</TableCell>
                    <TableCell sx={{ color: totals.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totals.neto)}</TableCell>
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
