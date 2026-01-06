/**
 * CreateTickets Component
 *
 * Refactored component with modular architecture.
 * - Types extracted to ./types.ts
 * - UI components extracted to ./components/
 */

import React, { useState, useEffect, useRef, memo, useMemo, type KeyboardEvent } from 'react';
import {
  Box, TextField, Typography, Autocomplete,
  Dialog, DialogContent, Snackbar, Alert
} from '@mui/material';
import { Dices } from 'lucide-react';
import api from '@services/api';
import { getCurrentUser } from '@services/authService';
import HelpModal from './HelpModal';
import TicketPrinter from '../TicketPrinter';

// Internal imports
import type {
  BettingPool, Draw, Bet, BetType, TicketData,
  ColumnType, VisibleColumns,
  BettingPoolDrawResponse, DrawApiResponse
} from './types';
import {
  BetCardColumn, DrawsGrid, StatsRow, BetInputRow
} from './components';

// Bet types for dropdown
const BET_TYPES: BetType[] = [
  { id: 'directo', name: 'Directo' },
  { id: 'pale', name: 'Pale' },
  { id: 'tripleta', name: 'Tripleta' },
  { id: 'cash3-straight', name: 'Cash3 Straight' },
  { id: 'cash3-box', name: 'Cash3 Box' },
  { id: 'play4-straight', name: 'Play4 Straight' },
  { id: 'play4-box', name: 'Play4 Box' },
  { id: 'pick5', name: 'Pick 5' },
];

/**
 * CreateTickets - Exact replica of the original Vue.js application
 */
const CreateTickets: React.FC = () => {
  // State for betting pool
  const [selectedPool, setSelectedPool] = useState<BettingPool | null>(null);
  const [pools, setPools] = useState<BettingPool[]>([]);

  // State for draws
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedDraws, setSelectedDraws] = useState<Draw[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loadingDraws, setLoadingDraws] = useState<boolean>(true);

  // State for allowed draws per betting pool
  const [allowedDrawIds, setAllowedDrawIds] = useState<Set<number>>(new Set());
  const [loadingAllowedDraws, setLoadingAllowedDraws] = useState<boolean>(false);
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

  // Refs
  const betNumberInputRef = useRef<HTMLInputElement>(null);

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
    const loadAllowedDraws = async () => {
      if (!selectedPool) {
        setAllowedDrawIds(new Set());
        setDrawGameTypes(new Map());
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

        setSelectedDraw(null);
        setSelectedDraws([]);
      } catch (error) {
        console.error('Error loading allowed draws:', error);
        setAllowedDrawIds(new Set());
        setDrawGameTypes(new Map());
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

  // Memoized totals
  const calculateTotal = (bets: Bet[]): string => {
    return bets.reduce((sum, bet) => sum + (bet.betAmount || 0), 0).toFixed(2);
  };

  const directTotal = useMemo(() => calculateTotal(directBets), [directBets]);
  const paleTotal = useMemo(() => calculateTotal(paleBets), [paleBets]);
  const cash3Total = useMemo(() => calculateTotal(cash3Bets), [cash3Bets]);
  const play4Total = useMemo(() => calculateTotal(play4Bets), [play4Bets]);

  const grandTotal = useMemo(() => {
    const total = parseFloat(directTotal) + parseFloat(paleTotal) + parseFloat(cash3Total) + parseFloat(play4Total);
    return total.toFixed(2);
  }, [directTotal, paleTotal, cash3Total, play4Total]);

  const totalBets = useMemo(() => {
    return directBets.length + paleBets.length + cash3Bets.length + play4Bets.length;
  }, [directBets.length, paleBets.length, cash3Bets.length, play4Bets.length]);

  // Memoized visible columns based on selected draw's game types
  const visibleColumns = useMemo<VisibleColumns>(() => {
    const getGameTypesForDraw = (drawId: number): number[] => {
      return drawGameTypes.get(drawId) || [];
    };

    if (!selectedDraw) {
      return { directo: true, pale: true, cash3: true, play4: true };
    }

    const allGameTypes = new Set<number>();
    if (multiLotteryMode && selectedDraws.length > 0) {
      selectedDraws.forEach(draw => {
        getGameTypesForDraw(draw.id).forEach(gt => allGameTypes.add(gt));
      });
    } else {
      getGameTypesForDraw(selectedDraw.id).forEach(gt => allGameTypes.add(gt));
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
  const handleDrawClick = (draw: Draw): void => {
    if (!selectedPool || draw.disabled) return;

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

  const handleAddBet = (): void => {
    const drawsToPlay = multiLotteryMode && selectedDraws.length > 0
      ? selectedDraws
      : selectedDraw ? [selectedDraw] : [];

    if (!betNumber || !amount || drawsToPlay.length === 0) return;

    const numLength = betNumber.replace(/[^0-9]/g, '').length;
    const numericAmount = parseFloat(amount) || 0;

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
      } else if (selectedBetType?.includes('play4') || selectedBetType === 'pick5' || numLength >= 5) {
        const hasPlay4 = allowedGameTypes.some(gt => (gt >= 10 && gt <= 13) || (gt >= 15 && gt <= 20));
        if (!hasPlay4) {
          betTypeName = 'Play 4 / Pick 5';
          isAllowed = false;
          break;
        }
      }
    }

    if (!isAllowed) {
      const drawName = drawsToPlay.find(d => {
        const gt = drawGameTypes.get(d.id) || [];
        return gt.length > 0;
      })?.name || 'esta lotería';
      setBetError(`${betTypeName} no permitido en ${drawName}`);
      setBetNumber('');
      setAmount('');
      setTimeout(() => betNumberInputRef.current?.focus(), 100);
      return;
    }

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
    setTimeout(() => betNumberInputRef.current?.focus(), 0);
  };

  const handleDeleteBet = (column: ColumnType, id: number): void => {
    switch (column) {
      case 'directo': setDirectBets(directBets.filter(bet => bet.id !== id)); break;
      case 'pale': setPaleBets(paleBets.filter(bet => bet.id !== id)); break;
      case 'cash3': setCash3Bets(cash3Bets.filter(bet => bet.id !== id)); break;
      case 'play4': setPlay4Bets(play4Bets.filter(bet => bet.id !== id)); break;
    }
  };

  const handleDeleteAll = (column: ColumnType): void => {
    switch (column) {
      case 'directo': setDirectBets([]); break;
      case 'pale': setPaleBets([]); break;
      case 'cash3': setCash3Bets([]); break;
      case 'play4': setPlay4Bets([]); break;
    }
  };

  const getBetTypeId = (betNumber: string): number => {
    const numLength = betNumber.replace(/[^0-9]/g, '').length;
    if (numLength === 2) return 1;
    if (numLength === 4) return 2;
    if (numLength === 6) return 3;
    if (numLength === 3) return 4;
    if (numLength >= 5) return 10;
    return 1;
  };

  const handleCreateTicket = async (): Promise<void> => {
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
  };

  const handleDuplicate = (): void => {
    alert('Función de duplicar pendiente de implementar');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddBet();
    }
  };

  return (
    <Box sx={{ bgcolor: bgColor, minHeight: '100vh', p: 2, transition: 'background-color 0.3s ease' }}>
      {/* Header: Pool Selector + Draw Preview */}
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
                    width: 35, height: 35,
                    bgcolor: draw.color || '#ddd',
                    borderRadius: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    border: '2px solid rgba(0,0,0,0.1)',
                  }}
                >
                  {draw.imageUrl ? (
                    <Box component="img" src={draw.imageUrl} alt={draw.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Dices size={18} color="white" />
                  )}
                </Box>
              ))}
              {selectedDraws.length > 4 && (
                <Box sx={{
                  width: 35, height: 35, bgcolor: '#666', borderRadius: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '12px', fontWeight: 'bold',
                }}>
                  +{selectedDraws.length - 4}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{
              width: 50, height: 50,
              bgcolor: selectedDraw?.color || '#ddd',
              borderRadius: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid rgba(0,0,0,0.1)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              {selectedDraw?.imageUrl ? (
                <Box component="img" src={selectedDraw.imageUrl} alt={selectedDraw.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* Draws Grid */}
      <DrawsGrid
        draws={draws}
        selectedDraw={selectedDraw}
        selectedDraws={selectedDraws}
        selectedPool={selectedPool}
        multiLotteryMode={multiLotteryMode}
        loadingDraws={loadingDraws}
        loadingAllowedDraws={loadingAllowedDraws}
        allowedDrawIds={allowedDrawIds}
        onDrawClick={handleDrawClick}
      />

      {/* Stats Row */}
      <StatsRow
        dailyBets={dailyBets}
        soldInGroup={soldInGroup}
        soldInPool={soldInPool}
        discountActive={discountActive}
        multiLotteryMode={multiLotteryMode}
        onDiscountChange={setDiscountActive}
        onMultiLotteryChange={setMultiLotteryMode}
      />

      {/* Bet Input Row */}
      <BetInputRow
        betNumber={betNumber}
        amount={amount}
        betError={betError}
        selectedBetType={selectedBetType}
        selectedDraw={selectedDraw}
        betTypes={BET_TYPES}
        totalBets={totalBets}
        grandTotal={grandTotal}
        betNumberInputRef={betNumberInputRef}
        onBetNumberChange={setBetNumber}
        onAmountChange={setAmount}
        onBetTypeChange={setSelectedBetType}
        onAddBet={handleAddBet}
        onKeyDown={handleKeyDown}
      />

      {/* Bet Columns */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {visibleColumns.directo && (
          <BetCardColumn title="DIRECTO" headerColor="#51cbce" headerBgColor="#e0f2f1"
            bets={directBets} columnType="directo"
            onDeleteBet={handleDeleteBet} onDeleteAll={handleDeleteAll} total={directTotal} />
        )}
        {visibleColumns.pale && (
          <BetCardColumn title="PALE & TRIPLETA" headerColor="#3d9970" headerBgColor="#e8f5e9"
            bets={paleBets} columnType="pale"
            onDeleteBet={handleDeleteBet} onDeleteAll={handleDeleteAll} total={paleTotal} />
        )}
        {visibleColumns.cash3 && (
          <BetCardColumn title="CASH 3" headerColor="#51cbce" headerBgColor="#e0f2f1"
            bets={cash3Bets} columnType="cash3"
            onDeleteBet={handleDeleteBet} onDeleteAll={handleDeleteAll} total={cash3Total} />
        )}
        {visibleColumns.play4 && (
          <BetCardColumn title="PLAY 4 & PICK 5" headerColor="#3d9970" headerBgColor="#e8f5e9"
            bets={play4Bets} columnType="play4"
            onDeleteBet={handleDeleteBet} onDeleteAll={handleDeleteAll} total={play4Total} />
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Box component="button" onClick={handleDuplicate} disabled={totalBets === 0}
          sx={{
            px: 4, py: 1.5,
            bgcolor: totalBets === 0 ? '#ccc' : '#9e9e9e',
            color: 'white', border: 'none', borderRadius: '4px',
            fontSize: '14px', fontWeight: 'bold',
            cursor: totalBets === 0 ? 'not-allowed' : 'pointer',
            '&:hover': { bgcolor: totalBets === 0 ? '#ccc' : '#757575' },
          }}>
          DUPLICAR
        </Box>
        <Box component="button" onClick={handleCreateTicket} disabled={totalBets === 0}
          sx={{
            px: 4, py: 1.5,
            bgcolor: totalBets === 0 ? '#ccc' : '#51cbce',
            color: 'white', border: 'none', borderRadius: '4px',
            fontSize: '14px', fontWeight: 'bold',
            cursor: totalBets === 0 ? 'not-allowed' : 'pointer',
            '&:hover': { bgcolor: totalBets === 0 ? '#ccc' : '#45b8bb' },
          }}>
          CREAR TICKET
        </Box>
        <Box component="button" onClick={() => setHelpModalOpen(true)}
          sx={{
            px: 4, py: 1.5,
            bgcolor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px',
            fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
            '&:hover': { bgcolor: '#388e3c' },
          }}>
          AYUDA
        </Box>
      </Box>

      {/* Modals */}
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />

      <Dialog open={ticketModalOpen} onClose={() => setTicketModalOpen(false)}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, maxWidth: '500px' } }}>
        <DialogContent sx={{ p: 0 }}>
          {ticketData && (
            <TicketPrinter ticketData={ticketData}
              onClose={() => { setTicketModalOpen(false); setTicketData(null); }}
              onAfterPrint={() => { setTicketModalOpen(false); setTicketData(null); }} />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={!!successMessage} autoHideDuration={3000}
        onClose={() => setSuccessMessage('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccessMessage('')} severity="success" variant="filled"
          sx={{ width: '100%', fontSize: '16px' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default memo(CreateTickets);
