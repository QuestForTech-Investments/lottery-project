import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

/**
 * F8Monitor Component (Material-UI V2)
 *
 * F8 - Monitoreo de jugadas por Banca
 * Permite filtrar jugadas por fecha, sorteo y número de jugada
 */
const F8Monitor = () => {
  const [filters, setFilters] = useState({
    fecha: new Date().toISOString().split('T')[0],
    sorteo: '',
    jugada: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mockup data - 5 bancas con montos
  const [playData] = useState([
    { id: 1, banca: 'LA CENTRAL 01', monto: 150.00 },
    { id: 2, banca: 'NORTE EXPRESS', monto: 320.50 },
    { id: 3, banca: 'SUR PREMIUM', monto: 89.75 },
    { id: 4, banca: 'ESTE RAPIDO', monto: 210.00 },
    { id: 5, banca: 'OESTE GOLD', monto: 175.25 }
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    console.log('Refrescar datos:', filters);
    alert(`Refrescando datos (mockup)\nFecha: ${filters.fecha}\nSorteo: ${filters.sorteo || 'Todos'}\nJugada: ${filters.jugada || 'Todas'}`);
  };

  const filteredData = playData.filter(item =>
    item.banca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = filteredData.reduce((sum, item) => sum + item.monto, 0);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 1200, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Título */}
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#2c2c2c'
            }}
          >
            F8 - Monitoreo de jugadas por Banca
          </Typography>

          {/* Filtros */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <TextField
              label="Fecha"
              type="date"
              name="fecha"
              value={filters.fecha}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              size="small"
            />
            <FormControl size="small">
              <InputLabel sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                Sorteos
              </InputLabel>
              <Select
                name="sorteo"
                value={filters.sorteo}
                onChange={handleFilterChange}
                label="Sorteos"
                sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="DIARIA 11AM">DIARIA 11AM</MenuItem>
                <MenuItem value="LOTEDOM">LOTEDOM</MenuItem>
                <MenuItem value="LA PRIMERA">LA PRIMERA</MenuItem>
                <MenuItem value="TEXAS DAY">TEXAS DAY</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Jugada"
              name="jugada"
              value={filters.jugada}
              onChange={handleFilterChange}
              placeholder="Número de jugada"
              InputLabelProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleRefresh}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                color: 'white',
                textTransform: 'none',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500
              }}
            >
              REFRESCAR
            </Button>
          </Box>

          {/* Total */}
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '20px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              mb: 3,
              color: '#2c2c2c'
            }}
          >
            Total: ${total.toFixed(2)}
          </Typography>

          {/* Filtro rápido */}
          <Box sx={{ mb: 3, maxWidth: 400 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filtrado rápido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />
          </Box>

          {/* Tabla */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    Bancas
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    Monto
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 5, color: '#999', fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                      No hay entradas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        {item.banca}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        ${item.monto.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid #dee2e6',
              fontSize: '14px',
              color: '#666',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Mostrando {filteredData.length} de {playData.length} entradas
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default F8Monitor;
