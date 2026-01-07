/**
 * FormActions Component
 *
 * Cancel and submit buttons for the form.
 */

import { memo, type FC } from 'react';
import { Box, Button } from '@mui/material';
import type { FormActionsProps } from '../types';
import { PILL_BUTTON_STYLE, PRIMARY_BUTTON_STYLE } from '../constants';

const FormActions: FC<FormActionsProps> = memo(({ saving, onCancel }) => (
  <Box
    sx={{
      p: 3,
      borderTop: 1,
      borderColor: 'divider',
      bgcolor: '#f8f9fa',
      display: 'flex',
      justifyContent: 'center',
      gap: 2,
    }}
  >
    <Button
      variant="outlined"
      onClick={onCancel}
      disabled={saving}
      sx={PILL_BUTTON_STYLE}
    >
      Cancelar
    </Button>
    <Button
      type="submit"
      variant="contained"
      disabled={saving}
      sx={PRIMARY_BUTTON_STYLE}
    >
      {saving ? 'Guardando cambios...' : 'Guardar cambios'}
    </Button>
  </Box>
));

FormActions.displayName = 'FormActions';

export default FormActions;
