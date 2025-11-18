import React, { useState, useEffect } from 'react';

const PlayTypePrizes = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sorteo, setSorteo] = useState('');
  const [zonas, setZonas] = useState([]);
  const [data, setData] = useState([]);
  const [sorteosList, setSorteosList] = useState([]);
  const [zonasList, setZonasList] = useState([]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    const mockData = [
      { tipoJugada: 'Directo', ventas: 15000, premios: 8500, neto: 6500, porcentaje: '43.3%' },
      { tipoJugada: 'Palé', ventas: 8000, premios: 12000, neto: -4000, porcentaje: '-50.0%' },
      { tipoJugada: 'Tripleta', ventas: 3500, premios: 21000, neto: -17500, porcentaje: '-500.0%' },
      { tipoJugada: 'Pick Two', ventas: 5200, premios: 2800, neto: 2400, porcentaje: '46.2%' },
      { tipoJugada: 'Pick Three', ventas: 2100, premios: 4500, neto: -2400, porcentaje: '-114.3%' },
      { tipoJugada: 'Pick Four', ventas: 1800, premios: 0, neto: 1800, porcentaje: '100.0%' }
    ];
    setData(mockData);

    setSorteosList([
      { id: 1, name: 'Nacional 12PM' },
      { id: 2, name: 'Nacional 3PM' },
      { id: 3, name: 'NY 10:30AM' },
      { id: 4, name: 'Florida 1:30PM' }
    ]);

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' }
    ]);
  }, []);

  const totalVentas = data.reduce((sum, d) => sum + d.ventas, 0);
  const totalPremios = data.reduce((sum, d) => sum + d.premios, 0);
  const totalNeto = data.reduce((sum, d) => sum + d.neto, 0);

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-body">
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>Premios por jugada</h3>

          <div className="row mb-3">
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha</label>
              <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Sorteo</label>
              <select className="form-select" value={sorteo} onChange={(e) => setSorteo(e.target.value)}>
                <option value="">Seleccione</option>
                {sorteosList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Zonas</label>
              <select className="form-select" multiple value={zonas} onChange={(e) => setZonas(Array.from(e.target.selectedOptions, o => o.value))}>
                {zonasList.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <button className="btn me-2" style={{ backgroundColor: '#51cbce', color: 'white', borderRadius: '30px', padding: '10px 40px', textTransform: 'uppercase' }}>Filtrar</button>
            <button className="btn" style={{ backgroundColor: '#51cbce', color: 'white', borderRadius: '30px', padding: '10px 20px', textTransform: 'uppercase' }}>PDF</button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-sm">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {['Tipo de jugada', 'Ventas', 'Premios', 'Neto', '% Ganancia'].map(h => (
                    <th key={h} style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#e3f2fd' }}>
                  <td style={{ fontWeight: '600' }}>Totales</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totalVentas)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totalPremios)}</td>
                  <td style={{ fontWeight: '600', color: totalNeto >= 0 ? '#28a745' : '#dc3545' }}>{formatCurrency(totalNeto)}</td>
                  <td style={{ fontWeight: '600' }}>{((totalNeto / totalVentas) * 100).toFixed(1)}%</td>
                </tr>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td>{d.tipoJugada}</td>
                    <td>{formatCurrency(d.ventas)}</td>
                    <td>{formatCurrency(d.premios)}</td>
                    <td style={{ color: d.neto >= 0 ? '#28a745' : '#dc3545' }}>{formatCurrency(d.neto)}</td>
                    <td style={{ color: d.neto >= 0 ? '#28a745' : '#dc3545' }}>{d.porcentaje}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayTypePrizes;
