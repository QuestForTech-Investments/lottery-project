import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  OutlinedInput,
  Chip
} from '@mui/material';
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ExcessesReport = () => {
  const [selectedDraws, setSelectedDraws] = useState([]);
  const [selectedBetTypes, setSelectedBetTypes] = useState([]);
  const [quickFilter, setQuickFilter] = useState('');
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Mockup data - Lista de sorteos
  const availableDraws = [
    { id: 1, name: 'Anguila 10am' },
    { id: 2, name: 'NY 12pm' },
    { id: 3, name: 'FL 1pm' },
    { id: 4, name: 'GA 7pm' },
    { id: 5, name: 'REAL' },
    { id: 6, name: 'GANA MAS' },
    { id: 7, name: 'LA PRIMERA' },
    { id: 8, name: 'LA SUERTE' },
    { id: 9, name: 'LOTEDOM' },
    { id: 10, name: 'NACIONAL' },
    { id: 0, name: 'General' }
  ];

  // Mockup data - Lista de tipos de jugada
  const availableBetTypes = [
    { id: 1, name: 'Directo' },
    { id: 2, name: 'Pale' },
    { id: 3, name: 'Tripleta' },
    { id: 4, name: 'Cash3 Straight' },
    { id: 5, name: 'Cash3 Box' },
    { id: 6, name: 'Play4 Straight' },
    { id: 7, name: 'Play4 Box' },
    { id: 8, name: 'Super Pale' },
    { id: 9, name: 'Pick Two' },
    { id: 10, name: 'Pick5 Straight' },
    { id: 11, name: 'Pick5 Box' },
    { id: 12, name: 'Bolita 1' },
    { id: 13, name: 'Bolita 2' }
  ];

  // Mockup data - Datos del reporte
  const mockReportData = [
    { id: 1, draw: 'Anguila 10am', betType: 'Directo', excess: 1000.00, date: '18/11/2025', user: 'admin' },
    { id: 2, draw: 'Anguila 10am', betType: 'Pale', excess: 500.00, date: '18/11/2025', user: 'admin' },
    { id: 3, draw: 'General', betType: 'Directo', excess: 1000.00, date: '17/11/2025', user: 'admin' },
    { id: 4, draw: 'NY 12pm', betType: 'Tripleta', excess: 300.00, date: '17/11/2025', user: 'admin' },
    { id: 5, draw: 'FL 1pm', betType: 'Pick Two', excess: 80.00, date: '16/11/2025', user: 'admin' },
    { id: 6, draw: 'GA 7pm', betType: 'Cash3 Box', excess: 150.00, date: '16/11/2025', user: 'admin' },
    { id: 7, draw: 'General', betType: 'Pale', excess: 500.00, date: '15/11/2025', user: 'admin' },
    { id: 8, draw: 'Anguila 10am', betType: 'Super Pale', excess: 250.00, date: '15/11/2025', user: 'admin' }
  ];

  useEffect(() => {
    // Inicializar con todos seleccionados
    setSelectedDraws(availableDraws.map(d => d.id));
    setSelectedBetTypes(availableBetTypes.map(bt => bt.id));
  }, []);

  const handleRefresh = () => {
    // Filtrar datos basado en las selecciones
    let filtered = mockReportData;

    if (selectedDraws.length > 0 && selectedDraws.length < availableDraws.length) {
      const selectedDrawNames = availableDraws
        .filter(d => selectedDraws.includes(d.id))
        .map(d => d.name);
      filtered = filtered.filter(item => selectedDrawNames.includes(item.draw));
    }

    if (selectedBetTypes.length > 0 && selectedBetTypes.length < availableBetTypes.length) {
      const selectedBetTypeNames = availableBetTypes
        .filter(bt => selectedBetTypes.includes(bt.id))
        .map(bt => bt.name);
      filtered = filtered.filter(item => selectedBetTypeNames.includes(item.betType));
    }

    setReportData(filtered);
    setFilteredData(filtered);
  };

  // Aplicar quick filter
  useEffect(() => {
    if (quickFilter === '') {
      setFilteredData(reportData);
    } else {
      const filtered = reportData.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(quickFilter.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [quickFilter, reportData]);

  const handleDrawChange = (event) => {
    const value = event.target.value;
    setSelectedDraws(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  const handleBetTypeChange = (event) => {
    const value = event.target.value;
    setSelectedBetTypes(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

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
        Reporte de excedentes
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Filtros */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            {/* Multi-select Sorteo */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '14px' }}>Sorteo</InputLabel>
              <Select
                multiple
                value={selectedDraws}
                onChange={handleDrawChange}
                input={<OutlinedInput label="Sorteo" />}
                renderValue={(selected) => `${selected.length} seleccionadas`}
                MenuProps={MenuProps}
                size="small"
                sx={{ fontSize: '14px' }}
              >
                {availableDraws.map((draw) => (
                  <MenuItem key={draw.id} value={draw.id} sx={{ fontSize: '14px' }}>
                    {draw.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Multi-select Tipo de jugada */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '14px' }}>Tipo de jugada</InputLabel>
              <Select
                multiple
                value={selectedBetTypes}
                onChange={handleBetTypeChange}
                input={<OutlinedInput label="Tipo de jugada" />}
                renderValue={(selected) => `${selected.length} seleccionadas`}
                MenuProps={MenuProps}
                size="small"
                sx={{ fontSize: '14px' }}
              >
                {availableBetTypes.map((betType) => (
                  <MenuItem key={betType.id} value={betType.id} sx={{ fontSize: '14px' }}>
                    {betType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Botón REFRESCAR */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleRefresh}
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
              REFRESCAR
            </Button>
          </Box>

          {/* Quick filter */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              size="small"
              placeholder="Filtrado rápido"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                endAdornment: <SearchIcon sx={{ color: '#51cbce' }} />,
                sx: { fontSize: '14px' }
              }}
            />
          </Box>

          {/* Tabla de reporte */}
          {filteredData.length > 0 ? (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Sorteo</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Tipo de jugada</TableCell>
                      <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600 }}>Excedente</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Fecha de creación</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Usuario</TableCell>
                      <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontSize: '14px' }}>{item.draw}</TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{item.betType}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '14px' }}>
                          ${item.excess.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{item.date}</TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{item.user}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="info">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Footer con contador */}
              <Typography
                sx={{
                  mt: 2,
                  fontSize: '14px',
                  color: '#6c757d',
                  textAlign: 'left'
                }}
              >
                Mostrando {filteredData.length} de {reportData.length} entradas
              </Typography>
            </>
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
              No hay entradas disponibles
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExcessesReport;
