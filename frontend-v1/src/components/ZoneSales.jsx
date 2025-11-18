import React, { useState, useEffect } from 'react';

const ZoneSales = () => {
  const [fechaInicial, setFechaInicial] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState([]);
  const [filterType, setFilterType] = useState('todos');
  const [filtroRapido, setFiltroRapido] = useState('');
  const [data, setData] = useState([]);
  const [zonasList, setZonasList] = useState([]);
  const [totals, setTotals] = useState({ bancas: 0, ventas: 0, comisiones: 0, premios: 0, neto: 0 });

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    const mockData = [
      { zona: 'Zona Norte', bancas: 12, ventas: 45000, comisiones: 4500, premios: 15000, neto: 25500 },
      { zona: 'Zona Sur', bancas: 8, ventas: 32000, comisiones: 3200, premios: 18000, neto: 10800 },
      { zona: 'Zona Este', bancas: 15, ventas: 58000, comisiones: 5800, premios: 22000, neto: 30200 },
      { zona: 'Zona Oeste', bancas: 10, ventas: 41000, comisiones: 4100, premios: 12000, neto: 24900 },
      { zona: 'Zona Centro', bancas: 6, ventas: 28000, comisiones: 2800, premios: 35000, neto: -9800 }
    ];
    setData(mockData);

    setTotals({
      bancas: mockData.reduce((sum, d) => sum + d.bancas, 0),
      ventas: mockData.reduce((sum, d) => sum + d.ventas, 0),
      comisiones: mockData.reduce((sum, d) => sum + d.comisiones, 0),
      premios: mockData.reduce((sum, d) => sum + d.premios, 0),
      neto: mockData.reduce((sum, d) => sum + d.neto, 0)
    });

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' },
      { id: 5, name: 'Zona Centro' }
    ]);
  }, []);

  const FILTER_OPTIONS = [
    { key: 'todos', label: 'TODOS' },
    { key: 'con_ventas', label: 'CON VENTAS' },
    { key: 'con_premios', label: 'CON PREMIOS' },
    { key: 'ventas_negativas', label: 'VENTAS NEGATIVAS' },
    { key: 'ventas_positivas', label: 'VENTAS POSITIVAS' }
  ];

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-body">
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>Ventas por zona</h3>

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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '10px', display: 'block' }}>Filtrar</label>
            <div className="btn-group" role="group">
              {FILTER_OPTIONS.map(opt => (
                <button key={opt.key} type="button" className={`btn ${filterType === opt.key ? 'btn-info' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterType(opt.key)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Filtro rapido" value={filtroRapido}
              onChange={(e) => setFiltroRapido(e.target.value)} style={{ maxWidth: '300px' }} />
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-sm">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {['Zona', 'Bancas', 'Ventas', 'Comisiones', 'Premios', 'Neto'].map(h => (
                    <th key={h} style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#e3f2fd' }}>
                  <td style={{ fontWeight: '600' }}>Totales</td>
                  <td style={{ fontWeight: '600' }}>{totals.bancas}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.ventas)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.comisiones)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.premios)}</td>
                  <td style={{ fontWeight: '600', color: totals.neto >= 0 ? '#28a745' : '#dc3545' }}>{formatCurrency(totals.neto)}</td>
                </tr>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '500' }}>{d.zona}</td>
                    <td>{d.bancas}</td>
                    <td>{formatCurrency(d.ventas)}</td>
                    <td>{formatCurrency(d.comisiones)}</td>
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

export default ZoneSales;
