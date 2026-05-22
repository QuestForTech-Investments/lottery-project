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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    alert(t('emailReceiversAdmin.create.createdAlert', {
      name: formData.nombre,
      email: formData.email,
      notificationType: formData.tipoNotificacion,
      active: formData.activo ? t('common.yes') : t('common.no')
    }));

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
            {t('emailReceiversAdmin.create.title')}
          </Typography>

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Nombre */}
            <TextField
              fullWidth
              label={t('common.name')}
              name="nombre"
              value={formData.nombre}
              onChange={handleTextChange}
              placeholder={t('emailReceiversAdmin.create.namePlaceholder')}
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
              label={t('emailReceiversAdmin.fields.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              placeholder={t('emailReceiversAdmin.create.emailPlaceholder')}
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
                {t('emailReceiversAdmin.fields.notificationType')}
              </InputLabel>
              <Select
                name="tipoNotificacion"
                value={formData.tipoNotificacion}
                onChange={handleSelectChange}
                label={t('emailReceiversAdmin.fields.notificationType')}
                sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
              >
                <MenuItem value="Reportes diarios">{t('emailReceiversAdmin.types.dailyReports')}</MenuItem>
                <MenuItem value="Alertas de ventas">{t('emailReceiversAdmin.types.salesAlerts')}</MenuItem>
                <MenuItem value="Notificaciones de premios">{t('emailReceiversAdmin.types.prizeNotifications')}</MenuItem>
                <MenuItem value="Resumen semanal">{t('emailReceiversAdmin.types.weeklySummary')}</MenuItem>
                <MenuItem value="Alertas de sistema">{t('emailReceiversAdmin.types.systemAlerts')}</MenuItem>
                <MenuItem value="Todas">{t('emailReceiversAdmin.types.all')}</MenuItem>
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
              label={t('emailReceiversAdmin.create.activeReceiver')}
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
                  bgcolor: '#8b5cf6',
                  '&:hover': { bgcolor: '#7c3aed' },
                  color: 'white',
                  px: 4,
                  py: 1.25,
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  textTransform: 'none'
                }}
              >
                {t('emailReceiversAdmin.create.submit')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEmailReceiver;
