import React, { memo, useState, type ChangeEvent } from 'react';
import {
  TextField,
  Typography,
  Box,
  Button,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import type { BetType, PrizesFormData, GeneralValues } from '../types';

interface CommissionFieldListProps {
  betTypes: BetType[];
  activeDraw: string;
  formData: PrizesFormData;
  generalValues: GeneralValues;
  fieldType: 'commission' | 'commission2';
  onFieldChange: (fieldKey: string, value: string) => void;
  bettingPoolId?: number | null;
  saving?: boolean;
  onSave?: () => void;
}

/**
 * CommissionFieldList Component
 *
 * Simple vertical list with one field per bet type, matching the original app.
 * - "General" field at top propagates to all bet types
 * - Commission 2 includes a "General" / "Por jugada" radio toggle
 */
const CommissionFieldList: React.FC<CommissionFieldListProps> = memo(({
  betTypes,
  activeDraw,
  formData,
  generalValues,
  fieldType,
  onFieldChange,
  bettingPoolId,
  saving = false,
  onSave,
}) => {
  const [commission2Mode, setCommission2Mode] = useState<'general' | 'perPlay'>('general');

  const fieldCode = fieldType === 'commission' ? 'COMMISSION_DISCOUNT_1' : 'COMMISSION_2_DISCOUNT_1';
  const prefix = fieldType === 'commission' ? 'COMMISSION' : 'COMMISSION2';

  /**
   * Generate formData key for a bet type
   */
  const getFieldKey = (betTypeCode: string): string => {
    return `${activeDraw}_${prefix}_${betTypeCode}_${fieldCode}`;
  };

  /**
   * Get general key for fallback
   */
  const getGeneralKey = (betTypeCode: string): string => {
    return `general_${prefix}_${betTypeCode}_${fieldCode}`;
  };

  /**
   * Get field value with fallback logic
   */
  const getFieldValue = (betTypeCode: string): string | number => {
    const key = getFieldKey(betTypeCode);
    const currentValue = formData[key];

    if (activeDraw === 'general') {
      if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
        return currentValue;
      }
      return '';
    }

    if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
      return currentValue;
    }

    // Fallback to general draw value
    const generalKey = getGeneralKey(betTypeCode);
    const formDataGenVal = formData[generalKey];
    const generalValue = (formDataGenVal !== undefined && formDataGenVal !== null && formDataGenVal !== '' && typeof formDataGenVal !== 'boolean')
      ? formDataGenVal
      : generalValues[generalKey];

    if (generalValue !== undefined && generalValue !== null && generalValue !== '' && typeof generalValue !== 'boolean') {
      return generalValue;
    }

    return '';
  };

  /**
   * Handle input change for a single bet type
   */
  const handleInputChange = (betTypeCode: string) => (event: ChangeEvent<HTMLInputElement>): void => {
    const key = getFieldKey(betTypeCode);
    const value = event.target.value;

    if (value === '') {
      onFieldChange(key, '');
      return;
    }

    const numberRegex = /^-?\d*\.?\d*$/;
    if (numberRegex.test(value)) {
      onFieldChange(key, value);
    }
  };

  /**
   * Handle "General" field at top - propagates value to all bet types
   */
  const handleGeneralFieldChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;

    if (value !== '' && !/^-?\d*\.?\d*$/.test(value)) {
      return;
    }

    betTypes.forEach((betType) => {
      const key = getFieldKey(betType.betTypeCode);
      onFieldChange(key, value);
    });
  };

  /**
   * Get the "General" top-level field value.
   * If all bet types have the same value, show that; otherwise empty.
   */
  const getGeneralTopValue = (): string => {
    if (betTypes.length === 0) return '';
    const firstVal = String(getFieldValue(betTypes[0].betTypeCode));
    const allSame = betTypes.every(bt => String(getFieldValue(bt.betTypeCode)) === firstVal);
    return allSame ? firstVal : '';
  };

  const isCommission2 = fieldType === 'commission2';
  const showPerPlayList = !isCommission2 || commission2Mode === 'perPlay';

  return (
    <>
      {/* Commission 2: Radio toggle */}
      {isCommission2 && (
        <FormControl sx={{ mb: 2 }}>
          <RadioGroup
            row
            value={commission2Mode}
            onChange={(e) => setCommission2Mode(e.target.value as 'general' | 'perPlay')}
          >
            <FormControlLabel value="general" control={<Radio size="small" />} label="General" />
            <FormControlLabel value="perPlay" control={<Radio size="small" />} label="Por jugada" />
          </RadioGroup>
        </FormControl>
      )}

      {/* Field list - 3 columns grid matching original app */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, rowGap: 1.5 }}>
        {/* "General" field at top */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{ textAlign: 'right', minWidth: 80, fontSize: '0.85rem', fontWeight: 'bold', color: 'text.secondary' }}
          >
            General
          </Typography>
          <TextField
            size="small"
            type="text"
            value={getGeneralTopValue()}
            onChange={handleGeneralFieldChange}
            placeholder="0"
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-input': { py: 0.75, px: 1, fontSize: '0.9rem' },
            }}
          />
        </Box>

        {/* Individual bet type fields */}
        {showPerPlayList && betTypes.map((betType) => (
          <Box
            key={betType.betTypeId}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Typography
              variant="body2"
              sx={{ textAlign: 'right', minWidth: 80, fontSize: '0.85rem', color: 'text.secondary' }}
            >
              {betType.betTypeName}
            </Typography>
            <TextField
              size="small"
              type="text"
              name={getFieldKey(betType.betTypeCode)}
              value={getFieldValue(betType.betTypeCode)}
              onChange={handleInputChange(betType.betTypeCode)}
              placeholder="0"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-input': { py: 0.75, px: 1, fontSize: '0.9rem' },
              }}
            />
          </Box>
        ))}
      </Box>

      {/* ACTUALIZAR button */}
      {bettingPoolId && onSave && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={onSave}
            disabled={saving}
            sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
              color: 'white',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            {saving ? 'Guardando...' : 'ACTUALIZAR'}
          </Button>
        </Box>
      )}
    </>
  );
});

CommissionFieldList.displayName = 'CommissionFieldList';

export default CommissionFieldList;
