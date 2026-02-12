/**
 * useCreateTicketsState Hook
 *
 * Manages all state and logic for the CreateTickets component.
 * Extracted from index.tsx for better maintainability.
 */

import { useState, useEffect, useRef, useMemo, useCallback, type RefObject, type KeyboardEvent } from 'react';
import api from '@services/api';
import { getCurrentUser } from '@services/authService';
import type {
  BettingPool, Draw, Bet, ColumnType, VisibleColumns,
  BettingPoolDrawResponse, DrawApiResponse, TicketData
} from '../types';

interface UseCreateTicketsStateReturn {
  // Refs
  betNumberInputRef: RefObject<HTMLInputElement>;

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

  // Handlers
  handleDrawClick: (draw: Draw) => void;
  handleAddBet: () => void;
  handleDeleteBet: (column: ColumnType, id: number) => void;
  handleDeleteAll: (column: ColumnType) => void;
  handleCreateTicket: () => Promise<void>;
  handleDuplicate: () => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export const useCreateTicketsState = (): UseCreateTicketsStateReturn => {
  // Refs
  const betNumberInputRef = useRef<HTMLInputElement>(null);

  // Pool state
  const [selectedPool, setSelectedPool] = useState<BettingPool | null>(null);
  const [pools, setPools] = useState<BettingPool[]>([]);

  // Draw state
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedDraws, setSelectedDraws] = useState<Draw[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loadingDraws, setLoadingDraws] = useState<boolean>(true);
  const [allowedDrawIds, setAllowedDrawIds] = useState<Set<number>>(new Set());
  const [loadingAllowedDraws, setLoadingAllowedDraws] = useState<boolean>(false);
  const [drawGameTypes, setDrawGameTypes] = useState<Map<number, number[]>>(new Map());
  const [drawClosingTimes, setDrawClosingTimes] = useState<Map<number, string>>(new Map());

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
  useEffect(() => {
    const loadAllowedDraws = async () => {
      if (!selectedPool) {
        setAllowedDrawIds(new Set());
        setDrawGameTypes(new Map());
        setDrawClosingTimes(new Map());
        return;
      }

      setLoadingAllowedDraws(true);
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

        // Store closing times per draw
        const closingMap = new Map<number, string>();
        activeDraws.forEach((d) => {
          if (d.drawTime) {
            closingMap.set(d.drawId, d.drawTime);
          }
        });
        setDrawClosingTimes(closingMap);

        setSelectedDraw(null);
        setSelectedDraws([]);
      } catch (error) {
        console.error('Error loading allowed draws:', error);
        setAllowedDrawIds(new Set());
        setDrawGameTypes(new Map());
        setDrawClosingTimes(new Map());
      } finally {
        setLoadingAllowedDraws(false);
      }
    };
    loadAllowedDraws();
  }, [selectedPool?.bettingPoolId]);

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

  // Merge closing times into draws - mark as disabled if draw already closed
  const drawsWithClosingInfo = useMemo(() => {
    if (drawClosingTimes.size === 0) return draws;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return draws.map(draw => {
      const closing = drawClosingTimes.get(draw.id);
      if (!closing) return draw;
      // Parse "HH:mm:ss" closing time
      const parts = closing.split(':');
      const closingMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      const isClosed = currentMinutes >= closingMinutes;
      return { ...draw, closingTime: closing, disabled: draw.disabled || isClosed };
    });
  }, [draws, drawClosingTimes]);

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
      directo: gameTypesArray.some(gt => gt === 1 || gt === 21),
      pale: gameTypesArray.some(gt => gt === 2 || gt === 3 || gt === 14),
      cash3: gameTypesArray.some(gt => gt >= 4 && gt <= 9),
      play4: gameTypesArray.some(gt => (gt >= 10 && gt <= 13) || (gt >= 15 && gt <= 20)),
    };
  }, [selectedDraw?.id, selectedDraws, multiLotteryMode, drawGameTypes]);

  const bgColor = useMemo(() => {
    return selectedDraw?.color ? `${selectedDraw.color}30` : '#c8e6c9';
  }, [selectedDraw?.color]);

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

  const handleAddBet = useCallback((): void => {
    const drawsToPlay = multiLotteryMode && selectedDraws.length > 0
      ? selectedDraws
      : selectedDraw ? [selectedDraw] : [];

    if (!betNumber || !amount || drawsToPlay.length === 0) return;

    const trimmed = betNumber.trim();
    const numLength = trimmed.replace(/[^0-9]/g, '').length;
    const numericAmount = parseFloat(amount) || 0;
    // Detect suffixes: Cash3 Box (123b/123+), Pick4 Straight (1234-), Pick4 Box (1234+)
    const isCash3Box = numLength === 3 && /^\d{3}[bB+]$/.test(trimmed);
    const isPick4Straight = numLength === 4 && /^\d{4}-$/.test(trimmed);
    const isPick4Box = numLength === 4 && /^\d{4}[+bB]$/.test(trimmed);
    const isPick4 = isPick4Straight || isPick4Box
      || selectedBetType?.includes('play4') || selectedBetType === 'pick5'
      || numLength >= 5;

    // Validate bet type for selected draws
    let betTypeName = '';
    let isAllowed = true;

    for (const draw of drawsToPlay) {
      const allowedGameTypes = drawGameTypes.get(draw.id) || [];
      if (allowedGameTypes.length === 0) continue;

      if (selectedBetType === 'directo' || numLength === 2) {
        if (!allowedGameTypes.includes(1) && !allowedGameTypes.includes(21)) {
          betTypeName = 'Directo';
          isAllowed = false;
          break;
        }
      } else if (isPick4) {
        const hasPlay4 = allowedGameTypes.some(gt => (gt >= 10 && gt <= 13) || (gt >= 15 && gt <= 20));
        if (!hasPlay4) {
          betTypeName = 'Play 4 / Pick 5';
          isAllowed = false;
          break;
        }
      } else if (selectedBetType === 'pale' || numLength === 4) {
        if (!allowedGameTypes.includes(2)) {
          betTypeName = 'Palé';
          isAllowed = false;
          break;
        }
      } else if (selectedBetType === 'tripleta' || numLength === 6) {
        if (!allowedGameTypes.includes(3)) {
          betTypeName = 'Tripleta';
          isAllowed = false;
          break;
        }
      } else if (selectedBetType?.includes('cash3') || numLength === 3) {
        const hasCash3 = allowedGameTypes.some(gt => gt >= 4 && gt <= 9);
        if (!hasCash3) {
          betTypeName = 'Cash 3';
          isAllowed = false;
          break;
        }
      }
    }

    if (!isAllowed) {
      const drawName = drawsToPlay.find(d => (drawGameTypes.get(d.id) || []).length > 0)?.name || 'esta lotería';
      setBetError(`${betTypeName} no permitido en ${drawName}`);
      setBetNumber('');
      setAmount('');
      setTimeout(() => betNumberInputRef.current?.focus(), 100);
      return;
    }

    setBetError('');

    // Clean bet number and add display suffix
    const cleanBetNumber = trimmed.replace(/[^0-9]/g, '');
    let displaySuffix = '';
    if (numLength === 3) {
      displaySuffix = isCash3Box ? 'b' : 's';
    } else if (isPick4Straight) {
      displaySuffix = 's';
    } else if (isPick4Box) {
      displaySuffix = 'b';
    }

    const newBets = drawsToPlay.map((draw, index) => ({
      id: Date.now() + index,
      drawName: draw.name,
      drawAbbr: draw.abbreviation || draw.name,
      drawId: draw.id,
      betNumber: cleanBetNumber + displaySuffix,
      betAmount: numericAmount,
      selectedBetType: selectedBetType || '',
    }));

    // Add to appropriate column based on bet type
    if (selectedBetType === 'directo' || numLength === 2) {
      setDirectBets(prev => [...prev, ...newBets]);
    } else if (isPick4) {
      setPlay4Bets(prev => [...prev, ...newBets]);
    } else if (selectedBetType === 'pale' || selectedBetType === 'tripleta' || numLength === 4 || numLength === 6) {
      setPaleBets(prev => [...prev, ...newBets]);
    } else if (selectedBetType?.includes('cash3') || numLength === 3) {
      setCash3Bets(prev => [...prev, ...newBets]);
    } else {
      setDirectBets(prev => [...prev, ...newBets]);
    }

    setBetNumber('');
    setAmount('');
    setTimeout(() => betNumberInputRef.current?.focus(), 0);
  }, [multiLotteryMode, selectedDraws, selectedDraw, betNumber, amount, selectedBetType, drawGameTypes]);

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

  const getBetTypeId = useCallback((betNum: string): number => {
    const digits = betNum.replace(/[^0-9]/g, '');
    const numLength = digits.length;
    // Suffix-based detection: s=straight, b=box
    const suffix = betNum.match(/[sb]$/)?.[0];
    // Cash3: 3 digits
    if (numLength === 3 && suffix === 'b') return 5;  // CASH3_BOX
    if (numLength === 3 && suffix === 's') return 4;  // CASH3_STRAIGHT
    // Pick4: 4 digits with suffix
    if (numLength === 4 && suffix === 's') return 10; // PLAY4_STRAIGHT
    if (numLength === 4 && suffix === 'b') return 11; // PLAY4_BOX
    // Length-based defaults
    if (numLength === 2) return 1;   // DIRECTO
    if (numLength === 4) return 2;   // PALE
    if (numLength === 6) return 3;   // TRIPLETA
    if (numLength === 3) return 4;   // CASH3_STRAIGHT
    if (numLength >= 5) return 10;   // PLAY4_STRAIGHT
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

    try {
      const ticketPayload = {
        bettingPoolId: selectedPool.bettingPoolId,
        userId: parseInt(getCurrentUser()?.id || '1', 10),
        lines: allBets.map((bet) => ({
          drawId: bet.drawId,
          betNumber: bet.betNumber.replace(/[^0-9]/g, ''),
          betTypeId: getBetTypeId(bet.betNumber),
          betAmount: bet.betAmount,
          multiplier: 1.00,
          isLuckyPick: false
        })),
        globalMultiplier: 1.00,
        globalDiscount: discountActive ? 0.00 : 0.00
      };

      const response = await api.post('/tickets', ticketPayload) as TicketData;

      setDirectBets([]);
      setPaleBets([]);
      setCash3Bets([]);
      setPlay4Bets([]);
      setSuccessMessage(`Ticket creado: ${response.ticketCode || 'OK'}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error al crear el ticket');
    }
  }, [directBets, paleBets, cash3Bets, play4Bets, selectedPool, discountActive, getBetTypeId]);

  const handleDuplicate = useCallback((): void => {
    alert('Función de duplicar pendiente de implementar');
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddBet();
    }
  }, [handleAddBet]);

  return {
    betNumberInputRef,
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
    handleKeyDown,
  };
};

export default useCreateTicketsState;
