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
   * When on General tab, also clears any draw-specific overrides
   */
  const handleGeneralFieldChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;

    if (value !== '' && !/^-?\d*\.?\d*$/.test(value)) {
      return;
    }

    // Update fields for current activeDraw
    betTypes.forEach((betType) => {
      const key = getFieldKey(betType.betTypeCode);
      onFieldChange(key, value);
    });

    // When on General tab, also clear any draw-specific overrides
    // so the new General value takes effect everywhere
    if (activeDraw === 'general') {
      // Find all draw-specific keys in formData and update them
      Object.keys(formData).forEach((existingKey) => {
        // Match draw-specific commission keys: draw_XX_COMMISSION_BETTYPE_COMMISSION_DISCOUNT_1
        const drawKeyPattern = new RegExp(`^draw_\\d+_${prefix}_(.+)_${fieldCode}$`);
        const match = existingKey.match(drawKeyPattern);
        if (match) {
          // Update this draw-specific key with the new value
          onFieldChange(existingKey, value);
        }
      });
    }
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

      {/* "General" field - own row, aligned with first grid column */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        mb: 1,
        width: {
          xs: 'calc((100% - 12px) / 3)',
          sm: 'calc((100% - 18px) / 4)',
          lg: 'calc((100% - 30px) / 6)',
        },
      }}>
        <Typography
          variant="body2"
          sx={{
            textAlign: 'right',
            flex: 1,
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: 'text.secondary',
          }}
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
            width: 70,
            minWidth: 70,
            '& .MuiOutlinedInput-root': { height: 31 },
            '& .MuiOutlinedInput-input': { py: '4px', px: '8px', fontSize: '0.8rem' },
          }}
        />
      </Box>

      {/* Responsive grid matching original Bootstrap: col-4 / col-sm-3 / col-lg-3 / col-xl-2 */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(3, 1fr)',
          sm: 'repeat(4, 1fr)',
          lg: 'repeat(6, 1fr)',
        },
        gap: 0.75,
        rowGap: 1,
      }}>
        {/* Individual bet type fields */}
        {showPerPlayList && betTypes.map((betType) => (
          <Box
            key={betType.betTypeId}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Typography
              variant="body2"
              sx={{
                textAlign: 'right',
                flex: 1,
                fontSize: '0.8rem',
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
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
                width: 70,
                minWidth: 70,
                '& .MuiOutlinedInput-root': { height: 31 },
                '& .MuiOutlinedInput-input': { py: '4px', px: '8px', fontSize: '0.8rem' },
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
