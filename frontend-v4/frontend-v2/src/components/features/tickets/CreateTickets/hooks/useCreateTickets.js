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
 * Get list of sortitions - matching V1 colors exactly (ALL 70+ sortitions)
 */
const getSortitions = () => [
  { id: 970, name: 'Anguila 10am', color: 'rgb(85, 85, 85)', textColor: 'white', available: true, image: 'https://s3.amazonaws.com/bancaflottery/anguila.png' },
  { id: 9, name: 'REAL', color: 'rgb(255, 0, 0)', textColor: 'white', available: true, image: 'https://s3.amazonaws.com/bancaflottery/real.png' },
  { id: 6, name: 'GANA MAS', color: 'rgb(255, 0, 0)', textColor: 'white', available: true, image: 'https://s3.amazonaws.com/bancaflottery/ganamas.png' },
  { id: 1, name: 'LA PRIMERA', color: 'rgb(255, 25, 0)', textColor: 'white', available: true, image: 'https://s3.amazonaws.com/bancaflottery/laprimera.png' },
  { id: 211, name: 'LA SUERTE', color: 'rgb(255, 0, 0)', textColor: 'white', available: true, image: 'https://s3.amazonaws.com/bancaflottery/lasuerte.png' },
  { id: 277, name: 'LOTEDOM', color: 'rgb(255, 0, 0)', textColor: 'white', available: true, image: 'https://s3.amazonaws.com/bancaflottery/lotedom.png' },
  { id: 61, name: 'TEXAS MORNING', color: 'rgb(85, 85, 85)', textColor: 'white', available: true, image: 'https://s3.amazonaws.com/bancaflottery/b0b5f7fd-cbb3-4036-bf1b-412ffa0a1cd5.png' },
  { id: 63, name: 'TEXAS EVENING', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 62, name: 'TEXAS DAY', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 64, name: 'TEXAS NIGHT', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 541, name: 'King Lottery AM', color: 'rgb(255, 37, 0)', textColor: 'white', available: true },
  { id: 673, name: 'Anguila 1pm', color: 'rgb(242, 223, 16)', textColor: 'black', available: true },
  { id: 2, name: 'NEW YORK DAY', color: 'rgb(1, 48, 255)', textColor: 'white', available: true },
  { id: 4, name: 'FLORIDA AM', color: 'rgb(0, 0, 0)', textColor: 'white', available: true },
  { id: 34, name: 'INDIANA MIDDAY', color: 'rgb(249, 100, 55)', textColor: 'white', available: true },
  { id: 35, name: 'INDIANA EVENING', color: 'rgb(13, 123, 203)', textColor: 'white', available: true },
  { id: 13, name: 'GEORGIA-MID AM', color: 'rgb(173, 6, 176)', textColor: 'white', available: true },
  { id: 16, name: 'NEW JERSEY AM', color: 'rgb(23, 169, 1)', textColor: 'white', available: true },
  { id: 607, name: 'L.E. PUERTO RICO 2PM', color: 'rgb(17, 200, 20)', textColor: 'white', available: true },
  { id: 38, name: 'DIARIA 11AM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 18, name: 'CONNECTICUT AM', color: 'rgb(255, 255, 255)', textColor: 'black', available: true },
  { id: 30, name: 'PENN MIDDAY', color: 'rgb(113, 252, 205)', textColor: 'black', available: true },
  { id: 376, name: 'NY AM 6x1', color: 'rgb(252, 172, 0)', textColor: 'white', available: true },
  { id: 411, name: 'FL AM 6X1', color: 'rgb(249, 172, 3)', textColor: 'white', available: true },
  { id: 75, name: 'MARYLAND MIDDAY', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 65, name: 'VIRGINIA AM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 609, name: 'DELAWARE AM', color: 'rgb(1, 157, 196)', textColor: 'white', available: true },
  { id: 1036, name: 'LA CHICA', color: 'rgb(85, 85, 85)', textColor: 'white', available: true },
  { id: 73, name: 'SOUTH CAROLINA AM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 20, name: 'CALIFORNIA AM', color: 'rgb(0, 189, 225)', textColor: 'white', available: true },
  { id: 82, name: 'MASS AM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 244, name: 'NORTH CAROLINA AM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 24, name: 'CHICAGO AM', color: 'rgb(2, 164, 205)', textColor: 'white', available: true },
  { id: 39, name: 'DIARIA 3PM', color: 'rgb(0, 185, 207)', textColor: 'white', available: true },
  { id: 1432, name: 'LA SUERTE 6:00pm', color: 'rgb(255, 9, 0)', textColor: 'white', available: true },
  { id: 674, name: 'Anguila 6PM', color: 'rgb(242, 209, 24)', textColor: 'black', available: true },
  { id: 10, name: 'LOTEKA', color: 'rgb(255, 1, 1)', textColor: 'white', available: true },
  { id: 1168, name: 'LA PRIMERA 8PM', color: 'rgb(234, 10, 10)', textColor: 'white', available: true },
  { id: 7, name: 'NACIONAL', color: 'rgb(255, 9, 0)', textColor: 'white', available: true },
  { id: 8, name: 'QUINIELA PALE', color: 'rgb(217, 27, 14)', textColor: 'white', available: true },
  { id: 675, name: 'Anguila 9pm', color: 'rgb(245, 217, 5)', textColor: 'black', available: true },
  { id: 542, name: 'King Lottery PM', color: 'rgb(204, 16, 54)', textColor: 'white', available: true },
  { id: 40, name: 'DIARIA 9PM', color: 'rgb(2, 144, 204)', textColor: 'white', available: true },
  { id: 5, name: 'FLORIDA PM', color: 'rgb(0, 0, 0)', textColor: 'white', available: true },
  { id: 3, name: 'NEW YORK NIGHT', color: 'rgb(0, 30, 255)', textColor: 'white', available: true },
  { id: 17, name: 'NEW JERSEY PM', color: 'rgb(13, 157, 0)', textColor: 'white', available: true },
  { id: 14, name: 'GEORGIA EVENING', color: 'rgb(233, 1, 255)', textColor: 'white', available: true },
  { id: 19, name: 'CONNECTICUT PM', color: 'rgb(255, 255, 255)', textColor: 'black', available: true },
  { id: 31, name: 'PENN EVENING', color: 'rgb(130, 251, 161)', textColor: 'black', available: true },
  { id: 377, name: 'NY PM 6x1', color: 'rgb(255, 181, 0)', textColor: 'white', available: true },
  { id: 412, name: 'FL PM 6X1', color: 'rgb(254, 164, 0)', textColor: 'white', available: true },
  { id: 76, name: 'MARYLAND EVENING', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 53, name: 'SUPER PALE TARDE', color: 'rgb(0, 182, 188)', textColor: 'white', available: true },
  { id: 11, name: 'FL PICK2 AM', color: 'rgb(0, 166, 187)', textColor: 'white', available: true },
  { id: 21, name: 'CALIFORNIA PM', color: 'rgb(0, 169, 187)', textColor: 'white', available: true },
  { id: 83, name: 'MASS PM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 55, name: 'SUPER PALE NY-FL AM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 12, name: 'FL PICK2 PM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 56, name: 'SUPER PALE NY-FL PM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 74, name: 'SOUTH CAROLINA PM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 66, name: 'VIRGINIA PM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 245, name: 'NORTH CAROLINA PM', color: 'rgb(55, 185, 249)', textColor: 'white', available: true },
  { id: 54, name: 'SUPER PALE NOCHE', color: 'rgb(4, 180, 231)', textColor: 'white', available: true },
  { id: 15, name: 'GEORGIA NIGHT', color: 'rgb(255, 1, 242)', textColor: 'white', available: true },
  { id: 610, name: 'DELAWARE PM', color: 'rgb(0, 174, 214)', textColor: 'white', available: true },
  { id: 25, name: 'CHICAGO PM', color: 'rgb(0, 188, 235)', textColor: 'white', available: true },
  { id: 1300, name: 'PANAMA MIERCOLES', color: 'rgb(85, 85, 85)', textColor: 'white', available: true },
  { id: 1366, name: 'PANAMA DOMINGO', color: 'rgb(255, 255, 255)', textColor: 'black', available: true },
  { id: 608, name: 'L.E. PUERTO RICO 10PM', color: 'rgb(180, 19, 59)', textColor: 'white', available: true },
];

export default useCreateTickets;
