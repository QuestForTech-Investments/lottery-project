import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  OutlinedInput,
  Chip
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';

const TransactionsSummary = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedZones, setSelectedZones] = useState([]);
  const [quickFilter, setQuickFilter] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

  // Mockup data para la tabla principal
  const mockupData = [
    {
      id: 1,
      codigo: 'LAN-0009',
      banca: 'admin',
      zona: 'Zona Norte',
      cobros: 5000.00,
      pagos: 2000.00,
      netoFlujo: 3000.00,
      debito: 1500.00,
      credito: 4500.00,
      netoSorteo: 3000.00,
      caida: 'DIARIA'
    },
    {
      id: 2,
      codigo: 'LAN-0010',
      banca: 'LA CENTRAL 01',
      zona: 'Zona Sur',
      cobros: 7500.00,
      pagos: 3000.00,
      netoFlujo: 4500.00,
      debito: 2000.00,
      credito: 6000.00,
      netoSorteo: 4000.00,
      caida: 'MENSUAL'
    },
    {
      id: 3,
      codigo: 'LAN-0020',
      banca: 'LA ESTRELLA 02',
      zona: 'Zona Este',
      cobros: 6000.00,
      pagos: 2500.00,
      netoFlujo: 3500.00,
      debito: 1800.00,
      credito: 5200.00,
      netoSorteo: 3400.00,
      caida: 'SEMANAL'
    },
    {
      id: 4,
      codigo: 'LAN-0021',
      banca: 'LA SUERTE 03',
      zona: 'Zona Oeste',
      cobros: 8000.00,
      pagos: 3500.00,
      netoFlujo: 4500.00,
      debito: 2200.00,
      credito: 6800.00,
      netoSorteo: 4600.00,
      caida: 'DIARIA'
    },
    {
      id: 5,
      codigo: 'LAN-0022',
      banca: 'LA FORTUNA 04',
      zona: 'Zona Norte',
      cobros: 9000.00,
      pagos: 4000.00,
      netoFlujo: 5000.00,
      debito: 2500.00,
      credito: 7500.00,
      netoSorteo: 5000.00,
      caida: 'MENSUAL'
    },
  ];

  // Mockup data para la segunda tabla
  const otherTransactions = {
    retirosEfectivo: 1500.00,
    debito: 500.00,
    credito: 2000.00
  };

  const zones = [
    'Zona Norte',
    'Zona Sur',
    'Zona Este',
    'Zona Oeste'
  ];

  // Filtrar datos
  const filteredData = useMemo(() => {
    return mockupData.filter(item => {
      const matchesQuickFilter = quickFilter === '' ||
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(quickFilter.toLowerCase())
        );
      return matchesQuickFilter;
    });
  }, [quickFilter]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return order === 'asc' ? -1 : 1;
      if (aStr > bStr) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, orderBy, order]);

  // Calcular totales
  const totals = useMemo(() => {
    return sortedData.reduce((acc, item) => ({
      cobros: acc.cobros + item.cobros,
      pagos: acc.pagos + item.pagos,
      netoFlujo: acc.netoFlujo + item.netoFlujo,
      debito: acc.debito + item.debito,
      credito: acc.credito + item.credito,
      netoSorteo: acc.netoSorteo + item.netoSorteo,
      caida: acc.caida + (item.caida === 'DIARIA' ? 1 : 0)
    }), {
      cobros: 0,
      pagos: 0,
      netoFlujo: 0,
      debito: 0,
      credito: 0,
      netoSorteo: 0,
      caida: 0
    });
  }, [sortedData]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilter = () => {
    console.log('Filtering with:', { startDate, endDate, selectedZones });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
        Resumen de transacciones
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <TextField
            label="Fecha inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Fecha final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel>Zonas</InputLabel>
            <Select
              multiple
              value={selectedZones}
              onChange={(e) => setSelectedZones(e.target.value)}
              input={<OutlinedInput label="Zonas" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {zones.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  {zone}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={handleFilter}
            sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#3fa7aa' }
            }}
          >
            Filtrar
          </Button>
        </Box>
      </Paper>

      {/* Quick filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          placeholder="Filtro rápido"
          value={quickFilter}
          onChange={(e) => setQuickFilter(e.target.value)}
          size="small"
          sx={{ maxWidth: 300 }}
        />
        <IconButton
          sx={{
            bgcolor: '#51cbce',
            color: 'white',
            '&:hover': { bgcolor: '#3fa7aa' }
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      {/* Tabla principal */}
      <TableContainer component={Paper} sx={{ mb: 5 }}>
        <Table size="small">
          <TableHead>
            {/* Primera fila de headers - agrupados */}
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                Código
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                Banca
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                Zona
              </TableCell>
              <TableCell colSpan={3} align="center" sx={{ fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>
                Flujo de caja
              </TableCell>
              <TableCell colSpan={3} align="center" sx={{ fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>
                Resultados de Sorteo
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                Caída
              </TableCell>
            </TableRow>
            {/* Segunda fila de headers - columnas detalladas */}
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'cobros'}
                  direction={orderBy === 'cobros' ? order : 'asc'}
                  onClick={() => handleRequestSort('cobros')}
                >
                  Cobros
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'pagos'}
                  direction={orderBy === 'pagos' ? order : 'asc'}
                  onClick={() => handleRequestSort('pagos')}
                >
                  Pagos
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#d1ecf1' }}>
                <TableSortLabel
                  active={orderBy === 'netoFlujo'}
                  direction={orderBy === 'netoFlujo' ? order : 'asc'}
                  onClick={() => handleRequestSort('netoFlujo')}
                >
                  Neto
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'debito'}
                  direction={orderBy === 'debito' ? order : 'asc'}
                  onClick={() => handleRequestSort('debito')}
                >
                  Débito
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'credito'}
                  direction={orderBy === 'credito' ? order : 'asc'}
                  onClick={() => handleRequestSort('credito')}
                >
                  Crédito
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#d1ecf1' }}>
                <TableSortLabel
                  active={orderBy === 'netoSorteo'}
                  direction={orderBy === 'netoSorteo' ? order : 'asc'}
                  onClick={() => handleRequestSort('netoSorteo')}
                >
                  Neto
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3, color: '#666' }}>
                  No hay entradas disponibles
                </TableCell>
              </TableRow>
            ) : (
              <>
                {sortedData.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.codigo}</TableCell>
                    <TableCell>{item.banca}</TableCell>
                    <TableCell>{item.zona}</TableCell>
                    <TableCell align="right">${item.cobros.toFixed(2)}</TableCell>
                    <TableCell align="right">${item.pagos.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#d1ecf1' }}>
                      ${item.netoFlujo.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">${item.debito.toFixed(2)}</TableCell>
                    <TableCell align="right">${item.credito.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#d1ecf1' }}>
                      ${item.netoSorteo.toFixed(2)}
                    </TableCell>
                    <TableCell>{item.caida}</TableCell>
                  </TableRow>
                ))}
                {/* Fila de totales */}
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Totales</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${totals.cobros.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${totals.pagos.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#d1ecf1' }}>
                    ${totals.netoFlujo.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${totals.debito.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${totals.credito.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#d1ecf1' }}>
                    ${totals.netoSorteo.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${totals.caida.toFixed(2)}
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
        <Box sx={{ p: 2, color: '#666', fontSize: '14px' }}>
          Mostrando {sortedData.length} de {sortedData.length} entradas
        </Box>
      </TableContainer>

      {/* Segunda tabla - Resumen otras transacciones */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Resumen otras transacciones
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {/* Primera fila de headers */}
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell colSpan={3} align="center" sx={{ fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>
                  Ajustes
                </TableCell>
              </TableRow>
              {/* Segunda fila de headers */}
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Retiros de efectivo</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Débito</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Crédito</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="right">${otherTransactions.retirosEfectivo.toFixed(2)}</TableCell>
                <TableCell align="right">${otherTransactions.debito.toFixed(2)}</TableCell>
                <TableCell align="right">${otherTransactions.credito.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default TransactionsSummary;
