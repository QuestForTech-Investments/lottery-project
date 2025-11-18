import React, { useState } from 'react';

const ExportedPool = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState([]);

  const handleRefrescar = () => {
    console.log('Refrescando bote exportado...');
  };

  const handlePDF = () => {
    console.log('Generando PDF...');
  };

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-body">
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>
            Bote exportado
          </h3>

          <div className="row mb-4">
            <div className="col-md-6">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                Fecha
              </label>
              <input
                type="date"
                className="form-control"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <button
              className="btn me-2"
              onClick={handleRefrescar}
              style={{ backgroundColor: '#51cbce', color: 'white', padding: '8px 20px', borderRadius: '30px', border: 'none', textTransform: 'uppercase', fontSize: '12px' }}
            >
              Refrescar
            </button>
            <button
              className="btn"
              onClick={handlePDF}
              style={{ backgroundColor: '#51cbce', color: 'white', padding: '8px 20px', borderRadius: '30px', border: 'none', textTransform: 'uppercase', fontSize: '12px' }}
            >
              PDF
            </button>
          </div>

          {data.length === 0 && (
            <h3 style={{ color: '#333', fontWeight: '400', fontSize: '20px' }}>
              No hay entradas para la fecha elegida
            </h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportedPool;
