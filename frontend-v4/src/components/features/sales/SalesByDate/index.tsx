import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack,
  Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, InputAdornment, CircularProgress,
} from '@mui/material';
import { PictureAsPdf, Search } from '@mui/icons-material';
import api from '@services/api';
import { getTodayDate } from '@/utils/formatters';
import { exportToPdf, type ExportColumn } from '@/utils/exportTable';
import { useTableSort } from '@/utils/useTableSort';

interface Banca {
  id: number;
  bettingPoolId?: number;
  bettingPoolCode?: string;
  bettingPoolName?: string;
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

interface DailySalesDto {
  date: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalDiscounts: number;
  fall: number;
  totalNet: number;
}

// Sentinel id used by the "Todas/Todos" synthetic option in the multi-selects.
const SELECT_ALL_ID = -1;

const SalesByDate = (): React.ReactElement => {
  const [fechaInicial, setFechaInicial] = useState<string>(getTodayDate());
  const [fechaFinal, setFechaFinal] = useState<string>(getTodayDate());
  const [bancas, setBancas] = useState<Banca[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [data, setData] = useState<SalesData[]>([]);
  const [bancasList, setBancasList] = useState<Banca[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [totals, setTotals] = useState<Totals>({ venta: 0, premios: 0, comisiones: 0, descuentos: 0, caida: 0, neto: 0 });
  const [loading, setLoading] = useState<boolean>(false);

  // Load zones and bancas on mount.
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const zonesResponse = await api.get<{ items?: Zona[] } | Zona[]>('/zones');
        const zonesArray = (zonesResponse && typeof zonesResponse === 'object' && 'items' in zonesResponse)
          ? (zonesResponse.items || [])
          : (zonesResponse as Zona[] || []);
        const normalizedZones = zonesArray.map((z: Zona) => ({
          id: z.zoneId || z.id,
          name: z.zoneName || z.name,
        }));
        setZonasList(normalizedZones);

        const bancasResponse = await api.get<{ items?: Banca[] } | Banca[]>('/betting-pools?pageSize=1000');
        const bancasArray = (bancasResponse && typeof bancasResponse === 'object' && 'items' in bancasResponse)
          ? (bancasResponse.items || [])
          : (bancasResponse as Banca[] || []);
        const normalizedBancas = bancasArray.map((b: Banca) => ({
          id: b.bettingPoolId || b.id,
          codigo: b.bettingPoolCode || b.code || b.codigo || '',
          nombre: b.bettingPoolName || b.name || b.nombre || '',
        }));
        setBancasList(normalizedBancas);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map((z) => z.id).join(',');
      const bancaIds = bancas.map((b) => b.id).join(',');
      const response = await api.get<DailySalesDto[]>(
        `/reports/sales/daily-summary-range?startDate=${fechaInicial}&endDate=${fechaFinal}${zoneIds ? `&zoneIds=${zoneIds}` : ''}${bancaIds ? `&bettingPoolIds=${bancaIds}` : ''}`,
      );

      const mapped: SalesData[] = (response || []).map((item) => {
        // Take just the YYYY-MM-DD portion so the JS Date doesn't shift to the
        // previous day when the backend sends midnight UTC.
        const ymd = (item.date || '').slice(0, 10);
        const [y, m, d] = ymd.split('-');
        return {
          fecha: y && m && d ? `${d}/${m}/${y}` : ymd,
          venta: item.totalSold,
          premios: item.totalPrizes,
          comisiones: item.totalCommissions,
          descuentos: item.totalDiscounts,
          caida: item.fall || 0,
          neto: item.totalNet,
        };
      });

      setData(mapped);

      const newTotals = mapped.reduce(
        (acc, row) => ({
          venta: acc.venta + row.venta,
          premios: acc.premios + row.premios,
          comisiones: acc.comisiones + row.comisiones,
          descuentos: acc.descuentos + row.descuentos,
          caida: acc.caida + row.caida,
          neto: acc.neto + row.neto,
        }),
        { venta: 0, premios: 0, comisiones: 0, descuentos: 0, caida: 0, neto: 0 },
      );
      setTotals(newTotals);
    } catch (error) {
      console.error('Error loading sales by date:', error);
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal, zonas, bancas]);

  // Run a search as soon as the page mounts so the user sees today's data immediately.
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    handleSearch();
  }, [handleSearch]);

  // Quick filter against the displayed date column.
  const filteredData = useMemo(() => {
    if (!filtroRapido) return data;
    const term = filtroRapido.toLowerCase();
    return data.filter((d) => d.fecha.toLowerCase().includes(term));
  }, [data, filtroRapido]);

  const { sortedData, getSortProps } = useTableSort(
    filteredData,
    (row, key) => (row as unknown as Record<string, string | number>)[key],
    { sortBy: 'fecha', sortOrder: 'asc' },
  );

  // Toggle "all" in either multi-select by intercepting the synthetic option.
  const onBancasChange = (_e: unknown, value: Banca[]) => {
    if (value.some((b) => b.id === SELECT_ALL_ID)) {
      setBancas(bancas.length === bancasList.length ? [] : bancasList.slice());
      return;
    }
    setBancas(value);
  };
  const onZonasChange = (_e: unknown, value: Zona[]) => {
    if (value.some((z) => z.id === SELECT_ALL_ID)) {
      setZonas(zonas.length === zonasList.length ? [] : zonasList.slice());
      return;
    }
    setZonas(value);
  };

  const handleExportPdf = useCallback(() => {
    if (filteredData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const moneyKeys = new Set(['venta', 'premios', 'comisiones', 'descuentos', 'caida', 'neto']);
    const columns: ExportColumn<Record<string, unknown>>[] = [
      { key: 'fecha', label: 'Fecha', align: 'left' as const },
      { key: 'venta', label: 'Venta', align: 'right' as const },
      { key: 'premios', label: 'Premios', align: 'right' as const },
      { key: 'comisiones', label: 'Comisiones', align: 'right' as const },
      { key: 'descuentos', label: 'Descuentos', align: 'right' as const },
      { key: 'caida', label: 'Caída', align: 'right' as const },
      { key: 'neto', label: 'Neto', align: 'right' as const },
    ].map((c) => ({
      ...c,
      getValue: moneyKeys.has(c.key)
        ? (row: Record<string, unknown>) => formatCurrency(Number(row[c.key] ?? 0))
        : undefined,
    }));

    exportToPdf(
      filteredData as unknown as Record<string, unknown>[],
      columns,
      `Ventas por fecha — ${fechaInicial} al ${fechaFinal}`,
      { fecha: 'Totales', ...totals },
    );
  }, [filteredData, fechaInicial, fechaFinal, totals]);

  // Prepend a synthetic "Todas/Todos" entry to drive the bulk toggle.
  const bancaOptions: Banca[] = useMemo(
    () => [{ id: SELECT_ALL_ID, codigo: '', nombre: 'Todas' } as Banca, ...bancasList],
    [bancasList],
  );
  const zonaOptions: Zona[] = useMemo(
    () => [{ id: SELECT_ALL_ID, name: 'Todas' } as Zona, ...zonasList],
    [zonasList],
  );

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
              <Autocomplete
                multiple
                options={bancaOptions}
                getOptionLabel={(o) => (o.id === SELECT_ALL_ID ? 'Todas' : `${o.codigo} - ${o.nombre}`)}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                value={bancas}
                onChange={onBancasChange}
                renderTags={() => null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Bancas"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: bancas.length > 0 ? (
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          {bancas.length === bancasList.length && bancasList.length > 0
                            ? 'Todas'
                            : bancas.length === 1
                              ? `${bancas[0].codigo} - ${bancas[0].nombre}`
                              : `${bancas.length} seleccionadas`}
                        </InputAdornment>
                      ) : null,
                    }}
                    placeholder={bancas.length === 0 ? 'Seleccione' : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                multiple
                options={zonaOptions}
                getOptionLabel={(o) => o.name || ''}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                value={zonas}
                onChange={onZonasChange}
                renderTags={() => null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Zonas"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: zonas.length > 0 ? (
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          {zonas.length === zonasList.length && zonasList.length > 0
                            ? 'Todas'
                            : zonas.length === 1
                              ? zonas[0].name
                              : `${zonas.length} seleccionadas`}
                        </InputAdornment>
                      ) : null,
                    }}
                    placeholder={zonas.length === 0 ? 'Seleccione' : ''}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
                px: 4,
                borderRadius: '30px',
                textTransform: 'uppercase',
                color: 'white',
              }}
            >
              Ver ventas
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPdf}
              sx={{
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
                borderRadius: '30px',
                textTransform: 'uppercase',
                color: 'white',
              }}
            >
              PDF
            </Button>
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
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}><TableSortLabel {...getSortProps('fecha')}>Fecha</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}><TableSortLabel {...getSortProps('venta')}>Venta</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}><TableSortLabel {...getSortProps('premios')}>Premios</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}><TableSortLabel {...getSortProps('comisiones')}>Comisiones</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}><TableSortLabel {...getSortProps('descuentos')}>Descuentos</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}><TableSortLabel {...getSortProps('caida')}>Caída</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}><TableSortLabel {...getSortProps('neto')}>Neto</TableSortLabel></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No hay entradas disponibles
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {sortedData.map((d, i) => (
                    <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell>{d.fecha}</TableCell>
                      <TableCell align="right">{formatCurrency(d.venta)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.premios)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.comisiones)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.descuentos)}</TableCell>
                      <TableCell align="right">{formatCurrency(d.caida)}</TableCell>
                      <TableCell align="right" sx={{ color: d.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(d.neto)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                    <TableCell>Totales</TableCell>
                    <TableCell align="right">{formatCurrency(totals.venta)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.premios)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.comisiones)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.descuentos)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.caida)}</TableCell>
                    <TableCell align="right" sx={{ color: totals.neto >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(totals.neto)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Mostrando {filteredData.length} de {data.length} entradas
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SalesByDate;
