import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Alert, Button } from '@mui/material';
import ReceiverForm, { type ReceiverFormValues } from '../ReceiverForm';
import {
  getEmailReceiverById,
  updateEmailReceiver,
  EMAIL_NOTIFICATION_TYPES,
  type EmailNotificationType,
} from '@services/emailReceiverService';

/**
 * Loads the existing receiver, hands its fields to <ReceiverForm/>, then
 * sends an update on submit.
 */
const EditEmailReceiver = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { receiverId } = useParams<{ receiverId: string }>();
  const id = Number(receiverId);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initial, setInitial] = useState<Partial<ReceiverFormValues> | undefined>(undefined);

  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) {
      setLoadError(t('emailReceiversAdmin.edit.invalidId', { defaultValue: 'ID de receptor inválido.' }));
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const r = await getEmailReceiverById(id);
      setInitial({
        name: r.name,
        email: r.email,
        // Cast — the API may emit any string, but we currently only support one type.
        notificationType: (r.notificationType as EmailNotificationType) || EMAIL_NOTIFICATION_TYPES.MONITOREO_JUGADAS,
        isActive: r.isActive,
        zoneIds: r.zones.map((z) => z.zoneId),
      });
    } catch (err) {
      console.error('Error loading receiver:', err);
      setLoadError(t('emailReceiversAdmin.edit.loadError', { defaultValue: 'Error al cargar el receptor.' }));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values: ReceiverFormValues): Promise<void> => {
    await updateEmailReceiver(id, {
      name: values.name,
      email: values.email,
      notificationType: values.notificationType,
      isActive: values.isActive,
      zoneIds: values.zoneIds,
    });
    navigate('/receivers/list');
  };

  if (loadError) {
    return (
      <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>
        <Button onClick={() => navigate('/receivers/list')} variant="outlined">
          {t('common.back', { defaultValue: 'Volver' })}
        </Button>
      </Box>
    );
  }

  return (
    <ReceiverForm
      title={t('emailReceiversAdmin.edit.title', { defaultValue: 'Editar receptor' })}
      submitLabel={t('emailReceiversAdmin.edit.submit', { defaultValue: 'Guardar cambios' })}
      initialValues={initial}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default EditEmailReceiver;
