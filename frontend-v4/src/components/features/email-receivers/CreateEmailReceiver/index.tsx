import React, { useState, useCallback, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

interface FormData {
  nombre: string;
  email: string;
  tipoNotificacion: string;
  activo: boolean;
}

const initialFormData: FormData = {
  nombre: '',
  email: '',
  tipoNotificacion: '',
  activo: true
};

/**
 * CreateEmailReceiver Component (Material-UI V2)
 *
 * Formulario para crear un nuevo receptor de correo
 */
const CreateEmailReceiver = (): React.ReactElement => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSelectChange = useCallback((e: SelectChangeEvent<string>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCheckboxChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    alert(`Receptor de correo creado (mockup)\n\nNombre: ${formData.nombre}\nEmail: ${formData.email}\nTipo de notificación: ${formData.tipoNotificacion}\nActivo: ${formData.activo ? 'Sí' : 'No'}`);

    // Reset form
    setFormData({
      nombre: '',
      email: '',
      tipoNotificacion: '',
      activo: true
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Título */}
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#2c2c2c'
            }}
          >
            Crear receptor de correo
          </Typography>

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Nombre */}
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleTextChange}
              placeholder="Nombre del receptor"
              required
              sx={{ mb: 3 }}
              InputLabelProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              placeholder="correo@ejemplo.com"
              required
              sx={{ mb: 3 }}
              InputLabelProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />

            {/* Tipo de notificación */}
            <FormControl fullWidth sx={{ mb: 3 }} required>
              <InputLabel sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                Tipo de notificación
              </InputLabel>
              <Select
                name="tipoNotificacion"
                value={formData.tipoNotificacion}
                onChange={handleSelectChange}
                label="Tipo de notificación"
                sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
              >
                <MenuItem value="Reportes diarios">Reportes diarios</MenuItem>
                <MenuItem value="Alertas de ventas">Alertas de ventas</MenuItem>
                <MenuItem value="Notificaciones de premios">Notificaciones de premios</MenuItem>
                <MenuItem value="Resumen semanal">Resumen semanal</MenuItem>
                <MenuItem value="Alertas de sistema">Alertas de sistema</MenuItem>
                <MenuItem value="Todas">Todas las notificaciones</MenuItem>
              </Select>
            </FormControl>

            {/* Activo */}
            <FormControlLabel
              control={
                <Checkbox
                  name="activo"
                  checked={formData.activo}
                  onChange={handleCheckboxChange}
                />
              }
              label="Receptor activo"
              sx={{
                mb: 4,
                '& .MuiFormControlLabel-label': {
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif'
                }
              }}
            />

            {/* Botón Crear */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#51cbce',
                  '&:hover': { bgcolor: '#45b8bb' },
                  color: 'white',
                  px: 4,
                  py: 1.25,
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  textTransform: 'none'
                }}
              >
                CREAR
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEmailReceiver;
