import { useState, useCallback } from 'react';

/**
 * Custom hook for managing CreateTickets state and logic
 */
const useCreateTickets = () => {
  // Banca and sortition selection
  const [selectedBanca, setSelectedBanca] = useState('');
  const [selectedSortition, setSelectedSortition] = useState(61); // TEXAS MORNING by default

  // Settings
  const [discountEnabled, setDiscountEnabled] = useState(true);
  const [multiLotteryEnabled, setMultiLotteryEnabled] = useState(false);
  const [sendSmsEnabled, setSendSmsEnabled] = useState(false);

  // Playing area
  const [digits, setDigits] = useState('');
  const [amount, setAmount] = useState('');

  // Statistics
  const [todayPlays, setTodayPlays] = useState(0);
  const [groupSold, setGroupSold] = useState(0);
  const [bancaSold, setBancaSold] = useState(0);

  // Plays by type
  const [directoPlays, setDirectoPlays] = useState([]);
  const [paleTripletaPlays, setPaleTripletaPlays] = useState([]);
  const [cash3Plays, setCash3Plays] = useState([]);
  const [play4Pick5Plays, setPlay4Pick5Plays] = useState([]);

  // Modals
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  /**
   * Calculate total plays and amount
   */
  const getTotals = useCallback(() => {
    const allPlays = [
      ...directoPlays,
      ...paleTripletaPlays,
      ...cash3Plays,
      ...play4Pick5Plays
    ];
    const totalPlays = allPlays.length;
    const totalAmount = allPlays.reduce((sum, play) => sum + play.amount, 0);

    return { totalPlays, totalAmount };
  }, [directoPlays, paleTripletaPlays, cash3Plays, play4Pick5Plays]);

  /**
   * Get current sortition data
   */
  const getCurrentSortition = useCallback(() => {
    const sortitions = getSortitions();
    return sortitions.find(s => s.id === selectedSortition) || sortitions[6];
  }, [selectedSortition]);

  /**
   * Handle add play
   */
  const handleAddPlay = useCallback(() => {
    if (!digits || !amount) return;

    const newPlay = {
      id: Date.now(),
      lot: selectedSortition,
      num: digits,
      amount: parseFloat(amount)
    };

    // Determine play type based on number of digits
    if (digits.length === 2) {
      setPaleTripletaPlays(prev => [...prev, newPlay]);
    } else if (digits.length === 3) {
      setCash3Plays(prev => [...prev, newPlay]);
    } else if (digits.length >= 4) {
      setPlay4Pick5Plays(prev => [...prev, newPlay]);
    } else {
      setDirectoPlays(prev => [...prev, newPlay]);
    }

    // Clear fields
    setDigits('');
    setAmount('');
  }, [digits, amount, selectedSortition]);

  /**
   * Handle delete play
   */
  const handleDeletePlay = useCallback((playId, type) => {
    switch (type) {
      case 'directo':
        setDirectoPlays(prev => prev.filter(play => play.id !== playId));
        break;
      case 'pale':
        setPaleTripletaPlays(prev => prev.filter(play => play.id !== playId));
        break;
      case 'cash3':
        setCash3Plays(prev => prev.filter(play => play.id !== playId));
        break;
      case 'play4':
        setPlay4Pick5Plays(prev => prev.filter(play => play.id !== playId));
        break;
    }
  }, []);

  /**
   * Handle delete all plays of a type
   */
  const handleDeleteAllPlays = useCallback((type) => {
    switch (type) {
      case 'directo':
        setDirectoPlays([]);
        break;
      case 'pale':
        setPaleTripletaPlays([]);
        break;
      case 'cash3':
        setCash3Plays([]);
        break;
      case 'play4':
        setPlay4Pick5Plays([]);
        break;
    }
  }, []);

  /**
   * Handle create ticket
   */
  const handleCreateTicket = useCallback(() => {
    const { totalPlays, totalAmount } = getTotals();

    if (totalPlays === 0) {
      alert('Debe agregar al menos una jugada');
      return;
    }

    const ticketData = {
      banca: selectedBanca,
      sortition: selectedSortition,
      plays: {
        directo: directoPlays,
        pale: paleTripletaPlays,
        cash3: cash3Plays,
        play4: play4Pick5Plays
      },
      totalAmount,
      totalPlays,
      settings: {
        discount: discountEnabled,
        multiLottery: multiLotteryEnabled,
        sendSms: sendSmsEnabled
      }
    };

    console.log('Creating ticket:', ticketData);
    alert('Ticket creado exitosamente ✅');

    // Clear form
    setDirectoPlays([]);
    setPaleTripletaPlays([]);
    setCash3Plays([]);
    setPlay4Pick5Plays([]);
  }, [
    selectedBanca,
    selectedSortition,
    directoPlays,
    paleTripletaPlays,
    cash3Plays,
    play4Pick5Plays,
    discountEnabled,
    multiLotteryEnabled,
    sendSmsEnabled,
    getTotals
  ]);

  return {
    // State
    selectedBanca,
    setSelectedBanca,
    selectedSortition,
    setSelectedSortition,
    discountEnabled,
    setDiscountEnabled,
    multiLotteryEnabled,
    setMultiLotteryEnabled,
    sendSmsEnabled,
    setSendSmsEnabled,
    digits,
    setDigits,
    amount,
    setAmount,
    todayPlays,
    groupSold,
    bancaSold,
    directoPlays,
    paleTripletaPlays,
    cash3Plays,
    play4Pick5Plays,
    helpModalOpen,
    setHelpModalOpen,

    // Computed
    getTotals,
    getCurrentSortition,

    // Handlers
    handleAddPlay,
    handleDeletePlay,
    handleDeleteAllPlays,
    handleCreateTicket,

    // Data
    bancasList: getBancasList(),
    sortitions: getSortitions(),
  };
};

/**
 * Get list of bancas
 */
const getBancasList = () => [
  'LA CENTRAL 01', 'LA CENTRAL 02', 'LA CENTRAL 03', 'LA CENTRAL 04', 'LA CENTRAL 05',
  'LA CENTRAL 06', 'LA CENTRAL 07', 'LA CENTRAL 08', 'LA CENTRAL 09', 'LA CENTRAL 10',
  'CHANS 114', 'CHANS 116', 'CHANS 127', 'CARIBBEAN 154', 'CARIBBEAN 166'
];

/**
 * Get list of sortitions (showing first 20 for simplicity)
 */
const getSortitions = () => [
  { id: 970, name: 'Anguila 10am', color: '#555', available: true },
  { id: 9, name: 'REAL', color: '#ff0000', available: true },
  { id: 6, name: 'GANA MAS', color: '#ff0000', available: true },
  { id: 1, name: 'LA PRIMERA', color: '#ff1900', available: true },
  { id: 211, name: 'LA SUERTE', color: '#ff0000', available: true },
  { id: 277, name: 'LOTEDOM', color: '#ff0000', available: true },
  { id: 61, name: 'TEXAS MORNING', color: '#555', available: true },
  { id: 63, name: 'TEXAS EVENING', color: '#37b9f9', available: true },
  { id: 62, name: 'TEXAS DAY', color: '#37b9f9', available: true },
  { id: 64, name: 'TEXAS NIGHT', color: '#37b9f9', available: true },
  { id: 541, name: 'King Lottery AM', color: '#ff2500', available: true },
  { id: 673, name: 'Anguila 1pm', color: '#f2df10', available: true },
  { id: 2, name: 'NEW YORK DAY', color: '#0130ff', available: true },
  { id: 4, name: 'FLORIDA AM', color: '#000', available: true },
  { id: 34, name: 'INDIANA MIDDAY', color: '#f96437', available: true },
  { id: 35, name: 'INDIANA EVENING', color: '#0d7bcb', available: true },
  { id: 13, name: 'GEORGIA-MID AM', color: '#ad06b0', available: true },
  { id: 16, name: 'NEW JERSEY AM', color: '#17a901', available: true },
  { id: 607, name: 'L.E. PUERTO RICO 2PM', color: '#11c814', available: true },
  { id: 38, name: 'DIARIA 11AM', color: '#37b9f9', available: true },
];

export default useCreateTickets;
