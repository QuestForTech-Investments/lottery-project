import React, { useState, useEffect, useRef, memo, useMemo, type KeyboardEvent } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl,
  Typography, Paper, Switch, IconButton, Autocomplete,
  CircularProgress, Dialog, DialogContent, Snackbar, Alert
} from '@mui/material';
import { Trash2, Dices } from 'lucide-react';
import api from '@services/api';
import { getCurrentUser } from '@services/authService';
import HelpModal from './HelpModal';
import TicketPrinter from '../TicketPrinter';

// ============= INTERFACES =============

interface BettingPool {
  bettingPoolId: number;
  bettingPoolCode: string;
  bettingPoolName: string;
}

interface Draw {
  id: number;
  name: string;
  abbreviation?: string;
  color: string;
  disabled: boolean;
  lotteryId?: number;
  imageUrl?: string;
  availableGameTypes?: number[]; // Game types allowed for this draw
}

interface Bet {
  id: number;
  drawName: string;
  drawAbbr?: string;
  drawId: number;
  betNumber: string;
  betAmount: number;
  betType?: { name: string };
}

interface BetType {
  id: string;
  name: string;
}

interface TicketLine {
  lineId: number;
  lotteryName: string;
  drawName: string;
  betNumber: string;
  betTypeName: string;
  betAmount: number;
  netAmount: number;
}

interface TicketData {
  ticketId: number;
  ticketCode: string;
  barcode: string;
  status: string;
  bettingPoolId: number;
  bettingPoolName: string;
  userName: string;
  createdAt: string;
  totalBetAmount: number;
  totalCommission: number;
  grandTotal: number;
  lines: TicketLine[];
}

type ColumnType = 'directo' | 'pale' | 'cash3' | 'play4';

// ============= UTILITY FUNCTIONS =============

/**
 * Formatea un número de apuesta con guiones separando cada 2 dígitos
 * Ejemplos:
 * - "23" -> "23" (directo)
 * - "2321" -> "23-21" (palé)
 * - "224466" -> "22-44-66" (tripleta)
 * - "123" -> "123" (cash3 - 3 dígitos no se separan)
 */
const formatBetNumber = (number: string): string => {
  if (!number) return '';

  // Limpiar el número (solo dígitos)
  const cleanNumber = String(number).replace(/[^0-9]/g, '');

  // Si es 3 dígitos (cash3) o menos de 2, no separar
  if (cleanNumber.length <= 3) {
    return cleanNumber;
  }

  // Separar cada 2 dígitos con guiones
  const pairs: string[] = [];
  for (let i = 0; i < cleanNumber.length; i += 2) {
    pairs.push(cleanNumber.slice(i, i + 2));
  }

  return pairs.join('-');
};

// ============= BET CARD COLUMN COMPONENT =============

interface BetCardColumnProps {
  title: string;
  headerColor: string;
  headerBgColor: string;
  bets: Bet[];
  columnType: ColumnType;
  onDeleteBet: (columnType: ColumnType, id: number) => void;
  onDeleteAll: (columnType: ColumnType) => void;
  total: string;
}

const BetCardColumn: React.FC<BetCardColumnProps> = memo(({
  title,
  headerColor,
  headerBgColor,
  bets,
  columnType,
  onDeleteBet,
  onDeleteAll,
  total
}) => (
  <Paper sx={{ flex: 1, overflow: 'hidden' }}>
    <Box sx={{ bgcolor: headerColor, color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold' }}>
      {title}
    </Box>
    <Box sx={{
      bgcolor: headerBgColor,
      display: 'grid',
      gridTemplateColumns: '40% 20% 25% 15%',
      alignItems: 'center',
      fontSize: '11px',
      fontWeight: 'bold',
      borderBottom: '1px solid #ccc',
    }}>
      <Box sx={{ textAlign: 'center' }}>LOT</Box>
      <Box sx={{ textAlign: 'center' }}>NUM</Box>
      <Box sx={{ textAlign: 'center' }}>$</Box>
      <Box sx={{ textAlign: 'center' }}>
        <IconButton size="small" onClick={() => onDeleteAll(columnType)}>
          <Trash2 size={14} />
        </IconButton>
      </Box>
    </Box>
    <Box sx={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', bgcolor: 'white' }}>
      {bets.map((bet) => (
        <Box key={bet.id} sx={{
          display: 'grid',
          gridTemplateColumns: '40% 20% 25% 15%',
          alignItems: 'center',
          py: 0.5,
          borderBottom: '1px solid #eee',
          fontSize: '12px'
        }}>
          <Box sx={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {bet.drawAbbr || bet.drawName}
          </Box>
          <Box sx={{ fontWeight: 'bold', textAlign: 'center' }}>{formatBetNumber(bet.betNumber)}</Box>
          <Box sx={{ textAlign: 'center' }}>${bet.betAmount.toFixed(2)}</Box>
          <Box sx={{ textAlign: 'center' }}>
            <IconButton size="small" onClick={() => onDeleteBet(columnType, bet.id)}>
              <Trash2 size={12} color="#f44336" />
            </IconButton>
          </Box>
        </Box>
      ))}
    </Box>
    <Box sx={{ bgcolor: headerColor, color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
      TOTAL: ${total}
    </Box>
  </Paper>
));

BetCardColumn.displayName = 'BetCardColumn';

// ============= MAIN COMPONENT =============

/**
 * CreateTickets - Exact replica of the original Vue.js application
 * Structure:
 * - Betting pool selector + current draw image
 * - Grid of ~69 lotteries/draws
 * - Stats: Daily bets, Sold in group, Sold in pool
 * - Toggles: Discount, Multi lottery
 * - Fields: Bet, N/A, Amount
 * - 4 columns: Direct, Pale & Tripleta, Cash 3, Play 4 & Pick 5
 * - Buttons: Duplicate, Create ticket, Help
 */
const CreateTickets: React.FC = () => {
  // State for selected betting pool
  const [selectedPool, setSelectedPool] = useState<BettingPool | null>(null);
  const [pools, setPools] = useState<BettingPool[]>([]);

  // State for selected draw (simple mode)
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);

  // State for multiple selected draws (multi lottery mode)
  const [selectedDraws, setSelectedDraws] = useState<Draw[]>([]);

  // State for draws from API
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loadingDraws, setLoadingDraws] = useState<boolean>(true);

  // State for allowed draws per betting pool
  const [allowedDrawIds, setAllowedDrawIds] = useState<Set<number>>(new Set());
  const [loadingAllowedDraws, setLoadingAllowedDraws] = useState<boolean>(false);

  // State for game types per draw (from draw_game_compatibility)
  const [drawGameTypes, setDrawGameTypes] = useState<Map<number, number[]>>(new Map());

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

  // Error state for bet validation
  const [betError, setBetError] = useState<string>('');

  // Bets by column
  const [directBets, setDirectBets] = useState<Bet[]>([]);
  const [paleBets, setPaleBets] = useState<Bet[]>([]);
  const [cash3Bets, setCash3Bets] = useState<Bet[]>([]);
  const [play4Bets, setPlay4Bets] = useState<Bet[]>([]);

  // State for help modal
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

  // State for ticket modal
  const [ticketModalOpen, setTicketModalOpen] = useState<boolean>(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // Success snackbar state
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Ref for bet number input (for keyboard navigation)
  const betNumberInputRef = useRef<HTMLInputElement>(null);

  // Bet types for dropdown
  const betTypes: BetType[] = [
    { id: 'directo', name: 'Directo' },
    { id: 'pale', name: 'Pale' },
    { id: 'tripleta', name: 'Tripleta' },
    { id: 'cash3-straight', name: 'Cash3 Straight' },
    { id: 'cash3-box', name: 'Cash3 Box' },
    { id: 'play4-straight', name: 'Play4 Straight' },
    { id: 'play4-box', name: 'Play4 Box' },
    { id: 'pick5', name: 'Pick 5' },
  ];

  // Load betting pools
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
    // API returns availableGameTypes as an array of objects with gameTypeId
    interface AvailableGameType {
      gameTypeId: number;
      gameTypeCode?: string;
      gameName?: string;
      prizeMultiplier?: number;
      numberLength?: number;
      requiresAdditionalNumber?: boolean;
      displayOrder?: number;
    }

    interface BettingPoolDrawResponse {
      drawId: number;
      isActive: boolean;
      availableGameTypes?: AvailableGameType[];
    }

    const loadAllowedDraws = async () => {
      if (!selectedPool) {
        setAllowedDrawIds(new Set());
        setDrawGameTypes(new Map());
        return;
      }

      setLoadingAllowedDraws(true);
      try {
        const response = await api.get(`/betting-pools/${selectedPool.bettingPoolId}/draws`) as BettingPoolDrawResponse[];
        const activeDraws = (response || []).filter((d: BettingPoolDrawResponse) => d.isActive);
        const drawIds = activeDraws.map((d: BettingPoolDrawResponse) => d.drawId);
        setAllowedDrawIds(new Set(drawIds));

        // Capture game types per draw - extract gameTypeId from objects
        const gameTypesMap = new Map<number, number[]>();
        activeDraws.forEach((d: BettingPoolDrawResponse) => {
          if (d.availableGameTypes && d.availableGameTypes.length > 0) {
            // Extract gameTypeId values from the objects
            const gameTypeIds = d.availableGameTypes.map(gt => gt.gameTypeId);
            gameTypesMap.set(d.drawId, gameTypeIds);
          }
        });
        setDrawGameTypes(gameTypesMap);


        // Clear selected draws when changing betting pool
        setSelectedDraw(null);
        setSelectedDraws([]);
      } catch (error) {
        console.error('Error loading allowed draws:', error);
        // If error, allow all draws (fallback)
        setAllowedDrawIds(new Set());
        setDrawGameTypes(new Map());
      } finally {
        setLoadingAllowedDraws(false);
      }
    };
    loadAllowedDraws();
  }, [selectedPool?.bettingPoolId]);

  // Load draws from API (colors come from database)
  useEffect(() => {
    interface DrawApiResponse {
      drawId: number;
      drawName?: string;
      name?: string;
      abbreviation?: string;
      displayColor?: string;
      lotteryColour?: string;
      isActive?: boolean;
      lotteryId?: number;
      imageUrl?: string;
    }

    const loadDraws = async () => {
      setLoadingDraws(true);
      try {
        const response = await api.get('/draws?pageSize=1000') as { items?: DrawApiResponse[] } | DrawApiResponse[];
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

  // Calculate total for a column (memoized helper)
  const calculateColumnTotal = (bets: Bet[]): string => {
    return bets.reduce((sum, bet) => sum + (bet.betAmount || 0), 0).toFixed(2);
  };

  // Memoized totals per column
  const directTotal = useMemo(() => calculateColumnTotal(directBets), [directBets]);
  const paleTotal = useMemo(() => calculateColumnTotal(paleBets), [paleBets]);
  const cash3Total = useMemo(() => calculateColumnTotal(cash3Bets), [cash3Bets]);
  const play4Total = useMemo(() => calculateColumnTotal(play4Bets), [play4Bets]);

  // Memoized grand total
  const grandTotal = useMemo(() => {
    const total = parseFloat(directTotal) + parseFloat(paleTotal) + parseFloat(cash3Total) + parseFloat(play4Total);
    return total.toFixed(2);
  }, [directTotal, paleTotal, cash3Total, play4Total]);

  // Memoized total bets count
  const totalBets = useMemo(() => {
    return directBets.length + paleBets.length + cash3Bets.length + play4Bets.length;
  }, [directBets.length, paleBets.length, cash3Bets.length, play4Bets.length]);

  // Memoized visible columns based on selected draw's game types
  // Game type mapping:
  // 1 = DIRECTO → "directo" column
  // 2 = PALE, 3 = TRIPLETA, 14 = SUPER_PALE → "pale" column
  // 4-9 = CASH3 variants → "cash3" column
  // 10-13, 15-20 = PLAY4, PICK5, PICK2 variants → "play4" column
  // 21 = PANAMA → "directo" column (2-digit like DIRECTO)
  const visibleColumns = useMemo(() => {
    // Get game types for selected draw(s)
    const getGameTypesForDraw = (drawId: number): number[] => {
      return drawGameTypes.get(drawId) || [];
    };

    // If no draw selected, show all columns
    if (!selectedDraw) {
      return { directo: true, pale: true, cash3: true, play4: true };
    }

    // In multi-lottery mode, use union of all selected draws' game types
    const allGameTypes = new Set<number>();
    if (multiLotteryMode && selectedDraws.length > 0) {
      selectedDraws.forEach(draw => {
        getGameTypesForDraw(draw.id).forEach(gt => allGameTypes.add(gt));
      });
    } else {
      getGameTypesForDraw(selectedDraw.id).forEach(gt => allGameTypes.add(gt));
    }

    // If no game types configured (fallback), show all columns
    if (allGameTypes.size === 0) {
      return { directo: true, pale: true, cash3: true, play4: true };
    }

    // Determine which columns to show
    const gameTypesArray = Array.from(allGameTypes);
    return {
      directo: gameTypesArray.some(gt => gt === 1 || gt === 21), // DIRECTO or PANAMA
      pale: gameTypesArray.some(gt => gt === 2 || gt === 3 || gt === 14), // PALE, TRIPLETA, SUPER_PALE
      cash3: gameTypesArray.some(gt => gt >= 4 && gt <= 9), // CASH3 variants
      play4: gameTypesArray.some(gt => (gt >= 10 && gt <= 13) || (gt >= 15 && gt <= 20)), // PLAY4, PICK5, PICK2 variants
    };
  }, [selectedDraw?.id, selectedDraws, multiLotteryMode, drawGameTypes]);

  // Memoized background color
  const bgColor = useMemo(() => {
    return selectedDraw?.color
      ? `${selectedDraw.color}30`
      : '#c8e6c9';
  }, [selectedDraw?.color]);

  // Handle draw selection - requires betting pool selected
  const handleDrawClick = (draw: Draw): void => {
    if (!selectedPool) return;
    if (draw.disabled) return;

    if (multiLotteryMode) {
      const isAlreadySelected = selectedDraws.some(s => s.id === draw.id);
      if (isAlreadySelected) {
        setSelectedDraws(selectedDraws.filter(s => s.id !== draw.id));
      } else {
        setSelectedDraws([...selectedDraws, draw]);
      }
      if (!selectedDraw || selectedDraws.length === 0) {
        setSelectedDraw(draw);
      }
    } else {
      setSelectedDraw(draw);
      setSelectedDraws([draw]);
    }
  };

  // Add bet - supports multiple draws when multi lottery mode is active
  const handleAddBet = (): void => {
    const drawsToPlay = multiLotteryMode && selectedDraws.length > 0
      ? selectedDraws
      : selectedDraw ? [selectedDraw] : [];

    if (!betNumber || !amount || drawsToPlay.length === 0) return;

    const numLength = betNumber.replace(/[^0-9]/g, '').length;
    const numericAmount = parseFloat(amount) || 0;

    // Determine bet type based on number length
    // Game type mapping:
    // 1 = DIRECTO (2 digits), 21 = PANAMA (2 digits)
    // 2 = PALE (4 digits), 3 = TRIPLETA (6 digits), 14 = SUPER_PALE
    // 4-9 = CASH3 variants (3 digits)
    // 10-13, 15-20 = PLAY4, PICK5, PICK2 variants (4+ digits)
    let betTypeName = '';
    let isAllowed = true;

    // Check if bet type is allowed for selected draw(s)
    for (const draw of drawsToPlay) {
      const allowedGameTypes = drawGameTypes.get(draw.id) || [];

      // If no game types configured, allow all (fallback)
      if (allowedGameTypes.length === 0) continue;

      if (selectedBetType === 'directo' || numLength === 2) {
        // DIRECTO needs game type 1 or 21 (PANAMA)
        if (!allowedGameTypes.includes(1) && !allowedGameTypes.includes(21)) {
          betTypeName = 'Directo';
          isAllowed = false;
          break;
        }
      } else if (selectedBetType === 'pale' || numLength === 4) {
        // PALE needs game type 2
        if (!allowedGameTypes.includes(2)) {
          betTypeName = 'Palé';
          isAllowed = false;
          break;
        }
      } else if (selectedBetType === 'tripleta' || numLength === 6) {
        // TRIPLETA needs game type 3
        if (!allowedGameTypes.includes(3)) {
          betTypeName = 'Tripleta';
          isAllowed = false;
          break;
        }
      } else if (selectedBetType?.includes('cash3') || numLength === 3) {
        // CASH3 needs game types 4-9
        const hasCash3 = allowedGameTypes.some(gt => gt >= 4 && gt <= 9);
        if (!hasCash3) {
          betTypeName = 'Cash 3';
          isAllowed = false;
          break;
        }
      } else if (selectedBetType?.includes('play4') || selectedBetType === 'pick5' || numLength >= 5) {
        // PLAY4/PICK5 needs game types 10-13 or 15-20
        const hasPlay4 = allowedGameTypes.some(gt => (gt >= 10 && gt <= 13) || (gt >= 15 && gt <= 20));
        if (!hasPlay4) {
          betTypeName = 'Play 4 / Pick 5';
          isAllowed = false;
          break;
        }
      }
    }

    // If bet type not allowed, show error, clear inputs and refocus
    if (!isAllowed) {
      const drawName = drawsToPlay.find(d => {
        const gt = drawGameTypes.get(d.id) || [];
        return gt.length > 0;
      })?.name || 'esta lotería';
      setBetError(`${betTypeName} no permitido en ${drawName}`);
      // Clear inputs
      setBetNumber('');
      setAmount('');
      // Refocus on JUGADA input
      setTimeout(() => {
        if (betNumberInputRef.current) {
          betNumberInputRef.current.focus();
        }
      }, 100);
      return;
    }

    // Clear any previous error
    setBetError('');

    const newBets = drawsToPlay.map((draw, index) => ({
      id: Date.now() + index,
      drawName: draw.name,
      drawAbbr: draw.abbreviation || draw.name,
      drawId: draw.id,
      betNumber: betNumber,
      betAmount: numericAmount,
    }));

    if (selectedBetType === 'directo' || numLength === 2) {
      setDirectBets([...directBets, ...newBets]);
    } else if (selectedBetType === 'pale' || selectedBetType === 'tripleta' || numLength === 4 || numLength === 6) {
      setPaleBets([...paleBets, ...newBets]);
    } else if (selectedBetType?.includes('cash3') || numLength === 3) {
      setCash3Bets([...cash3Bets, ...newBets]);
    } else if (selectedBetType?.includes('play4') || selectedBetType === 'pick5' || numLength >= 4) {
      setPlay4Bets([...play4Bets, ...newBets]);
    } else {
      setDirectBets([...directBets, ...newBets]);
    }

    setBetNumber('');
    setAmount('');

    setTimeout(() => {
      if (betNumberInputRef.current) {
        betNumberInputRef.current.focus();
      }
    }, 0);
  };

  // Delete bet
  const handleDeleteBet = (column: ColumnType, id: number): void => {
    switch (column) {
      case 'directo':
        setDirectBets(directBets.filter(bet => bet.id !== id));
        break;
      case 'pale':
        setPaleBets(paleBets.filter(bet => bet.id !== id));
        break;
      case 'cash3':
        setCash3Bets(cash3Bets.filter(bet => bet.id !== id));
        break;
      case 'play4':
        setPlay4Bets(play4Bets.filter(bet => bet.id !== id));
        break;
    }
  };

  // Delete all bets from a column
  const handleDeleteAll = (column: ColumnType): void => {
    switch (column) {
      case 'directo':
        setDirectBets([]);
        break;
      case 'pale':
        setPaleBets([]);
        break;
      case 'cash3':
        setCash3Bets([]);
        break;
      case 'play4':
        setPlay4Bets([]);
        break;
    }
  };

  // Determine bet type ID based on number length
  const getBetTypeId = (betNumber: string): number => {
    const numLength = betNumber.replace(/[^0-9]/g, '').length;
    if (numLength === 2) return 1; // Directo
    if (numLength === 4) return 2; // Pale
    if (numLength === 6) return 3; // Tripleta
    if (numLength === 3) return 4; // Cash3
    if (numLength >= 5) return 10; // Play4/Pick5
    return 1; // Default to Directo
  };

  // Create ticket
  const handleCreateTicket = async (): Promise<void> => {
    const allBets: Bet[] = [
      ...directBets,
      ...paleBets,
      ...cash3Bets,
      ...play4Bets
    ];

    if (allBets.length === 0) {
      alert('Debe agregar al menos una jugada');
      return;
    }

    if (!selectedPool) {
      alert('Debe seleccionar una banca');
      return;
    }

    try {
      // Build API request payload
      const ticketPayload = {
        bettingPoolId: selectedPool.bettingPoolId,
        userId: parseInt(getCurrentUser()?.id || '1', 10),
        lines: allBets.map((bet) => ({
          drawId: bet.drawId,
          betNumber: bet.betNumber.replace(/[^0-9]/g, ''), // Clean number
          betTypeId: getBetTypeId(bet.betNumber),
          betAmount: bet.betAmount,
          multiplier: 1.00,
          isLuckyPick: false
        })),
        globalMultiplier: 1.00,
        globalDiscount: discountActive ? 0.00 : 0.00
      };

      // Send to API
      const response = await api.post('/tickets', ticketPayload) as TicketData;

      // Ticket created successfully - clear bets and show confirmation
      setDirectBets([]);
      setPaleBets([]);
      setCash3Bets([]);
      setPlay4Bets([]);

      // Show success message with ticket code from API
      setSuccessMessage(`Ticket creado: ${response.ticketCode || 'OK'}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error al crear el ticket');
    }
  };

  // Duplicate last bet
  const handleDuplicate = (): void => {
    alert('Función de duplicar pendiente de implementar');
  };

  // Handle Enter key in input fields
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddBet();
    }
  };

  return (
    <Box sx={{ bgcolor: bgColor, minHeight: '100vh', p: 2, transition: 'background-color 0.3s ease' }}>
      {/* HEADER: Betting Pool Selector + Draw Image */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ color: '#666', fontSize: '14px' }}>Banca</Typography>
          <Autocomplete
            size="small"
            options={pools}
            getOptionLabel={(option) =>
              option.bettingPoolName
                ? `${option.bettingPoolName} (${option.bettingPoolCode || ''}) (${option.bettingPoolId})`
                : ''
            }
            filterOptions={(options, { inputValue }) => {
              const filterValue = inputValue.toLowerCase();
              return options.filter(option =>
                option.bettingPoolName?.toLowerCase().includes(filterValue) ||
                option.bettingPoolCode?.toLowerCase().includes(filterValue) ||
                String(option.bettingPoolId).includes(filterValue)
              );
            }}
            value={selectedPool}
            onChange={(_, newValue) => setSelectedPool(newValue)}
            sx={{ width: 280, bgcolor: 'white' }}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Buscar banca..." />}
          />
        </Box>
        {/* Selected draw preview */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {multiLotteryMode && selectedDraws.length > 1 ? (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {selectedDraws.slice(0, 4).map((draw) => (
                <Box
                  key={draw.id}
                  sx={{
                    width: 35,
                    height: 35,
                    bgcolor: draw.color || '#ddd',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '2px solid rgba(0,0,0,0.1)',
                  }}
                >
                  {draw.imageUrl ? (
                    <Box
                      component="img"
                      src={draw.imageUrl}
                      alt={draw.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Dices size={18} color="white" />
                  )}
                </Box>
              ))}
              {selectedDraws.length > 4 && (
                <Box
                  sx={{
                    width: 35,
                    height: 35,
                    bgcolor: '#666',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  +{selectedDraws.length - 4}
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                width: 50,
                height: 50,
                bgcolor: selectedDraw?.color || '#ddd',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid rgba(0,0,0,0.1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {selectedDraw?.imageUrl ? (
                <Box
                  component="img"
                  src={selectedDraw.imageUrl}
                  alt={selectedDraw.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
              ) : (
                <Dices size={28} color="white" />
              )}
            </Box>
          )}
          <Typography sx={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
            {multiLotteryMode && selectedDraws.length > 1
              ? `${selectedDraws.length} sorteos seleccionados`
              : selectedDraw?.name || 'Seleccione un sorteo'}
          </Typography>
        </Box>
      </Box>

      {/* DRAWS GRID */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          mb: 2,
          p: 1,
          bgcolor: 'rgba(255,255,255,0.5)',
          borderRadius: 1,
          minHeight: 60,
          alignItems: loadingDraws ? 'center' : 'flex-start',
          justifyContent: loadingDraws ? 'center' : 'flex-start',
        }}
      >
        {loadingDraws ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: '#51cbce' }} />
            <Typography sx={{ fontSize: '12px', color: '#666' }}>Cargando sorteos...</Typography>
          </Box>
        ) : draws.length === 0 ? (
          <Typography sx={{ fontSize: '12px', color: '#666' }}>No hay sorteos disponibles</Typography>
        ) : (
          draws
            // Filter to only show allowed draws when a betting pool is selected and has configured draws
            .filter((draw) => {
              if (!selectedPool) return true; // Show all if no pool selected
              if (allowedDrawIds.size === 0) return true; // Show all if no restrictions (fallback)
              return allowedDrawIds.has(draw.id); // Only show allowed draws
            })
            .map((draw) => {
            const isSelected = multiLotteryMode
              ? selectedDraws.some(s => s.id === draw.id)
              : selectedDraw?.id === draw.id;
            const isDisabled = !selectedPool || draw.disabled || loadingAllowedDraws;
            return (
              <Box
                key={draw.id}
                onClick={() => handleDrawClick(draw)}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  bgcolor: isSelected ? '#fff' : isDisabled ? '#bdbdbd' : draw.color,
                  color: isSelected ? '#333' : 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 0.75,
                  border: isSelected ? '4px solid #000' : '1px solid transparent',
                  boxShadow: isSelected ? '0 3px 8px rgba(0,0,0,0.35)' : 'none',
                  transition: 'all 0.15s ease',
                  pointerEvents: isDisabled ? 'none' : 'auto',
                  '&:hover': {
                    opacity: isDisabled ? 0.5 : 0.85,
                    transform: isDisabled ? 'none' : 'translateY(-1px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '3px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: draw.imageUrl ? 'transparent' : 'rgba(255,255,255,0.2)',
                    flexShrink: 0,
                  }}
                >
                  {draw.imageUrl ? (
                    <Box
                      component="img"
                      src={draw.imageUrl}
                      alt=""
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Dices size={16} color={isSelected ? '#666' : 'white'} style={{ opacity: 0.8 }} />
                  )}
                </Box>
                {draw.name}
              </Box>
            );
          })
        )}
      </Box>

      {/* STATS ROW */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Jugadas del dia</Typography>
          <TextField
            size="medium"
            value={dailyBets}
            disabled
            sx={{
              width: 100,
              bgcolor: 'white',
              '& input': {
                textAlign: 'center',
                py: 1,
                fontSize: '16px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Vendido en grupo</Typography>
          <TextField
            size="medium"
            value={soldInGroup}
            disabled
            sx={{
              width: 180,
              bgcolor: 'white',
              '& input': {
                py: 1,
                fontSize: '16px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Vendido en banca</Typography>
          <TextField
            size="medium"
            value={soldInPool}
            disabled
            sx={{
              width: 180,
              bgcolor: 'white',
              '& input': {
                py: 1,
                fontSize: '16px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Desc.</Typography>
          <Switch
            checked={discountActive}
            onChange={(e) => setDiscountActive(e.target.checked)}
            sx={{
              transform: 'scale(1.3)',
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4caf50' },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Mult. lot</Typography>
          <Switch
            checked={multiLotteryMode}
            onChange={(e) => setMultiLotteryMode(e.target.checked)}
            sx={{
              transform: 'scale(1.3)',
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#f44336' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#f44336' },
            }}
          />
        </Box>
      </Box>

      {/* INPUT ROW: Bet Number, N/A, Amount */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="JUGADA"
          value={betNumber}
          onChange={(e) => setBetNumber(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!selectedDraw}
          autoFocus={!!selectedDraw}
          inputRef={betNumberInputRef}
          inputProps={{ tabIndex: 1 }}
          sx={{
            flex: 1,
            bgcolor: 'white',
            '& input': {
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              py: 2,
              color: '#333',
            },
            '& input::placeholder': {
              color: '#999',
              opacity: 1,
            },
          }}
        />
        <TextField
          placeholder="N/A"
          value={betError}
          disabled
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              bgcolor: betError ? '#c62828' : 'white',
              height: '100%',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: betError ? '#c62828' : 'rgba(0, 0, 0, 0.23)',
            },
            '& input': {
              fontSize: betError ? '14px' : '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              py: 2,
              color: betError ? '#fff' : '#333',
              WebkitTextFillColor: betError ? '#fff' : '#999',
              '&.Mui-disabled': {
                WebkitTextFillColor: betError ? '#fff' : '#999',
              },
            },
            '& input::placeholder': {
              color: '#999',
              opacity: 1,
            },
          }}
        />
        <TextField
          placeholder="MONTO"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!selectedDraw}
          type="number"
          inputProps={{ tabIndex: 2 }}
          sx={{
            flex: 1,
            bgcolor: 'white',
            '& input': {
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              py: 2,
              color: '#333',
            },
            '& input::placeholder': {
              color: '#999',
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* DROPDOWN + COUNTER */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
          <Select
            value={selectedBetType}
            onChange={(e) => setSelectedBetType(e.target.value)}
            displayEmpty
            disabled={!selectedDraw}
          >
            <MenuItem value="">Seleccione...</MenuItem>
            {betTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton
          onClick={handleAddBet}
          disabled={!betNumber || !amount || !selectedDraw}
          sx={{ bgcolor: '#51cbce', color: 'white', '&:hover': { bgcolor: '#45b8bb' } }}
          title="Agregar jugada (o presione Enter)"
        >
          ➕
        </IconButton>
        <Typography sx={{ fontSize: '14px', color: '#666' }}>
          <strong>Jugadas:</strong> {totalBets}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#666' }}>
          <strong>Total:</strong> ${grandTotal}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#888', fontStyle: 'italic', ml: 'auto' }}>
          Use Tab para navegar, Enter para agregar
        </Typography>
      </Box>

      {/* BET COLUMNS - Conditionally rendered based on selected draw's game types */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {visibleColumns.directo && (
          <BetCardColumn
            title="DIRECTO"
            headerColor="#51cbce"
            headerBgColor="#e0f2f1"
            bets={directBets}
            columnType="directo"
            onDeleteBet={handleDeleteBet}
            onDeleteAll={handleDeleteAll}
            total={directTotal}
          />
        )}
        {visibleColumns.pale && (
          <BetCardColumn
            title="PALE & TRIPLETA"
            headerColor="#3d9970"
            headerBgColor="#e8f5e9"
            bets={paleBets}
            columnType="pale"
            onDeleteBet={handleDeleteBet}
            onDeleteAll={handleDeleteAll}
            total={paleTotal}
          />
        )}
        {visibleColumns.cash3 && (
          <BetCardColumn
            title="CASH 3"
            headerColor="#51cbce"
            headerBgColor="#e0f2f1"
            bets={cash3Bets}
            columnType="cash3"
            onDeleteBet={handleDeleteBet}
            onDeleteAll={handleDeleteAll}
            total={cash3Total}
          />
        )}
        {visibleColumns.play4 && (
          <BetCardColumn
            title="PLAY 4 & PICK 5"
            headerColor="#3d9970"
            headerBgColor="#e8f5e9"
            bets={play4Bets}
            columnType="play4"
            onDeleteBet={handleDeleteBet}
            onDeleteAll={handleDeleteAll}
            total={play4Total}
          />
        )}
      </Box>

      {/* ACTION BUTTONS */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Box
          component="button"
          onClick={handleDuplicate}
          disabled={totalBets === 0}
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: totalBets === 0 ? '#ccc' : '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: totalBets === 0 ? 'not-allowed' : 'pointer',
            '&:hover': {
              bgcolor: totalBets === 0 ? '#ccc' : '#757575',
            },
          }}
        >
          DUPLICAR
        </Box>
        <Box
          component="button"
          onClick={handleCreateTicket}
          disabled={totalBets === 0}
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: totalBets === 0 ? '#ccc' : '#51cbce',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: totalBets === 0 ? 'not-allowed' : 'pointer',
            '&:hover': {
              bgcolor: totalBets === 0 ? '#ccc' : '#45b8bb',
            },
          }}
        >
          CREAR TICKET
        </Box>
        <Box
          component="button"
          onClick={() => setHelpModalOpen(true)}
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#388e3c',
            },
          }}
        >
          AYUDA
        </Box>
      </Box>

      {/* Help Modal */}
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />

      {/* Ticket Preview Modal */}
      <Dialog
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: '500px',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {ticketData && (
            <TicketPrinter
              ticketData={ticketData}
              onClose={() => {
                setTicketModalOpen(false);
                setTicketData(null);
              }}
              onAfterPrint={() => {
                setTicketModalOpen(false);
                setTicketData(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          variant="filled"
          sx={{ width: '100%', fontSize: '16px' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default memo(CreateTickets);
