import React, { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    alert(t('externalAgentsAdmin.create.msgCreatedMock', { name: formData.nombre, code: formData.codigo, contact: formData.contacto }));
    // Reset form
    setFormData(initialFormData);
  }, [formData, t]);

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
            {t('externalAgentsAdmin.create.title')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Nombre */}
            <TextField
              fullWidth
              label={t('externalAgentsAdmin.create.nameLabel')}
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
              label={t('externalAgentsAdmin.create.codeLabel')}
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
              label={t('externalAgentsAdmin.create.contactLabel')}
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
              label={t('externalAgentsAdmin.create.phoneLabel')}
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
              label={t('externalAgentsAdmin.create.emailLabel')}
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
              label={t('externalAgentsAdmin.create.commissionLabel')}
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
              label={t('externalAgentsAdmin.create.activeLabel')}
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
                  bgcolor: '#8b5cf6',
                  '&:hover': { bgcolor: '#7c3aed' },
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  px: 5,
                  py: 1.2
                }}
              >
                {t('externalAgentsAdmin.create.submitButton')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateExternalAgent;
