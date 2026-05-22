import React, { useState, useEffect, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Switch, FormControlLabel,
  Button, ToggleButtonGroup, ToggleButton, Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, IconButton
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { getTodayDate } from '@/utils/formatters';
import { useTableSort } from '@/utils/useTableSort';

interface Agente {
  id: number;
  name: string;
}

interface Loteria {
  id: number;
  name: string;
}

interface TipoJugada {
  id: number;
  name: string;
}

interface Ticket {
  numero: string;
  fecha: string;
  usuario: string;
  monto: number;
  premio: number;
  fechaCancelacion: string | null;
  estado: string;
}

interface Totals {
  montoTotal: number;
  totalPremios: number;
}

interface Counts {
  todos: number;
  ganadores: number;
  pendientes: number;
  perdedores: number;
  cancelados: number;
}

type FiltroEstado = 'todos' | 'ganadores' | 'pendientes' | 'perdedores' | 'cancelados';

const ExternalAgentsMonitoring: React.FC = () => {
  const { t } = useTranslation();
  const [fecha, setFecha] = useState<string>(getTodayDate());
  const [agente, setAgente] = useState<Agente | null>(null);
  const [loteria, setLoteria] = useState<Loteria | null>(null);
  const [tipoJugada, setTipoJugada] = useState<TipoJugada | null>(null);
  const [numero, setNumero] = useState<string>('');
  const [soloGanadores, setSoloGanadores] = useState<boolean>(false);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agentesList, setAgentesList] = useState<Agente[]>([]);
  const [loteriasList, setLoteriasList] = useState<Loteria[]>([]);
  const [tiposJugadaList, setTiposJugadaList] = useState<TipoJugada[]>([]);
  const [totals, setTotals] = useState<Totals>({ montoTotal: 0, totalPremios: 0 });
  const [counts, setCounts] = useState<Counts>({ todos: 0, ganadores: 0, pendientes: 0, perdedores: 0, cancelados: 0 });

  const generateMockTickets = (): Ticket[] => {
    const estados = ['Ganador', 'Pendiente', 'Perdedor', 'Cancelado'];
    const usuarios = ['agente_ext1', 'agente_ext2', 'agente_ext3', 'socio1', 'distribuidor1'];
    const mockTickets: Ticket[] = [];

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

  const filteredTickets = useMemo((): Ticket[] => {
    let data = [...tickets];
    if (filtroEstado !== 'todos') {
      const estadoMap: Record<string, string> = { ganadores: 'Ganador', pendientes: 'Pendiente', perdedores: 'Perdedor', cancelados: 'Cancelado' };
      data = data.filter(t => t.estado === estadoMap[filtroEstado]);
    }
    if (filtroRapido) {
      const term = filtroRapido.toLowerCase();
      data = data.filter(t => t.numero.toLowerCase().includes(term) || t.usuario.toLowerCase().includes(term));
    }
    return data;
  }, [tickets, filtroEstado, filtroRapido]);

  const { sortedData: sortedTickets, getSortProps } = useTableSort<Ticket, string>(
    filteredTickets,
    (row, key) => (row as unknown as Record<string, string | number>)[key],
    { sortBy: 'fecha', sortOrder: 'desc' },
  );

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            {t('tickets.externalAgents.title')}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="date" label={t('common.date')} value={fecha} onChange={(e) => setFecha(e.target.value)}
                InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete options={agentesList} getOptionLabel={(o) => o.name || ''} value={agente}
                onChange={(e, v) => setAgente(v)} renderInput={(params) => <TextField {...params} label={t('tickets.externalAgents.agent')} size="small" />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete options={loteriasList} getOptionLabel={(o) => o.name || ''} value={loteria}
                onChange={(e, v) => setLoteria(v)} renderInput={(params) => <TextField {...params} label={t('tickets.externalAgents.lottery')} size="small" />} />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Autocomplete options={tiposJugadaList} getOptionLabel={(o) => o.name || ''} value={tipoJugada}
                onChange={(e, v) => setTipoJugada(v)} renderInput={(params) => <TextField {...params} label={t('tickets.plays.playType')} size="small" />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label={t('common.number')} value={numero} onChange={(e) => setNumero(e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={<Switch checked={soloGanadores} onChange={(e) => setSoloGanadores(e.target.checked)} />}
                label={<Typography variant="caption">{t('tickets.externalAgents.onlyWinners')}</Typography>} />
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button variant="contained" sx={{ px: 6, py: 1, borderRadius: '30px', textTransform: 'uppercase' }}>{t('common.filter')}</Button>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500 }}>{t('common.filter')}</Typography>
            <ToggleButtonGroup exclusive value={filtroEstado} onChange={(e, v) => v && setFiltroEstado(v)} size="small">
              <ToggleButton value="todos">{t('common.all')} ({counts.todos})</ToggleButton>
              <ToggleButton value="ganadores">{t('ticketStatus.winner')} ({counts.ganadores})</ToggleButton>
              <ToggleButton value="pendientes">{t('ticketStatus.pending')} ({counts.pendientes})</ToggleButton>
              <ToggleButton value="perdedores">{t('ticketStatus.loser')} ({counts.perdedores})</ToggleButton>
              <ToggleButton value="cancelados">{t('ticketStatus.cancelled')} ({counts.cancelados})</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#1976d2' }}>{t('tickets.monitoring.totalAmount')}: {formatCurrency(totals.montoTotal)}</Typography>
            <Typography variant="h6" sx={{ color: '#1976d2' }}>{t('tickets.detail.totalPrizes')}: {formatCurrency(totals.totalPremios)}</Typography>
          </Paper>

          <TextField fullWidth placeholder={t('common.filterQuick')} value={filtroRapido} onChange={(e) => setFiltroRapido(e.target.value)}
            size="small" sx={{ mb: 2, maxWidth: 300 }} />

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {([
                  { key: 'numero', label: t('common.number') },
                  { key: 'fecha', label: t('common.date') },
                  { key: 'usuario', label: t('common.user') },
                  { key: 'monto', label: t('common.amount') },
                  { key: 'premio', label: t('common.prize') },
                  { key: 'fechaCancelacion', label: t('tickets.anomalies.cancellationDate') },
                  { key: 'estado', label: t('common.status') },
                ] as const).map((col) => (
                  <TableCell key={col.key} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                    <TableSortLabel {...getSortProps(col.key)}>{col.label}</TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTickets.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>{t('common.showingEntries', { shown: 0, total: 0 })}</TableCell></TableRow>
              ) : sortedTickets.map((row, i) => (
                <TableRow key={i} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{row.numero}</TableCell><TableCell>{row.fecha}</TableCell><TableCell>{row.usuario}</TableCell>
                  <TableCell>{formatCurrency(row.monto)}</TableCell><TableCell>{formatCurrency(row.premio)}</TableCell>
                  <TableCell>{row.fechaCancelacion || '-'}</TableCell>
                  <TableCell sx={{ color: row.estado === 'Ganador' ? 'success.main' : row.estado === 'Cancelado' ? 'error.main' : 'inherit' }}>
                    {row.estado === 'Ganador' ? t('ticketStatus.winner') :
                     row.estado === 'Cancelado' ? t('ticketStatus.cancelled') :
                     row.estado === 'Pendiente' ? t('ticketStatus.pending') :
                     row.estado === 'Perdedor' ? t('ticketStatus.loser') : row.estado}
                  </TableCell>
                  <TableCell><IconButton size="small" color="primary"><Visibility /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('common.showingEntries', { shown: filteredTickets.length, total: tickets.length })}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(ExternalAgentsMonitoring);
