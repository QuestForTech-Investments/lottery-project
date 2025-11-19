import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const DeleteLimits = () => {
  const [limitType, setLimitType] = useState('General para grupo');
  const [selectedBetTypes, setSelectedBetTypes] = useState([]);
  const [selectedLottery, setSelectedLottery] = useState('');
  const [selectedDraws, setSelectedDraws] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  const limitTypes = ['General para grupo', 'General por número para grupo', 'General para banca', 'Por número para banca (Línea)', 'Local para banca'];

  const betTypes = ['Directo', 'Pale', 'Tripleta', 'Cash3 Straight', 'Cash3 Box', 'Play4 Straight', 'Play4 Box', 'Super Pale', 'Bolita 1', 'Bolita 2'];

  const draws = ['Anguila 10am', 'REAL', 'GANA MAS', 'LA PRIMERA', 'NEW YORK DAY', 'FLORIDA AM'];

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handleSelectAllBetTypes = () => {
    setSelectedBetTypes(selectedBetTypes.length === betTypes.length ? [] : betTypes);
  };

  const handleSelectAllDraws = () => {
    setSelectedDraws(selectedDraws.length === draws.length ? [] : draws);
  };

  const handleSelectAllDays = () => {
    setSelectedDays(selectedDays.length === days.length ? [] : days);
  };

  const handleDelete = () => {
    if (!limitType || selectedBetTypes.length === 0 || selectedDraws.length === 0 || selectedDays.length === 0) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    const confirmDelete = window.confirm(`¿Está seguro que desea eliminar los límites seleccionados?`);
    if (confirmDelete) {
      console.log('Deleting limits:', { limitType, selectedBetTypes, selectedDraws, selectedDays });
      alert('Límites eliminados exitosamente');
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '500', color: '#2c2c2c' }}>Eliminar límites en lote</h3>
      </div>

      <div className="card" style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="card-body" style={{ padding: '30px' }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', marginBottom: '20px', borderBottom: '2px solid #51cbce', paddingBottom: '10px' }}>
            LÍMITES
          </h5>

          <div className="mb-3">
            <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>
              Tipo de Límite <span style={{ color: 'red' }}>*</span>
            </label>
            <select className="form-select" value={limitType} onChange={(e) => setLimitType(e.target.value)} style={{ fontSize: '14px' }}>
              {limitTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', color: '#787878', margin: 0 }}>
                Eliminar todos los números con jugadas <span style={{ color: 'red' }}>*</span>
              </label>
              <button onClick={handleSelectAllBetTypes} className="btn btn-sm" style={{ fontSize: '11px', background: '#51cbce', color: 'white', border: 'none' }}>
                {selectedBetTypes.length === betTypes.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', background: 'white' }}>
              {betTypes.map(type => (
                <div key={type} className="form-check mb-1">
                  <input className="form-check-input" type="checkbox" checked={selectedBetTypes.includes(type)} onChange={() => setSelectedBetTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])} id={`bet-${type}`} />
                  <label className="form-check-label" htmlFor={`bet-${type}`} style={{ fontSize: '13px' }}>{type}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label style={{ fontSize: '12px', color: '#787878', marginBottom: '5px', display: 'block' }}>Loterías</label>
            <select className="form-select" value={selectedLottery} onChange={(e) => setSelectedLottery(e.target.value)} style={{ fontSize: '14px' }}>
              <option value="">Seleccione</option>
              <option value="1">Lotería 1</option>
            </select>
          </div>

          <div className="mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', color: '#787878', margin: 0 }}>Sorteos <span style={{ color: 'red' }}>*</span></label>
              <button onClick={handleSelectAllDraws} className="btn btn-sm" style={{ fontSize: '11px', background: '#51cbce', color: 'white', border: 'none' }}>
                {selectedDraws.length === draws.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', background: 'white' }}>
              {draws.map(draw => (
                <div key={draw} className="form-check mb-1">
                  <input className="form-check-input" type="checkbox" checked={selectedDraws.includes(draw)} onChange={() => setSelectedDraws(prev => prev.includes(draw) ? prev.filter(d => d !== draw) : [...prev, draw])} id={`draw-del-${draw}`} />
                  <label className="form-check-label" htmlFor={`draw-del-${draw}`} style={{ fontSize: '13px' }}>{draw}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4" style={{ borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', margin: 0 }}>DÍA DE SEMANA <span style={{ color: 'red' }}>*</span></h5>
              <button onClick={handleSelectAllDays} className="btn btn-sm" style={{ fontSize: '11px', background: '#51cbce', color: 'white', border: 'none' }}>
                {selectedDays.length === days.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {days.map(day => (
                <div key={day} className="form-check">
                  <input className="form-check-input" type="checkbox" checked={selectedDays.includes(day)} onChange={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])} id={`day-del-${day}`} />
                  <label className="form-check-label" htmlFor={`day-del-${day}`} style={{ fontSize: '13px' }}>{day}</label>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={handleDelete} className="btn" style={{ background: '#dc3545', color: 'white', fontSize: '14px', padding: '10px 40px', border: 'none', borderRadius: '4px' }}>
              ELIMINAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteLimits;
