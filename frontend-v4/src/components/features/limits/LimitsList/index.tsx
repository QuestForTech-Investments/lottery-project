import React, { useState, useCallback, type SyntheticEvent, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Chip
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import DeleteIcon from '@mui/icons-material/Delete';

interface Limit {
  id: number;
  betType: string;
  amount: number;
  expirationDate: string;
}

const LimitsList = (): React.ReactElement => {
  const [selectedLimitTypes, setSelectedLimitTypes] = useState<string[]>([]);
  const [selectedDraws, setSelectedDraws] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedBanca, setSelectedBanca] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [activeWeekDay, setActiveWeekDay] = useState<number>(0); // 0 = Lunes
  const [activeLimitType, setActiveLimitType] = useState<number>(0);
  const [activeDraw, setActiveDraw] = useState<number>(0);

  const limitTypes = [
    'Todos',
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
    'Todos', 'Anguila 10am', 'REAL', 'GANA MAS', 'LA PRIMERA', 'LA SUERTE',
    'LOTEDOM', 'TEXAS MORNING', 'TEXAS EVENING', 'NEW YORK DAY', 'FLORIDA AM',
    'INDIANA MIDDAY', 'GEORGIA-MID AM', 'NEW JERSEY AM', 'DIARIA 11AM'
  ];

  const days = ['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const [limits, setLimits] = useState<Limit[]>([
    { id: 1, betType: 'Directo', amount: 5000, expirationDate: '31/12/2025' },
    { id: 2, betType: 'Pale', amount: 3000, expirationDate: '31/12/2025' },
    { id: 3, betType: 'Tripleta', amount: 2000, expirationDate: '31/12/2025' }
  ]);

  const handleRefresh = useCallback((): void => {
    if (selectedLimitTypes.length === 0 || selectedDraws.length === 0 || selectedDays.length === 0) {
      alert('Por favor seleccione Tipo de Límite, Sorteos y Días');
      return;
    }
    console.log('Refreshing with filters:', {
      limitTypes: selectedLimitTypes,
      draws: selectedDraws,
      days: selectedDays
    });
  }, [selectedLimitTypes, selectedDraws, selectedDays]);

  const handleDelete = useCallback((id: number): void => {
    setLimits(prev => prev.filter(limit => limit.id !== id));
  }, []);

  const handleAmountChange = useCallback((id: number, newAmount: string): void => {
    setLimits(prev => prev.map(limit =>
      limit.id === id ? { ...limit, amount: parseFloat(newAmount) || 0 } : limit
    ));
  }, []);

  const showConditionalFilters = selectedLimitTypes.includes('Todos');

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Título */}
      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          mb: 3,
          fontSize: '24px',
          fontWeight: 500,
          color: '#2c2c2c'
        }}
      >
        Lista de límites
      </Typography>

      {/* Card de filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Filtros principales */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
            {/* Tipo de Límite */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>Tipo de Límite *</InputLabel>
              <Select
                multiple
                value={selectedLimitTypes}
                onChange={(e) => setSelectedLimitTypes(e.target.value as string[])}
                input={<OutlinedInput label="Tipo de Límite *" />}
                renderValue={(selected) => `${selected.length} seleccionada(s)`}
                sx={{ fontSize: '14px' }}
              >
                {limitTypes.map((type) => (
                  <MenuItem key={type} value={type} sx={{ fontSize: '14px' }}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sorteos */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>Sorteos *</InputLabel>
              <Select
                multiple
                value={selectedDraws}
                onChange={(e) => setSelectedDraws(e.target.value as string[])}
                input={<OutlinedInput label="Sorteos *" />}
                renderValue={(selected) => `${selected.length} seleccionada(s)`}
                sx={{ fontSize: '14px' }}
              >
                {draws.map((draw) => (
                  <MenuItem key={draw} value={draw} sx={{ fontSize: '14px' }}>
                    {draw}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Días */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>Días *</InputLabel>
              <Select
                multiple
                value={selectedDays}
                onChange={(e) => setSelectedDays(e.target.value as string[])}
                input={<OutlinedInput label="Días *" />}
                renderValue={(selected) => `${selected.length} seleccionada(s)`}
                sx={{ fontSize: '14px' }}
              >
                {days.map((day) => (
                  <MenuItem key={day} value={day} sx={{ fontSize: '14px' }}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Filtros condicionales */}
          {showConditionalFilters && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '12px' }}>Bancas</InputLabel>
                <Select
                  value={selectedBanca}
                  onChange={(e) => setSelectedBanca(e.target.value)}
                  sx={{ fontSize: '14px' }}
                  label="Bancas"
                >
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  <MenuItem value="1" sx={{ fontSize: '14px' }}>Banca 1</MenuItem>
                  <MenuItem value="2" sx={{ fontSize: '14px' }}>Banca 2</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '12px' }}>Zonas</InputLabel>
                <Select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  sx={{ fontSize: '14px' }}
                  label="Zonas"
                >
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  <MenuItem value="1" sx={{ fontSize: '14px' }}>Zona 1</MenuItem>
                  <MenuItem value="2" sx={{ fontSize: '14px' }}>Zona 2</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '12px' }}>Grupos</InputLabel>
                <Select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  sx={{ fontSize: '14px' }}
                  label="Grupos"
                >
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  <MenuItem value="1" sx={{ fontSize: '14px' }}>Grupo 1</MenuItem>
                  <MenuItem value="2" sx={{ fontSize: '14px' }}>Grupo 2</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Botón Refrescar */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={handleRefresh}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
                fontSize: '14px',
                px: 4,
                py: 1,
                textTransform: 'none'
              }}
            >
              REFRESCAR
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Card de resultados */}
      <Card>
        {/* Pestañas de días de semana */}
        <Tabs
          value={activeWeekDay}
          onChange={(e, newValue) => setActiveWeekDay(newValue)}
          sx={{
            borderBottom: 2,
            borderColor: '#6366f1',
            '& .MuiTab-root': { fontSize: '14px', minWidth: 'auto' },
            '& .Mui-selected': { color: '#6366f1' }
          }}
          TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}
        >
          {weekDays.map((day, index) => (
            <Tab key={day} label={day} />
          ))}
        </Tabs>

        {/* Sub-pestañas de tipo de límite */}
        <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderBottom: '1px solid #ddd', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {limitTypes.slice(1, 4).map((type, index) => (
            <Chip
              key={type}
              label={type}
              onClick={() => setActiveLimitType(index)}
              variant={activeLimitType === index ? 'filled' : 'outlined'}
              sx={{
                fontSize: '12px',
                background: activeLimitType === index ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: activeLimitType === index ? 'white' : '#333',
                borderColor: activeLimitType === index ? '#6366f1' : '#ddd',
                '&:hover': { background: activeLimitType === index ? 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' : '#f5f5f5' }
              }}
            />
          ))}
        </Box>

        {/* Pestañas de sorteos */}
        <Box sx={{ p: 2, borderBottom: '1px solid #ddd', display: 'flex', gap: 1, overflowX: 'auto' }}>
          {draws.slice(1, 6).map((draw, index) => (
            <Chip
              key={draw}
              label={draw}
              onClick={() => setActiveDraw(index)}
              variant={activeDraw === index ? 'filled' : 'outlined'}
              sx={{
                fontSize: '12px',
                background: activeDraw === index ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: activeDraw === index ? 'white' : '#333',
                borderColor: activeDraw === index ? '#6366f1' : '#ddd',
                whiteSpace: 'nowrap',
                '&:hover': { background: activeDraw === index ? 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' : '#f5f5f5' }
              }}
            />
          ))}
        </Box>

        {/* Tabla de límites */}
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Tipo de jugada</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Monto</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Fecha de expiración</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878', textAlign: 'center' }}>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {limits.map((limit) => (
                  <TableRow key={limit.id} hover>
                    <TableCell sx={{ fontSize: '14px' }}>{limit.betType}</TableCell>
                    <TableCell sx={{ fontSize: '14px' }}>
                      <TextField
                        type="number"
                        value={limit.amount}
                        onChange={(e) => handleAmountChange(limit.id, e.target.value)}
                        size="small"
                        sx={{ width: '120px' }}
                        InputProps={{
                          sx: { fontSize: '14px', textAlign: 'right' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '14px' }}>{limit.expirationDate}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton
                        onClick={() => handleDelete(limit.id)}
                        size="small"
                        sx={{ color: '#dc3545' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#999',
              mt: 2
            }}
          >
            Mostrando {limits.length} de {limits.length} entradas
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LimitsList;
