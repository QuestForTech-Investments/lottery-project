import React, { memo, type ChangeEvent } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import type { BetType, PrizeField, PrizesFormData, GeneralValues, CommissionField } from '../types';
import { COMMISSION_FIELDS, COMMISSION_2_FIELDS } from '../constants';

interface Draw {
  id: string;
  name: string;
  drawId?: number;
}

interface BetTypeFieldGridProps {
  betTypes: BetType[];
  activeDraw: string;
  formData: PrizesFormData;
  generalValues: GeneralValues;
  fieldType: 'prize' | 'commission' | 'commission2';
  onFieldChange: (fieldKey: string, value: string) => void;
  onBatchFieldChange?: (updates: Record<string, string | number>) => void;
  bettingPoolId?: number | null;
  saving?: boolean;
  onSave?: () => void;
  draws?: Draw[];
}

/**
 * BetTypeFieldGrid Component
 *
 * Renders a grid of bet type cards with configurable fields.
 * Used for Premios, Comisiones, and Comisiones 2 tabs.
 */
const BetTypeFieldGrid: React.FC<BetTypeFieldGridProps> = memo(({
  betTypes,
  activeDraw,
  formData,
  generalValues,
  fieldType,
  onFieldChange,
  onBatchFieldChange,
  bettingPoolId,
  saving = false,
  onSave,
  draws = [],
}) => {
  /**
   * Generate field key based on field type
   */
  const getFieldKey = (betTypeCode: string, fieldCode: string): string => {
    switch (fieldType) {
      case 'commission':
        return `${activeDraw}_COMMISSION_${betTypeCode}_${fieldCode}`;
      case 'commission2':
        return `${activeDraw}_COMMISSION2_${betTypeCode}_${fieldCode}`;
      default:
        return `${activeDraw}_${betTypeCode}_${fieldCode}`;
    }
  };

  /**
   * Generate field key for a specific draw (used for propagation)
   */
  const getFieldKeyForDraw = (drawId: string, betTypeCode: string, fieldCode: string): string => {
    switch (fieldType) {
      case 'commission':
        return `${drawId}_COMMISSION_${betTypeCode}_${fieldCode}`;
      case 'commission2':
        return `${drawId}_COMMISSION2_${betTypeCode}_${fieldCode}`;
      default:
        return `${drawId}_${betTypeCode}_${fieldCode}`;
    }
  };

  /**
   * Get general key for fallback
   */
  const getGeneralKey = (betTypeCode: string, fieldCode: string): string => {
    switch (fieldType) {
      case 'commission':
        return `general_COMMISSION_${betTypeCode}_${fieldCode}`;
      case 'commission2':
        return `general_COMMISSION2_${betTypeCode}_${fieldCode}`;
      default:
        return `general_${betTypeCode}_${fieldCode}`;
    }
  };

  /**
   * Get field value with fallback logic
   */
  const getFieldValue = (
    betTypeCode: string,
    fieldCode: string,
    defaultValue: number = 0
  ): string | number => {
    const fieldKey = getFieldKey(betTypeCode, fieldCode);
    const currentValue = formData[fieldKey];

    // If "general", use the value directly
    if (activeDraw === 'general') {
      if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
        return currentValue;
      }
      return fieldType === 'prize' ? (defaultValue || '') : '';
    }

    // For specific draw: use fallback
    if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
      return currentValue;
    }

    // Fallback to "general" value
    const generalKey = getGeneralKey(betTypeCode, fieldCode);
    const formDataGenVal = formData[generalKey];
    const generalValue = (formDataGenVal !== undefined && formDataGenVal !== null && formDataGenVal !== '' && typeof formDataGenVal !== 'boolean')
      ? formDataGenVal
      : generalValues[generalKey];

    if (generalValue !== undefined && generalValue !== null && generalValue !== '' && typeof generalValue !== 'boolean') {
      return generalValue;
    }

    return fieldType === 'prize' ? (defaultValue || '') : '';
  };

  /**
   * Build batch updates for propagating a value to all draws
   */
  const buildDrawPropagation = (betTypeCode: string, fieldCode: string, value: string): Record<string, string> => {
    const updates: Record<string, string> = {};
    if (activeDraw === 'general' && draws.length > 0) {
      draws.forEach((draw) => {
        if (draw.id !== 'general' && draw.id.startsWith('draw_')) {
          updates[getFieldKeyForDraw(draw.id, betTypeCode, fieldCode)] = value;
        }
      });
    }
    return updates;
  };

  /**
   * Handle field input change
   * When on General tab, propagates to ALL draws via batch update
   */
  const handleInputChange = (betTypeCode: string, fieldCode: string) => (event: ChangeEvent<HTMLInputElement>): void => {
    const fieldKey = getFieldKey(betTypeCode, fieldCode);
    const value = event.target.value;

    if (value !== '' && !/^-?\d*\.?\d*$/.test(value)) return;

    const drawUpdates = buildDrawPropagation(betTypeCode, fieldCode, value);

    if (onBatchFieldChange && Object.keys(drawUpdates).length > 0) {
      onBatchFieldChange({ [fieldKey]: value, ...drawUpdates });
    } else {
      onFieldChange(fieldKey, value);
    }
  };

  /**
   * Check if a field has a custom value (different from general)
   */
  const hasCustomValue = (betTypeCode: string, fieldCode: string): boolean => {
    if (activeDraw === 'general') return false;
    const fieldKey = getFieldKey(betTypeCode, fieldCode);
    const currentValue = formData[fieldKey];
    return currentValue !== undefined && currentValue !== null && currentValue !== '';
  };

  /**
   * Get fields for a bet type based on field type
   */
  const getFields = (betType: BetType): (PrizeField | CommissionField)[] => {
    switch (fieldType) {
      case 'commission':
        return COMMISSION_FIELDS;
      case 'commission2':
        return COMMISSION_2_FIELDS;
      default:
        return betType.prizeFields || [];
    }
  };

  /**
   * Get placeholder value for input
   */
  const getPlaceholder = (betTypeCode: string, fieldCode: string, defaultValue?: number): string => {
    if (activeDraw === 'general') {
      return fieldType === 'prize' ? (defaultValue?.toString() || '0') : '0';
    }
    const generalKey = getGeneralKey(betTypeCode, fieldCode);
    const generalValue = formData[generalKey] || generalValues[generalKey];
    return `${generalValue || defaultValue || 0}`;
  };

  return (
    <>
      <Grid container spacing={2}>
        {betTypes.map((betType) => {
          const fields = getFields(betType);
          const keyPrefix = fieldType === 'prize' ? '' : `${fieldType}-`;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`${keyPrefix}${betType.betTypeId}`}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: '100%',
                  bgcolor: 'transparent',
                  border: 'none',
                }}
              >
                {/* Bet Type Header */}
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    mb: 1.5,
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 0.5,
                  }}
                >
                  {betType.betTypeName}
                </Typography>

                {/* Fields - Stacked vertically */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {fields.length > 0 ? (
                    fields.map((field) => {
                      const isPrizeField = 'prizeTypeId' in field;
                      const fieldCode = isPrizeField ? (field as PrizeField).fieldCode : (field as CommissionField).fieldCode;
                      const fieldName = isPrizeField ? (field as PrizeField).fieldName : (field as CommissionField).name;
                      const fieldId = isPrizeField ? (field as PrizeField).prizeTypeId : (field as CommissionField).id;
                      const defaultValue = isPrizeField ? (field as PrizeField).defaultMultiplier : 0;
                      const minValue = isPrizeField ? (field as PrizeField).minMultiplier : 0;
                      const maxValue = isPrizeField ? (field as PrizeField).maxMultiplier : (fieldType === 'prize' ? 10000 : 100);
                      const showSuffix = fieldType !== 'prize';

                      return (
                        <Box key={fieldId}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5, fontSize: '0.75rem' }}
                          >
                            {fieldName.includes(' - ') ? fieldName.split(' - ').slice(1).join(' - ') : fieldName}
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            type="text"
                            name={getFieldKey(betType.betTypeCode, fieldCode)}
                            value={getFieldValue(betType.betTypeCode, fieldCode, defaultValue)}
                            onChange={handleInputChange(betType.betTypeCode, fieldCode)}
                            placeholder={getPlaceholder(betType.betTypeCode, fieldCode, defaultValue)}
                            InputProps={showSuffix ? {
                              endAdornment: <Typography variant="caption" sx={{ ml: 1 }}>%</Typography>
                            } : undefined}
                            inputProps={{
                              step: "0.01",
                              min: minValue || 0,
                              max: maxValue || 10000,
                              'data-field-code': fieldCode,
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                              },
                              '& .MuiOutlinedInput-input': {
                                py: 1,
                                fontSize: '0.9rem',
                              }
                            }}
                          />
                        </Box>
                      );
                    })
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Sin campos
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* ACTUALIZAR button */}
      {bettingPoolId && onSave && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={onSave}
            disabled={saving}
            sx={{
              bgcolor: '#8b5cf6',
              '&:hover': { bgcolor: '#7c3aed' },
              color: 'white',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {saving ? 'Guardando...' : 'ACTUALIZAR'}
          </Button>
        </Box>
      )}
    </>
  );
});

BetTypeFieldGrid.displayName = 'BetTypeFieldGrid';

export default BetTypeFieldGrid;
