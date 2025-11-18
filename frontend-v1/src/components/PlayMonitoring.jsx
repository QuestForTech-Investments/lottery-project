import React, { useState, useEffect } from 'react';

const PlayMonitoring = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sorteo, setSorteo] = useState('');
  const [zonas, setZonas] = useState([]);
  const [banca, setBanca] = useState('');
  const [data, setData] = useState([]);
  const [sorteosList, setSorteosList] = useState([]);
  const [zonasList, setZonasList] = useState([]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    // Mock play monitoring data - grid format with numbers 00-99
    const mockData = [];
    for (let i = 0; i < 100; i++) {
      const num = i.toString().padStart(2, '0');
      const ventas = Math.floor(Math.random() * 500) + 10;
      const limite = 1000;
      mockData.push({
        numero: num,
        ventas: ventas,
        limite: limite,
        disponible: limite - ventas,
        porcentaje: ((ventas / limite) * 100).toFixed(1)
      });
    }
    setData(mockData);

    setSorteosList([
      { id: 1, name: 'Nacional 12PM' },
      { id: 2, name: 'Nacional 3PM' },
      { id: 3, name: 'NY 10:30AM' },
      { id: 4, name: 'Florida 1:30PM' },
      { id: 5, name: 'DIARIA 11AM' }
    ]);

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' }
    ]);
  }, []);

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
            <button className="btn" onClick={handleImprimir}
              style={{ backgroundColor: '#51cbce', color: 'white', padding: '8px 20px', borderRadius: '30px', border: 'none', textTransform: 'uppercase', fontSize: '12px' }}>
              Imprimir
            </button>
          </div>

          {data.length === 0 ? (
            <h3 style={{ color: '#333', fontWeight: '400', fontSize: '20px' }}>
              No hay entradas para el sorteo y la fecha elegidos
            </h3>
          ) : (
            <>
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '15px' }}>
                <strong style={{ fontSize: '14px' }}>
                  Total de números: {data.length} | Ventas totales: {formatCurrency(data.reduce((sum, d) => sum + d.ventas, 0))}
                </strong>
              </div>
              <div className="table-responsive" style={{ maxHeight: '400px', overflow: 'auto' }}>
                <table className="table table-hover table-sm">
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Número</th>
                      <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Ventas</th>
                      <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Límite</th>
                      <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Disponible</th>
                      <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>% Vendido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((d, i) => (
                      <tr key={i} style={{
                        backgroundColor: parseFloat(d.porcentaje) > 80 ? '#f8d7da' : parseFloat(d.porcentaje) > 50 ? '#fff3cd' : 'inherit'
                      }}>
                        <td style={{ fontWeight: '600' }}>{d.numero}</td>
                        <td>{formatCurrency(d.ventas)}</td>
                        <td>{formatCurrency(d.limite)}</td>
                        <td>{formatCurrency(d.disponible)}</td>
                        <td style={{
                          color: parseFloat(d.porcentaje) > 80 ? '#dc3545' : parseFloat(d.porcentaje) > 50 ? '#ffc107' : '#28a745',
                          fontWeight: '500'
                        }}>{d.porcentaje}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayMonitoring;
