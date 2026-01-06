/**
 * PrizesTab Component
 *
 * Prizes and commissions settings with sub-tabs.
 */

import { memo, type FC } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import type { PrizesTabProps } from '../types';

const PrizesTab: FC<PrizesTabProps> = memo(({
  betTypes,
  loadingBetTypes,
  prizesSubTab,
  formData,
  onSubTabChange,
  onPrizeFieldChange,
  onCommissionChange,
  onGeneralCommissionChange,
  onCommissionTypeChange,
}) => {
  return (
    <Box>
      {/* Sub-tabs */}
      <Tabs
        value={prizesSubTab}
        onChange={(_, newVal) => onSubTabChange(newVal)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Premios" />
        <Tab label="Comisiones" />
        <Tab label="Comisiones 2" />
      </Tabs>

      {loadingBetTypes ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>Cargando tipos de apuesta...</Typography>
        </Box>
      ) : (
        <>
          {/* Premios Sub-tab */}
          {prizesSubTab === 0 && (
            <Grid container spacing={3}>
              {betTypes.map(betType => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={betType.betTypeId}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {betType.betTypeName}
                    </Typography>
                    {betType.prizeFields && betType.prizeFields.length > 0 ? (
                      betType.prizeFields.map(field => {
                        const fieldKey = `prize_${betType.betTypeCode}_${field.fieldCode}`;
                        return (
                          <Box key={field.prizeTypeId} sx={{ mb: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {field.fieldName}
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              type="text"
                              value={formData[fieldKey] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^[\d.]*$/.test(val)) {
                                  onPrizeFieldChange(betType.betTypeCode, field.fieldCode, val);
                                }
                              }}
                              placeholder={field.defaultMultiplier?.toString() || ''}
                              inputProps={{ style: { fontSize: '0.875rem' } }}
                            />
                          </Box>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
                        Sin campos de premios configurados
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Comisiones Sub-tab */}
          {prizesSubTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* General Commission */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 200, fontWeight: 500 }}>
                  General
                </Typography>
                <TextField
                  size="small"
                  type="text"
                  value={formData.generalCommission || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[\d.]*$/.test(val)) {
                      onGeneralCommissionChange(val);
                    }
                  }}
                  placeholder="0"
                  sx={{ maxWidth: 150 }}
                />
              </Box>
              <Divider />
              {/* Per Bet Type Commissions */}
              {betTypes.map(betType => (
                <Box key={betType.betTypeId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 200, fontWeight: 500 }}>
                    {betType.betTypeName}
                  </Typography>
                  <TextField
                    size="small"
                    type="text"
                    value={formData[`commission_${betType.betTypeCode}`] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^[\d.]*$/.test(val)) {
                        onCommissionChange(betType.betTypeCode, val);
                      }
                    }}
                    placeholder="0"
                    sx={{ maxWidth: 150 }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Comisiones 2 Sub-tab */}
          {prizesSubTab === 2 && (
            <Box sx={{ p: 2 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 500, mb: 1 }}>
                  Tipo de comisión
                </FormLabel>
                <RadioGroup
                  value={formData.commissionType || ''}
                  onChange={(e) => onCommissionTypeChange(e.target.value)}
                >
                  <FormControlLabel
                    value="general"
                    control={<Radio />}
                    label="General"
                  />
                  <FormControlLabel
                    value="por_jugada"
                    control={<Radio />}
                    label="Por jugada"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          )}
        </>
      )}
    </Box>
  );
});

PrizesTab.displayName = 'PrizesTab';

export default PrizesTab;
