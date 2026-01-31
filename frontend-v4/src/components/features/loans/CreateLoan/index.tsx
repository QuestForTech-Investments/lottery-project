import React, { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  InputAdornment
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

interface LoanFormData {
  entityType: string;
  entityId: string | number;
  loanAmount: string;
  installmentAmount: string;
  paymentFrequency: string;
  startDate: string;
  interestRate: string;
  notes: string;
}

interface EntityType {
  id: string;
  name: string;
}

interface Entity {
  id: number;
  name: string;
}

interface EntitiesMap {
  [key: string]: Entity[];
}

const CreateLoan = (): React.ReactElement => {
  const [formData, setFormData] = useState<LoanFormData>({
    entityType: '',
    entityId: '',
    loanAmount: '',
    installmentAmount: '',
    paymentFrequency: 'diario',
    startDate: '',
    interestRate: '',
    notes: ''
  });

  // Mockup data for entity types
  const entityTypes: EntityType[] = [
    { id: 'betting-pool', name: 'Banca' },
    { id: 'bank', name: 'Banco' },
    { id: 'zone', name: 'Zona' },
    { id: 'collector', name: 'Cobrador' }
  ];

  // Mockup entities (will vary based on entity type)
  const entities: EntitiesMap = {
    'betting-pool': [
      { id: 1, name: 'LA CENTRAL 01' },
      { id: 2, name: 'LA CENTRAL 02' },
      { id: 3, name: 'SUPER BANCA' },
      { id: 4, name: 'BANCA REAL' }
    ],
    'bank': [
      { id: 1, name: 'Banco Popular' },
      { id: 2, name: 'BanReservas' },
      { id: 3, name: 'Banco BHD' }
    ],
    'zone': [
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' }
    ],
    'collector': [
      { id: 1, name: 'Juan Pérez' },
      { id: 2, name: 'María González' }
    ]
  };

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | number>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset entity when entity type changes
    if (name === 'entityType') {
      setFormData(prev => ({ ...prev, entityId: '' }));
    }
  }, []);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // TODO: Implement API call
    alert('Préstamo creado exitosamente');
  }, [formData]);

  const availableEntities: Entity[] = formData.entityType ? entities[formData.entityType] : [];

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          {/* Title */}
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 4, color: '#2c2c2c' }}>
            Crear préstamo
          </Typography>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ maxWidth: '800px', margin: '0 auto' }}
          >
            {/* Tipo de entidad */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Tipo de entidad
              </Typography>
              <FormControl fullWidth size="small" required>
                <Select
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleInputChange}
                  displayEmpty
                  sx={{ fontSize: '14px' }}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {entityTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Entidad */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Entidad
              </Typography>
              <FormControl fullWidth size="small" required>
                <Select
                  name="entityId"
                  value={formData.entityId}
                  onChange={handleInputChange}
                  disabled={!formData.entityType}
                  displayEmpty
                  sx={{ fontSize: '14px' }}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {availableEntities.map(entity => (
                    <MenuItem key={entity.id} value={entity.id}>{entity.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Monto a prestar */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Monto a prestar
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="loanAmount"
                value={formData.loanAmount}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { fontSize: '14px' }
                }}
              />
            </Box>

            {/* Monto cuota */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Monto cuota
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="installmentAmount"
                value={formData.installmentAmount}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { fontSize: '14px' }
                }}
              />
            </Box>

            {/* Frecuencia de pago */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Frecuencia de pago
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  row
                  name="paymentFrequency"
                  value={formData.paymentFrequency}
                  onChange={handleInputChange}
                >
                  {['diario', 'semanal', 'mensual', 'anual'].map(freq => (
                    <FormControlLabel
                      key={freq}
                      value={freq}
                      control={<Radio size="small" />}
                      label={freq.charAt(0).toUpperCase() + freq.slice(1)}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Fecha de inicio del préstamo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Fecha de inicio del préstamo
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ sx: { fontSize: '14px' } }}
              />
            </Box>

            {/* Tasa de interés */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Tasa de interés
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                placeholder="0.0"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  sx: { fontSize: '14px' }
                }}
              />
            </Box>

            {/* Notas */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)', pt: 1 }}>
                Notas
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Notas adicionales..."
                InputProps={{ sx: { fontSize: '14px' } }}
              />
            </Box>

            {/* Submit Button */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#8b5cf6',
                  '&:hover': { bgcolor: '#7c3aed' },
                  color: 'white',
                  px: 3,
                  py: 1,
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none'
                }}
              >
                Crear
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateLoan;
