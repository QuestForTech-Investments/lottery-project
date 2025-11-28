/**
 * SchedulesTab Component
 * Contains lottery draw schedules for each day of the week
 * TypeScript version with custom TimePicker dropdown
 */

import React, { useState } from 'react'
import {
  Grid,
  TextField,
  Typography,
  Box,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { AccessTime as ClockIcon } from '@mui/icons-material'
import TimePickerMUI from '@/components/common/TimePickerMUI'
import type { BettingPoolFormData } from '../hooks/useCreateBettingPoolForm'

interface SchedulesTabProps {
  formData: BettingPoolFormData
  handleChange: (e: any) => void
}

interface DayConfig {
  key: string
  label: string
}

const SchedulesTab: React.FC<SchedulesTabProps> = ({ formData, handleChange }) => {
  const [activeTimePicker, setActiveTimePicker] = useState<string | null>(null)
  const [timePickerAnchor, setTimePickerAnchor] = useState<HTMLElement | null>(null)

  const days: DayConfig[] = [
    { key: 'domingo', label: 'Domingo' },
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
  ]

  const openTimePicker = (fieldName: string, event: React.MouseEvent<HTMLDivElement>) => {
    setTimePickerAnchor(event.currentTarget)
    setActiveTimePicker(fieldName)
  }

  const closeTimePicker = () => {
    setActiveTimePicker(null)
    setTimePickerAnchor(null)
  }

  const handleTimeChange = (fieldName: string, newValue: string) => {
    // Create a synthetic event that mimics the TextField onChange
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: newValue,
      },
    } as any
    handleChange(syntheticEvent)
  }

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <Typography variant="h6" gutterBottom>
        Horarios de Sorteos
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configura los horarios de apertura y cierre para los sorteos de cada día de la semana
      </Typography>

      <Grid container spacing={3}>
        {days.map((day, index) => (
          <React.Fragment key={day.key}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle1" sx={{ minWidth: 100 }}>
                  {day.label}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hora de Inicio"
                name={`${day.key}Inicio`}
                value={(formData[`${day.key}Inicio` as keyof BettingPoolFormData] as string) || ''}
                onClick={(e) => openTimePicker(`${day.key}Inicio`, e)}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" size="small">
                        <ClockIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ cursor: 'pointer' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hora de Fin"
                name={`${day.key}Fin`}
                value={(formData[`${day.key}Fin` as keyof BettingPoolFormData] as string) || ''}
                onClick={(e) => openTimePicker(`${day.key}Fin`, e)}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" size="small">
                        <ClockIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ cursor: 'pointer' }}
              />
            </Grid>

            {index < days.length - 1 && (
              <Grid item xs={12}>
                <Divider />
              </Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>

      {/* TimePicker Dropdown */}
      {activeTimePicker && timePickerAnchor && (
        <TimePickerMUI
          value={(formData[activeTimePicker as keyof BettingPoolFormData] as string) || ''}
          onChange={(newValue) => {
            handleTimeChange(activeTimePicker, newValue)
          }}
          onClose={closeTimePicker}
          anchorEl={timePickerAnchor}
        />
      )}
    </Box>
  )
}

/**
 * Custom comparison function for SchedulesTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: SchedulesTabProps, nextProps: SchedulesTabProps) => {
  // Check if handleChange changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false
  }

  // Check schedule fields for all days
  const scheduleFields: (keyof BettingPoolFormData)[] = [
    'domingoInicio',
    'domingoFin',
    'lunesInicio',
    'lunesFin',
    'martesInicio',
    'martesFin',
    'miercolesInicio',
    'miercolesFin',
    'juevesInicio',
    'juevesFin',
    'viernesInicio',
    'viernesFin',
    'sabadoInicio',
    'sabadoFin',
  ]

  for (const field of scheduleFields) {
    if (prevProps.formData[field] !== nextProps.formData[field]) {
      return false
    }
  }

  // No relevant changes, skip re-render
  return true
}

export default React.memo(SchedulesTab, arePropsEqual)
