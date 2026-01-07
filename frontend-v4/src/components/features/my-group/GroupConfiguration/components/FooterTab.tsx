/**
 * FooterTab Component
 *
 * Tab content for footer configuration.
 */

import { memo, type FC } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import type { FooterTabProps } from '../types';
import { FOOTER_SHORTCUTS_ROW1, FOOTER_SHORTCUTS_ROW2, GRADIENT_BUTTON_STYLE } from '../constants';

const FooterTab: FC<FooterTabProps> = memo(({ footerData, onFooterChange }) => (
  <Box>
    <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontSize: '18px', fontWeight: 600 }}>
      Footer
    </Typography>

    {/* Shortcut buttons */}
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 1 }}>
        {FOOTER_SHORTCUTS_ROW1.map((label) => (
          <Button
            key={label}
            variant="contained"
            size="small"
            onClick={() => alert(`Atajo: ${label}`)}
            sx={GRADIENT_BUTTON_STYLE}
          >
            {label}
          </Button>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {FOOTER_SHORTCUTS_ROW2.map((label) => (
          <Button
            key={label}
            variant="contained"
            size="small"
            onClick={() => alert(`Atajo: ${label}`)}
            sx={GRADIENT_BUTTON_STYLE}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Box>

    {/* Footer fields */}
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <TextField
        fullWidth
        label="Primer pie de pagina"
        value={footerData.primerPie}
        onChange={(e) => onFooterChange('primerPie', e.target.value)}
        size="small"
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Segundo pie de pagina"
        value={footerData.segundoPie}
        onChange={(e) => onFooterChange('segundoPie', e.target.value)}
        size="small"
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Tercer pie de pagina"
        value={footerData.tercerPie}
        onChange={(e) => onFooterChange('tercerPie', e.target.value)}
        size="small"
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Cuarto pie de pagina"
        value={footerData.cuartoPie}
        onChange={(e) => onFooterChange('cuartoPie', e.target.value)}
        size="small"
      />
    </Box>
  </Box>
));

FooterTab.displayName = 'FooterTab';

export default FooterTab;
