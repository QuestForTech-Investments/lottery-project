import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Grid, Button, Stack, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, TableSortLabel, CircularProgress, InputAdornment,
  MenuItem, Select, FormControl,
} from '@mui/material';
import { Refresh, PictureAsPdf, Search as SearchIcon } from '@mui/icons-material';
import api from '@services/api';
import { getTodayDate } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatCurrency';
import { exportToPdf, type ExportColumn } from '@/utils/exportTable';
import { MultiSelectSearch } from '@/components/common';

interface Zona {
  id: number;
  zoneId?: number;
  name: string;
  zoneName?: string;
}

interface PrizesByBancaGameTypeDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  gameTypeId: number;
  gameTypeCode: string;
  gameTypeName: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface ColumnSpec {
  header: string;
  codes: string[];
}

// Side-by-side columns for the percentage report. Each entry becomes
// a "$, %" pair plus shows up in the spanning top header.
const COLUMNS: ColumnSpec[] = [
  { header: 'Directo', codes: ['DIRECTO'] },
  { header: 'Palé', codes: ['PALE'] },
  { header: 'Tripleta', codes: ['TRIPLETA'] },
  { header: 'Super Palé', codes: ['SUPER_PALE'] },
  { header: 'Pick2', codes: ['PICK2', 'PICK2_FRONT', 'PICK2_BACK', 'PICK2_MIDDLE'] },
  { header: 'Pick3 S', codes: ['CASH3_STRAIGHT', 'CASH3_FRONT_STRAIGHT', 'CASH3_BACK_STRAIGHT'] },
  { header: 'Pick3 B', codes: ['CASH3_BOX', 'CASH3_FRONT_BOX', 'CASH3_BACK_BOX'] },
  { header: 'Play4 S', codes: ['PLAY4_STRAIGHT'] },
  { header: 'Play4 B', codes: ['PLAY4_BOX'] },
  { header: 'Pick5 S', codes: ['PICK5_STRAIGHT'] },
  { header: 'Pick5 B', codes: ['PICK5_BOX'] },
  { header: 'Bolita', codes: ['BOLITA'] },
  { header: 'Singulación', codes: ['SINGULACION'] },
  { header: 'Panamá', codes: ['PANAMA'] },
];

interface BancaRow {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  totalVendido: number;
  // header → sold $ for that bucket
  byColumn: Record<string, number>;
}

const PlayTypePrizesPercentages = (): React.ReactElement => {
  const [fechaInicial, setFechaInicial] = useState<string>(getTodayDate());
  const [fechaFinal, setFechaFinal] = useState<string>(getTodayDate());
  const [zonas, setZonas] = useState<number[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [data, setData] = useState<PrizesByBancaGameTypeDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(0);

  // Sort by column key + order. Keys are 'name' | 'code' | 'total' | `amt:<header>` | `pct:<header>`.
  type SortOrder = 'asc' | 'desc';
  const [sortBy, setSortBy] = useState<string>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const onSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      // Default to descending for numbers, ascending for strings.
      setSortOrder(key === 'name' || key === 'code' ? 'asc' : 'desc');
    }
    setPage(0);
  };

  // Load zones.
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await api.get<{ items?: Zona[] } | Zona[]>('/zones');
        const arr = (response && typeof response === 'object' && 'items' in response)
          ? (response.items || [])
          : (response as Zona[] || []);
        const normalized = arr.map((z: Zona) => ({ id: z.zoneId || z.id, name: z.zoneName || z.name }));
        setZonasList(normalized);
        setZonas(normalized.map((z) => z.id));
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };
    loadZones();
  }, []);

  const handleSearch = useCallback(async () => {
    // One request for every code so all columns can render side-by-side.
    const codes = Array.from(new Set(COLUMNS.flatMap((c) => c.codes)));
    setLoading(true);
    try {
      const zoneIds = zonas.length > 0 && zonas.length < zonasList.length ? zonas.join(',') : '';
      const response = await api.get<PrizesByBancaGameTypeDto[]>(
        `/reports/sales/prizes-by-banca-game-type?startDate=${fechaInicial}&endDate=${fechaFinal}&gameTypeCodes=${codes.join(',')}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`,
      );
      setData(response || []);
      setPage(0);
    } catch (error) {
      console.error('Error loading percentages:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal, zonas, zonasList.length]);

  // Auto-load once zones are ready.
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (zonasList.length === 0 || initialLoadDone.current) return;
    initialLoadDone.current = true;
    handleSearch();
  }, [zonasList.length, handleSearch]);

  // Pivot the flat (banca, gameType) rows into one row per banca with one bucket per visible column.
  const pivoted = useMemo<BancaRow[]>(() => {
    const codeToHeader: Record<string, string> = {};
    COLUMNS.forEach((c) => c.codes.forEach((code) => { codeToHeader[code] = c.header; }));

    const byBanca = new Map<number, BancaRow>();
    for (const row of data) {
      const header = codeToHeader[row.gameTypeCode];
      if (!header) continue;
      let b = byBanca.get(row.bettingPoolId);
      if (!b) {
        b = {
          bettingPoolId: row.bettingPoolId,
          bettingPoolName: row.bettingPoolName,
          bettingPoolCode: row.bettingPoolCode,
          totalVendido: 0,
          byColumn: {},
        };
        byBanca.set(row.bettingPoolId, b);
      }
      b.totalVendido += row.totalSold;
      b.byColumn[header] = (b.byColumn[header] || 0) + row.totalSold;
    }
    return Array.from(byBanca.values()).sort((a, b) => a.bettingPoolCode.localeCompare(b.bettingPoolCode));
  }, [data]);

  // Hide columns that have zero in every banca — keeps the table compact.
  const visibleColumns = useMemo<ColumnSpec[]>(() => {
    return COLUMNS.filter((c) => pivoted.some((b) => (b.byColumn[c.header] || 0) > 0));
  }, [pivoted]);

  const filtered = useMemo<BancaRow[]>(() => {
    if (!filtroRapido) return pivoted;
    const term = filtroRapido.toLowerCase();
    return pivoted.filter((b) =>
      b.bettingPoolName.toLowerCase().includes(term) ||
      b.bettingPoolCode.toLowerCase().includes(term),
    );
  }, [pivoted, filtroRapido]);

  // Aggregates for the Totales row: sum across all (filtered) bancas per column.
  const totals = useMemo(() => {
    const byColumn: Record<string, number> = {};
    visibleColumns.forEach((c) => { byColumn[c.header] = 0; });
    let totalVendido = 0;
    for (const b of filtered) {
      totalVendido += b.totalVendido;
      for (const c of visibleColumns) {
        byColumn[c.header] += b.byColumn[c.header] || 0;
      }
    }
    return { totalVendido, byColumn };
  }, [filtered, visibleColumns]);

  // Sort filtered rows by the active key, then page.
  const sorted = useMemo(() => {
    const arr = filtered.slice();
    const dir = sortOrder === 'asc' ? 1 : -1;
    const getValue = (b: BancaRow): number | string => {
      if (sortBy === 'name') return b.bettingPoolName;
      if (sortBy === 'code') return b.bettingPoolCode;
      if (sortBy === 'total') return b.totalVendido;
      if (sortBy.startsWith('amt:')) return b.byColumn[sortBy.slice(4)] || 0;
      if (sortBy.startsWith('pct:')) {
        const amt = b.byColumn[sortBy.slice(4)] || 0;
        return b.totalVendido > 0 ? amt / b.totalVendido : 0;
      }
      return b.bettingPoolCode;
    };
    arr.sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return arr;
  }, [filtered, sortBy, sortOrder]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleExportPdf = useCallback(() => {
    if (filtered.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const columns: ExportColumn<Record<string, unknown>>[] = [
      { key: 'bettingPoolName', label: 'Banca', align: 'left' as const },
      { key: 'bettingPoolCode', label: 'Código', align: 'left' as const },
      { key: 'totalVendido', label: 'Total vendido', align: 'right' as const,
        getValue: (r) => formatCurrency(Number(r.totalVendido ?? 0)) },
      ...visibleColumns.flatMap((c): ExportColumn<Record<string, unknown>>[] => [
        { key: `${c.header}_amt`, label: `${c.header} $`, align: 'right' as const,
          getValue: (r) => formatCurrency(Number(r[`${c.header}_amt`] ?? 0)) },
        { key: `${c.header}_pct`, label: `${c.header} %`, align: 'right' as const,
          getValue: (r) => `${Number(r[`${c.header}_pct`] ?? 0).toFixed(2)}` },
      ]),
    ];

    const flatRows = filtered.map((b) => {
      const row: Record<string, unknown> = {
        bettingPoolName: b.bettingPoolName,
        bettingPoolCode: b.bettingPoolCode,
        totalVendido: b.totalVendido,
      };
      visibleColumns.forEach((c) => {
        const amt = b.byColumn[c.header] || 0;
        row[`${c.header}_amt`] = amt;
        row[`${c.header}_pct`] = b.totalVendido > 0 ? (amt / b.totalVendido) * 100 : 0;
      });
      return row;
    });

    const totalsRow: Record<string, unknown> = {
      bettingPoolName: 'Totales',
      bettingPoolCode: '',
      totalVendido: totals.totalVendido,
    };
    visibleColumns.forEach((c) => {
      totalsRow[`${c.header}_amt`] = totals.byColumn[c.header];
      totalsRow[`${c.header}_pct`] = '';
    });

    exportToPdf(flatRows, columns, `Reporte de porcentaje de jugadas — ${fechaInicial} al ${fechaFinal}`, totalsRow);
  }, [filtered, visibleColumns, totals, fechaInicial, fechaFinal]);

  const fmtPct = (amt: number, total: number) => (total > 0 ? `${((amt / total) * 100).toFixed(2)}` : '0');

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: 400 }}>
            Reporte de porcentaje de jugadas
          </Typography>

          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="date" label="Fecha inicial" value={fechaInicial}
                onChange={(e) => setFechaInicial(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="date" label="Fecha final" value={fechaFinal}
                onChange={(e) => setFechaFinal(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={4} sx={{ '& > div': { width: '100%' }, '& .MuiFormControl-root': { width: '100%' } }}>
              <MultiSelectSearch
                label="Zonas"
                selectAllLabel="Todas"
                options={zonasList.map((z) => ({ id: z.id, label: z.name }))}
                selectedIds={zonas}
                onChange={setZonas}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
              sx={{ px: 4, borderRadius: '30px', textTransform: 'uppercase' }}
            >
              Refrescar
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPdf}
              sx={{ borderRadius: '30px', textTransform: 'uppercase' }}
            >
              PDF
            </Button>
          </Stack>

          {visibleColumns.length === 0 ? (
            <Typography variant="body2" align="center" sx={{ color: 'text.secondary', py: 4 }}>
              {loading ? 'Cargando…' : 'No hay entradas para las fechas elegidas'}
            </Typography>
          ) : (
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Entradas por página</Typography>
                  <FormControl size="small">
                    <Select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} sx={{ height: 28, fontSize: '0.8rem' }}>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  size="small"
                  placeholder="Filtrado rápido"
                  value={filtroRapido}
                  onChange={(e) => { setFiltroRapido(e.target.value); setPage(0); }}
                  InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
                  sx={{ width: 280 }}
                />
              </Stack>

              <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    {/* Top header — each game-type column header spans its 2 cells ($, %). */}
                    <TableRow sx={{ backgroundColor: '#fafafa' }}>
                      <TableCell sx={{ fontWeight: 600 }} />
                      <TableCell sx={{ fontWeight: 600 }} />
                      <TableCell sx={{ fontWeight: 600 }} />
                      {visibleColumns.map((c) => (
                        <TableCell
                          key={c.header}
                          colSpan={2}
                          align="center"
                          sx={{ fontWeight: 700, borderLeft: '1px solid #e0e0e0' }}
                        >
                          {c.header}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow sx={{ backgroundColor: '#e3e3e3' }}>
                      <TableCell sx={{ fontWeight: 600 }} sortDirection={sortBy === 'name' ? sortOrder : false}>
                        <TableSortLabel active={sortBy === 'name'} direction={sortBy === 'name' ? sortOrder : 'asc'} onClick={() => onSort('name')}>
                          Banca
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} sortDirection={sortBy === 'code' ? sortOrder : false}>
                        <TableSortLabel active={sortBy === 'code'} direction={sortBy === 'code' ? sortOrder : 'asc'} onClick={() => onSort('code')}>
                          Código
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={sortBy === 'total' ? sortOrder : false}>
                        <TableSortLabel active={sortBy === 'total'} direction={sortBy === 'total' ? sortOrder : 'asc'} onClick={() => onSort('total')}>
                          Total vendido
                        </TableSortLabel>
                      </TableCell>
                      {visibleColumns.map((c) => (
                        [
                          <TableCell
                            key={`${c.header}-amt`}
                            align="right"
                            sx={{ fontWeight: 600, borderLeft: '1px solid #e0e0e0' }}
                            sortDirection={sortBy === `amt:${c.header}` ? sortOrder : false}
                          >
                            <TableSortLabel
                              active={sortBy === `amt:${c.header}`}
                              direction={sortBy === `amt:${c.header}` ? sortOrder : 'asc'}
                              onClick={() => onSort(`amt:${c.header}`)}
                            >
                              $
                            </TableSortLabel>
                          </TableCell>,
                          <TableCell
                            key={`${c.header}-pct`}
                            align="right"
                            sx={{ fontWeight: 600 }}
                            sortDirection={sortBy === `pct:${c.header}` ? sortOrder : false}
                          >
                            <TableSortLabel
                              active={sortBy === `pct:${c.header}`}
                              direction={sortBy === `pct:${c.header}` ? sortOrder : 'asc'}
                              onClick={() => onSort(`pct:${c.header}`)}
                            >
                              %
                            </TableSortLabel>
                          </TableCell>,
                        ]
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((b) => (
                      <TableRow key={b.bettingPoolId} hover>
                        <TableCell>{b.bettingPoolName}</TableCell>
                        <TableCell>{b.bettingPoolCode}</TableCell>
                        <TableCell align="right">{formatCurrency(b.totalVendido)}</TableCell>
                        {visibleColumns.map((c) => {
                          const amt = b.byColumn[c.header] || 0;
                          return [
                            <TableCell key={`${c.header}-amt`} align="right" sx={{ borderLeft: '1px solid #e0e0e0' }}>{formatCurrency(amt)}</TableCell>,
                            <TableCell key={`${c.header}-pct`} align="right">{fmtPct(amt, b.totalVendido)}</TableCell>,
                          ];
                        })}
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                      <TableCell>Totales</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell align="right">{formatCurrency(totals.totalVendido)}</TableCell>
                      {visibleColumns.map((c) => {
                        const amt = totals.byColumn[c.header] || 0;
                        return [
                          <TableCell key={`${c.header}-amt`} align="right" sx={{ borderLeft: '1px solid #e0e0e0' }}>{formatCurrency(amt)}</TableCell>,
                          <TableCell key={`${c.header}-pct`} align="right">-</TableCell>,
                        ];
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Mostrando {paged.length} de {filtered.length} bancas
                </Typography>
                {filtered.length > pageSize && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button size="small" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Anterior</Button>
                    <Typography variant="caption">Página {page + 1} / {Math.max(1, Math.ceil(filtered.length / pageSize))}</Typography>
                    <Button size="small" disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
                  </Stack>
                )}
              </Stack>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default PlayTypePrizesPercentages;
