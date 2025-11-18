import React, { useState } from 'react';

const Blackboard = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sorteo, setSorteo] = useState('');
  const [zonas, setZonas] = useState([]);
  const [banca, setBanca] = useState('');
  const [autoRefrescar, setAutoRefrescar] = useState(false);
  const [data, setData] = useState([]);
  const [sorteosList, setSorteosList] = useState([]);
  const [zonasList, setZonasList] = useState([]);

  const handleRefrescar = () => console.log('Refrescando...');
  const handlePDF = () => console.log('Generando PDF...');
  const handleImprimir = () => console.log('Imprimiendo...');

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-body">
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>
            Monitoreo de jugadas
          </h3>

          <div className="row mb-3">
            <div className="col-md-6">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha</label>
              <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-12">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Sorteos</label>
              <select className="form-select" value={sorteo} onChange={(e) => setSorteo(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px', color: sorteo ? '#333' : '#9A9A9A' }}>
                <option value="">Seleccione</option>
                {sorteosList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-12">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Zonas</label>
              <select className="form-select" multiple value={zonas} onChange={(e) => setZonas(Array.from(e.target.selectedOptions, o => o.value))}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }}>
                <option value="">Seleccione</option>
                {zonasList.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              <small style={{ color: '#9A9A9A' }}>{zonas.length > 0 ? `${zonas.length} seleccionadas` : ''}</small>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Banca</label>
              <input type="text" className="form-control" value={banca} onChange={(e) => setBanca(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
            </div>
          </div>

          <div className="mb-4">
            <button className="btn me-2" onClick={handleRefrescar}
              style={{ backgroundColor: '#51cbce', color: 'white', padding: '8px 20px', borderRadius: '30px', border: 'none', textTransform: 'uppercase', fontSize: '12px' }}>
              Refrescar
            </button>
            <button className="btn me-2" onClick={handlePDF}
              style={{ backgroundColor: '#51cbce', color: 'white', padding: '8px 20px', borderRadius: '30px', border: 'none', textTransform: 'uppercase', fontSize: '12px' }}>
              PDF
            </button>
            <button className="btn me-2" onClick={handleImprimir}
              style={{ backgroundColor: '#51cbce', color: 'white', padding: '8px 20px', borderRadius: '30px', border: 'none', textTransform: 'uppercase', fontSize: '12px' }}>
              Imprimir
            </button>
            <span style={{ marginLeft: '10px', color: '#9A9A9A', fontSize: '12px' }}>Auto refrescar</span>
            <div className="form-check form-switch d-inline-block ms-2">
              <input className="form-check-input" type="checkbox" role="switch" checked={autoRefrescar}
                onChange={(e) => setAutoRefrescar(e.target.checked)} style={{ width: '50px', height: '25px', cursor: 'pointer' }} />
            </div>
          </div>

          {data.length === 0 && (
            <h3 style={{ color: '#333', fontWeight: '400', fontSize: '20px' }}>
              No hay entradas para el sorteo y la fecha elegidos
            </h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blackboard;
