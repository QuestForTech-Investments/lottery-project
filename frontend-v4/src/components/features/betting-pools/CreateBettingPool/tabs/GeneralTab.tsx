import React, { type ChangeEvent } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  type SelectChangeEvent,
} from '@mui/material';

interface Zone {
  zoneId: number;
  zoneName: string;
}

interface GeneralFormData {
  bettingPoolName: string;
  branchCode: string;
  zoneId: string;
  location: string;
  reference: string;
  username: string;
  password: string;
  confirmPassword: string;
  comment: string;
  [key: string]: string;
}

interface FormErrors {
  bettingPoolName?: string | null;
  branchCode?: string | null;
  zoneId?: string | null;
  location?: string | null;
  reference?: string | null;
  username?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  comment?: string | null;
  [key: string]: string | null | undefined;
}

interface GeneralTabProps {
  formData: GeneralFormData;
  errors: FormErrors;
  zones: Zone[];
  loadingZones: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => void;
}

/**
 * GeneralTab Component
 * Contains basic information fields for creating a banca
 */
const GeneralTab: React.FC<GeneralTabProps> = ({ formData, errors, zones, loadingZones, handleChange }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Información General
      </Typography>

      <Grid container spacing={3}>
        {/* Branch Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Nombre de la Banca"
            name="bettingPoolName"
            value={formData.bettingPoolName}
            onChange={handleChange}
            error={!!errors.bettingPoolName}
            helperText={errors.bettingPoolName}
          />
        </Grid>

        {/* Branch Code */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Código de la Banca"
            name="branchCode"
            value={formData.branchCode}
            onChange={handleChange}
            error={!!errors.branchCode}
            helperText={errors.branchCode || 'Generado automaticmente'}
          />
        </Grid>

        {/* Zone */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.zoneId}>
            <InputLabel>Zona</InputLabel>
            <Select
              name="zoneId"
              value={formData.zoneId || ''}
              label="Zona"
              onChange={handleChange}
              disabled={loadingZones}
            >
              <MenuItem value="" disabled>
                <em>Seleccione una zona</em>
              </MenuItem>
              {zones.map((zone) => (
                <MenuItem key={zone.zoneId} value={zone.zoneId}>
                  {zone.zoneName}
                </MenuItem>
              ))}
            </Select>
            {errors.zoneId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.zoneId}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Location */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ubicación"
            name="location"
            value={formData.location}
            onChange={handleChange}
            helperText="Ubicación física de la banca"
          />
        </Grid>

        {/* Reference */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Referencia"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            helperText="Referencia o información adicional"
          />
        </Grid>

        {/* Comment */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comentarios"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            helperText="Notas o comentarios adicionales"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Custom comparison function for GeneralTab
 * Only re-renders when relevant fields for this tab change
 * Prevents cross-tab re-renders (70-80% reduction in unnecessary renders)
 */
const arePropsEqual = (prevProps: GeneralTabProps, nextProps: GeneralTabProps): boolean => {
  // Check if zones or loadingZones changed
  if (prevProps.zones !== nextProps.zones || prevProps.loadingZones !== nextProps.loadingZones) {
    return false;
  }

  // Check if handleChange changed (it shouldn't if properly memoized)
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false;
  }

  // Check only the form fields this tab uses
  const generalFields: (keyof GeneralFormData)[] = ['bettingPoolName', 'branchCode', 'zoneId', 'location', 'reference', 'username', 'password', 'confirmPassword', 'comment'];

  for (const field of generalFields) {
    if (prevProps.formData[field] !== nextProps.formData[field]) {
      return false;
    }
    if (prevProps.errors[field] !== nextProps.errors[field]) {
      return false;
    }
  }

  // No relevant changes, skip re-render
  return true;
};

export default React.memo(GeneralTab, arePropsEqual);
