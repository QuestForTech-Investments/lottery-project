import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Switch, FormControlLabel,
  Button, ToggleButtonGroup, ToggleButton, Table, TableHead, TableBody, TableRow, TableCell, IconButton
} from '@mui/material';
import { Visibility } from '@mui/icons-material';

const ExternalAgentsMonitoring = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [agente, setAgente] = useState(null);
  const [loteria, setLoteria] = useState(null);
  const [tipoJugada, setTipoJugada] = useState(null);
  const [numero, setNumero] = useState('');
  const [soloGanadores, setSoloGanadores] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroRapido, setFiltroRapido] = useState('');
  const [tickets, setTickets] = useState([]);
  const [agentesList, setAgentesList] = useState([]);
  const [loteriasList, setLoteriasList] = useState([]);
  const [tiposJugadaList, setTiposJugadaList] = useState([]);
  const [totals, setTotals] = useState({ montoTotal: 0, totalPremios: 0 });
  const [counts, setCounts] = useState({ todos: 0, ganadores: 0, pendientes: 0, perdedores: 0, cancelados: 0 });

  const generateMockTickets = () => {
    const estados = ['Ganador', 'Pendiente', 'Perdedor', 'Cancelado'];
    const usuarios = ['agente_ext1', 'agente_ext2', 'agente_ext3', 'socio1', 'distribuidor1'];
    const mockTickets = [];

    for (let i = 1; i <= 20; i++) {
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const monto = Math.floor(Math.random() * 300) + 20;
      const premio = estado === 'Ganador' ? Math.floor(Math.random() * 3000) + 200 : 0;

      mockTickets.push({
        numero: `EXT-${String(20000 + i).padStart(6, '0')}`,
        fecha: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString(),
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        monto,
        premio,
        fechaCancelacion: estado === 'Cancelado' ? new Date(Date.now() - Math.random() * 86400000).toLocaleDateString() : null,
        estado
      });
    }
    return mockTickets;
  };

  useEffect(() => {
    const mockData = generateMockTickets();
    setTickets(mockData);

    const ganadores = mockData.filter(t => t.estado === 'Ganador').length;
    const pendientes = mockData.filter(t => t.estado === 'Pendiente').length;
    const perdedores = mockData.filter(t => t.estado === 'Perdedor').length;
    const cancelados = mockData.filter(t => t.estado === 'Cancelado').length;

    setCounts({ todos: mockData.length, ganadores, pendientes, perdedores, cancelados });
    setTotals({
      montoTotal: mockData.reduce((sum, t) => sum + t.monto, 0),
      totalPremios: mockData.reduce((sum, t) => sum + t.premio, 0)
    });

    setAgentesList([
      { id: 1, name: 'Agente Externo 1' },
      { id: 2, name: 'Agente Externo 2' },
      { id: 3, name: 'Socio Principal' }
    ]);

    setLoteriasList([
      { id: 1, name: 'Nacional 12PM' },
      { id: 2, name: 'NY 10:30AM' },
      { id: 3, name: 'Florida 1:30PM' }
    ]);

    setTiposJugadaList([
      { id: 1, name: 'Directo' },
      { id: 2, name: 'Palé' },
      { id: 3, name: 'Tripleta' }
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
            Monitoreo de tickets de agentes externos
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)}
                InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete options={agentesList} getOptionLabel={(o) => o.name || ''} value={agente}
                onChange={(e, v) => setAgente(v)} renderInput={(params) => <TextField {...params} label="Agente" size="small" />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete options={loteriasList} getOptionLabel={(o) => o.name || ''} value={loteria}
                onChange={(e, v) => setLoteria(v)} renderInput={(params) => <TextField {...params} label="Lotería" size="small" />} />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Autocomplete options={tiposJugadaList} getOptionLabel={(o) => o.name || ''} value={tipoJugada}
                onChange={(e, v) => setTipoJugada(v)} renderInput={(params) => <TextField {...params} label="Tipo de jugada" size="small" />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={<Switch checked={soloGanadores} onChange={(e) => setSoloGanadores(e.target.checked)} />}
                label={<Typography variant="caption">Sólo tickets ganadores</Typography>} />
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button variant="contained" sx={{ px: 6, py: 1, borderRadius: '30px', textTransform: 'uppercase' }}>Filtrar</Button>
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
          </Paper>

          <TextField fullWidth placeholder="Filtrado rápido" value={filtroRapido} onChange={(e) => setFiltroRapido(e.target.value)}
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
              {filteredTickets.length === 0 ? (
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
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mostrando {filteredTickets.length} de {tickets.length} entradas</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExternalAgentsMonitoring;
