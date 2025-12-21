import { useState, useCallback, useEffect } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import api from '@services/api';

// Types
interface Jugada {
  tipo: string;
  numero: string;
  monto: number;
}

interface BlockedNumber {
  id: number;
  sortition: string;
  playType: string;
  number: string;
}

interface DaySales {
  dayName: string;
  count: number;
}

interface BettingPoolSalesDto {
  bettingPoolId: number;
  totalSold: number;
}

type ActiveMode = 'cobro' | 'pago';

/**
 * Custom hook for managing Dashboard state and logic
 */
const useDashboard = () => {
  // Mock data
  const bancaCodes: string[] = ['LAN-0001', 'LAN-0010', 'LAN-0016', 'LAN-0063', 'LAN-0101'];
  const bancos: string[] = ['Banco Popular', 'Banco BHD León', 'Banco Reservas', 'Banco Santa Cruz'];
  const sortitions: string[] = ['DIARIA 11AM', 'LOTEDOM', 'LA PRIMERA', 'TEXAS DAY', 'King Lottery AM'];
  const playTypes: string[] = ['Cash3 Box', 'Bolita 2', 'Pick5 Straight', 'Directo', 'Play4 Straight'];
  const quickPublishSortitions: string[] = ['PANAMA DOMINGO', 'LA CHICA', 'PANAMA MIERCOLES', 'TEXAS MORNING'];

  // State for Cobros & Pagos card
  const [activeMode, setActiveMode] = useState<ActiveMode>('cobro');
  const [selectedBancaCode, setSelectedBancaCode] = useState<string>('');
  const [selectedBanco, setSelectedBanco] = useState<string>('');
  const [cobroPagoMonto, setCobroPagoMonto] = useState<string>('');

  // State for Jugadas por sorteo card
  const [selectedSortition, setSelectedSortition] = useState<string>('DIARIA 11AM');
  const [jugadas, setJugadas] = useState<Jugada[]>([]);

  // State for Quick Publication card
  const [selectedQuickPublish, setSelectedQuickPublish] = useState<string>('');

  // State for Quick Block card
  const [selectedBloqueoSortition, setSelectedBloqueoSortition] = useState<string>('');
  const [selectedPlayType, setSelectedPlayType] = useState<string>('');
  const [jugadaInput, setJugadaInput] = useState<string>('');
  const [blockedNumbers, setBlockedNumbers] = useState<BlockedNumber[]>([]);

  // Statistics - Bancas vendiendo últimos 3 días
  const [bancasVendiendo, setBancasVendiendo] = useState<DaySales[]>([]);

  // Helper to get Spanish day name
  const getDayName = (date: Date): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  };

  // Fetch bancas vendiendo for last 3 days
  useEffect(() => {
    const fetchBancasVendiendo = async () => {
      try {
        const today = new Date();
        const results: DaySales[] = [];

        for (let i = 2; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayName = i === 0 ? 'Hoy' : getDayName(date);

          try {
            const response = await api.get<BettingPoolSalesDto[]>(
              `/reports/sales/by-betting-pool?startDate=${dateStr}&endDate=${dateStr}`
            );
            // Count betting pools with sales > 0
            const poolsWithSales = (response || []).filter(p => p.totalSold > 0).length;
            results.push({ dayName, count: poolsWithSales });
          } catch {
            results.push({ dayName, count: 0 });
          }
        }

        setBancasVendiendo(results);
      } catch (err) {
        console.error('Error fetching bancas vendiendo:', err);
        setBancasVendiendo([]);
      }
    };

    fetchBancasVendiendo();
  }, []);

  /**
   * Handle mode change (Cobro/Pago)
   */
  const handleModeChange = useCallback((mode: ActiveMode) => {
    setActiveMode(mode);
  }, []);

  /**
   * Handle create cobro/pago
   */
  const handleCreateCobroPago = useCallback(() => {
    if (!selectedBancaCode || !selectedBanco || !cobroPagoMonto) {
      alert('Por favor complete todos los campos');
      return;
    }

    alert(`${activeMode === 'cobro' ? 'Cobro' : 'Pago'} creado:\nBanca: ${selectedBancaCode}\nBanco: ${selectedBanco}\nMonto: $${cobroPagoMonto}`);

    // Reset form
    setSelectedBancaCode('');
    setSelectedBanco('');
    setCobroPagoMonto('');
  }, [activeMode, selectedBancaCode, selectedBanco, cobroPagoMonto]);

  /**
   * Handle sortition change for jugadas
   */
  const handleSortitionChange = useCallback((event: SelectChangeEvent<string>) => {
    setSelectedSortition(event.target.value);
    // In a real app, this would fetch jugadas for the selected sortition
    setJugadas([]);
  }, []);

  /**
   * Handle quick publish
   */
  const handleQuickPublish = useCallback(() => {
    if (!selectedQuickPublish) {
      alert('Por favor seleccione un sorteo');
      return;
    }

    alert(`Publicar resultados para: ${selectedQuickPublish}`);
    // TODO: Call API to publish results
  }, [selectedQuickPublish]);

  /**
   * Handle add number to block
   */
  const handleAddNumberToBlock = useCallback(() => {
    if (!selectedBloqueoSortition || !selectedPlayType || !jugadaInput) {
      alert('Por favor complete todos los campos');
      return;
    }

    const newNumber = {
      id: Date.now(),
      sortition: selectedBloqueoSortition,
      playType: selectedPlayType,
      number: jugadaInput,
    };

    setBlockedNumbers(prev => [...prev, newNumber]);
    setJugadaInput('');
  }, [selectedBloqueoSortition, selectedPlayType, jugadaInput]);

  /**
   * Handle remove blocked number
   */
  const handleRemoveBlockedNumber = useCallback((id: number) => {
    setBlockedNumbers(prev => prev.filter(num => num.id !== id));
  }, []);

  /**
   * Handle block numbers
   */
  const handleBlockNumbers = useCallback(() => {
    if (blockedNumbers.length === 0) {
      alert('No hay números para bloquear');
      return;
    }

    alert(`Bloquear ${blockedNumbers.length} número(s)`);
    // TODO: Call API to block numbers
    setBlockedNumbers([]);
  }, [blockedNumbers]);

  /**
   * Handle navigate to dashboard
   */
  const handleNavigateToDashboard = useCallback(() => {
    alert('Navegar a Dashboard');
    // TODO: Navigate to full dashboard
  }, []);

  /**
   * Handle navigate to dashboard operativo
   */
  const handleNavigateToDashboardOperativo = useCallback(() => {
    alert('Navegar a Dashboard Operativo');
    // TODO: Navigate to operational dashboard
  }, []);

  return {
    // Data
    bancaCodes,
    bancos,
    sortitions,
    playTypes,
    quickPublishSortitions,
    bancasVendiendo,

    // State - Cobros & Pagos
    activeMode,
    selectedBancaCode,
    selectedBanco,
    cobroPagoMonto,

    // State - Jugadas por sorteo
    selectedSortition,
    jugadas,

    // State - Quick Publication
    selectedQuickPublish,

    // State - Quick Block
    selectedBloqueoSortition,
    selectedPlayType,
    jugadaInput,
    blockedNumbers,

    // Setters
    setSelectedBancaCode,
    setSelectedBanco,
    setCobroPagoMonto,
    setSelectedQuickPublish,
    setSelectedBloqueoSortition,
    setSelectedPlayType,
    setJugadaInput,

    // Handlers
    handleModeChange,
    handleCreateCobroPago,
    handleSortitionChange,
    handleQuickPublish,
    handleAddNumberToBlock,
    handleRemoveBlockedNumber,
    handleBlockNumbers,
    handleNavigateToDashboard,
    handleNavigateToDashboardOperativo,
  };
};

export default useDashboard;
