import React, { useState, useEffect } from 'react';

const PlayTypePrizesPercentages = () => {
  const [fechaInicial, setFechaInicial] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState([]);
  const [data, setData] = useState([]);
  const [zonasList, setZonasList] = useState([]);

  useEffect(() => {
    const mockData = [
      { tipoJugada: 'Directo', porcentajeVentas: '42.1%', porcentajePremios: '17.4%', porcentajeNeto: '48.9%' },
      { tipoJugada: 'Palé', porcentajeVentas: '22.5%', porcentajePremios: '24.5%', porcentajeNeto: '-30.1%' },
      { tipoJugada: 'Tripleta', porcentajeVentas: '9.8%', porcentajePremios: '42.9%', porcentajeNeto: '-131.6%' },
      { tipoJugada: 'Pick Two', porcentajeVentas: '14.6%', porcentajePremios: '5.7%', porcentajeNeto: '18.0%' },
      { tipoJugada: 'Pick Three', porcentajeVentas: '5.9%', porcentajePremios: '9.2%', porcentajeNeto: '-18.0%' },
      { tipoJugada: 'Pick Four', porcentajeVentas: '5.1%', porcentajePremios: '0.0%', porcentajeNeto: '13.5%' }
    ];
    setData(mockData);

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' }
    ]);
  }, []);

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-body">
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>Porcentajes de premios por jugada</h3>

          <div className="row mb-3">
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha inicial</label>
              <input type="date" className="form-control" value={fechaInicial} onChange={(e) => setFechaInicial(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha final</label>
              <input type="date" className="form-control" value={fechaFinal} onChange={(e) => setFechaFinal(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Zonas</label>
              <select className="form-select" multiple value={zonas} onChange={(e) => setZonas(Array.from(e.target.selectedOptions, o => o.value))}>
                {zonasList.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
          </div>

          <div className="text-center mb-4">
            <button className="btn" style={{ backgroundColor: '#51cbce', color: 'white', borderRadius: '30px', padding: '10px 60px', textTransform: 'uppercase' }}>Filtrar</button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-sm">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {['Tipo de jugada', '% de Ventas', '% de Premios', '% de Neto'].map(h => (
                    <th key={h} style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '500' }}>{d.tipoJugada}</td>
                    <td>{d.porcentajeVentas}</td>
                    <td>{d.porcentajePremios}</td>
                    <td style={{ color: d.porcentajeNeto.includes('-') ? '#dc3545' : '#28a745' }}>{d.porcentajeNeto}</td>
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

export default PlayTypePrizesPercentages;
