/**
 * ReceiverForm — shared editor used by both Create and Edit pages.
 *
 * Notification type is intentionally fixed to "Monitoreo de Jugadas" for now
 * (the only one the backend supports). When more types land, expose this as
 * a real Select instead of a disabled readonly TextField.
 */

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getAllZones } from '@services/zoneService';
import {
  EMAIL_NOTIFICATION_TYPES,
  type EmailNotificationType,
} from '@services/emailReceiverService';

export interface ReceiverFormValues {
  name: string;
  email: string;
  notificationType: EmailNotificationType;
  isActive: boolean;
  zoneIds: number[];
}

export interface ReceiverFormProps {
  /** Defaults used to seed the form. Pass an existing receiver for edit mode. */
  initialValues?: Partial<ReceiverFormValues>;
  /** Submit handler — should return after the API call resolves. */
  onSubmit: (values: ReceiverFormValues) => Promise<void>;
  /** Title shown above the form (e.g. "Crear receptor" / "Editar receptor"). */
  title: string;
  /** Label on the submit button. */
  submitLabel: string;
  /** True while initial data (in edit mode) is still loading. */
  loading?: boolean;
}

interface ZoneOption {
  zoneId: number;
  zoneName: string;
}

const DEFAULT_VALUES: ReceiverFormValues = {
  name: '',
  email: '',
  notificationType: EMAIL_NOTIFICATION_TYPES.MONITOREO_JUGADAS,
  isActive: true,
  zoneIds: [],
};

const ReceiverForm = ({
  initialValues,
  onSubmit,
  title,
  submitLabel,
  loading = false,
}: ReceiverFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [values, setValues] = useState<ReceiverFormValues>(() => ({
    ...DEFAULT_VALUES,
    ...initialValues,
  }));
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [zonesLoading, setZonesLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed form when initialValues arrive late (edit page fetches the
  // receiver async, then passes it in).
  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  // Load all zones once. They're the multi-select options for the
  // subscription set.
  useEffect(() => {
    let alive = true;
    (async () => {
      setZonesLoading(true);
      try {
        const response = await getAllZones({ isActive: true, pageSize: 1000 });
        // getAllZones returns either { data: [...] } or a paginated wrapper.
        // The runtime shape here is `{ data: Zone[] }` after the helper
        // normalises the response. We pull just id + name for the chip view.
        const raw = (response as { data?: Array<{ zoneId: number; zoneName: string }> }).data
          ?? (response as unknown as Array<{ zoneId: number; zoneName: string }>)
          ?? [];
        if (alive) {
          setZones(
            raw.map((z) => ({ zoneId: z.zoneId, zoneName: z.zoneName }))
              .sort((a, b) => a.zoneName.localeCompare(b.zoneName)),
          );
        }
      } catch (err) {
        console.error('Error loading zones:', err);
        if (alive) setError(t('emailReceiversAdmin.form.zonesLoadError', { defaultValue: 'Error al cargar las zonas.' }));
      } finally {
        if (alive) setZonesLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [t]);

  const selectedZones = useMemo<ZoneOption[]>(
    () => zones.filter((z) => values.zoneIds.includes(z.zoneId)),
    [zones, values.zoneIds],
  );

  const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCheckboxChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: checked }));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
      });
    } catch (err) {
      console.error('Error submitting receiver:', err);
      const msg = (err as { message?: string })?.message ?? t('emailReceiversAdmin.form.submitError', { defaultValue: 'Error al guardar el receptor.' });
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 1, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
            <Button
              size="small"
              onClick={() => navigate('/receivers/list')}
              startIcon={<BackIcon />}
              sx={{ textTransform: 'none', color: '#666' }}
            >
              {t('common.back', { defaultValue: 'Volver' })}
            </Button>
          </Box>

          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: { xs: 2, sm: 4 },
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#2c2c2c',
              fontSize: { xs: '1.1rem', sm: '1.5rem' },
            }}
          >
            {title}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Name */}
            <TextField
              fullWidth
              label={t('common.name')}
              name="name"
              value={values.name}
              onChange={handleTextChange}
              placeholder={t('emailReceiversAdmin.create.namePlaceholder', { defaultValue: 'Nombre del receptor' })}
              required
              sx={{ mb: 3 }}
            />

            {/* Email */}
            <TextField
              fullWidth
              label={t('emailReceiversAdmin.fields.email')}
              name="email"
              type="email"
              value={values.email}
              onChange={handleTextChange}
              placeholder={t('emailReceiversAdmin.create.emailPlaceholder', { defaultValue: 'correo@empresa.com' })}
              required
              sx={{ mb: 3 }}
            />

            {/* Notification type: only one option for now, shown as read-only. */}
            <TextField
              fullWidth
              label={t('emailReceiversAdmin.fields.notificationType')}
              value={t('emailReceiversAdmin.types.playMonitoring', { defaultValue: 'Monitoreo de Jugadas' })}
              InputProps={{ readOnly: true }}
              helperText={t('emailReceiversAdmin.form.singleTypeHint', {
                defaultValue: 'Por ahora solo existe este tipo de notificación.',
              })}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ mb: 3 }} />

            {/* Zones — multi-select Autocomplete with chip display.
                One-click "select all / clear all" toggle next to the label so
                admins with many zones don't have to click N times. */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                {t('emailReceiversAdmin.form.zonesLabel', { defaultValue: 'Zonas a monitorear' })}
                {zones.length > 0 && (
                  <Box component="span" sx={{ color: '#999', fontWeight: 400, ml: 1, fontSize: '12px' }}>
                    ({values.zoneIds.length}/{zones.length})
                  </Box>
                )}
              </Typography>
              {zones.length > 0 && (() => {
                const allSelected = values.zoneIds.length === zones.length;
                return (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setValues((prev) => ({
                        ...prev,
                        zoneIds: allSelected ? [] : zones.map((z) => z.zoneId),
                      }))
                    }
                    sx={{
                      color: '#8b5cf6',
                      borderColor: '#c4b5fd',
                      textTransform: 'none',
                      '&:hover': { borderColor: '#8b5cf6', bgcolor: '#f5f3ff' },
                    }}
                  >
                    {allSelected
                      ? t('emailReceiversAdmin.form.clearAllZones', { defaultValue: 'Quitar todas' })
                      : t('emailReceiversAdmin.form.selectAllZones', { defaultValue: 'Seleccionar todas' })}
                  </Button>
                );
              })()}
            </Box>
            <Autocomplete
              multiple
              options={zones}
              value={selectedZones}
              loading={zonesLoading}
              getOptionLabel={(o) => o.zoneName}
              isOptionEqualToValue={(a, b) => a.zoneId === b.zoneId}
              onChange={(_e, newValue) => {
                setValues((prev) => ({ ...prev, zoneIds: newValue.map((z) => z.zoneId) }));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.zoneId}
                    label={option.zoneName}
                    size="small"
                    sx={{ bgcolor: '#ede9fe', color: '#5b21b6', fontWeight: 500 }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder={
                    selectedZones.length === 0
                      ? t('emailReceiversAdmin.form.zonesPlaceholder', { defaultValue: 'Selecciona una o más zonas…' })
                      : ''
                  }
                />
              )}
              sx={{ mb: 3 }}
            />

            {/* Active toggle */}
            <FormControlLabel
              control={
                <Checkbox
                  name="isActive"
                  checked={values.isActive}
                  onChange={handleCheckboxChange}
                />
              }
              label={t('emailReceiversAdmin.create.activeReceiver', { defaultValue: 'Receptor activo' })}
              sx={{ mb: 4 }}
            />

            {/* Submit */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !values.name.trim() || !values.email.trim()}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                sx={{
                  bgcolor: '#8b5cf6',
                  '&:hover': { bgcolor: '#7c3aed' },
                  color: 'white',
                  px: 4,
                  py: 1.25,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  textTransform: 'none',
                }}
              >
                {submitting
                  ? t('common.saving', { defaultValue: 'Guardando…' })
                  : submitLabel}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReceiverForm;
