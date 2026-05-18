import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Grid, Button, Stack, Tabs, Tab,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TableSortLabel,
  CircularProgress, InputAdornment, MenuItem, Select, FormControl,
} from '@mui/material';
import { Refresh, Search as SearchIcon } from '@mui/icons-material';
import api from '@services/api';
import { getTodayDate } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatCurrency';
import { exportToCsv, type ExportColumn } from '@/utils/exportTable';
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

interface GameTypeGroup {
  /** Header displayed above the four-cell block. */
  header: string;
  /** Game-type codes the backend should aggregate together for this block. */
  codes: string[];
}

interface TabSpec {
  label: string;
  groups: GameTypeGroup[];
}

// Each tab defines one or two side-by-side game-type blocks.
const TABS: TabSpec[] = [
  {
    label: 'Directo y Palé',
    groups: [
      { header: 'Directo', codes: ['DIRECTO'] },
      { header: 'Palé', codes: ['PALE'] },
    ],
  },
  {
    label: 'Tripleta y Super Palé',
    groups: [
      { header: 'Tripleta', codes: ['TRIPLETA'] },
      { header: 'Super Palé', codes: ['SUPER_PALE'] },
    ],
  },
  {
    label: 'Pick2',
    groups: [
      { header: 'Pick2', codes: ['PICK2', 'PICK2_FRONT', 'PICK2_BACK', 'PICK2_MIDDLE'] },
    ],
  },
  {
    label: 'Pick3',
    groups: [
      { header: 'Straight', codes: ['CASH3_STRAIGHT', 'CASH3_FRONT_STRAIGHT', 'CASH3_BACK_STRAIGHT'] },
      { header: 'Box', codes: ['CASH3_BOX', 'CASH3_FRONT_BOX', 'CASH3_BACK_BOX'] },
    ],
  },
  {
    label: 'Play4',
    groups: [
      { header: 'Straight', codes: ['PLAY4_STRAIGHT'] },
      { header: 'Box', codes: ['PLAY4_BOX'] },
    ],
  },
  {
    label: 'Pick5',
    groups: [
      { header: 'Straight', codes: ['PICK5_STRAIGHT'] },
      { header: 'Box', codes: ['PICK5_BOX'] },
    ],
  },
  {
    label: 'Bolita y Singulación',
    groups: [
      { header: 'Bolita', codes: ['BOLITA'] },
      { header: 'Singulación', codes: ['SINGULACION'] },
    ],
  },
  {
    label: 'Panamá',
    groups: [
      { header: 'Panamá', codes: ['PANAMA'] },
    ],
  },
];

interface AggCell {
  sold: number;
  prizes: number;
  commissions: number;
  net: number;
}

interface BancaRow {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  // groupKey (header) → aggregated cell
  byGroup: Record<string, AggCell>;
}

const EMPTY_CELL: AggCell = { sold: 0, prizes: 0, commissions: 0, net: 0 };

const PlayTypePrizes = (): React.ReactElement => {
  const [tab, setTab] = useState<number>(0);
  const [fechaInicial, setFechaInicial] = useState<string>(getTodayDate());
  const [fechaFinal, setFechaFinal] = useState<string>(getTodayDate());
  const [zonas, setZonas] = useState<number[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [data, setData] = useState<PrizesByBancaGameTypeDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(0);

  // Load zones once.
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const zonesResponse = await api.get<{ items?: Zona[] } | Zona[]>('/zones');
        const zonesArray = (zonesResponse && typeof zonesResponse === 'object' && 'items' in zonesResponse)
          ? (zonesResponse.items || [])
          : (zonesResponse as Zona[] || []);
        const normalized = zonesArray.map((z: Zona) => ({
          id: z.zoneId || z.id,
          name: z.zoneName || z.name,
        }));
        setZonasList(normalized);
        setZonas(normalized.map((z) => z.id));
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  }, []);

  // Fetch every code across every tab in one request so we can hide tabs with no data.
  const handleSearch = useCallback(async () => {
    const codes = Array.from(new Set(TABS.flatMap((t) => t.groups.flatMap((g) => g.codes))));
    setLoading(true);
    try {
      const zoneIds = zonas.length > 0 && zonas.length < zonasList.length ? zonas.join(',') : '';
      const response = await api.get<PrizesByBancaGameTypeDto[]>(
        `/reports/sales/prizes-by-banca-game-type?startDate=${fechaInicial}&endDate=${fechaFinal}&gameTypeCodes=${codes.join(',')}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`,
      );
      setData(response || []);
      setPage(0);
    } catch (error) {
      console.error('Error loading prizes by banca/game type:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal, zonas, zonasList.length]);

  // Auto-load once zones are ready. Switching tabs is local — no re-fetch.
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (zonasList.length === 0 || initialLoadDone.current) return;
    initialLoadDone.current = true;
    handleSearch();
  }, [zonasList.length, handleSearch]);

  // Tabs that have at least one row across any of their codes — hide the rest.
  const presentCodes = useMemo(() => new Set(data.map((d) => d.gameTypeCode)), [data]);
  const visibleTabs = useMemo(
    () => TABS.filter((t) => t.groups.some((g) => g.codes.some((c) => presentCodes.has(c)))),
    [presentCodes],
  );

  // Clamp the selected tab when the visible list shrinks.
  useEffect(() => {
    if (visibleTabs.length === 0) return;
    if (tab >= visibleTabs.length) setTab(0);
  }, [visibleTabs, tab]);

  const currentTab = visibleTabs[tab] || TABS[0];

  // Pivot the flat (banca, gameType) rows into one row per banca with columns per group.
  const pivoted = useMemo<BancaRow[]>(() => {
    const byBanca = new Map<number, BancaRow>();
    // Build a fast lookup: gameTypeCode → group header.
    const codeToHeader: Record<string, string> = {};
    currentTab.groups.forEach((g) => {
      g.codes.forEach((c) => { codeToHeader[c] = g.header; });
    });

    for (const row of data) {
      const header = codeToHeader[row.gameTypeCode];
      if (!header) continue;

      let banca = byBanca.get(row.bettingPoolId);
      if (!banca) {
        banca = {
          bettingPoolId: row.bettingPoolId,
          bettingPoolName: row.bettingPoolName,
          bettingPoolCode: row.bettingPoolCode,
          byGroup: {},
        };
        byBanca.set(row.bettingPoolId, banca);
      }
      const cell = banca.byGroup[header] || { ...EMPTY_CELL };
      cell.sold += row.totalSold;
      cell.prizes += row.totalPrizes;
      cell.commissions += row.totalCommissions;
      cell.net += row.totalNet;
      banca.byGroup[header] = cell;
    }
    return Array.from(byBanca.values()).sort((a, b) =>
      a.bettingPoolCode.localeCompare(b.bettingPoolCode),
    );
  }, [data, currentTab]);

  const filtered = useMemo<BancaRow[]>(() => {
    if (!filtroRapido) return pivoted;
    const term = filtroRapido.toLowerCase();
    return pivoted.filter((b) =>
      b.bettingPoolName.toLowerCase().includes(term) ||
      b.bettingPoolCode.toLowerCase().includes(term),
    );
  }, [pivoted, filtroRapido]);

  // Sort the filtered rows. Header keys: 'name' | 'code' | `<group>:<field>`.
  type SortOrder = 'asc' | 'desc';
  const [sortBy, setSortBy] = useState<string>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const onSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder(key === 'name' || key === 'code' ? 'asc' : 'desc');
    }
    setPage(0);
  };
  const sorted = useMemo<BancaRow[]>(() => {
    const arr = filtered.slice();
    const dir = sortOrder === 'asc' ? 1 : -1;
    const getValue = (b: BancaRow): number | string => {
      if (sortBy === 'name') return b.bettingPoolName;
      if (sortBy === 'code') return b.bettingPoolCode;
      // group field key e.g. "Directo:sold"
      const [header, field] = sortBy.split(':');
      const cell = b.byGroup[header] || EMPTY_CELL;
      return (cell as unknown as Record<string, number>)[field] ?? 0;
    };
    arr.sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return arr;
  }, [filtered, sortBy, sortOrder]);
  const sortProps = (key: string) => ({
    active: sortBy === key,
    direction: sortBy === key ? sortOrder : ('asc' as SortOrder),
    onClick: () => onSort(key),
  });

  const totals = useMemo(() => {
    const out: Record<string, AggCell> = {};
    currentTab.groups.forEach((g) => { out[g.header] = { ...EMPTY_CELL }; });
    for (const b of filtered) {
      for (const h of Object.keys(out)) {
        const cell = b.byGroup[h];
        if (!cell) continue;
        out[h].sold += cell.sold;
        out[h].prizes += cell.prizes;
        out[h].commissions += cell.commissions;
        out[h].net += cell.net;
      }
    }
    return out;
  }, [filtered, currentTab]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleExportCsv = useCallback(() => {
    if (filtered.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const groupHeaders = currentTab.groups.map((g) => g.header);
    const columns: ExportColumn<Record<string, unknown>>[] = [
      { key: 'bettingPoolName', label: 'Banca', align: 'left' as const },
      { key: 'bettingPoolCode', label: 'Código', align: 'left' as const },
      ...groupHeaders.flatMap((h): ExportColumn<Record<string, unknown>>[] => [
        { key: `${h}_sold`, label: `${h} Jugado`, align: 'right' as const, getValue: (r) => formatCurrency(Number(r[`${h}_sold`] ?? 0)) },
        { key: `${h}_prizes`, label: `${h} Premios`, align: 'right' as const, getValue: (r) => formatCurrency(Number(r[`${h}_prizes`] ?? 0)) },
        { key: `${h}_commissions`, label: `${h} Comisiones`, align: 'right' as const, getValue: (r) => formatCurrency(Number(r[`${h}_commissions`] ?? 0)) },
        { key: `${h}_net`, label: `${h} Neto`, align: 'right' as const, getValue: (r) => formatCurrency(Number(r[`${h}_net`] ?? 0)) },
      ]),
    ];

    const flatRows = filtered.map((b) => {
      const row: Record<string, unknown> = {
        bettingPoolName: b.bettingPoolName,
        bettingPoolCode: b.bettingPoolCode,
      };
      groupHeaders.forEach((h) => {
        const c = b.byGroup[h] || EMPTY_CELL;
        row[`${h}_sold`] = c.sold;
        row[`${h}_prizes`] = c.prizes;
        row[`${h}_commissions`] = c.commissions;
        row[`${h}_net`] = c.net;
      });
      return row;
    });

    const totalsRow: Record<string, unknown> = { bettingPoolName: 'Totales', bettingPoolCode: '' };
    groupHeaders.forEach((h) => {
      const c = totals[h] || EMPTY_CELL;
      totalsRow[`${h}_sold`] = c.sold;
      totalsRow[`${h}_prizes`] = c.prizes;
      totalsRow[`${h}_commissions`] = c.commissions;
      totalsRow[`${h}_net`] = c.net;
    });

    exportToCsv(flatRows, columns, `premios-tipo-jugada-${fechaInicial}_${fechaFinal}-${currentTab.label}`, totalsRow);
  }, [filtered, totals, currentTab, fechaInicial, fechaFinal]);

  const netColor = (n: number) => (n > 0 ? '#1976d2' : n < 0 ? '#c62828' : 'inherit');
  const netBg = (n: number) => (n > 0 ? '#e3f2fd' : n < 0 ? '#fdecea' : 'transparent');

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: 400 }}>
            Premios por tipo de jugada
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
              onClick={handleExportCsv}
              sx={{ borderRadius: '30px', textTransform: 'uppercase' }}
            >
              CSV
            </Button>
          </Stack>

          {visibleTabs.length > 0 && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                {visibleTabs.map((t) => <Tab key={t.label} label={t.label} />)}
              </Tabs>
            </Box>
          )}

          {visibleTabs.length === 0 ? (
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

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                {/* Top header: spans each group's 4 cells. */}
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600 }} />
                  <TableCell sx={{ fontWeight: 600 }} />
                  {currentTab.groups.map((g) => (
                    <TableCell
                      key={g.header}
                      colSpan={4}
                      align="center"
                      sx={{ fontWeight: 700, borderLeft: '1px solid #e0e0e0' }}
                    >
                      {g.header}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow sx={{ backgroundColor: '#e3e3e3' }}>
                  <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...sortProps('name')}>Banca</TableSortLabel></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...sortProps('code')}>Código</TableSortLabel></TableCell>
                  {currentTab.groups.map((g) => (
                    [
                      <TableCell key={`${g.header}-jug`} align="right" sx={{ fontWeight: 600, borderLeft: '1px solid #e0e0e0' }}>
                        <TableSortLabel {...sortProps(`${g.header}:sold`)}>Jugado</TableSortLabel>
                      </TableCell>,
                      <TableCell key={`${g.header}-pr`} align="right" sx={{ fontWeight: 600 }}>
                        <TableSortLabel {...sortProps(`${g.header}:prizes`)}>Premios</TableSortLabel>
                      </TableCell>,
                      <TableCell key={`${g.header}-co`} align="right" sx={{ fontWeight: 600 }}>
                        <TableSortLabel {...sortProps(`${g.header}:commissions`)}>Comisiones</TableSortLabel>
                      </TableCell>,
                      <TableCell key={`${g.header}-ne`} align="right" sx={{ fontWeight: 600 }}>
                        <TableSortLabel {...sortProps(`${g.header}:net`)}>Neto</TableSortLabel>
                      </TableCell>,
                    ]
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2 + currentTab.groups.length * 4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      {loading ? 'Cargando…' : 'No hay entradas para el sorteo y la fecha elegidos'}
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {paged.map((b) => (
                      <TableRow key={b.bettingPoolId} hover>
                        <TableCell>{b.bettingPoolName}</TableCell>
                        <TableCell>{b.bettingPoolCode}</TableCell>
                        {currentTab.groups.map((g) => {
                          const c = b.byGroup[g.header] || EMPTY_CELL;
                          return [
                            <TableCell key={`${g.header}-jug`} align="right" sx={{ borderLeft: '1px solid #e0e0e0' }}>{formatCurrency(c.sold)}</TableCell>,
                            <TableCell key={`${g.header}-pr`} align="right">{formatCurrency(c.prizes)}</TableCell>,
                            <TableCell key={`${g.header}-co`} align="right">{formatCurrency(c.commissions)}</TableCell>,
                            <TableCell key={`${g.header}-ne`} align="right" sx={{ color: netColor(c.net), backgroundColor: netBg(c.net), fontWeight: 600 }}>{formatCurrency(c.net)}</TableCell>,
                          ];
                        })}
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                      <TableCell>Totales</TableCell>
                      <TableCell />
                      {currentTab.groups.map((g) => {
                        const c = totals[g.header] || EMPTY_CELL;
                        return [
                          <TableCell key={`${g.header}-jug`} align="right" sx={{ borderLeft: '1px solid #e0e0e0' }}>{formatCurrency(c.sold)}</TableCell>,
                          <TableCell key={`${g.header}-pr`} align="right">{formatCurrency(c.prizes)}</TableCell>,
                          <TableCell key={`${g.header}-co`} align="right">{formatCurrency(c.commissions)}</TableCell>,
                          <TableCell key={`${g.header}-ne`} align="right" sx={{ color: netColor(c.net) }}>{formatCurrency(c.net)}</TableCell>,
                        ];
                      })}
                    </TableRow>
                  </>
                )}
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

export default PlayTypePrizes;
