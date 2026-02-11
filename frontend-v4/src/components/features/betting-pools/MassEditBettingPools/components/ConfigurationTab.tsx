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
} from '@mui/material';
import TriStateToggle from './TriStateToggle';
import type { ConfigurationTabProps } from '../types';

const ConfigurationTab: FC<ConfigurationTabProps> = memo(({ formData, zones, onInputChange }) => {
  return (
    <Box>
      {/* SECTION 1: Full-width fields */}
      <Box sx={{ mb: 3 }}>
        {/* Zona */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography sx={{ minWidth: 200 }}>Zona</Typography>
          <FormControl sx={{ minWidth: 300 }} size="small">
            <Select
              value={formData.zoneId}
              displayEmpty
              onChange={(e) => onInputChange('zoneId', e.target.value)}
            >
              <MenuItem value="">
                <em>Seleccione</em>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography sx={{ minWidth: 200 }}>Tipo de caída</Typography>
          <ToggleButtonGroup
            value={formData.fallType}
            exclusive
            onChange={(_, newVal) => onInputChange('fallType', newVal)}
            size="small"
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="OFF">OFF</ToggleButton>
            <ToggleButton value="COBRO">COBRO</ToggleButton>
            <ToggleButton value="DIARIA">DIARIA</ToggleButton>
            <ToggleButton value="MENSUAL">MENSUAL</ToggleButton>
            <ToggleButton value="SEMANAL_CON_ACUMULADO">SEMANAL CON ACUMULADO</ToggleButton>
            <ToggleButton value="SEMANAL_SIN_ACUMULADO">SEMANAL SIN ACUMULADO</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Balance de desactivación */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography sx={{ minWidth: 200 }}>Balance de desactivación</Typography>
          <TextField
            placeholder="Balance de desactivación"
            value={formData.deactivationBalance}
            onChange={(e) => onInputChange('deactivationBalance', e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
          />
        </Box>

        {/* Límite de venta diaria */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography sx={{ minWidth: 200 }}>Límite de venta diaria</Typography>
          <TextField
            placeholder="Límite de venta diaria"
            value={formData.dailySaleLimit}
            onChange={(e) => onInputChange('dailySaleLimit', e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
          />
        </Box>
      </Box>

      {/* SECTION 2: Two columns for toggle groups */}
      <Grid container spacing={4} sx={{ mb: 3 }}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Imprimir copia de ticket</Typography>
            <TriStateToggle
              value={formData.printTicketCopy}
              onChange={(val) => onInputChange('printTicketCopy', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Activa</Typography>
            <TriStateToggle
              value={formData.isActive}
              onChange={(val) => onInputChange('isActive', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Control de tickets ganadores</Typography>
            <TriStateToggle
              value={formData.winningTicketControl}
              onChange={(val) => onInputChange('winningTicketControl', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Usar premios normalizados</Typography>
            <TriStateToggle
              value={formData.useNormalizedPrizes}
              onChange={(val) => onInputChange('useNormalizedPrizes', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Permitir pasar bote</Typography>
            <TriStateToggle
              value={formData.allowPassingPlays}
              onChange={(val) => onInputChange('allowPassingPlays', val)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Minutos para cancelar tickets</Typography>
            <TextField
              value={formData.minutesToCancelTicket}
              onChange={(e) => onInputChange('minutesToCancelTicket', e.target.value)}
              size="small"
              sx={{ width: 150 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Tickets a cancelar por día</Typography>
            <TextField
              type="number"
              value={formData.ticketsToCancelPerDay}
              onChange={(e) => onInputChange('ticketsToCancelPerDay', e.target.value)}
              size="small"
              sx={{ width: 150 }}
            />
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Idioma</Typography>
            <ToggleButtonGroup
              value={formData.language}
              exclusive
              onChange={(_, newVal) => onInputChange('language', newVal)}
              size="small"
            >
              <ToggleButton value="ESPAÑOL">ESPAÑOL</ToggleButton>
              <ToggleButton value="INGLÉS">INGLÉS</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Modo de impresión</Typography>
            <ToggleButtonGroup
              value={formData.printMode}
              exclusive
              onChange={(_, newVal) => onInputChange('printMode', newVal)}
              size="small"
            >
              <ToggleButton value="DRIVER">DRIVER</ToggleButton>
              <ToggleButton value="GENÉRICO">GENÉRICO</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Modo de descuento</Typography>
            <ToggleButtonGroup
              value={formData.discountMode}
              exclusive
              onChange={(_, newVal) => onInputChange('discountMode', newVal)}
              size="small"
            >
              <ToggleButton value="OFF">OFF</ToggleButton>
              <ToggleButton value="GRUPO">GRUPO</ToggleButton>
              <ToggleButton value="RIFERO">RIFERO</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ minWidth: 200 }}>Permitir cambiar contraseña</Typography>
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
