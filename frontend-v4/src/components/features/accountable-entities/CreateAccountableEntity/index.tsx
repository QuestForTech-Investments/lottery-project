import React, { useState, useCallback, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { createAccountableEntity } from '../../../../services/accountableEntityService';
import { getAllZones } from '../../../../services/zoneService';

interface FormData {
  entityName: string;
  entityCode: string;
  entityType: string;
  zoneId: string;
}

interface ZoneOption {
  id: number;
  name: string;
}

const CreateAccountableEntity = (): React.ReactElement => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    entityName: '',
    entityCode: '',
    entityType: '',
    zoneId: ''
  });
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await getAllZones({ isActive: true, pageSize: 200 });
        const items = (response as { data?: Array<{ zoneId: number; zoneName: string }> }).data || [];
        setZones(items.map(z => ({ id: z.zoneId, name: z.zoneName })));
      } catch (err) {
        console.error('Error loading zones:', err);
      }
    };
    loadZones();
  }, []);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      await createAccountableEntity({
        entityName: formData.entityName,
        entityCode: formData.entityCode,
        entityType: formData.entityType,
        zoneId: formData.zoneId ? parseInt(formData.zoneId) : null
      });

      setSuccess(t('entitiesAdmin.create.msgSuccess'));
      setFormData({ entityName: '', entityCode: '', entityType: 'Banco', zoneId: '' });
    } catch (err) {
      console.error('Error creating entity:', err);
      setError(t('entitiesAdmin.create.errCreate'));
    } finally {
      setLoading(false);
    }
  }, [formData, t]);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
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
            {t('entitiesAdmin.create.title')}
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('entitiesAdmin.create.nameLabel')}
              name="entityName"
              value={formData.entityName}
              onChange={handleTextChange}
              required
              placeholder={t('entitiesAdmin.create.namePlaceholder')}
              sx={{ mb: 3 }}
              InputLabelProps={{ sx: { fontSize: '14px', color: '#787878' } }}
              InputProps={{ sx: { fontSize: '14px' } }}
            />

            <TextField
              fullWidth
              label={t('entitiesAdmin.create.codeLabel')}
              name="entityCode"
              value={formData.entityCode}
              onChange={handleTextChange}
              required
              placeholder={t('entitiesAdmin.create.codePlaceholder')}
              sx={{ mb: 3 }}
              InputLabelProps={{ sx: { fontSize: '14px', color: '#787878' } }}
              InputProps={{ sx: { fontSize: '14px' } }}
            />

            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel sx={{ fontSize: '14px', color: '#787878' }}>{t('entitiesAdmin.create.typeLabel')}</InputLabel>
              <Select
                name="entityType"
                value={formData.entityType}
                onChange={handleSelectChange}
                label={t('entitiesAdmin.create.typeLabel')}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="Banco" sx={{ fontSize: '14px' }}>{t('entitiesAdmin.create.typeBank')}</MenuItem>
                <MenuItem value="Otro" sx={{ fontSize: '14px' }}>{t('entitiesAdmin.create.typeOther')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel sx={{ fontSize: '14px', color: '#787878' }}>{t('entitiesAdmin.create.zoneLabel')}</InputLabel>
              <Select
                name="zoneId"
                value={formData.zoneId}
                onChange={handleSelectChange}
                label={t('entitiesAdmin.create.zoneLabel')}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="">
                  <em>{t('entitiesAdmin.create.zoneNone')}</em>
                </MenuItem>
                {zones.map(zone => (
                  <MenuItem key={zone.id} value={String(zone.id)} sx={{ fontSize: '14px' }}>
                    {zone.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : t('entitiesAdmin.create.submitButton')}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateAccountableEntity;
