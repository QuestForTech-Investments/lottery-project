/**
 * useTicketMonitoring Hook
 *
 * Manages all state and logic for the TicketMonitoring component.
 */

import { useState, useEffect, useMemo, useCallback, useRef, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@services/api';
import ticketService, {
  mapTicketResponse,
  mapTicketWithLines,
  calculateTicketCounts,
  calculateTicketTotals,
} from '@services/ticketService';
import { getAllLotteries } from '@services/lotteryService';
import { useDebounce } from '@hooks/index';
import type { BettingPool, Lottery, SelectOption } from '@/types';
import { TICKET_STATUS_MAP, DEBOUNCE_DELAY } from '@constants/index';

import type { BettingPoolApiResponse, FilterEstado, MappedTicket, TicketCounts, TicketTotals } from '../types';
import { INITIAL_COUNTS, INITIAL_TOTALS } from '../constants';

interface UseTicketMonitoringReturn {
  // Filter state
  fecha: string;
  banca: BettingPool | null;
  bancas: BettingPool[];
  loteria: Lottery | null;
  loterias: Lottery[];
  tipoJugada: SelectOption | null;
  numero: string;
  pendientesPago: boolean;
  soloGanadores: boolean;
  zona: SelectOption | null;
  filtroEstado: FilterEstado;
  filtroRapido: string;

  // Data state
  tickets: MappedTicket[];
  filteredTickets: MappedTicket[];
  totals: TicketTotals;
  counts: TicketCounts;
  selectedTicket: MappedTicket | null;

  // UI state
  isLoading: boolean;
  error: string | null;
  isInitialLoad: boolean;
  isCompactView: boolean;

  // Handlers
  handleFechaChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBancaChange: (event: React.SyntheticEvent, value: BettingPool | null) => void;
  handleLoteriaChange: (event: React.SyntheticEvent, value: Lottery | null) => void;
  handleTipoJugadaChange: (event: React.SyntheticEvent, value: SelectOption | null) => void;
  handleZonaChange: (event: React.SyntheticEvent, value: SelectOption | null) => void;
  handleNumeroChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFiltroRapidoChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePendientesPagoChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSoloGanadoresChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFiltroEstadoChange: (event: React.MouseEvent<HTMLElement>, value: FilterEstado | null) => void;
  handleFilterClick: () => void;
  handleRowClick: (ticketId: number) => void;
  handleCloseDetail: () => void;
  handlePrintTicket: (ticketId: number) => void;
  handleSendTicket: (ticketId: number) => void;
  handleCancelTicket: (ticketId: number) => Promise<void>;
  handleErrorClose: () => void;
}

export const useTicketMonitoring = (): UseTicketMonitoringReturn => {
  // URL params for deep linking
  const [searchParams] = useSearchParams();
  const urlBettingPoolId = searchParams.get('bettingPoolId');
  const urlDate = searchParams.get('date');

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filter states
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

  // Selected ticket for detail panel
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

      const lotteriesData = 'data' in response
        ? response.data
        : (response as { items?: { lotteryId: number; lotteryName: string }[] }).items || [];

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

        const filterDate = fechaToUse; // YYYY-MM-DD format
        const mappedTickets = (response.tickets || []).map((t) => {
          const mapped = mapTicketResponse(t);
          // Compute date indicators by comparing createdAt date with the filter date (draw date)
          const createdAtDate = new Date(mapped.rawCreatedAt).toLocaleDateString('en-CA', {
            timeZone: 'America/Santo_Domingo',
          }); // returns YYYY-MM-DD
          if (createdAtDate > filterDate) {
            mapped.isPreviousDay = true;
          } else if (createdAtDate < filterDate) {
            mapped.isFutureDay = true;
          }
          return mapped;
        });

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
      const targetEstado = TICKET_STATUS_MAP[filtroEstado];
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

  const handleRowClick = useCallback(async (ticketId: number) => {
    try {
      // Fetch ticket detail with lines from API
      const ticketDetail = await ticketService.getTicketById(ticketId);
      const mappedTicket = mapTicketWithLines(ticketDetail);
      setSelectedTicket(mappedTicket);
    } catch (err) {
      console.error('Error loading ticket detail:', err);
      // Fallback to ticket from list (without lines)
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) setSelectedTicket(ticket);
    }
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

  const isCompactView = !!selectedTicket;

  return {
    fecha,
    banca,
    bancas,
    loteria,
    loterias,
    tipoJugada,
    numero,
    pendientesPago,
    soloGanadores,
    zona,
    filtroEstado,
    filtroRapido,
    tickets,
    filteredTickets,
    totals,
    counts,
    selectedTicket,
    isLoading,
    error,
    isInitialLoad,
    isCompactView,
    handleFechaChange,
    handleBancaChange,
    handleLoteriaChange,
    handleTipoJugadaChange,
    handleZonaChange,
    handleNumeroChange,
    handleFiltroRapidoChange,
    handlePendientesPagoChange,
    handleSoloGanadoresChange,
    handleFiltroEstadoChange,
    handleFilterClick,
    handleRowClick,
    handleCloseDetail,
    handlePrintTicket,
    handleSendTicket,
    handleCancelTicket,
    handleErrorClose,
  };
};

export default useTicketMonitoring;
