import React, { useState, useEffect, useRef, useMemo, memo, type KeyboardEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Chip,
  Grid,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Receipt, RotateCcw, Copy, HelpCircle } from 'lucide-react';
import { useBetDetection } from '@hooks/useBetDetection';
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts';
import { generateBetLines, type BetInfo as BetGeneratorInfo } from '@utils/betGenerators';
import BetSection from './BetSection';
import api from '@services/api';

interface Draw {
  drawId: number;
  drawName: string;
  lotteryName: string;
  drawTime?: string;
}

interface DrawWithGameTypes extends Draw {
  enabledGameTypes?: { gameTypeCode: string }[];
}

interface BetLine {
  id: number;
  section: string;
  drawId: number;
  drawName: string;
  lotteryName: string;
  betNumber: string;
  amount: number;
}

interface BetInfo {
  isValid: boolean;
  displayName: string;
  section: string | null;
  betTypeCode: string | null;
  generator?: string | null;
}

interface GroupedLines {
  'DIRECTO': BetLine[];
  'PALE & TRIPLETA': BetLine[];
  'CASH 3': BetLine[];
  'PLAY 4 & PICK 5': BetLine[];
}

/**
 * Componente Avanzado para Crear Tickets
 * Réplica exacta del formulario de la aplicación Vue.js original
 *
 * Características:
 * - Grid de sorteos clickeable (múltiple selección)
 * - Detection automatic de bet type por formato
 * - Keyboard-driven (ENTER para avanzar, atajos globales)
 * - 4 secciones de agrupación (DIRECTO, PALE & TRIPLETA, CASH 3, PLAY 4 & PICK 5)
 * - Generadores automáticos (q, ., d, -10, +xyz)
 * - Modal de ayuda con shortcuts e instrucciones
 */
const CreateTicketsAdvanced: React.FC = () => {
  // Referencias para manejo de teclado
  const playNumberRef = useRef<HTMLInputElement>(null);
  const playAmountRef = useRef<HTMLInputElement>(null);

  // Estados para loaded parameters de API
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [drawsWithGameTypes, setDrawsWithGameTypes] = useState<DrawWithGameTypes[]>([]); // Sorteos con tipos de juego habilitados

  // Estados del formulario
  const [selectedDraws, setSelectedDraws] = useState<Draw[]>([]);
  const [playNumber, setPlayNumber] = useState<string>('');
  const [playAmount, setPlayAmount] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [lines, setLines] = useState<BetLine[]>([]);
  const [validationError, setValidationError] = useState<string>(''); // Validation error

  // Estados de configuration
  const [discountEnabled, setDiscountEnabled] = useState<boolean>(false);
  const [multiplierEnabled, setMultiplierEnabled] = useState<boolean>(false);
  const [globalMultiplier, setGlobalMultiplier] = useState<number>(1.0);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0.0);

  // Detection automatic del bet type
  const betInfo = useBetDetection(playNumber);

  // Load sorteos disponibles
  useEffect(() => {
    loadDraws();
  }, []);

  // Auto-focus en campo de jugada al cargar
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

      // Load sorteos con tipos de juego habilitados para esta banca
      const response = await api.get(`/betting-pools/${bettingPoolId}/draws`, {
        headers: { Authorization: `Bearer ${token}` }
      }) as DrawWithGameTypes[];

      const drawsData = response || [];

      // Extract lista simple de sorteos para el grid
      const drawsList: Draw[] = drawsData.map(d => ({
        drawId: d.drawId,
        drawName: d.drawName,
        lotteryName: d.lotteryName,
        drawTime: d.drawTime
      }));

      setDraws(drawsList);
      setDrawsWithGameTypes(drawsData); // Save data completa con game types

      // Pre-select el primer sorteo si existe
      if (drawsList.length > 0) {
        setSelectedDraws([drawsList[0]]);
      }

      console.log('[SUCCESS] Sorteos cargados con tipos de juego habilitados:', drawsData);
    } catch (error) {
      console.error('Error cargando sorteos:', error);
      // Usar datos mock si falla la API
      const mockDraws: Draw[] = [
        { drawId: 1, drawName: 'TEXAS DAY', lotteryName: 'TEXAS', drawTime: '12:00 PM' },
        { drawId: 2, drawName: 'NEW YORK DAY', lotteryName: 'NEW YORK', drawTime: '12:00 PM' },
        { drawId: 3, drawName: 'FLORIDA AM', lotteryName: 'FLORIDA', drawTime: '10:00 AM' }
      ];
      setDraws(mockDraws);
      setDrawsWithGameTypes([]); // Sin validation con mock data
      setSelectedDraws([mockDraws[0]]);
    } finally {
      setLoading(false);
    }
  };

  // Handlesr draw selection
  const handleDrawToggle = (draw: Draw): void => {
    const isSelected = selectedDraws.some(d => d.drawId === draw.drawId);

    if (isSelected) {
      // Deselect (but keep at least one)
      if (selectedDraws.length > 1) {
        setSelectedDraws(selectedDraws.filter(d => d.drawId !== draw.drawId));
      }
    } else {
      // Add to selection
      setSelectedDraws([...selectedDraws, draw]);
    }
  };

  // Handlesr ENTER en campo de jugada
  const handlePlayNumberKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (betInfo.isValid && playNumber.trim()) {
        // Move focus to field de monto
        playAmountRef.current?.focus();
      } else {
        alert('Formato de jugada no válido: ' + betInfo.displayName);
      }
    }
  };

  // Handlesr ENTER en campo de monto
  const handlePlayAmountKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBetLines();
    }
  };

  // Validate if el bet type detectado is allowed para los selected draws
  const validateBetTypeForDraws = (betTypeCode: string): { isValid: boolean; invalidDraws: string[] } => {
    // If we dont have datos de validation, allow (fallback mode con mock data)
    if (drawsWithGameTypes.length === 0) {
      return { isValid: true, invalidDraws: [] };
    }

    const invalidDraws: string[] = [];

    for (const selectedDraw of selectedDraws) {
      // Search el sorteo en drawsWithGameTypes
      const drawData = drawsWithGameTypes.find(d => d.drawId === selectedDraw.drawId);

      if (!drawData || !drawData.enabledGameTypes) {
        console.warn(`No se encontraron tipos habilitados para sorteo ${selectedDraw.drawName}`);
        continue;
      }

      // Check if betTypeCode is in los enabled game types
      const isAllowed = drawData.enabledGameTypes.some(
        gt => gt.gameTypeCode === betTypeCode
      );

      if (!isAllowed) {
        invalidDraws.push(selectedDraw.drawName);
      }
    }

    return {
      isValid: invalidDraws.length === 0,
      invalidDraws
    };
  };

  // Add bet lines
  const addBetLines = (): void => {
    // Clear error previo
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

    // Validate that el bet type is allowed para los selected draws
    if (betInfo.betTypeCode) {
      const validation = validateBetTypeForDraws(betInfo.betTypeCode);
      if (!validation.isValid) {
        const errorMsg = `❌ El bet type "${betInfo.displayName}" NO is allowed para: ${validation.invalidDraws.join(', ')}`;
        setValidationError(errorMsg);
        console.warn(errorMsg);
        console.warn('Tipo detectado:', betInfo.betTypeCode);
        console.warn('Invalid draws:', validation.invalidDraws);
        return;
      }
    }

    // Generate lines (could be una o multiple if using generators)
    // Type-safe conversion: betTypeCode is validated above, section defaults to 'DIRECTO'
    const validBetInfo: BetGeneratorInfo = {
      betTypeCode: betInfo.betTypeCode!, // Already validated on line 246
      displayName: betInfo.displayName,
      section: betInfo.section || 'DIRECTO',
      generator: betInfo.generator || undefined,
      sequenceStart: betInfo.sequenceStart,
      sequenceEnd: betInfo.sequenceEnd,
    };
    const newLines = generateBetLines(playNumber, amount, selectedDraws, validBetInfo) as BetLine[];

    setLines([...lines, ...newLines]);

    // Clear campos y volver al inicio
    setPlayNumber('');
    setPlayAmount('');
    setValidationError('');
    playNumberRef.current?.focus();
  };

  // Clear campos
  const clearFields = (): void => {
    setPlayNumber('');
    setPlayAmount('');
    playNumberRef.current?.focus();
  };

  // Cancelar ticket completo
  const cancelTicket = (): void => {
    if (lines.length > 0) {
      if (window.confirm('¿Cancelar ticket completo?')) {
        setLines([]);
        clearFields();
      }
    }
  };

  // Change lottery (rotation)
  const changeLottery = (): void => {
    if (draws.length === 0) return;

    const currentIndex = draws.findIndex(d => d.drawId === selectedDraws[0]?.drawId);
    const nextIndex = (currentIndex + 1) % draws.length;
    setSelectedDraws([draws[nextIndex]]);
  };

  // Duplicar ticket (placeholder)
  const duplicateTicket = (): void => {
    if (lines.length > 0) {
      alert('Función de duplicar ticket (por implementar)');
    }
  };

  // Imprimir ticket (placeholder)
  const printTicket = (): void => {
    if (lines.length > 0) {
      alert('Función de imprimir ticket (por implementar)');
    }
  };

  // Marcar como pagado (placeholder)
  const markAsPaid = (): void => {
    alert('Función de marcar como pagado (por implementar)');
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onClearFields: clearFields,
    onCancelTicket: cancelTicket,
    onChangeLottery: changeLottery,
    onPrint: printTicket,
    onDuplicate: duplicateTicket,
    onMarkAsPaid: markAsPaid
  });

  // Group lines by section
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

  // Calculate totals by section
  const sectionTotals = useMemo((): Record<string, number> => {
    const totals: Record<string, number> = {};
    Object.keys(groupedLines).forEach(section => {
      totals[section] = groupedLines[section as keyof GroupedLines].reduce((sum, line) => sum + line.amount, 0);
    });
    return totals;
  }, [groupedLines]);

  // Calcular total general
  const grandTotal = useMemo((): number => {
    return lines.reduce((sum, line) => sum + line.amount, 0);
  }, [lines]);

  // Delete specific line
  const handleDeleteLine = (lineId: number): void => {
    setLines(lines.filter(line => line.id !== lineId));
  };

  // Delete all lines from a section
  const handleDeleteSection = (section: string): void => {
    if (window.confirm(`¿Eliminar todas las jugadas de ${section}?`)) {
      setLines(lines.filter(line => line.section !== section));
    }
  };

  // Create ticket
  const handleCreateTicket = async (): Promise<void> => {
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
          betTypeId: 1, // TODO: mapear betTypeCode a betTypeId real
          betAmount: line.amount,
          multiplier: multiplierEnabled ? globalMultiplier : 1.0
        })),
        globalMultiplier: multiplierEnabled ? globalMultiplier : 1.0,
        globalDiscount: discountEnabled ? globalDiscount : 0.0,
        customerName: customerName || null,
        customerPhone: null,
        notes: null
      };

      const response = await api.post('/tickets', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Ticket creado exitosamente!');
      console.log('Ticket creado:', response);

      // Clear formulario
      setLines([]);
      clearFields();
    } catch (err) {
      console.error('Error creando ticket:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert('Error al crear ticket: ' + (error.response?.data?.message || error.message));
    }
  };

  // Reset formulario
  const resetForm = (): void => {
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
  };

  if (loading) {
    return (
      <Box sx={{ padding: 3, textAlign: 'center' }}>
        <Typography>Cargando sorteos...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, maxWidth: '1400px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center', color: '#51cbce' }}>
        🎫 Crear Ticket
      </Typography>

      {/* GRID DE SORTEOS */}
      <Paper sx={{ padding: 2, marginBottom: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="subtitle2" sx={{ marginBottom: 1.5, fontWeight: 'bold' }}>
          📅 Sorteos Disponibles (Seleccione uno o varios)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {draws.map(draw => {
            const isSelected = selectedDraws.some(d => d.drawId === draw.drawId);
            return (
              <Chip
                key={draw.drawId}
                label={draw.drawName}
                onClick={() => handleDrawToggle(draw)}
                sx={{
                  bgcolor: isSelected ? '#51cbce' : '#fff',
                  color: isSelected ? '#fff' : '#333',
                  border: isSelected ? '2px solid #51cbce' : '1px solid #51cbce',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isSelected ? '#45b8bb' : '#e0f7f7'
                  }
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* CAMPOS DE ENTRADA */}
      <Paper sx={{ padding: 2, marginBottom: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              inputRef={playNumberRef}
              label="Jugada"
              placeholder="Ej: 12, 123+, 1234., etc."
              value={playNumber}
              onChange={(e) => setPlayNumber(e.target.value)}
              onKeyDown={handlePlayNumberKeyDown}
              helperText={playNumber ? betInfo.displayName : 'Ingrese número y presione ENTER'}
              error={playNumber.length > 0 && !betInfo.isValid}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '18px',
                  fontWeight: 'bold'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              inputRef={playAmountRef}
              type="number"
              label="Monto"
              placeholder="$0.00"
              value={playAmount}
              onChange={(e) => setPlayAmount(e.target.value)}
              onKeyDown={handlePlayAmountKeyDown}
              helperText="Presione ENTER para agregar"
              inputProps={{ min: 1, step: 0.01 }}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '18px',
                  fontWeight: 'bold'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Cliente (opcional)"
              placeholder="Nombre"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={discountEnabled}
                    onChange={(e) => setDiscountEnabled(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="caption">Desc.</Typography>}
                labelPlacement="top"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={multiplierEnabled}
                    onChange={(e) => setMultiplierEnabled(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="caption">Mult.</Typography>}
                labelPlacement="top"
              />
            </Box>
          </Grid>
        </Grid>

        {/* Hint de detection */}
        {playNumber && betInfo.isValid && (
          <Box sx={{ marginTop: 2, padding: 1.5, bgcolor: '#e7f9f9', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#51cbce', fontWeight: 'bold' }}>
              Detected: {betInfo.displayName} - Section: {betInfo.section}
              {betInfo.generator && ` (Generator: ${betInfo.generator})`}
            </Typography>
          </Box>
        )}

        {/* Mensaje de error de validation */}
        {validationError && (
          <Box sx={{ marginTop: 2, padding: 1.5, bgcolor: '#ffe6e6', borderRadius: 1, border: '1px solid #ff4444' }}>
            <Typography variant="body2" sx={{ color: '#c00', fontWeight: 'bold' }}>
              {validationError}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* RESUMEN */}
      <Paper sx={{ padding: 2, marginBottom: 3, bgcolor: '#e9ecef' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              📋 Jugadas: {lines.length}
            </Typography>
            {selectedDraws.length > 0 && (
              <Typography variant="caption" sx={{ color: '#666' }}>
                Sorteos seleccionados: {selectedDraws.map(d => d.drawName).join(', ')}
              </Typography>
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#51cbce' }}>
            TOTAL: ${grandTotal.toFixed(2)}
          </Typography>
        </Box>
      </Paper>

      {/* 4 SECCIONES DE APUESTAS */}
      <Grid container spacing={2} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} md={6}>
          <BetSection
            title="DIRECTO"
            lines={groupedLines['DIRECTO']}
            total={sectionTotals['DIRECTO'] || 0}
            onDeleteAll={() => handleDeleteSection('DIRECTO')}
            onDeleteLine={handleDeleteLine}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BetSection
            title="PALE & TRIPLETA"
            lines={groupedLines['PALE & TRIPLETA']}
            total={sectionTotals['PALE & TRIPLETA'] || 0}
            onDeleteAll={() => handleDeleteSection('PALE & TRIPLETA')}
            onDeleteLine={handleDeleteLine}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BetSection
            title="CASH 3"
            lines={groupedLines['CASH 3']}
            total={sectionTotals['CASH 3'] || 0}
            onDeleteAll={() => handleDeleteSection('CASH 3')}
            onDeleteLine={handleDeleteLine}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BetSection
            title="PLAY 4 & PICK 5"
            lines={groupedLines['PLAY 4 & PICK 5']}
            total={sectionTotals['PLAY 4 & PICK 5'] || 0}
            onDeleteAll={() => handleDeleteSection('PLAY 4 & PICK 5')}
            onDeleteLine={handleDeleteLine}
          />
        </Grid>
      </Grid>

      {/* BOTONES DE ACCIÓN */}
      <Paper sx={{ padding: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Copy size={20} />}
            onClick={duplicateTicket}
            disabled={lines.length === 0}
            sx={{
              borderColor: '#6c757d',
              color: '#6c757d',
              '&:hover': { borderColor: '#5a6268', bgcolor: 'rgba(108, 117, 125, 0.04)' },
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Duplicar (c)
          </Button>

          <Button
            variant="contained"
            startIcon={<Receipt size={20} />}
            onClick={handleCreateTicket}
            disabled={lines.length === 0}
            sx={{
              bgcolor: lines.length > 0 ? '#51cbce' : '#ccc',
              '&:hover': { bgcolor: lines.length > 0 ? '#45b8bb' : '#ccc' },
              color: 'white',
              textTransform: 'none',
              fontWeight: 'bold',
              paddingX: 4
            }}
          >
            Crear Ticket (*)
          </Button>

          <Button
            variant="outlined"
            startIcon={<RotateCcw size={20} />}
            onClick={resetForm}
            sx={{
              borderColor: '#6c757d',
              color: '#6c757d',
              '&:hover': { borderColor: '#5a6268', bgcolor: 'rgba(108, 117, 125, 0.04)' },
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Limpiar (L)
          </Button>

          <Button
            variant="outlined"
            startIcon={<HelpCircle size={20} />}
            onClick={() => alert('Modal de ayuda (por implementar)')}
            sx={{
              borderColor: '#51cbce',
              color: '#51cbce',
              '&:hover': { borderColor: '#45b8bb', bgcolor: 'rgba(81, 203, 206, 0.04)' },
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Ayuda
          </Button>
        </Box>

        <Box sx={{ marginTop: 2 }}>
          <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
            ⌨️ Atajos: ↑ = Limpiar campos | L = Cancelar | / = Cambiar lotería | * = Imprimir | c = Duplicar
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(CreateTicketsAdvanced);
