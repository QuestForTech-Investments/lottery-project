/**
 * AdditionalDataSection Component
 *
 * Optional customer data and global settings.
 */

import { memo, type FC } from 'react';
import { Card, CardContent, Typography, Grid, TextField } from '@mui/material';
import type { AdditionalDataSectionProps } from '../types';
import { SECTION_TITLE_STYLE } from '../constants';

const AdditionalDataSection: FC<AdditionalDataSectionProps> = memo(({
  customerName,
  customerPhone,
  globalMultiplier,
  globalDiscount,
  notes,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onGlobalMultiplierChange,
  onGlobalDiscountChange,
  onNotesChange,
}) => (
  <Card sx={{ marginBottom: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={SECTION_TITLE_STYLE}>
        Datos Adicionales (Opcional)
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre del Cliente"
            placeholder="Juan Perez"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Telefono"
            placeholder="809-555-1234"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            inputProps={{ maxLength: 20 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Multiplicador Global"
            value={globalMultiplier}
            onChange={(e) => onGlobalMultiplierChange(e.target.value)}
            inputProps={{ min: 1, max: 100, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Descuento Global (%)"
            value={globalDiscount}
            onChange={(e) => onGlobalDiscountChange(e.target.value)}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notas"
            placeholder="Notas adicionales..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            inputProps={{ maxLength: 500 }}
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
));

AdditionalDataSection.displayName = 'AdditionalDataSection';

export default AdditionalDataSection;
