import React, { useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Button, Checkbox, FormControlLabel } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

const DeleteLimits = (): React.ReactElement => {
  const [limitType, setLimitType] = useState<string>('General para grupo');
  const [selectedBetTypes, setSelectedBetTypes] = useState<string[]>([]);
  const [selectedDraws, setSelectedDraws] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const limitTypes = ['General para grupo', 'General por número para grupo', 'General para banca'];
  const betTypes = ['Directo', 'Pale', 'Tripleta', 'Cash3 Straight', 'Cash3 Box'];
  const draws = ['Anguila 10am', 'REAL', 'GANA MAS', 'LA PRIMERA', 'NEW YORK DAY'];
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handleDelete = () => {
    if (selectedBetTypes.length === 0 || selectedDraws.length === 0 || selectedDays.length === 0) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    if (window.confirm('¿Está seguro que desea eliminar los límites seleccionados?')) {
      alert('Límites eliminados exitosamente');
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontSize: '24px', fontWeight: 500, color: '#2c2c2c' }}>
        Eliminar límites en lote
      </Typography>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, mb: 2, borderBottom: '2px solid #6366f1', pb: 1 }}>
            LÍMITES
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Límite *</InputLabel>
            <Select value={limitType} onChange={(e) => setLimitType(e.target.value)} label="Tipo de Límite *">
              {limitTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '12px', color: '#787878', mb: 1 }}>Eliminar todos los números con jugadas *</Typography>
            <Box sx={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', p: 1, borderRadius: '4px' }}>
              {betTypes.map(type => (
                <FormControlLabel key={type} control={<Checkbox checked={selectedBetTypes.includes(type)} onChange={() => setSelectedBetTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])} />} label={type} sx={{ display: 'block' }} />
              ))}
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '12px', color: '#787878', mb: 1 }}>Sorteos *</Typography>
            <Box sx={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', p: 1, borderRadius: '4px' }}>
              {draws.map(draw => (
                <FormControlLabel key={draw} control={<Checkbox checked={selectedDraws.includes(draw)} onChange={() => setSelectedDraws(prev => prev.includes(draw) ? prev.filter(d => d !== draw) : [...prev, draw])} />} label={draw} sx={{ display: 'block' }} />
              ))}
            </Box>
          </Box>
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, mt: 3, mb: 2 }}>DÍA DE SEMANA *</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {days.map(day => (
              <FormControlLabel key={day} control={<Checkbox checked={selectedDays.includes(day)} onChange={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])} />} label={day} />
            ))}
          </Box>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="contained" onClick={handleDelete} sx={{ bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' }, fontSize: '14px', px: 5, py: 1.5, textTransform: 'none' }}>
              ELIMINAR
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeleteLimits;
