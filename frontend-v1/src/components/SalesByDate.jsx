import React, { useState, useEffect } from 'react';

const SalesByDate = () => {
  const [fechaInicial, setFechaInicial] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState([]);
  const [data, setData] = useState([]);
  const [zonasList, setZonasList] = useState([]);
  const [totals, setTotals] = useState({ ventas: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0 });

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    const mockData = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const ventas = Math.floor(Math.random() * 10000) + 1000;
      const comisiones = ventas * 0.1;
      const descuentos = ventas * 0.02;
      const premios = Math.floor(Math.random() * 3000);
      const neto = ventas - comisiones - descuentos - premios;

      mockData.push({ fecha: date.toLocaleDateString(), ventas, comisiones, descuentos, premios, neto });
    }
    setData(mockData);

    setTotals({
      ventas: mockData.reduce((sum, d) => sum + d.ventas, 0),
      comisiones: mockData.reduce((sum, d) => sum + d.comisiones, 0),
      descuentos: mockData.reduce((sum, d) => sum + d.descuentos, 0),
      premios: mockData.reduce((sum, d) => sum + d.premios, 0),
      neto: mockData.reduce((sum, d) => sum + d.neto, 0)
    });

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
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>Ventas por fecha</h3>

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

          <div className="mb-4">
            <button className="btn me-2" style={{ backgroundColor: '#51cbce', color: 'white', borderRadius: '30px', padding: '10px 40px', textTransform: 'uppercase' }}>Ver ventas</button>
            <button className="btn me-2" style={{ backgroundColor: '#51cbce', color: 'white', borderRadius: '30px', padding: '10px 20px', textTransform: 'uppercase' }}>CSV</button>
            <button className="btn" style={{ backgroundColor: '#51cbce', color: 'white', borderRadius: '30px', padding: '10px 20px', textTransform: 'uppercase' }}>PDF</button>
          </div>

          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '20px' }}>Total Neto: {formatCurrency(totals.neto)}</h3>

          <div className="table-responsive">
            <table className="table table-hover table-sm">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {['Fecha', 'Ventas', 'Comisiones', 'Descuentos', 'Premios', 'Neto'].map(h => (
                    <th key={h} style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#e3f2fd' }}>
                  <td style={{ fontWeight: '600' }}>Totales</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.ventas)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.comisiones)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.descuentos)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.premios)}</td>
                  <td style={{ fontWeight: '600', color: totals.neto >= 0 ? '#28a745' : '#dc3545' }}>{formatCurrency(totals.neto)}</td>
                </tr>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td>{d.fecha}</td>
                    <td>{formatCurrency(d.ventas)}</td>
                    <td>{formatCurrency(d.comisiones)}</td>
                    <td>{formatCurrency(d.descuentos)}</td>
                    <td>{formatCurrency(d.premios)}</td>
                    <td style={{ color: d.neto >= 0 ? '#28a745' : '#dc3545' }}>{formatCurrency(d.neto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ color: '#9A9A9A', fontSize: '12px' }}>Mostrando {data.length} entradas</div>
        </div>
      </div>
    </div>
  );
};

export default SalesByDate;
