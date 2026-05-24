import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Paper, Typography, TextField, Autocomplete, Button, Grid, Stack, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TableSortLabel, Divider,
  Chip,
} from '@mui/material';
import {
  Refresh,
  AttachMoney,
  EmojiEvents,
  Receipt,
  TrendingUp,
  TrendingDown,
  Discount,
  AccountBalance,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import api from '@services/api';
import { getTodayDate , getActiveLocale } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTableSort } from '@/utils/useTableSort';

// ---------------------------------------------------------------------------
// API shapes
// ---------------------------------------------------------------------------
interface Banca {
  id: number;
  bettingPoolId?: number;
  bettingPoolName?: string;
  bettingPoolCode?: string;
  name?: string;
  code?: string;
}

interface BancaOption {
  id: number;
  code: string;
  name: string;
}

interface BettingPoolSalesDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalDiscounts: number;
  totalNet: number;
  pendingCount: number;
  loserCount: number;
  winnerCount: number;
  fall: number;
  accumulatedFall: number;
  balance: number;
  balanceOfTheDay: number;
  pendingTicketsAmount: number;
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

interface DrawSalesResponse {
  draws: DrawSalesDto[];
}

interface ResultDto {
  resultId: number;
  drawId: number;
  drawName: string;
  winningNumber: string;
  additionalNumber?: string | null;
  num1: string;
  num2: string;
  num3: string;
  cash3?: string;
  play4?: string;
  pick5?: string;
}

interface WinningPlayDto {
  lineId: number;
  ticketId: number;
  ticketCode: string;
  betTypeName: string;
  betNumber: string;
  salesAmount: number;
  prizeAmount: number;
  drawId: number;
  drawName: string;
  drawDate: string;
  winningPosition?: number | null;
  resultNumber?: string | null;
  isPaid: boolean;
}

interface WinningPlaysResponse {
  items: WinningPlayDto[];
}

interface TransactionLineReportDto {
  lineId: number;
  groupId: number;
  groupNumber: string;
  transactionType: string;
  createdAt: string;
  createdByName?: string | null;
  entity1Name: string;
  entity1Code?: string | null;
  entity2Name: string;
  entity2Code?: string | null;
  entity1InitialBalance: number;
  entity2InitialBalance: number;
  debit: number;
  credit: number;
  entity1FinalBalance: number;
  entity2FinalBalance: number;
  notes?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const colorForNet = (n: number) => (n > 0 ? '#2e7d32' : n < 0 ? '#c62828' : '#1565c0');

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="h6" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 500 }}>
    {children}
  </Typography>
);

// Accent palette used by the KPI tiles and the charts.
const PALETTE = {
  venta: '#1976d2',
  comisiones: '#0288d1',
  descuentos: '#7b1fa2',
  premios: '#ed6c02',
  neto: '#2e7d32',
  netoNeg: '#c62828',
};

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
// Per-section tables (each has its own sort)
// ---------------------------------------------------------------------------
const DrawTotalsTable = ({ rows }: { rows: DrawSalesDto[] }) => {
  const { t } = useTranslation();
  const { sortedData, getSortProps } = useTableSort<DrawSalesDto, string>(
    rows,
    (r, k) => (r as unknown as Record<string, string | number>)[k],
    { sortBy: 'drawName', sortOrder: 'asc' },
  );
  if (rows.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t('sales.noSalesOnDate')}</Typography>;
  }
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 700 }}>
        <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('drawName')}>{t('common.draw')}</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('ticketCount')}>{t('common.tickets')}</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('lineCount')}>{t('sales.lineas')}</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('winnerCount')}>{t('sales.winners')}</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalSold')}>{t('sales.venta')}</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalCommissions')}>{t('sales.comisiones')}</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalPrizes')}>{t('sales.premios')}</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('totalNet')}>{t('sales.neto')}</TableSortLabel></TableCell>
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

const WinningPlaysTable = ({ rows }: { rows: WinningPlayDto[] }) => {
  const { t } = useTranslation();
  const { sortedData, getSortProps } = useTableSort<WinningPlayDto, string>(
    rows,
    (r, k) => (r as unknown as Record<string, string | number>)[k],
    { sortBy: 'drawName', sortOrder: 'asc' },
  );
  if (rows.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t('sales.noWinningTicketsOnDate')}</Typography>;
  }
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420, overflowX: 'auto' }}>
      <Table size="small" stickyHeader sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#e3e3e3', '& th': { backgroundColor: '#e3e3e3' } }}>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('ticketCode')}>{t('common.ticket')}</TableSortLabel></TableCell>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('drawName')}>{t('common.draw')}</TableSortLabel></TableCell>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('betTypeName')}>{t('common.type')}</TableSortLabel></TableCell>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('betNumber')}>{t('common.number')}</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('salesAmount')}>{t('sales.bet')}</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('prizeAmount')}>{t('common.prize')}</TableSortLabel></TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>{t('sales.paid')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((w) => (
            <TableRow key={w.lineId} hover>
              <TableCell sx={{ fontFamily: 'monospace' }}>{w.ticketCode}</TableCell>
              <TableCell>{w.drawName}</TableCell>
              <TableCell>{w.betTypeName}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>{w.betNumber}</TableCell>
              <TableCell align="right">{formatCurrency(w.salesAmount)}</TableCell>
              <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600 }}>{formatCurrency(w.prizeAmount)}</TableCell>
              <TableCell align="center">
                {w.isPaid ? <Chip label={t('common.yes')} size="small" color="success" /> : <Chip label={t('common.no')} size="small" />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const TransactionsTable = ({ rows, bettingPoolId }: { rows: TransactionLineReportDto[]; bettingPoolId: number | null }) => {
  const { t } = useTranslation();
  // Decide debit/credit relative to our banca: it could be in entity1 or entity2 slot.
  const mapped = useMemo(() => rows.map((r) => {
    const isEntity1 = bettingPoolId != null && (r.entity1Code === String(bettingPoolId) || r.entity1Name);
    // Heuristic: assume entity1 is our banca unless the name differs.
    const initial = isEntity1 ? r.entity1InitialBalance : r.entity2InitialBalance;
    const final = isEntity1 ? r.entity1FinalBalance : r.entity2FinalBalance;
    return { ...r, initial, final };
  }), [rows, bettingPoolId]);

  const { sortedData, getSortProps } = useTableSort<(typeof mapped)[number], string>(
    mapped,
    (r, k) => (r as unknown as Record<string, string | number>)[k],
    { sortBy: 'createdAt', sortOrder: 'desc' },
  );

  if (rows.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t('sales.noTransactionsOnDate')}</Typography>;
  }
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420, overflowX: 'auto' }}>
      <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#e3e3e3', '& th': { backgroundColor: '#e3e3e3' } }}>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('createdAt')}>{t('common.date')}</TableSortLabel></TableCell>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('groupNumber')}>{t('sales.group')}</TableSortLabel></TableCell>
            <TableCell sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('transactionType')}>{t('common.type')}</TableSortLabel></TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{t('sales.counterparty')}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('debit')}>{t('sales.debit')}</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><TableSortLabel {...getSortProps('credit')}>{t('sales.credit')}</TableSortLabel></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>{t('common.finalBalance')}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{t('common.notes')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((t) => (
            <TableRow key={t.lineId} hover>
              <TableCell>{new Date(t.createdAt).toLocaleString(getActiveLocale())}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>{t.groupNumber}</TableCell>
              <TableCell>{t.transactionType}</TableCell>
              <TableCell>{t.entity1Name || t.entity2Name}</TableCell>
              <TableCell align="right" sx={{ color: t.debit > 0 ? '#c62828' : 'inherit' }}>
                {t.debit > 0 ? formatCurrency(t.debit) : '-'}
              </TableCell>
              <TableCell align="right" sx={{ color: t.credit > 0 ? '#2e7d32' : 'inherit' }}>
                {t.credit > 0 ? formatCurrency(t.credit) : '-'}
              </TableCell>
              <TableCell align="right">{formatCurrency(t.final)}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{t.notes || ''}</TableCell>
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
const BettingPoolSales = (): React.ReactElement => {
  const { t } = useTranslation();
  const [fecha, setFecha] = useState<string>(getTodayDate());
  const [banca, setBanca] = useState<BancaOption | null>(null);
  const [bancasList, setBancasList] = useState<BancaOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [summary, setSummary] = useState<BettingPoolSalesDto | null>(null);
  const [draws, setDraws] = useState<DrawSalesDto[]>([]);
  const [results, setResults] = useState<ResultDto[]>([]);
  const [winningPlays, setWinningPlays] = useState<WinningPlayDto[]>([]);
  const [transactions, setTransactions] = useState<TransactionLineReportDto[]>([]);

  // Load bancas once.
  useEffect(() => {
    const loadBancas = async () => {
      try {
        const response = await api.get<{ items?: Banca[] } | Banca[]>('/betting-pools?pageSize=1000');
        const arr = (response && typeof response === 'object' && 'items' in response)
          ? (response.items || [])
          : (response as Banca[] || []);
        const normalized: BancaOption[] = arr.map((b) => ({
          id: b.bettingPoolId || b.id,
          code: b.bettingPoolCode || b.code || '',
          name: b.bettingPoolName || b.name || '',
        }));
        setBancasList(normalized);
      } catch (error) {
        console.error('Error loading bancas:', error);
      }
    };
    loadBancas();
  }, []);

  const loadReport = useCallback(async () => {
    if (!banca) return;
    setLoading(true);
    try {
      const bpId = banca.id;
      const [summaryArr, drawsResp, resultsArr, winnersResp, txArr] = await Promise.all([
        api.get<BettingPoolSalesDto[]>(`/reports/sales/by-betting-pool?startDate=${fecha}&endDate=${fecha}&bettingPoolId=${bpId}`),
        api.get<DrawSalesResponse>(`/reports/sales/by-draw?startDate=${fecha}&endDate=${fecha}&bettingPoolId=${bpId}`),
        api.get<ResultDto[]>(`/results?date=${fecha}`),
        api.get<WinningPlaysResponse>(`/winning-plays?startDate=${fecha}&endDate=${fecha}&bettingPoolId=${bpId}&pageSize=500`),
        api.get<TransactionLineReportDto[]>(`/transaction-groups/by-betting-pool?bettingPoolId=${bpId}&date=${fecha}`),
      ]);
      setSummary((summaryArr && summaryArr[0]) || null);
      setDraws(drawsResp?.draws || []);
      setResults(resultsArr || []);
      setWinningPlays(winnersResp?.items || []);
      setTransactions(txArr || []);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  }, [banca, fecha]);

  // Auto-refresh whenever date or banca changes (only if a banca is picked).
  useEffect(() => {
    if (banca) loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banca?.id, fecha]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Paper elevation={3}>
        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h5" align="center" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 400, fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
            {t('sales.bettingPoolReport')}
          </Typography>

          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label={t('common.date')} value={fecha}
                onChange={(e) => setFecha(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={bancasList}
                getOptionLabel={(o) => o.code ? `${o.code} - ${o.name}` : o.name}
                value={banca}
                onChange={(_e, v) => setBanca(v)}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => <TextField {...params} label={t('common.bettingPool')} size="small" placeholder={t('sales.selectBettingPoolPrompt')} />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={loadReport}
                disabled={loading || !banca}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Refresh />}
                sx={{ borderRadius: '30px', textTransform: 'uppercase' }}
              >
                {t('common.refresh')}
              </Button>
            </Grid>
          </Grid>

          {!banca && (
            <Typography variant="body2" align="center" sx={{ color: 'text.secondary', py: 4 }}>
              {t('sales.selectBettingPoolForReport')}
            </Typography>
          )}

          {banca && (
            <Stack spacing={4}>
              {/* Resumen de venta */}
              <Box>
                <SectionTitle>{t('sales.salesSummary')}</SectionTitle>
                {summary ? (
                  <>
                    {/* Highlight banner: balance to date + pending tickets value. */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{
                          p: 2,
                          borderLeft: `4px solid ${summary.balance >= 0 ? PALETTE.neto : PALETTE.netoNeg}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{t('sales.balanceToDate')}</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: colorForNet(summary.balance) }}>
                              {formatCurrency(summary.balance)}
                            </Typography>
                          </Box>
                          {summary.balance >= 0
                            ? <TrendingUp sx={{ fontSize: 36, color: PALETTE.neto }} />
                            : <TrendingDown sx={{ fontSize: 36, color: PALETTE.netoNeg }} />}
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{
                          p: 2,
                          borderLeft: `4px solid ${PALETTE.venta}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {t('sales.pendingTicketsTotalAmount', { count: summary.pendingCount })}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: PALETTE.venta }}>
                              {formatCurrency(summary.pendingTicketsAmount)}
                            </Typography>
                          </Box>
                          <Receipt sx={{ fontSize: 36, color: PALETTE.venta }} />
                        </Paper>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={7}>
                        {/* Banca header + ticket counts row */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{t('common.bettingPool')}</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>{summary.bettingPoolName}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('common.code')}: {summary.bettingPoolCode}</Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Chip label={`P ${summary.pendingCount}`} sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
                              <Chip label={`L ${summary.loserCount}`} sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }} />
                              <Chip label={`W ${summary.winnerCount}`} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                              <Chip
                                label={`${t('common.total')} ${summary.pendingCount + summary.loserCount + summary.winnerCount}`}
                                sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
                              />
                            </Stack>
                          </Stack>
                        </Paper>

                        {/* Money KPI tiles */}
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={4}>
                            <KpiTile label={t('sales.venta')} value={formatCurrency(summary.totalSold)} icon={<AttachMoney fontSize="small" />} accent={PALETTE.venta} />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile label={t('sales.comisiones')} value={formatCurrency(summary.totalCommissions)} icon={<AccountBalance fontSize="small" />} accent={PALETTE.comisiones} />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile label={t('sales.premios')} value={formatCurrency(summary.totalPrizes)} icon={<EmojiEvents fontSize="small" />} accent={PALETTE.premios} />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile
                              label={t('sales.neto')}
                              value={formatCurrency(summary.totalNet)}
                              icon={summary.totalNet >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                              accent={summary.totalNet >= 0 ? PALETTE.neto : PALETTE.netoNeg}
                            />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile label={t('sales.caida')} value={formatCurrency(summary.fall)} icon={<Discount fontSize="small" />} accent="#9e9e9e" />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile
                              label={t('sales.final')}
                              value={formatCurrency(summary.totalNet - summary.fall)}
                              icon={summary.totalNet - summary.fall >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                              accent={summary.totalNet - summary.fall >= 0 ? PALETTE.neto : PALETTE.netoNeg}
                            />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <KpiTile
                              label={t('sales.accumulatedFall')}
                              value={formatCurrency(summary.accumulatedFall)}
                              icon={summary.accumulatedFall >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                              accent={summary.accumulatedFall >= 0 ? PALETTE.neto : PALETTE.netoNeg}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('sales.salesComposition')}</Typography>
                          <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: t('sales.comisiones'), value: summary.totalCommissions, fill: PALETTE.comisiones },
                                  { name: t('sales.descuentos'), value: summary.totalDiscounts, fill: PALETTE.descuentos },
                                  { name: t('sales.premios'), value: summary.totalPrizes, fill: PALETTE.premios },
                                  { name: t('sales.neto'), value: Math.max(0, summary.totalNet), fill: PALETTE.neto },
                                ].filter((d) => d.value > 0)}
                                dataKey="value"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={2}
                              >
                                {[PALETTE.comisiones, PALETTE.descuentos, PALETTE.premios, PALETTE.neto].map((c, i) => (
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
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t('sales.noSalesOnDate')}</Typography>
                )}
              </Box>

              <Divider />

              {/* Totales por sorteo */}
              <Box>
                <SectionTitle>{t('sales.totalsByDraw')}</SectionTitle>
                {draws.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={draws.map((d) => ({ name: d.drawName, [t('sales.venta')]: d.totalSold, [t('sales.premios')]: d.totalPrizes, [t('sales.neto')]: d.totalNet }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                        <Tooltip formatter={((v: number) => formatCurrency(v)) as unknown as undefined} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        <Bar dataKey={t('sales.venta')} fill={PALETTE.venta} radius={[4, 4, 0, 0]} />
                        <Bar dataKey={t('sales.premios')} fill={PALETTE.premios} radius={[4, 4, 0, 0]} />
                        <Bar dataKey={t('sales.neto')} fill={PALETTE.neto} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                )}
                <DrawTotalsTable rows={draws} />
              </Box>

              <Divider />

              {/* Números ganadores */}
              <Box>
                <SectionTitle>{t('sales.winningNumbers')}</SectionTitle>
                {results.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t('sales.noResultsPublishedForDate')}
                  </Typography>
                ) : (
                  <Grid container spacing={1}>
                    {results.map((r) => {
                      const nums = [r.num1, r.num2, r.num3].filter(Boolean);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={r.resultId}>
                          <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.drawName}</Typography>
                            <Stack direction="row" spacing={0.5}>
                              {nums.map((n, i) => (
                                <Chip key={i} label={n} size="small" sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
                              ))}
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>

              <Divider />

              {/* Tickets ganadores */}
              <Box>
                <SectionTitle>{t('sales.winningTickets')}</SectionTitle>
                <WinningPlaysTable rows={winningPlays} />
              </Box>

              <Divider />

              {/* Transacciones recientes */}
              <Box>
                <SectionTitle>{t('sales.recentTransactions')}</SectionTitle>
                <TransactionsTable rows={transactions} bettingPoolId={banca.id} />
              </Box>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default BettingPoolSales;
