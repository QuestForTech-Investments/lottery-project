/**
 * FootersTab Component
 *
 * Footer settings for ticket printing.
 */

import { memo, type FC } from 'react';
import { Box, Typography, TextField, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { FootersTabProps } from '../types';

const FootersTab: FC<FootersTabProps> = memo(({ formData, onInputChange }) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ maxWidth: 600 }}>
      {/* Footer automático */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>{t('massEditBettingPools.autoFooter')}</Typography>
        <Switch
          checked={formData.autoFooter}
          onChange={(e) => onInputChange('autoFooter', e.target.checked)}
        />
      </Box>

      {/* Primer pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>{t('massEditBettingPools.footer1')}</Typography>
        <TextField
          value={formData.footer1}
          onChange={(e) => onInputChange('footer1', e.target.value)}
          size="small"
          fullWidth
          placeholder={t('massEditBettingPools.footer1Placeholder')}
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer1 || '').length}/30`}
        />
      </Box>

      {/* Segundo pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>{t('massEditBettingPools.footer2')}</Typography>
        <TextField
          value={formData.footer2}
          onChange={(e) => onInputChange('footer2', e.target.value)}
          size="small"
          fullWidth
          placeholder={t('massEditBettingPools.footer2Placeholder')}
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer2 || '').length}/30`}
        />
      </Box>

      {/* Tercer pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>{t('massEditBettingPools.footer3')}</Typography>
        <TextField
          value={formData.footer3}
          onChange={(e) => onInputChange('footer3', e.target.value)}
          size="small"
          fullWidth
          placeholder={t('massEditBettingPools.footer3Placeholder')}
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer3 || '').length}/30`}
        />
      </Box>

      {/* Cuarto pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>{t('massEditBettingPools.footer4')}</Typography>
        <TextField
          value={formData.footer4}
          onChange={(e) => onInputChange('footer4', e.target.value)}
          size="small"
          fullWidth
          placeholder={t('massEditBettingPools.footer4Placeholder')}
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer4 || '').length}/30`}
        />
      </Box>

      {/* Quinto pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>{t('massEditBettingPools.footer5')}</Typography>
        <TextField
          value={formData.footer5}
          onChange={(e) => onInputChange('footer5', e.target.value)}
          size="small"
          fullWidth
          placeholder={t('massEditBettingPools.footer5Placeholder')}
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer5 || '').length}/30`}
        />
      </Box>

      {/* Sexto pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>{t('massEditBettingPools.footer6')}</Typography>
        <TextField
          value={formData.footer6}
          onChange={(e) => onInputChange('footer6', e.target.value)}
          size="small"
          fullWidth
          placeholder={t('massEditBettingPools.footer6Placeholder')}
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer6 || '').length}/30`}
        />
      </Box>

      {/* Séptimo pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>{t('massEditBettingPools.footer7')}</Typography>
        <TextField
          value={formData.footer7}
          onChange={(e) => onInputChange('footer7', e.target.value)}
          size="small"
          fullWidth
          placeholder={t('massEditBettingPools.footer7Placeholder')}
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer7 || '').length}/30`}
        />
      </Box>

      {/* Octavo pie de página */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography sx={{ minWidth: 200 }}>{t('massEditBettingPools.footer8')}</Typography>
        <TextField
          value={formData.footer8}
          onChange={(e) => onInputChange('footer8', e.target.value)}
          size="small"
          fullWidth
          placeholder={t('massEditBettingPools.footer8Placeholder')}
          inputProps={{ maxLength: 30 }}
          helperText={`${(formData.footer8 || '').length}/30`}
        />
      </Box>
    </Box>
  );
});

FootersTab.displayName = 'FootersTab';

export default FootersTab;
