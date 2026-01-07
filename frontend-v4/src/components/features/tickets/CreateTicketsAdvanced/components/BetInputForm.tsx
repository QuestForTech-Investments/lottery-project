/**
 * BetInputForm Component
 *
 * Input fields for bet number, amount, and customer name.
 */

import { memo, type FC, type RefObject, type KeyboardEvent } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  FormControlLabel,
  Switch
} from '@mui/material';
import { COLORS } from '../constants';

interface BetInfo {
  isValid: boolean;
  displayName: string;
  section: string | null;
  generator?: string | null;
}

interface BetInputFormProps {
  playNumberRef: RefObject<HTMLInputElement>;
  playAmountRef: RefObject<HTMLInputElement>;
  playNumber: string;
  playAmount: string;
  customerName: string;
  discountEnabled: boolean;
  multiplierEnabled: boolean;
  betInfo: BetInfo;
  validationError: string;
  onPlayNumberChange: (value: string) => void;
  onPlayAmountChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onDiscountEnabledChange: (value: boolean) => void;
  onMultiplierEnabledChange: (value: boolean) => void;
  onPlayNumberKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onPlayAmountKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const BetInputForm: FC<BetInputFormProps> = memo(({
  playNumberRef,
  playAmountRef,
  playNumber,
  playAmount,
  customerName,
  discountEnabled,
  multiplierEnabled,
  betInfo,
  validationError,
  onPlayNumberChange,
  onPlayAmountChange,
  onCustomerNameChange,
  onDiscountEnabledChange,
  onMultiplierEnabledChange,
  onPlayNumberKeyDown,
  onPlayAmountKeyDown,
}) => {
  return (
    <Paper sx={{ padding: 2, marginBottom: 3 }}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            inputRef={playNumberRef}
            label="Jugada"
            placeholder="Ej: 12, 123+, 1234., etc."
            value={playNumber}
            onChange={(e) => onPlayNumberChange(e.target.value)}
            onKeyDown={onPlayNumberKeyDown}
            helperText={playNumber ? betInfo.displayName : 'Ingrese número y presione ENTER'}
            error={playNumber.length > 0 && !betInfo.isValid}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '18px',
                fontWeight: 'bold'
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            inputRef={playAmountRef}
            type="number"
            label="Monto"
            placeholder="$0.00"
            value={playAmount}
            onChange={(e) => onPlayAmountChange(e.target.value)}
            onKeyDown={onPlayAmountKeyDown}
            helperText="Presione ENTER para agregar"
            inputProps={{ min: 1, step: 0.01 }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '18px',
                fontWeight: 'bold'
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Cliente (opcional)"
            placeholder="Nombre"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={discountEnabled}
                  onChange={(e) => onDiscountEnabledChange(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="caption">Desc.</Typography>}
              labelPlacement="top"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={multiplierEnabled}
                  onChange={(e) => onMultiplierEnabledChange(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="caption">Mult.</Typography>}
              labelPlacement="top"
            />
          </Box>
        </Grid>
      </Grid>

      {/* Detection hint */}
      {playNumber && betInfo.isValid && (
        <Box sx={{ marginTop: 2, padding: 1.5, bgcolor: COLORS.detectionBg, borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 'bold' }}>
            Detectado: {betInfo.displayName} - Sección: {betInfo.section}
            {betInfo.generator && ` (Generador: ${betInfo.generator})`}
          </Typography>
        </Box>
      )}

      {/* Validation error */}
      {validationError && (
        <Box sx={{ marginTop: 2, padding: 1.5, bgcolor: COLORS.errorBg, borderRadius: 1, border: `1px solid ${COLORS.errorBorder}` }}>
          <Typography variant="body2" sx={{ color: '#c00', fontWeight: 'bold' }}>
            {validationError}
          </Typography>
        </Box>
      )}
    </Paper>
  );
});

BetInputForm.displayName = 'BetInputForm';

export default BetInputForm;
