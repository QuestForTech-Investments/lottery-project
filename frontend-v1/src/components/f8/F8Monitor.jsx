import React, { useState } from 'react';

/**
 * F8Monitor Component (Bootstrap V1)
 *
 * F8 - Monitoreo de jugadas por Banca
 * Permite filtrar jugadas por fecha, sorteo y número de jugada
 */
const F8Monitor = () => {
  const [filters, setFilters] = useState({
    fecha: new Date().toISOString().split('T')[0],
    sorteo: '',
    jugada: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mockup data - 5 bancas con montos
  const [playData] = useState([
    { id: 1, banca: 'LA CENTRAL 01', monto: 150.00 },
    { id: 2, banca: 'NORTE EXPRESS', monto: 320.50 },
    { id: 3, banca: 'SUR PREMIUM', monto: 89.75 },
    { id: 4, banca: 'ESTE RAPIDO', monto: 210.00 },
    { id: 5, banca: 'OESTE GOLD', monto: 175.25 }
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    console.log('Refrescar datos:', filters);
    alert(`Refrescando datos (mockup)\nFecha: ${filters.fecha}\nSorteo: ${filters.sorteo || 'Todos'}\nJugada: ${filters.jugada || 'Todas'}`);
  };

  const filteredData = playData.filter(item =>
    item.banca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = filteredData.reduce((sum, item) => sum + item.monto, 0);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        {/* Título */}
        <h3 style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '24px',
          color: '#2c2c2c'
        }}>
          F8 - Monitoreo de jugadas por Banca
        </h3>

        {/* Filtros */}
        <div className="row mb-4">
          <div className="col-md-3">
            <label htmlFor="fecha" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Fecha
            </label>
            <input
              type="date"
              className="form-control"
              id="fecha"
              name="fecha"
              value={filters.fecha}
              onChange={handleFilterChange}
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="sorteo" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Sorteos
            </label>
            <select
              className="form-select"
              id="sorteo"
              name="sorteo"
              value={filters.sorteo}
              onChange={handleFilterChange}
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            >
              <option value="">Seleccione</option>
              <option value="DIARIA 11AM">DIARIA 11AM</option>
              <option value="LOTEDOM">LOTEDOM</option>
              <option value="LA PRIMERA">LA PRIMERA</option>
              <option value="TEXAS DAY">TEXAS DAY</option>
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="jugada" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Jugada
            </label>
            <input
              type="text"
              className="form-control"
              id="jugada"
              name="jugada"
              value={filters.jugada}
              onChange={handleFilterChange}
              placeholder="Número de jugada"
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
          <div className="col-md-3" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn w-100"
              onClick={handleRefresh}
              style={{
                backgroundColor: '#51cbce',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500,
                textTransform: 'none'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#45b8bb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#51cbce'}
            >
              REFRESCAR
            </button>
          </div>
        </div>

        {/* Total */}
        <div style={{
          textAlign: 'center',
          fontSize: '20px',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          marginBottom: '20px',
          color: '#2c2c2c'
        }}>
          Total: ${total.toFixed(2)}
        </div>

        {/* Filtro rápido */}
        <div className="mb-3" style={{ maxWidth: '400px' }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Filtrado rápido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
            <span className="input-group-text" style={{ backgroundColor: 'white' }}>
              <i className="fa fa-search" style={{ color: '#999' }}></i>
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="table table-hover" style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th>Bancas</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center" style={{ padding: '40px', color: '#999' }}>
                    No hay entradas disponibles
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.banca}</td>
                    <td style={{ textAlign: 'right' }}>${item.monto.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '20px',
          paddingTop: '15px',
          borderTop: '1px solid #dee2e6',
          fontSize: '14px',
          color: '#666',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Mostrando {filteredData.length} de {playData.length} entradas
        </div>
      </div>
    </div>
  );
};

export default F8Monitor;
