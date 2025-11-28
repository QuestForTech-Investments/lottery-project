import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Switch, FormControlLabel,
  Button, ToggleButtonGroup, ToggleButton, Table, TableHead, TableBody, TableRow, TableCell, IconButton,
  CircularProgress, Alert
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import ticketService from '../../../../services/ticketService';
import api from '../../../../services/api';

const TicketMonitoring = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [banca, setBanca] = useState(null);
  const [bancas, setBancas] = useState([]);
  const [loteria, setLoteria] = useState(null);
  const [tipoJugada, setTipoJugada] = useState(null);
  const [numero, setNumero] = useState('');
  const [pendientesPago, setPendientesPago] = useState(false);
  const [soloGanadores, setSoloGanadores] = useState(false);
  const [zona, setZona] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroRapido, setFiltroRapido] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loterias, setLoterias] = useState([]);
  const [tiposJugada, setTiposJugada] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [totals, setTotals] = useState({ montoTotal: 0, totalPremios: 0, totalPendiente: 0 });
  const [counts, setCounts] = useState({ todos: 0, ganadores: 0, pendientes: 0, perdedores: 0, cancelados: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load betting pools
  const loadBancas = async () => {
    try {
      const response = await api.get('/betting-pools');
      const pools = response.items || response || [];
      const mappedPools = pools.map(p => ({
        id: p.bettingPoolId,
        name: p.bettingPoolName,
        code: p.bettingPoolCode
      }));
      setBancas(mappedPools);
      return mappedPools;
    } catch (err) {
      console.error('Error loading betting pools:', err);
      return [];
    }
  };

  // Load tickets from API
  const loadTickets = async (selectedBancaId = null) => {
    setLoading(true);
    setError(null);

    // Use the selected banca ID or fall back to the banca state
    const bettingPoolId = selectedBancaId || (banca ? banca.id : null);

    // API requires at least one filter (banca, loteria, zona, estado, or search)
    if (!bettingPoolId && !loteria && !zona && !numero) {
      setError('Seleccione al menos una banca, lotería, zona o número para filtrar.');
      setLoading(false);
      return;
    }

    try {
      const filters = {
        date: fecha,  // API expects 'date' not 'startDate/endDate'
        bettingPoolId: bettingPoolId,
        pageNumber: 1,
        pageSize: 100
      };

      const response = await ticketService.filterTickets(filters);

      // Map API response to component format
      const mappedTickets = (response.tickets || []).map(ticket => ({
        id: ticket.ticketId,
        numero: ticket.ticketCode,
        fecha: new Date(ticket.createdAt).toLocaleDateString(),
        usuario: ticket.userName || 'N/A',
        monto: ticket.grandTotal,
        premio: ticket.totalPrize || 0,
        fechaCancelacion: ticket.cancelledAt ? new Date(ticket.cancelledAt).toLocaleDateString() : null,
        estado: ticket.isCancelled ? 'Cancelado' :
                (ticket.totalPrize > 0 ? 'Ganador' :
                (ticket.isPaid ? 'Pagado' : 'Pendiente'))
      }));

      setTickets(mappedTickets);

      // Calculate counts
      const ganadores = mappedTickets.filter(t => t.estado === 'Ganador').length;
      const pendientes = mappedTickets.filter(t => t.estado === 'Pendiente').length;
      const perdedores = mappedTickets.filter(t => t.estado === 'Perdedor' || t.estado === 'Pagado').length;
      const cancelados = mappedTickets.filter(t => t.estado === 'Cancelado').length;

      setCounts({
        todos: mappedTickets.length,
        ganadores,
        pendientes,
        perdedores,
        cancelados
      });

      // Calculate totals
      setTotals({
        montoTotal: mappedTickets.reduce((sum, t) => sum + t.monto, 0),
        totalPremios: mappedTickets.reduce((sum, t) => sum + t.premio, 0),
        totalPendiente: mappedTickets.filter(t => t.estado === 'Pendiente').reduce((sum, t) => sum + t.monto, 0)
      });

    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Error al cargar los tickets. Por favor, intente nuevamente.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Load bancas and tickets on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Load betting pools first
      const mappedPools = await loadBancas();

      // Auto-select the first banca and load tickets
      if (mappedPools.length > 0) {
        const firstPool = mappedPools[0];
        setBanca(firstPool);
        await loadTickets(firstPool.id);
      }
      setInitialLoad(false);
    };

    initializeData();

    // TODO: Load these from API when endpoints are available
    setLoterias([
      { id: 1, name: 'Nacional 12PM' },
      { id: 2, name: 'Nacional 3PM' },
      { id: 3, name: 'NY 10:30AM' },
      { id: 4, name: 'Florida 1:30PM' }
    ]);

    setTiposJugada([
      { id: 1, name: 'Directo' },
      { id: 2, name: 'Palé' },
      { id: 3, name: 'Tripleta' },
      { id: 4, name: 'Pick Two' }
    ]);

    setZonas([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' }
    ]);
  }, []);

  const filteredTickets = useMemo(() => {
    let data = [...tickets];
    if (filtroEstado !== 'todos') {
      const estadoMap = { ganadores: 'Ganador', pendientes: 'Pendiente', perdedores: 'Perdedor', cancelados: 'Cancelado' };
      data = data.filter(t => t.estado === estadoMap[filtroEstado]);
    }
    if (filtroRapido) {
      const term = filtroRapido.toLowerCase();
      data = data.filter(t => t.numero.toLowerCase().includes(term) || t.usuario.toLowerCase().includes(term));
    }
    return data;
  }, [tickets, filtroEstado, filtroRapido]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            Monitor de tickets
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)}
                InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={bancas}
                getOptionLabel={(o) => o.name ? `${o.name} (${o.code || ''})` : ''}
                value={banca}
                onChange={(e, v) => setBanca(v)}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                renderInput={(params) => <TextField {...params} label="Banca" size="small" />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete options={loterias} getOptionLabel={(o) => o.name || ''} value={loteria}
                onChange={(e, v) => setLoteria(v)} renderInput={(params) => <TextField {...params} label="Lotería" size="small" />} />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Autocomplete options={tiposJugada} getOptionLabel={(o) => o.name || ''} value={tipoJugada}
                onChange={(e, v) => setTipoJugada(v)} renderInput={(params) => <TextField {...params} label="Tipo de jugada" size="small" />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel control={<Switch checked={pendientesPago} onChange={(e) => setPendientesPago(e.target.checked)} />}
                label={<Typography variant="caption">Pendientes de pago</Typography>} />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel control={<Switch checked={soloGanadores} onChange={(e) => setSoloGanadores(e.target.checked)} />}
                label={<Typography variant="caption">Sólo tickets ganadores</Typography>} />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Autocomplete options={zonas} getOptionLabel={(o) => o.name || ''} value={zona}
                onChange={(e, v) => setZona(v)} renderInput={(params) => <TextField {...params} label="Zonas" size="small" />} />
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button
              variant="contained"
              onClick={() => loadTickets()}
              disabled={loading || initialLoad}
              sx={{
                px: 6,
                py: 1,
                borderRadius: '30px',
                textTransform: 'uppercase',
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' }
              }}
            >
              {loading ? 'Cargando...' : 'Filtrar'}
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Filtrar</Typography>
            <ToggleButtonGroup exclusive value={filtroEstado} onChange={(e, v) => v && setFiltroEstado(v)} size="small">
              <ToggleButton value="todos">TODOS ({counts.todos})</ToggleButton>
              <ToggleButton value="ganadores">GANADORES ({counts.ganadores})</ToggleButton>
              <ToggleButton value="pendientes">PENDIENTES ({counts.pendientes})</ToggleButton>
              <ToggleButton value="perdedores">PERDEDORES ({counts.perdedores})</ToggleButton>
              <ToggleButton value="cancelados">CANCELADO ({counts.cancelados})</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#1976d2' }}>Monto total: {formatCurrency(totals.montoTotal)}</Typography>
            <Typography variant="h6" sx={{ color: '#1976d2' }}>Total de premios: {formatCurrency(totals.totalPremios)}</Typography>
            <Typography variant="h6" sx={{ color: '#1976d2' }}>Total pendiente de pago: {formatCurrency(totals.totalPendiente)}</Typography>
          </Paper>

          <TextField fullWidth placeholder="Filtro rapido" value={filtroRapido} onChange={(e) => setFiltroRapido(e.target.value)}
            size="small" sx={{ mb: 2, maxWidth: 300 }} />

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {['Número', 'Fecha', 'Usuario', 'Monto', 'Premio', 'Fecha de cancelación', 'Estado', 'Acciones'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                      Cargando tickets...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>Mostrando 0 entradas</TableCell></TableRow>
              ) : filteredTickets.map((t, i) => (
                <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{t.numero}</TableCell><TableCell>{t.fecha}</TableCell><TableCell>{t.usuario}</TableCell>
                  <TableCell>{formatCurrency(t.monto)}</TableCell><TableCell>{formatCurrency(t.premio)}</TableCell>
                  <TableCell>{t.fechaCancelacion || '-'}</TableCell>
                  <TableCell sx={{ color: t.estado === 'Ganador' ? 'success.main' : t.estado === 'Cancelado' ? 'error.main' : 'inherit' }}>{t.estado}</TableCell>
                  <TableCell><IconButton size="small" color="primary"><Visibility /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default TicketMonitoring;
