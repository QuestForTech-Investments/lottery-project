/**
 * useCreateTicketsState Hook
 *
 * Manages all state and logic for the CreateTickets component.
 * Extracted from index.tsx for better maintainability.
 */

import { useState, useEffect, useRef, useMemo, useCallback, type RefObject, type KeyboardEvent } from 'react';
import api from '@services/api';
import { getCurrentUser } from '@services/authService';
import { getBettingPoolConfig } from '@services/bettingPoolService';
import { useUserPermissions } from '@hooks/useUserPermissions';
import { useSignalR, type LimitAvailability, type PlayStats } from '@hooks/useSignalR';
import type {
  BettingPool, Draw, Bet, ColumnType, VisibleColumns,
  BettingPoolDrawResponse, DrawApiResponse, TicketData,
  TicketDateMode, BetDetectionResult
} from '../types';
import { GAME_TYPES, BET_TYPES, SPLIT_PAIRS } from '../constants';

interface UseCreateTicketsStateReturn {
  // Refs
  betNumberInputRef: RefObject<HTMLInputElement>;
  amountInputRef: RefObject<HTMLInputElement>;

  // Pool state
  selectedPool: BettingPool | null;
  pools: BettingPool[];
  setSelectedPool: (pool: BettingPool | null) => void;

  // Draw state
  selectedDraw: Draw | null;
  selectedDraws: Draw[];
  draws: Draw[];
  loadingDraws: boolean;
  loadingAllowedDraws: boolean;
  allowedDrawIds: Set<number>;

  // Stats
  dailyBets: number;
  soldInGroup: string;
  soldInPool: string;

  // Toggles
  discountActive: boolean;
  multiLotteryMode: boolean;
  setDiscountActive: (value: boolean) => void;
  setMultiLotteryMode: (value: boolean) => void;

  // Input fields
  betNumber: string;
  amount: string;
  selectedBetType: string;
  betError: string;
  betWarning: string;
  setBetNumber: (value: string) => void;
  setAmount: (value: string) => void;
  setSelectedBetType: (value: string) => void;

  // Bets by column
  directBets: Bet[];
  paleBets: Bet[];
  cash3Bets: Bet[];
  play4Bets: Bet[];

  // Modals
  helpModalOpen: boolean;
  ticketModalOpen: boolean;
  ticketData: TicketData | null;
  successMessage: string;
  setHelpModalOpen: (value: boolean) => void;
  setTicketModalOpen: (value: boolean) => void;
  setTicketData: (data: TicketData | null) => void;
  setSuccessMessage: (msg: string) => void;

  // Computed
  visibleColumns: VisibleColumns;
  bgColor: string;
  directTotal: string;
  paleTotal: string;
  cash3Total: string;
  play4Total: string;
  grandTotal: string;
  totalBets: number;

  // Date mode
  ticketDateMode: TicketDateMode;
  selectedFutureDate: string;
  effectiveTicketDate: string | null;
  handleTogglePreviousDay: () => void;
  handleToggleFutureDate: () => void;
  handleFutureDateChange: (date: string) => void;

  // Split amount
  allowSplitAmount: boolean;

  // Cancel config
  cancelMinutes: number;

  // Limits
  limitAvailable: number | null; // null = not checked, -1 = unlimited, 0+ = amount
  // True while a limit-availability response is in flight — used to block adds.
  limitChecking: boolean;
  signalRConnected: boolean;
  handleBetNumberBlur: () => void;
  playStats: { playCount: number; soldInGroup: number; soldInPool: number } | null;
  // True when the current input is a compound-play command (e.g. "25.") that
  // skips limit checks and expands into multiple bets on add.
  isCompoundPlay: boolean;
  // Convert plays modal (triggered by "+" on empty input)
  convertModalOpen: boolean;
  setConvertModalOpen: (open: boolean) => void;
  handleConvertPlays: (result: {
    target: 'directo' | 'pale' | 'tripleta';
    gameTypeId: number;
    amount: number;
    combos: string[];
  }) => void;
  selectedDrawGameTypes: number[];

  // Handlers
  handleDrawClick: (draw: Draw) => void;
  handleAddBet: () => void;
  handleDeleteBet: (column: ColumnType, id: number) => void;
  handleDeleteAll: (column: ColumnType) => void;
  handleCreateTicket: () => Promise<void>;
  handleDuplicate: () => void;
  handleBetNumberKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleAmountKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  creatingTicket: boolean;
}

export const useCreateTicketsState = (): UseCreateTicketsStateReturn => {
  // Refs
  const betNumberInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Pool state
  const [selectedPool, setSelectedPool] = useState<BettingPool | null>(null);
  const [pools, setPools] = useState<BettingPool[]>([]);
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Draw state
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedDraws, setSelectedDraws] = useState<Draw[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loadingDraws, setLoadingDraws] = useState<boolean>(true);
  const [allowedDrawIds, setAllowedDrawIds] = useState<Set<number>>(new Set());
  const [loadingAllowedDraws, setLoadingAllowedDraws] = useState<boolean>(false);
  const [drawGameTypes, setDrawGameTypes] = useState<Map<number, number[]>>(new Map());
  const [drawClosingTimes, setDrawClosingTimes] = useState<Map<number, string>>(new Map());
  const [closedDrawIds, setClosedDrawIds] = useState<Set<number>>(new Set());
  const [drawIsDominican, setDrawIsDominican] = useState<Map<number, boolean>>(new Map());

  // Stats
  const [dailyBets] = useState<number>(0);
  const [soldInGroup] = useState<string>('');
  const [soldInPool] = useState<string>('');

  // Toggles
  const [discountActive, setDiscountActive] = useState<boolean>(true);
  const [multiLotteryMode, setMultiLotteryMode] = useState<boolean>(false);

  // Input fields
  const [betNumber, setBetNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedBetType, setSelectedBetType] = useState<string>('');
  const [betError, setBetError] = useState<string>('');
  const [betWarning, setBetWarning] = useState<string>('');

  // Limit state
  const [limitAvailable, setLimitAvailable] = useState<number | null>(null);
  // True while waiting for the server's limit-availability response. Blocks the
  // add button so the user can't bypass the check by adding faster than the
  // round-trip.
  const [limitChecking, setLimitChecking] = useState<boolean>(false);
  const [playStats, setPlayStats] = useState<{ playCount: number; soldInGroup: number; soldInPool: number } | null>(null);
  const recheckLimitRef = useRef<(() => void) | null>(null);
  const { connected: signalRConnected, checkPlayLimit, getPlayStats, reservePlay, releaseReservation, onLimitAvailability, onPlayReserved, onPlayStats } = useSignalR();

  // "Convert plays" modal — opens when user types "+" on an empty bet input.
  const [convertModalOpen, setConvertModalOpen] = useState<boolean>(false);
  // Resolved allowed game-type ids for the draw currently in focus.
  const selectedDrawGameTypes = useMemo<number[]>(
    () => selectedDraw ? (drawGameTypes.get(selectedDraw.id) || []) : [],
    [selectedDraw, drawGameTypes],
  );

  // Map of betId -> reservationId for releasing on delete
  const reservationMapRef = useRef<Map<number, string>>(new Map());
  // Queue of betIds waiting for reservationId from server
  const pendingReservationsRef = useRef<Map<string, number>>(new Map()); // "drawId-gameTypeId" -> betId

  // Register SignalR callbacks
  useEffect(() => {
    onLimitAvailability((data: LimitAvailability) => {
      // Response arrived — the add button can re-enable.
      setLimitChecking(false);
      setLimitAvailable(prev => {
        if (prev === null) return data.availableAmount;
        if (data.availableAmount === -1) return prev === -1 ? -1 : prev;
        if (prev === -1) return data.availableAmount;
        return Math.min(prev, data.availableAmount);
      });

      // Show blocked message with level info
      if (data.isBlocked && data.blockedBy) {
        const labels: Record<string, string> = {
          global: 'Límite Global alcanzado',
          zona: 'Límite de Zona alcanzado',
          banca: 'Límite de Banca alcanzado',
          local_banca: 'Límite Local de Banca alcanzado',
          no_limit: 'Banca no tiene límites configurados',
        };
        setBetWarning(labels[data.blockedBy] || 'Límite alcanzado');
        setTimeout(() => setBetWarning(''), 5000);
      }
    });

    onPlayStats((data: PlayStats) => {
      setPlayStats({ playCount: data.playCount, soldInGroup: data.soldInGroup, soldInPool: data.soldInPool });
    });

    onPlayReserved((data) => {
      // Match to pending bet and store the reservationId
      const key = `${data.drawId}-${data.gameTypeId}`;
      const betId = pendingReservationsRef.current.get(key);
      if (betId !== undefined) {
        reservationMapRef.current.set(betId, data.reservationId);
        pendingReservationsRef.current.delete(key);
      }
    });
  }, [onLimitAvailability, onPlayReserved, onPlayStats]);

  // Bets by column
  const [directBets, setDirectBets] = useState<Bet[]>([]);
  const [paleBets, setPaleBets] = useState<Bet[]>([]);
  const [cash3Bets, setCash3Bets] = useState<Bet[]>([]);
  const [play4Bets, setPlay4Bets] = useState<Bet[]>([]);

  // Modals
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
  const [ticketModalOpen, setTicketModalOpen] = useState<boolean>(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Date mode for previous-day / future sales
  const [ticketDateMode, setTicketDateMode] = useState<TicketDateMode>('today');
  const [selectedFutureDate, setSelectedFutureDate] = useState<string>('');

  // Permission-based closed draw bypass
  const { hasPermission } = useUserPermissions();
  const canSellClosed = hasPermission('SELL_OUT_OF_HOURS');

  // Cancel minutes from pool config
  const [cancelMinutes, setCancelMinutes] = useState<number>(5);

  useEffect(() => {
    if (!selectedPool) {
      setCancelMinutes(5);
      return;
    }
    const fetchConfig = async () => {
      try {
        const result = await getBettingPoolConfig(selectedPool.bettingPoolId);
        if (result.data?.config?.cancelMinutes != null) {
          setCancelMinutes(result.data.config.cancelMinutes);
        }
      } catch {
        // Keep default
      }
    };
    fetchConfig();
  }, [selectedPool?.bettingPoolId]);

  // Load betting pools on mount (paginated — fetches all pages)
  useEffect(() => {
    const loadPools = async () => {
      try {
        const pageSize = 100;
        const all: BettingPool[] = [];
        let page = 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const response = await api.get(`/betting-pools?page=${page}&pageSize=${pageSize}`) as
            | { items?: BettingPool[]; totalCount?: number }
            | BettingPool[];
          const items: BettingPool[] = Array.isArray(response) ? response : (response.items || []);
          all.push(...items);
          if (Array.isArray(response)) break;
          if (items.length < pageSize) break;
          if (typeof response.totalCount === 'number' && all.length >= response.totalCount) break;
          page += 1;
        }
        setPools(all);
      } catch (error) {
        console.error('Error loading betting pools:', error);
        setPools([{ bettingPoolId: 9, bettingPoolCode: 'RB003333', bettingPoolName: 'admin' }]);
      }
    };
    loadPools();
  }, []);

  // Load allowed draws when betting pool changes
  const loadAllowedDraws = useCallback(async (isRefresh = false) => {
    if (!selectedPool) {
      setAllowedDrawIds(new Set());
      setDrawGameTypes(new Map());
      setDrawClosingTimes(new Map());
      setDrawIsDominican(new Map());
      return;
    }

    if (!isRefresh) setLoadingAllowedDraws(true);
    try {
      const response = await api.get(`/betting-pools/${selectedPool.bettingPoolId}/draws`) as BettingPoolDrawResponse[];
      const activeDraws = (response || []).filter((d) => d.isActive);
      const drawIds = activeDraws.map((d) => d.drawId);
      setAllowedDrawIds(new Set(drawIds));

      const gameTypesMap = new Map<number, number[]>();
      activeDraws.forEach((d) => {
        if (d.availableGameTypes && d.availableGameTypes.length > 0) {
          const gameTypeIds = d.availableGameTypes.map(gt => gt.gameTypeId);
          gameTypesMap.set(d.drawId, gameTypeIds);
        }
      });
      setDrawGameTypes(gameTypesMap);

      // Store closing times and server-side isClosed per draw
      const closingMap = new Map<number, string>();
      const closedSet = new Set<number>();
      activeDraws.forEach((d) => {
        if (d.drawTime) {
          closingMap.set(d.drawId, d.drawTime);
        }
        if (d.isClosed) {
          closedSet.add(d.drawId);
        }
      });
      setDrawClosingTimes(closingMap);
      setClosedDrawIds(closedSet);

      // Store isDominican flag per draw
      const dominicanMap = new Map<number, boolean>();
      activeDraws.forEach((d) => {
        dominicanMap.set(d.drawId, d.isDominican ?? true);
      });
      setDrawIsDominican(dominicanMap);

      if (!isRefresh) {
        setSelectedDraw(null);
        setSelectedDraws([]);
      }
    } catch (error) {
      if (!isRefresh) {
        console.error('Error loading allowed draws:', error);
        setAllowedDrawIds(new Set());
        setDrawGameTypes(new Map());
        setDrawClosingTimes(new Map());
        setClosedDrawIds(new Set());
        setDrawIsDominican(new Map());
      }
    } finally {
      if (!isRefresh) setLoadingAllowedDraws(false);
    }
  }, [selectedPool?.bettingPoolId]);

  useEffect(() => {
    loadAllowedDraws();
  }, [loadAllowedDraws]);

  // Load draws from API
  useEffect(() => {
    const loadDraws = async () => {
      setLoadingDraws(true);
      try {
        const response = await api.get('/draws?pageSize=1000&sortBy=displayOrder') as { items?: DrawApiResponse[] } | DrawApiResponse[];
        const items = (response && 'items' in response ? response.items : response) || [];

        const formattedDraws = (items as DrawApiResponse[]).map((draw) => ({
          id: draw.drawId,
          name: draw.drawName || draw.name || '',
          abbreviation: draw.abbreviation || draw.drawName || draw.name || '',
          color: draw.displayColor || draw.lotteryColour || '#9e9e9e',
          disabled: !draw.isActive,
          lotteryId: draw.lotteryId,
          imageUrl: draw.imageUrl,
        }));

        setDraws(formattedDraws);
      } catch (error) {
        console.error('Error loading draws:', error);
        setDraws([
          { id: 1, name: 'ANGUILA 10AM', color: '#4caf50', disabled: false },
          { id: 2, name: 'NY 12PM', color: '#f44336', disabled: false },
          { id: 3, name: 'FL 1PM', color: '#2196f3', disabled: false },
        ]);
      } finally {
        setLoadingDraws(false);
      }
    };
    loadDraws();
  }, []);

  // Re-fetch draw closing status from the server every 30s
  useEffect(() => {
    if (!selectedPool) return;
    const id = setInterval(() => loadAllowedDraws(true), 30_000);
    return () => clearInterval(id);
  }, [selectedPool, loadAllowedDraws]);

  // Merge closing times into draws - use server-side isClosed
  // When user has SELL_OUT_OF_HOURS permission, closed draws remain selectable
  const drawsWithClosingInfo = useMemo(() => {
    return draws.map(draw => {
      const closing = drawClosingTimes.get(draw.id);
      const isClosed = closedDrawIds.has(draw.id);
      return {
        ...draw,
        closingTime: closing,
        isClosed,
        disabled: draw.disabled || (isClosed && !canSellClosed),
      };
    });
  }, [draws, drawClosingTimes, closedDrawIds, canSellClosed]);

  // Memoized totals
  const calculateTotal = useCallback((bets: Bet[]): string => {
    return bets.reduce((sum, bet) => sum + (bet.betAmount || 0), 0).toFixed(2);
  }, []);

  const directTotal = useMemo(() => calculateTotal(directBets), [directBets, calculateTotal]);
  const paleTotal = useMemo(() => calculateTotal(paleBets), [paleBets, calculateTotal]);
  const cash3Total = useMemo(() => calculateTotal(cash3Bets), [cash3Bets, calculateTotal]);
  const play4Total = useMemo(() => calculateTotal(play4Bets), [play4Bets, calculateTotal]);

  const grandTotal = useMemo(() => {
    const total = parseFloat(directTotal) + parseFloat(paleTotal) + parseFloat(cash3Total) + parseFloat(play4Total);
    return total.toFixed(2);
  }, [directTotal, paleTotal, cash3Total, play4Total]);

  const totalBets = useMemo(() => {
    return directBets.length + paleBets.length + cash3Bets.length + play4Bets.length;
  }, [directBets.length, paleBets.length, cash3Bets.length, play4Bets.length]);

  // Visible columns based on game types
  const visibleColumns = useMemo<VisibleColumns>(() => {
    if (!selectedDraw) {
      return { directo: true, pale: true, cash3: true, play4: true };
    }

    const allGameTypes = new Set<number>();
    if (multiLotteryMode && selectedDraws.length > 0) {
      selectedDraws.forEach(draw => {
        (drawGameTypes.get(draw.id) || []).forEach(gt => allGameTypes.add(gt));
      });
    } else {
      (drawGameTypes.get(selectedDraw.id) || []).forEach(gt => allGameTypes.add(gt));
    }

    if (allGameTypes.size === 0) {
      return { directo: true, pale: true, cash3: true, play4: true };
    }

    const gameTypesArray = Array.from(allGameTypes);
    return {
      // Pick2 (15-18) moved to the cash3 column — they share "PICK2 / PICK3".
      directo: gameTypesArray.some(gt => gt === 1 || gt === 19 || gt === 20 || gt === 21) || directBets.length > 0,
      pale: gameTypesArray.some(gt => gt === 2 || gt === 3 || gt === 14) || paleBets.length > 0,
      cash3: gameTypesArray.some(gt => (gt >= 4 && gt <= 9) || (gt >= 15 && gt <= 18)) || cash3Bets.length > 0,
      play4: gameTypesArray.some(gt => gt >= 10 && gt <= 13) || play4Bets.length > 0,
    };
  }, [selectedDraw?.id, selectedDraws, multiLotteryMode, drawGameTypes, directBets.length, paleBets.length, cash3Bets.length, play4Bets.length]);

  // Allow split amount (X+Y) only when all selected draws are non-Dominican
  const allowSplitAmount = useMemo<boolean>(() => {
    const drawsToCheck = multiLotteryMode && selectedDraws.length > 0
      ? selectedDraws
      : selectedDraw ? [selectedDraw] : [];
    if (drawsToCheck.length === 0) return false;
    return drawsToCheck.every(d => drawIsDominican.get(d.id) === false);
  }, [multiLotteryMode, selectedDraws, selectedDraw, drawIsDominican]);

  const bgColor = useMemo(() => {
    return selectedDraw?.color ? `${selectedDraw.color}30` : '#c8e6c9';
  }, [selectedDraw?.color]);

  // Date mode handlers
  const handleTogglePreviousDay = useCallback(() => {
    setTicketDateMode(prev => prev === 'previousDay' ? 'today' : 'previousDay');
    setSelectedFutureDate('');
  }, []);

  const handleToggleFutureDate = useCallback(() => {
    setTicketDateMode(prev => prev === 'futureDate' ? 'today' : 'futureDate');
    setSelectedFutureDate('');
  }, []);

  const handleFutureDateChange = useCallback((date: string) => {
    setSelectedFutureDate(date);
  }, []);

  // Compute effective ticket date based on mode
  const effectiveTicketDate = useMemo<string | null>(() => {
    if (ticketDateMode === 'previousDay') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    if (ticketDateMode === 'futureDate' && selectedFutureDate) {
      return selectedFutureDate;
    }
    return null; // today — don't send ticketDate
  }, [ticketDateMode, selectedFutureDate]);

  // Handlers
  const handleDrawClick = useCallback((draw: Draw): void => {
    if (!selectedPool || draw.disabled) return;

    if (multiLotteryMode) {
      const isAlreadySelected = selectedDraws.some(s => s.id === draw.id);
      if (isAlreadySelected) {
        setSelectedDraws(prev => prev.filter(s => s.id !== draw.id));
      } else {
        setSelectedDraws(prev => [...prev, draw]);
      }
      if (!selectedDraw || selectedDraws.length === 0) {
        setSelectedDraw(draw);
      }
    } else {
      setSelectedDraw(draw);
      setSelectedDraws([draw]);
    }
  }, [selectedPool, multiLotteryMode, selectedDraws, selectedDraw]);

  // Resolve the gameTypeId from the dropdown selection
  const getDropdownGameTypeId = useCallback((dropdownValue: string): number | null => {
    if (!dropdownValue) return null;
    const bt = BET_TYPES.find(t => t.id === dropdownValue);
    return bt?.gameTypeId ?? null;
  }, []);

  /**
   * Detect bet type from input pattern.
   * Checks patterns in priority order (most specific first).
   * Uses draw's allowedGameTypes for disambiguation.
   */
  const determineBetType = useCallback((
    input: string,
    dropdownBetType: string,
    allowedGameTypes: number[]
  ): BetDetectionResult | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const dropdownGtId = getDropdownGameTypeId(dropdownBetType);
    const allowed = new Set(allowedGameTypes);
    const hasAllowed = allowed.size > 0;

    // Helper: pick best candidate from list, considering dropdown and draw permissions
    const pickCandidate = (candidates: number[], fallback: number): number => {
      // If dropdown matches a candidate, prefer it
      if (dropdownGtId && candidates.includes(dropdownGtId)) return dropdownGtId;
      // If draw has restrictions, filter to allowed
      if (hasAllowed) {
        const valid = candidates.filter(id => allowed.has(id));
        if (valid.length > 0) return valid[0];
      }
      return fallback;
    };

    const buildResult = (gtId: number, clean: string, pos?: number): BetDetectionResult => {
      const cfg = GAME_TYPES[gtId];
      // Dynamic suffix for position-based types
      let suffix = cfg.displaySuffix;
      if (pos != null) {
        if (gtId === 20) suffix = `s${pos}`;     // Singulacion: 5s1, 5s2, 5s3
        else if (gtId === 19) suffix = `b${pos}`; // Bolita: 12b1, 12b2
        else if (gtId === 18) suffix = `m${pos}`; // Pick2 Middle: 25m1, 25m2, 25m3
      }
      return {
        gameTypeId: gtId,
        cleanNumber: clean,
        displaySuffix: suffix,
        column: cfg.column,
        displayName: cfg.name,
        position: pos,
      };
    };

    let match: RegExpMatchArray | null;

    // 1. Super Pale with S prefix: S1234
    match = trimmed.match(/^[sS](\d{4})$/);
    if (match) return buildResult(14, match[1]);

    // 2. Singulacion: digit-position (e.g. 5-1, 5-2, 5-3)
    match = trimmed.match(/^(\d)-([123])$/);
    if (match) return buildResult(20, match[1], parseInt(match[2]));

    // 3. Bolita: 2digits+position (e.g. 12+1, 12+2)
    match = trimmed.match(/^(\d{2})\+([12])$/);
    if (match) return buildResult(19, match[1], parseInt(match[2]));

    // 4. Pick2 Middle: 2digits-position (1, 2, or 3) (e.g. 25-1, 25-2, 25-3)
    match = trimmed.match(/^(\d{2})-([123])$/);
    if (match) return buildResult(18, match[1], parseInt(match[2]));

    // 5. Pick2 Front: 2digits + f (e.g. 12f)
    match = trimmed.match(/^(\d{2})[fF]$/);
    if (match) return buildResult(16, match[1]);

    // 6. Pick2 Back: 2digits + b (e.g. 12b)
    match = trimmed.match(/^(\d{2})[bB]$/);
    if (match) return buildResult(17, match[1]);

    // 7. Cash3 Front Box: 3digits + f+ (e.g. 123f+)
    match = trimmed.match(/^(\d{3})[fF]\+$/);
    if (match) return buildResult(7, match[1]);

    // 8. Cash3 Front Straight: 3digits + f (e.g. 123f)
    match = trimmed.match(/^(\d{3})[fF]$/);
    if (match) return buildResult(6, match[1]);

    // 9. Cash3 Back Box: 3digits + b+ (e.g. 123b+)
    match = trimmed.match(/^(\d{3})[bB]\+$/);
    if (match) return buildResult(9, match[1]);

    // 10. Cash3 Back Straight: 3digits + b (e.g. 123b)
    match = trimmed.match(/^(\d{3})[bB]$/);
    if (match) return buildResult(8, match[1]);

    // 11. Cash3 Box: 3digits + or . (e.g. 123+, 123.)
    match = trimmed.match(/^(\d{3})[+.]$/);
    if (match) return buildResult(5, match[1]);

    // 12. Cash3 Straight: 3digits or 3digits- (e.g. 123, 123-)
    match = trimmed.match(/^(\d{3})-?$/);
    if (match) return buildResult(4, match[1]);

    // 13. Pick5 Straight: 5digits- (e.g. 12345-)
    match = trimmed.match(/^(\d{5})-$/);
    if (match) return buildResult(12, match[1]);

    // 14. Pick5 Box: 5digits + or . (e.g. 12345+, 12345.)
    match = trimmed.match(/^(\d{5})[+.]$/);
    if (match) return buildResult(13, match[1]);

    // 15. Play4 Straight / Panama: 4digits- (ambiguous: 10 vs 21)
    match = trimmed.match(/^(\d{4})-$/);
    if (match) {
      const gtId = pickCandidate([10, 21], 10);
      return buildResult(gtId, match[1]);
    }

    // 16. Play4 Box: 4digits+ (e.g. 1234+)
    match = trimmed.match(/^(\d{4})\+$/);
    if (match) return buildResult(11, match[1]);

    // 17. Tripleta: 6 digits (e.g. 123456)
    match = trimmed.match(/^(\d{6})$/);
    if (match) return buildResult(3, match[1]);

    // 18. Pale / Super Pale: 4 digits (ambiguous: 2 vs 14)
    match = trimmed.match(/^(\d{4})$/);
    if (match) {
      const gtId = pickCandidate([2, 14], 2);
      return buildResult(gtId, match[1]);
    }

    // 19. Directo / Pick2: 2 digits (ambiguous: 1 vs 15)
    match = trimmed.match(/^(\d{2})$/);
    if (match) {
      const gtId = pickCandidate([1, 15], 1);
      return buildResult(gtId, match[1]);
    }

    // 20. Plain 5 digits (no suffix) → Pick5 Straight
    match = trimmed.match(/^(\d{5})$/);
    if (match) return buildResult(12, match[1]);

    return null;
  }, [getDropdownGameTypeId]);

  /**
   * Compound plays — one input expands into multiple bets. They skip the
   * client-side limit check; the backend decides whether each generated bet is
   * valid. The UI shows an "X" in the limit field while the user types one.
   *
   * Patterns:
   *   "XY."  →  Directo "XY" + reverse "YX" (skipped if XY == YX)
   */
  type CompoundItem = { cleanNumber: string; gameTypeId: number; displaySuffix: string };
  const detectCompoundPlay = useCallback((
    input: string,
    allowedGameTypes: number[],
  ): CompoundItem[] | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const allowed = new Set(allowedGameTypes);
    const pick = (candidates: number[], fallback: number): number => {
      if (allowed.size === 0) return fallback;
      const valid = candidates.filter(id => allowed.has(id));
      return valid.length > 0 ? valid[0] : fallback;
    };

    // "XY." → Directo + Directo reverso. Works for Directo (1) or Pick2 (15).
    {
      const m = trimmed.match(/^(\d)(\d)\.$/);
      if (m) {
        const [, a, b] = m;
        const gtId = pick([1, 15], 1);
        const items: CompoundItem[] = [{ cleanNumber: a + b, gameTypeId: gtId, displaySuffix: '' }];
        if (a !== b) items.push({ cleanNumber: b + a, gameTypeId: gtId, displaySuffix: '' });
        return items;
      }
    }

    // "XXdYY" (rundown) → all doubles between XX and YY, inclusive. Both endpoints
    // must be doubles themselves (00, 11, 22, …, 99). Direction-agnostic: 33d00
    // works the same as 00d33. Generates Directo (1) or Pick2 (15) plays.
    {
      const m = trimmed.match(/^(\d)\1[dD](\d)\2$/);
      if (m) {
        const lo = Math.min(parseInt(m[1]), parseInt(m[2]));
        const hi = Math.max(parseInt(m[1]), parseInt(m[2]));
        const gtId = pick([1, 15], 1);
        const items: CompoundItem[] = [];
        for (let d = lo; d <= hi; d++) {
          items.push({ cleanNumber: `${d}${d}`, gameTypeId: gtId, displaySuffix: '' });
        }
        return items;
      }
    }

    // "ABCD." → Pale with each 2-digit pair independently reversed (2^2 = 4 combos).
    // Example: 1234. → 12-34, 21-34, 12-43, 21-43. Duplicates from palindromes (e.g. 11)
    // are removed so 1122. only produces 11-22.
    {
      const m = trimmed.match(/^(\d{2})(\d{2})\.$/);
      if (m) {
        const [, p1, p2] = m;
        const p1s = p1[0] === p1[1] ? [p1] : [p1, p1[1] + p1[0]];
        const p2s = p2[0] === p2[1] ? [p2] : [p2, p2[1] + p2[0]];
        const seen = new Set<string>();
        const items: CompoundItem[] = [];
        for (const a of p1s) for (const b of p2s) {
          const num = a + b;
          if (seen.has(num)) continue;
          seen.add(num);
          items.push({ cleanNumber: num, gameTypeId: 2, displaySuffix: '' });
        }
        return items;
      }
    }

    // "ABCDEF." → Tripleta with each 2-digit pair independently reversed (2^3 = 8 combos).
    // Example: 123456. → 12-34-56, 21-34-56, 12-43-56, ..., 21-43-65 (dedup palindromes).
    {
      const m = trimmed.match(/^(\d{2})(\d{2})(\d{2})\.$/);
      if (m) {
        const [, p1, p2, p3] = m;
        const variants = (p: string) => p[0] === p[1] ? [p] : [p, p[1] + p[0]];
        const p1s = variants(p1);
        const p2s = variants(p2);
        const p3s = variants(p3);
        const seen = new Set<string>();
        const items: CompoundItem[] = [];
        for (const a of p1s) for (const b of p2s) for (const c of p3s) {
          const num = a + b + c;
          if (seen.has(num)) continue;
          seen.add(num);
          items.push({ cleanNumber: num, gameTypeId: 3, displaySuffix: '' });
        }
        return items;
      }
    }

    // ─── Cash 3 / Pick 3 compound commands ──────────────────────────────────
    // All produce Cash3 Straight (gtId 4) plays. Each generated bet's display
    // gets the standard 's' suffix from GAME_TYPES[4].

    // "ABCq" → all 6 permutations of the 3 digits (deduped for repeated digits).
    // e.g. 123Q → 123, 132, 213, 231, 312, 321. 112Q → 112, 121, 211. 111Q → 111.
    {
      const m = trimmed.match(/^(\d)(\d)(\d)[qQ]$/);
      if (m) {
        const [, a, b, c] = m;
        const perms = [a + b + c, a + c + b, b + a + c, b + c + a, c + a + b, c + b + a];
        const seen = new Set<string>();
        const items: CompoundItem[] = [];
        for (const p of perms) {
          if (seen.has(p)) continue;
          seen.add(p);
          items.push({ cleanNumber: p, gameTypeId: 4, displaySuffix: 's' });
        }
        return items;
      }
    }

    // "ABC+DEF" → numeric range from min to max, inclusive. Caps at 100 plays
    // to avoid accidentally generating huge sequences.
    {
      const m = trimmed.match(/^(\d{3})\+(\d{3})$/);
      if (m) {
        const start = parseInt(m[1]);
        const end = parseInt(m[2]);
        const lo = Math.min(start, end);
        const hi = Math.max(start, end);
        if (hi - lo + 1 > 100) return null;
        const items: CompoundItem[] = [];
        for (let n = lo; n <= hi; n++) {
          items.push({ cleanNumber: n.toString().padStart(3, '0'), gameTypeId: 4, displaySuffix: 's' });
        }
        return items;
      }
    }

    // "ABC-10" / "-20" / "-30" → vary one digit position across its full range:
    //   -10 → first digit 1-9 (skips 0, since 0XX collapses to a 2-digit number)
    //   -20 → middle digit 0-9
    //   -30 → last digit 0-9
    {
      const m = trimmed.match(/^(\d)(\d)(\d)-([123])0$/);
      if (m) {
        const [, d1, d2, d3, modeStr] = m;
        const items: CompoundItem[] = [];
        if (modeStr === '1') {
          for (let i = 1; i <= 9; i++) items.push({ cleanNumber: `${i}${d2}${d3}`, gameTypeId: 4, displaySuffix: 's' });
        } else if (modeStr === '2') {
          for (let i = 0; i <= 9; i++) items.push({ cleanNumber: `${d1}${i}${d3}`, gameTypeId: 4, displaySuffix: 's' });
        } else {
          for (let i = 0; i <= 9; i++) items.push({ cleanNumber: `${d1}${d2}${i}`, gameTypeId: 4, displaySuffix: 's' });
        }
        return items;
      }
    }

    // "AAAdBBB" → rundown of triples (000, 111, 222, …, 999). Both endpoints
    // must be triples themselves. Direction-agnostic.
    {
      const m = trimmed.match(/^(\d)\1\1[dD](\d)\2\2$/);
      if (m) {
        const lo = Math.min(parseInt(m[1]), parseInt(m[2]));
        const hi = Math.max(parseInt(m[1]), parseInt(m[2]));
        const items: CompoundItem[] = [];
        for (let d = lo; d <= hi; d++) {
          items.push({ cleanNumber: `${d}${d}${d}`, gameTypeId: 4, displaySuffix: 's' });
        }
        return items;
      }
    }

    // ─── Play 4 compound commands ──────────────────────────────────────────
    // Generate Play4 Straight (gtId 10) plays. Display suffix follows GAME_TYPES[10] = 's'.

    // "ABCDq" → all permutations of the 4 digits, deduped (max 24, fewer with repeated digits).
    {
      const m = trimmed.match(/^(\d)(\d)(\d)(\d)[qQ]$/);
      if (m) {
        const digits = [m[1], m[2], m[3], m[4]];
        const perms: string[] = [];
        const used = [false, false, false, false];
        const buf: string[] = [];
        const walk = () => {
          if (buf.length === 4) { perms.push(buf.join('')); return; }
          for (let i = 0; i < 4; i++) {
            if (used[i]) continue;
            used[i] = true;
            buf.push(digits[i]);
            walk();
            buf.pop();
            used[i] = false;
          }
        };
        walk();
        const seen = new Set<string>();
        const items: CompoundItem[] = [];
        for (const p of perms) {
          if (seen.has(p)) continue;
          seen.add(p);
          items.push({ cleanNumber: p, gameTypeId: 10, displaySuffix: 's' });
        }
        return items;
      }
    }

    // "AAAAdN" → rundown of quads (0000, 1111, …, 9999). The 4-digit side must
    // be a quad; the right side is a single digit that maps to NNNN.
    // Example: 1111D9 → 1111, 2222, …, 9999 (9 plays). Direction-agnostic.
    {
      const m = trimmed.match(/^(\d)\1{3}[dD](\d)$/);
      if (m) {
        const lo = Math.min(parseInt(m[1]), parseInt(m[2]));
        const hi = Math.max(parseInt(m[1]), parseInt(m[2]));
        const items: CompoundItem[] = [];
        for (let d = lo; d <= hi; d++) {
          items.push({ cleanNumber: `${d}${d}${d}${d}`, gameTypeId: 10, displaySuffix: 's' });
        }
        return items;
      }
    }

    return null;
  }, []);

  // True when the current input matches a compound-play pattern.
  const isCompoundPlay = useMemo(() => {
    const allowedGameTypes = selectedDraw ? (drawGameTypes.get(selectedDraw.id) || []) : [];
    return detectCompoundPlay(betNumber, allowedGameTypes) !== null;
  }, [betNumber, selectedDraw, drawGameTypes, detectCompoundPlay]);

  // The moment the input becomes a compound command (e.g. user just typed the
  // trailing "."), jump straight to the amount field. Skips having to Tab.
  useEffect(() => {
    if (isCompoundPlay) {
      amountInputRef.current?.focus();
      amountInputRef.current?.select();
    }
  }, [isCompoundPlay]);

  const handleAddBet = useCallback((): void => {
    const drawsToPlay = multiLotteryMode && selectedDraws.length > 0
      ? selectedDraws
      : selectedDraw ? [selectedDraw] : [];

    if (!betNumber || !amount || drawsToPlay.length === 0) return;

    // Parse split amount (e.g. "5+2" → straight $5, box $2)
    const amountParts = amount.trim().split('+');
    const isSplitAmount = amountParts.length === 2 && amountParts[1] !== '';
    const numericAmount = isSplitAmount
      ? parseFloat(amountParts[0]) || 0
      : parseFloat(amount) || 0;
    const boxAmount = isSplitAmount ? parseFloat(amountParts[1]) || 0 : 0;

    // Validate amount is not zero
    const totalAmount = isSplitAmount ? numericAmount + boxAmount : numericAmount;
    if (totalAmount <= 0) {
      setBetError('El monto no puede ser 0');
      setTimeout(() => amountInputRef.current?.focus(), 100);
      return;
    }

    // Compound play branch — expands the input into multiple bets and pushes
    // them directly to the matching column, skipping the limit-availability
    // check entirely. The backend validates each generated bet at create time.
    {
      const firstDrawId = drawsToPlay[0].id;
      const allowedForFirst = drawGameTypes.get(firstDrawId) || [];
      const compoundItems = detectCompoundPlay(betNumber, allowedForFirst);
      if (compoundItems) {
        const newDirectBetsC: Bet[] = [];
        const newPaleBetsC: Bet[] = [];
        const newCash3BetsC: Bet[] = [];
        const newPlay4BetsC: Bet[] = [];
        const pushC = (bet: Bet, column: ColumnType) => {
          switch (column) {
            case 'directo': newDirectBetsC.push(bet); break;
            case 'pale':    newPaleBetsC.push(bet); break;
            case 'cash3':   newCash3BetsC.push(bet); break;
            case 'play4':   newPlay4BetsC.push(bet); break;
          }
        };
        let idC = Date.now();
        for (const draw of drawsToPlay) {
          const allowed = drawGameTypes.get(draw.id) || [];
          for (const item of compoundItems) {
            // Per-draw filter: if the draw restricts game types, honor it.
            if (allowed.length > 0 && !allowed.includes(item.gameTypeId)) continue;
            const cfg = GAME_TYPES[item.gameTypeId];
            pushC({
              id: idC++,
              drawName: draw.name,
              drawAbbr: draw.abbreviation || draw.name,
              drawId: draw.id,
              betNumber: item.cleanNumber + item.displaySuffix,
              cleanNumber: item.cleanNumber,
              betAmount: numericAmount,
              selectedBetType: selectedBetType || '',
              gameTypeId: item.gameTypeId,
            }, cfg.column);
          }
        }

        if (newDirectBetsC.length > 0) setDirectBets(prev => [...prev, ...newDirectBetsC]);
        if (newPaleBetsC.length > 0)   setPaleBets(prev => [...prev, ...newPaleBetsC]);
        if (newCash3BetsC.length > 0)  setCash3Bets(prev => [...prev, ...newCash3BetsC]);
        if (newPlay4BetsC.length > 0)  setPlay4Bets(prev => [...prev, ...newPlay4BetsC]);

        // Reserve limit capacity for each generated bet (same flow as a normal
        // add). The backend gates each one individually — compound plays just
        // skip the client-side pre-check, not the server-side reservation.
        if (selectedPool) {
          const allNewCompound = [...newDirectBetsC, ...newPaleBetsC, ...newCash3BetsC, ...newPlay4BetsC];
          allNewCompound.forEach(bet => {
            if (bet.gameTypeId && bet.drawId) {
              const key = `${bet.drawId}-${bet.gameTypeId}`;
              pendingReservationsRef.current.set(key, bet.id);
              reservePlay(bet.drawId, bet.gameTypeId, selectedPool.bettingPoolId, bet.betAmount, bet.cleanNumber || bet.betNumber.replace(/[^0-9]/g, ''));
            }
          });
        }

        setBetError('');
        setBetWarning('');
        setLimitAvailable(null);
        setPlayStats(null);
        setBetNumber('');
        setTimeout(() => betNumberInputRef.current?.focus(), 0);
        return;
      }
    }

    // Wait for the in-flight limit-availability response before allowing the
    // bet down. Otherwise a fast typer could bypass the check.
    if (limitChecking) {
      setBetError('Esperando disponibilidad...');
      setTimeout(() => amountInputRef.current?.focus(), 100);
      return;
    }

    // Validate against limit availability
    if (limitAvailable !== null && limitAvailable !== -1) {
      if (limitAvailable <= 0) {
        setBetError('Límite agotado para este número');
        setTimeout(() => amountInputRef.current?.focus(), 100);
        return;
      }
      if (totalAmount > limitAvailable) {
        setBetError(`Monto excede el límite disponible ($${limitAvailable.toFixed(2)})`);
        setTimeout(() => amountInputRef.current?.focus(), 100);
        return;
      }
    }

    setBetError('');
    setBetWarning('');

    // Partial validation: check each draw independently
    const allowedBets: Array<{ draw: Draw; detection: BetDetectionResult }> = [];
    const blockedNames: string[] = [];

    for (const draw of drawsToPlay) {
      const allowedGameTypes = drawGameTypes.get(draw.id) || [];
      const detection = determineBetType(betNumber, selectedBetType, allowedGameTypes);

      if (!detection) {
        // Unrecognized pattern — block for all draws
        setBetError('Formato de jugada no reconocido');
        setBetNumber('');
        setTimeout(() => betNumberInputRef.current?.focus(), 100);
        return;
      }

      // If draw has no game type restrictions, allow anything
      if (allowedGameTypes.length === 0) {
        allowedBets.push({ draw, detection });
        continue;
      }

      // Check if draw allows this game type
      if (allowedGameTypes.includes(detection.gameTypeId)) {
        allowedBets.push({ draw, detection });
      } else {
        blockedNames.push(draw.abbreviation || draw.name);
      }
    }

    // No draws allow this bet type
    if (allowedBets.length === 0) {
      const firstName = blockedNames[0] || 'esta lotería';
      const detection = determineBetType(betNumber, selectedBetType, []);
      const typeName = detection?.displayName || 'Este tipo';
      setBetError(`${typeName} no permitido en ${firstName}`);
      setBetNumber('');
      setTimeout(() => betNumberInputRef.current?.focus(), 100);
      return;
    }

    // Some draws blocked — show amber warning (auto-clear 3s)
    if (blockedNames.length > 0) {
      setBetWarning(`Excluida de: ${blockedNames.join(', ')}`);
      setTimeout(() => setBetWarning(''), 3000);
    }

    // Create bets only for allowed draws
    const newDirectBets: Bet[] = [];
    const newPaleBets: Bet[] = [];
    const newCash3Bets: Bet[] = [];
    const newPlay4Bets: Bet[] = [];

    const pushBet = (bet: Bet, column: ColumnType) => {
      switch (column) {
        case 'directo': newDirectBets.push(bet); break;
        case 'pale':    newPaleBets.push(bet); break;
        case 'cash3':   newCash3Bets.push(bet); break;
        case 'play4':   newPlay4Bets.push(bet); break;
      }
    };

    let idCounter = Date.now();

    allowedBets.forEach(({ draw, detection }) => {
      const splitPair = SPLIT_PAIRS[detection.gameTypeId];

      if (isSplitAmount && splitPair) {
        // Split: create straight bet + box bet
        const straightCfg = GAME_TYPES[splitPair.straightId];
        const boxCfg = GAME_TYPES[splitPair.boxId];

        const straightBet: Bet = {
          id: idCounter++,
          drawName: draw.name,
          drawAbbr: draw.abbreviation || draw.name,
          drawId: draw.id,
          betNumber: detection.cleanNumber + straightCfg.displaySuffix,
          cleanNumber: detection.cleanNumber,
          betAmount: numericAmount,
          selectedBetType: selectedBetType || '',
          gameTypeId: splitPair.straightId,
          position: detection.position,
        };
        pushBet(straightBet, straightCfg.column);

        const boxBet: Bet = {
          id: idCounter++,
          drawName: draw.name,
          drawAbbr: draw.abbreviation || draw.name,
          drawId: draw.id,
          betNumber: detection.cleanNumber + boxCfg.displaySuffix,
          cleanNumber: detection.cleanNumber,
          betAmount: boxAmount,
          selectedBetType: selectedBetType || '',
          gameTypeId: splitPair.boxId,
          position: detection.position,
        };
        pushBet(boxBet, boxCfg.column);
      } else {
        // Non-split: single bet (if split syntax used on non-eligible type, combine amounts)
        const finalAmount = isSplitAmount ? numericAmount + boxAmount : numericAmount;
        const bet: Bet = {
          id: idCounter++,
          drawName: draw.name,
          drawAbbr: draw.abbreviation || draw.name,
          drawId: draw.id,
          betNumber: detection.cleanNumber + detection.displaySuffix,
          cleanNumber: detection.cleanNumber,
          betAmount: finalAmount,
          selectedBetType: selectedBetType || '',
          gameTypeId: detection.gameTypeId,
          position: detection.position,
        };
        pushBet(bet, detection.column);
      }
    });

    if (newDirectBets.length > 0) setDirectBets(prev => [...prev, ...newDirectBets]);
    if (newPaleBets.length > 0)   setPaleBets(prev => [...prev, ...newPaleBets]);
    if (newCash3Bets.length > 0)  setCash3Bets(prev => [...prev, ...newCash3Bets]);
    if (newPlay4Bets.length > 0)  setPlay4Bets(prev => [...prev, ...newPlay4Bets]);

    // Reserve limit capacity for each new bet
    if (selectedPool) {
      const allNewBets = [...newDirectBets, ...newPaleBets, ...newCash3Bets, ...newPlay4Bets];
      allNewBets.forEach(bet => {
        if (bet.gameTypeId && bet.drawId) {
          // Track which betId is waiting for this reservation
          const key = `${bet.drawId}-${bet.gameTypeId}`;
          pendingReservationsRef.current.set(key, bet.id);
          reservePlay(bet.drawId, bet.gameTypeId, selectedPool.bettingPoolId, bet.betAmount, bet.cleanNumber || bet.betNumber.replace(/[^0-9]/g, ''));
        }
      });
    }

    // Reset limit display and play stats
    setLimitAvailable(null);
    setPlayStats(null);
    setBetNumber('');
    setTimeout(() => betNumberInputRef.current?.focus(), 0);
  }, [multiLotteryMode, selectedDraws, selectedDraw, betNumber, amount, selectedBetType, drawGameTypes, determineBetType, detectCompoundPlay, allowSplitAmount, selectedPool, reservePlay, limitAvailable, limitChecking]);

  /**
   * Convert existing Quiniela/Palé/Tripleta plays into new combinations with a
   * single shared amount. Triggered from the "Convertir jugadas" modal.
   * Bets are added on top of existing ones — nothing is removed.
   */
  const handleConvertPlays = useCallback((result: {
    target: 'directo' | 'pale' | 'tripleta';
    gameTypeId: number;
    amount: number;
    combos: string[];
  }): void => {
    if (!selectedDraw || result.combos.length === 0 || result.amount <= 0) return;

    const draw = selectedDraw;
    const cfg = GAME_TYPES[result.gameTypeId];
    if (!cfg) return;

    const newBets: Bet[] = result.combos.map((clean, idx) => ({
      id: Date.now() + idx,
      drawName: draw.name,
      drawAbbr: draw.abbreviation || draw.name,
      drawId: draw.id,
      betNumber: clean + cfg.displaySuffix,
      cleanNumber: clean,
      betAmount: result.amount,
      selectedBetType: '',
      gameTypeId: result.gameTypeId,
    }));

    switch (cfg.column) {
      case 'directo': setDirectBets(prev => [...prev, ...newBets]); break;
      case 'pale':    setPaleBets(prev => [...prev, ...newBets]); break;
      case 'cash3':   setCash3Bets(prev => [...prev, ...newBets]); break;
      case 'play4':   setPlay4Bets(prev => [...prev, ...newBets]); break;
    }

    // Reserve capacity for each generated bet (same flow as a normal add)
    if (selectedPool) {
      newBets.forEach(bet => {
        if (bet.gameTypeId && bet.drawId) {
          const key = `${bet.drawId}-${bet.gameTypeId}`;
          pendingReservationsRef.current.set(key, bet.id);
          reservePlay(bet.drawId, bet.gameTypeId, selectedPool.bettingPoolId, bet.betAmount, bet.cleanNumber);
        }
      });
    }

    setTimeout(() => betNumberInputRef.current?.focus(), 0);
  }, [selectedDraw, selectedPool, reservePlay]);

  // Release reservations for a bet
  const releaseBetReservation = useCallback((bet: Bet): void => {
    const resId = reservationMapRef.current.get(bet.id);
    if (resId) {
      releaseReservation(resId);
      reservationMapRef.current.delete(bet.id);
    }
  }, [releaseReservation]);

  const handleDeleteBet = useCallback((column: ColumnType, id: number): void => {
    // Release reservation before removing
    const allBets = [...directBets, ...paleBets, ...cash3Bets, ...play4Bets];
    const bet = allBets.find(b => b.id === id);
    if (bet) releaseBetReservation(bet);

    switch (column) {
      case 'directo': setDirectBets(prev => prev.filter(bet => bet.id !== id)); break;
      case 'pale': setPaleBets(prev => prev.filter(bet => bet.id !== id)); break;
      case 'cash3': setCash3Bets(prev => prev.filter(bet => bet.id !== id)); break;
      case 'play4': setPlay4Bets(prev => prev.filter(bet => bet.id !== id)); break;
    }

    // Re-check limit after release (small delay for server to process)
    setTimeout(() => recheckLimitRef.current?.(), 300);
  }, [directBets, paleBets, cash3Bets, play4Bets, releaseBetReservation]);

  const handleDeleteAll = useCallback((column: ColumnType): void => {
    // Release all reservations in the column
    const betsMap: Record<string, Bet[]> = { directo: directBets, pale: paleBets, cash3: cash3Bets, play4: play4Bets };
    (betsMap[column] || []).forEach(bet => releaseBetReservation(bet));

    switch (column) {
      case 'directo': setDirectBets([]); break;
      case 'pale': setPaleBets([]); break;
      case 'cash3': setCash3Bets([]); break;
      case 'play4': setPlay4Bets([]); break;
    }

    // Re-check limit after release
    setTimeout(() => recheckLimitRef.current?.(), 300);
  }, [directBets, paleBets, cash3Bets, play4Bets, releaseBetReservation]);

  // getBetTypeId now uses stored gameTypeId from detection, with fallback
  const getBetTypeId = useCallback((bet: Bet): number => {
    if (bet.gameTypeId) return bet.gameTypeId;
    // Fallback for legacy bets without gameTypeId
    const digits = bet.betNumber.replace(/[^0-9]/g, '');
    const numLength = digits.length;
    if (numLength === 2) return 1;
    if (numLength === 4) return 2;
    if (numLength === 6) return 3;
    if (numLength === 3) return 4;
    if (numLength >= 5) return 10;
    return 1;
  }, []);

  const handleCreateTicket = useCallback(async (): Promise<void> => {
    const allBets: Bet[] = [...directBets, ...paleBets, ...cash3Bets, ...play4Bets];

    if (allBets.length === 0) {
      alert('Debe agregar al menos una jugada');
      return;
    }

    if (!selectedPool) {
      alert('Debe seleccionar una banca');
      return;
    }

    setCreatingTicket(true);
    try {
      const ticketPayload: Record<string, unknown> = {
        bettingPoolId: selectedPool.bettingPoolId,
        userId: parseInt(getCurrentUser()?.id || '1', 10),
        lines: allBets.map((bet) => {
          const line: Record<string, unknown> = {
            drawId: bet.drawId,
            betNumber: bet.cleanNumber || bet.betNumber.replace(/[^0-9]/g, ''),
            betTypeId: getBetTypeId(bet),
            betAmount: bet.betAmount,
            multiplier: 1.00,
            isLuckyPick: false,
          };
          if (bet.position != null) {
            line.position = bet.position;
          }
          return line;
        }),
        globalMultiplier: 1.00,
        applyDiscount: discountActive
      };

      // Attach date overrides when a non-today mode is active
      if (effectiveTicketDate) {
        ticketPayload.ticketDate = effectiveTicketDate;
        if (ticketDateMode === 'previousDay') {
          ticketPayload.allowPastDate = true;
        }
      }

      const response = await api.post('/tickets', ticketPayload) as TicketData;

      setDirectBets([]);
      setPaleBets([]);
      setCash3Bets([]);
      setPlay4Bets([]);
      setMultiLotteryMode(false);
      // Clear reservations — server releases them on ticket save
      reservationMapRef.current.clear();
      pendingReservationsRef.current.clear();
      setLimitAvailable(null);
      setPlayStats(null);
      setSuccessMessage(`Ticket creado: ${response.ticketCode || 'OK'}`);
    } catch (error: unknown) {
      console.error('Error creating ticket:', error);
      // Check for limit exceeded response
      const err = error as { response?: { data?: { code?: string; invalidBets?: Array<{ betNumber?: string; drawName?: string }> } } };
      if (err?.response?.data?.code === 'ticket/invalid-bets-exceed-limits') {
        const bets = err.response.data.invalidBets || [];
        const details = bets.map(b => `${b.betNumber || ''} (${b.drawName || ''})`).join(', ');
        setBetError(`Límite excedido: ${details || 'una o más jugadas exceden el límite disponible'}`);
      } else {
        setBetError('Error al crear el ticket');
      }
    } finally {
      setCreatingTicket(false);
    }
  }, [directBets, paleBets, cash3Bets, play4Bets, selectedPool, discountActive, getBetTypeId, effectiveTicketDate, ticketDateMode]);

  // Check limit availability when user leaves number input
  const handleBetNumberBlur = useCallback((): void => {
    if (!betNumber.trim() || !selectedPool) {
      setLimitAvailable(null);
      setPlayStats(null);
      return;
    }

    // Compound plays don't check limits — the backend validates each generated
    // bet individually at create time. The UI shows "X" in the middle field.
    const allowedGameTypesEarly = selectedDraw ? (drawGameTypes.get(selectedDraw.id) || []) : [];
    if (detectCompoundPlay(betNumber, allowedGameTypesEarly)) {
      setLimitAvailable(null);
      setPlayStats(null);
      return;
    }

    const drawsToCheck = multiLotteryMode && selectedDraws.length > 0
      ? selectedDraws
      : selectedDraw ? [selectedDraw] : [];

    if (drawsToCheck.length === 0) {
      setLimitAvailable(null);
      setPlayStats(null);
      return;
    }

    // Detect game type from the input
    const allowedGameTypes = selectedDraw ? (drawGameTypes.get(selectedDraw.id) || []) : [];
    const detection = determineBetType(betNumber, selectedBetType, allowedGameTypes);
    if (!detection) {
      setLimitAvailable(null);
      setPlayStats(null);
      return;
    }

    // Reset and check each draw
    setLimitAvailable(null);
    setPlayStats(null);
    setLimitChecking(true);
    const firstDraw = drawsToCheck[0];
    for (const draw of drawsToCheck) {
      checkPlayLimit(betNumber.trim(), detection.gameTypeId, draw.id, selectedPool.bettingPoolId);
    }
    // Get play stats for the first draw
    getPlayStats(betNumber.trim(), detection.gameTypeId, firstDraw.id, selectedPool.bettingPoolId);
  }, [betNumber, selectedPool, multiLotteryMode, selectedDraws, selectedDraw, selectedBetType, drawGameTypes, determineBetType, detectCompoundPlay, checkPlayLimit, getPlayStats]);

  // Clear warnings/errors and stale limit-check status when bet number changes
  useEffect(() => {
    setBetWarning('');
    setBetError('');
    setLimitChecking(false);
  }, [betNumber]);

  // Keep ref in sync for use by delete handlers
  recheckLimitRef.current = handleBetNumberBlur;

  const handlePoolChange = useCallback((pool: BettingPool | null): void => {
    setSelectedPool(pool);
    // Clear all bets and inputs when switching banca
    setDirectBets([]);
    setPaleBets([]);
    setCash3Bets([]);
    setPlay4Bets([]);
    setBetNumber('');
    setAmount('');
    setBetError('');
    setBetWarning('');
    setSelectedBetType('');
    setMultiLotteryMode(false);
    setTicketDateMode('today');
    setSelectedFutureDate('');
    // Release all reservations and clear map
    reservationMapRef.current.forEach(resId => releaseReservation(resId));
    reservationMapRef.current.clear();
    pendingReservationsRef.current.clear();
    setLimitAvailable(null);
    setPlayStats(null);
  }, [releaseReservation]);

  const handleDuplicate = useCallback((): void => {
    alert('Función de duplicar pendiente de implementar');
  }, []);

  const handleBetNumberKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      amountInputRef.current?.focus();
    } else if (e.key === '*') {
      e.preventDefault();
      handleCreateTicket();
    }
  }, [handleCreateTicket]);

  const handleAmountKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddBet();
    } else if (e.key === '*') {
      e.preventDefault();
      handleCreateTicket();
    }
  }, [handleAddBet, handleCreateTicket]);

  return {
    betNumberInputRef,
    amountInputRef,
    selectedPool,
    pools,
    setSelectedPool: handlePoolChange,
    selectedDraw,
    selectedDraws,
    draws: drawsWithClosingInfo,
    loadingDraws,
    loadingAllowedDraws,
    allowedDrawIds,
    dailyBets,
    soldInGroup,
    soldInPool,
    discountActive,
    multiLotteryMode,
    setDiscountActive,
    setMultiLotteryMode,
    betNumber,
    amount,
    selectedBetType,
    betError,
    betWarning,
    setBetNumber,
    setAmount,
    setSelectedBetType,
    directBets,
    paleBets,
    cash3Bets,
    play4Bets,
    helpModalOpen,
    ticketModalOpen,
    ticketData,
    successMessage,
    setHelpModalOpen,
    setTicketModalOpen,
    setTicketData,
    setSuccessMessage,
    ticketDateMode,
    selectedFutureDate,
    effectiveTicketDate,
    handleTogglePreviousDay,
    handleToggleFutureDate,
    handleFutureDateChange,
    visibleColumns,
    bgColor,
    directTotal,
    paleTotal,
    cash3Total,
    play4Total,
    grandTotal,
    totalBets,
    handleDrawClick,
    handleAddBet,
    handleDeleteBet,
    handleDeleteAll,
    handleCreateTicket,
    handleDuplicate,
    handleBetNumberKeyDown,
    handleAmountKeyDown,
    creatingTicket,
    cancelMinutes,
    allowSplitAmount,
    limitAvailable,
    limitChecking,
    signalRConnected,
    handleBetNumberBlur,
    playStats,
    isCompoundPlay,
    // Convert plays modal
    convertModalOpen,
    setConvertModalOpen,
    handleConvertPlays,
    selectedDrawGameTypes,
  };
};

export default useCreateTicketsState;
