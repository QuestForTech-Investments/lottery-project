import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const CreateLimit = () => {
  const [limitType, setLimitType] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [selectedDraws, setSelectedDraws] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  // 24 bet types amounts
  const [amounts, setAmounts] = useState({
    directo: '',
    pale: '',
    tripleta: '',
    cash3Straight: '',
    cash3Box: '',
    play4Straight: '',
    play4Box: '',
    superPale: '',
    bolita1: '',
    bolita2: '',
    singulacion1: '',
    singulacion2: '',
    singulacion3: '',
    pick5Straight: '',
    pick5Box: '',
    pickTwo: '',
    cash3FrontStraight: '',
    cash3FrontBox: '',
    cash3BackStraight: '',
    cash3BackBox: '',
    pickTwoFront: '',
    pickTwoBack: '',
    pickTwoMiddle: '',
    panama: ''
  });

  const limitTypes = [
    'General para grupo',
    'General por número para grupo',
    'General para banca',
    'Por número para banca (Línea)',
    'Local para banca',
    'General para zona',
    'Por número para zona',
    'General para grupo externo',
    'Por número para grupo externo',
    'Absoluto'
  ];

  const draws = [
    'Anguila 10am', 'REAL', 'GANA MAS', 'LA PRIMERA', 'LA SUERTE', 'LOTEDOM',
    'TEXAS MORNING', 'TEXAS EVENING', 'TEXAS DAY', 'TEXAS NIGHT', 'King Lottery AM',
    'Anguila 1pm', 'NEW YORK DAY', 'FLORIDA AM', 'INDIANA MIDDAY', 'INDIANA EVENING',
    'GEORGIA-MID AM', 'NEW JERSEY AM', 'L.E. PUERTO RICO 2PM', 'DIARIA 11AM'
  ];

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const betTypes = [
    { key: 'directo', label: 'Directo' },
    { key: 'pale', label: 'Pale' },
    { key: 'tripleta', label: 'Tripleta' },
    { key: 'cash3Straight', label: 'Cash3 Straight' },
    { key: 'cash3Box', label: 'Cash3 Box' },
    { key: 'play4Straight', label: 'Play4 Straight' },
    { key: 'play4Box', label: 'Play4 Box' },
    { key: 'superPale', label: 'Super Pale' },
    { key: 'bolita1', label: 'Bolita 1' },
    { key: 'bolita2', label: 'Bolita 2' },
    { key: 'singulacion1', label: 'Singulación 1' },
    { key: 'singulacion2', label: 'Singulación 2' },
    { key: 'singulacion3', label: 'Singulación 3' },
    { key: 'pick5Straight', label: 'Pick5 Straight' },
    { key: 'pick5Box', label: 'Pick5 Box' },
    { key: 'pickTwo', label: 'Pick Two' },
    { key: 'cash3FrontStraight', label: 'Cash3 Front Straight' },
    { key: 'cash3FrontBox', label: 'Cash3 Front Box' },
    { key: 'cash3BackStraight', label: 'Cash3 Back Straight' },
    { key: 'cash3BackBox', label: 'Cash3 Back Box' },
    { key: 'pickTwoFront', label: 'Pick Two Front' },
    { key: 'pickTwoBack', label: 'Pick Two Back' },
    { key: 'pickTwoMiddle', label: 'Pick Two Middle' },
    { key: 'panama', label: 'Panamá' }
  ];

  const handleDrawToggle = (draw) => {
    setSelectedDraws(prev =>
      prev.includes(draw) ? prev.filter(d => d !== draw) : [...prev, draw]
    );
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSelectAllDraws = () => {
    setSelectedDraws(selectedDraws.length === draws.length ? [] : draws);
  };

  const handleSelectAllDays = () => {
    setSelectedDays(selectedDays.length === days.length ? [] : days);
  };

  const handleAmountChange = (key, value) => {
    setAmounts(prev => ({ ...prev, [key]: value }));
  };

  const handleCreate = () => {
    if (!limitType || !expirationDate || selectedDraws.length === 0 || selectedDays.length === 0) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    console.log('Creating limit:', {
      limitType,
      expirationDate,
      draws: selectedDraws,
      days: selectedDays,
      amounts
    });
    alert('Límite creado exitosamente');
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Título */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '500', color: '#2c2c2c' }}>Crear límites</h3>
      </div>

      <div className="card" style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="card-body" style={{ padding: '30px' }}>
          <div className="row">
            {/* Columna Izquierda - LÍMITES */}
            <div className="col-md-6">
              <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', marginBottom: '20px', borderBottom: '2px solid #51cbce', paddingBottom: '10px' }}>
                LÍMITES
              </h5>

              {/* Tipo de Límite */}
              <div className="mb-3">
                <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                  Tipo de Límite <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={limitType}
                  onChange={(e) => setLimitType(e.target.value)}
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Seleccione</option>
                  {limitTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Fecha de expiración */}
              <div className="mb-3">
                <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                  Fecha de expiración <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Sorteos */}
              <div className="mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#787878', margin: 0 }}>
                    Sorteos <span style={{ color: 'red' }}>*</span>
                  </label>
                  <button
                    onClick={handleSelectAllDraws}
                    className="btn btn-sm"
                    style={{ fontSize: '11px', padding: '2px 10px', background: '#51cbce', color: 'white', border: 'none' }}
                  >
                    {selectedDraws.length === draws.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', background: 'white' }}>
                  {draws.map(draw => (
                    <div key={draw} className="form-check" style={{ marginBottom: '5px' }}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedDraws.includes(draw)}
                        onChange={() => handleDrawToggle(draw)}
                        id={`draw-${draw}`}
                      />
                      <label className="form-check-label" htmlFor={`draw-${draw}`} style={{ fontSize: '13px' }}>
                        {draw}
                      </label>
                    </div>
                  ))}
                </div>
                <small style={{ fontSize: '11px', color: '#999' }}>
                  {selectedDraws.length} seleccionado(s)
                </small>
              </div>
            </div>

            {/* Columna Derecha - MONTO */}
            <div className="col-md-6">
              <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', marginBottom: '20px', borderBottom: '2px solid #51cbce', paddingBottom: '10px' }}>
                MONTO
              </h5>

              <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                {betTypes.map(({ key, label }) => (
                  <div key={key} className="mb-3">
                    <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                      {label}
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={amounts[key]}
                      onChange={(e) => handleAmountChange(key, e.target.value)}
                      placeholder="0.00"
                      style={{ fontSize: '14px', textAlign: 'right' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sección DÍA DE SEMANA */}
          <div className="mt-4" style={{ borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', margin: 0 }}>
                DÍA DE SEMANA <span style={{ color: 'red' }}>*</span>
              </h5>
              <button
                onClick={handleSelectAllDays}
                className="btn btn-sm"
                style={{ fontSize: '11px', padding: '2px 10px', background: '#51cbce', color: 'white', border: 'none' }}
              >
                {selectedDays.length === days.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {days.map(day => (
                <div key={day} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    id={`day-${day}`}
                  />
                  <label className="form-check-label" htmlFor={`day-${day}`} style={{ fontSize: '13px' }}>
                    {day}
                  </label>
                </div>
              ))}
            </div>
            <small style={{ fontSize: '11px', color: '#999', display: 'block', marginTop: '5px' }}>
              {selectedDays.length} día(s) seleccionado(s)
            </small>
          </div>

          {/* Botón Crear */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={handleCreate}
              className="btn"
              style={{
                background: '#51cbce',
                color: 'white',
                fontSize: '14px',
                padding: '10px 40px',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '500'
              }}
            >
              CREAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLimit;
