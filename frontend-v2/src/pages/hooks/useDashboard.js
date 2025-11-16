import { useState, useCallback } from 'react';

/**
 * Custom hook for managing Dashboard state and logic
 */
const useDashboard = () => {
  // Mock data
  const bancaCodes = ['LAN-0001', 'LAN-0010', 'LAN-0016', 'LAN-0063', 'LAN-0101'];
  const bancos = ['Banco Popular', 'Banco BHD León', 'Banco Reservas', 'Banco Santa Cruz'];
  const sortitions = ['DIARIA 11AM', 'LOTEDOM', 'LA PRIMERA', 'TEXAS DAY', 'King Lottery AM'];
  const playTypes = ['Cash3 Box', 'Bolita 2', 'Pick5 Straight', 'Directo', 'Play4 Straight'];
  const quickPublishSortitions = ['PANAMA DOMINGO', 'LA CHICA', 'PANAMA MIERCOLES', 'TEXAS MORNING'];

  // State for Cobros & Pagos card
  const [activeMode, setActiveMode] = useState('cobro'); // 'cobro' or 'pago'
  const [selectedBancaCode, setSelectedBancaCode] = useState('');
  const [selectedBanco, setSelectedBanco] = useState('');
  const [cobroPagoMonto, setCobroPagoMonto] = useState('');

  // State for Jugadas por sorteo card
  const [selectedSortition, setSelectedSortition] = useState('DIARIA 11AM');
  const [jugadas, setJugadas] = useState([]); // Empty by default

  // State for Publicación rápida card
  const [selectedQuickPublish, setSelectedQuickPublish] = useState('');

  // State for Bloqueo rápido card
  const [selectedBloqueoSortition, setSelectedBloqueoSortition] = useState('');
  const [selectedPlayType, setSelectedPlayType] = useState('');
  const [jugadaInput, setJugadaInput] = useState('');
  const [blockedNumbers, setBlockedNumbers] = useState([]);

  // Statistics
  const bancasVendiendo = {
    martes: 72,
    miercoles: 79,
    hoy: 14,
  };

  /**
   * Handle mode change (Cobro/Pago)
   */
  const handleModeChange = useCallback((mode) => {
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
  const handleSortitionChange = useCallback((event) => {
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
  const handleRemoveBlockedNumber = useCallback((id) => {
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

    // State - Publicación rápida
    selectedQuickPublish,

    // State - Bloqueo rápido
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
