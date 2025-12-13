/**
 * ResultsTableRow Component
 *
 * Memoized table row component for displaying a single draw result.
 * Uses custom comparison function to prevent unnecessary re-renders.
 *
 * Performance: Only re-renders when the row's actual data changes,
 * not when other rows in the table change.
 */

import React, { memo, useCallback } from 'react';
import {
  Box,
  TableRow,
  TableCell,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';
import type { DrawResultRow, ResultsTableRowProps, EnabledFields } from '../../types';
import {
  TABLE_CELL_STYLES,
  INPUT_STYLES,
  COLORS,
  FIELD_MAX_LENGTHS,
  FIELD_WIDTHS,
} from '../../constants';

// =============================================================================
// Custom Comparison Function
// =============================================================================

/**
 * Custom comparison for React.memo
 * Returns true if props are equal (should NOT re-render)
 */
const arePropsEqual = (
  prev: ResultsTableRowProps,
  next: ResultsTableRowProps
): boolean => {
  const p = prev.row;
  const n = next.row;

  // Compare all fields that affect rendering
  return (
    p.drawId === n.drawId &&
    p.drawName === n.drawName &&
    p.num1 === n.num1 &&
    p.num2 === n.num2 &&
    p.num3 === n.num3 &&
    p.cash3 === n.cash3 &&
    p.play4 === n.play4 &&
    p.pick5 === n.pick5 &&
    p.isDirty === n.isDirty &&
    p.isSaving === n.isSaving &&
    p.hasResult === n.hasResult &&
    p.matchesExternal === n.matchesExternal &&
    // enabledFields comparison (deep comparison of relevant fields)
    prev.enabledFields?.num1 === next.enabledFields?.num1 &&
    prev.enabledFields?.num2 === next.enabledFields?.num2 &&
    prev.enabledFields?.num3 === next.enabledFields?.num3 &&
    prev.enabledFields?.cash3 === next.enabledFields?.cash3 &&
    prev.enabledFields?.play4 === next.enabledFields?.play4 &&
    prev.enabledFields?.pick5 === next.enabledFields?.pick5 &&
    // Callbacks should be stable (wrapped in useCallback)
    prev.onFieldChange === next.onFieldChange &&
    prev.onSave === next.onSave &&
    prev.onDelete === next.onDelete &&
    prev.onEdit === next.onEdit
  );
};

// =============================================================================
// Sub-components
// =============================================================================

interface InputCellProps {
  value: string;
  enabled: boolean;
  isSaving: boolean;
  maxLength: number;
  width: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Input cell for a number field
 */
const InputCell = memo<InputCellProps>(
  ({ value, enabled, isSaving, maxLength, width, onChange }) => {
    const hasValue = Boolean(value);

    // If field is disabled but HAS a value, show it as read-only text
    // This is important for USA draws where num1/num2/num3/pick5 are auto-calculated
    if (!enabled) {
      return (
        <TableCell
          align="center"
          sx={{
            p: 0.5,
            bgcolor: hasValue ? COLORS.cellWithValue : COLORS.cellEmpty,
            borderRight: `1px solid ${COLORS.border}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: hasValue ? '#333' : COLORS.textDisabled,
              fontSize: '13px',
              fontWeight: hasValue ? 600 : 400,
            }}
          >
            {hasValue ? value : '-'}
          </Typography>
        </TableCell>
      );
    }

    return (
      <TableCell
        align="center"
        sx={{
          p: 0.5,
          bgcolor: hasValue ? COLORS.cellWithValue : COLORS.cellEmpty,
          borderRight: `1px solid ${COLORS.border}`,
        }}
      >
        <TextField
          value={value}
          onChange={onChange}
          disabled={isSaving}
          size="small"
          inputProps={{
            maxLength,
            style: INPUT_STYLES.inputProps,
          }}
          sx={{
            width,
            ...INPUT_STYLES.textField,
          }}
        />
      </TableCell>
    );
  }
);

InputCell.displayName = 'InputCell';

// =============================================================================
// Main Component
// =============================================================================

/**
 * ResultsTableRow - Memoized row component
 *
 * @example
 * <ResultsTableRow
 *   row={drawResultRow}
 *   enabledFields={enabledFieldsMap.get(drawId)}
 *   onFieldChange={handleFieldChange}
 *   onSave={handleSave}
 *   onEdit={handleEdit}
 * />
 */
export const ResultsTableRow = memo<ResultsTableRowProps>(
  ({ row, enabledFields, onFieldChange, onSave, onDelete, onEdit }) => {
    // enabledFields is now passed as prop for better performance
    // Prevents calling getEnabledFields() on every render

    // -------------------------------------------------------------------------
    // Handlers (stable references)
    // -------------------------------------------------------------------------

    const handleChange = useCallback(
      (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onFieldChange(row.drawId, field, e.target.value, e.target);
      },
      [row.drawId, onFieldChange]
    );

    const handleSave = useCallback(() => {
      onSave(row);
    }, [row, onSave]);

    const handleDelete = useCallback(() => {
      onDelete(row);
    }, [row, onDelete]);

    const handleEdit = useCallback(() => {
      onEdit(row);
    }, [row, onEdit]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <TableRow hover sx={{ '&:hover': { bgcolor: COLORS.rowHover } }}>
        {/* Draw Name Cell */}
        <TableCell sx={TABLE_CELL_STYLES.drawName}>
          {row.drawName}
          {row.matchesExternal === false && (
            <Tooltip title="No coincide con externo">
              <WarningIcon
                sx={{
                  ml: 1,
                  fontSize: 14,
                  color: COLORS.warning,
                  verticalAlign: 'middle',
                }}
              />
            </Tooltip>
          )}
        </TableCell>

        {/* Number Input Cells */}
        <InputCell
          value={row.num1}
          enabled={enabledFields.num1}
          isSaving={row.isSaving}
          maxLength={FIELD_MAX_LENGTHS.num1}
          width={FIELD_WIDTHS.num1}
          onChange={handleChange('num1')}
        />
        <InputCell
          value={row.num2}
          enabled={enabledFields.num2}
          isSaving={row.isSaving}
          maxLength={FIELD_MAX_LENGTHS.num2}
          width={FIELD_WIDTHS.num2}
          onChange={handleChange('num2')}
        />
        <InputCell
          value={row.num3}
          enabled={enabledFields.num3}
          isSaving={row.isSaving}
          maxLength={FIELD_MAX_LENGTHS.num3}
          width={FIELD_WIDTHS.num3}
          onChange={handleChange('num3')}
        />
        <InputCell
          value={row.cash3}
          enabled={enabledFields.cash3}
          isSaving={row.isSaving}
          maxLength={FIELD_MAX_LENGTHS.cash3}
          width={FIELD_WIDTHS.cash3}
          onChange={handleChange('cash3')}
        />
        <InputCell
          value={row.play4}
          enabled={enabledFields.play4}
          isSaving={row.isSaving}
          maxLength={FIELD_MAX_LENGTHS.play4}
          width={FIELD_WIDTHS.play4}
          onChange={handleChange('play4')}
        />
        <InputCell
          value={row.pick5}
          enabled={enabledFields.pick5}
          isSaving={row.isSaving}
          maxLength={FIELD_MAX_LENGTHS.pick5}
          width={FIELD_WIDTHS.pick5}
          onChange={handleChange('pick5')}
        />

        {/* View Details Button Cell */}
        <TableCell align="center" sx={{ p: 0.5 }}>
          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={row.isSaving}
            sx={TABLE_CELL_STYLES.saveButton}
          >
            {row.isSaving ? <CircularProgress size={12} color="inherit" /> : 'ver'}
          </Button>
        </TableCell>

        {/* Edit & Delete Icons Cell - stacked vertically like original app */}
        <TableCell align="center" sx={{ p: 0.25 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={handleEdit} sx={{ color: COLORS.primary, p: 0.25 }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Borrar resultado">
              <span>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  disabled={!row.hasResult || row.isSaving}
                  sx={{ color: row.hasResult ? '#d32f2f' : '#ccc', p: 0.25 }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
    );
  },
  arePropsEqual
);

ResultsTableRow.displayName = 'ResultsTableRow';

export default ResultsTableRow;
