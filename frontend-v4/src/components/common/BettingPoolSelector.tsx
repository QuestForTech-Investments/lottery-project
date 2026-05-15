import { useState, useEffect } from 'react'
import { Autocomplete, TextField, CircularProgress } from '@mui/material'
import { getBettingPools } from '@/services/bettingPoolService'
import * as logger from '@/utils/logger'

type BettingPoolId = number | string

export interface BettingPool {
  id: BettingPoolId
  name?: string
  code?: string
  [key: string]: unknown
}

interface BettingPoolSelectorProps {
  value?: BettingPoolId | null
  onChange: (value: BettingPoolId | null) => void
  selectedZoneIds?: BettingPoolId[]
  placeholder?: string
  required?: boolean
}

type RawBetingPool = {
  id?: BettingPoolId
  bettingPoolId?: BettingPoolId
  name?: string
  bettingPoolName?: string
  code?: string
  bettingPoolCode?: string
  branchCode?: string
  [key: string]: unknown
}

type BettingPoolResponse = {
  items?: RawBetingPool[]
  data?: RawBetingPool[]
  bettingPools?: RawBetingPool[]
  [key: string]: unknown
}

/**
 * Normalize a raw API banca row into the shape the selector expects.
 * The list endpoint returns `bettingPoolId` / `bettingPoolName` etc.; older callers
 * used `id` / `name`. Map both into `id` / `name` so the autocomplete renders.
 */
const normalize = (row: RawBetingPool): BettingPool | null => {
  const id = row.id ?? row.bettingPoolId
  if (id == null) return null
  return {
    id,
    name: row.name ?? row.bettingPoolName,
    code: row.code ?? row.bettingPoolCode ?? row.branchCode,
  }
}

const extractBettingPools = (response: unknown): BettingPool[] => {
  const arr: RawBetingPool[] = (() => {
    if (Array.isArray(response)) return response as RawBetingPool[]
    if (response && typeof response === 'object') {
      const typed = response as BettingPoolResponse
      if (Array.isArray(typed.items)) return typed.items
      if (Array.isArray(typed.data)) return typed.data
      if (Array.isArray(typed.bettingPools)) return typed.bettingPools
    }
    return []
  })()

  return arr
    .map(normalize)
    .filter((b): b is BettingPool => b !== null)
}

/**
 * BettingPoolSelector Component
 * Material-UI single-select component for bettingPool (banca) selection
 * Filters bettingPools based on selected zone IDs
 *
 * @param {number|string} value - Selected bettingPool ID
 * @param {Function} onChange - Callback function when selection changes
 * @param {Array} selectedZoneIds - Array of selected zone IDs to filter bettingPools
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether the field is required
 */
const BettingPoolSelector = ({
  value = null,
  onChange,
  selectedZoneIds = [],
  placeholder = 'Seleccionar...',
  required = false,
}: BettingPoolSelectorProps) => {
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load bettingPools when selected zones change
  useEffect(() => {
    const loadBettingPools = async () => {
      try {
        setLoading(true)
        setError(null)

        // No zone filter → load all active bancas. POS users can be assigned a banca
        // without first picking a zone.
        const responses = !selectedZoneIds || selectedZoneIds.length === 0
          ? [await getBettingPools({ isActive: true, pageSize: 500 })]
          : await Promise.all(selectedZoneIds.map((zoneId) => getBettingPools({ zoneId, isActive: true })))

        // Combine all bettingPools from different zones
        const allBettingPools = responses.reduce<BettingPool[]>((acc, response) => {
          return [...acc, ...extractBettingPools(response)]
        }, [])

        // Remove duplicates based on bettingPool ID
        const uniqueBettingPools = Array.from(
          new Map(allBettingPools.map((bettingPool) => [bettingPool.id, bettingPool])).values(),
        )

        setBettingPools(uniqueBettingPools)
        logger.debug('BETTING_POOL_SELECTOR', 'Betting pools loaded successfully', {
          count: uniqueBettingPools.length,
        })

        // Clear selection if the currently selected bettingPool is not in the new list
        if (value !== null && !uniqueBettingPools.find((b) => b.id === value)) {
          onChange(null)
        }
      } catch (err) {
        logger.error('BETTING_POOL_SELECTOR', 'Error loading betting pools', err)
        setError('Error al cargar betting pools')
        setBettingPools([])
      } finally {
        setLoading(false)
      }
    }

    void loadBettingPools()
  }, [selectedZoneIds, value, onChange])

  // Find the selected bettingPool object
  const selectedBettingPool = bettingPools.find((bettingPool) => bettingPool.id === value) || null

  // Handle selection change
  const handleChange = (_event: React.SyntheticEvent<Element, Event>, newValue: BettingPool | null) => {
    onChange(newValue ? newValue.id : null)
  }

  return (
    <Autocomplete
      id="bettingPool-selector"
      disablePortal
      options={bettingPools}
      value={selectedBettingPool}
      onChange={handleChange}
      loading={loading}
      disabled={loading || !!error}
      getOptionLabel={(option) => option?.name?.toString() || option?.code?.toString() || ''}
      isOptionEqualToValue={(option, optionValue) => option.id === optionValue.id}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          error={!!error}
          helperText={error || ''}
          required={required && !selectedBettingPool}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={loading ? 'Cargando...' : 'No hay bancas disponibles'}
    />
  )
}

export default BettingPoolSelector
