/**
 * ResultEntryForm Component
 *
 * Individual result entry form with dynamic fields based on draw category.
 */

import { memo, useRef, type FC, type ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  type SelectChangeEvent,
} from '@mui/material';
import { COLORS } from '../constants';
import { getEnabledFields, sanitizeNumberInput, getIndividualMaxLength } from '../utils';
import type { DrawResultRow, IndividualResultForm as IndividualResultFormType } from '../types';

interface ResultEntryFormProps {
  selectedDate: string;
  drawResults: DrawResultRow[];
  individualForm: IndividualResultFormType;
  savingIndividual: boolean;
  onDateChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrawSelect: (event: SelectChangeEvent<number>) => void;
  onFormChange: (field: keyof IndividualResultFormType, value: string, enabledFieldsList?: string[]) => void;
  onPublish: () => void;
}

const ResultEntryForm: FC<ResultEntryFormProps> = memo(({
  selectedDate,
  drawResults,
  individualForm,
  savingIndividual,
  onDateChange,
  onDrawSelect,
  onFormChange,
  onPublish,
}) => {
  const individualFormRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const selectedDraw = drawResults.find((d) => d.drawId === individualForm.selectedDrawId);
  const enabledFields = selectedDraw ? getEnabledFields(selectedDraw.drawName) : getEnabledFields('');

  // Define all possible fields with their configuration
  const allFields = [
    { field: 'num1' as const, label: '1ra', maxLen: 2, enabled: enabledFields.num1 },
    { field: 'num2' as const, label: '2da', maxLen: 2, enabled: enabledFields.num2 },
    { field: 'num3' as const, label: '3ra', maxLen: 2, enabled: enabledFields.num3 },
    { field: 'cash3' as const, label: 'Pick 3', maxLen: 3, enabled: enabledFields.cash3 },
    { field: 'pickFour' as const, label: 'Pick 4', maxLen: 4, enabled: enabledFields.play4 },
    { field: 'pickFive' as const, label: 'Pick 5', maxLen: 5, enabled: enabledFields.pick5 },
    { field: 'bolita1' as const, label: 'Bolita 1', maxLen: 2, enabled: enabledFields.bolita1 },
    { field: 'bolita2' as const, label: 'Bolita 2', maxLen: 2, enabled: enabledFields.bolita2 },
    { field: 'singulaccion1' as const, label: 'Sing. 1', maxLen: 1, enabled: enabledFields.singulaccion1 },
    { field: 'singulaccion2' as const, label: 'Sing. 2', maxLen: 1, enabled: enabledFields.singulaccion2 },
    { field: 'singulaccion3' as const, label: 'Sing. 3', maxLen: 1, enabled: enabledFields.singulaccion3 },
  ];

  // Check if this is a USA draw
  const isUsaDraw = enabledFields.cash3 && enabledFields.play4 && !enabledFields.num1;

  // For USA draws, show all fields; for others, only show enabled fields
  const visibleFields = isUsaDraw ? allFields : allFields.filter((f) => f.enabled);

  // For auto-advance, only consider editable fields
  const editableFieldsList = visibleFields.filter((f) => f.enabled).map((f) => f.field);

  const handleFieldChange = (field: keyof IndividualResultFormType, value: string) => {
    onFormChange(field, value, editableFieldsList);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, border: '1px solid #ddd' }}>
      {/* Row 1: Date + Draw Dropdown */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontSize: '12px' }}>
            Fecha
          </Typography>
          <TextField
            type="date"
            value={selectedDate}
            onChange={onDateChange}
            size="small"
            sx={{ width: 200, bgcolor: '#fff' }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontSize: '12px' }}>
            Sorteo
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={individualForm.selectedDrawId || ''}
              onChange={onDrawSelect}
              sx={{ bgcolor: '#fff' }}
            >
              {drawResults
                .filter((draw) => !draw.hasResult || draw.drawId === individualForm.selectedDrawId)
                .map((draw) => (
                  <MenuItem key={draw.drawId} value={draw.drawId}>
                    {draw.drawName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Row 2: Dynamic Input Fields */}
      {individualForm.selectedDrawId && (
        <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            <Box sx={{ width: 140, p: 1, borderRight: '1px solid #ddd' }}></Box>
            {visibleFields.map((f, idx) => (
              <Box
                key={f.field}
                sx={{
                  flex: 1,
                  p: 1,
                  textAlign: 'center',
                  borderRight: idx < visibleFields.length - 1 ? '1px solid #ddd' : 'none',
                  fontSize: '12px',
                  color: f.enabled ? '#333' : '#999',
                  fontWeight: f.enabled ? 600 : 400,
                }}
              >
                {f.label}
              </Box>
            ))}
          </Box>
          {/* Input row */}
          <Box sx={{ display: 'flex', bgcolor: '#fff' }}>
            <Box
              sx={{
                width: 140,
                p: 1,
                borderRight: '1px solid #ddd',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {selectedDraw?.drawName}
            </Box>
            {visibleFields.map((f, idx) => (
              <Box
                key={f.field}
                sx={{
                  flex: 1,
                  p: 0.5,
                  borderRight: idx < visibleFields.length - 1 ? '1px solid #ddd' : 'none',
                  bgcolor: f.enabled ? '#fff' : '#f5f5f5',
                }}
              >
                <TextField
                  value={individualForm[f.field]}
                  onChange={(e) => handleFieldChange(f.field, e.target.value)}
                  inputRef={(el) => {
                    individualFormRefs.current[f.field] = el;
                  }}
                  disabled={!f.enabled}
                  size="small"
                  inputProps={{
                    maxLength: f.maxLen,
                    style: {
                      textAlign: 'center',
                      padding: '8px',
                      color: f.enabled ? '#333' : '#666',
                      fontWeight: f.enabled ? 700 : 400,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: f.enabled ? '#fff' : '#f0f0f0',
                      '&.Mui-disabled': {
                        bgcolor: '#f5f5f5',
                        '& fieldset': { border: '1px solid #ddd' },
                      },
                    },
                  }}
                  fullWidth
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Publish Button */}
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={onPublish}
          disabled={!individualForm.selectedDrawId || savingIndividual}
          sx={{
            bgcolor: COLORS.primary,
            '&:hover': { bgcolor: COLORS.primaryHover },
            textTransform: 'uppercase',
            fontWeight: 600,
            px: 3,
            color: '#fff',
          }}
        >
          {savingIndividual ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'PUBLICAR RESULTADO'
          )}
        </Button>
      </Box>
    </Paper>
  );
});

ResultEntryForm.displayName = 'ResultEntryForm';

export default ResultEntryForm;
