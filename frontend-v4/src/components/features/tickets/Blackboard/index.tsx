import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
} from '@mui/material'
import { getTodayDate } from '@/utils/formatters'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  getPlaysByNumber,
  SINGLE_NUMBER_BET_TYPES,
  formatBetNumber,
  filterPlaceholder,
  expectedDigits,
  type PlayByNumberRow,
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

const SingleNumberSection: React.FC<{ name: string; betTypeCode: string; rows: PlayByNumberRow[] }> = ({ name, betTypeCode, rows }) => {
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

  // 5 columns × 20 rows row-major:
  // row 0: 00..04 — row 1: 05..09 — ... — row 19: 95..99
  const columns = 5
  const rowsCount = 20
  const grid: NumberCellData[][] = []
  for (let r = 0; r < rowsCount; r++) {
    grid.push(cells.slice(r * columns, r * columns + columns))
  }

  const colorFor = (amount: number): { bg: string; color: string } => {
    if (amount <= 0) return { bg: '#eeeeee', color: '#9e9e9e' }
    if (maxAmount > 0 && amount >= maxAmount * 0.5) return { bg: '#fee2e2', color: '#b91c1c' }
    return { bg: 'transparent', color: '#2c2c2c' }
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
        <Typography sx={{ color: '#c62828', fontWeight: 600, fontSize: '13px' }}>
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

      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', display: 'block', width: 'fit-content' }}>
        {/* Header row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, bgcolor: '#f5f5f5' }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Box
              key={i}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                px: 1,
                py: 0.6,
                borderRight: i < columns - 1 ? '1px solid #e0e0e0' : 'none',
                minWidth: 100,
              }}
            >
              <Typography sx={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#2c2c2c',
                letterSpacing: 0.3,
                borderRight: '1px solid #e0e0e0',
                pr: 1,
              }}>
                JUGADA
              </Typography>
              <Typography sx={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#2c2c2c',
                textAlign: 'right',
                letterSpacing: 0.3,
                pl: 1,
              }}>
                IMPORTE
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Body — 5 columns × 20 rows row-major */}
        {grid.map((row, ri) => (
          <Box
            key={ri}
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              borderTop: '1px solid #f0f0f0',
            }}
          >
            {row.map((cell, ci) => {
              const { bg, color } = colorFor(cell.amount)
              const matches = !filterDigits || cell.number.startsWith(filterDigits)
              return (
                <Box
                  key={cell.number}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    px: 1,
                    py: 0.45,
                    bgcolor: bg,
                    borderRight: ci < columns - 1 ? '1px solid #f0f0f0' : 'none',
                    opacity: matches ? 1 : 0.25,
                  }}
                >
                  <Typography sx={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color,
                    lineHeight: 1.4,
                    borderRight: '1px solid #e8e8e8',
                    pr: 1,
                  }}>
                    {cell.number}
                  </Typography>
                  <Typography sx={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    textAlign: 'right',
                    color,
                    lineHeight: 1.4,
                    pl: 1,
                  }}>
                    {cell.amount > 0 ? cell.amount.toLocaleString('es-DO', { maximumFractionDigits: 0 }) : 0}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        ))}
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
        <Typography sx={{ color: '#c62828', fontWeight: 600, fontSize: '15px' }}>
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

      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', minWidth: 240, display: 'block' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', bgcolor: '#f5f5f5', px: 1, py: 0.4 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#2c2c2c', letterSpacing: 0.3 }}>
            JUGADA <Box component="span" sx={{ color: '#888', fontWeight: 400 }}>({lineCount})</Box>
          </Typography>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#2c2c2c', textAlign: 'right', letterSpacing: 0.3 }}>
            IMPORTE
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 480, overflowY: 'auto' }}>
          {visible.length === 0 && (
            <Box sx={{ px: 1.5, py: 1, color: '#999', fontSize: '12px', textAlign: 'center' }}>
              Sin coincidencias
            </Box>
          )}
          {visible.map((r) => (
            <Box
              key={r.betNumber}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                px: 1.5,
                py: 0.5,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Typography sx={{ fontFamily: 'monospace', fontSize: '13px', color: '#2c2c2c' }}>
                {formatBetNumber(betTypeCode, r.betNumber)}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '13px', textAlign: 'right', color: '#2c2c2c' }}>
                {r.totalAmount.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
              </Typography>
            </Box>
          ))}
        </Box>
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

  return (
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

        {/* Big total header */}
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <Typography sx={{ fontSize: '22px', fontWeight: 500, fontFamily: 'Montserrat, sans-serif', color: '#2c2c2c' }}>
            {drawLabel ? <>Total para sorteo <b>{drawLabel}</b>: </> : 'Total general: '}
            <Box component="span" sx={{ color: '#c62828', fontWeight: 700 }}>
              {formatCurrency(grandTotal)}
            </Box>
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#51cbce' }} />
          </Box>
        )}

        {error && (
          <Typography sx={{ color: '#c62828', mb: 2 }}>{error}</Typography>
        )}

        {!loading && !error && rows.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: '#888', py: 4 }}>
            No hay jugadas registradas para los filtros seleccionados.
          </Typography>
        )}

        {!loading && !error && rows.length > 0 && (
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
  )
}

export default Blackboard
