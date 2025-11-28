import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';

const DAYS_ES = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const WeeklyScheduleEditor = ({ schedule, onChange }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleDayToggle = (day) => {
    onChange({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: !schedule[day].enabled
      }
    });
  };

  const handleTimeChange = (day, field, value) => {
    // Ensure format HH:MM:SS
    const timeValue = value.includes(':') && value.split(':').length === 2
      ? `${value}:00`
      : value;

    onChange({
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: timeValue
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {days.map((day, index) => {
        const daySchedule = schedule[day] || { startTime: '08:00:00', endTime: '20:00:00', enabled: false };
        const startTime = daySchedule.startTime?.substring(0, 5) || '08:00'; // HH:MM
        const endTime = daySchedule.endTime?.substring(0, 5) || '20:00'; // HH:MM

        return (
          <Box key={day}>
            {index > 0 && <Divider sx={{ mb: 2 }} />}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                {DAYS_ES[day]}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={daySchedule.enabled}
                    onChange={() => handleDayToggle(day)}
                    size="small"
                  />
                }
                label="Activo"
                labelPlacement="start"
                sx={{
                  margin: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '12px',
                    color: '#787878'
                  }
                }}
              />
            </Box>

            {daySchedule.enabled && (
              <Box sx={{ display: 'flex', gap: 2, pl: 2 }}>
                <TextField
                  label="Hora Inicio"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                    sx: { fontSize: '12px' }
                  }}
                  InputProps={{
                    sx: { fontSize: '14px' }
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Hora Fin"
                  type="time"
                  value={endTime}
                  onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                    sx: { fontSize: '12px' }
                  }}
                  InputProps={{
                    sx: { fontSize: '14px' }
                  }}
                  fullWidth
                  size="small"
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default WeeklyScheduleEditor;
