import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReceiverForm, { type ReceiverFormValues } from '../ReceiverForm';
import { createEmailReceiver } from '@services/emailReceiverService';

/**
 * Thin wrapper around <ReceiverForm/> that wires the Create action.
 * Navigates back to the list on success.
 */
const CreateEmailReceiver = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (values: ReceiverFormValues): Promise<void> => {
    await createEmailReceiver({
      name: values.name,
      email: values.email,
      notificationType: values.notificationType,
      isActive: values.isActive,
      zoneIds: values.zoneIds,
    });
    navigate('/receivers/list');
  };

  return (
    <ReceiverForm
      title={t('emailReceiversAdmin.create.title')}
      submitLabel={t('emailReceiversAdmin.create.submit', { defaultValue: 'Crear receptor' })}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateEmailReceiver;
