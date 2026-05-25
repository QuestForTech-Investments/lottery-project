/**
 * ConfigurationTab Component
 *
 * Configuration settings for mass editing betting pools.
 */

import { memo, type FC } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import TriStateToggle from './TriStateToggle';
import type { ConfigurationTabProps } from '../types';

const ConfigurationTab: FC<ConfigurationTabProps> = memo(({ formData, zones, onInputChange }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  // On phones the longer fall-type labels can't sit on one row with the
  // shorter ones, so we render the whole group vertically instead of wrapping.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Box>
      {/* SECTION 1: Full-width fields */}
      <Box sx={{ mb: 3 }}>
        {/* Zona */}
        <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
          <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.zone')}</Typography>
          <FormControl sx={{ minWidth: { xs: '100%', sm: 300 } }} size="small">
            <Select
              value={formData.zoneId}
              displayEmpty
              onChange={(e) => onInputChange('zoneId', e.target.value)}
            >
              <MenuItem value="">
                <em>{t('massEditBettingPools.select')}</em>
              </MenuItem>
              {zones.map(zone => (
                <MenuItem key={zone.zoneId || zone.id} value={zone.zoneId || zone.id}>
                  {zone.zoneName || zone.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Tipo de caída */}
        <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
          <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.fallType')}</Typography>
          <ToggleButtonGroup
            value={formData.fallType}
            exclusive
            onChange={(_, newVal) => onInputChange('fallType', newVal)}
            size="small"
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <ToggleButton value="OFF">{t('massEditBettingPools.fall.off')}</ToggleButton>
            <ToggleButton value="COBRO">{t('massEditBettingPools.fall.cobro')}</ToggleButton>
            <ToggleButton value="DIARIA">{t('massEditBettingPools.fall.daily')}</ToggleButton>
            <ToggleButton value="MENSUAL">{t('massEditBettingPools.fall.monthly')}</ToggleButton>
            <ToggleButton value="SEMANAL_CON_ACUMULADO">{t('massEditBettingPools.fall.weeklyWith')}</ToggleButton>
            <ToggleButton value="SEMANAL_SIN_ACUMULADO">{t('massEditBettingPools.fall.weeklyWithout')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Porcentaje de caída */}
        {formData.fallType && formData.fallType !== 'OFF' && (
          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.fallPercentage')}</Typography>
            <TextField
              placeholder={t('massEditBettingPools.fallPercentage')}
              value={formData.fallPercentage ?? ''}
              onChange={(e) => onInputChange('fallPercentage', e.target.value)}
              type="number"
              size="small"
              sx={{ width: { xs: '100%', sm: 200 } }}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />
          </Box>
        )}

        {/* Balance de desactivación */}
        <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
          <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.deactivationBalance')}</Typography>
          <TextField
            placeholder={t('massEditBettingPools.deactivationBalance')}
            value={formData.deactivationBalance}
            onChange={(e) => onInputChange('deactivationBalance', e.target.value)}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 300 } }}
          />
        </Box>

        {/* Límite de venta diaria */}
        <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
          <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.dailySaleLimit')}</Typography>
          <TextField
            placeholder={t('massEditBettingPools.dailySaleLimit')}
            value={formData.dailySaleLimit}
            onChange={(e) => onInputChange('dailySaleLimit', e.target.value)}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 300 } }}
          />
        </Box>
      </Box>

      {/* SECTION 2: Two columns for toggle groups */}
      <Grid container spacing={4} sx={{ mb: 3 }}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.printTicketCopy')}</Typography>
            <TriStateToggle
              value={formData.printTicketCopy}
              onChange={(val) => onInputChange('printTicketCopy', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.active')}</Typography>
            <TriStateToggle
              value={formData.isActive}
              onChange={(val) => onInputChange('isActive', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.winningTicketControl')}</Typography>
            <TriStateToggle
              value={formData.winningTicketControl}
              onChange={(val) => onInputChange('winningTicketControl', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.useNormalizedPrizes')}</Typography>
            <TriStateToggle
              value={formData.useNormalizedPrizes}
              onChange={(val) => onInputChange('useNormalizedPrizes', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.allowPassingPlays')}</Typography>
            <TriStateToggle
              value={formData.allowPassingPlays}
              onChange={(val) => onInputChange('allowPassingPlays', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.minutesToCancelTicket')}</Typography>
            <TextField
              value={formData.minutesToCancelTicket}
              onChange={(e) => onInputChange('minutesToCancelTicket', e.target.value)}
              size="small"
              sx={{ width: { xs: '100%', sm: 150 } }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.ticketsToCancelPerDay')}</Typography>
            <TextField
              type="number"
              value={formData.ticketsToCancelPerDay}
              onChange={(e) => onInputChange('ticketsToCancelPerDay', e.target.value)}
              size="small"
              sx={{ width: { xs: '100%', sm: 150 } }}
            />
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.language')}</Typography>
            <ToggleButtonGroup
              value={formData.language}
              exclusive
              onChange={(_, newVal) => onInputChange('language', newVal)}
              size="small"
            >
              <ToggleButton value="ESPAÑOL">{t('massEditBettingPools.lang.spanish')}</ToggleButton>
              <ToggleButton value="INGLÉS">{t('massEditBettingPools.lang.english')}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.printMode')}</Typography>
            <ToggleButtonGroup
              value={formData.printMode}
              exclusive
              onChange={(_, newVal) => onInputChange('printMode', newVal)}
              size="small"
            >
              <ToggleButton value="DRIVER">{t('massEditBettingPools.printModeDriver')}</ToggleButton>
              <ToggleButton value="GENÉRICO">{t('massEditBettingPools.printModeGeneric')}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.discountMode')}</Typography>
            <ToggleButtonGroup
              value={formData.discountMode}
              exclusive
              onChange={(_, newVal) => onInputChange('discountMode', newVal)}
              size="small"
            >
              <ToggleButton value="OFF">{t('massEditBettingPools.discount.off')}</ToggleButton>
              <ToggleButton value="GRUPO">{t('massEditBettingPools.discount.group')}</ToggleButton>
              <ToggleButton value="RIFERO">{t('massEditBettingPools.discount.rifero')}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, gap: { xs: 0.5, sm: 2 } }}>
            <Typography sx={{ minWidth: { xs: 'auto', sm: 200 } }}>{t('massEditBettingPools.canChangePassword')}</Typography>
            <TriStateToggle
              value={formData.canChangePassword}
              onChange={(val) => onInputChange('canChangePassword', val)}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

ConfigurationTab.displayName = 'ConfigurationTab';

export default ConfigurationTab;
