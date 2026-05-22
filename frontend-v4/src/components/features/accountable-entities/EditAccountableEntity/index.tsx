import React, { useState, useCallback, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { getAccountableEntity, updateAccountableEntity, deleteAccountableEntity } from '@services/accountableEntityService';
import { getAllZones } from '@services/zoneService';

interface FormData {
  entityName: string;
  entityCode: string;
  entityType: string;
  zoneId: string;
  isActive: boolean;
}

interface ZoneOption {
  id: number;
  name: string;
}

const EditAccountableEntity = (): React.ReactElement => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const entityId = Number(id);

  const [formData, setFormData] = useState<FormData>({
    entityName: '',
    entityCode: '',
    entityType: '',
    zoneId: '',
    isActive: true
  });
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loadingEntity, setLoadingEntity] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [entity, zonesResponse] = await Promise.all([
          getAccountableEntity(entityId),
          getAllZones({ isActive: true, pageSize: 200 })
        ]);

        const items = (zonesResponse as { data?: Array<{ zoneId: number; zoneName: string }> }).data || [];
        setZones(items.map(z => ({ id: z.zoneId, name: z.zoneName })));

        setCurrentBalance(entity.currentBalance);
        setFormData({
          entityName: entity.entityName,
          entityCode: entity.entityCode,
          entityType: entity.entityType,
          zoneId: entity.zoneId ? String(entity.zoneId) : '',
          isActive: entity.isActive
        });
      } catch (err) {
        console.error('Error loading entity:', err);
        setError(t('entitiesAdmin.edit.errLoad'));
      } finally {
        setLoadingEntity(false);
      }
    };
    loadData();
  }, [entityId, t]);

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
    setSaving(true);

    try {
      await updateAccountableEntity(entityId, {
        entityName: formData.entityName,
        entityCode: formData.entityCode,
        entityType: formData.entityType,
        zoneId: formData.zoneId ? parseInt(formData.zoneId) : null,
        isActive: formData.isActive
      });

      setSuccess(t('entitiesAdmin.edit.msgSuccess'));
    } catch (err) {
      console.error('Error updating entity:', err);
      setError(t('entitiesAdmin.edit.errUpdate'));
    } finally {
      setSaving(false);
    }
  }, [entityId, formData, t]);

  const handleDelete = useCallback(async () => {
    setDeleteDialogOpen(false);
    setSuccess(null);
    setError(null);
    setDeleting(true);

    try {
      await deleteAccountableEntity(entityId);
      navigate('/entities/list');
    } catch (err) {
      console.error('Error deleting entity:', err);
      setError(t('entitiesAdmin.edit.errDelete'));
    } finally {
      setDeleting(false);
    }
  }, [entityId, navigate, t]);

  if (loadingEntity) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
            {t('entitiesAdmin.edit.title')}
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
              label={t('entitiesAdmin.edit.nameLabel')}
              name="entityName"
              value={formData.entityName}
              onChange={handleTextChange}
              required
              placeholder={t('entitiesAdmin.edit.namePlaceholder')}
              sx={{ mb: 3 }}
              InputLabelProps={{ sx: { fontSize: '14px', color: '#787878' } }}
              InputProps={{ sx: { fontSize: '14px' } }}
            />

            <TextField
              fullWidth
              label={t('entitiesAdmin.edit.codeLabel')}
              name="entityCode"
              value={formData.entityCode}
              onChange={handleTextChange}
              required
              placeholder={t('entitiesAdmin.edit.codePlaceholder')}
              sx={{ mb: 3 }}
              InputLabelProps={{ sx: { fontSize: '14px', color: '#787878' } }}
              InputProps={{ sx: { fontSize: '14px' } }}
            />

            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel sx={{ fontSize: '14px', color: '#787878' }}>{t('entitiesAdmin.edit.typeLabel')}</InputLabel>
              <Select
                name="entityType"
                value={formData.entityType}
                onChange={handleSelectChange}
                label={t('entitiesAdmin.edit.typeLabel')}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="Banco" sx={{ fontSize: '14px' }}>{t('entitiesAdmin.edit.typeBank')}</MenuItem>
                <MenuItem value="Otro" sx={{ fontSize: '14px' }}>{t('entitiesAdmin.edit.typeOther')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ fontSize: '14px', color: '#787878' }}>{t('entitiesAdmin.edit.zoneLabel')}</InputLabel>
              <Select
                name="zoneId"
                value={formData.zoneId}
                onChange={handleSelectChange}
                label={t('entitiesAdmin.edit.zoneLabel')}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="">
                  <em>{t('entitiesAdmin.edit.zoneNone')}</em>
                </MenuItem>
                {zones.map(zone => (
                  <MenuItem key={zone.id} value={String(zone.id)} sx={{ fontSize: '14px' }}>
                    {zone.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label={t('entitiesAdmin.edit.activeLabel')}
              sx={{ mb: 3, display: 'block' }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/entities/list')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                {t('entitiesAdmin.edit.backButton')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
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
                {saving ? <CircularProgress size={24} color="inherit" /> : t('entitiesAdmin.edit.saveButton')}
              </Button>
            </Box>
          </form>

          {currentBalance === 0 && (
            <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Button
                variant="contained"
                color="error"
                disabled={deleting}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                {deleting ? <CircularProgress size={24} color="inherit" /> : t('entitiesAdmin.edit.deleteButton')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('entitiesAdmin.edit.deleteDialogTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('entitiesAdmin.edit.deleteConfirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('entitiesAdmin.edit.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained">{t('entitiesAdmin.edit.deleteConfirmButton')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditAccountableEntity;
