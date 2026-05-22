import React, { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('createBettingPool.styles.title')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('createBettingPool.styles.subtitle')}
      </Typography>

      <Grid container spacing={3}>
        {/* Sell Screen Styles */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PaletteIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                {t('createBettingPool.styles.sellScreenTitle')}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 1 }}>
                {t('createBettingPool.styles.sellScreenLegend')}
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
                      <Typography variant="body1">{t('createBettingPool.styles.style1Name')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('createBettingPool.styles.style1Desc')}
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
                      <Typography variant="body1">{t('createBettingPool.styles.style2Name')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('createBettingPool.styles.style2Desc')}
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
                      <Typography variant="body1">{t('createBettingPool.styles.style3Name')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('createBettingPool.styles.style3Desc')}
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
                      <Typography variant="body1">{t('createBettingPool.styles.style4Name')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('createBettingPool.styles.style4Desc')}
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
                {t('createBettingPool.styles.printTitle')}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 1 }}>
                {t('createBettingPool.styles.printLegend')}
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
                      <Typography variant="body1">{t('createBettingPool.styles.printOriginalName')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('createBettingPool.styles.printOriginalDesc')}
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
                      <Typography variant="body1">{t('createBettingPool.styles.printCompactName')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('createBettingPool.styles.printCompactDesc')}
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
                      <Typography variant="body1">{t('createBettingPool.styles.printDetailedName')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('createBettingPool.styles.printDetailedDesc')}
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
                      <Typography variant="body1">{t('createBettingPool.styles.printThermalName')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('createBettingPool.styles.printThermalDesc')}
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
              <strong>{t('createBettingPool.styles.noteBold')}</strong> {t('createBettingPool.styles.noteBody')}
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
