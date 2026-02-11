import React, { type ChangeEvent } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';

interface FootersFormData {
  autoFooter: boolean;
  footerText1: string;
  footerText2: string;
  footerText3: string;
  footerText4: string;
  footerText5: string;
  footerText6: string;
  showBranchInfo: boolean;
  showDateTime: boolean;
  [key: string]: string | boolean;
}

interface FootersTabProps {
  formData: FootersFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * FootersTab Component
 * Contains footer text configuration for tickets
 */
const FootersTab: React.FC<FootersTabProps> = ({ formData, handleChange }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Pies de Página
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configura los textos que aparecerán en el pie de página de los tickets
      </Typography>

      <Grid container spacing={3}>
        {/* Auto Footer Toggle */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.autoFooter}
                onChange={handleChange}
                name="autoFooter"
              />
            }
            label="Pie de Página Automático"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Footer Text Fields */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Texto de Pie 1"
            name="footerText1"
            value={formData.footerText1}
            onChange={handleChange}
            inputProps={{ maxLength: 30 }}
            helperText={`${formData.footerText1.length}/30 caracteres`}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Texto de Pie 2"
            name="footerText2"
            value={formData.footerText2}
            onChange={handleChange}
            inputProps={{ maxLength: 30 }}
            helperText={`${formData.footerText2.length}/30 caracteres`}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Texto de Pie 3"
            name="footerText3"
            value={formData.footerText3}
            onChange={handleChange}
            inputProps={{ maxLength: 30 }}
            helperText={`${formData.footerText3.length}/30 caracteres`}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Texto de Pie 4"
            name="footerText4"
            value={formData.footerText4}
            onChange={handleChange}
            inputProps={{ maxLength: 30 }}
            helperText={`${formData.footerText4.length}/30 caracteres`}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Texto de Pie 5"
            name="footerText5"
            value={formData.footerText5}
            onChange={handleChange}
            inputProps={{ maxLength: 30 }}
            helperText={`${formData.footerText5.length}/30 caracteres`}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Texto de Pie 6"
            name="footerText6"
            value={formData.footerText6}
            onChange={handleChange}
            inputProps={{ maxLength: 30 }}
            helperText={`${formData.footerText6.length}/30 caracteres`}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Opciones de Visualización
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.showBranchInfo}
                onChange={handleChange}
                name="showBranchInfo"
              />
            }
            label="Mostrar Información de la Banca"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.showDateTime}
                onChange={handleChange}
                name="showDateTime"
              />
            }
            label="Mostrar Fecha y Hora"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Custom comparison function for FootersTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: FootersTabProps, nextProps: FootersTabProps): boolean => {
  // Check if handleChange changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false;
  }

  // Check only the form fields this tab uses
  const footerFields: (keyof FootersFormData)[] = ['autoFooter', 'footerText1', 'footerText2', 'footerText3', 'footerText4', 'footerText5', 'footerText6', 'showBranchInfo', 'showDateTime'];

  for (const field of footerFields) {
    if (prevProps.formData[field] !== nextProps.formData[field]) {
      return false;
    }
  }

  // No relevant changes, skip re-render
  return true;
};

export default React.memo(FootersTab, arePropsEqual);
