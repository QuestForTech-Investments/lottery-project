import { memo, type FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import type { DrawResultRow } from '../../types';
import { COLORS } from '../../constants';
import { getDrawCategory } from '@services/betTypeCompatibilityService';

interface ViewDetailsDialogProps {
  row: DrawResultRow | null;
  open: boolean;
  onClose: () => void;
}

/**
 * View Details Dialog
 *
 * Displays detailed result information for a single draw.
 */
export const ViewDetailsDialog: FC<ViewDetailsDialogProps> = memo(({
  row,
  open,
  onClose,
}) => {
  if (!row) return null;

  const category = getDrawCategory(row.drawName);
  const isUsaDraw = category === 'USA';

  // Build fields array based on lottery type
  const fields: { label: string; value: string }[] = [];

  // Base fields (always shown if have value)
  if (row.num1) fields.push({ label: '1RA', value: row.num1 });
  if (row.num2) fields.push({ label: '2DA', value: row.num2 });
  if (row.num3) fields.push({ label: '3RA', value: row.num3 });

  // USA-specific fields
  if (isUsaDraw) {
    if (row.cash3 != null && row.cash3 !== '') fields.push({ label: 'PICK THREE', value: row.cash3 });
    if (row.play4 != null && row.play4 !== '') fields.push({ label: 'PICK FOUR', value: row.play4 });
    if (row.pick5 != null && row.pick5 !== '') fields.push({ label: 'PICK FIVE', value: row.pick5 });
    if (row.bolita1 != null && row.bolita1 !== '') fields.push({ label: 'BOLITA 1', value: row.bolita1 });
    if (row.bolita2 != null && row.bolita2 !== '') fields.push({ label: 'BOLITA 2', value: row.bolita2 });
    if (row.singulaccion1 != null && row.singulaccion1 !== '') fields.push({ label: 'SINGULACCION 1', value: row.singulaccion1 });
    if (row.singulaccion2 != null && row.singulaccion2 !== '') fields.push({ label: 'SINGULACCION 2', value: row.singulaccion2 });
    if (row.singulaccion3 != null && row.singulaccion3 !== '') fields.push({ label: 'SINGULACCION 3', value: row.singulaccion3 });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: COLORS.primary,
          color: '#fff',
          fontWeight: 600,
          py: 1.5,
        }}
      >
        {row.drawName}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 2,
            py: 1,
          }}
        >
          {fields.map((field, idx) => (
            <Box
              key={idx}
              sx={{
                textAlign: 'center',
                p: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  fontWeight: 600,
                  display: 'block',
                  mb: 0.5,
                  fontSize: '11px',
                }}
              >
                {field.label}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#333',
                  fontSize: '20px',
                }}
              >
                {field.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: COLORS.primary,
            '&:hover': { bgcolor: COLORS.primaryHover },
            textTransform: 'none',
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
});

ViewDetailsDialog.displayName = 'ViewDetailsDialog';

export default ViewDetailsDialog;
