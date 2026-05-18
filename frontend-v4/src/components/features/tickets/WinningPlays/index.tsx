import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FilterList, PictureAsPdf } from '@mui/icons-material';
import {
  getWinningPlays,
  WinningPlay,
} from '../../../../services/winningPlayService';
import api from '@services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { getTodayDate } from '@/utils/formatters';
import { MultiSelectSearch } from '@/components/common';

const PRIMARY_COLOR = '#51cbce';
const PRIMARY_HOVER = '#45b8bb';

interface Draw {
  drawId: number;
  drawName: string;
}

interface Zone {
  zoneId: number;
  name: string;
}

// Group rows by draw → bet type. Used both for screen rendering and PDF export.
interface BetTypeGroup {
  betTypeName: string;
  plays: WinningPlay[];
  totalPrizes: number;
}
interface DrawGroup {
  drawId: number;
  drawName: string;
  groups: BetTypeGroup[];
  totalSales: number;
  totalPrizes: number;
}

const groupPlays = (plays: WinningPlay[]): DrawGroup[] => {
  const drawMap = new Map<number, DrawGroup>();
  for (const p of plays) {
    let draw = drawMap.get(p.drawId);
    if (!draw) {
      draw = { drawId: p.drawId, drawName: p.drawName, groups: [], totalSales: 0, totalPrizes: 0 };
      drawMap.set(p.drawId, draw);
    }
    draw.totalSales += p.salesAmount;
    draw.totalPrizes += p.prizeAmount;

    let bt = draw.groups.find((g) => g.betTypeName === p.betTypeName);
    if (!bt) {
      bt = { betTypeName: p.betTypeName, plays: [], totalPrizes: 0 };
      draw.groups.push(bt);
    }
    bt.plays.push(p);
    bt.totalPrizes += p.prizeAmount;
  }
  return Array.from(drawMap.values()).sort((a, b) => a.drawName.localeCompare(b.drawName));
};

const WinningPlays: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>(getTodayDate());
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);

  const [winningPlays, setWinningPlays] = useState<WinningPlay[]>([]);
  const [drawsList, setDrawsList] = useState<Draw[]>([]);
  const [zonesList, setZonesList] = useState<Zone[]>([]);

  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalPrizes, setTotalPrizes] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load draws + zones once. Use the same endpoints other reports use.
  useEffect(() => {
    const load = async () => {
      setLoadingFilters(true);
      try {
        type RawDraw = { drawId: number; drawName?: string; lotteryName?: string };
        type RawZone = { zoneId?: number; id?: number; zoneName?: string; name?: string };
        const [drawsResp, zonesResp] = await Promise.all([
          api.get<{ items?: RawDraw[] } | RawDraw[]>('/draws?pageSize=500'),
          api.get<{ items?: RawZone[] } | RawZone[]>('/zones'),
        ]);
        const drawsArr = (drawsResp && typeof drawsResp === 'object' && 'items' in drawsResp)
          ? (drawsResp.items || [])
          : (drawsResp as RawDraw[] || []);
        const draws: Draw[] = drawsArr.map((d) => ({
          drawId: d.drawId,
          drawName: d.drawName || d.lotteryName || `Sorteo ${d.drawId}`,
        }));
        setDrawsList(draws);

        const zonesArr = (zonesResp && typeof zonesResp === 'object' && 'items' in zonesResp)
          ? (zonesResp.items || [])
          : (zonesResp as RawZone[] || []);
        const zones: Zone[] = zonesArr.map((z) => ({
          zoneId: z.zoneId || z.id || 0,
          name: z.zoneName || z.name || '',
        }));
        setZonesList(zones);
        setSelectedZoneIds(zones.map((z) => z.zoneId));
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('Error al cargar las opciones de filtro');
      } finally {
        setLoadingFilters(false);
      }
    };
    load();
  }, []);

  const fetchWinningPlays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Only send zoneIds when narrowed below the full list (matches the other reports).
      const zoneIdsParam = selectedZoneIds.length > 0 && selectedZoneIds.length < zonesList.length
        ? selectedZoneIds
        : undefined;
      const response = await getWinningPlays({
        startDate,
        endDate,
        drawId: selectedDraw?.drawId,
        zoneIds: zoneIdsParam,
      });
      setWinningPlays(response.items);
      setTotalSales(response.totalSales);
      setTotalPrizes(response.totalPrizes);
    } catch (err) {
      console.error('Error fetching winning plays:', err);
      setError('Error al cargar las jugadas ganadoras');
      setWinningPlays([]);
      setTotalSales(0);
      setTotalPrizes(0);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedDraw, selectedZoneIds, zonesList.length]);

  // Auto-load once filters are ready.
  useEffect(() => {
    if (loadingFilters) return;
    fetchWinningPlays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingFilters]);

  const groupedData = useMemo(() => groupPlays(winningPlays), [winningPlays]);

  const handleExportPdf = useCallback(() => {
    if (winningPlays.length === 0) return;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const sections = groupedData
      .map((draw) => {
        const rows = draw.groups
          .map((bt) =>
            bt.plays
              .map((p, idx) => {
                const firstOfGroup = idx === 0;
                const tdType = firstOfGroup
                  ? `<td rowspan="${bt.plays.length}" style="font-weight:600;vertical-align:top">${esc(bt.betTypeName)}</td>`
                  : '';
                const tdTotal = firstOfGroup
                  ? `<td rowspan="${bt.plays.length}" style="font-weight:700;text-align:right;vertical-align:top">${esc(formatCurrency(bt.totalPrizes))}</td>`
                  : '';
                return `<tr>${tdType}<td>${esc(p.betNumber)}</td><td style="text-align:right">${esc(formatCurrency(p.salesAmount))}</td><td style="text-align:right;color:#2e7d32">${esc(formatCurrency(p.prizeAmount))}</td>${tdTotal}</tr>`;
              })
              .join(''),
          )
          .join('');
        return `
          <table>
            <thead>
              <tr><th colspan="5" class="draw-header">${esc(draw.drawName)}</th></tr>
              <tr>
                <th>Tipo de jugada</th>
                <th>Jugada</th>
                <th style="text-align:right">Venta</th>
                <th style="text-align:right">Premio</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>`;
      })
      .join('');

    const title = `Jugadas ganadoras — ${startDate} al ${endDate}`;
    w.document.write(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 16px; color: #1f2937; }
  h1 { font-size: 18px; margin: 0 0 8px; }
  .meta { font-size: 11px; color: #6b7280; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; break-inside: avoid; }
  th, td { border: 1px solid #d1d5db; padding: 4px 6px; }
  th { background: #f3f4f6; font-weight: 600; text-align: left; }
  th.draw-header { text-align: center; background: #e0f2fe; font-size: 13px; }
  tfoot td { background: #eef2ff; font-weight: 700; }
  @page { size: portrait; margin: 12mm; }
</style>
</head><body>
  <h1>${esc(title)}</h1>
  <div class="meta">${esc(`Filtros — Sorteo: ${selectedDraw?.drawName ?? 'Todos'} · Zonas: ${selectedZoneIds.length === 0 || selectedZoneIds.length === zonesList.length ? 'Todas' : selectedZoneIds.length}`)}</div>
  ${sections}
  <table>
    <tbody>
      <tr>
        <td style="font-weight:700;width:30%">Total</td>
        <td></td>
        <td style="text-align:right;font-weight:700">${esc(formatCurrency(totalSales))}</td>
        <td style="text-align:right;font-weight:700;color:#2e7d32">${esc(formatCurrency(totalPrizes))}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
  <script>window.onload = () => setTimeout(() => window.print(), 250);</script>
</body></html>`);
    w.document.close();
  }, [groupedData, startDate, endDate, selectedDraw, selectedZoneIds, zonesList.length, totalSales, totalPrizes, winningPlays.length]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: '#2c2c2c', mb: 4, fontWeight: 500, fontFamily: 'Montserrat, sans-serif' }}
          >
            Jugadas ganadoras
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loadingFilters ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: PRIMARY_COLOR }} />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <TextField
                  type="date"
                  label="Fecha inicial"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ flex: 1, minWidth: 180 }}
                />
                <TextField
                  type="date"
                  label="Fecha final"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ flex: 1, minWidth: 180 }}
                />
                <Autocomplete
                  options={drawsList}
                  getOptionLabel={(o) => o.drawName || ''}
                  value={selectedDraw}
                  onChange={(_, v) => setSelectedDraw(v)}
                  isOptionEqualToValue={(a, b) => a.drawId === b.drawId}
                  renderInput={(params) => (
                    <TextField {...params} label="Sorteo" size="small" placeholder="Seleccione" />
                  )}
                  size="small"
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <MultiSelectSearch
                    label="Zonas"
                    selectAllLabel="Todas"
                    options={zonesList.map((z) => ({ id: z.zoneId, label: z.name }))}
                    selectedIds={selectedZoneIds}
                    onChange={setSelectedZoneIds}
                  />
                </Box>
              </Box>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  onClick={fetchWinningPlays}
                  disabled={loading}
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    '&:hover': { bgcolor: PRIMARY_HOVER },
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    borderRadius: '20px',
                  }}
                >
                  Filtrar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdf />}
                  onClick={handleExportPdf}
                  disabled={loading || winningPlays.length === 0}
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    '&:hover': { bgcolor: PRIMARY_HOVER },
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    borderRadius: '20px',
                  }}
                >
                  PDF
                </Button>
              </Stack>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: PRIMARY_COLOR }} />
                </Box>
              )}

              {!loading && winningPlays.length === 0 && (
                <Typography variant="body2" align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  No hay entradas disponibles para los filtros seleccionados.
                </Typography>
              )}

              {!loading && groupedData.length > 0 && (
                <Paper variant="outlined">
                  <Table size="small">
                    {groupedData.map((draw) => (
                      <React.Fragment key={draw.drawId}>
                        <TableHead>
                          {/* Draw name banner spans the full table width. */}
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              align="center"
                              sx={{ fontWeight: 700, backgroundColor: '#f5f5f5', fontSize: '0.95rem' }}
                            >
                              {draw.drawName}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ backgroundColor: '#fafafa' }}>
                            <TableCell sx={{ fontWeight: 600, color: '#6b7280' }}>Tipo de jugada</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#6b7280' }}>Jugada</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#6b7280' }}>Venta</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#6b7280' }}>Premio</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#6b7280' }}>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {draw.groups.flatMap((bt) =>
                            bt.plays.map((p, idx) => (
                              <TableRow key={p.lineId} hover>
                                {idx === 0 && (
                                  <TableCell
                                    rowSpan={bt.plays.length}
                                    sx={{ fontWeight: 600, verticalAlign: 'top' }}
                                  >
                                    {bt.betTypeName}
                                  </TableCell>
                                )}
                                <TableCell sx={{ fontFamily: 'monospace' }}>{p.betNumber}</TableCell>
                                <TableCell>{formatCurrency(p.salesAmount)}</TableCell>
                                <TableCell sx={{ color: '#2e7d32' }}>{formatCurrency(p.prizeAmount)}</TableCell>
                                {idx === 0 && (
                                  <TableCell
                                    rowSpan={bt.plays.length}
                                    sx={{ fontWeight: 700, verticalAlign: 'top' }}
                                  >
                                    {formatCurrency(bt.totalPrizes)}
                                  </TableCell>
                                )}
                              </TableRow>
                            )),
                          )}
                        </TableBody>
                      </React.Fragment>
                    ))}
                    {/* Grand totals row */}
                    <TableBody>
                      <TableRow sx={{ backgroundColor: '#eef2ff', '& td': { fontWeight: 700 } }}>
                        <TableCell>Total</TableCell>
                        <TableCell />
                        <TableCell>{formatCurrency(totalSales)}</TableCell>
                        <TableCell>{formatCurrency(totalPrizes)}</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(WinningPlays);
