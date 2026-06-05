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
import { getCurrentUser } from '@services/authService';
import { useDebounce } from '@hooks/index';
import type { BettingPool, Lottery, SelectOption } from '@/types';
import { TICKET_STATUS_MAP, DEBOUNCE_DELAY } from '@constants/index';
import { getTodayDate } from '@/utils/formatters';

import type { BettingPoolApiResponse, FilterEstado, MappedTicket, TicketCounts, TicketTotals } from '../types';
import { INITIAL_COUNTS, INITIAL_TOTALS } from '../constants';

// Game type returned by /api/game-types.
export interface GameTypeOption {
  id: number;
  name: string;
  code: string;
  numberLength: number;
  requiresAdditionalNumber: boolean;
}

export interface ZoneOption {
  id: number;
  name: string;
}

interface UseTicketMonitoringReturn {
  // Filter state
  fecha: string;
  banca: BettingPool | null;
  bancas: BettingPool[];
  loteria: Lottery | null;
  loterias: Lottery[];
  tipoJugada: GameTypeOption | null;
  tiposJugada: GameTypeOption[];
  numero: string;
  pendientesPago: boolean;
  soloGanadores: boolean;
  zonas: number[];
  zonasList: ZoneOption[];
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
  handleTipoJugadaChange: (event: React.SyntheticEvent, value: GameTypeOption | null) => void;
  handleZonasChange: (ids: number[]) => void;
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
  const urlTicketId = searchParams.get('ticketId');

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filter states
  const [fecha, setFecha] = useState<string>(
    () => urlDate || getTodayDate()
  );
  const [banca, setBanca] = useState<BettingPool | null>(null);
  const [bancas, setBancas] = useState<BettingPool[]>([]);
  const [loteria, setLoteria] = useState<Lottery | null>(null);
  const [loterias, setLoterias] = useState<Lottery[]>([]);
  const [tipoJugada, setTipoJugada] = useState<GameTypeOption | null>(null);
  const [tiposJugada, setTiposJugada] = useState<GameTypeOption[]>([]);
  const [numero, setNumero] = useState<string>('');
  const [pendientesPago, setPendientesPago] = useState<boolean>(false);
  const [soloGanadores, setSoloGanadores] = useState<boolean>(false);
  const [zonas, setZonas] = useState<number[]>([]);
  const [zonasList, setZonasList] = useState<ZoneOption[]>([]);

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
      // pageSize=5000 to fit tenants with up to a few thousand bancas
      // (La Central has 600+). Backend caps the request so this never
      // pulls absurd amounts.
      const response = await api.get<{ items?: BettingPoolApiResponse[] } | BettingPoolApiResponse[]>(
        '/betting-pools?page=1&pageSize=5000'
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

  // Load game types from API — drives both the dropdown and the number placeholder.
  const loadGameTypes = useCallback(async (signal?: AbortSignal): Promise<GameTypeOption[]> => {
    try {
      type RawGameType = {
        gameTypeId: number;
        gameName: string;
        gameTypeCode: string;
        numberLength?: number;
        requiresAdditionalNumber?: boolean;
      };
      const response = await api.get<RawGameType[]>('/game-types');
      if (signal?.aborted) return [];
      const list: GameTypeOption[] = (response || []).map((g) => ({
        id: g.gameTypeId,
        name: g.gameName,
        code: g.gameTypeCode,
        numberLength: g.numberLength || 2,
        requiresAdditionalNumber: g.requiresAdditionalNumber || false,
      }));
      setTiposJugada(list);
      return list;
    } catch (err) {
      if (signal?.aborted) return [];
      console.error('Error loading game types:', err);
      return [];
    }
  }, []);

  // Load zones from API.
  const loadZonas = useCallback(async (signal?: AbortSignal): Promise<ZoneOption[]> => {
    try {
      type RawZone = { zoneId?: number; id?: number; zoneName?: string; name?: string };
      const response = await api.get<{ items?: RawZone[] } | RawZone[]>('/zones');
      if (signal?.aborted) return [];
      const arr = (response && typeof response === 'object' && 'items' in response)
        ? (response.items || [])
        : (response as RawZone[] || []);
      const list: ZoneOption[] = arr.map((z) => ({
        id: z.zoneId || z.id || 0,
        name: z.zoneName || z.name || '',
      }));
      setZonasList(list);
      // Start with all zones selected → "Todas" by default.
      setZonas(list.map((z) => z.id));
      return list;
    } catch (err) {
      if (signal?.aborted) return [];
      console.error('Error loading zones:', err);
      return [];
    }
  }, []);

  // Load active draws — the dropdown shows draws (sorteos), not lotteries.
  const loadLoterias = useCallback(async (signal?: AbortSignal): Promise<Lottery[]> => {
    try {
      type RawDraw = { drawId: number; drawName?: string; lotteryName?: string };
      const response = await api.get<{ items?: RawDraw[] } | RawDraw[]>('/draws?pageSize=500');

      if (signal?.aborted) return [];

      const drawsData = (response && typeof response === 'object' && 'items' in response)
        ? (response.items || [])
        : (response as RawDraw[] || []);

      const mapped: Lottery[] = drawsData.map((d) => ({
        id: d.drawId,
        name: d.drawName || d.lotteryName || `Sorteo ${d.drawId}`,
      }));

      setLoterias(mapped);
      return mapped;
    } catch (err) {
      if (signal?.aborted) return [];
      console.error('Error loading draws:', err);
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

      if (!bettingPoolId && !loteria && zonas.length === 0 && !numero && !tipoJugada) {
        setError('Seleccione al menos una banca, lotería, zona, tipo de jugada o número para filtrar.');
        setIsLoading(false);
        return;
      }

      try {
        // Only send zoneIds when narrowed below the full list (mirrors other reports).
        const zoneIdsParam = zonas.length > 0 && zonas.length < zonasList.length ? zonas : undefined;
        const response = await ticketService.filterTickets({
          date: fechaToUse,
          bettingPoolId: bettingPoolId ?? undefined,
          // The "Lotería" dropdown now lists draws; the selected id is a drawId.
          drawId: loteria?.id,
          betTypeId: tipoJugada?.id,
          betNumber: numero || undefined,
          zoneIds: zoneIdsParam,
          pendingPayment: pendientesPago || undefined,
          winnersOnly: soloGanadores || undefined,
          pageNumber: 1,
          pageSize: 100,
        });

        if (signal?.aborted) return;

        // isFutureDay / isPreviousDay come from the backend (intrinsic to the
        // ticket: any line drawing after / before creation date). This keeps the
        // flag stable across views — a future ticket still shows the flag when
        // viewed on its emission day.
        const mappedTickets = (response.tickets || []).map((t) => mapTicketResponse(t));

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
    [banca?.id, fecha, loteria, zonas, zonasList.length, numero, tipoJugada, pendientesPago, soloGanadores]
  );

  // Initialize data on mount
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const initializeData = async () => {
      const [mappedPools] = await Promise.all([
        loadBancas(controller.signal),
        loadLoterias(controller.signal),
        loadGameTypes(controller.signal),
        loadZonas(controller.signal),
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
    (_: React.SyntheticEvent, value: GameTypeOption | null) => setTipoJugada(value),
    []
  );

  const handleZonasChange = useCallback((ids: number[]) => setZonas(ids), []);

  const handleFechaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setFecha(e.target.value), []);
  const handleNumeroChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setNumero(e.target.value), []);
  const handleFiltroRapidoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setFiltroRapido(e.target.value), []);
  const handlePendientesPagoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setPendientesPago(e.target.checked), []);
  const handleSoloGanadoresChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setSoloGanadores(e.target.checked), []);
  const handleErrorClose = useCallback(() => setError(null), []);

  const handleRowClick = useCallback(async (ticketId: number) => {
    const listTicket = tickets.find(t => t.id === ticketId);
    try {
      // Fetch ticket detail with lines from API
      const ticketDetail = await ticketService.getTicketById(ticketId);
      const mappedTicket = mapTicketWithLines(ticketDetail);
      // Preserve status flags from the list ticket
      if (listTicket) {
        mappedTicket.isPreviousDay = listTicket.isPreviousDay;
        mappedTicket.isFutureDay = listTicket.isFutureDay;
        mappedTicket.isOutOfScheduleSale = listTicket.isOutOfScheduleSale;
        mappedTicket.isCancelledOutOfTime = listTicket.isCancelledOutOfTime;
      }
      setSelectedTicket(mappedTicket);
    } catch (err) {
      console.error('Error loading ticket detail:', err);
      if (listTicket) setSelectedTicket(listTicket);
    }
  }, [tickets]);

  // Auto-open detail panel when ticketId is in URL (deep link from Warnings).
  // Runs once after tickets load post-mount; selectedTicket guard prevents re-firing.
  const ticketIdAutoSelectedRef = useRef<boolean>(false);
  useEffect(() => {
    if (ticketIdAutoSelectedRef.current) return;
    if (!urlTicketId || tickets.length === 0 || isInitialLoad) return;
    const tid = parseInt(urlTicketId, 10);
    if (!Number.isFinite(tid)) return;
    ticketIdAutoSelectedRef.current = true;
    handleRowClick(tid);
  }, [urlTicketId, tickets, isInitialLoad, handleRowClick]);

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

    const currentUser = getCurrentUser();
    const userId = Number(currentUser?.id);
    if (!userId) {
      setError('No se pudo identificar el usuario. Inicie sesión nuevamente.');
      return;
    }

    try {
      await ticketService.cancelTicket(ticketId, userId);
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
    tiposJugada,
    numero,
    pendientesPago,
    soloGanadores,
    zonas,
    zonasList,
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
    handleZonasChange,
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
