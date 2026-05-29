import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Chip,
  MenuItem,
  Popper,
  Fade,
  Paper as MuiPaper,
  Button,
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import { getTodayDate , getActiveLocale } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  getPlaysByNumber,
  getPlaysByNumberDetail,
  SINGLE_NUMBER_BET_TYPES,
  formatBetNumber,
  filterPlaceholder,
  expectedDigits,
  type PlayByNumberRow,
  type PlayByNumberDetailRow,
} from '@services/blackboardService';
import { getActiveZones } from '@services/zoneService';
import { getAllDraws } from '@services/drawService';
import api from '@services/api';

interface Zone {
  zoneId: number;
  zoneName: string;
}
interface Draw {
  drawId: number;
  drawName: string;
}
interface BettingPool {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode?: string;
  zoneId?: number;
}

const NUMBERS_00_99: string[] = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));

interface NumberCellData {
  number: string;
  amount: number;
}

interface HoverDetailContext {
  show: (anchor: HTMLElement, betTypeCode: string, betNumber: string) => void;
  hide: () => void;
}
const HoverCtx = React.createContext<HoverDetailContext | null>(null);

// Monochrome palette — same for every cell regardless of amount, since the
// Play Monitoring view explicitly doesn't surface "hot numbers" with color.
const NEUTRAL = { bg: '#ffffff', numColor: '#1f2937', amtColor: '#1f2937' };
const EMPTY_NEUTRAL = { bg: '#f8fafc', numColor: '#94a3b8', amtColor: '#94a3b8' };

const SingleNumberSection: React.FC<{
  name: string;
  betTypeCode: string;
  rows: PlayByNumberRow[];
}> = ({ name, betTypeCode, rows }) => {
  const { t } = useTranslation();
  const hover = React.useContext(HoverCtx);
  const [filter, setFilter] = useState<string>('');
  const maxDigits = expectedDigits(betTypeCode) || 2;

  const cells: NumberCellData[] = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of rows) {
      const n = r.betNumber.padStart(2, '0');
      m[n] = (m[n] ?? 0) + r.totalAmount;
    }
    return NUMBERS_00_99.map((n) => ({ number: n, amount: m[n] ?? 0 }));
  }, [rows]);

  const total = useMemo(() => cells.reduce((s, c) => s + c.amount, 0), [cells]);
  const playedCount = useMemo(() => cells.filter((c) => c.amount > 0).length, [cells]);

  // 5 columns × 20 rows column-major: column 0 = 00..19, column 1 = 20..39, …
  const columns = 5;
  const rowsCount = 20;
  const colData: NumberCellData[][] = [];
  for (let c = 0; c < columns; c++) {
    colData.push(cells.slice(c * rowsCount, c * rowsCount + rowsCount));
  }

  const filterDigits = filter.replace(/\D/g, '');
  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
    setFilter(digits);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 0.75 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '15px', fontFamily: 'Montserrat, sans-serif', color: '#2c2c2c' }}>
          {name}
          <Box component="span" sx={{ color: '#888', fontSize: '12px', fontWeight: 400, ml: 0.5 }}>
            ({playedCount})
          </Box>
        </Typography>
        <Typography sx={{ color: '#2c2c2c', fontWeight: 600, fontSize: '13px' }}>
          {formatCurrency(total)}
        </Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        <TextField
          size="small"
          placeholder={filterPlaceholder(betTypeCode)}
          value={filter}
          onChange={onFilterChange}
          inputProps={{
            inputMode: 'numeric',
            maxLength: maxDigits,
            style: { fontFamily: 'monospace', textAlign: 'center' },
          }}
          sx={{ width: 130, '& .MuiInputBase-root': { height: 28, fontSize: '13px' } }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(160px, 1fr))`,
          gap: '6px',
          px: '6px',
          pt: '4px',
          pb: '2px',
          width: 'fit-content',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Box
            key={`hdr-${i}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              px: 1.5,
            }}
          >
            <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>
              N°
            </Typography>
            <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>
              {t('common.amount').toUpperCase()}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(160px, 1fr))`,
          gap: '6px',
          p: '6px',
          borderRadius: 1.5,
          bgcolor: '#f1f5f9',
          width: 'fit-content',
        }}
      >
        {Array.from({ length: rowsCount }).flatMap((_, ri) =>
          colData.map((col, ci) => {
            const cell = col[ri];
            if (!cell) return null;
            const style = cell.amount > 0 ? NEUTRAL : EMPTY_NEUTRAL;
            const matches = !filterDigits || cell.number.startsWith(filterDigits);
            const hoverable = cell.amount > 0;
            const cellKey = `${ri}-${ci}-${cell.number}`;
            return (
              <Box
                key={cellKey}
                onMouseEnter={hoverable ? (e) => hover?.show(e.currentTarget as HTMLElement, betTypeCode, cell.number) : undefined}
                onMouseLeave={hoverable ? () => hover?.hide() : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  px: 2,
                  py: 1,
                  borderRadius: 1.25,
                  bgcolor: style.bg,
                  cursor: hoverable ? 'pointer' : 'default',
                  opacity: matches ? 1 : 0.25,
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                  '&:hover': hoverable
                    ? { transform: 'translateY(-1px)', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.18)' }
                    : undefined,
                }}
              >
                <Typography sx={{
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: style.numColor,
                  letterSpacing: 0.5,
                }}>
                  {cell.number}
                </Typography>
                <Typography sx={{
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: style.amtColor,
                }}>
                  {cell.amount > 0 ? cell.amount.toLocaleString(getActiveLocale(), { maximumFractionDigits: 0 }) : 0}
                </Typography>
              </Box>
            );
          }),
        )}
      </Box>
    </Box>
  );
};

const CombinationSection: React.FC<{
  name: string;
  betTypeCode: string;
  rows: PlayByNumberRow[];
  grandTotal: number;
}> = ({ name, betTypeCode, rows, grandTotal }) => {
  const { t } = useTranslation();
  const hover = React.useContext(HoverCtx);
  const [filter, setFilter] = useState<string>('');
  const maxDigits = expectedDigits(betTypeCode) || 6;

  const sorted = useMemo(() => [...rows].sort((a, b) => b.totalAmount - a.totalAmount), [rows]);
  const filterDigits = filter.replace(/\D/g, '');
  const visible = useMemo(
    () => (filterDigits ? sorted.filter((r) => r.betNumber.startsWith(filterDigits)) : sorted),
    [sorted, filterDigits],
  );

  const total = sorted.reduce((s, r) => s + r.totalAmount, 0);
  const lineCount = sorted.reduce((s, r) => s + r.lineCount, 0);
  const pct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0;

  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
    setFilter(digits);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '18px', fontFamily: 'Montserrat, sans-serif', color: '#2c2c2c' }}>
          {name}
          {pct > 0 && (
            <Box component="span" sx={{ color: '#666', fontSize: '14px', fontWeight: 400, ml: 0.5 }}>
              ({pct}%)
            </Box>
          )}
        </Typography>
        <Typography sx={{ color: '#2c2c2c', fontWeight: 600, fontSize: '15px' }}>
          {formatCurrency(total)}
        </Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        <TextField
          size="small"
          placeholder={filterPlaceholder(betTypeCode)}
          value={filter}
          onChange={onFilterChange}
          inputProps={{
            inputMode: 'numeric',
            maxLength: maxDigits,
            style: { fontFamily: 'monospace', textAlign: 'center' },
          }}
          sx={{ width: 130, '& .MuiInputBase-root': { height: 28, fontSize: '13px' } }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, px: 1.5, pb: '2px', minWidth: 260 }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>
          N° <Box component="span" sx={{ color: '#cbd5e1', fontWeight: 400 }}>({lineCount})</Box>
        </Typography>
        <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>
          {t('common.amount').toUpperCase()}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          p: '6px',
          borderRadius: 1.5,
          bgcolor: '#f1f5f9',
          minWidth: 300,
          maxHeight: 520,
          overflowY: 'auto',
        }}
      >
        {visible.length === 0 && (
          <Box sx={{ px: 1.5, py: 1, color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
            {t('common.noResults')}
          </Box>
        )}
        {visible.map((r) => (
          <Box
            key={r.betNumber}
            onMouseEnter={(e) => hover?.show(e.currentTarget as HTMLElement, betTypeCode, r.betNumber)}
            onMouseLeave={() => hover?.hide()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              px: 2,
              py: 1,
              borderRadius: 1.25,
              bgcolor: NEUTRAL.bg,
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.12s ease, box-shadow 0.12s ease',
              '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.18)' },
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: NEUTRAL.numColor, letterSpacing: 0.5 }}>
              {formatBetNumber(betTypeCode, r.betNumber)}
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 600, color: NEUTRAL.amtColor }}>
              {r.totalAmount.toLocaleString(getActiveLocale(), { maximumFractionDigits: 0 })}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const PlayMonitoring: React.FC = () => {
  const { t } = useTranslation();
  // Deep-link support: the "Ver en Lottobook" email button opens this page with
  // ?drawId=&date= so it lands pre-filtered on the right lottery. Read once at
  // mount; the user can change the filters afterward.
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState<string>(() => searchParams.get('date') || getTodayDate());
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<number | null>(() => {
    const raw = searchParams.get('drawId');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  });
  const [bancas, setBancas] = useState<BettingPool[]>([]);
  const [selectedBanca, setSelectedBanca] = useState<BettingPool | null>(null);

  const [rows, setRows] = useState<PlayByNumberRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [hoverState, setHoverState] = useState<{
    anchor: HTMLElement | null;
    betTypeCode: string;
    betNumber: string;
    loading: boolean;
    rows: PlayByNumberDetailRow[];
    error: string | null;
  }>({ anchor: null, betTypeCode: '', betNumber: '', loading: false, rows: [], error: null });

  const hoverShowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchKey = useRef<string>('');

  useEffect(() => {
    (async () => {
      try {
        const zRes = (await getActiveZones()) as { data?: Zone[]; items?: Zone[] };
        const zList = (zRes?.data ?? zRes?.items ?? []) as Zone[];
        setZones(zList);
      } catch (e) {
        console.error('Error loading zones:', e);
      }
      try {
        const dRes = (await getAllDraws({ pageSize: 200 })) as { data?: Draw[]; items?: Draw[] };
        const dList = (dRes?.data ?? dRes?.items ?? []) as Draw[];
        setDraws(dList);
      } catch (e) {
        console.error('Error loading draws:', e);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pageSize = 100;
        const all: BettingPool[] = [];
        let page = 1;
        while (true) {
          const resp = (await api.get(`/betting-pools?page=${page}&pageSize=${pageSize}`)) as
            | { items?: BettingPool[]; totalCount?: number }
            | BettingPool[];
          const items = Array.isArray(resp) ? resp : resp?.items ?? [];
          all.push(...items);
          if (Array.isArray(resp)) break;
          if (items.length < pageSize) break;
          if (typeof resp.totalCount === 'number' && all.length >= resp.totalCount) break;
          page += 1;
        }
        if (!cancelled) setBancas(all);
      } catch (e) {
        console.error('Error loading bancas:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBancas = useMemo(() => {
    if (selectedZoneIds.length === 0) return bancas;
    return bancas.filter((b) => b.zoneId !== undefined && selectedZoneIds.includes(b.zoneId));
  }, [bancas, selectedZoneIds]);

  useEffect(() => {
    if (
      selectedBanca &&
      selectedZoneIds.length > 0 &&
      !filteredBancas.some((b) => b.bettingPoolId === selectedBanca.bettingPoolId)
    ) {
      setSelectedBanca(null);
    }
  }, [selectedZoneIds, filteredBancas, selectedBanca]);

  const fetchData = useCallback(async () => {
    if (!selectedDrawId) {
      setRows([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getPlaysByNumber({
        date,
        drawId: selectedDrawId,
        zoneIds: selectedZoneIds.length > 0 ? selectedZoneIds : null,
        bettingPoolId: selectedBanca?.bettingPoolId ?? null,
      });
      setRows(data);
    } catch (e) {
      console.error(e);
      setError(t('tickets.plays.loadError'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [date, selectedDrawId, selectedZoneIds, selectedBanca, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const grouped = useMemo(() => {
    const m = new Map<string, { betTypeName: string; rows: PlayByNumberRow[] }>();
    for (const r of rows) {
      const e = m.get(r.betTypeCode) ?? { betTypeName: r.betTypeName, rows: [] };
      e.rows.push(r);
      m.set(r.betTypeCode, e);
    }
    return m;
  }, [rows]);

  const grandTotal = useMemo(() => rows.reduce((s, r) => s + r.totalAmount, 0), [rows]);

  const ORDER: string[] = [
    'DIRECTO',
    'PALE',
    'TRIPLETA',
    'SUPER_PALE',
    'CASH3_STRAIGHT',
    'CASH3_BOX',
    'CASH3_FRONT_STRAIGHT',
    'CASH3_FRONT_BOX',
    'CASH3_BACK_STRAIGHT',
    'CASH3_BACK_BOX',
    'PLAY4_STRAIGHT',
    'PLAY4_BOX',
    'PICK5_STRAIGHT',
    'PICK2',
    'PICK2_FRONT',
    'PICK2_MIDDLE',
    'PICK2_BACK',
    'BOLITA',
    'SINGULACION',
  ];
  const orderIndex = (code: string): number => {
    const idx = ORDER.indexOf(code);
    return idx === -1 ? ORDER.length : idx;
  };

  const allGroups: { code: string; name: string; rows: PlayByNumberRow[] }[] = [];
  grouped.forEach((value, code) => {
    allGroups.push({ code, name: value.betTypeName, rows: value.rows });
  });
  allGroups.sort((a, b) => {
    const ai = orderIndex(a.code);
    const bi = orderIndex(b.code);
    if (ai !== bi) return ai - bi;
    return a.code.localeCompare(b.code);
  });

  const drawLabel = useMemo(() => {
    if (!selectedDrawId) return null;
    return draws.find((d) => d.drawId === selectedDrawId)?.drawName ?? null;
  }, [selectedDrawId, draws]);

  const showDetail = useCallback(
    (anchor: HTMLElement, betTypeCode: string, betNumber: string) => {
      if (hoverHideTimer.current) {
        clearTimeout(hoverHideTimer.current);
        hoverHideTimer.current = null;
      }
      if (hoverShowTimer.current) {
        clearTimeout(hoverShowTimer.current);
      }
      hoverShowTimer.current = setTimeout(async () => {
        const fetchKey = `${betTypeCode}|${betNumber}|${date}|${selectedDrawId ?? ''}|${selectedZoneIds.join(',')}|${selectedBanca?.bettingPoolId ?? ''}`;
        lastFetchKey.current = fetchKey;
        setHoverState({ anchor, betTypeCode, betNumber, loading: true, rows: [], error: null });
        try {
          const data = await getPlaysByNumberDetail({
            date,
            drawId: selectedDrawId,
            zoneIds: selectedZoneIds.length > 0 ? selectedZoneIds : null,
            bettingPoolId: selectedBanca?.bettingPoolId ?? null,
            betTypeCode,
            betNumber,
          });
          if (lastFetchKey.current !== fetchKey) return;
          setHoverState({ anchor, betTypeCode, betNumber, loading: false, rows: data, error: null });
        } catch (e) {
          if (lastFetchKey.current !== fetchKey) return;
          console.error(e);
          setHoverState({ anchor, betTypeCode, betNumber, loading: false, rows: [], error: t('actionsMessages.loadError') });
        }
      }, 200);
    },
    [date, selectedDrawId, selectedZoneIds, selectedBanca, t],
  );

  const hideDetail = useCallback(() => {
    if (hoverShowTimer.current) {
      clearTimeout(hoverShowTimer.current);
      hoverShowTimer.current = null;
    }
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
    hoverHideTimer.current = setTimeout(() => {
      setHoverState((s) => ({ ...s, anchor: null }));
    }, 100);
  }, []);

  const hoverCtxValue = useMemo<HoverDetailContext>(() => ({ show: showDetail, hide: hideDetail }), [showDetail, hideDetail]);

  // Build a printable PDF with one section per game type. Reuses the browser's
  // Print-to-PDF flow so there's no extra dependency.
  const handleExportPdf = useCallback(() => {
    if (!selectedDrawId || rows.length === 0) return;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const filters: string[] = [`${t('common.date')}: ${date}`];
    if (drawLabel) filters.push(`${t('common.draw')}: ${drawLabel}`);
    if (selectedZoneIds.length > 0) {
      const names = zones.filter((z) => selectedZoneIds.includes(z.zoneId)).map((z) => z.zoneName).join(', ');
      filters.push(`${t('common.zones')}: ${names}`);
    }
    if (selectedBanca) {
      filters.push(`${t('common.bettingPool')}: ${selectedBanca.bettingPoolCode ? `${selectedBanca.bettingPoolCode} - ` : ''}${selectedBanca.bettingPoolName}`);
    }

    const sectionsHtml = allGroups
      .map(({ code, name, rows: groupRows }) => {
        const sorted = [...groupRows].sort((a, b) => b.totalAmount - a.totalAmount);
        const sectionTotal = sorted.reduce((s, r) => s + r.totalAmount, 0);
        const lineCount = sorted.reduce((s, r) => s + r.lineCount, 0);
        const body = sorted
          .map(
            (r) => `
            <tr>
              <td style="font-family:monospace">${esc(formatBetNumber(code, r.betNumber))}</td>
              <td style="text-align:right">${r.lineCount}</td>
              <td style="text-align:right;font-family:monospace">${r.totalAmount.toLocaleString(getActiveLocale(), { maximumFractionDigits: 0 })}</td>
            </tr>`,
          )
          .join('');
        return `
          <section class="bt-section">
            <div class="bt-head">
              <div class="bt-name">${esc(name)} <span class="bt-count">(${lineCount})</span></div>
              <div class="bt-total">${esc(formatCurrency(sectionTotal))}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>${esc(t('common.number'))}</th>
                  <th style="text-align:right">${esc(t('tickets.plays.lines'))}</th>
                  <th style="text-align:right">${esc(t('common.amount'))}</th>
                </tr>
              </thead>
              <tbody>${body}</tbody>
            </table>
          </section>`;
      })
      .join('');

    const title = `${t('tickets.plays.title')} — ${drawLabel ?? `${t('common.draw')} ${selectedDrawId}`}`;

    w.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 16px; color: #1f2937; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .filters { font-size: 11px; color: #4b5563; margin-bottom: 8px; }
  .grand { font-size: 14px; font-weight: 700; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .bt-section { break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; }
  .bt-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
  .bt-name { font-weight: 700; font-size: 12px; }
  .bt-count { font-weight: 400; color: #6b7280; font-size: 10px; }
  .bt-total { font-weight: 700; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th, td { border-bottom: 1px solid #e5e7eb; padding: 3px 6px; }
  th { background: #f9fafb; font-weight: 600; text-align: left; }
  @page { size: portrait; margin: 10mm; }
</style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <div class="filters">${filters.map(esc).join(' &nbsp;·&nbsp; ')}</div>
  <div class="grand">${esc(t('common.total'))}: ${esc(formatCurrency(grandTotal))}</div>
  <div class="grid">${sectionsHtml}</div>
  <script>window.onload = () => setTimeout(() => window.print(), 250);</script>
</body>
</html>`);
    w.document.close();
  }, [allGroups, date, drawLabel, grandTotal, rows.length, selectedBanca, selectedDrawId, selectedZoneIds, zones, t]);

  return (
    <HoverCtx.Provider value={hoverCtxValue}>
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 3 } }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: '#2c2c2c', mb: { xs: 2, sm: 3 }, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
          >
            {t('tickets.plays.title')}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
            <TextField
              type="date"
              label={t('common.date')}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              size="small"
              label={t('common.draw')}
              value={selectedDrawId ?? ''}
              onChange={(e) => setSelectedDrawId(e.target.value ? Number(e.target.value) : null)}
            >
              {draws.map((d) => (
                <MenuItem key={d.drawId} value={d.drawId}>
                  {d.drawName}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete<Zone, true>
              multiple
              size="small"
              options={zones}
              value={zones.filter((z) => selectedZoneIds.includes(z.zoneId))}
              onChange={(_, vals) => setSelectedZoneIds(vals.map((v) => v.zoneId))}
              getOptionLabel={(z) => z.zoneName}
              isOptionEqualToValue={(a, b) => a.zoneId === b.zoneId}
              renderInput={(params) => <TextField {...params} label={t('common.zones')} placeholder={t('common.all')} />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip size="small" label={option.zoneName} {...getTagProps({ index })} key={option.zoneId} />
                ))
              }
            />
            <Autocomplete<BettingPool>
              size="small"
              options={filteredBancas}
              value={selectedBanca}
              onChange={(_, v) => setSelectedBanca(v)}
              getOptionLabel={(b) => (b.bettingPoolCode ? `${b.bettingPoolCode} — ${b.bettingPoolName}` : b.bettingPoolName)}
              isOptionEqualToValue={(a, b) => a.bettingPoolId === b.bettingPoolId}
              renderInput={(params) => <TextField {...params} label={t('common.bettingPool')} placeholder={t('common.all')} />}
            />
          </Box>

          {selectedDrawId && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '22px', fontWeight: 500, fontFamily: 'Montserrat, sans-serif', color: '#2c2c2c' }}>
                {t('tickets.plays.totalForDraw')} <b>{drawLabel}</b>:{' '}
                <Box component="span" sx={{ color: '#2c2c2c', fontWeight: 700 }}>
                  {formatCurrency(grandTotal)}
                </Box>
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<PictureAsPdf />}
                onClick={handleExportPdf}
                disabled={loading || rows.length === 0}
                sx={{
                  bgcolor: '#51cbce',
                  '&:hover': { bgcolor: '#45b8bb' },
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                PDF
              </Button>
            </Box>
          )}

          {!selectedDrawId && (
            <Typography sx={{ textAlign: 'center', color: '#888', py: 6, fontSize: '15px' }}>
              {t('tickets.plays.selectDrawPrompt')}
            </Typography>
          )}

          {selectedDrawId && loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#51cbce' }} />
            </Box>
          )}

          {selectedDrawId && error && (
            <Typography sx={{ color: '#c62828', mb: 2 }}>{error}</Typography>
          )}

          {selectedDrawId && !loading && !error && rows.length === 0 && (
            <Typography sx={{ textAlign: 'center', color: '#888', py: 4 }}>
              {t('tickets.plays.noPlaysForFilters')}
            </Typography>
          )}

          {selectedDrawId && !loading && !error && rows.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
              {allGroups.map(({ code, name, rows: groupRows }) =>
                SINGLE_NUMBER_BET_TYPES.has(code) ? (
                  <SingleNumberSection key={code} name={name} betTypeCode={code} rows={groupRows} />
                ) : (
                  <CombinationSection key={code} name={name} betTypeCode={code} rows={groupRows} grandTotal={grandTotal} />
                ),
              )}
            </Box>
          )}
        </Paper>
      </Box>

      <Popper
        open={!!hoverState.anchor}
        anchorEl={hoverState.anchor}
        placement="right-start"
        transition
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
        sx={{ zIndex: 1500, pointerEvents: 'none' }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <MuiPaper
              elevation={6}
              sx={{ p: 1.5, minWidth: 280, maxWidth: 360, maxHeight: 400, overflowY: 'auto', border: '1px solid #e0e0e0' }}
            >
              <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                {hoverState.betTypeCode} ·{' '}
                <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#2c2c2c' }}>
                  {formatBetNumber(hoverState.betTypeCode, hoverState.betNumber)}
                </Box>
              </Typography>
              {hoverState.loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                  <CircularProgress size={20} sx={{ color: '#51cbce' }} />
                </Box>
              )}
              {!hoverState.loading && hoverState.error && (
                <Typography sx={{ color: '#c62828', fontSize: '12px' }}>{hoverState.error}</Typography>
              )}
              {!hoverState.loading && !hoverState.error && hoverState.rows.length === 0 && (
                <Typography sx={{ color: '#888', fontSize: '12px', textAlign: 'center', py: 1 }}>
                  {t('common.noResults')}
                </Typography>
              )}
              {!hoverState.loading && !hoverState.error && hoverState.rows.length > 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.5, color: '#1976d2', letterSpacing: 0.3 }}>{t('common.bettingPool').toUpperCase()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.5, color: '#1976d2', letterSpacing: 0.3 }}>{t('tickets.plays.reference').toUpperCase()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.5, color: '#1976d2', letterSpacing: 0.3 }} align="right">{t('common.amount').toUpperCase()}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hoverState.rows.map((r, idx) => (
                      <TableRow
                        key={r.bettingPoolId}
                        sx={{ bgcolor: idx % 2 === 1 ? '#f9fbfd' : 'transparent', '&:hover': { bgcolor: '#e3f2fd' } }}
                      >
                        <TableCell sx={{ fontSize: '12px', py: 0.5, fontFamily: 'monospace' }}>
                          {r.bettingPoolCode || r.bettingPoolName}
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', py: 0.5, color: '#666' }}>
                          {r.reference || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', py: 0.5, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                          {r.totalAmount.toLocaleString(getActiveLocale(), { maximumFractionDigits: 0 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </MuiPaper>
          </Fade>
        )}
      </Popper>
    </HoverCtx.Provider>
  );
};

export default PlayMonitoring;
