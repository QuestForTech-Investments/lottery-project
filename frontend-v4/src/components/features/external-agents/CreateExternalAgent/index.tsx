import React, { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel
} from '@mui/material';

interface FormData {
  nombre: string;
  codigo: string;
  contacto: string;
  telefono: string;
  email: string;
  comision: string;
  activo: boolean;
}

const initialFormData: FormData = {
  nombre: '',
  codigo: '',
  contacto: '',
  telefono: '',
  email: '',
  comision: '',
  activo: true
};

/**
 * CreateExternalAgent Component (Material-UI V2)
 *
 * Formulario para crear un nuevo agente externo
 */
const CreateExternalAgent = (): React.ReactElement => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'activo' ? checked : value
    }));
  }, []);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Crear agente externo:', formData);
    alert(`Agente externo creado (mockup)\nNombre: ${formData.nombre}\nCódigo: ${formData.codigo}\nContacto: ${formData.contacto}`);
    // Reset form
    setFormData(initialFormData);
  }, [formData]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
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
            Crear agente externo
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Nombre */}
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputLabelProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />

            {/* Código */}
            <TextField
              fullWidth
              label="Código"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputLabelProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />

            {/* Contacto */}
            <TextField
              fullWidth
              label="Nombre de contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputLabelProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />

            {/* Teléfono */}
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
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
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 3 }}
              InputLabelProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />

            {/* Comisión */}
            <TextField
              fullWidth
              label="Comisión (%)"
              name="comision"
              type="number"
              value={formData.comision}
              onChange={handleChange}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              sx={{ mb: 3 }}
              InputLabelProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />

            {/* Activo */}
            <FormControlLabel
              control={
                <Checkbox
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
              }
              label="Activo"
              sx={{
                mb: 4,
                '& .MuiFormControlLabel-label': {
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif'
                }
              }}
            />

            {/* Submit Button */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#51cbce',
                  '&:hover': { bgcolor: '#45b8bb' },
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  px: 5,
                  py: 1.2
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

export default CreateExternalAgent;
