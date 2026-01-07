/**
 * useCreateTicketsAdvanced Hook
 *
 * Handles all state management and logic for the CreateTicketsAdvanced component.
 */

import { useState, useEffect, useRef, useMemo, useCallback, type RefObject, type KeyboardEvent } from 'react';
import { useBetDetection } from '@hooks/useBetDetection';
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts';
import { generateBetLines, type BetInfo as BetGeneratorInfo } from '@utils/betGenerators';
import api from '@services/api';
import type { Draw, DrawWithGameTypes, BetLine, GroupedLines, SectionName } from '../types';
import { SECTION_NAMES, MOCK_DRAWS } from '../constants';

interface UseCreateTicketsAdvancedReturn {
  // Refs
  playNumberRef: RefObject<HTMLInputElement>;
  playAmountRef: RefObject<HTMLInputElement>;

  // State
  draws: Draw[];
  loading: boolean;
  selectedDraws: Draw[];
  playNumber: string;
  playAmount: string;
  customerName: string;
  lines: BetLine[];
  validationError: string;
  discountEnabled: boolean;
  multiplierEnabled: boolean;
  globalMultiplier: number;
  globalDiscount: number;

  // Bet detection
  betInfo: ReturnType<typeof useBetDetection>;

  // Computed values
  groupedLines: GroupedLines;
  sectionTotals: Record<string, number>;
  grandTotal: number;

  // Handlers
  setPlayNumber: (value: string) => void;
  setPlayAmount: (value: string) => void;
  setCustomerName: (value: string) => void;
  setDiscountEnabled: (value: boolean) => void;
  setMultiplierEnabled: (value: boolean) => void;
  handleDrawToggle: (draw: Draw) => void;
  handlePlayNumberKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handlePlayAmountKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleDeleteLine: (lineId: number) => void;
  handleDeleteSection: (section: string) => void;
  handleCreateTicket: () => Promise<void>;
  resetForm: () => void;
  duplicateTicket: () => void;
}

export const useCreateTicketsAdvanced = (): UseCreateTicketsAdvancedReturn => {
  // Refs
  const playNumberRef = useRef<HTMLInputElement>(null);
  const playAmountRef = useRef<HTMLInputElement>(null);

  // API data state
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [drawsWithGameTypes, setDrawsWithGameTypes] = useState<DrawWithGameTypes[]>([]);

  // Form state
  const [selectedDraws, setSelectedDraws] = useState<Draw[]>([]);
  const [playNumber, setPlayNumber] = useState<string>('');
  const [playAmount, setPlayAmount] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [lines, setLines] = useState<BetLine[]>([]);
  const [validationError, setValidationError] = useState<string>('');

  // Configuration state
  const [discountEnabled, setDiscountEnabled] = useState<boolean>(false);
  const [multiplierEnabled, setMultiplierEnabled] = useState<boolean>(false);
  const [globalMultiplier, setGlobalMultiplier] = useState<number>(1.0);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0.0);

  // Bet detection
  const betInfo = useBetDetection(playNumber);

  // Load draws on mount
  useEffect(() => {
    loadDraws();
  }, []);

  // Auto-focus on play number field when loaded
  useEffect(() => {
    if (!loading && playNumberRef.current) {
      playNumberRef.current.focus();
    }
  }, [loading]);

  const loadDraws = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const bettingPoolId = parseInt(localStorage.getItem('bettingPoolId') || '9');

      const response = await api.get(`/betting-pools/${bettingPoolId}/draws`, {
        headers: { Authorization: `Bearer ${token}` }
      }) as DrawWithGameTypes[];

      const drawsData = response || [];
      const drawsList: Draw[] = drawsData.map(d => ({
        drawId: d.drawId,
        drawName: d.drawName,
        lotteryName: d.lotteryName,
        drawTime: d.drawTime
      }));

      setDraws(drawsList);
      setDrawsWithGameTypes(drawsData);

      if (drawsList.length > 0) {
        setSelectedDraws([drawsList[0]]);
      }
    } catch (error) {
      console.error('Error cargando sorteos:', error);
      const mockDraws = [...MOCK_DRAWS] as Draw[];
      setDraws(mockDraws);
      setDrawsWithGameTypes([]);
      setSelectedDraws([mockDraws[0]]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawToggle = useCallback((draw: Draw): void => {
    setSelectedDraws(prev => {
      const isSelected = prev.some(d => d.drawId === draw.drawId);
      if (isSelected) {
        return prev.length > 1 ? prev.filter(d => d.drawId !== draw.drawId) : prev;
      }
      return [...prev, draw];
    });
  }, []);

  const validateBetTypeForDraws = useCallback((betTypeCode: string): { isValid: boolean; invalidDraws: string[] } => {
    if (drawsWithGameTypes.length === 0) {
      return { isValid: true, invalidDraws: [] };
    }

    const invalidDraws: string[] = [];
    for (const selectedDraw of selectedDraws) {
      const drawData = drawsWithGameTypes.find(d => d.drawId === selectedDraw.drawId);
      if (!drawData?.enabledGameTypes) continue;

      const isAllowed = drawData.enabledGameTypes.some(gt => gt.gameTypeCode === betTypeCode);
      if (!isAllowed) {
        invalidDraws.push(selectedDraw.drawName);
      }
    }

    return { isValid: invalidDraws.length === 0, invalidDraws };
  }, [drawsWithGameTypes, selectedDraws]);

  const addBetLines = useCallback((): void => {
    setValidationError('');

    if (!playNumber.trim() || !playAmount || !betInfo.isValid) {
      setValidationError('Complete jugada y monto correctamente');
      return;
    }

    if (selectedDraws.length === 0) {
      setValidationError('Seleccione al menos un sorteo');
      return;
    }

    const amount = parseFloat(playAmount);
    if (isNaN(amount) || amount <= 0) {
      setValidationError('Monto inválido');
      return;
    }

    if (betInfo.betTypeCode) {
      const validation = validateBetTypeForDraws(betInfo.betTypeCode);
      if (!validation.isValid) {
        setValidationError(`❌ El tipo "${betInfo.displayName}" NO está permitido para: ${validation.invalidDraws.join(', ')}`);
        return;
      }
    }

    const validBetInfo: BetGeneratorInfo = {
      betTypeCode: betInfo.betTypeCode!,
      displayName: betInfo.displayName,
      section: betInfo.section || 'DIRECTO',
      generator: betInfo.generator || undefined,
      sequenceStart: betInfo.sequenceStart,
      sequenceEnd: betInfo.sequenceEnd,
    };
    const newLines = generateBetLines(playNumber, amount, selectedDraws, validBetInfo) as BetLine[];

    setLines(prev => [...prev, ...newLines]);
    setPlayNumber('');
    setPlayAmount('');
    setValidationError('');
    playNumberRef.current?.focus();
  }, [playNumber, playAmount, betInfo, selectedDraws, validateBetTypeForDraws]);

  const clearFields = useCallback((): void => {
    setPlayNumber('');
    setPlayAmount('');
    playNumberRef.current?.focus();
  }, []);

  const cancelTicket = useCallback((): void => {
    if (lines.length > 0 && window.confirm('¿Cancelar ticket completo?')) {
      setLines([]);
      clearFields();
    }
  }, [lines.length, clearFields]);

  const changeLottery = useCallback((): void => {
    if (draws.length === 0) return;
    const currentIndex = draws.findIndex(d => d.drawId === selectedDraws[0]?.drawId);
    const nextIndex = (currentIndex + 1) % draws.length;
    setSelectedDraws([draws[nextIndex]]);
  }, [draws, selectedDraws]);

  const duplicateTicket = useCallback((): void => {
    if (lines.length > 0) {
      alert('Función de duplicar ticket (por implementar)');
    }
  }, [lines.length]);

  const printTicket = useCallback((): void => {
    if (lines.length > 0) {
      alert('Función de imprimir ticket (por implementar)');
    }
  }, [lines.length]);

  const markAsPaid = useCallback((): void => {
    alert('Función de marcar como pagado (por implementar)');
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onClearFields: clearFields,
    onCancelTicket: cancelTicket,
    onChangeLottery: changeLottery,
    onPrint: printTicket,
    onDuplicate: duplicateTicket,
    onMarkAsPaid: markAsPaid
  });

  const handlePlayNumberKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (betInfo.isValid && playNumber.trim()) {
        playAmountRef.current?.focus();
      } else {
        alert('Formato de jugada no válido: ' + betInfo.displayName);
      }
    }
  }, [betInfo.isValid, betInfo.displayName, playNumber]);

  const handlePlayAmountKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBetLines();
    }
  }, [addBetLines]);

  const handleDeleteLine = useCallback((lineId: number): void => {
    setLines(prev => prev.filter(line => line.id !== lineId));
  }, []);

  const handleDeleteSection = useCallback((section: string): void => {
    if (window.confirm(`¿Eliminar todas las jugadas de ${section}?`)) {
      setLines(prev => prev.filter(line => line.section !== section));
    }
  }, []);

  const handleCreateTicket = useCallback(async (): Promise<void> => {
    if (lines.length === 0) {
      alert('Agregue al menos una línea');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const userId = parseInt(localStorage.getItem('userId') || '11');
      const bettingPoolId = parseInt(localStorage.getItem('bettingPoolId') || '9');

      const payload = {
        bettingPoolId,
        userId,
        lines: lines.map(line => ({
          drawId: line.drawId,
          betNumber: line.betNumber,
          betTypeId: 1,
          betAmount: line.amount,
          multiplier: multiplierEnabled ? globalMultiplier : 1.0
        })),
        globalMultiplier: multiplierEnabled ? globalMultiplier : 1.0,
        globalDiscount: discountEnabled ? globalDiscount : 0.0,
        customerName: customerName || null,
        customerPhone: null,
        notes: null
      };

      await api.post('/tickets', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Ticket creado exitosamente!');
      setLines([]);
      clearFields();
    } catch (err) {
      console.error('Error creando ticket:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert('Error al crear ticket: ' + (error.response?.data?.message || error.message));
    }
  }, [lines, multiplierEnabled, globalMultiplier, discountEnabled, globalDiscount, customerName, clearFields]);

  const resetForm = useCallback((): void => {
    if (lines.length > 0 && !window.confirm('¿Limpiar todo el formulario?')) {
      return;
    }
    setLines([]);
    setSelectedDraws(draws.length > 0 ? [draws[0]] : []);
    setDiscountEnabled(false);
    setMultiplierEnabled(false);
    setGlobalMultiplier(1.0);
    setGlobalDiscount(0.0);
    setCustomerName('');
    clearFields();
  }, [lines.length, draws, clearFields]);

  // Computed values
  const groupedLines = useMemo((): GroupedLines => {
    const groups: GroupedLines = {
      'DIRECTO': [],
      'PALE & TRIPLETA': [],
      'CASH 3': [],
      'PLAY 4 & PICK 5': []
    };

    lines.forEach(line => {
      if (line.section in groups) {
        groups[line.section as keyof GroupedLines].push(line);
      }
    });

    return groups;
  }, [lines]);

  const sectionTotals = useMemo((): Record<string, number> => {
    const totals: Record<string, number> = {};
    SECTION_NAMES.forEach(section => {
      totals[section] = groupedLines[section].reduce((sum, line) => sum + line.amount, 0);
    });
    return totals;
  }, [groupedLines]);

  const grandTotal = useMemo((): number => {
    return lines.reduce((sum, line) => sum + line.amount, 0);
  }, [lines]);

  return {
    playNumberRef,
    playAmountRef,
    draws,
    loading,
    selectedDraws,
    playNumber,
    playAmount,
    customerName,
    lines,
    validationError,
    discountEnabled,
    multiplierEnabled,
    globalMultiplier,
    globalDiscount,
    betInfo,
    groupedLines,
    sectionTotals,
    grandTotal,
    setPlayNumber,
    setPlayAmount,
    setCustomerName,
    setDiscountEnabled,
    setMultiplierEnabled,
    handleDrawToggle,
    handlePlayNumberKeyDown,
    handlePlayAmountKeyDown,
    handleDeleteLine,
    handleDeleteSection,
    handleCreateTicket,
    resetForm,
    duplicateTicket,
  };
};

export default useCreateTicketsAdvanced;
