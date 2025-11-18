import React, { useState, useEffect } from 'react';

const HistoricalSales = () => {
  const [mainTab, setMainTab] = useState('general');
  const [fechaInicial, setFechaInicial] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [mostrarComision2, setMostrarComision2] = useState(false);
  const [filterType, setFilterType] = useState('todos');
  const [filtroRapido, setFiltroRapido] = useState('');
  const [data, setData] = useState([]);
  const [zonasList, setZonasList] = useState([]);
  const [gruposList, setGruposList] = useState([]);
  const [totals, setTotals] = useState({ tickets: 0, venta: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0, caida: 0, final: 0 });

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    const mockData = [];
    for (let i = 1; i <= 15; i++) {
      const venta = Math.floor(Math.random() * 5000) + 100;
      const comisiones = venta * 0.1;
      const descuentos = venta * 0.02;
      const premios = Math.floor(Math.random() * 2000);
      const neto = venta - comisiones - descuentos - premios;
      const caida = Math.floor(Math.random() * 100);
      const final = neto - caida;

      mockData.push({
        ref: `B-${String(1000 + i).padStart(4, '0')}`,
        codigo: `RB00${i}`,
        tickets: Math.floor(Math.random() * 50) + 10,
        venta, comisiones, descuentos, premios, neto, caida, final
      });
    }
    setData(mockData);

    setTotals({
      tickets: mockData.reduce((sum, d) => sum + d.tickets, 0),
      venta: mockData.reduce((sum, d) => sum + d.venta, 0),
      comisiones: mockData.reduce((sum, d) => sum + d.comisiones, 0),
      descuentos: mockData.reduce((sum, d) => sum + d.descuentos, 0),
      premios: mockData.reduce((sum, d) => sum + d.premios, 0),
      neto: mockData.reduce((sum, d) => sum + d.neto, 0),
      caida: mockData.reduce((sum, d) => sum + d.caida, 0),
      final: mockData.reduce((sum, d) => sum + d.final, 0)
    });

    setZonasList([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' }
    ]);

    setGruposList([
      { id: 1, name: 'Grupo A' },
      { id: 2, name: 'Grupo B' },
      { id: 3, name: 'Grupo C' }
    ]);
  }, []);

  const FILTER_OPTIONS = [
    { key: 'todos', label: 'Todos' },
    { key: 'con_ventas', label: 'Con ventas' },
    { key: 'con_premios', label: 'Con premios' },
    { key: 'con_tickets_pendientes', label: 'Con tickets pendientes' },
    { key: 'ventas_negativas', label: 'Con ventas netas negativas' },
    { key: 'ventas_positivas', label: 'Con ventas netas positivas' }
  ];

  const MAIN_TABS = [
    { key: 'general', label: 'General' },
    { key: 'por_sorteo', label: 'Por sorteo' },
    { key: 'combinaciones', label: 'Combinaciones' },
    { key: 'por_zona', label: 'Por zona' }
  ];

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-header p-0">
          <ul className="nav nav-tabs">
            {MAIN_TABS.map(tab => (
              <li className="nav-item" key={tab.key}>
                <button
                  className={`nav-link ${mainTab === tab.key ? 'active' : ''}`}
                  onClick={() => setMainTab(tab.key)}
                  style={{
                    color: mainTab === tab.key ? '#51cbce' : '#333',
                    borderColor: mainTab === tab.key ? '#dee2e6 #dee2e6 #fff' : 'transparent',
                    fontWeight: mainTab === tab.key ? '500' : '400'
                  }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body">
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>Reportes</h3>

          <div className="row mb-3">
            <div className="col-md-3">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha inicial</label>
              <input type="date" className="form-control" value={fechaInicial} onChange={(e) => setFechaInicial(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha final</label>
              <input type="date" className="form-control" value={fechaFinal} onChange={(e) => setFechaFinal(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Zonas</label>
              <select className="form-select" multiple value={zonas} onChange={(e) => setZonas(Array.from(e.target.selectedOptions, o => o.value))} style={{ height: '80px' }}>
                {zonasList.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              {zonas.length > 0 && <small className="text-muted">{zonas.length} seleccionadas</small>}
            </div>
            <div className="col-md-3">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Grupo</label>
              <select className="form-select" value={grupo} onChange={(e) => setGrupo(e.target.value)}>
                <option value="">Seleccione</option>
                {gruposList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="mostrarComision2" checked={mostrarComision2} onChange={(e) => setMostrarComision2(e.target.checked)} />
            <label className="form-check-label" htmlFor="mostrarComision2" style={{ color: '#9A9A9A', fontSize: '12px' }}>Mostrar comisión #2</label>
          </div>

          <div className="mb-4">
            <button className="btn me-2" style={{ backgroundColor: '#51cbce', color: 'white', borderRadius: '30px', padding: '10px 40px', textTransform: 'uppercase' }}>Ver ventas</button>
            <button className="btn me-2" style={{ backgroundColor: '#51cbce', color: 'white', borderRadius: '30px', padding: '10px 20px', textTransform: 'uppercase' }}>CSV</button>
            <button className="btn" style={{ backgroundColor: '#51cbce', color: 'white', borderRadius: '30px', padding: '10px 20px', textTransform: 'uppercase' }}>PDF</button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button className="nav-link active" style={{ color: '#51cbce' }}>Bancas</button>
              </li>
            </ul>
          </div>

          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '20px' }}>Total: {formatCurrency(totals.final)}</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '10px', display: 'block' }}>Filtrar</label>
            <div className="btn-group flex-wrap" role="group">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  className={`btn ${filterType === opt.key ? 'btn-info' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterType(opt.key)}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
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
                  {['Ref.', 'Código', 'Tickets', 'Venta', 'Comisiones', 'Descuentos', 'Premios', 'Neto', 'Caída', 'Final'].map(h => (
                    <th key={h} style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#e3f2fd' }}>
                  <td style={{ fontWeight: '600' }}>Totales</td>
                  <td>-</td>
                  <td style={{ fontWeight: '600' }}>{totals.tickets}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.venta)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.comisiones)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.descuentos)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.premios)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.neto)}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(totals.caida)}</td>
                  <td style={{ fontWeight: '600', color: totals.final >= 0 ? '#28a745' : '#dc3545' }}>{formatCurrency(totals.final)}</td>
                </tr>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td>{d.ref}</td>
                    <td>{d.codigo}</td>
                    <td>{d.tickets}</td>
                    <td>{formatCurrency(d.venta)}</td>
                    <td>{formatCurrency(d.comisiones)}</td>
                    <td>{formatCurrency(d.descuentos)}</td>
                    <td>{formatCurrency(d.premios)}</td>
                    <td>{formatCurrency(d.neto)}</td>
                    <td>{formatCurrency(d.caida)}</td>
                    <td style={{ color: d.final >= 0 ? '#28a745' : '#dc3545' }}>{formatCurrency(d.final)}</td>
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

export default HistoricalSales;
