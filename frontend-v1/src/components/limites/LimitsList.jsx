import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const LimitsList = () => {
  const [selectedLimitTypes, setSelectedLimitTypes] = useState([]);
  const [selectedDraws, setSelectedDraws] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedBanca, setSelectedBanca] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [activeWeekDay, setActiveWeekDay] = useState('Lunes');
  const [activeLimitType, setActiveLimitType] = useState('General para grupo');
  const [activeDraw, setActiveDraw] = useState('NEW YORK DAY');

  const limitTypes = [
    'Todos',
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
    'Todos', 'Anguila 10am', 'REAL', 'GANA MAS', 'LA PRIMERA', 'LA SUERTE',
    'LOTEDOM', 'TEXAS MORNING', 'TEXAS EVENING', 'NEW YORK DAY', 'FLORIDA AM',
    'INDIANA MIDDAY', 'GEORGIA-MID AM', 'NEW JERSEY AM', 'DIARIA 11AM'
  ];

  const days = ['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const [limits, setLimits] = useState([
    { id: 1, betType: 'Directo', amount: 5000, expirationDate: '31/12/2025' },
    { id: 2, betType: 'Pale', amount: 3000, expirationDate: '31/12/2025' },
    { id: 3, betType: 'Tripleta', amount: 2000, expirationDate: '31/12/2025' }
  ]);

  const handleRefresh = () => {
    if (selectedLimitTypes.length === 0 || selectedDraws.length === 0 || selectedDays.length === 0) {
      alert('Por favor seleccione Tipo de Límite, Sorteos y Días');
      return;
    }
    console.log('Refreshing with filters:', {
      limitTypes: selectedLimitTypes,
      draws: selectedDraws,
      days: selectedDays
    });
  };

  const handleDelete = (id) => {
    setLimits(limits.filter(limit => limit.id !== id));
  };

  const handleAmountChange = (id, newAmount) => {
    setLimits(limits.map(limit =>
      limit.id === id ? { ...limit, amount: parseFloat(newAmount) || 0 } : limit
    ));
  };

  const showConditionalFilters = selectedLimitTypes.includes('Todos');

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Título */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '500', color: '#2c2c2c' }}>Lista de límites</h3>
      </div>

      {/* Card de filtros */}
      <div className="card" style={{ marginBottom: '20px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="card-body" style={{ padding: '20px' }}>
          {/* Filtros principales */}
          <div className="row mb-3">
            {/* Tipo de Límite */}
            <div className="col-md-4 mb-3">
              <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                Tipo de Límite <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                className="form-select"
                multiple
                value={selectedLimitTypes}
                onChange={(e) => setSelectedLimitTypes([...e.target.selectedOptions].map(o => o.value))}
                style={{ fontSize: '14px', height: '100px' }}
              >
                {limitTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <small style={{ fontSize: '11px', color: '#999' }}>
                {selectedLimitTypes.length} seleccionada(s)
              </small>
            </div>

            {/* Sorteos */}
            <div className="col-md-4 mb-3">
              <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                Sorteos <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                className="form-select"
                multiple
                value={selectedDraws}
                onChange={(e) => setSelectedDraws([...e.target.selectedOptions].map(o => o.value))}
                style={{ fontSize: '14px', height: '100px' }}
              >
                {draws.map(draw => (
                  <option key={draw} value={draw}>{draw}</option>
                ))}
              </select>
              <small style={{ fontSize: '11px', color: '#999' }}>
                {selectedDraws.length} seleccionada(s)
              </small>
            </div>

            {/* Días */}
            <div className="col-md-4 mb-3">
              <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                Días <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                className="form-select"
                multiple
                value={selectedDays}
                onChange={(e) => setSelectedDays([...e.target.selectedOptions].map(o => o.value))}
                style={{ fontSize: '14px', height: '100px' }}
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <small style={{ fontSize: '11px', color: '#999' }}>
                {selectedDays.length} seleccionada(s)
              </small>
            </div>
          </div>

          {/* Filtros condicionales (si "Todos" está seleccionado en Tipo de Límite) */}
          {showConditionalFilters && (
            <div className="row mb-3">
              <div className="col-md-4 mb-3">
                <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                  Bancas
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
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                  Zonas
                </label>
                <select
                  className="form-select"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Seleccione</option>
                  <option value="1">Zona 1</option>
                  <option value="2">Zona 2</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
                  Grupos
                </label>
                <select
                  className="form-select"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Seleccione</option>
                  <option value="1">Grupo 1</option>
                  <option value="2">Grupo 2</option>
                </select>
              </div>
            </div>
          )}

          {/* Botón Refrescar */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleRefresh}
              className="btn"
              style={{
                background: '#51cbce',
                color: 'white',
                fontSize: '14px',
                padding: '8px 30px',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '500'
              }}
            >
              REFRESCAR
            </button>
          </div>
        </div>
      </div>

      {/* Pestañas de días de semana */}
      <div className="card" style={{ marginBottom: '20px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="card-body" style={{ padding: '0' }}>
          <ul className="nav nav-tabs" style={{ borderBottom: '2px solid #51cbce' }}>
            {weekDays.map(day => (
              <li className="nav-item" key={day}>
                <button
                  className={`nav-link ${activeWeekDay === day ? 'active' : ''}`}
                  onClick={() => setActiveWeekDay(day)}
                  style={{
                    fontSize: '14px',
                    color: activeWeekDay === day ? 'white' : '#51cbce',
                    background: activeWeekDay === day ? '#51cbce' : 'transparent',
                    border: 'none',
                    padding: '10px 20px',
                    cursor: 'pointer'
                  }}
                >
                  {day}
                </button>
              </li>
            ))}
          </ul>

          {/* Sub-pestañas de tipo de límite */}
          <div style={{ padding: '10px 20px', background: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {limitTypes.slice(1, 4).map(type => (
                <button
                  key={type}
                  onClick={() => setActiveLimitType(type)}
                  style={{
                    fontSize: '12px',
                    padding: '5px 15px',
                    border: `1px solid ${activeLimitType === type ? '#51cbce' : '#ddd'}`,
                    background: activeLimitType === type ? '#51cbce' : 'white',
                    color: activeLimitType === type ? 'white' : '#333',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Pestañas de sorteos */}
          <div style={{ padding: '10px 20px', background: '#fff', borderBottom: '1px solid #ddd', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '10px', minWidth: 'max-content' }}>
              {draws.slice(1, 6).map(draw => (
                <button
                  key={draw}
                  onClick={() => setActiveDraw(draw)}
                  style={{
                    fontSize: '12px',
                    padding: '5px 15px',
                    border: `1px solid ${activeDraw === draw ? '#51cbce' : '#ddd'}`,
                    background: activeDraw === draw ? '#51cbce' : 'white',
                    color: activeDraw === draw ? 'white' : '#333',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {draw}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de límites */}
          <div style={{ padding: '20px' }}>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ fontSize: '12px', fontWeight: '600', color: '#787878' }}>Tipo de jugada</th>
                    <th style={{ fontSize: '12px', fontWeight: '600', color: '#787878' }}>Monto</th>
                    <th style={{ fontSize: '12px', fontWeight: '600', color: '#787878' }}>Fecha de expiración</th>
                    <th style={{ fontSize: '12px', fontWeight: '600', color: '#787878', textAlign: 'center' }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {limits.map(limit => (
                    <tr key={limit.id}>
                      <td style={{ fontSize: '14px', verticalAlign: 'middle' }}>{limit.betType}</td>
                      <td style={{ fontSize: '14px', verticalAlign: 'middle' }}>
                        <input
                          type="number"
                          className="form-control"
                          value={limit.amount}
                          onChange={(e) => handleAmountChange(limit.id, e.target.value)}
                          style={{ width: '120px', fontSize: '14px', textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ fontSize: '14px', verticalAlign: 'middle' }}>{limit.expirationDate}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <button
                          onClick={() => handleDelete(limit.id)}
                          className="btn btn-sm"
                          style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 10px' }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '15px' }}>
              Mostrando {limits.length} de {limits.length} entradas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitsList;
