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

  // Load betting pools on mount
  useEffect(() => {
    const loadPools = async () => {
      try {
        const response = await api.get('/betting-pools') as { items?: BettingPool[] } | BettingPool[];
        const poolList: BettingPool[] = Array.isArray(response) ? response : (response.items || []);
        setPools(poolList);
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
      directo: gameTypesArray.some(gt => gt === 1 || gt === 19 || gt === 20 || gt === 21) || directBets.length > 0,
      pale: gameTypesArray.some(gt => gt === 2 || gt === 3 || gt === 14) || paleBets.length > 0,
      cash3: gameTypesArray.some(gt => gt >= 4 && gt <= 9) || cash3Bets.length > 0,
      play4: gameTypesArray.some(gt => (gt >= 10 && gt <= 13) || (gt >= 15 && gt <= 18)) || play4Bets.length > 0,
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
      return {
        gameTypeId: gtId,
        cleanNumber: clean,
        displaySuffix: cfg.displaySuffix,
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

    // 4. Pick2 Middle: 2digits-3 (e.g. 12-3)
    match = trimmed.match(/^(\d{2})-3$/);
    if (match) return buildResult(18, match[1]);

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

    // 14. Pick5 Box: 5digits+ (e.g. 12345+)
    match = trimmed.match(/^(\d{5})\+$/);
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

    setBetNumber('');
    setTimeout(() => betNumberInputRef.current?.focus(), 0);
  }, [multiLotteryMode, selectedDraws, selectedDraw, betNumber, amount, selectedBetType, drawGameTypes, determineBetType, allowSplitAmount]);

  const handleDeleteBet = useCallback((column: ColumnType, id: number): void => {
    switch (column) {
      case 'directo': setDirectBets(prev => prev.filter(bet => bet.id !== id)); break;
      case 'pale': setPaleBets(prev => prev.filter(bet => bet.id !== id)); break;
      case 'cash3': setCash3Bets(prev => prev.filter(bet => bet.id !== id)); break;
      case 'play4': setPlay4Bets(prev => prev.filter(bet => bet.id !== id)); break;
    }
  }, []);

  const handleDeleteAll = useCallback((column: ColumnType): void => {
    switch (column) {
      case 'directo': setDirectBets([]); break;
      case 'pale': setPaleBets([]); break;
      case 'cash3': setCash3Bets([]); break;
      case 'play4': setPlay4Bets([]); break;
    }
  }, []);

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
            betNumber: bet.betNumber.replace(/[^0-9]/g, ''),
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
      setSuccessMessage(`Ticket creado: ${response.ticketCode || 'OK'}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error al crear el ticket');
    } finally {
      setCreatingTicket(false);
    }
  }, [directBets, paleBets, cash3Bets, play4Bets, selectedPool, discountActive, getBetTypeId, effectiveTicketDate, ticketDateMode]);

  const handleDuplicate = useCallback((): void => {
    alert('Función de duplicar pendiente de implementar');
  }, []);

  const handleBetNumberKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      amountInputRef.current?.focus();
    }
  }, []);

  const handleAmountKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddBet();
    }
  }, [handleAddBet]);

  return {
    betNumberInputRef,
    amountInputRef,
    selectedPool,
    pools,
    setSelectedPool,
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
  };
};

export default useCreateTicketsState;
