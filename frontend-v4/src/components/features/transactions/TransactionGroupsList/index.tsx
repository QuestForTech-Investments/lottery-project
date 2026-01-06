import React, { useState, useMemo, useCallback, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
  Grid
} from '@mui/material';
import { Search as SearchIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';

type SortDirection = 'asc' | 'desc';

interface TransactionGroup {
  numero: string;
  fecha: string;
  hora: string;
  creadoPor: string;
  esAutomatico: boolean;
  notas: string;
}

interface SortConfig {
  key: keyof TransactionGroup | null;
  direction: SortDirection;
}

const TransactionGroupsList = (): React.ReactElement => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const mockupData: TransactionGroup[] = [
    { numero: 'TG-001', fecha: '18/11/2025', hora: '09:30:00', creadoPor: 'admin', esAutomatico: true, notas: 'Cobro semanal a bancas zona norte' },
    { numero: 'TG-002', fecha: '18/11/2025', hora: '10:15:00', creadoPor: 'supervisor', esAutomatico: false, notas: 'Pago manual a banco principal' },
    { numero: 'TG-003', fecha: '18/11/2025', hora: '11:00:00', creadoPor: 'admin', esAutomatico: true, notas: 'Transacción automática de cierre diario' },
    { numero: 'TG-004', fecha: '17/11/2025', hora: '14:30:00', creadoPor: 'manager', esAutomatico: false, notas: 'Ajuste de balances zona sur' },
    { numero: 'TG-005', fecha: '17/11/2025', hora: '16:45:00', creadoPor: 'admin', esAutomatico: true, notas: 'Cobro automático fin de jornada' },
    { numero: 'TG-006', fecha: '16/11/2025', hora: '09:00:00', creadoPor: 'supervisor', esAutomatico: false, notas: 'Pago a proveedor de servicios' },
    { numero: 'TG-007', fecha: '16/11/2025', hora: '12:30:00', creadoPor: 'admin', esAutomatico: true, notas: 'Distribución automática de premios' },
    { numero: 'TG-008', fecha: '15/11/2025', hora: '18:00:00', creadoPor: 'manager', esAutomatico: false, notas: 'Cierre manual de caja fuerte' }
  ];

  const handleFilter = useCallback(() => {
  }, [startDate, endDate]);

  const handleSort = useCallback((key: keyof TransactionGroup) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- mockupData is stable
  const filteredAndSortedData = useMemo(() => {
    let filtered = mockupData;

    if (quickFilter) {
      filtered = filtered.filter((item) =>
        Object.entries(item).some(([key, val]) => {
          if (key === 'esAutomatico') {
            return (val ? 'sí' : 'no').includes(quickFilter.toLowerCase());
          }
          return String(val).toLowerCase().includes(quickFilter.toLowerCase());
        })
      );
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [quickFilter, sortConfig]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#2c2c2c' }}>
        Lista de grupo de transacciones
      </Typography>

      <Card elevation={1}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth size="small" label="Fecha inicial" type="date"
                value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth size="small" label="Fecha final" type="date"
                value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button fullWidth variant="contained" onClick={handleFilter} sx={{ bgcolor: '#51cbce', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase' }}>
                Filtrar
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button variant="contained" sx={{ bgcolor: '#51cbce', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase', px: 4 }}>
              Crear
            </Button>
          </Box>

          <TextField
            fullWidth size="small" placeholder="Filtro rapido"
            value={quickFilter} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuickFilter(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small"><SearchIcon fontSize="small" /></IconButton></InputAdornment> }}
          />

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell><TableSortLabel active={sortConfig.key === 'numero'} direction={sortConfig.key === 'numero' ? sortConfig.direction : 'asc'} onClick={() => handleSort('numero')} sx={{ fontWeight: 600 }}>Número</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'fecha'} direction={sortConfig.key === 'fecha' ? sortConfig.direction : 'asc'} onClick={() => handleSort('fecha')} sx={{ fontWeight: 600 }}>Fecha</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'hora'} direction={sortConfig.key === 'hora' ? sortConfig.direction : 'asc'} onClick={() => handleSort('hora')} sx={{ fontWeight: 600 }}>Hora</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'creadoPor'} direction={sortConfig.key === 'creadoPor' ? sortConfig.direction : 'asc'} onClick={() => handleSort('creadoPor')} sx={{ fontWeight: 600 }}>Creado por</TableSortLabel></TableCell>
                  <TableCell align="center"><TableSortLabel active={sortConfig.key === 'esAutomatico'} direction={sortConfig.key === 'esAutomatico' ? sortConfig.direction : 'asc'} onClick={() => handleSort('esAutomatico')} sx={{ fontWeight: 600 }}>¿Es automático?</TableSortLabel></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">No hay entradas disponibles</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{item.numero}</TableCell>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>{item.hora}</TableCell>
                      <TableCell>{item.creadoPor}</TableCell>
                      <TableCell align="center">
                        <Chip label={item.esAutomatico ? 'Sí' : 'No'} color={item.esAutomatico ? 'success' : 'default'} size="small" sx={{ fontSize: '12px' }} />
                      </TableCell>
                      <TableCell>{item.notas}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Mostrando {filteredAndSortedData.length} entradas
          </Typography>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="contained" sx={{ bgcolor: '#51cbce', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase', px: 4 }}>
              Crear
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionGroupsList;
