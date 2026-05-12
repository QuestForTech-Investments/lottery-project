import { useState, useEffect } from 'react'
import { Autocomplete, TextField, Chip, CircularProgress, Checkbox, Box } from '@mui/material'
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

        // Handle different response structures
        const zonesData = (response as { data?: Zone[] }).data ?? (response as Zone[])
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

  // Synthetic "TODAS" option injected at the top of the list.
  // Selecting it toggles between all-selected and cleared.
  const ALL_ID = -1
  const ALL_OPTION: Zone = { zoneId: ALL_ID, zoneName: 'TODAS' }

  // Convert value (array of IDs) to zone objects
  const selectedZones = zones.filter((zone) => value.includes(zone.zoneId))
  const allSelected = zones.length > 0 && selectedZones.length === zones.length

  const options: Zone[] = zones.length > 0 ? [ALL_OPTION, ...zones] : zones

  // Handle selection change
  const handleChange = (_event: unknown, newValue: Zone[]) => {
    if (newValue.some((z) => z.zoneId === ALL_ID)) {
      onChange(allSelected ? [] : zones.map((z) => z.zoneId))
      return
    }
    onChange(newValue.map((zone) => zone.zoneId))
  }

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      id="zones-multiselect"
      options={options}
      value={selectedZones}
      onChange={handleChange}
      renderOption={(props, option, { selected }) => {
        const isAll = option.zoneId === ALL_ID
        const checked = isAll ? allSelected : selected
        const indeterminate = isAll && !allSelected && selectedZones.length > 0
        return (
          <Box component="li" {...props} key={option.zoneId} sx={isAll ? { fontWeight: 600 } : undefined}>
            <Checkbox
              size="small"
              checked={checked}
              indeterminate={indeterminate}
              sx={{ mr: 1, p: 0.5 }}
            />
            {option.zoneName}
          </Box>
        )
      }}
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
