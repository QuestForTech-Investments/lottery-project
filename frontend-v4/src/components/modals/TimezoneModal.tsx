import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  Typography,
  Box,
  IconButton,
} from '@mui/material'
import { Close, Schedule } from '@mui/icons-material'
import { useTimezone, getAllTimezones } from '@hooks/useTimezone'

interface TimezoneModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TimezoneModal({ isOpen, onClose }: TimezoneModalProps) {
  const { timezone, setTimezone, getCurrentTime } = useTimezone()
  const [selectedTimezone, setSelectedTimezone] = useState(timezone)
  const [currentTimePreview, setCurrentTimePreview] = useState('')

  const timezoneOptions = useMemo(() => getAllTimezones(), [])

  // Update preview time every second
  useEffect(() => {
    if (!isOpen) return

    const updatePreview = () => {
      try {
        const time = new Intl.DateTimeFormat('es-ES', {
          timeZone: selectedTimezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date())
        setCurrentTimePreview(time)
      } catch {
        setCurrentTimePreview('--:--:--')
      }
    }

    updatePreview()
    const interval = setInterval(updatePreview, 1000)
    return () => clearInterval(interval)
  }, [isOpen, selectedTimezone])

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTimezone(timezone)
    }
  }, [isOpen, timezone])

  const handleSave = () => {
    setTimezone(selectedTimezone)
    onClose()
  }

  const handleCancel = () => {
    setSelectedTimezone(timezone)
    onClose()
  }

  const selectedOption = timezoneOptions.find((opt) => opt.value === selectedTimezone)

  return (
    <Dialog
      open={isOpen}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule sx={{ color: 'primary.main' }} />
          <Typography variant="h6" component="span">
            Zona Horaria
          </Typography>
        </Box>
        <IconButton onClick={handleCancel} size="small" sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Selecciona tu zona horaria para visualizar las fechas y horas correctamente.
        </Typography>

        <Autocomplete
          value={selectedOption || null}
          onChange={(_, newValue) => {
            if (newValue) {
              setSelectedTimezone(newValue.value)
            }
          }}
          options={timezoneOptions}
          groupBy={(option) => option.region}
          getOptionLabel={(option) => `${option.region}/${option.label}`}
          renderOption={(props, option) => {
            const { key, ...rest } = props as { key: string; [k: string]: unknown }
            return (
              <Box component="li" key={key} {...rest}>
                <Typography variant="body2">{option.label}</Typography>
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Zona horaria"
              placeholder="Buscar zona horaria..."
              variant="outlined"
              fullWidth
            />
          )}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#8b5cf6',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#8b5cf6',
            },
          }}
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />

        <Box
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Hora actual en {selectedTimezone.split('/').pop()?.replace(/_/g, ' ')}:
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', fontFamily: 'monospace' }}>
            {currentTimePreview}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          onClick={handleCancel}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            bgcolor: '#8b5cf6',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#7c3aed',
            },
          }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
