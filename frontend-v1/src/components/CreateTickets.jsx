import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LotteryHelpModal from './modals/LotteryHelpModal';
import '../assets/css/create-tickets.css';

const CreateTickets = () => {
  const navigate = useNavigate();
  const [selectedBanca, setSelectedBanca] = useState('');
  const [selectedDraw, setSelectedDraw] = useState(61); // TEXAS MORNING por defecto
  const [currentDrawImage, setCurrentDrawImage] = useState('https://s3.amazonaws.com/bancaflottery/b0b5f7fd-cbb3-4036-bf1b-412ffa0a1cd5.png');
  const [currentDrawName, setCurrentDrawName] = useState('TEXAS MORNING');
  
  // Configuraciones
  const [discountEnabled, setDiscountEnabled] = useState(true);
  const [multiLotteryEnabled, setMultiLotteryEnabled] = useState(false);
  const [sendSmsEnabled, setSendSmsEnabled] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // Área de jugadas
  const [digits, setDigits] = useState('');
  const [availability, setAvailability] = useState('N/A');
  const [amount, setAmount] = useState('');
  
  // Estadísticas
  const [totalPlays, setTotalPlays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [todayPlays, setTodayPlays] = useState(0);
  const [groupSold, setGroupSold] = useState(0);
  const [bancaSold, setBancaSold] = useState(0);
  
  // Jugadas por tipo
  const [directoPlays, setDirectoPlays] = useState([]);
  const [paleTripletaPlays, setPaleTripletaPlays] = useState([]);
  const [cash3Plays, setCash3Plays] = useState([]);
  const [play4Pick5Plays, setPlay4Pick5Plays] = useState([]);

  // Lista de bancas para autocompletado
  const bancasList = [
    'LA CENTRAL 01', 'LA CENTRAL 02', 'LA CENTRAL 03', 'LA CENTRAL 04', 'LA CENTRAL 05',
    'LA CENTRAL 06', 'LA CENTRAL 07', 'LA CENTRAL 08', 'LA CENTRAL 09', 'LA CENTRAL 10',
    'CHANS 114', 'CHANS 116', 'CHANS 127', 'CARIBBEAN 154', 'CARIBBEAN 166'
  ];

  // Lista de draws/sorteos con sus colores y estados (ajustados según la imagen)
  const draws = [
    { id: 970, name: 'Anguila 10am', color: 'rgb(85, 85, 85)', textColor: 'white', available: true },
    { id: 9, name: 'REAL', color: 'rgb(255, 0, 0)', textColor: 'white', available: true },
    { id: 6, name: 'GANA MAS', color: 'rgb(255, 0, 0)', textColor: 'white', available: true },
    { id: 1, name: 'LA PRIMERA', color: 'rgb(255, 25, 0)', textColor: 'white', available: true },
    { id: 211, name: 'LA SUERTE', color: 'rgb(255, 0, 0)', textColor: 'white', available: true },
    { id: 277, name: 'LOTEDOM', color: 'rgb(255, 0, 0)', textColor: 'white', available: true },
    { id: 61, name: 'TEXAS MORNING', color: 'rgb(85, 85, 85)', textColor: 'white', available: true, selected: true },
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
    { id: 608, name: 'L.E. PUERTO RICO 10PM', color: 'rgb(180, 19, 59)', textColor: 'white', available: true }
  ];

  const handleBancaChange = (e) => {
    setSelectedBanca(e.target.value);
  };

  const handleDrawSelect = (draw) => {
    if (draw.available && !draw.closed) {
      setSelectedDraw(draw.id);
      setCurrentDrawName(draw.name);
      // Aquí se actualizaría la imagen del draw/sorteo
    }
  };

  const handleDigitsChange = (e) => {
    setDigits(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleAddPlay = () => {
    if (!digits || !amount) return;

    const newPlay = {
      id: Date.now(),
      lot: selectedDraw,
      num: digits,
      amount: parseFloat(amount)
    };

    // Determinar el tipo de jugada basado en el número de dígitos
    if (digits.length === 2) {
      setPaleTripletaPlays(prev => [...prev, newPlay]);
    } else if (digits.length === 3) {
      setCash3Plays(prev => [...prev, newPlay]);
    } else if (digits.length >= 4) {
      setPlay4Pick5Plays(prev => [...prev, newPlay]);
    } else {
      setDirectoPlays(prev => [...prev, newPlay]);
    }

    // Limpiar campos
    setDigits('');
    setAmount('');
    setAvailability('N/A');
    
    // Actualizar estadísticas
    updateStatistics();
  };

  const updateStatistics = () => {
    const allPlays = [...directoPlays, ...paleTripletaPlays, ...cash3Plays, ...play4Pick5Plays];
    const total = allPlays.reduce((sum, play) => sum + play.amount, 0);
    setTotalPlays(allPlays.length);
    setTotalAmount(total);
  };

  const handleDeletePlay = (playId, type) => {
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
    updateStatistics();
  };

  const handleDeleteAllPlays = (type) => {
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
    updateStatistics();
  };

  const handleCreateTicket = () => {
    const ticketData = {
      banca: selectedBanca,
      draw: selectedDraw,
      plays: {
        directo: directoPlays,
        pale: paleTripletaPlays,
        cash3: cash3Plays,
        play4: play4Pick5Plays
      },
      totalAmount: totalAmount,
      totalPlays: totalPlays,
      settings: {
        discount: discountEnabled,
        multiLottery: multiLotteryEnabled,
        sendSms: sendSmsEnabled
      }
    };

    console.log('Creando ticket:', ticketData);
    alert('Ticket creado exitosamente ✅');
    
    // Limpiar formulario
    setDirectoPlays([]);
    setPaleTripletaPlays([]);
    setCash3Plays([]);
    setPlay4Pick5Plays([]);
    setTotalPlays(0);
    setTotalAmount(0);
  };

  const PlayTable = ({ title, plays, type }) => {
    const total = plays.reduce((sum, play) => sum + play.amount, 0);
    
    return (
      <div className="plays-table-wrapper">
        <div className="plays-table">
          <div className="row">
            <div className="table-name col-12">{title}</div>
          </div>
          
          <div className="row table-headers">
            <div className="table-column col-3">LOT</div>
            <div className="table-column col-4">NUM</div>
            <div className="table-column col-3">
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="dollar-sign" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 512" className="svg-inline--fa fa-dollar-sign fa-w-9">
                <path fill="currentColor" d="M209.2 233.4l-108-31.6C88.7 198.2 80 186.5 80 173.5c0-16.3 13.2-29.5 29.5-29.5h66.3c12.2 0 24.2 3.7 34.2 10.5 6.1 4.1 14.3 3.1 19.5-2l34.8-34c7.1-6.9 6.1-18.4-1.8-24.5C238 74.8 207.4 64.1 176 64V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48h-2.5C45.8 64-5.4 118.7.5 183.6c4.2 46.1 39.4 83.6 83.8 96.6l102.5 30c12.5 3.7 21.2 15.3 21.2 28.3 0 16.3-13.2 29.5-29.5 29.5h-66.3C100 368 88 364.3 78 357.5c-6.1-4.1-14.3-3.1-19.5 2l-34.8 34c-7.1 6.9-6.1 18.4 1.8 24.5 24.5 19.2 55.1 29.9 86.5 30v48c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-48.2c46.6-.9 90.3-28.6 105.7-72.7 21.5-61.6-14.6-124.8-72.5-141.7z"></path>
              </svg>
            </div>
            <div className="table-column clickable col-2" onClick={() => handleDeleteAllPlays(type)}>
              <svg aria-labelledby="svg-inline--fa-title" data-prefix="fas" data-icon="trash" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="svg-inline--fa fa-trash fa-w-14">
                <title id="svg-inline--fa-title">Eliminar todas las jugadas</title>
                <path fill="currentColor" d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path>
              </svg>
            </div>
          </div>
          
          <div className="row">
            <div className="table-body container-fluid">
              {plays.map((play) => (
                <div key={play.id} className="row play-row">
                  <div className="col-3">{play.lot}</div>
                  <div className="col-4">{play.num}</div>
                  <div className="col-3">${play.amount.toFixed(2)}</div>
                  <div className="col-2">
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeletePlay(play.id, type)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="row">
            <div className="table-footer col-12">
              TOTAL: ${total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card" style={{
            backgroundImage: 'url("a257a6175cc55d66ddc5fbd168546e0d.png")',
            backgroundColor: 'rgba(55, 185, 249, 0.2)'
          }}>
            <div className="card-body">
              {/* Header con selector de banca y sorteo actual */}
              <div className="row header-inline">
                <div className="col-auto header-banca">
                  <div className="banca-inline">
                    <label className="banca-label">Banca</label>
                    <div className="el-autocomplete">
                      <div className="el-input el-input--small">
                        <input
                          type="text"
                          autoComplete="off"
                          className="el-input__inner"
                          placeholder="Seleccionar banca"
                          value={selectedBanca}
                          onChange={handleBancaChange}
                          list="bancas-list"
                        />
                        <datalist id="bancas-list">
                          {bancasList.map((banca, index) => (
                            <option key={index} value={banca} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col header-center">
                  <div className="current-sortition current-sortition-center">
                    <img
                      id="current-sortition-image"
                      src={currentDrawImage}
                      alt="current-draw-image"
                      className="sortition-image"
                    />
                    <span className="font-weight-bold">{currentDrawName.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Selector de draws/sorteos */}
              <div className="row">
                <div className="col">
                  <fieldset className="form-group">
                    <div role="group">
                      <div id="sortition-button-group">
                        {draws.map((draw) => (
                          <div
                            key={draw.id}
                            id={`sortition-${draw.id}`}
                            className={`sortition-option ${draw.selected ? 'selected' : ''} ${draw.closed ? 'closed' : ''}`}
                            style={{
                              backgroundColor: draw.color,
                              color: draw.textColor,
                              fontStyle: draw.closed ? 'italic' : 'normal'
                            }}
                            onClick={() => handleDrawSelect(draw)}
                          >
                            <span style={{ color: draw.textColor }}>
                              {draw.name.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>

              {/* Estadísticas y configuraciones */}
              <div className="row">
                <div className="col-md-4 col-xl-2 col-12">
                  <div id="plays-of-day">
                    Jugadas del dia
                    <input
                      name="todayPlays"
                      type="text"
                      disabled
                      autoComplete="off"
                      className="form-control"
                      value={todayPlays}
                    />
                  </div>
                </div>
                
                <div className="col-md-4 col-xl-2 col-12">
                  <div id="total-sold-in-group">
                    Vendido en grupo
                    <input
                      name="groupSold"
                      type="text"
                      disabled
                      autoComplete="off"
                      className="form-control"
                      value={groupSold}
                    />
                  </div>
                </div>
                
                <div className="col-md-4 col-xl-2 col-12">
                  <div id="total-sold-in-betting-pool">
                    Vendido en banca
                    <input
                      name="bancaSold"
                      type="text"
                      disabled
                      autoComplete="off"
                      className="form-control"
                      value={bancaSold}
                    />
                  </div>
                </div>
                
                <div className="col-sm-auto col-3 d-flex align-items-center setting-inline">
                  <label className="setting-label mr-2 mb-0">Desc.</label>
                  <label className="simple-toggle mb-0">
                    <input type="checkbox" checked={discountEnabled} onChange={() => setDiscountEnabled(!discountEnabled)} />
                    <span className="simple-slider"></span>
                  </label>
                </div>
                
                <div className="col-sm-auto col-3 d-flex align-items-center setting-inline">
                  <label className="setting-label mr-2 mb-0">Mult. lot</label>
                  <label className="simple-toggle mb-0">
                    <input type="checkbox" checked={multiLotteryEnabled} onChange={() => setMultiLotteryEnabled(!multiLotteryEnabled)} />
                    <span className="simple-slider"></span>
                  </label>
                </div>
                
                <div className="col-sm-auto col-3 d-flex align-items-center setting-inline">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="paper-plane" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="svg-inline--fa fa-paper-plane fa-w-16 mr-2">
                    <path fill="currentColor" d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"></path>
                  </svg>
                  <label className="simple-toggle mb-0">
                    <input type="checkbox" checked={sendSmsEnabled} onChange={() => setSendSmsEnabled(!sendSmsEnabled)} />
                    <span className="simple-slider"></span>
                  </label>
                </div>
              </div>

              {/* Área de jugadas */}
              <div className="row">
                <div className="col-12">
                  <div className="row">
                    <div id="playing-area" className="row">
                      <div id="digits-wrapper" className="col-md-4 col-12">
                        <input
                          id="digits-input"
                          type="tel"
                          autoComplete="off"
                          placeholder="Jugada"
                          value={digits}
                          onChange={handleDigitsChange}
                        />
                      </div>
                      
                      <div id="availability-wrapper" className="col-md-4 col-12">
                        <input
                          id="availability-input"
                          type="text"
                          disabled
                          value={availability}
                        />
                      </div>
                      
                      <div id="amount-wrapper" className="col-md-4 col-12">
                        <input
                          id="amount-input"
                          type="tel"
                          autoComplete="off"
                          placeholder="Monto"
                          value={amount}
                          onChange={handleAmountChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones rápidas y estadísticas */}
              <div className="row">
                <div className="col-12">
                  <div className="row">
                    <div id="stats-row" className="row">
                      <div id="quick-actions-wrapper" className="col-md-4 col-12">
                        <div id="quick-actions" className="d-flex flex-row">
                          <select id="recent-tickets" disabled className="custom-select">
                            <option></option>
                          </select>
                          <button id="quick-cancel" type="button" disabled className="btn m-0 btn-secondary btn-sm rounded-0 disabled">
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="svg-inline--fa fa-trash-alt fa-w-14">
                              <path fill="currentColor" d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="information-display col-md-4 col-12">
                        <span>Jugadas: <span className="total-plays-display">{totalPlays}</span></span>
                      </div>
                      
                      <div className="information-display col-md-4 col-12">
                        <span>Total: <span className="total-amount-display">${totalAmount.toFixed(2)}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablas de jugadas */}
              <div id="plays-tables">
                <PlayTable title="Directo" plays={directoPlays} type="directo" />
                <PlayTable title="Pale & Tripleta" plays={paleTripletaPlays} type="pale" />
                <PlayTable title="Cash 3" plays={cash3Plays} type="cash3" />
                <PlayTable title="Play 4 & Pick 5" plays={play4Pick5Plays} type="play4" />
              </div>

              {/* Botones de acción */}
              <div className="action-buttons-container">
                <button id="duplicate-ticket" type="button" disabled className="btn-action btn-cyan">
                  DUPLICAR
                </button>
                <button type="button" onClick={handleCreateTicket} className="btn-action btn-cyan">
                  CREAR TICKET
                </button>
                <button id="help" type="button" onClick={() => setIsHelpModalOpen(true)} className="btn-action btn-cyan">
                  AYUDA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Ayuda */}
      <LotteryHelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
};

export default CreateTickets;
