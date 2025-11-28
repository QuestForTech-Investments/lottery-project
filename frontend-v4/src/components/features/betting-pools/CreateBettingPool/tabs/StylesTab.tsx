import React, { type ChangeEvent } from 'react';
import {
  Grid,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

interface StylesFormData {
  sellScreenStyles: string;
  ticketPrintStyles: string;
  [key: string]: string;
}

interface StylesTabProps {
  formData: StylesFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * StylesTab Component
 * Contains visual style configuration for sell screen and ticket printing
 */
const StylesTab: React.FC<StylesTabProps> = ({ formData, handleChange }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Estilos Visuales
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configura la apariencia de la pantalla de venta y el formato de impresión de tickets
      </Typography>

      <Grid container spacing={3}>
        {/* Sell Screen Styles */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PaletteIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                Estilo de Pantalla de Venta
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Selecciona el diseño visual para la pantalla de venta
              </FormLabel>
              <RadioGroup
                name="sellScreenStyles"
                value={formData.sellScreenStyles}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="estilo1"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Estilo 1 - Clásico</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Diseño tradicional con botones grandes y alto contraste
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
                <FormControlLabel
                  value="estilo2"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Estilo 2 - Moderno</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Diseño contemporáneo con interfaz limpia y minimalista
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
                <FormControlLabel
                  value="estilo3"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Estilo 3 - Compacto</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Diseño optimizado para pantallas pequeñas
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
                <FormControlLabel
                  value="estilo4"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Estilo 4 - Alto Contraste</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Diseño con colores vibrantes para mejor visibilidad
                      </Typography>
                    </Box>
                  }
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        {/* Ticket Print Styles */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PrintIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                Estilo de Impresión de Tickets
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Selecciona el formato de impresión para los tickets
              </FormLabel>
              <RadioGroup
                name="ticketPrintStyles"
                value={formData.ticketPrintStyles}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="original"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Original</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Formato original estándar del sistema
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
                <FormControlLabel
                  value="compacto"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Compacto</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Formato reducido para ahorrar papel
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
                <FormControlLabel
                  value="detallado"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Detallado</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Formato expandido con información adicional
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
                <FormControlLabel
                  value="termico"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Térmico</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Optimizado para impresoras térmicas (58mm/80mm)
                      </Typography>
                    </Box>
                  }
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        {/* Preview Note */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter' }}>
            <Typography variant="body2" color="info.dark">
              <strong>Nota:</strong> Los cambios en los estilos se aplicarán inmediatamente después de guardar.
              Puedes modificar estos ajustes en cualquier momento desde la configuration de la banca.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Custom comparison function for StylesTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: StylesTabProps, nextProps: StylesTabProps): boolean => {
  // Check if handleChange changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false;
  }

  // Check only the form fields this tab uses
  const styleFields: (keyof StylesFormData)[] = ['sellScreenStyles', 'ticketPrintStyles'];

  for (const field of styleFields) {
    if (prevProps.formData[field] !== nextProps.formData[field]) {
      return false;
    }
  }

  // No relevant changes, skip re-render
  return true;
};

export default React.memo(StylesTab, arePropsEqual);
