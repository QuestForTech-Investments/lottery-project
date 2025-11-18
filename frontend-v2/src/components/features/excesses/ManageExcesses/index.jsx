import React, { useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const ManageExcesses = () => {
  // Dropdown de sorteos
  const [selectedDraw, setSelectedDraw] = useState('General');

  // 25 campos numéricos para los diferentes tipos de excedentes
  const [excessValues, setExcessValues] = useState({
    general: '',
    directo: '',
    pale: '',
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
    panama: '',
    tripleta: ''
  });

  // Lista de excedentes guardados
  const [savedExcesses, setSavedExcesses] = useState([]);

  // Mockup data de sorteos
  const draws = [
    { id: 0, name: 'General' },
    { id: 1, name: 'Anguila 10am' },
    { id: 2, name: 'NY 12pm' },
    { id: 3, name: 'FL 1pm' },
    { id: 4, name: 'GA 7pm' },
    { id: 5, name: 'REAL' },
    { id: 6, name: 'GANA MAS' },
    { id: 7, name: 'LA PRIMERA' }
  ];

  // Mapeo de campos para mostrar en UI
  const fieldLabels = {
    general: 'General',
    directo: 'Directo',
    pale: 'Pale',
    cash3Straight: 'Cash3 Straight',
    cash3Box: 'Cash3 Box',
    play4Straight: 'Play4 Straight',
    play4Box: 'Play4 Box',
    superPale: 'Super Pale',
    bolita1: 'Bolita 1',
    bolita2: 'Bolita 2',
    singulacion1: 'Singulación 1',
    singulacion2: 'Singulación 2',
    singulacion3: 'Singulación 3',
    pick5Straight: 'Pick5 Straight',
    pick5Box: 'Pick5 Box',
    pickTwo: 'Pick Two',
    cash3FrontStraight: 'Cash3 Front Straight',
    cash3FrontBox: 'Cash3 Front Box',
    cash3BackStraight: 'Cash3 Back Straight',
    cash3BackBox: 'Cash3 Back Box',
    pickTwoFront: 'Pick Two Front',
    pickTwoBack: 'Pick Two Back',
    pickTwoMiddle: 'Pick Two Middle',
    panama: 'Panamá',
    tripleta: 'Tripleta'
  };

  const handleFieldChange = (fieldName, value) => {
    // Solo permitir números y decimales
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setExcessValues(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  };

  const handleClearAll = () => {
    const emptyValues = Object.keys(excessValues).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setExcessValues(emptyValues);
  };

  const handleCreate = () => {
    // Recopilar solo campos con valores
    const filledFields = Object.entries(excessValues)
      .filter(([key, value]) => value !== '')
      .map(([key, value]) => ({
        draw: selectedDraw,
        betType: fieldLabels[key],
        excess: parseFloat(value),
        date: new Date().toLocaleDateString('es-DO'),
        user: 'admin'
      }));

    if (filledFields.length === 0) {
      alert('Debe ingresar al menos un valor de excedente');
      return;
    }

    // Agregar a la lista de guardados
    const newExcesses = filledFields.map((field, index) => ({
      id: savedExcesses.length + index + 1,
      ...field
    }));

    setSavedExcesses([...newExcesses, ...savedExcesses]);

    // Limpiar formulario después de crear
    handleClearAll();

    alert(`${filledFields.length} excedente(s) creado(s) exitosamente`);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este excedente?')) {
      setSavedExcesses(savedExcesses.filter(item => item.id !== id));
    }
  };

  // Organizar campos en grupos de 3 para el grid
  const fieldKeys = Object.keys(excessValues);

  return (
    <Box sx={{ p: 3 }}>
      {/* Título */}
      <Typography
        variant="h4"
        component="h3"
        sx={{
          textAlign: 'center',
          mb: 3,
          color: '#2c2c2c',
          fontWeight: 600,
          fontSize: '24px',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        Manejar excedentes
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Filtro de Sorteo y Botón Borrar Todo */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <FormControl sx={{ minWidth: 300 }}>
                <InputLabel sx={{ fontSize: '14px' }}>Sorteo</InputLabel>
                <Select
                  value={selectedDraw}
                  onChange={(e) => setSelectedDraw(e.target.value)}
                  label="Sorteo"
                  size="small"
                  sx={{ fontSize: '14px' }}
                >
                  {draws.map(draw => (
                    <MenuItem key={draw.id} value={draw.name} sx={{ fontSize: '14px' }}>
                      {draw.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Button
              variant="contained"
              onClick={handleClearAll}
              sx={{
                background: '#51cbce',
                '&:hover': { background: '#40b5b8' },
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                textTransform: 'uppercase',
                px: 3
              }}
            >
              BORRAR TODO
            </Button>
          </Box>

          {/* Formulario de 25 campos en grid de 3 columnas */}
          <Box sx={{ background: '#f5f5f5', p: 3, borderRadius: 1, mb: 3 }}>
            <Grid container spacing={1.5}>
              {fieldKeys.map(fieldKey => (
                <Grid item xs={12} sm={6} md={4} key={fieldKey}>
                  <TextField
                    fullWidth
                    size="small"
                    label={fieldLabels[fieldKey]}
                    value={excessValues[fieldKey]}
                    onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                    placeholder="0.00"
                    InputLabelProps={{
                      sx: { fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }
                    }}
                    InputProps={{
                      sx: {
                        fontSize: '14px',
                        fontFamily: 'Montserrat, sans-serif',
                        '& input': { textAlign: 'right' }
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Botón CREAR */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{
                background: '#51cbce',
                '&:hover': { background: '#40b5b8' },
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                textTransform: 'uppercase',
                px: 4,
                py: 1.2
              }}
            >
              CREAR
            </Button>
          </Box>

          {/* Título de la tabla */}
          <Typography
            variant="h4"
            component="h3"
            sx={{
              textAlign: 'center',
              mt: 5,
              mb: 3,
              color: '#2c2c2c',
              fontWeight: 600,
              fontSize: '24px',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Lista de excedentes
          </Typography>

          {/* Tabla de excedentes guardados */}
          {savedExcesses.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Sorteo</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Tipo de jugada</TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600 }}>Excedente</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Usuario</TableCell>
                    <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedExcesses.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontSize: '14px' }}>{index + 1}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{item.draw}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{item.betType}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '14px' }}>
                        ${item.excess.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{item.date}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{item.user}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleDelete(item.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                p: 5,
                color: '#6c757d',
                fontSize: '14px',
                background: '#f8f9fa',
                borderRadius: 1
              }}
            >
              No hay excedentes creados aún
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ManageExcesses;
