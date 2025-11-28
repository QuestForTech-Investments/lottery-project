import { useState, useEffect } from 'react'
import { Autocomplete, TextField, Chip, CircularProgress } from '@mui/material'
import { getAllZones } from '@/services/zoneService'
import * as logger from '@/utils/logger'

interface Zone {
  zoneId: number | string
  zoneName?: string
  [key: string]: unknown
}

interface ReactMultiselectProps {
  value?: Array<number | string>
  onChange: (zoneIds: Array<number | string>) => void
  placeholder?: string
  required?: boolean
}

/**
 * ReactMultiselect Component
 * Material-UI multi-select component for zones selection
 *
 * @param {Array} value - Array of selected zone IDs
 * @param {Function} onChange - Callback function when selection changes
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether the field is required
 */
const ReactMultiselect = ({
  value = [],
  onChange,
  placeholder = 'Seleccionar...',
  required = false,
}: ReactMultiselectProps) => {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load zones on component mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getAllZones({ isActive: true, pageSize: 1000 })

        console.log('[INFO] V2 ZONES API Response:', response)

        // Handle different response structures
        const zonesData = (response as { data?: Zone[] }).data ?? (response as Zone[])
        console.log('[INFO] V2 Zones data:', zonesData)
        setZones(Array.isArray(zonesData) ? zonesData : [])

        logger.debug('REACT_MULTISELECT', 'Zones loaded successfully', {
          count: Array.isArray(zonesData) ? zonesData.length : 0,
        })
      } catch (err) {
        console.error('[ERROR] V2 Error loading zones:', err)
        logger.error('REACT_MULTISELECT', 'Error loading zones', err)
        setError('Error al cargar zonas')
        setZones([])
      } finally {
        setLoading(false)
      }
    }

    void loadZones()
  }, [])

  // Convert value (array of IDs) to zone objects
  const selectedZones = zones.filter((zone) => value.includes(zone.zoneId))

  // Handle selection change
  const handleChange = (_event: unknown, newValue: Zone[]) => {
    // Convert zone objects to array of IDs
    const newIds = newValue.map((zone) => zone.zoneId)
    onChange(newIds)
  }

  return (
    <Autocomplete
      multiple
      id="zones-multiselect"
      options={zones}
      value={selectedZones}
      onChange={handleChange}
      loading={loading}
      disabled={loading || !!error}
      getOptionLabel={(option) => option.zoneName || ''}
      isOptionEqualToValue={(option, optionValue) => option.zoneId === optionValue.zoneId}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={selectedZones.length === 0 ? placeholder : ''}
          error={!!error}
          helperText={error}
          required={required && selectedZones.length === 0}
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
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.zoneName}
            {...getTagProps({ index })}
            key={option.zoneId}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))
      }
      noOptionsText={loading ? 'Cargando...' : 'No hay zonas disponibles'}
      sx={{
        '& .MuiOutlinedInput-root': {
          padding: '4px',
        },
      }}
    />
  )
}

export default ReactMultiselect
