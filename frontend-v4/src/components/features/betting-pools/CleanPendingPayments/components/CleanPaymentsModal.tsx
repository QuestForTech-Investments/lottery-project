/**
 * CleanPaymentsModal Component
 *
 * Modal dialog for cleaning pending payments.
 */

import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import type { BettingPool, CleanSummary } from '../types';

interface CleanPaymentsModalProps {
  open: boolean;
  selectedPool: BettingPool | null;
  cleanDate: string;
  cleanSummary: CleanSummary;
  cleaning: boolean;
  previewLoading?: boolean;
  onDateChange: (date: string) => void;
  onClose: () => void;
  onClean: () => void;
}

const CleanPaymentsModal: FC<CleanPaymentsModalProps> = memo(({
  open,
  selectedPool,
  cleanDate,
  cleanSummary,
  cleaning,
  previewLoading = false,
  onDateChange,
  onClose,
  onClean,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('bettingPoolsAdmin.cleanPendingPaymentsTitle')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            <strong>{t('bettingPoolsAdmin.cleanModalNameLabel')}</strong>{' '}
            {selectedPool?.bettingPoolName || selectedPool?.name}
          </Typography>
          <Typography variant="body1">
            <strong>{t('bettingPoolsAdmin.cleanModalNumberLabel')}</strong>{' '}
            {selectedPool?.bettingPoolCode || selectedPool?.code || `#${selectedPool?.bettingPoolId || selectedPool?.id}`}
          </Typography>
        </Box>

        <TextField
          label={t('bettingPoolsAdmin.cleanModalDateLabel')}
          type="date"
          value={cleanDate}
          onChange={(e) => onDateChange(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('bettingPoolsAdmin.cleanModalDescription')}
        </Typography>

        <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1, position: 'relative', minHeight: 64 }}>
          {previewLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
              <CircularProgress size={18} />
              <Typography variant="body2">{t('bettingPoolsAdmin.calculating')}</Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body1">
                <strong>{t('bettingPoolsAdmin.ticketsLabel')}</strong> {cleanSummary.tickets}
              </Typography>
              <Typography variant="body1">
                <strong>{t('bettingPoolsAdmin.prizesAmountToClean')}</strong> $
                {cleanSummary.amount.toFixed(2)}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={onClean}
          disabled={cleaning || previewLoading}
        >
          {cleaning ? t('bettingPoolsAdmin.cleaning') : t('bettingPoolsAdmin.ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

CleanPaymentsModal.displayName = 'CleanPaymentsModal';

export default CleanPaymentsModal;
