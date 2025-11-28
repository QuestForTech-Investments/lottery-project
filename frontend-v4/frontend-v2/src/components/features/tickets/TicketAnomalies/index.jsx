import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, TextField, Table, TableHead, TableBody, TableRow, TableCell, IconButton } from '@mui/material';
import { Search } from '@mui/icons-material';

const TicketAnomalies = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [filtroTickets, setFiltroTickets] = useState('');
  const [filtroCambios, setFiltroCambios] = useState('');
  const [ticketsData, setTicketsData] = useState([]);
  const [cambiosData, setCambiosData] = useState([]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    // Mock anomalous tickets
    const mockTickets = [
      { numero: 'T-010001', fecha: '11/15/2025', usuario: 'vendedor1', monto: formatCurrency(5000), premio: formatCurrency(280000), fechaCancelacion: '-', estado: 'Ganador' },
      { numero: 'T-010002', fecha: '11/16/2025', usuario: 'cajero1', monto: formatCurrency(3500), premio: formatCurrency(0), fechaCancelacion: '11/16/2025', estado: 'Cancelado' },
      { numero: 'T-010003', fecha: '11/14/2025', usuario: 'vendedor2', monto: formatCurrency(10000), premio: formatCurrency(560000), fechaCancelacion: '-', estado: 'Ganador' },
      { numero: 'T-010004', fecha: '11/17/2025', usuario: 'admin', monto: formatCurrency(7500), premio: formatCurrency(0), fechaCancelacion: '11/17/2025', estado: 'Cancelado' },
      { numero: 'T-010005', fecha: '11/13/2025', usuario: 'supervisor', monto: formatCurrency(2000), premio: formatCurrency(112000), fechaCancelacion: '-', estado: 'Ganador' }
    ];
    setTicketsData(mockTickets);

    // Mock result changes
    const mockCambios = [
      { grupos: 'Grupo A', sorteo: 'Nacional 12PM', fecha: '11/16/2025', cambios: '45 → 46', usuario: 'admin', ultimaActualizacion: '11/16/2025 14:30' },
      { grupos: 'Grupo B', sorteo: 'NY 10:30AM', fecha: '11/15/2025', cambios: '23 → 25', usuario: 'supervisor', ultimaActualizacion: '11/15/2025 11:45' },
      { grupos: 'Grupo A', sorteo: 'Florida 1:30PM', fecha: '11/17/2025', cambios: '78 → 79', usuario: 'admin', ultimaActualizacion: '11/17/2025 16:20' },
      { grupos: 'Grupo C', sorteo: 'Nacional 3PM', fecha: '11/14/2025', cambios: '99 → 01', usuario: 'cajero1', ultimaActualizacion: '11/14/2025 18:00' }
    ];
    setCambiosData(mockCambios);
  }, []);

  const filteredTickets = useMemo(() => {
    if (!filtroTickets) return ticketsData;
    const term = filtroTickets.toLowerCase();
    return ticketsData.filter(t =>
      t.numero.toLowerCase().includes(term) ||
      t.usuario.toLowerCase().includes(term) ||
      t.estado.toLowerCase().includes(term)
    );
  }, [ticketsData, filtroTickets]);

  const filteredCambios = useMemo(() => {
    if (!filtroCambios) return cambiosData;
    const term = filtroCambios.toLowerCase();
    return cambiosData.filter(c =>
      c.sorteo.toLowerCase().includes(term) ||
      c.usuario.toLowerCase().includes(term) ||
      c.grupos.toLowerCase().includes(term)
    );
  }, [cambiosData, filtroCambios]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            Anomalías
          </Typography>

          <Box sx={{ mb: 4, maxWidth: 400 }}>
            <TextField fullWidth type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }} size="small" />
          </Box>

          {/* Tickets Section */}
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>Tickets</Typography>
          <Box sx={{ mb: 2, textAlign: 'right' }}>
            <TextField placeholder="Filtrado rápido" value={filtroTickets} onChange={(e) => setFiltroTickets(e.target.value)}
              size="small" sx={{ maxWidth: 300 }} />
            <IconButton disabled color="primary"><Search /></IconButton>
          </Box>
          <Table size="small" sx={{ mb: 1 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {['Número ▼', 'Fecha ▲', 'Usuario ▲', 'Monto', 'Premio', 'Fecha de cancelación ▲', 'Estado ▲'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', cursor: 'pointer' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>Mostrando 0 entradas</TableCell></TableRow>
              ) : filteredTickets.map((t, i) => (
                <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{t.numero}</TableCell><TableCell>{t.fecha}</TableCell><TableCell>{t.usuario}</TableCell>
                  <TableCell>{t.monto}</TableCell><TableCell>{t.premio}</TableCell><TableCell>{t.fechaCancelacion}</TableCell>
                  <TableCell sx={{ color: t.estado === 'Ganador' ? 'success.main' : t.estado === 'Cancelado' ? 'error.main' : 'inherit' }}>{t.estado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 4, display: 'block' }}>
            Mostrando {filteredTickets.length} de {ticketsData.length} entradas
          </Typography>

          {/* Cambios de resultados Section */}
          <Typography variant="h6" align="center" sx={{ mb: 2, mt: 4 }}>Cambios de resultados</Typography>
          <Box sx={{ mb: 2, textAlign: 'right' }}>
            <TextField placeholder="Filtrado rápido" value={filtroCambios} onChange={(e) => setFiltroCambios(e.target.value)}
              size="small" sx={{ maxWidth: 300 }} />
            <IconButton disabled color="primary"><Search /></IconButton>
          </Box>
          <Table size="small" sx={{ mb: 1 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {['Grupos ▲', 'Sorteo ▲', 'Fecha ▲', 'Cambios', 'Usuario ▲', 'Última actualización ▲'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', cursor: 'pointer' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCambios.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>Mostrando 0 entradas</TableCell></TableRow>
              ) : filteredCambios.map((c, i) => (
                <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{c.grupos}</TableCell><TableCell>{c.sorteo}</TableCell><TableCell>{c.fecha}</TableCell>
                  <TableCell sx={{ color: 'warning.main', fontWeight: 500 }}>{c.cambios}</TableCell>
                  <TableCell>{c.usuario}</TableCell><TableCell>{c.ultimaActualizacion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Mostrando {filteredCambios.length} de {cambiosData.length} entradas
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TicketAnomalies;
