/**
 * GeneralTab Component
 * Contains basic information fields for creating a betting pool
 * TypeScript version matching V2 layout EXACTLY
 */

import React from 'react'
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material'
import type { Zone } from '@/types/zone'
import type { BettingPoolFormData, FormErrors } from '../hooks/useCreateBettingPoolForm'

interface GeneralTabProps {
  formData: BettingPoolFormData
  errors: FormErrors
  zones: Zone[]
  loadingZones: boolean
  handleChange: (e: any) => void
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  formData,
  errors,
  zones,
  loadingZones,
  handleChange,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Información General
      </Typography>

      <Grid container spacing={3}>
        {/* Branch Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Nombre de la Banca"
            name="bettingPoolName"
            value={formData.bettingPoolName}
            onChange={handleChange}
            error={!!errors.bettingPoolName}
            helperText={errors.bettingPoolName}
          />
        </Grid>

        {/* Branch Code */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Código de la Banca"
            name="bettingPoolCode"
            value={formData.bettingPoolCode}
            onChange={handleChange}
            error={!!errors.bettingPoolCode}
            helperText={errors.bettingPoolCode || 'Generado automáticamente'}
          />
        </Grid>

        {/* Zone */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.zoneId}>
            <InputLabel>Zona</InputLabel>
            <Select
              name="zoneId"
              value={formData.zoneId || ''}
              label="Zona"
              onChange={handleChange}
              disabled={loadingZones}
            >
              <MenuItem value="" disabled>
                <em>Seleccione una zona</em>
              </MenuItem>
              {zones.map((zone) => (
                <MenuItem key={zone.zoneId} value={zone.zoneId}>
                  {zone.zoneName}
                </MenuItem>
              ))}
            </Select>
            {errors.zoneId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.zoneId}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Location */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ubicación"
            name="location"
            value={formData.location}
            onChange={handleChange}
            helperText="Ubicación física de la banca"
          />
        </Grid>

        {/* Reference */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Referencia"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            helperText="Referencia o información adicional"
          />
        </Grid>

        {/* Comment */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comentarios"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            helperText="Notas o comentarios adicionales"
          />
        </Grid>
      </Grid>
    </Box>
  )
}

/**
 * Custom comparison function for GeneralTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: GeneralTabProps, nextProps: GeneralTabProps) => {
  // Check if zones or loadingZones changed
  if (prevProps.zones !== nextProps.zones || prevProps.loadingZones !== nextProps.loadingZones) {
    return false
  }

  // Check if handleChange changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false
  }

  // Check only the form fields this tab uses
  const generalFields: (keyof BettingPoolFormData)[] = [
    'bettingPoolName',
    'bettingPoolCode',
    'zoneId',
    'location',
    'reference',
    'comment',
  ]

  for (const field of generalFields) {
    if (prevProps.formData[field] !== nextProps.formData[field]) {
      return false
    }
    if (prevProps.errors[field] !== nextProps.errors[field]) {
      return false
    }
  }

  // No relevant changes, skip re-render
  return true
}

export default React.memo(GeneralTab, arePropsEqual)
