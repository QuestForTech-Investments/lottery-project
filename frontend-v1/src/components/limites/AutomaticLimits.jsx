import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const AutomaticLimits = () => {
  const [activeTab, setActiveTab] = useState('general');

  // General tab state
  const [generalNumberControls, setGeneralNumberControls] = useState({
    enableDirecto: false,
    montoDirecto: 0,
    enablePale: false,
    montoPale: 0,
    enableSuperPale: false,
    montoSuperPale: 0
  });

  const [lineControls, setLineControls] = useState({
    enableDirecto: false,
    montoDirecto: 0,
    enablePale: false,
    montoPale: 0,
    enableSuperPale: false,
    montoSuperPale: 0
  });

  // Random blocking tab state
  const [selectedDraws, setSelectedDraws] = useState([]);
  const [selectedBanca, setSelectedBanca] = useState('');
  const [palesToBlock, setPalesToBlock] = useState('');

  const draws = [
    'Anguila 10am', 'REAL', 'GANA MAS', 'LA PRIMERA', 'LA SUERTE', 'LOTEDOM',
    'TEXAS MORNING', 'TEXAS EVENING', 'TEXAS DAY', 'TEXAS NIGHT', 'King Lottery AM',
    'Anguila 1pm', 'NEW YORK DAY', 'FLORIDA AM', 'INDIANA MIDDAY', 'INDIANA EVENING',
    'GEORGIA-MID AM', 'NEW JERSEY AM', 'L.E. PUERTO RICO 2PM', 'DIARIA 11AM'
  ];

  const handleDrawToggle = (draw) => {
    setSelectedDraws(prev =>
      prev.includes(draw) ? prev.filter(d => d !== draw) : [...prev, draw]
    );
  };

  const handleSaveGeneral = () => {
    console.log('Saving general controls:', { generalNumberControls, lineControls });
    alert('Configuración guardada exitosamente');
  };

  const handleUpdateBlocking = () => {
    if (selectedDraws.length === 0 || !selectedBanca || !palesToBlock) {
      alert('Por favor complete todos los campos');
      return;
    }
    console.log('Updating random blocking:', { selectedDraws, selectedBanca, palesToBlock });
    alert('Bloqueo actualizado exitosamente');
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '500', color: '#2c2c2c' }}>Límites automáticos</h3>
      </div>

      <div className="card" style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="card-body" style={{ padding: '0' }}>
          {/* Tabs */}
          <ul className="nav nav-tabs" style={{ borderBottom: '2px solid #51cbce' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
                style={{
                  fontSize: '14px',
                  color: activeTab === 'general' ? 'white' : '#51cbce',
                  background: activeTab === 'general' ? '#51cbce' : 'transparent',
                  border: 'none',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                General
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'bloqueo' ? 'active' : ''}`}
                onClick={() => setActiveTab('bloqueo')}
                style={{
                  fontSize: '14px',
                  color: activeTab === 'bloqueo' ? 'white' : '#51cbce',
                  background: activeTab === 'bloqueo' ? '#51cbce' : 'transparent',
                  border: 'none',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                Bloqueo Aleatorio
              </button>
            </li>
          </ul>

          <div style={{ padding: '30px' }}>
            {/* Tab General */}
            {activeTab === 'general' && (
              <div>
                {/* Sección 1 */}
                <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#2c2c2c' }}>
                  Controles automáticos generales por número
                </h5>

                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={generalNumberControls.enableDirecto}
                        onChange={(e) => setGeneralNumberControls({...generalNumberControls, enableDirecto: e.target.checked})}
                      />
                      <label className="form-check-label" style={{ fontSize: '13px' }}>
                        Habilitar directo (día)
                      </label>
                    </div>
                    <input
                      type="number"
                      className="form-control mt-2"
                      value={generalNumberControls.montoDirecto}
                      onChange={(e) => setGeneralNumberControls({...generalNumberControls, montoDirecto: e.target.value})}
                      placeholder="Monto directo"
                      style={{ fontSize: '14px' }}
                      disabled={!generalNumberControls.enableDirecto}
                    />
                  </div>

                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={generalNumberControls.enablePale}
                        onChange={(e) => setGeneralNumberControls({...generalNumberControls, enablePale: e.target.checked})}
                      />
                      <label className="form-check-label" style={{ fontSize: '13px' }}>
                        Habilitar pale (día-mes)
                      </label>
                    </div>
                    <input
                      type="number"
                      className="form-control mt-2"
                      value={generalNumberControls.montoPale}
                      onChange={(e) => setGeneralNumberControls({...generalNumberControls, montoPale: e.target.value})}
                      placeholder="Monto pale directo"
                      style={{ fontSize: '14px' }}
                      disabled={!generalNumberControls.enablePale}
                    />
                  </div>

                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={generalNumberControls.enableSuperPale}
                        onChange={(e) => setGeneralNumberControls({...generalNumberControls, enableSuperPale: e.target.checked})}
                      />
                      <label className="form-check-label" style={{ fontSize: '13px' }}>
                        Habilitar super pale (día-mes)
                      </label>
                    </div>
                    <input
                      type="number"
                      className="form-control mt-2"
                      value={generalNumberControls.montoSuperPale}
                      onChange={(e) => setGeneralNumberControls({...generalNumberControls, montoSuperPale: e.target.value})}
                      placeholder="Monto super pale"
                      style={{ fontSize: '14px' }}
                      disabled={!generalNumberControls.enableSuperPale}
                    />
                  </div>
                </div>

                {/* Sección 2 */}
                <h5 style={{ fontSize: '16px', fontWeight: '600', marginTop: '30px', marginBottom: '20px', color: '#2c2c2c' }}>
                  Controles automáticos de línea para bancas
                </h5>

                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={lineControls.enableDirecto}
                        onChange={(e) => setLineControls({...lineControls, enableDirecto: e.target.checked})}
                      />
                      <label className="form-check-label" style={{ fontSize: '13px' }}>
                        Habilitar directo (día)
                      </label>
                    </div>
                    <input
                      type="number"
                      className="form-control mt-2"
                      value={lineControls.montoDirecto}
                      onChange={(e) => setLineControls({...lineControls, montoDirecto: e.target.value})}
                      placeholder="Monto directo"
                      style={{ fontSize: '14px' }}
                      disabled={!lineControls.enableDirecto}
                    />
                  </div>

                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={lineControls.enablePale}
                        onChange={(e) => setLineControls({...lineControls, enablePale: e.target.checked})}
                      />
                      <label className="form-check-label" style={{ fontSize: '13px' }}>
                        Habilitar pale (día-mes)
                      </label>
                    </div>
                    <input
                      type="number"
                      className="form-control mt-2"
                      value={lineControls.montoPale}
                      onChange={(e) => setLineControls({...lineControls, montoPale: e.target.value})}
                      placeholder="Monto pale directo"
                      style={{ fontSize: '14px' }}
                      disabled={!lineControls.enablePale}
                    />
                  </div>

                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={lineControls.enableSuperPale}
                        onChange={(e) => setLineControls({...lineControls, enableSuperPale: e.target.checked})}
                      />
                      <label className="form-check-label" style={{ fontSize: '13px' }}>
                        Habilitar super pale (día-mes)
                      </label>
                    </div>
                    <input
                      type="number"
                      className="form-control mt-2"
                      value={lineControls.montoSuperPale}
                      onChange={(e) => setLineControls({...lineControls, montoSuperPale: e.target.value})}
                      placeholder="Monto super pale"
                      style={{ fontSize: '14px' }}
                      disabled={!lineControls.enableSuperPale}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    onClick={handleSaveGeneral}
                    className="btn"
                    style={{
                      background: '#51cbce',
                      color: 'white',
                      fontSize: '14px',
                      padding: '10px 40px',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    GUARDAR
                  </button>
                </div>
              </div>
            )}

            {/* Tab Bloqueo Aleatorio */}
            {activeTab === 'bloqueo' && (
              <div>
                <div className="row">
                  <div className="col-md-6">
                    <label style={{ fontSize: '12px', color: '#787878', marginBottom: '10px', display: 'block' }}>
                      Sorteos <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', background: 'white' }}>
                      {draws.map(draw => (
                        <div key={draw} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedDraws.includes(draw)}
                            onChange={() => handleDrawToggle(draw)}
                            id={`draw-block-${draw}`}
                          />
                          <label className="form-check-label" htmlFor={`draw-block-${draw}`} style={{ fontSize: '13px' }}>
                            {draw}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                        Bancas <span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        value={selectedBanca}
                        onChange={(e) => setSelectedBanca(e.target.value)}
                        style={{ fontSize: '14px' }}
                      >
                        <option value="">Seleccione</option>
                        <option value="1">Banca 1</option>
                        <option value="2">Banca 2</option>
                        <option value="3">Banca 3</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                        # de pales a bloquear <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={palesToBlock}
                        onChange={(e) => setPalesToBlock(e.target.value)}
                        placeholder="0"
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    onClick={handleUpdateBlocking}
                    className="btn"
                    style={{
                      background: '#51cbce',
                      color: 'white',
                      fontSize: '14px',
                      padding: '10px 40px',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    ACTUALIZAR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomaticLimits;
