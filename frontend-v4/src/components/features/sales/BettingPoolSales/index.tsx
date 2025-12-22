import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack, Table, TableHead, TableBody, TableRow, TableCell, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import { FilterList, PictureAsPdf, Download } from '@mui/icons-material';
import api from '@services/api';

interface Banca {
  id: number;
  bettingPoolId?: number;
  name: string;
  code?: string;
}

interface SalesData {
  codigo: string;
  nombre: string;
  ventas: number;
  comisiones: number;
  premios: number;
  neto: number;
}

interface Totals {
  ventas: number;
  comisiones: number;
  premios: number;
  neto: number;
}

// API Response interface
interface BettingPoolSalesDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

const BettingPoolSales = (): React.ReactElement => {
  const [fechaInicial, setFechaInicial] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [banca, setBanca] = useState<Banca | null>(null);
  const [filterType, setFilterType] = useState<string>('todos');
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [data, setData] = useState<SalesData[]>([]);
  const [bancasList, setBancasList] = useState<Banca[]>([]);
  const [totals, setTotals] = useState<Totals>({ ventas: 0, comisiones: 0, premios: 0, neto: 0 });
  const [loading, setLoading] = useState<boolean>(false);

  const formatCurrency = useCallback((amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount), []);

  // Load bancas on mount
  useEffect(() => {
    const loadBancas = async () => {
      try {
        const response = await api.get<{ items?: Banca[] } | Banca[]>('/betting-pools');
        const bancasArray = (response && typeof response === 'object' && 'items' in response)
          ? (response.items || [])
          : (response as Banca[] || []);

        const normalizedBancas = bancasArray.map((b: Banca) => ({
          id: b.bettingPoolId || b.id,
          name: b.name || '',
          code: b.code || ''
        }));
        setBancasList(normalizedBancas);
      } catch (error) {
        console.error('Error loading bancas:', error);
      }
    };
    loadBancas();
  }, []);

  // Load sales by betting pool
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await api.get<BettingPoolSalesDto[]>(
        `/reports/sales/by-betting-pool?startDate=${fechaInicial}&endDate=${fechaFinal}${banca ? `&bettingPoolId=${banca.id}` : ''}`
      );

      const mapped: SalesData[] = (response || []).map(item => ({
        codigo: item.bettingPoolCode,
        nombre: item.bettingPoolName,
        ventas: item.totalSold,
        comisiones: item.totalCommissions,
        premios: item.totalPrizes,
        neto: item.totalNet
      }));

      setData(mapped);

      const newTotals = mapped.reduce((acc, row) => ({
        ventas: acc.ventas + row.ventas,
        comisiones: acc.comisiones + row.comisiones,
        premios: acc.premios + row.premios,
        neto: acc.neto + row.neto
      }), { ventas: 0, comisiones: 0, premios: 0, neto: 0 });

      setTotals(newTotals);
    } catch (error) {
      console.error('Error loading betting pool sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const FILTER_OPTIONS = [
    { value: 'todos', label: 'Todos' },
    { value: 'con_ventas', label: 'Con ventas' },
    { value: 'con_premios', label: 'Con premios' },
    { value: 'ventas_negativas', label: 'Ventas negativas' },
    { value: 'ventas_positivas', label: 'Ventas positivas' }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            Ventas por banca
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
              <Autocomplete options={bancasList} getOptionLabel={(o) => o.name || ''} value={banca}
                onChange={(e, v) => setBanca(v)} renderInput={(params) => <TextField {...params} label="Banca" size="small" />} />
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
              Ver ventas
            </Button>
            <Button variant="contained" startIcon={<Download />} sx={{ borderRadius: '30px', textTransform: 'uppercase' }}>CSV</Button>
            <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ borderRadius: '30px', textTransform: 'uppercase' }}>PDF</Button>
          </Stack>

          <Typography variant="h5" align="center" sx={{ mb: 3, color: '#1976d2' }}>
            Total Neto: {formatCurrency(totals.neto)}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Filtrar</Typography>
            <ToggleButtonGroup exclusive value={filterType} onChange={(e, v) => v && setFilterType(v)} size="small">
              {FILTER_OPTIONS.map(opt => (
                <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <TextField fullWidth placeholder="Filtro rapido" value={filtroRapido} onChange={(e) => setFiltroRapido(e.target.value)}
            size="small" sx={{ mb: 2, maxWidth: 300 }} />

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {['Código', 'Nombre', 'Ventas', 'Comisiones', 'Premios', 'Neto'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                <TableCell sx={{ fontWeight: 600 }}>Totales</TableCell>
                <TableCell>-</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.ventas)}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.comisiones)}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(totals.premios)}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: totals.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totals.neto)}</TableCell>
              </TableRow>
              {data.map((d, i) => (
                <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{d.codigo}</TableCell>
                  <TableCell>{d.nombre}</TableCell>
                  <TableCell>{formatCurrency(d.ventas)}</TableCell>
                  <TableCell>{formatCurrency(d.comisiones)}</TableCell>
                  <TableCell>{formatCurrency(d.premios)}</TableCell>
                  <TableCell sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mostrando {data.length} entradas</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default BettingPoolSales;
