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

type BettingPoolResponse = {
  data?: BettingPool[]
  bettingPools?: BettingPool[]
  [key: string]: unknown
}

const extractBettingPools = (response: unknown): BettingPool[] => {
  if (Array.isArray(response)) {
    return response as BettingPool[]
  }

  if (response && typeof response === 'object') {
    const typedResponse = response as BettingPoolResponse
    if (Array.isArray(typedResponse.data)) {
      return typedResponse.data
    }
    if (Array.isArray(typedResponse.bettingPools)) {
      return typedResponse.bettingPools
    }
  }

  return []
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
      // Only load if there are selected zones
      if (!selectedZoneIds || selectedZoneIds.length === 0) {
        setBettingPools([])
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch bettingPools for each selected zone
        const bettingPoolPromises = selectedZoneIds.map((zoneId) => getBettingPools({ zoneId, isActive: true }))

        const responses = await Promise.all(bettingPoolPromises)

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
      disabled={loading || !!error || selectedZoneIds.length === 0}
      getOptionLabel={(option) => option?.name?.toString() || option?.code?.toString() || ''}
      isOptionEqualToValue={(option, optionValue) => option.id === optionValue.id}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          error={!!error}
          helperText={error || (selectedZoneIds.length === 0 ? 'Selecciona zonas primero' : '')}
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
      noOptionsText={
        loading
          ? 'Cargando...'
          : selectedZoneIds.length === 0
          ? 'Selecciona zonas primero'
          : 'No hay betting pools disponibles'
      }
    />
  )
}

export default BettingPoolSelector
