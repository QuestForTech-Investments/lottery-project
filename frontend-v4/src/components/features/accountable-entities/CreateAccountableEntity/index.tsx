import React, { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

interface FormData {
  nombre: string;
  codigo: string;
  tipoEntidad: string;
  zona: string;
}

interface TipoEntidad {
  id: number;
  nombre: string;
}

interface Zona {
  id: number;
  nombre: string;
}

const CreateAccountableEntity = (): React.ReactElement => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    codigo: '',
    tipoEntidad: '',
    zona: ''
  });

  // Mockup data
  const tiposEntidad: TipoEntidad[] = [
    { id: 1, nombre: 'Banca' },
    { id: 2, nombre: 'Empleado' },
    { id: 3, nombre: 'Banco' },
    { id: 4, nombre: 'Zona' },
    { id: 5, nombre: 'Otro' }
  ];

  const zonas: Zona[] = [
    { id: 1, nombre: 'Zona Norte' },
    { id: 2, nombre: 'Zona Sur' },
    { id: 3, nombre: 'Zona Este' },
    { id: 4, nombre: 'Zona Oeste' },
    { id: 5, nombre: 'Centro' }
  ];

  const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Entidad creada (mockup):\nNombre: ${formData.nombre}\nCódigo: ${formData.codigo}\nTipo: ${formData.tipoEntidad}\nZona: ${formData.zona}`);

    // Reset form
    setFormData({
      nombre: '',
      codigo: '',
      tipoEntidad: '',
      zona: ''
    });
  }, [formData]);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
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
            Crear entidad contable
          </Typography>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Nombre */}
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleTextChange}
              required
              placeholder="Nombre"
              sx={{ mb: 3 }}
              InputLabelProps={{
                sx: { fontSize: '14px', color: '#787878' }
              }}
              InputProps={{
                sx: { fontSize: '14px' }
              }}
            />

            {/* Código */}
            <TextField
              fullWidth
              label="Código"
              name="codigo"
              value={formData.codigo}
              onChange={handleTextChange}
              required
              placeholder="Código"
              sx={{ mb: 3 }}
              InputLabelProps={{
                sx: { fontSize: '14px', color: '#787878' }
              }}
              InputProps={{
                sx: { fontSize: '14px' }
              }}
            />

            {/* Tipo de entidad */}
            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel sx={{ fontSize: '14px', color: '#787878' }}>Tipo de entidad</InputLabel>
              <Select
                name="tipoEntidad"
                value={formData.tipoEntidad}
                onChange={handleSelectChange}
                label="Tipo de entidad"
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="">
                  <em>Seleccione</em>
                </MenuItem>
                {tiposEntidad.map(tipo => (
                  <MenuItem key={tipo.id} value={tipo.nombre} sx={{ fontSize: '14px' }}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Zona */}
            <FormControl fullWidth required sx={{ mb: 4 }}>
              <InputLabel sx={{ fontSize: '14px', color: '#787878' }}>Zona</InputLabel>
              <Select
                name="zona"
                value={formData.zona}
                onChange={handleSelectChange}
                label="Zona"
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="">
                  <em>Seleccione</em>
                </MenuItem>
                {zonas.map(zona => (
                  <MenuItem key={zona.id} value={zona.nombre} sx={{ fontSize: '14px' }}>
                    {zona.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Botón Crear */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#8b5cf6',
                  '&:hover': { bgcolor: '#7c3aed' },
                  color: 'white',
                  px: 5,
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                CREAR
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateAccountableEntity;
