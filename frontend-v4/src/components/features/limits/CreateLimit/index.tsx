import React, { useState, useCallback, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

interface Amounts {
  [key: string]: string;
}

interface BetType {
  key: string;
  label: string;
}

const CreateLimit = (): React.ReactElement => {
  const [limitType, setLimitType] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [selectedDraws, setSelectedDraws] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [amounts, setAmounts] = useState<Amounts>({
    directo: '',
    pale: '',
    tripleta: '',
    cash3Straight: '',
    cash3Box: '',
    play4Straight: '',
    play4Box: '',
    superPale: '',
    bolita1: '',
    bolita2: '',
    singulacion1: '',
    singulacion2: '',
    singulacion3: '',
    pick5Straight: '',
    pick5Box: '',
    pickTwo: '',
    cash3FrontStraight: '',
    cash3FrontBox: '',
    cash3BackStraight: '',
    cash3BackBox: '',
    pickTwoFront: '',
    pickTwoBack: '',
    pickTwoMiddle: '',
    panama: ''
  });

  const limitTypes = [
    'General para grupo',
    'General por número para grupo',
    'General para banca',
    'Por número para banca (Línea)',
    'Local para banca',
    'General para zona',
    'Por número para zona',
    'General para grupo externo',
    'Por número para grupo externo',
    'Absoluto'
  ];

  const draws = [
    'Anguila 10am', 'REAL', 'GANA MAS', 'LA PRIMERA', 'LA SUERTE', 'LOTEDOM',
    'TEXAS MORNING', 'TEXAS EVENING', 'TEXAS DAY', 'TEXAS NIGHT', 'King Lottery AM',
    'Anguila 1pm', 'NEW YORK DAY', 'FLORIDA AM', 'INDIANA MIDDAY', 'INDIANA EVENING',
    'GEORGIA-MID AM', 'NEW JERSEY AM', 'L.E. PUERTO RICO 2PM', 'DIARIA 11AM'
  ];

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const betTypes = [
    { key: 'directo', label: 'Directo' },
    { key: 'pale', label: 'Pale' },
    { key: 'tripleta', label: 'Tripleta' },
    { key: 'cash3Straight', label: 'Cash3 Straight' },
    { key: 'cash3Box', label: 'Cash3 Box' },
    { key: 'play4Straight', label: 'Play4 Straight' },
    { key: 'play4Box', label: 'Play4 Box' },
    { key: 'superPale', label: 'Super Pale' },
    { key: 'bolita1', label: 'Bolita 1' },
    { key: 'bolita2', label: 'Bolita 2' },
    { key: 'singulacion1', label: 'Singulación 1' },
    { key: 'singulacion2', label: 'Singulación 2' },
    { key: 'singulacion3', label: 'Singulación 3' },
    { key: 'pick5Straight', label: 'Pick5 Straight' },
    { key: 'pick5Box', label: 'Pick5 Box' },
    { key: 'pickTwo', label: 'Pick Two' },
    { key: 'cash3FrontStraight', label: 'Cash3 Front Straight' },
    { key: 'cash3FrontBox', label: 'Cash3 Front Box' },
    { key: 'cash3BackStraight', label: 'Cash3 Back Straight' },
    { key: 'cash3BackBox', label: 'Cash3 Back Box' },
    { key: 'pickTwoFront', label: 'Pick Two Front' },
    { key: 'pickTwoBack', label: 'Pick Two Back' },
    { key: 'pickTwoMiddle', label: 'Pick Two Middle' },
    { key: 'panama', label: 'Panamá' }
  ];

  const handleDrawToggle = useCallback((draw: string): void => {
    setSelectedDraws(prev =>
      prev.includes(draw) ? prev.filter(d => d !== draw) : [...prev, draw]
    );
  }, []);

  const handleDayToggle = useCallback((day: string): void => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }, []);

  const handleSelectAllDraws = useCallback((): void => {
    setSelectedDraws(prev => prev.length === draws.length ? [] : draws);
  }, []);

  const handleSelectAllDays = useCallback((): void => {
    setSelectedDays(prev => prev.length === days.length ? [] : days);
  }, []);

  const handleAmountChange = useCallback((key: string, value: string): void => {
    setAmounts(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCreate = useCallback((): void => {
    if (!limitType || !expirationDate || selectedDraws.length === 0 || selectedDays.length === 0) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    console.log('Creating limit:', {
      limitType,
      expirationDate,
      draws: selectedDraws,
      days: selectedDays,
      amounts
    });
    alert('Límite creado exitosamente');
  }, [limitType, expirationDate, selectedDraws, selectedDays, amounts]);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontSize: '24px', fontWeight: 500, color: '#2c2c2c' }}>
        Crear límites
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Columna Izquierda - LÍMITES */}
            <Box>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#2c2c2c', mb: 2, borderBottom: '2px solid #6366f1', pb: 1 }}>
                LÍMITES
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ fontSize: '12px' }}>Tipo de Límite *</InputLabel>
                <Select
                  value={limitType}
                  onChange={(e) => setLimitType(e.target.value)}
                  label="Tipo de Límite *"
                  sx={{ fontSize: '14px' }}
                >
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {limitTypes.map(type => (
                    <MenuItem key={type} value={type} sx={{ fontSize: '14px' }}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                type="date"
                label="Fecha de expiración"
                fullWidth
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { fontSize: '12px' } }}
                sx={{ mb: 2 }}
                required
              />

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontSize: '12px', color: '#787878' }}>
                    Sorteos *
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleSelectAllDraws}
                    sx={{ fontSize: '11px', bgcolor: '#6366f1', color: 'white', '&:hover': { bgcolor: '#5568d3' }, textTransform: 'none' }}
                  >
                    {selectedDraws.length === draws.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </Button>
                </Box>
                <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', p: 1, borderRadius: '4px', bgcolor: 'white' }}>
                  {draws.map(draw => (
                    <FormControlLabel
                      key={draw}
                      control={
                        <Checkbox
                          checked={selectedDraws.includes(draw)}
                          onChange={() => handleDrawToggle(draw)}
                          size="small"
                        />
                      }
                      label={draw}
                      sx={{ display: 'block', mb: 0.5, '& .MuiFormControlLabel-label': { fontSize: '13px' } }}
                    />
                  ))}
                </Box>
                <Typography sx={{ fontSize: '11px', color: '#999', mt: 0.5 }}>
                  {selectedDraws.length} seleccionado(s)
                </Typography>
              </Box>
            </Box>

            {/* Columna Derecha - MONTO */}
            <Box>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#2c2c2c', mb: 2, borderBottom: '2px solid #6366f1', pb: 1 }}>
                MONTO
              </Typography>

              <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
                {betTypes.map(({ key, label }) => (
                  <TextField
                    key={key}
                    type="number"
                    label={label}
                    fullWidth
                    value={amounts[key]}
                    onChange={(e) => handleAmountChange(key, e.target.value)}
                    placeholder="0.00"
                    InputLabelProps={{ sx: { fontSize: '12px' } }}
                    InputProps={{ sx: { fontSize: '14px', textAlign: 'right' } }}
                    sx={{ mb: 2 }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Sección DÍA DE SEMANA */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#2c2c2c' }}>
                DÍA DE SEMANA *
              </Typography>
              <Button
                size="small"
                onClick={handleSelectAllDays}
                sx={{ fontSize: '11px', bgcolor: '#6366f1', color: 'white', '&:hover': { bgcolor: '#5568d3' }, textTransform: 'none' }}
              >
                {selectedDays.length === days.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {days.map(day => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={selectedDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      size="small"
                    />
                  }
                  label={day}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '13px' } }}
                />
              ))}
            </Box>
            <Typography sx={{ fontSize: '11px', color: '#999', mt: 1 }}>
              {selectedDays.length} día(s) seleccionado(s)
            </Typography>
          </Box>

          {/* Botón Crear */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{
                bgcolor: '#6366f1',
                color: 'white',
                fontSize: '14px',
                px: 5,
                py: 1.5,
                '&:hover': { bgcolor: '#5568d3' },
                textTransform: 'none'
              }}
            >
              CREAR
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateLimit;
