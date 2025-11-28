import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Info as InfoIcon, Cancel as CancelIcon } from '@mui/icons-material';

const DebtCollectors = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [quickFilter, setQuickFilter] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [statusFilters, setStatusFilters] = useState({
    aprobada: false,
    pendiente: true,
    rechazada: true
  });

  // Tab Crear form state
  const [createForm, setCreateForm] = useState({
    tipo: '',
    bancaNombre: '',
    bancaCodigo: '',
    banco: '',
    monto: '',
    notas: ''
  });

  // Mockup data - Balances
  const [balances] = useState([
    { id: 1, banca: 'LA CENTRAL 01', inicio: 5000.00, actual: 4500.00 },
    { id: 2, banca: 'LA CENTRAL 02', inicio: 3000.00, actual: 3200.00 },
    { id: 3, banca: 'BANCA NORTE', inicio: 2500.00, actual: 2100.00 },
    { id: 4, banca: 'BANCA SUR', inicio: 4000.00, actual: 4300.00 },
    { id: 5, banca: 'BANCA ESTE', inicio: 3500.00, actual: 3000.00 }
  ]);

  // Mockup data - Transacciones
  const [transactions] = useState([
    { id: 1, tipo: 'Cobro', fecha: '18/11/2025', num: 'CB-001', banca: 'LA CENTRAL 01', banco: 'BANCO POPULAR', credito: 1000.00, debito: 0, msg: 'Pago semanal', estado: 'PENDIENTE' },
    { id: 2, tipo: 'Pago', fecha: '18/11/2025', num: 'PG-001', banca: 'LA CENTRAL 02', banco: 'BANCO BHD', credito: 0, debito: 500.00, msg: 'Retiro', estado: 'PENDIENTE' },
    { id: 3, tipo: 'Cobro', fecha: '17/11/2025', num: 'CB-002', banca: 'BANCA NORTE', banco: 'BANCO POPULAR', credito: 800.00, debito: 0, msg: 'Cobro mensual', estado: 'PENDIENTE' },
    { id: 4, tipo: 'Pago', fecha: '17/11/2025', num: 'PG-002', banca: 'BANCA SUR', banco: 'BANCO LA CENTRAL', credito: 0, debito: 300.00, msg: 'Pago proveedor', estado: 'RECHAZADA' },
    { id: 5, tipo: 'Cobro', fecha: '16/11/2025', num: 'CB-003', banca: 'BANCA ESTE', banco: 'BANCO BHD', credito: 1200.00, debito: 0, msg: 'Cobro quincenal', estado: 'RECHAZADA' },
    { id: 6, tipo: 'Pago', fecha: '16/11/2025', num: 'PG-003', banca: 'LA CENTRAL 01', banco: 'BANCO POPULAR', credito: 0, debito: 600.00, msg: 'Ajuste', estado: 'RECHAZADA' },
    { id: 7, tipo: 'Cobro', fecha: '15/11/2025', num: 'CB-004', banca: 'LA CENTRAL 02', banco: 'BANCO BHD', credito: 900.00, debito: 0, msg: 'Pago de cliente', estado: 'APROBADA' },
    { id: 8, tipo: 'Pago', fecha: '15/11/2025', num: 'PG-004', banca: 'BANCA NORTE', banco: 'BANCO LA CENTRAL', credito: 0, debito: 400.00, msg: 'Comisión', estado: 'APROBADA' }
  ]);

  const filteredBalances = balances.filter(b =>
    b.banca.toLowerCase().includes(quickFilter.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = t.banca.toLowerCase().includes(quickFilter.toLowerCase()) ||
                          t.banco.toLowerCase().includes(quickFilter.toLowerCase()) ||
                          t.msg.toLowerCase().includes(quickFilter.toLowerCase());
    const matchesStatus = (
      (statusFilters.aprobada && t.estado === 'APROBADA') ||
      (statusFilters.pendiente && t.estado === 'PENDIENTE') ||
      (statusFilters.rechazada && t.estado === 'RECHAZADA')
    );
    return matchesFilter && matchesStatus;
  });

  const handleStatusChange = (status) => {
    setStatusFilters(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAgregar = () => {
    console.log('Agregar transacción:', createForm);
    alert('Transacción agregada (mockup)');
    // Reset form
    setCreateForm({
      tipo: '',
      bancaNombre: '',
      bancaCodigo: '',
      banco: '',
      monto: '',
      notas: ''
    });
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Botón Refrescar */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => console.log('Refrescar')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
            fontSize: '14px',
            px: 5,
            py: 1.5,
            textTransform: 'none'
          }}
        >
          REFRESCAR
        </Button>
      </Box>

      {/* Card Container */}
      <Card>
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 2,
            borderColor: '#6366f1',
            '& .MuiTab-root': { fontSize: '14px' },
            '& .Mui-selected': { color: '#6366f1' }
          }}
          TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}
        >
          <Tab label="Balances" />
          <Tab label="Transacciones" />
          <Tab label="Crear" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab Balances */}
          {activeTab === 0 && (
            <Box>
              {/* Quick Filter */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <TextField
                  placeholder="Filtrado rápido"
                  value={quickFilter}
                  onChange={(e) => setQuickFilter(e.target.value)}
                  size="small"
                  sx={{ width: '300px' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon sx={{ color: '#999' }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: '14px' }
                  }}
                />
              </Box>

              {/* Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>#</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Banca</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Inicio</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Actual</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBalances.length > 0 ? (
                      filteredBalances.map((balance) => (
                        <TableRow key={balance.id} hover>
                          <TableCell sx={{ fontSize: '14px' }}>{balance.id}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>{balance.banca}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>${balance.inicio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>${balance.actual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <IconButton size="small" sx={{ color: '#17a2b8' }}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#999', py: 3 }}>
                          No hay entradas disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Footer */}
              <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#999', mt: 2 }}>
                Mostrando {filteredBalances.length} de {balances.length} entradas
              </Typography>
            </Box>
          )}

          {/* Tab Transacciones */}
          {activeTab === 1 && (
            <Box>
              {/* Date Filter */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  type="date"
                  label="Fecha"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true, sx: { fontSize: '12px' } }}
                  sx={{ width: '200px' }}
                />
              </Box>

              <Box sx={{ borderBottom: '1px solid #ddd', mb: 2 }} />

              {/* Status Checkboxes */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusFilters.aprobada}
                      onChange={() => handleStatusChange('aprobada')}
                      sx={{ '&.Mui-checked': { color: '#6366f1' } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: '14px' }}>Aprobada</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusFilters.pendiente}
                      onChange={() => handleStatusChange('pendiente')}
                      sx={{ '&.Mui-checked': { color: '#6366f1' } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: '14px' }}>Pendiente</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusFilters.rechazada}
                      onChange={() => handleStatusChange('rechazada')}
                      sx={{ '&.Mui-checked': { color: '#6366f1' } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: '14px' }}>Rechazada</Typography>}
                />
              </Box>

              {/* Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Tipo</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Fecha</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>#</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Banca</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Banco</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Crédito</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Débito</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Msg.</TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Cancel</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((trans) => (
                        <TableRow key={trans.id} hover>
                          <TableCell sx={{ fontSize: '14px' }}>{trans.tipo}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>{trans.fecha}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>{trans.num}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>{trans.banca}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>{trans.banco}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>${trans.credito.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>${trans.debito.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>{trans.msg}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <IconButton size="small" sx={{ color: '#dc3545' }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} sx={{ textAlign: 'center', color: '#999', py: 3 }}>
                          No hay entradas disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Footer */}
              <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#999', mt: 2 }}>
                Mostrando {filteredTransactions.length} de {transactions.length} entradas
              </Typography>
            </Box>
          )}

          {/* Tab Crear */}
          {activeTab === 2 && (
            <Box>
              {/* Alert */}
              <Alert severity="warning" sx={{ mb: 3 }}>
                <strong>Atención!</strong> Usted no tiene bancos asignados. Por favor contacte a su administrador.
              </Alert>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Left Column */}
                <Box>
                  {/* Tipo */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontSize: '12px' }}>Tipo</InputLabel>
                    <Select
                      value={createForm.tipo}
                      onChange={(e) => handleCreateFormChange('tipo', e.target.value)}
                      label="Tipo"
                      sx={{ fontSize: '14px' }}
                    >
                      <MenuItem value=""><em>Seleccione uno...</em></MenuItem>
                      <MenuItem value="cobro" sx={{ fontSize: '14px' }}>Cobro</MenuItem>
                      <MenuItem value="pago" sx={{ fontSize: '14px' }}>Pago</MenuItem>
                    </Select>
                  </FormControl>

                  {/* BANCA Section */}
                  <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mb: 1, mt: 2 }}>
                    BANCA
                  </Typography>

                  <TextField
                    fullWidth
                    label="Nombre"
                    value={createForm.bancaNombre}
                    onChange={(e) => handleCreateFormChange('bancaNombre', e.target.value)}
                    placeholder="Buscar banca..."
                    InputLabelProps={{ sx: { fontSize: '12px' } }}
                    InputProps={{ sx: { fontSize: '14px' } }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Código"
                    value={createForm.bancaCodigo}
                    onChange={(e) => handleCreateFormChange('bancaCodigo', e.target.value)}
                    placeholder="Código de banca..."
                    InputLabelProps={{ sx: { fontSize: '12px' } }}
                    InputProps={{ sx: { fontSize: '14px' } }}
                    sx={{ mb: 2 }}
                  />

                  {/* Banco */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontSize: '12px' }}>Banco</InputLabel>
                    <Select
                      value={createForm.banco}
                      onChange={(e) => handleCreateFormChange('banco', e.target.value)}
                      label="Banco"
                      sx={{ fontSize: '14px' }}
                    >
                      <MenuItem value=""><em>Seleccione uno...</em></MenuItem>
                      <MenuItem value="banco_popular" sx={{ fontSize: '14px' }}>BANCO POPULAR</MenuItem>
                      <MenuItem value="banco_bhd" sx={{ fontSize: '14px' }}>BANCO BHD</MenuItem>
                      <MenuItem value="banco_central" sx={{ fontSize: '14px' }}>BANCO LA CENTRAL</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Right Column */}
                <Box>
                  {/* Monto */}
                  <TextField
                    fullWidth
                    type="number"
                    label="Monto"
                    value={createForm.monto}
                    onChange={(e) => handleCreateFormChange('monto', e.target.value)}
                    placeholder="0.00"
                    InputLabelProps={{ sx: { fontSize: '12px' } }}
                    InputProps={{ sx: { fontSize: '14px' } }}
                    sx={{ mb: 2 }}
                  />

                  {/* Notas */}
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    label="Notas de la transacción"
                    value={createForm.notas}
                    onChange={(e) => handleCreateFormChange('notas', e.target.value)}
                    placeholder="Notas adicionales..."
                    InputLabelProps={{ sx: { fontSize: '12px' } }}
                    InputProps={{ sx: { fontSize: '14px' } }}
                  />
                </Box>
              </Box>

              {/* Botón Agregar */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleAgregar}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
                    fontSize: '14px',
                    px: 5,
                    py: 1.5,
                    textTransform: 'none'
                  }}
                >
                  AGREGAR
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DebtCollectors;
