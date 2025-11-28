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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  type SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

type SortDirection = 'asc' | 'desc';

interface Transaction {
  id: number;
  concepto: string;
  fecha: string;
  hora: string;
  creadoPor: string;
  entidad1: string;
  entidad2: string;
  saldoInicialEntidad1: number;
  saldoInicialEntidad2: number;
  debito: number;
  credito: number;
  saldoFinalEntidad1: number;
  saldoFinalEntidad2: number;
  notas: string;
}

interface SortConfig {
  key: keyof Transaction | null;
  direction: SortDirection;
}

const TransactionsList = (): React.ReactElement => {
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>('');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string>('');
  const [showNotes, setShowNotes] = useState<boolean>(false);

  const mockupData: Transaction[] = [
    { id: 1, concepto: 'Cobro de banca LA CENTRAL 01', fecha: '18/11/2025', hora: '09:30', creadoPor: 'admin', entidad1: 'LA CENTRAL 01', entidad2: 'Caja Principal', saldoInicialEntidad1: 10000.00, saldoInicialEntidad2: 50000.00, debito: 5000.00, credito: 5000.00, saldoFinalEntidad1: 5000.00, saldoFinalEntidad2: 55000.00, notas: 'Cobro de ventas del día' },
    { id: 2, concepto: 'Pago a Banco Principal', fecha: '18/11/2025', hora: '10:15', creadoPor: 'supervisor', entidad1: 'Caja Principal', entidad2: 'Banco Principal', saldoInicialEntidad1: 55000.00, saldoInicialEntidad2: 20000.00, debito: 3000.00, credito: 3000.00, saldoFinalEntidad1: 52000.00, saldoFinalEntidad2: 23000.00, notas: 'Pago de facturas' },
    { id: 3, concepto: 'Cobro de banca LA ESTRELLA 02', fecha: '18/11/2025', hora: '11:00', creadoPor: 'admin', entidad1: 'LA ESTRELLA 02', entidad2: 'Caja Principal', saldoInicialEntidad1: 8000.00, saldoInicialEntidad2: 52000.00, debito: 7500.00, credito: 7500.00, saldoFinalEntidad1: 500.00, saldoFinalEntidad2: 59500.00, notas: 'Cobro de ventas semanales' },
    { id: 4, concepto: 'Transferencia entre bancos', fecha: '17/11/2025', hora: '14:30', creadoPor: 'manager', entidad1: 'Banco Principal', entidad2: 'Banco Secundario', saldoInicialEntidad1: 23000.00, saldoInicialEntidad2: 15000.00, debito: 4500.00, credito: 4500.00, saldoFinalEntidad1: 18500.00, saldoFinalEntidad2: 19500.00, notas: 'Ajuste de saldos' },
    { id: 5, concepto: 'Cobro de banca LA SUERTE 03', fecha: '17/11/2025', hora: '16:45', creadoPor: 'admin', entidad1: 'LA SUERTE 03', entidad2: 'Caja Principal', saldoInicialEntidad1: 12000.00, saldoInicialEntidad2: 59500.00, debito: 6000.00, credito: 6000.00, saldoFinalEntidad1: 6000.00, saldoFinalEntidad2: 65500.00, notas: '' }
  ];

  const handleFilter = useCallback(() => {
    console.log('Filtering with:', { startDate, endDate, selectedEntityType, selectedEntity, selectedTransactionType, selectedCreatedBy, showNotes });
  }, [startDate, endDate, selectedEntityType, selectedEntity, selectedTransactionType, selectedCreatedBy, showNotes]);

  const handleExportCSV = useCallback(() => { console.log('Exporting to CSV'); }, []);
  const handleExportPDF = useCallback(() => { console.log('Exporting to PDF'); }, []);

  const handleSort = useCallback((key: keyof Transaction) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

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

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [quickFilter, sortConfig]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}>
        Lista de transacciones
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField type="date" label="Fecha inicial" value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField type="date" label="Fecha final" value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} size="small" />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de entidad</InputLabel>
                  <Select value={selectedEntityType} label="Tipo de entidad" onChange={(e: SelectChangeEvent) => setSelectedEntityType(e.target.value)}>
                    <MenuItem value="">Seleccione</MenuItem>
                    <MenuItem value="BANCA">Banca</MenuItem>
                    <MenuItem value="BANCO">Banco</MenuItem>
                    <MenuItem value="CAJA">Caja</MenuItem>
                    <MenuItem value="USUARIO">Usuario</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Entidad</InputLabel>
                  <Select value={selectedEntity} label="Entidad" onChange={(e: SelectChangeEvent) => setSelectedEntity(e.target.value)}>
                    <MenuItem value="">Seleccione</MenuItem>
                    <MenuItem value="LA CENTRAL 01">LA CENTRAL 01</MenuItem>
                    <MenuItem value="LA ESTRELLA 02">LA ESTRELLA 02</MenuItem>
                    <MenuItem value="LA SUERTE 03">LA SUERTE 03</MenuItem>
                    <MenuItem value="Caja Principal">Caja Principal</MenuItem>
                    <MenuItem value="Banco Principal">Banco Principal</MenuItem>
                    <MenuItem value="Banco Secundario">Banco Secundario</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de transacción</InputLabel>
                  <Select value={selectedTransactionType} label="Tipo de transacción" onChange={(e: SelectChangeEvent) => setSelectedTransactionType(e.target.value)}>
                    <MenuItem value="">Seleccione</MenuItem>
                    <MenuItem value="COBRO">Cobro</MenuItem>
                    <MenuItem value="PAGO">Pago</MenuItem>
                    <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                    <MenuItem value="AJUSTE">Ajuste</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Creado por</InputLabel>
                  <Select value={selectedCreatedBy} label="Creado por" onChange={(e: SelectChangeEvent) => setSelectedCreatedBy(e.target.value)}>
                    <MenuItem value="">Seleccione</MenuItem>
                    <MenuItem value="admin">admin</MenuItem>
                    <MenuItem value="supervisor">supervisor</MenuItem>
                    <MenuItem value="manager">manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel control={<Checkbox checked={showNotes} onChange={(e: ChangeEvent<HTMLInputElement>) => setShowNotes(e.target.checked)} />} label="Mostrar notas" />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handleFilter} sx={{ backgroundColor: '#51cbce', '&:hover': { backgroundColor: '#45b5b8' } }}>FILTRAR</Button>
              <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={handleExportCSV} sx={{ backgroundColor: '#51cbce', '&:hover': { backgroundColor: '#45b5b8' } }}>CSV</Button>
              <Button variant="contained" startIcon={<PdfIcon />} onClick={handleExportPDF} sx={{ backgroundColor: '#51cbce', '&:hover': { backgroundColor: '#45b5b8' } }}>PDF</Button>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField size="small" placeholder="Filtro rapido" value={quickFilter} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuickFilter(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ maxWidth: 300 }} />
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><TableSortLabel active={sortConfig.key === 'concepto'} direction={sortConfig.direction} onClick={() => handleSort('concepto')}>Concepto</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'fecha'} direction={sortConfig.direction} onClick={() => handleSort('fecha')}>Fecha</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'hora'} direction={sortConfig.direction} onClick={() => handleSort('hora')}>Hora</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === 'creadoPor'} direction={sortConfig.direction} onClick={() => handleSort('creadoPor')}>Creado por</TableSortLabel></TableCell>
                  <TableCell>Entidad #1</TableCell>
                  <TableCell>Entidad #2</TableCell>
                  <TableCell align="right">Saldo inicial de Entidad #1</TableCell>
                  <TableCell align="right">Saldo inicial de Entidad #2</TableCell>
                  <TableCell align="right" sx={{ color: '#dc3545' }}>Débito</TableCell>
                  <TableCell align="right" sx={{ color: '#28a745' }}>Crédito</TableCell>
                  <TableCell align="right">Saldo final de Entidad #1</TableCell>
                  <TableCell align="right">Saldo final de Entidad #2</TableCell>
                  {showNotes && <TableCell>Notas</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showNotes ? 13 : 12} align="center" sx={{ py: 3 }}>No hay entradas disponibles</TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredAndSortedData.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.concepto}</TableCell>
                        <TableCell>{item.fecha}</TableCell>
                        <TableCell>{item.hora}</TableCell>
                        <TableCell>{item.creadoPor}</TableCell>
                        <TableCell>{item.entidad1}</TableCell>
                        <TableCell>{item.entidad2}</TableCell>
                        <TableCell align="right">${item.saldoInicialEntidad1.toFixed(2)}</TableCell>
                        <TableCell align="right">${item.saldoInicialEntidad2.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: '#dc3545', fontWeight: 500 }}>${item.debito.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: '#28a745', fontWeight: 500 }}>${item.credito.toFixed(2)}</TableCell>
                        <TableCell align="right">${item.saldoFinalEntidad1.toFixed(2)}</TableCell>
                        <TableCell align="right">${item.saldoFinalEntidad2.toFixed(2)}</TableCell>
                        {showNotes && <TableCell>{item.notas}</TableCell>}
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f8f9fa', fontWeight: 600 }}>
                      <TableCell colSpan={showNotes ? 9 : 8} align="right"><strong>Totales</strong></TableCell>
                      <TableCell align="right" sx={{ color: '#dc3545', fontWeight: 600 }}>${filteredAndSortedData.reduce((sum, item) => sum + item.debito, 0).toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ color: '#28a745', fontWeight: 600 }}>${filteredAndSortedData.reduce((sum, item) => sum + item.credito, 0).toFixed(2)}</TableCell>
                      <TableCell colSpan={showNotes ? 3 : 2}></TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>Mostrando {filteredAndSortedData.length} entradas</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionsList;
