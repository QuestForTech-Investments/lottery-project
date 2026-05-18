import { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Autocomplete, Button, Grid, Stack, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TableSortLabel, Chip, Divider,
} from '@mui/material';
import {
  Refresh,
  AttachMoney,
  EmojiEvents,
  Receipt,
  TrendingUp,
  TrendingDown,
  Storefront,
  AccountBalance,
  Discount,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import api from '@services/api';
import { getTodayDate } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTableSort } from '@/utils/useTableSort';

// ---------------------------------------------------------------------------
// API shapes
// ---------------------------------------------------------------------------
interface ZonaRaw {
  id?: number;
  zoneId?: number;
  name?: string;
  zoneName?: string;
}

interface ZonaOption {
  id: number;
  name: string;
}

interface ZoneSalesDto {
  zoneId: number;
  zoneName: string;
  bettingPoolCount: number;
  ticketCount: number;
  lineCount: number;
  pendingCount: number;
  loserCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalDiscounts: number;
  totalNet: number;
  fall: number;
  final: number;
  balance: number;
}

interface DrawSalesDto {
  drawId: number;
  drawName: string;
  lotteryName?: string;
  lotteryImageUrl?: string | null;
  ticketCount: number;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface BancaSalesDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
  pendingCount: number;
  loserCount: number;
  winnerCount: number;
  fall: number;
  balance: number;
}

// ---------------------------------------------------------------------------
// Theme helpers
// ---------------------------------------------------------------------------
const PALETTE = {
  venta: '#1976d2',
  comisiones: '#0288d1',
  descuentos: '#7b1fa2',
  premios: '#ed6c02',
  neto: '#2e7d32',
  netoNeg: '#c62828',
};
const colorForNet = (n: number) => (n > 0 ? '#2e7d32' : n < 0 ? '#c62828' : '#1565c0');

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="h6" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 500 }}>
    {children}
  </Typography>
);

interface KpiTileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}
const KpiTile = ({ label, value, icon, accent }: KpiTileProps) => (
  <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${accent}`, height: '100%' }}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: `${accent}1a`, color: accent,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1 }}>{label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{value}</Typography>
      </Box>
    </Stack>
  </Paper>
);

// ---------------------------------------------------------------------------
// Inner tables
// ---------------------------------------------------------------------------
const DrawTotalsTable = ({ rows }: { rows: DrawSalesDto[] }) => {
  const { sortedData, getSortProps } = useTableSort<DrawSalesDto, string>(
    rows,
    (r, k) => (r as unknown as Record<string, string | number>)[k],
    { sortBy: 'drawName', sortOrder: 'asc' },
  );
  if (rows.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>Sin ventas en la fecha seleccionada.</Typography>;
  }
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('drawName')}>Sorteo</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('ticketCount')}>Tickets</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('lineCount')}>Líneas</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('winnerCount')}>Ganadores</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalSold')}>Venta</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalCommissions')}>Comisiones</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalPrizes')}>Premios</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalNet')}>Neto</TableSortLabel></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((d) => (
            <TableRow key={d.drawId} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {d.lotteryImageUrl && (
                    <Box
                      component="img"
                      src={d.lotteryImageUrl}
                      alt={d.drawName}
                      sx={{ width: 22, height: 22, borderRadius: '4px', objectFit: 'cover' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <span>{d.drawName}</span>
                </Box>
              </TableCell>
              <TableCell align="center">{d.ticketCount}</TableCell>
              <TableCell align="center">{d.lineCount}</TableCell>
              <TableCell align="center">{d.winnerCount}</TableCell>
              <TableCell align="right">{formatCurrency(d.totalSold)}</TableCell>
              <TableCell align="right">{formatCurrency(d.totalCommissions)}</TableCell>
              <TableCell align="right">{formatCurrency(d.totalPrizes)}</TableCell>
              <TableCell align="right" sx={{ color: colorForNet(d.totalNet), fontWeight: 600 }}>{formatCurrency(d.totalNet)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const BancasTable = ({ rows }: { rows: BancaSalesDto[] }) => {
  const { sortedData, getSortProps } = useTableSort<BancaSalesDto, string>(
    rows,
    (r, k) => (r as unknown as Record<string, string | number>)[k],
    { sortBy: 'bettingPoolCode', sortOrder: 'asc' },
  );
  if (rows.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>Sin bancas con ventas en la zona.</Typography>;
  }
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 460 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#e3e3e3', '& th': { backgroundColor: '#e3e3e3' } }}>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('bettingPoolCode')}>Código</TableSortLabel></TableCell>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('bettingPoolName')}>Banca</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('pendingCount')}>P</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('loserCount')}>L</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('winnerCount')}>W</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalSold')}>Venta</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalCommissions')}>Comisiones</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalPrizes')}>Premios</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalNet')}>Neto</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('balance')}>Balance</TableSortLabel></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((b) => (
            <TableRow key={b.bettingPoolId} hover>
              <TableCell sx={{ fontFamily: 'monospace' }}>{b.bettingPoolCode}</TableCell>
              <TableCell>{b.bettingPoolName}</TableCell>
              <TableCell align="center">{b.pendingCount}</TableCell>
              <TableCell align="center">{b.loserCount}</TableCell>
              <TableCell align="center">{b.winnerCount}</TableCell>
              <TableCell align="right">{formatCurrency(b.totalSold)}</TableCell>
              <TableCell align="right">{formatCurrency(b.totalCommissions)}</TableCell>
              <TableCell align="right">{formatCurrency(b.totalPrizes)}</TableCell>
              <TableCell align="right" sx={{ color: colorForNet(b.totalNet), fontWeight: 600 }}>{formatCurrency(b.totalNet)}</TableCell>
              <TableCell align="right" sx={{ color: colorForNet(b.balance), fontWeight: 600 }}>{formatCurrency(b.balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const ZoneSales = (): React.ReactElement => {
  const [fecha, setFecha] = useState<string>(getTodayDate());
  const [zona, setZona] = useState<ZonaOption | null>(null);
  const [zonasList, setZonasList] = useState<ZonaOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [summary, setSummary] = useState<ZoneSalesDto | null>(null);
  const [draws, setDraws] = useState<DrawSalesDto[]>([]);
  const [bancas, setBancas] = useState<BancaSalesDto[]>([]);

  // Load zones once.
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await api.get<{ items?: ZonaRaw[] } | ZonaRaw[]>('/zones');
        const arr = (response && typeof response === 'object' && 'items' in response)
          ? (response.items || [])
          : (response as ZonaRaw[] || []);
        const normalized: ZonaOption[] = arr.map((z) => ({
          id: z.zoneId || z.id || 0,
          name: z.zoneName || z.name || '',
        }));
        setZonasList(normalized);
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };
    loadZones();
  }, []);

  const loadReport = useCallback(async () => {
    if (!zona) return;
    setLoading(true);
    try {
      const zId = zona.id;
      const [zoneArr, drawsResp, bancasArr] = await Promise.all([
        api.get<{ zones: ZoneSalesDto[] } | ZoneSalesDto[]>(`/reports/sales/by-zone?startDate=${fecha}&endDate=${fecha}&zoneIds=${zId}`),
        api.get<{ draws: DrawSalesDto[] }>(`/reports/sales/by-draw?startDate=${fecha}&endDate=${fecha}&zoneIds=${zId}`),
        api.get<BancaSalesDto[]>(`/reports/sales/by-betting-pool?startDate=${fecha}&endDate=${fecha}&zoneIds=${zId}`),
      ]);
      // by-zone returns { zones: [...] }; older callers may have gotten a bare array — handle both shapes.
      const zoneRows = Array.isArray(zoneArr)
        ? zoneArr as ZoneSalesDto[]
        : (zoneArr as { zones: ZoneSalesDto[] }).zones || [];
      setSummary(zoneRows[0] || null);
      setDraws(drawsResp?.draws || []);
      setBancas(bancasArr || []);
    } catch (error) {
      console.error('Error loading zone report:', error);
    } finally {
      setLoading(false);
    }
  }, [zona, fecha]);

  // Auto-load when date or zone changes.
  useEffect(() => {
    if (zona) loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zona?.id, fecha]);

  const totalTickets = summary ? summary.pendingCount + summary.loserCount + summary.winnerCount : 0;

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 400 }}>
            Reporte por zona
          </Typography>

          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Fecha" value={fecha}
                onChange={(e) => setFecha(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={zonasList}
                getOptionLabel={(o) => o.name}
                value={zona}
                onChange={(_e, v) => setZona(v)}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => <TextField {...params} label="Zona" size="small" placeholder="Seleccione una zona" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={loadReport}
                disabled={loading || !zona}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Refresh />}
                sx={{ borderRadius: '30px', textTransform: 'uppercase' }}
              >
                Refrescar
              </Button>
            </Grid>
          </Grid>

          {!zona && (
            <Typography variant="body2" align="center" sx={{ color: 'text.secondary', py: 4 }}>
              Seleccione una zona para ver el reporte.
            </Typography>
          )}

          {zona && (
            <Stack spacing={4}>
              {/* Resumen de venta */}
              <Box>
                <SectionTitle>Resumen de venta</SectionTitle>
                {summary ? (
                  <>
                    {/* Highlight banner: balance + bancas + tickets */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{
                          p: 2,
                          borderLeft: `4px solid ${summary.balance >= 0 ? PALETTE.neto : PALETTE.netoNeg}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Balance a la fecha</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: colorForNet(summary.balance) }}>
                              {formatCurrency(summary.balance)}
                            </Typography>
                          </Box>
                          {summary.balance >= 0
                            ? <TrendingUp sx={{ fontSize: 36, color: PALETTE.neto }} />
                            : <TrendingDown sx={{ fontSize: 36, color: PALETTE.netoNeg }} />}
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Paper variant="outlined" sx={{
                          p: 2,
                          borderLeft: `4px solid ${PALETTE.venta}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Bancas activas</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: PALETTE.venta }}>{summary.bettingPoolCount}</Typography>
                          </Box>
                          <Storefront sx={{ fontSize: 36, color: PALETTE.venta }} />
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Paper variant="outlined" sx={{
                          p: 2,
                          borderLeft: `4px solid #455a64`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Tickets</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>{summary.ticketCount}</Typography>
                          </Box>
                          <Receipt sx={{ fontSize: 36, color: '#455a64' }} />
                        </Paper>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={7}>
                        {/* Zone header + P/L/W chips */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Zona</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>{summary.zoneName}</Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Chip label={`P ${summary.pendingCount}`} sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
                              <Chip label={`L ${summary.loserCount}`} sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }} />
                              <Chip label={`W ${summary.winnerCount}`} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                              <Chip label={`Total ${totalTickets}`} sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} />
                            </Stack>
                          </Stack>
                        </Paper>

                        {/* KPIs */}
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={4}>
                            <KpiTile label="Venta" value={formatCurrency(summary.totalSold)} icon={<AttachMoney fontSize="small" />} accent={PALETTE.venta} />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile label="Comisiones" value={formatCurrency(summary.totalCommissions)} icon={<AccountBalance fontSize="small" />} accent={PALETTE.comisiones} />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile label="Premios" value={formatCurrency(summary.totalPrizes)} icon={<EmojiEvents fontSize="small" />} accent={PALETTE.premios} />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile
                              label="Neto"
                              value={formatCurrency(summary.totalNet)}
                              icon={summary.totalNet >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                              accent={summary.totalNet >= 0 ? PALETTE.neto : PALETTE.netoNeg}
                            />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile label="Caída" value={formatCurrency(summary.fall)} icon={<Discount fontSize="small" />} accent="#9e9e9e" />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile
                              label="Final"
                              value={formatCurrency(summary.final)}
                              icon={summary.final >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                              accent={summary.final >= 0 ? PALETTE.neto : PALETTE.netoNeg}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Composición de la venta</Typography>
                          <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Comisiones', value: summary.totalCommissions, fill: PALETTE.comisiones },
                                  { name: 'Premios', value: summary.totalPrizes, fill: PALETTE.premios },
                                  { name: 'Neto', value: Math.max(0, summary.totalNet), fill: PALETTE.neto },
                                ].filter((d) => d.value > 0)}
                                dataKey="value"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={2}
                              >
                                {[PALETTE.comisiones, PALETTE.premios, PALETTE.neto].map((c, i) => (
                                  <Cell key={i} fill={c} />
                                ))}
                              </Pie>
                              <Tooltip formatter={((v: number) => formatCurrency(v)) as unknown as undefined} />
                              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Sin ventas en la fecha seleccionada.</Typography>
                )}
              </Box>

              <Divider />

              {/* Totales por sorteo */}
              <Box>
                <SectionTitle>Totales por sorteo</SectionTitle>
                {draws.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={draws.map((d) => ({ name: d.drawName, Venta: d.totalSold, Premios: d.totalPrizes, Neto: d.totalNet }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                        <Tooltip formatter={((v: number) => formatCurrency(v)) as unknown as undefined} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        <Bar dataKey="Venta" fill={PALETTE.venta} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Premios" fill={PALETTE.premios} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Neto" fill={PALETTE.neto} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                )}
                <DrawTotalsTable rows={draws} />
              </Box>

              <Divider />

              {/* Bancas in this zone */}
              <Box>
                <SectionTitle>Bancas de la zona</SectionTitle>
                <BancasTable rows={bancas} />
              </Box>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ZoneSales;
