import React, { useState, type MouseEvent } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { AccessTime as ClockIcon } from '@mui/icons-material';
import TimePickerMUI from '../../../../TimePickerMUI';

interface DayConfig {
  key: string;
  label: string;
}

interface SchedulesFormData {
  domingoInicio: string;
  domingoFin: string;
  lunesInicio: string;
  lunesFin: string;
  martesInicio: string;
  martesFin: string;
  miercolesInicio: string;
  miercolesFin: string;
  juevesInicio: string;
  juevesFin: string;
  viernesInicio: string;
  viernesFin: string;
  sabadoInicio: string;
  sabadoFin: string;
  [key: string]: string;
}

interface SyntheticEventLike {
  target: {
    name: string;
    value: string;
  };
}

interface SchedulesTabProps {
  formData: SchedulesFormData;
  handleChange: (e: SyntheticEventLike) => void;
}

/**
 * SchedulesTab Component
 * Contains lottery draw schedules for each day of the week
 * Now with custom TimePicker dropdown
 */
const SchedulesTab: React.FC<SchedulesTabProps> = ({ formData, handleChange }) => {
  const [activeTimePicker, setActiveTimePicker] = useState<string | null>(null);
  const [timePickerAnchor, setTimePickerAnchor] = useState<HTMLElement | null>(null);

  const days: DayConfig[] = [
    { key: 'domingo', label: 'Domingo' },
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
  ];

  const openTimePicker = (fieldName: string, event: MouseEvent<HTMLDivElement>): void => {
    setTimePickerAnchor(event.currentTarget);
    setActiveTimePicker(fieldName);
  };

  const closeTimePicker = (): void => {
    setActiveTimePicker(null);
    setTimePickerAnchor(null);
  };

  const handleTimeChange = (fieldName: string, newValue: string): void => {
    // Create a synthetic event that mimics the TextField onChange
    const syntheticEvent: SyntheticEventLike = {
      target: {
        name: fieldName,
        value: newValue,
      },
    };
    handleChange(syntheticEvent);
  };

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
                value={formData[`${day.key}Inicio`] || ''}
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
                value={formData[`${day.key}Fin`] || ''}
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
          value={formData[activeTimePicker]}
          onChange={(newValue) => {
            handleTimeChange(activeTimePicker, newValue);
          }}
          onClose={closeTimePicker}
          anchorEl={timePickerAnchor}
        />
      )}
    </Box>
  );
};

/**
 * Custom comparison function for SchedulesTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: SchedulesTabProps, nextProps: SchedulesTabProps): boolean => {
  // Check if handleChange changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false;
  }

  // Check schedule fields for all days
  const scheduleFields: (keyof SchedulesFormData)[] = [
    'domingoInicio', 'domingoFin', 'lunesInicio', 'lunesFin',
    'martesInicio', 'martesFin', 'miercolesInicio', 'miercolesFin',
    'juevesInicio', 'juevesFin', 'viernesInicio', 'viernesFin',
    'sabadoInicio', 'sabadoFin'
  ];

  for (const field of scheduleFields) {
    if (prevProps.formData[field] !== nextProps.formData[field]) {
      return false;
    }
  }

  // No relevant changes, skip re-render
  return true;
};

export default React.memo(SchedulesTab, arePropsEqual);
