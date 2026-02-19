import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress } from '@mui/material';
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
  descuentos: number;
  premios: number;
  neto: number;
}

interface Totals {
  ventas: number;
  comisiones: number;
  descuentos: number;
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
  totalDiscounts: number;
  totalNet: number;
}

const BettingPoolSales = (): React.ReactElement => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [banca, setBanca] = useState<Banca | null>(null);
  const [data, setData] = useState<SalesData[]>([]);
  const [bancasList, setBancasList] = useState<Banca[]>([]);
  const [totals, setTotals] = useState<Totals>({ ventas: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0 });
  const [loading, setLoading] = useState<boolean>(false);


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
        `/reports/sales/by-betting-pool?startDate=${fecha}&endDate=${fecha}${banca ? `&bettingPoolId=${banca.id}` : ''}`
      );

      const mapped: SalesData[] = (response || []).map(item => ({
        codigo: item.bettingPoolCode,
        nombre: item.bettingPoolName,
        ventas: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: item.totalDiscounts,
        premios: item.totalPrizes,
        neto: item.totalNet
      }));

      setData(mapped);

      const newTotals = mapped.reduce((acc, row) => ({
        ventas: acc.ventas + row.ventas,
        comisiones: acc.comisiones + row.comisiones,
        descuentos: acc.descuentos + row.descuentos,
        premios: acc.premios + row.premios,
        neto: acc.neto + row.neto
      }), { ventas: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0 });

      setTotals(newTotals);
    } catch (error) {
      console.error('Error loading betting pool sales:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Fecha
              </Typography>
              <TextField
                type="date"
                size="small"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                sx={{ width: 180 }}
              />
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Banca
              </Typography>
              <Autocomplete
                options={bancasList}
                getOptionLabel={(o) => o.name || ''}
                value={banca}
                onChange={(e, v) => setBanca(v)}
                renderInput={(params) => <TextField {...params} size="small" placeholder="Seleccione" />}
                sx={{ minWidth: 200 }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
                borderRadius: '30px',
                px: 4,
                textTransform: 'uppercase',
                color: 'white'
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Ver ventas'}
            </Button>
          </Box>

          <Table size="small">
            <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Nombre</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Ventas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Comisiones</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Descuentos</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Premios</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Neto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((d, i) => (
                <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{d.codigo}</TableCell>
                  <TableCell>{d.nombre}</TableCell>
                  <TableCell align="right">{formatCurrency(d.ventas)}</TableCell>
                  <TableCell align="right">{formatCurrency(d.comisiones)}</TableCell>
                  <TableCell align="right">{formatCurrency(d.descuentos)}</TableCell>
                  <TableCell align="right">{formatCurrency(d.premios)}</TableCell>
                  <TableCell align="right" sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                <TableCell>Totales</TableCell>
                <TableCell>-</TableCell>
                <TableCell align="right">{formatCurrency(totals.ventas)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.comisiones)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.descuentos)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.premios)}</TableCell>
                <TableCell align="right" sx={{ color: totals.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totals.neto)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mostrando {data.length} entradas</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default BettingPoolSales;
