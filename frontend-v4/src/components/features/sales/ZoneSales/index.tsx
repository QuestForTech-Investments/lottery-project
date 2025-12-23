import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, TextField, Autocomplete, Button, Table, TableBody, TableRow, TableCell, CircularProgress, Divider } from '@mui/material';
import api from '@services/api';

interface Zona {
  id: number;
  zoneId?: number;
  name: string;
  zoneName?: string;
}

// API Response interface
interface ZoneSalesDto {
  zoneId: number;
  zoneName: string;
  bettingPoolCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

const ZoneSales = (): React.ReactElement => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [zona, setZona] = useState<Zona | null>(null);
  const [summary, setSummary] = useState<{
    zoneName: string;
    bancas: number;
    tickets: number;
    venta: number;
    comision1: number;
    comision2: number;
    premios: number;
    neto: number;
    final: number;
  } | null>(null);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const formatCurrency = useCallback((amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount), []);

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

  // Load sales by zone
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await api.get<ZoneSalesDto[]>(
        `/reports/sales/by-zone?startDate=${fecha}&endDate=${fecha}${zona ? `&zoneIds=${zona.id}` : ''}`
      );

      if (response && response.length > 0) {
        const item = response[0];
        setSummary({
          zoneName: item.zoneName || (zona?.name || ''),
          bancas: item.bettingPoolCount || 0,
          tickets: 0, // API doesn't provide this, default to 0
          venta: item.totalSold || 0,
          comision1: item.totalCommissions || 0,
          comision2: 0, // API doesn't provide this separately
          premios: item.totalPrizes || 0,
          neto: item.totalNet || 0,
          final: item.totalNet || 0
        });
      } else {
        setSummary({
          zoneName: zona?.name || '',
          bancas: 0,
          tickets: 0,
          venta: 0,
          comision1: 0,
          comision2: 0,
          premios: 0,
          neto: 0,
          final: 0
        });
      }
    } catch (error) {
      console.error('Error loading zone sales:', error);
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
                Zona
              </Typography>
              <Autocomplete
                options={zonasList}
                getOptionLabel={(o) => o.name || ''}
                value={zona}
                onChange={(e, v) => setZona(v)}
                renderInput={(params) => <TextField {...params} size="small" placeholder="Seleccione" />}
                sx={{ minWidth: 200 }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                borderRadius: '30px',
                px: 4,
                textTransform: 'uppercase',
                color: 'white'
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Ver ventas'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 400 }}>
            Resumen de venta
          </Typography>

          <Table size="small" sx={{ maxWidth: 400, mx: 'auto' }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Zona</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>{summary?.zoneName || ''}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Bancas</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>{summary?.bancas || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Tickets</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>{summary?.tickets || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Venta</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>{formatCurrency(summary?.venta || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Comision 1</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>{formatCurrency(summary?.comision1 || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Comision 2</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>{formatCurrency(summary?.comision2 || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Premios</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>{formatCurrency(summary?.premios || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Neto</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>{formatCurrency(summary?.neto || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Final</TableCell>
                <TableCell align="right">{formatCurrency(summary?.final || 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default ZoneSales;
