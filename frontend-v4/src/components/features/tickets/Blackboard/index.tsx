import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
} from '@mui/material'
import { getTodayDate } from '@/utils/formatters'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  getPlaysByNumber,
  getPlaysByNumberDetail,
  SINGLE_NUMBER_BET_TYPES,
  formatBetNumber,
  filterPlaceholder,
  expectedDigits,
  type PlayByNumberRow,
  type PlayByNumberDetailRow,
} from '@services/blackboardService'
import { getActiveZones } from '@services/zoneService'
import { getAllDraws } from '@services/drawService'
import api from '@services/api'

interface Zone {
  zoneId: number
  zoneName: string
}

interface Draw {
  drawId: number
  drawName: string
}

interface BettingPool {
  bettingPoolId: number
  bettingPoolName: string
  bettingPoolCode?: string
  zoneId?: number
}

const NUMBERS_00_99: string[] = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'))

interface NumberCellData { number: string; amount: number }

// Context for opening the per-banca detail popover from any cell.
interface HoverDetailContext {
  show: (anchor: HTMLElement, betTypeCode: string, betNumber: string) => void
  hide: () => void
}
const HoverCtx = React.createContext<HoverDetailContext | null>(null)

const SingleNumberSection: React.FC<{ name: string; betTypeCode: string; rows: PlayByNumberRow[] }> = ({ name, betTypeCode, rows }) => {
  const hover = React.useContext(HoverCtx)
  const [filter, setFilter] = useState<string>('')
  const maxDigits = expectedDigits(betTypeCode) || 2

  const cells: NumberCellData[] = useMemo(() => {
    const m: Record<string, number> = {}
    for (const r of rows) {
      const n = r.betNumber.padStart(2, '0')
      m[n] = (m[n] ?? 0) + r.totalAmount
    }
    return NUMBERS_00_99.map(n => ({ number: n, amount: m[n] ?? 0 }))
  }, [rows])

  const total = useMemo(() => cells.reduce((s, c) => s + c.amount, 0), [cells])
  const maxAmount = useMemo(() => Math.max(0, ...cells.map(c => c.amount)), [cells])
  const playedCount = useMemo(() => cells.filter(c => c.amount > 0).length, [cells])

  // 5 columns × 20 rows column-major:
  // column 0: 00..19, column 1: 20..39, ..., column 4: 80..99.
  // We store one array per column then render row by row.
  const columns = 5
  const rowsCount = 20
  const colData: NumberCellData[][] = []
  for (let c = 0; c < columns; c++) {
    colData.push(cells.slice(c * rowsCount, c * rowsCount + rowsCount))
  }

  // Heatmap palette by intensity (amount / maxAmount).
  // 0 plays → muted slate; low → blue; mid → amber; high → red.
  const styleFor = (amount: number): { bg: string; numColor: string; amtColor: string } => {
    if (amount <= 0) return { bg: '#f8fafc', numColor: '#94a3b8', amtColor: '#cbd5e1' }
    const ratio = maxAmount > 0 ? amount / maxAmount : 0
    if (ratio <= 0.33) return { bg: '#dbeafe', numColor: '#1e3a8a', amtColor: '#1d4ed8' }
    if (ratio <= 0.66) return { bg: '#fef3c7', numColor: '#78350f', amtColor: '#b45309' }
    return { bg: '#fee2e2', numColor: '#7f1d1d', amtColor: '#b91c1c' }
  }

  const filterDigits = filter.replace(/\D/g, '')
  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, maxDigits)
    setFilter(digits)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 0.75 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '15px', fontFamily: 'Montserrat, sans-serif', color: '#2c2c2c' }}>
          {name}
          <Box component="span" sx={{ color: '#888', fontSize: '12px', fontWeight: 400, ml: 0.5 }}>
            ({playedCount})
          </Box>
        </Typography>
        <Typography
          sx={{
            color: total < 0 ? '#c62828' : total > 0 ? '#28a745' : '#666',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          {formatCurrency(total)}
        </Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        <TextField
          size="small"
          placeholder={filterPlaceholder(betTypeCode)}
          value={filter}
          onChange={onFilterChange}
          inputProps={{ inputMode: 'numeric', maxLength: maxDigits, style: { fontFamily: 'monospace', textAlign: 'center' } }}
          sx={{ width: 130, '& .MuiInputBase-root': { height: 28, fontSize: '13px' } }}
        />
      </Box>

      {/* Subtle column-label strip — small caps, no bg, light gray */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(130px, 1fr))`,
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
              MONTO
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Heatmap grid — borderless cards separated by gap, color by amount intensity */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(130px, 1fr))`,
          gap: '6px',
          p: '6px',
          borderRadius: 1.5,
          bgcolor: '#f1f5f9',
          width: 'fit-content',
        }}
      >
        {/* Render column-major: each row of the visible grid pulls cell[ri] from each column */}
        {Array.from({ length: rowsCount }).flatMap((_, ri) =>
          colData.map((col, ci) => {
            const cell = col[ri]
            if (!cell) return null
            const { bg, numColor, amtColor } = styleFor(cell.amount)
            const matches = !filterDigits || cell.number.startsWith(filterDigits)
            const hoverable = cell.amount > 0
            const cellKey = `${ri}-${ci}-${cell.number}`
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
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 1,
                  bgcolor: bg,
                  cursor: hoverable ? 'pointer' : 'default',
                  opacity: matches ? 1 : 0.25,
                  boxShadow: hoverable ? '0 1px 2px rgba(15, 23, 42, 0.06)' : 'none',
                  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                  '&:hover': hoverable
                    ? { transform: 'translateY(-1px)', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.18)' }
                    : undefined,
                }}
              >
                <Typography sx={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: numColor,
                  letterSpacing: 0.5,
                }}>
                  {cell.number}
                </Typography>
                <Typography sx={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: amtColor,
                }}>
                  {cell.amount > 0 ? cell.amount.toLocaleString('es-DO', { maximumFractionDigits: 0 }) : 0}
                </Typography>
              </Box>
            )
          })
        )}
      </Box>
    </Box>
  )
}

const CombinationSection: React.FC<{
  name: string
  betTypeCode: string
  rows: PlayByNumberRow[]
  grandTotal: number
}> = ({ name, betTypeCode, rows, grandTotal }) => {
  const hover = React.useContext(HoverCtx)
  const [filter, setFilter] = useState<string>('')
  const maxDigits = expectedDigits(betTypeCode) || 6

  const sorted = useMemo(() => [...rows].sort((a, b) => b.totalAmount - a.totalAmount), [rows])
  const filterDigits = filter.replace(/\D/g, '')
  const visible = useMemo(
    () => (filterDigits ? sorted.filter(r => r.betNumber.startsWith(filterDigits)) : sorted),
    [sorted, filterDigits]
  )

  const total = sorted.reduce((s, r) => s + r.totalAmount, 0)
  const lineCount = sorted.reduce((s, r) => s + r.lineCount, 0)
  const pct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0

  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, maxDigits)
    setFilter(digits)
  }

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
        <Typography
          sx={{
            color: total < 0 ? '#c62828' : total > 0 ? '#28a745' : '#666',
            fontWeight: 600,
            fontSize: '15px',
          }}
        >
          {formatCurrency(total)}
        </Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        <TextField
          size="small"
          placeholder={filterPlaceholder(betTypeCode)}
          value={filter}
          onChange={onFilterChange}
          inputProps={{ inputMode: 'numeric', maxLength: maxDigits, style: { fontFamily: 'monospace', textAlign: 'center' } }}
          sx={{ width: 130, '& .MuiInputBase-root': { height: 28, fontSize: '13px' } }}
        />
      </Box>

      {/* Subtle column-label strip */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, px: 1.5, pb: '2px', minWidth: 260 }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>
          N° <Box component="span" sx={{ color: '#cbd5e1', fontWeight: 400 }}>({lineCount})</Box>
        </Typography>
        <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>
          MONTO
        </Typography>
      </Box>

      {/* Heatmap card list — same visual language as single-number grid */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          p: '6px',
          borderRadius: 1.5,
          bgcolor: '#f1f5f9',
          minWidth: 260,
          maxHeight: 520,
          overflowY: 'auto',
        }}
      >
        {visible.length === 0 && (
          <Box sx={{ px: 1.5, py: 1, color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
            Sin coincidencias
          </Box>
        )}
        {visible.map((r) => {
          const ratio = sorted[0] ? r.totalAmount / sorted[0].totalAmount : 0
          const cardStyle =
            ratio > 0.66 ? { bg: '#fee2e2', numColor: '#7f1d1d', amtColor: '#b91c1c' }
            : ratio > 0.33 ? { bg: '#fef3c7', numColor: '#78350f', amtColor: '#b45309' }
            : { bg: '#dbeafe', numColor: '#1e3a8a', amtColor: '#1d4ed8' }
          return (
            <Box
              key={r.betNumber}
              onMouseEnter={(e) => hover?.show(e.currentTarget as HTMLElement, betTypeCode, r.betNumber)}
              onMouseLeave={() => hover?.hide()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                px: 1.5,
                py: 0.7,
                borderRadius: 1,
                bgcolor: cardStyle.bg,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.18)' },
              }}
            >
              <Typography sx={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: cardStyle.numColor, letterSpacing: 0.5 }}>
                {formatBetNumber(betTypeCode, r.betNumber)}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 600, color: cardStyle.amtColor }}>
                {r.totalAmount.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

const Blackboard: React.FC = () => {
  const [date, setDate] = useState<string>(getTodayDate())
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([])
  const [draws, setDraws] = useState<Draw[]>([])
  const [selectedDrawId, setSelectedDrawId] = useState<number | null>(null)
  const [bancas, setBancas] = useState<BettingPool[]>([])
  const [selectedBanca, setSelectedBanca] = useState<BettingPool | null>(null)

  const [rows, setRows] = useState<PlayByNumberRow[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Hover popover state for per-banca breakdown
  const [hoverState, setHoverState] = useState<{
    anchor: HTMLElement | null
    betTypeCode: string
    betNumber: string
    loading: boolean
    rows: PlayByNumberDetailRow[]
    error: string | null
  }>({ anchor: null, betTypeCode: '', betNumber: '', loading: false, rows: [], error: null })

  const hoverShowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastFetchKey = useRef<string>('')

  // Load zones & draws on mount
  useEffect(() => {
    (async () => {
      try {
        const zRes = (await getActiveZones()) as { data?: Zone[]; items?: Zone[] }
        const zList = (zRes?.data ?? zRes?.items ?? []) as Zone[]
        setZones(zList)
      } catch (e) {
        console.error('Error loading zones:', e)
      }
      try {
        const dRes = (await getAllDraws({ pageSize: 200 })) as { data?: Draw[]; items?: Draw[] }
        const dList = (dRes?.data ?? dRes?.items ?? []) as Draw[]
        setDraws(dList)
      } catch (e) {
        console.error('Error loading draws:', e)
      }
    })()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const pageSize = 100
        const all: BettingPool[] = []
        let page = 1
        while (true) {
          const resp = (await api.get(`/betting-pools?page=${page}&pageSize=${pageSize}`)) as
            | { items?: BettingPool[]; totalCount?: number }
            | BettingPool[]
          const items = Array.isArray(resp) ? resp : resp?.items ?? []
          all.push(...items)
          if (Array.isArray(resp)) break
          if (items.length < pageSize) break
          if (typeof resp.totalCount === 'number' && all.length >= resp.totalCount) break
          page += 1
        }
        if (!cancelled) setBancas(all)
      } catch (e) {
        console.error('Error loading bancas:', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredBancas = useMemo(() => {
    if (selectedZoneIds.length === 0) return bancas
    return bancas.filter((b) => b.zoneId !== undefined && selectedZoneIds.includes(b.zoneId))
  }, [bancas, selectedZoneIds])

  useEffect(() => {
    if (selectedBanca && selectedZoneIds.length > 0 && !filteredBancas.some(b => b.bettingPoolId === selectedBanca.bettingPoolId)) {
      setSelectedBanca(null)
    }
  }, [selectedZoneIds, filteredBancas, selectedBanca])

  const fetchData = useCallback(async () => {
    if (!selectedDrawId) {
      setRows([])
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getPlaysByNumber({
        date,
        drawId: selectedDrawId,
        zoneIds: selectedZoneIds.length > 0 ? selectedZoneIds : null,
        bettingPoolId: selectedBanca?.bettingPoolId ?? null,
      })
      setRows(data)
    } catch (e) {
      console.error(e)
      setError('Error al cargar la pizarra')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [date, selectedDrawId, selectedZoneIds, selectedBanca])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const grouped = useMemo(() => {
    const m = new Map<string, { betTypeName: string; rows: PlayByNumberRow[] }>()
    for (const r of rows) {
      const e = m.get(r.betTypeCode) ?? { betTypeName: r.betTypeName, rows: [] }
      e.rows.push(r)
      m.set(r.betTypeCode, e)
    }
    return m
  }, [rows])

  const grandTotal = useMemo(() => rows.reduce((s, r) => s + r.totalAmount, 0), [rows])

  // Display order: Directo, Pale, Tripleta, Super Pale, Cash3 (all variants),
  // Play4, Pick5, then Pick2 variants, Bolita, Singulación.
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
  ]
  const orderIndex = (code: string): number => {
    const idx = ORDER.indexOf(code)
    return idx === -1 ? ORDER.length : idx
  }

  const allGroups: { code: string; name: string; rows: PlayByNumberRow[] }[] = []
  grouped.forEach((value, code) => {
    allGroups.push({ code, name: value.betTypeName, rows: value.rows })
  })
  allGroups.sort((a, b) => {
    const ai = orderIndex(a.code)
    const bi = orderIndex(b.code)
    if (ai !== bi) return ai - bi
    return a.code.localeCompare(b.code)
  })

  const drawLabel = useMemo(() => {
    if (!selectedDrawId) return null
    return draws.find(d => d.drawId === selectedDrawId)?.drawName ?? null
  }, [selectedDrawId, draws])

  // ----- Hover popover handlers -----
  const showDetail = useCallback((anchor: HTMLElement, betTypeCode: string, betNumber: string) => {
    if (hoverHideTimer.current) {
      clearTimeout(hoverHideTimer.current)
      hoverHideTimer.current = null
    }
    if (hoverShowTimer.current) {
      clearTimeout(hoverShowTimer.current)
    }
    hoverShowTimer.current = setTimeout(async () => {
      // Snapshot filters at fire time
      const fetchKey = `${betTypeCode}|${betNumber}|${date}|${selectedDrawId ?? ''}|${selectedZoneIds.join(',')}|${selectedBanca?.bettingPoolId ?? ''}`
      lastFetchKey.current = fetchKey
      setHoverState({ anchor, betTypeCode, betNumber, loading: true, rows: [], error: null })
      try {
        const data = await getPlaysByNumberDetail({
          date,
          drawId: selectedDrawId,
          zoneIds: selectedZoneIds.length > 0 ? selectedZoneIds : null,
          bettingPoolId: selectedBanca?.bettingPoolId ?? null,
          betTypeCode,
          betNumber,
        })
        if (lastFetchKey.current !== fetchKey) return
        setHoverState({ anchor, betTypeCode, betNumber, loading: false, rows: data, error: null })
      } catch (e) {
        if (lastFetchKey.current !== fetchKey) return
        console.error(e)
        setHoverState({ anchor, betTypeCode, betNumber, loading: false, rows: [], error: 'Error al cargar' })
      }
    }, 200)
  }, [date, selectedDrawId, selectedZoneIds, selectedBanca])

  const hideDetail = useCallback(() => {
    if (hoverShowTimer.current) {
      clearTimeout(hoverShowTimer.current)
      hoverShowTimer.current = null
    }
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current)
    hoverHideTimer.current = setTimeout(() => {
      setHoverState(s => ({ ...s, anchor: null }))
    }, 100)
  }, [])

  const hoverCtxValue = useMemo<HoverDetailContext>(() => ({ show: showDetail, hide: hideDetail }), [showDetail, hideDetail])

  return (
   <HoverCtx.Provider value={hoverCtxValue}>
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Filters */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
          <TextField
            type="date"
            label="Fecha"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            size="small"
            label="Sorteo"
            value={selectedDrawId ?? ''}
            onChange={(e) => setSelectedDrawId(e.target.value ? Number(e.target.value) : null)}
          >
            <MenuItem value="">Todos</MenuItem>
            {draws.map(d => (
              <MenuItem key={d.drawId} value={d.drawId}>{d.drawName}</MenuItem>
            ))}
          </TextField>
          <Autocomplete<Zone, true>
            multiple
            size="small"
            options={zones}
            value={zones.filter(z => selectedZoneIds.includes(z.zoneId))}
            onChange={(_, vals) => setSelectedZoneIds(vals.map(v => v.zoneId))}
            getOptionLabel={(z) => z.zoneName}
            isOptionEqualToValue={(a, b) => a.zoneId === b.zoneId}
            renderInput={(params) => <TextField {...params} label="Zonas" placeholder="Todas" />}
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
            getOptionLabel={(b) => b.bettingPoolCode ? `${b.bettingPoolCode} — ${b.bettingPoolName}` : b.bettingPoolName}
            isOptionEqualToValue={(a, b) => a.bettingPoolId === b.bettingPoolId}
            renderInput={(params) => <TextField {...params} label="Banca" placeholder="Todas" />}
          />
        </Box>

        {/* Big total header — only when a draw is selected */}
        {selectedDrawId && (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography sx={{ fontSize: '22px', fontWeight: 500, fontFamily: 'Montserrat, sans-serif', color: '#2c2c2c' }}>
              Total para sorteo <b>{drawLabel}</b>:{' '}
              <Box
                component="span"
                sx={{
                  color: grandTotal < 0 ? '#c62828' : grandTotal > 0 ? '#28a745' : '#666',
                  fontWeight: 700,
                }}
              >
                {formatCurrency(grandTotal)}
              </Box>
            </Typography>
          </Box>
        )}

        {!selectedDrawId && (
          <Typography sx={{ textAlign: 'center', color: '#888', py: 6, fontSize: '15px' }}>
            Selecciona un <b>sorteo</b> para ver la pizarra.
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
            No hay jugadas registradas para los filtros seleccionados.
          </Typography>
        )}

        {selectedDrawId && !loading && !error && rows.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
            {allGroups.map(({ code, name, rows: groupRows }) =>
              SINGLE_NUMBER_BET_TYPES.has(code) ? (
                <SingleNumberSection key={code} name={name} betTypeCode={code} rows={groupRows} />
              ) : (
                <CombinationSection
                  key={code}
                  name={name}
                  betTypeCode={code}
                  rows={groupRows}
                  grandTotal={grandTotal}
                />
              )
            )}
          </Box>
        )}
      </Paper>
    </Box>

    {/* Per-banca breakdown popover */}
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
            sx={{
              p: 1.5,
              minWidth: 280,
              maxWidth: 360,
              maxHeight: 400,
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
              {hoverState.betTypeCode} · <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#2c2c2c' }}>{formatBetNumber(hoverState.betTypeCode, hoverState.betNumber)}</Box>
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
                Sin coincidencias
              </Typography>
            )}
            {!hoverState.loading && !hoverState.error && hoverState.rows.length > 0 && (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.5, color: '#1976d2', letterSpacing: 0.3 }}>BANCA</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.5, color: '#1976d2', letterSpacing: 0.3 }}>REFERENCIA</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.5, color: '#1976d2', letterSpacing: 0.3 }} align="right">IMPORTE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hoverState.rows.map((r, idx) => (
                    <TableRow
                      key={r.bettingPoolId}
                      sx={{
                        bgcolor: idx % 2 === 1 ? '#f9fbfd' : 'transparent',
                        '&:hover': { bgcolor: '#e3f2fd' },
                      }}
                    >
                      <TableCell sx={{ fontSize: '12px', py: 0.5, fontFamily: 'monospace' }}>
                        {r.bettingPoolCode || r.bettingPoolName}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', py: 0.5, color: '#666' }}>
                        {r.reference || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', py: 0.5, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                        {r.totalAmount.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
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
  )
}

export default Blackboard
