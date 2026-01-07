/**
 * ActionButtons Component
 *
 * Action buttons for ticket operations (duplicate, create, reset, help).
 */

import { memo, type FC } from 'react';
import { Box, Paper, Button, Typography } from '@mui/material';
import { Receipt, RotateCcw, Copy, HelpCircle } from 'lucide-react';
import { COLORS } from '../constants';

interface ActionButtonsProps {
  hasLines: boolean;
  onDuplicate: () => void;
  onCreate: () => void;
  onReset: () => void;
  onHelp: () => void;
}

const ActionButtons: FC<ActionButtonsProps> = memo(({
  hasLines,
  onDuplicate,
  onCreate,
  onReset,
  onHelp,
}) => {
  return (
    <Paper sx={{ padding: 3, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<Copy size={20} />}
          onClick={onDuplicate}
          disabled={!hasLines}
          sx={{
            borderColor: COLORS.secondary,
            color: COLORS.secondary,
            '&:hover': { borderColor: '#5a6268', bgcolor: 'rgba(108, 117, 125, 0.04)' },
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Duplicar (c)
        </Button>

        <Button
          variant="contained"
          startIcon={<Receipt size={20} />}
          onClick={onCreate}
          disabled={!hasLines}
          sx={{
            bgcolor: hasLines ? COLORS.primary : '#ccc',
            '&:hover': { bgcolor: hasLines ? COLORS.primaryHover : '#ccc' },
            color: 'white',
            textTransform: 'none',
            fontWeight: 'bold',
            paddingX: 4
          }}
        >
          Crear Ticket (*)
        </Button>

        <Button
          variant="outlined"
          startIcon={<RotateCcw size={20} />}
          onClick={onReset}
          sx={{
            borderColor: COLORS.secondary,
            color: COLORS.secondary,
            '&:hover': { borderColor: '#5a6268', bgcolor: 'rgba(108, 117, 125, 0.04)' },
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Limpiar (L)
        </Button>

        <Button
          variant="outlined"
          startIcon={<HelpCircle size={20} />}
          onClick={onHelp}
          sx={{
            borderColor: COLORS.primary,
            color: COLORS.primary,
            '&:hover': { borderColor: COLORS.primaryHover, bgcolor: 'rgba(81, 203, 206, 0.04)' },
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Ayuda
        </Button>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
          Atajos: ↑ = Limpiar campos | L = Cancelar | / = Cambiar lotería | * = Imprimir | c = Duplicar
        </Typography>
      </Box>
    </Paper>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
