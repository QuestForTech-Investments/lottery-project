/**
 * TicketMonitoring Component
 *
 * Main ticket monitoring view with filters, table, and detail panel.
 */

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
} from '@mui/material';

// Centralized imports
import api from '../../../../services/api';
import ticketService, {
  mapTicketResponse,
  calculateTicketCounts,
  calculateTicketTotals,
} from '../../../../services/ticketService';
import { getAllLotteries } from '../../../../services/lotteryService';
import { useDebounce } from '../../../../hooks';
import type { BettingPool, Lottery, SelectOption } from '../../../../types';
import {
  BET_TYPES,
  ZONES,
  TICKET_STATUS_MAP,
  DEBOUNCE_DELAY,
  TICKET_TABLE_HEADERS,
} from '../../../../constants';

// Local imports
import type { BettingPoolApiResponse, FilterEstado, MappedTicket, TicketCounts, TicketTotals } from './types';
import { INITIAL_COUNTS, INITIAL_TOTALS, STYLES } from './constants';
import { TicketRow, TicketDetailPanel, StatusToggle, TotalsPanel } from './components';

// ============================================================================
// Constants
// ============================================================================

const ESTADO_MAP = TICKET_STATUS_MAP;
const TIPOS_JUGADA = BET_TYPES;
const ZONAS = ZONES;
const TABLE_HEADERS = TICKET_TABLE_HEADERS;

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

  // Load lotteries from API
  const loadLoterias = useCallback(async (signal?: AbortSignal): Promise<Lottery[]> => {
    try {
      const response = await getAllLotteries({ loadAll: true });

      if (signal?.aborted) return [];

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

      if (!bettingPoolId && !loteria && !zona && !numero) {
        setError('Seleccione al menos una banca, lotería, zona o número para filtrar.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await ticketService.filterTickets({
          date: fechaToUse,
          bettingPoolId: bettingPoolId ?? undefined,
          lotteryId: loteria?.id,
          pageNumber: 1,
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

  // Initialize data on mount
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const initializeData = async () => {
      const [mappedPools] = await Promise.all([
        loadBancas(controller.signal),
        loadLoterias(controller.signal),
      ]);

      if (controller.signal.aborted) return;

      if (mappedPools.length > 0) {
        const targetPoolId = urlBettingPoolId ? parseInt(urlBettingPoolId, 10) : null;
        const targetPool = targetPoolId
          ? mappedPools.find(p => p.id === targetPoolId)
          : mappedPools[0];

        if (targetPool) {
          setBanca(targetPool);
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
  }, []);

  // Filter tickets based on estado and search
  const filteredTickets = useMemo<MappedTicket[]>(() => {
    let data = tickets;

    if (filtroEstado !== 'todos') {
      const targetEstado = ESTADO_MAP[filtroEstado];
      data = data.filter((t) => t.estado === targetEstado);
    }

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
      if (value) setFiltroEstado(value);
    },
    []
  );

  const handleBancaChange = useCallback(
    (_: React.SyntheticEvent, value: BettingPool | null) => setBanca(value),
    []
  );

  const handleLoteriaChange = useCallback(
    (_: React.SyntheticEvent, value: Lottery | null) => setLoteria(value),
    []
  );

  const handleTipoJugadaChange = useCallback(
    (_: React.SyntheticEvent, value: SelectOption | null) => setTipoJugada(value),
    []
  );

  const handleZonaChange = useCallback(
    (_: React.SyntheticEvent, value: SelectOption | null) => setZona(value),
    []
  );

  const handleFechaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setFecha(e.target.value), []);
  const handleNumeroChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setNumero(e.target.value), []);
  const handleFiltroRapidoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setFiltroRapido(e.target.value), []);
  const handlePendientesPagoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setPendientesPago(e.target.checked), []);
  const handleSoloGanadoresChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setSoloGanadores(e.target.checked), []);
  const handleErrorClose = useCallback(() => setError(null), []);

  const handleRowClick = useCallback((ticketId: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) setSelectedTicket(ticket);
  }, [tickets]);

  const handleCloseDetail = useCallback(() => setSelectedTicket(null), []);

  const handlePrintTicket = useCallback((_ticketId: number) => {
    // TODO: Implement print ticket functionality
  }, []);

  const handleSendTicket = useCallback((_ticketId: number) => {
    // TODO: Implement send ticket functionality
  }, []);

  const handleCancelTicket = useCallback(async (ticketId: number) => {
    if (!window.confirm('¿Está seguro de que desea cancelar este ticket?')) {
      return;
    }

    try {
      await ticketService.cancelTicket(ticketId);
      await loadTickets(null, undefined, fecha);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error('Error canceling ticket:', err);
      setError('Error al cancelar el ticket. Por favor, intente nuevamente.');
    }
  }, [loadTickets, fecha, selectedTicket?.id]);

  // Render table content
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

  const isCompactView = !!selectedTicket;

  return (
    <Box sx={STYLES.container}>
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

              {/* Filters Section */}
              <Grid container spacing={isCompactView ? 1 : 2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={isCompactView ? 6 : 3}>
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
                <Grid item xs={12} md={isCompactView ? 6 : 3}>
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
                <Grid item xs={12} md={isCompactView ? 6 : 3}>
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

              {/* Extended filters - hidden in compact view */}
              {!isCompactView && (
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
                        control={<Switch checked={pendientesPago} onChange={handlePendientesPagoChange} />}
                        label={<Typography variant="caption">Pendientes de pago</Typography>}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControlLabel
                        control={<Switch checked={soloGanadores} onChange={handleSoloGanadoresChange} />}
                        label={<Typography variant="caption">Sólo tickets ganadores</Typography>}
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

              {/* Compact filter button */}
              {isCompactView && (
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
              <StatusToggle
                filtroEstado={filtroEstado}
                counts={counts}
                onFilterChange={handleFiltroEstadoChange}
              />

              {/* Totals Panel */}
              <TotalsPanel totals={totals} isCompact={isCompactView} />

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
              <Box sx={{ maxHeight: isCompactView ? 400 : 'none', overflow: 'auto' }}>
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

        {/* Right Panel - Ticket Detail */}
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
