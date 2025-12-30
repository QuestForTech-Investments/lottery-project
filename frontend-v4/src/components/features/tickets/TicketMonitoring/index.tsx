import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
  type ChangeEvent,
  type FC,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Autocomplete,
  Switch,
  FormControlLabel,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon, Cancel as CancelIcon, Send as SendIcon } from '@mui/icons-material';
import api from '../../../../services/api';
import ticketService, {
  type MappedTicket,
  type TicketCounts,
  type TicketTotals,
  mapTicketResponse,
  calculateTicketCounts,
  calculateTicketTotals,
} from '../../../../services/ticketService';
import { getAllLotteries } from '../../../../services/lotteryService';

// ============================================================================
// Types
// ============================================================================

interface BettingPool {
  id: number;
  name: string;
  code: string;
}

interface SelectOption {
  id: number;
  name: string;
}

interface BettingPoolApiResponse {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
}

interface Lottery {
  id: number;
  name: string;
}

interface TicketRowProps {
  ticket: MappedTicket;
  onRowClick: (id: number) => void;
  onPrint: (id: number) => void;
  onSend: (id: number) => void;
  onCancel: (id: number) => void;
}

type FilterEstado = 'todos' | 'ganadores' | 'pendientes' | 'perdedores' | 'cancelados';

// ============================================================================
// Constants
// ============================================================================

const ESTADO_MAP: Record<Exclude<FilterEstado, 'todos'>, MappedTicket['estado']> = {
  ganadores: 'Ganador',
  pendientes: 'Pendiente',
  perdedores: 'Pagado',
  cancelados: 'Cancelado',
};

const INITIAL_COUNTS: TicketCounts = {
  todos: 0,
  ganadores: 0,
  pendientes: 0,
  perdedores: 0,
  cancelados: 0,
};

const INITIAL_TOTALS: TicketTotals = {
  montoTotal: 0,
  totalPremios: 0,
  totalPendiente: 0,
};

const DEBOUNCE_DELAY = 300;

// Note: LOTERIAS are now loaded dynamically from API

const TIPOS_JUGADA: SelectOption[] = [
  { id: 1, name: 'Directo' },
  { id: 2, name: 'Pale' },
  { id: 3, name: 'Tripleta' },
  { id: 4, name: 'Pick Two' },
];

const ZONAS: SelectOption[] = [
  { id: 1, name: 'Zona Norte' },
  { id: 2, name: 'Zona Sur' },
  { id: 3, name: 'Zona Este' },
  { id: 4, name: 'Zona Oeste' },
];

const TABLE_HEADERS = [
  'Número',
  'Fecha',
  'Usuario',
  'Monto',
  'Premio',
  'Fecha de cancelación',
  'Estado',
  'Acciones',
] as const;

// Extracted styles as constants to prevent re-creation on each render
const STYLES = {
  container: { p: 2 },
  content: { p: 3 },
  title: { color: '#1976d2', mb: 4, fontWeight: 400 },
  alertMargin: { mb: 3 },
  filterButton: {
    px: 6,
    py: 1,
    borderRadius: '30px',
    textTransform: 'uppercase' as const,
    bgcolor: '#51cbce',
    '&:hover': { bgcolor: '#45b8bb' },
  },
  totalsContainer: { display: 'flex', justifyContent: 'center', mb: 3 },
  totalsPanel: { px: 4, py: 2, backgroundColor: '#f5f5f5', textAlign: 'center' as const, width: 'fit-content' },
  totalsText: { color: '#1976d2' },
  quickSearch: { mb: 2, maxWidth: 300 },
  tableHeader: { backgroundColor: '#f5f5f5' },
  tableHeaderCell: { fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' },
  loadingCell: { py: 5 },
  emptyCell: { py: 3, color: 'text.secondary' },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function getEstadoColor(estado: MappedTicket['estado']): string {
  switch (estado) {
    case 'Ganador':
      return 'success.main';
    case 'Cancelado':
      return 'error.main';
    default:
      return 'inherit';
  }
}

// ============================================================================
// Memoized Sub-Components
// ============================================================================

const TicketRow: FC<TicketRowProps> = memo(({ ticket, onRowClick, onPrint, onSend, onCancel }) => {
  const handleRowClick = useCallback(() => {
    onRowClick(ticket.id);
  }, [ticket.id, onRowClick]);

  const handlePrintClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    onPrint(ticket.id);
  }, [ticket.id, onPrint]);

  const handleSendClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    onSend(ticket.id);
  }, [ticket.id, onSend]);

  const handleCancelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    onCancel(ticket.id);
  }, [ticket.id, onCancel]);

  return (
    <TableRow
      sx={{ '&:hover': { backgroundColor: 'action.hover' }, cursor: 'pointer' }}
      onClick={handleRowClick}
    >
      <TableCell>{ticket.numero}</TableCell>
      <TableCell>{ticket.fecha}</TableCell>
      <TableCell>{ticket.usuario}</TableCell>
      <TableCell>{formatCurrency(ticket.monto)}</TableCell>
      <TableCell>{formatCurrency(ticket.premio)}</TableCell>
      <TableCell>{ticket.fechaCancelacion || '-'}</TableCell>
      <TableCell sx={{ color: getEstadoColor(ticket.estado) }}>
        {ticket.estado}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <IconButton size="small" color="primary" onClick={handlePrintClick} title="Imprimir ticket">
            <PrintIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info" onClick={handleSendClick} title="Enviar ticket">
            <SendIcon fontSize="small" />
          </IconButton>
          {ticket.estado !== 'Cancelado' && (
            <IconButton size="small" color="error" onClick={handleCancelClick} title="Cancelar ticket">
              <CancelIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
});

TicketRow.displayName = 'TicketRow';

// ============================================================================
// Ticket Detail Panel Component
// ============================================================================

interface TicketDetailPanelProps {
  ticket: MappedTicket;
  onClose: () => void;
}

const TicketDetailPanel: FC<TicketDetailPanelProps> = memo(({ ticket, onClose }) => {
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        bgcolor: '#51cbce',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          Ticket #{ticket.numero}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
        {/* Status Chip */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Chip
            label={ticket.estado}
            color={
              ticket.estado === 'Ganador' ? 'success' :
              ticket.estado === 'Cancelado' ? 'error' :
              ticket.estado === 'Pendiente' ? 'warning' : 'default'
            }
            size="medium"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
        </Box>

        {/* Ticket Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Información del Ticket
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Número</Typography>
              <Typography variant="body1" fontWeight="bold">{ticket.numero}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Usuario</Typography>
              <Typography variant="body1" fontWeight="bold">{ticket.usuario}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Fecha</Typography>
              <Typography variant="body1">{ticket.fecha}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Monto</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                {formatCurrency(ticket.monto)}
              </Typography>
            </Grid>
            {ticket.premio > 0 && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Premio</Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  {formatCurrency(ticket.premio)}
                </Typography>
              </Grid>
            )}
            {ticket.fechaCancelacion && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Fecha Cancelación</Typography>
                <Typography variant="body1" color="error.main">{ticket.fechaCancelacion}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Ticket Lines (Plays) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Jugadas del Ticket
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {ticket.lines && ticket.lines.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Sorteo</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Número</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tipo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Monto</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Premio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ticket.lines.map((line, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>{line.drawName || '-'}</TableCell>
                    <TableCell fontWeight="bold">{line.betNumber}</TableCell>
                    <TableCell>{line.betTypeName || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(line.betAmount)}</TableCell>
                    <TableCell align="right" sx={{ color: line.prizeAmount > 0 ? 'success.main' : 'inherit' }}>
                      {formatCurrency(line.prizeAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No hay jugadas disponibles
            </Typography>
          )}
        </Box>
      </Box>

      {/* Actions Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PrintIcon />}
          onClick={() => console.log('Print ticket:', ticket.id)}
        >
          Imprimir
        </Button>
        {ticket.estado !== 'Cancelado' && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CancelIcon />}
            onClick={() => console.log('Cancel ticket:', ticket.id)}
          >
            Cancelar
          </Button>
        )}
      </Box>
    </Paper>
  );
});

TicketDetailPanel.displayName = 'TicketDetailPanel';

// ============================================================================
// Custom Hooks
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Main Component
// ============================================================================

const TicketMonitoring: FC = () => {
  // URL params for deep linking (e.g., from DailySales code click)
  const [searchParams] = useSearchParams();
  const urlBettingPoolId = searchParams.get('bettingPoolId');
  const urlDate = searchParams.get('date');

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filter states - use URL params if available
  const [fecha, setFecha] = useState<string>(
    () => urlDate || new Date().toISOString().split('T')[0]
  );
  const [banca, setBanca] = useState<BettingPool | null>(null);
  const [bancas, setBancas] = useState<BettingPool[]>([]);
  const [loteria, setLoteria] = useState<Lottery | null>(null);
  const [loterias, setLoterias] = useState<Lottery[]>([]);
  const [tipoJugada, setTipoJugada] = useState<SelectOption | null>(null);
  const [numero, setNumero] = useState<string>('');
  const [pendientesPago, setPendientesPago] = useState<boolean>(false);
  const [soloGanadores, setSoloGanadores] = useState<boolean>(false);
  const [zona, setZona] = useState<SelectOption | null>(null);

  // Data states
  const [tickets, setTickets] = useState<MappedTicket[]>([]);
  const [totals, setTotals] = useState<TicketTotals>(INITIAL_TOTALS);
  const [counts, setCounts] = useState<TicketCounts>(INITIAL_COUNTS);

  // UI filter states
  const [filtroEstado, setFiltroEstado] = useState<FilterEstado>('todos');
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const debouncedFiltroRapido = useDebounce(filtroRapido, DEBOUNCE_DELAY);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Selected ticket for detail panel (split-screen view)
  const [selectedTicket, setSelectedTicket] = useState<MappedTicket | null>(null);

  // Load betting pools from API
  const loadBancas = useCallback(async (signal?: AbortSignal): Promise<BettingPool[]> => {
    try {
      const response = await api.get<{ items?: BettingPoolApiResponse[] } | BettingPoolApiResponse[]>(
        '/betting-pools'
      );

      if (signal?.aborted) return [];

      const pools = Array.isArray(response)
        ? response
        : (response?.items || []);

      const mappedPools: BettingPool[] = pools.map((p) => ({
        id: p.bettingPoolId,
        name: p.bettingPoolName,
        code: p.bettingPoolCode,
      }));

      setBancas(mappedPools);
      return mappedPools;
    } catch (err) {
      if (signal?.aborted) return [];
      console.error('Error loading betting pools:', err);
      return [];
    }
  }, []);

  // Load lotteries from API (for timezone-aware filtering)
  const loadLoterias = useCallback(async (signal?: AbortSignal): Promise<Lottery[]> => {
    try {
      const response = await getAllLotteries({ loadAll: true });

      if (signal?.aborted) return [];

      // Handle both response formats
      const lotteriesData = 'data' in response ? response.data : (response as { items?: { lotteryId: number; lotteryName: string }[] }).items || [];

      const mappedLotteries: Lottery[] = lotteriesData.map((l) => ({
        id: l.lotteryId,
        name: l.lotteryName,
      }));

      setLoterias(mappedLotteries);
      return mappedLotteries;
    } catch (err) {
      if (signal?.aborted) return [];
      console.error('Error loading lotteries:', err);
      return [];
    }
  }, []);

  // Load tickets from API
  const loadTickets = useCallback(
    async (selectedBancaId: number | null = null, signal?: AbortSignal, selectedFecha?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      const bettingPoolId = selectedBancaId ?? banca?.id ?? null;
      const fechaToUse = selectedFecha ?? fecha;

      // Validate at least one filter is selected
      if (!bettingPoolId && !loteria && !zona && !numero) {
        setError('Seleccione al menos una banca, lotería, zona o número para filtrar.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await ticketService.filterTickets({
          date: fechaToUse,  // API expects 'date', not 'startDate/endDate'
          bettingPoolId: bettingPoolId ?? undefined,
          lotteryId: loteria?.id,  // Pass lotteryId for timezone-aware filtering
          pageNumber: 1,  // API expects 'pageNumber', not 'page'
          pageSize: 100,
        });

        if (signal?.aborted) return;

        const mappedTickets = (response.tickets || []).map(mapTicketResponse);

        setTickets(mappedTickets);
        setCounts(calculateTicketCounts(mappedTickets));
        setTotals(calculateTicketTotals(mappedTickets));
      } catch (err) {
        if (signal?.aborted) return;
        console.error('Error loading tickets:', err);
        setError('Error al cargar los tickets. Por favor, intente nuevamente.');
        setTickets([]);
        setCounts(INITIAL_COUNTS);
        setTotals(INITIAL_TOTALS);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [banca?.id, fecha, loteria, zona, numero]
  );

  // Initialize data on mount with cleanup - runs only once
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const initializeData = async () => {
      // Load bancas and loterias in parallel
      const [mappedPools] = await Promise.all([
        loadBancas(controller.signal),
        loadLoterias(controller.signal),
      ]);

      if (controller.signal.aborted) return;

      if (mappedPools.length > 0) {
        // Check if bettingPoolId was passed via URL params
        const targetPoolId = urlBettingPoolId ? parseInt(urlBettingPoolId, 10) : null;
        const targetPool = targetPoolId
          ? mappedPools.find(p => p.id === targetPoolId)
          : mappedPools[0];

        if (targetPool) {
          setBanca(targetPool);
          // Use URL date if provided, otherwise use current fecha state
          const dateToUse = urlDate || fecha;
          await loadTickets(targetPool.id, controller.signal, dateToUse);
        }
      }

      if (!controller.signal.aborted) {
        setIsInitialLoad(false);
      }
    };

    initializeData();

    return () => {
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  // Filter tickets based on estado and search (using debounced value)
  const filteredTickets = useMemo<MappedTicket[]>(() => {
    let data = tickets;

    // Filter by estado
    if (filtroEstado !== 'todos') {
      const targetEstado = ESTADO_MAP[filtroEstado];
      data = data.filter((t) => t.estado === targetEstado);
    }

    // Filter by quick search (debounced)
    if (debouncedFiltroRapido) {
      const term = debouncedFiltroRapido.toLowerCase();
      data = data.filter(
        (t) =>
          t.numero.toLowerCase().includes(term) ||
          t.usuario.toLowerCase().includes(term)
      );
    }

    return data;
  }, [tickets, filtroEstado, debouncedFiltroRapido]);

  // Event handlers
  const handleFilterClick = useCallback(() => {
    loadTickets(null, undefined, fecha);
  }, [loadTickets, fecha]);

  const handleFiltroEstadoChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, value: FilterEstado | null) => {
      if (value) {
        setFiltroEstado(value);
      }
    },
    []
  );

  const handleBancaChange = useCallback(
    (_: React.SyntheticEvent, value: BettingPool | null) => {
      setBanca(value);
    },
    []
  );

  const handleLoteriaChange = useCallback(
    (_: React.SyntheticEvent, value: Lottery | null) => {
      setLoteria(value);
    },
    []
  );

  const handleTipoJugadaChange = useCallback(
    (_: React.SyntheticEvent, value: SelectOption | null) => {
      setTipoJugada(value);
    },
    []
  );

  const handleZonaChange = useCallback(
    (_: React.SyntheticEvent, value: SelectOption | null) => {
      setZona(value);
    },
    []
  );

  const handleFechaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFecha(e.target.value);
  }, []);

  const handleNumeroChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNumero(e.target.value);
  }, []);

  const handleFiltroRapidoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFiltroRapido(e.target.value);
  }, []);

  const handlePendientesPagoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPendientesPago(e.target.checked);
  }, []);

  const handleSoloGanadoresChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSoloGanadores(e.target.checked);
  }, []);

  const handleErrorClose = useCallback(() => {
    setError(null);
  }, []);

  const handleRowClick = useCallback((ticketId: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
    }
  }, [tickets]);

  const handleCloseDetail = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  const handlePrintTicket = useCallback((ticketId: number) => {
    // TODO: Implement print ticket functionality
    console.log('Print ticket:', ticketId);
    // Could open a print dialog or generate a PDF
  }, []);

  const handleSendTicket = useCallback((ticketId: number) => {
    // TODO: Implement send ticket functionality
    console.log('Send ticket:', ticketId);
    // Could open a dialog to enter email/phone or send via WhatsApp
  }, []);

  const handleCancelTicket = useCallback(async (ticketId: number) => {
    // Confirm before canceling
    if (!window.confirm('¿Está seguro de que desea cancelar este ticket?')) {
      return;
    }

    try {
      await ticketService.cancelTicket(ticketId);
      // Refresh tickets after cancellation
      await loadTickets(null, undefined, fecha);
      // Clear selected ticket if it was the one canceled
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error('Error canceling ticket:', err);
      setError('Error al cancelar el ticket. Por favor, intente nuevamente.');
    }
  }, [loadTickets, fecha, selectedTicket?.id]);

  // Render helpers
  const renderTableContent = useMemo(() => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center" sx={STYLES.loadingCell}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Cargando tickets...
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredTickets.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center" sx={STYLES.emptyCell}>
            Mostrando 0 entradas
          </TableCell>
        </TableRow>
      );
    }

    return filteredTickets.map((ticket) => (
      <TicketRow
        key={ticket.id}
        ticket={ticket}
        onRowClick={handleRowClick}
        onPrint={handlePrintTicket}
        onSend={handleSendTicket}
        onCancel={handleCancelTicket}
      />
    ));
  }, [isLoading, filteredTickets, handleRowClick, handlePrintTicket, handleSendTicket, handleCancelTicket]);

  return (
    <Box sx={STYLES.container}>
      {/* Split-screen layout: table on left, detail on right when a ticket is selected */}
      <Grid container spacing={2}>
        {/* Left Panel - Filters and Table */}
        <Grid item xs={12} md={selectedTicket ? 6 : 12}>
          <Paper elevation={3}>
            <Box sx={STYLES.content}>
              <Typography variant="h5" align="center" sx={STYLES.title}>
                Monitor de tickets
              </Typography>

              {error && (
                <Alert severity="error" sx={STYLES.alertMargin} onClose={handleErrorClose}>
                  {error}
                </Alert>
              )}

              {/* Filters Section - Compact when detail is shown */}
              <Grid container spacing={selectedTicket ? 1 : 2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={selectedTicket ? 6 : 3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha"
                    value={fecha}
                    onChange={handleFechaChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={selectedTicket ? 6 : 3}>
                  <Autocomplete
                    options={bancas}
                    getOptionLabel={(o) => (o.name ? `${o.name} (${o.code || ''})` : '')}
                    value={banca}
                    onChange={handleBancaChange}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Banca" size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={selectedTicket ? 6 : 3}>
                  <Autocomplete
                    options={loterias}
                    getOptionLabel={(o) => o.name || ''}
                    value={loteria}
                    onChange={handleLoteriaChange}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Lotería" size="small" />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Second row of filters - hidden when detail is shown for compact view */}
              {!selectedTicket && (
                <>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={3}>
                      <Autocomplete
                        options={TIPOS_JUGADA}
                        getOptionLabel={(o) => o.name || ''}
                        value={tipoJugada}
                        onChange={handleTipoJugadaChange}
                        renderInput={(params) => (
                          <TextField {...params} label="Tipo de jugada" size="small" />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Número"
                        value={numero}
                        onChange={handleNumeroChange}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pendientesPago}
                            onChange={handlePendientesPagoChange}
                          />
                        }
                        label={<Typography variant="caption">Pendientes de pago</Typography>}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={soloGanadores}
                            onChange={handleSoloGanadoresChange}
                          />
                        }
                        label={
                          <Typography variant="caption">Sólo tickets ganadores</Typography>
                        }
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                    <Grid item xs={12} md={3}>
                      <Autocomplete
                        options={ZONAS}
                        getOptionLabel={(o) => o.name || ''}
                        value={zona}
                        onChange={handleZonaChange}
                        renderInput={(params) => (
                          <TextField {...params} label="Zonas" size="small" />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        variant="contained"
                        onClick={handleFilterClick}
                        disabled={isLoading || isInitialLoad}
                        sx={STYLES.filterButton}
                      >
                        {isLoading ? 'Cargando...' : 'Filtrar'}
                      </Button>
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Filter Button - Only shown when selectedTicket is active (compact view) */}
              {selectedTicket && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleFilterClick}
                    disabled={isLoading || isInitialLoad}
                    sx={STYLES.filterButton}
                  >
                    {isLoading ? 'Cargando...' : 'Filtrar'}
                  </Button>
                </Box>
              )}

              {/* Status Toggle Buttons */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', mb: 1, display: 'block' }}
                >
                  Filtrar
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={filtroEstado}
                  onChange={handleFiltroEstadoChange}
                  size="small"
                  sx={{ flexWrap: 'wrap' }}
                >
                  <ToggleButton value="todos">TODOS ({counts.todos})</ToggleButton>
                  <ToggleButton value="ganadores">GANADORES ({counts.ganadores})</ToggleButton>
                  <ToggleButton value="pendientes">PENDIENTES ({counts.pendientes})</ToggleButton>
                  <ToggleButton value="perdedores">PERDEDORES ({counts.perdedores})</ToggleButton>
                  <ToggleButton value="cancelados">CANCELADO ({counts.cancelados})</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Totals Panel */}
              <Box sx={STYLES.totalsContainer}>
                <Paper sx={STYLES.totalsPanel} elevation={0}>
                  <Typography variant={selectedTicket ? 'body1' : 'h6'} sx={STYLES.totalsText}>
                    Monto total: {formatCurrency(totals.montoTotal)}
                  </Typography>
                  <Typography variant={selectedTicket ? 'body1' : 'h6'} sx={STYLES.totalsText}>
                    Total de premios: {formatCurrency(totals.totalPremios)}
                  </Typography>
                  <Typography variant={selectedTicket ? 'body1' : 'h6'} sx={STYLES.totalsText}>
                    Total pendiente de pago: {formatCurrency(totals.totalPendiente)}
                  </Typography>
                </Paper>
              </Box>

              {/* Quick Search */}
              <TextField
                fullWidth
                placeholder="Filtro rapido"
                value={filtroRapido}
                onChange={handleFiltroRapidoChange}
                size="small"
                sx={STYLES.quickSearch}
              />

              {/* Tickets Table */}
              <Box sx={{ maxHeight: selectedTicket ? 400 : 'none', overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={STYLES.tableHeader}>
                      {TABLE_HEADERS.map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            ...STYLES.tableHeaderCell,
                            ...(h === 'Acciones' && { textAlign: 'center' })
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>{renderTableContent}</TableBody>
                </Table>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Ticket Detail (only shown when a ticket is selected) */}
        {selectedTicket && (
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'sticky', top: 16 }}>
              <TicketDetailPanel ticket={selectedTicket} onClose={handleCloseDetail} />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TicketMonitoring;
