import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const DrawSchedules = () => {
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('10:00');

  // Mockup data - 34+ draws with timezones
  const draws = [
    { id: 1, name: 'Anguila Quiniela', timezone: 'America/Santo_Domingo' },
    { id: 2, name: 'California AM', timezone: 'America/New_York' },
    { id: 3, name: 'California PM', timezone: 'America/New_York' },
    { id: 4, name: 'Chicago', timezone: 'America/New_York' },
    { id: 5, name: 'Connecticut', timezone: 'America/New_York' },
    { id: 6, name: 'Delaware', timezone: 'America/New_York' },
    { id: 7, name: 'Diaria Honduras', timezone: 'America/Tegucigalpa' },
    { id: 8, name: 'Florida', timezone: 'America/New_York' },
    { id: 9, name: 'Florida 6x1', timezone: 'America/New_York' },
    { id: 10, name: 'Florida Pick2', timezone: 'America/New_York' },
    { id: 11, name: 'Georgia', timezone: 'America/New_York' },
    { id: 12, name: 'Indiana', timezone: 'America/New_York' },
    { id: 13, name: 'King Lottery', timezone: 'America/Santo_Domingo' },
    { id: 14, name: 'L.E. Puerto Rico', timezone: 'America/Santo_Domingo' },
    { id: 15, name: 'La Chica', timezone: 'America/Tegucigalpa' },
    { id: 16, name: 'La Primera', timezone: 'America/Santo_Domingo' },
    { id: 17, name: 'La Suerte Dominicana', timezone: 'America/Santo_Domingo' },
    { id: 18, name: 'Lotedom', timezone: 'America/Santo_Domingo' },
    { id: 19, name: 'Loteka', timezone: 'America/Santo_Domingo' },
    { id: 20, name: 'Loteria Nacional', timezone: 'America/Santo_Domingo' },
    { id: 21, name: 'Loteria Real', timezone: 'America/Santo_Domingo' },
    { id: 22, name: 'Maryland', timezone: 'America/New_York' },
    { id: 23, name: 'Massachusetts', timezone: 'America/New_York' },
    { id: 24, name: 'New Jersey', timezone: 'America/New_York' },
    { id: 25, name: 'New York', timezone: 'America/New_York' },
    { id: 26, name: 'New York 6x1', timezone: 'America/New_York' },
    { id: 27, name: 'North Carolina', timezone: 'America/New_York' },
    { id: 28, name: 'Panama LNB', timezone: 'America/Panama' },
    { id: 29, name: 'Pennsylvania', timezone: 'America/New_York' },
    { id: 30, name: 'Quiniela Pale', timezone: 'America/Santo_Domingo' },
    { id: 31, name: 'South Carolina', timezone: 'America/New_York' },
    { id: 32, name: 'Super Pale (RD)', timezone: 'America/Santo_Domingo' },
    { id: 33, name: 'Super Pale (USA)', timezone: 'America/New_York' },
    { id: 34, name: 'Texas', timezone: 'America/New_York' },
    { id: 35, name: 'Virginia', timezone: 'America/New_York' }
  ];

  const handleDrawClick = (draw) => {
    setSelectedDraw(draw);
    setShowModal(true);
  };

  const handleSaveSchedule = () => {
    console.log('Saving schedule for:', selectedDraw?.name, 'at', scheduleTime);
    alert(`Horario guardado para ${selectedDraw?.name}: ${scheduleTime} (mockup)`);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDraw(null);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Título */}
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontSize: '24px',
              fontWeight: 500,
              color: '#2c2c2c'
            }}
          >
            Horarios de sorteos
          </Typography>

          {/* Botones de Sorteos */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {draws.map(draw => (
              <Button
                key={draw.id}
                fullWidth
                variant="contained"
                onClick={() => handleDrawClick(draw)}
                sx={{
                  bgcolor: '#51cbce',
                  '&:hover': { bgcolor: '#45b8bb' },
                  color: 'white',
                  textTransform: 'uppercase',
                  fontSize: '14px',
                  py: 2
                }}
              >
                {draw.name.toUpperCase()} ({draw.timezone.toUpperCase()})
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Modal de Configuración de Horario */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontSize: '20px' }}>
            Configurar Horario
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Sorteo"
              value={selectedDraw?.name || ''}
              InputProps={{
                readOnly: true,
                sx: { fontSize: '14px' }
              }}
              InputLabelProps={{
                sx: { fontSize: '12px' }
              }}
              fullWidth
              sx={{ bgcolor: '#f5f5f5' }}
            />

            <TextField
              label="Zona Horaria"
              value={selectedDraw?.timezone || ''}
              InputProps={{
                readOnly: true,
                sx: { fontSize: '14px' }
              }}
              InputLabelProps={{
                sx: { fontSize: '12px' }
              }}
              fullWidth
              sx={{ bgcolor: '#f5f5f5' }}
            />

            <TextField
              label="Hora del Sorteo"
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              InputProps={{
                sx: { fontSize: '14px' }
              }}
              InputLabelProps={{
                sx: { fontSize: '12px' },
                shrink: true
              }}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{
              color: '#666',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#999',
                bgcolor: '#f5f5f5'
              },
              fontSize: '14px',
              textTransform: 'none'
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveSchedule}
            variant="contained"
            sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
              color: 'white',
              fontSize: '14px',
              textTransform: 'none'
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DrawSchedules;
