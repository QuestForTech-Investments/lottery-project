import React, { type ChangeEvent } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  isEditMode?: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ formData, errors, zones, loadingZones, handleChange, isEditMode = false }) => {
  return (
    <Box sx={{ p: 2 }}>
      {/* Hidden fields to trap browser autocomplete */}
      <input type="text" name="fake_username" style={{ display: 'none' }} autoComplete="username" />
      <input type="password" name="fake_password" style={{ display: 'none' }} autoComplete="current-password" />

      <Grid container spacing={2}>
        {/* Row 1: Nombre | Número */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            required
            label="Nombre"
            name="bettingPoolName"
            value={formData.bettingPoolName}
            onChange={handleChange}
            error={!!errors.bettingPoolName}
            helperText={errors.bettingPoolName}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Número"
            name="branchCode"
            value={formData.branchCode}
            onChange={handleChange}
            disabled
            InputProps={{ readOnly: true }}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#333',
                backgroundColor: '#f5f5f5',
              }
            }}
          />
        </Grid>

        {/* Row 2: Usuario | Ubicación (Create) OR Ubicación | Referencia (Edit) */}
        {!isEditMode ? (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                required
                label="Nombre de usuario"
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Ubicación"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Ubicación"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Referencia"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
              />
            </Grid>
          </>
        )}

        {/* Row 3: Contraseña | Referencia (Create) OR Zona | Comentario (Edit) */}
        {!isEditMode ? (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                required
                type="password"
                label="Contraseña"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Referencia"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" error={!!errors.zoneId}>
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
                    <MenuItem key={zone.zoneId} value={String(zone.zoneId)}>
                      {zone.zoneName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Comentario"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
              />
            </Grid>
          </>
        )}

        {/* Row 4: Confirmación | Comentario (Create only) */}
        {!isEditMode && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                required
                type="password"
                label="Confirmación de contraseña"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                autoComplete="new-password"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Comentario"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
              />
            </Grid>
          </>
        )}

        {/* Row 5: Zona (Create only) */}
        {!isEditMode && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" error={!!errors.zoneId}>
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
                  <MenuItem key={zone.zoneId} value={String(zone.zoneId)}>
                    {zone.zoneName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

const arePropsEqual = (prevProps: GeneralTabProps, nextProps: GeneralTabProps): boolean => {
  if (prevProps.zones !== nextProps.zones || prevProps.loadingZones !== nextProps.loadingZones) {
    return false;
  }

  if (prevProps.handleChange !== nextProps.handleChange || prevProps.isEditMode !== nextProps.isEditMode) {
    return false;
  }

  const generalFields: (keyof GeneralFormData)[] = ['bettingPoolName', 'branchCode', 'zoneId', 'location', 'reference', 'username', 'password', 'confirmPassword', 'comment'];

  for (const field of generalFields) {
    if (prevProps.formData[field] !== nextProps.formData[field]) {
      return false;
    }
    if (prevProps.errors[field] !== nextProps.errors[field]) {
      return false;
    }
  }

  return true;
};

export default React.memo(GeneralTab, arePropsEqual);
