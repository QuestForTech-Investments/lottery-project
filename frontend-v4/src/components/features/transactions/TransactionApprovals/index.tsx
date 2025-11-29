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
  Grid,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

type SortDirection = 'asc' | 'desc';
type TransactionStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
type TransactionType = 'COBRO' | 'PAGO';

interface TransactionApproval {
  id: number;
  cobrador: string;
  revisadoPor: string | null;
  tipo: TransactionType;
  fecha: string;
  numero: string;
  banca: string;
  zonaPrimaria: string;
  banco: string;
  credito: number;
  debito: number;
  balance: number;
  estado: TransactionStatus;
}

interface SortConfig {
  key: keyof TransactionApproval | null;
  direction: SortDirection;
}

const TransactionApprovals = (): React.ReactElement => {
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedCollector, setSelectedCollector] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  // Mockup data - 8 transaction approvals
  const mockupData: TransactionApproval[] = [
    { id: 1, cobrador: 'Juan Pérez', revisadoPor: 'admin', tipo: 'COBRO', fecha: '18/11/2025', numero: 'TA-001', banca: 'LA CENTRAL 01', zonaPrimaria: 'Zona Norte', banco: 'Banco Principal', credito: 5000.00, debito: 0.00, balance: 5000.00, estado: 'PENDIENTE' },
    { id: 2, cobrador: 'María González', revisadoPor: 'supervisor', tipo: 'PAGO', fecha: '18/11/2025', numero: 'TA-002', banca: 'LA ESTRELLA 02', zonaPrimaria: 'Zona Sur', banco: 'Banco Secundario', credito: 0.00, debito: 3000.00, balance: -3000.00, estado: 'APROBADO' },
    { id: 3, cobrador: 'Carlos Rodríguez', revisadoPor: null, tipo: 'COBRO', fecha: '18/11/2025', numero: 'TA-003', banca: 'LA SUERTE 03', zonaPrimaria: 'Zona Este', banco: 'Banco Principal', credito: 7500.00, debito: 0.00, balance: 7500.00, estado: 'PENDIENTE' },
    { id: 4, cobrador: 'Ana Martínez', revisadoPor: 'admin', tipo: 'PAGO', fecha: '17/11/2025', numero: 'TA-004', banca: 'LA FORTUNA 04', zonaPrimaria: 'Zona Oeste', banco: 'Banco Secundario', credito: 0.00, debito: 4500.00, balance: -4500.00, estado: 'RECHAZADO' },
    { id: 5, cobrador: 'Luis Fernández', revisadoPor: 'manager', tipo: 'COBRO', fecha: '17/11/2025', numero: 'TA-005', banca: 'LA VICTORIA 05', zonaPrimaria: 'Zona Norte', banco: 'Banco Principal', credito: 6000.00, debito: 0.00, balance: 6000.00, estado: 'APROBADO' },
    { id: 6, cobrador: 'Sofía Torres', revisadoPor: null, tipo: 'PAGO', fecha: '16/11/2025', numero: 'TA-006', banca: 'LA ESPERANZA 06', zonaPrimaria: 'Zona Sur', banco: 'Banco Secundario', credito: 0.00, debito: 2500.00, balance: -2500.00, estado: 'PENDIENTE' },
    { id: 7, cobrador: 'Miguel Ángel', revisadoPor: 'supervisor', tipo: 'COBRO', fecha: '16/11/2025', numero: 'TA-007', banca: 'LA BENDICIÓN 07', zonaPrimaria: 'Zona Este', banco: 'Banco Principal', credito: 8000.00, debito: 0.00, balance: 8000.00, estado: 'APROBADO' },
    { id: 8, cobrador: 'Patricia Ruiz', revisadoPor: 'admin', tipo: 'PAGO', fecha: '15/11/2025', numero: 'TA-008', banca: 'LA PROVIDENCIA 08', zonaPrimaria: 'Zona Oeste', banco: 'Banco Secundario', credito: 0.00, debito: 5500.00, balance: -5500.00, estado: 'RECHAZADO' }
  ];

  const handleSort = useCallback((key: keyof TransactionApproval) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handleFilter = useCallback(() => {
    console.log('Filtering with:', { startDate, endDate, selectedZone, selectedBank, selectedCollector, selectedType });
  }, [startDate, endDate, selectedZone, selectedBank, selectedCollector, selectedType]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- mockupData is stable
  const filteredAndSortedData = useMemo(() => {
    let filtered = mockupData;

    if (quickFilter) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(quickFilter.toLowerCase())
        )
      );
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];

        if (aVal === null) return 1;
        if (bVal === null) return -1;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [quickFilter, sortConfig]);

  const getEstadoChip = (estado: TransactionStatus): 'warning' | 'success' | 'error' | 'default' => {
    const colors: Record<TransactionStatus, 'warning' | 'success' | 'error'> = {
      'PENDIENTE': 'warning',
      'APROBADO': 'success',
      'RECHAZADO': 'error'
    };
    return colors[estado] || 'default';
  };

  const handleApprove = useCallback((id: number) => {
    console.log('Approve transaction:', id);
  }, []);

  const handleReject = useCallback((id: number) => {
    console.log('Reject transaction:', id);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#2c2c2c' }}>
        Lista de aprobaciones
      </Typography>

      <Card elevation={1}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setShowFilters(!showFilters)}
              endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ bgcolor: '#51cbce', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase', px: 4 }}
            >
              FILTROS
            </Button>
          </Box>

          <Collapse in={showFilters}>
            <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#f9f9f9' }}>
              <Grid container spacing={3}>
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
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Zona</InputLabel>
                    <Select value={selectedZone} onChange={(e: SelectChangeEvent) => setSelectedZone(e.target.value)} label="Zona">
                      <MenuItem value="">Todas las zonas</MenuItem>
                      <MenuItem value="norte">Zona Norte</MenuItem>
                      <MenuItem value="sur">Zona Sur</MenuItem>
                      <MenuItem value="este">Zona Este</MenuItem>
                      <MenuItem value="oeste">Zona Oeste</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Banco</InputLabel>
                    <Select value={selectedBank} onChange={(e: SelectChangeEvent) => setSelectedBank(e.target.value)} label="Banco">
                      <MenuItem value="">Todos los bancos</MenuItem>
                      <MenuItem value="principal">Banco Principal</MenuItem>
                      <MenuItem value="secundario">Banco Secundario</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth size="small" label="Cobrador" placeholder="Nombre del cobrador"
                    value={selectedCollector} onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedCollector(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select value={selectedType} onChange={(e: SelectChangeEvent) => setSelectedType(e.target.value)} label="Tipo">
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="COBRO">COBRO</MenuItem>
                      <MenuItem value="PAGO">PAGO</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="contained" onClick={handleFilter} sx={{ bgcolor: '#51cbce', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase', px: 4 }}>
                  Filtrar
                </Button>
              </Box>
            </Paper>
          </Collapse>

          <TextField
            fullWidth size="small" placeholder="Filtrado rápido"
            value={quickFilter} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuickFilter(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small"><SearchIcon fontSize="small" /></IconButton></InputAdornment> }}
          />

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell><TableSortLabel active={sortConfig.key === 'cobrador'} direction={sortConfig.key === 'cobrador' ? sortConfig.direction : 'asc'} onClick={() => handleSort('cobrador')} sx={{ fontWeight: 600 }}>Cobrador</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'revisadoPor'} direction={sortConfig.key === 'revisadoPor' ? sortConfig.direction : 'asc'} onClick={() => handleSort('revisadoPor')} sx={{ fontWeight: 600 }}>Revisado por</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'tipo'} direction={sortConfig.key === 'tipo' ? sortConfig.direction : 'asc'} onClick={() => handleSort('tipo')} sx={{ fontWeight: 600 }}>Tipo</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'fecha'} direction={sortConfig.key === 'fecha' ? sortConfig.direction : 'asc'} onClick={() => handleSort('fecha')} sx={{ fontWeight: 600 }}>Fecha</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'numero'} direction={sortConfig.key === 'numero' ? sortConfig.direction : 'asc'} onClick={() => handleSort('numero')} sx={{ fontWeight: 600 }}>#</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'banca'} direction={sortConfig.key === 'banca' ? sortConfig.direction : 'asc'} onClick={() => handleSort('banca')} sx={{ fontWeight: 600 }}>Banca</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'zonaPrimaria'} direction={sortConfig.key === 'zonaPrimaria' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zonaPrimaria')} sx={{ fontWeight: 600 }}>Zona primaria</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'banco'} direction={sortConfig.key === 'banco' ? sortConfig.direction : 'asc'} onClick={() => handleSort('banco')} sx={{ fontWeight: 600 }}>Banco</TableSortLabel></TableCell>
                  <TableCell align="right"><TableSortLabel active={sortConfig.key === 'credito'} direction={sortConfig.key === 'credito' ? sortConfig.direction : 'asc'} onClick={() => handleSort('credito')} sx={{ fontWeight: 600 }}>Crédito</TableSortLabel></TableCell>
                  <TableCell align="right"><TableSortLabel active={sortConfig.key === 'debito'} direction={sortConfig.key === 'debito' ? sortConfig.direction : 'asc'} onClick={() => handleSort('debito')} sx={{ fontWeight: 600 }}>Débito</TableSortLabel></TableCell>
                  <TableCell align="right"><TableSortLabel active={sortConfig.key === 'balance'} direction={sortConfig.key === 'balance' ? sortConfig.direction : 'asc'} onClick={() => handleSort('balance')} sx={{ fontWeight: 600 }}>Balance</TableSortLabel></TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, width: '140px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">No hay entradas disponibles</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.cobrador}</TableCell>
                      <TableCell>{item.revisadoPor || '-'}</TableCell>
                      <TableCell><Chip label={item.tipo} color={item.tipo === 'COBRO' ? 'info' : 'warning'} size="small" sx={{ fontSize: '12px' }} /></TableCell>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>{item.numero}</TableCell>
                      <TableCell>{item.banca}</TableCell>
                      <TableCell>{item.zonaPrimaria}</TableCell>
                      <TableCell>{item.banco}</TableCell>
                      <TableCell align="right">${item.credito.toFixed(2)}</TableCell>
                      <TableCell align="right">${item.debito.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>${item.balance.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        {item.estado === 'PENDIENTE' ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => handleApprove(item.id)} title="Aprobar" sx={{ color: '#28a745' }}><CheckIcon fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => handleReject(item.id)} title="Rechazar" sx={{ color: '#dc3545' }}><CloseIcon fontSize="small" /></IconButton>
                          </Box>
                        ) : (
                          <Chip label={item.estado} color={getEstadoChip(item.estado)} size="small" sx={{ fontSize: '11px' }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Mostrando {filteredAndSortedData.length} de {mockupData.length} entradas
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionApprovals;
