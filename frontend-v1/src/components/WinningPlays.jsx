import React, { useState } from 'react';

const WinningPlays = () => {
  const [fechaInicial, setFechaInicial] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState(new Date().toISOString().split('T')[0]);
  const [sorteo, setSorteo] = useState('');
  const [zonas, setZonas] = useState([]);
  const [data, setData] = useState([]);
  const [sorteosList, setSorteosList] = useState([]);
  const [zonasList, setZonasList] = useState([]);

  const handleFiltrar = () => console.log('Filtrando...');
  const handlePDF = () => console.log('Generando PDF...');

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-body">
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>
            Jugadas ganadoras
          </h3>

          <div className="row mb-3">
            <div className="col-md-6">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha inicial</label>
              <input type="date" className="form-control" value={fechaInicial} onChange={(e) => setFechaInicial(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
            </div>
            <div className="col-md-6">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha final</label>
              <input type="date" className="form-control" value={fechaFinal} onChange={(e) => setFechaFinal(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Sorteo</label>
              <select className="form-select" value={sorteo} onChange={(e) => setSorteo(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px', color: sorteo ? '#333' : '#9A9A9A' }}>
                <option value="">Seleccione</option>
                {sorteosList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Zonas</label>
              <select className="form-select" multiple value={zonas} onChange={(e) => setZonas(Array.from(e.target.selectedOptions, o => o.value))}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }}>
                <option value="">Seleccione</option>
                {zonasList.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              <small style={{ color: '#9A9A9A' }}>{zonas.length > 0 ? `${zonas.length} seleccionadas` : ''}</small>
            </div>
          </div>

          <div className="mb-4">
            <button className="btn me-2" onClick={handleFiltrar}
              style={{ backgroundColor: '#51cbce', color: 'white', padding: '8px 20px', borderRadius: '30px', border: 'none', textTransform: 'uppercase', fontSize: '12px' }}>
              Filtrar
            </button>
            <button className="btn" onClick={handlePDF}
              style={{ backgroundColor: '#51cbce', color: 'white', padding: '8px 20px', borderRadius: '30px', border: 'none', textTransform: 'uppercase', fontSize: '12px' }}>
              PDF
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Tipo de jugada</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Jugada</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Venta</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Premio</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#51cbce' }}>
                      No hay entradas disponibles
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={i}>
                      <td>{row.tipoJugada}</td>
                      <td>{row.jugada}</td>
                      <td>{row.venta}</td>
                      <td>{row.premio}</td>
                      <td>{row.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinningPlays;
