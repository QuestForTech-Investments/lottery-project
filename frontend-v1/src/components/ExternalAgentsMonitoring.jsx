import React, { useState, useEffect, useMemo } from 'react';

const ExternalAgentsMonitoring = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [agente, setAgente] = useState('');
  const [loteria, setLoteria] = useState('');
  const [tipoJugada, setTipoJugada] = useState('');
  const [numero, setNumero] = useState('');
  const [soloGanadores, setSoloGanadores] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroRapido, setFiltroRapido] = useState('');
  const [tickets, setTickets] = useState([]);
  const [agentesList, setAgentesList] = useState([]);
  const [loteriasList, setLoteriasList] = useState([]);
  const [tiposJugadaList, setTiposJugadaList] = useState([]);
  const [totals, setTotals] = useState({ montoTotal: 0, totalPremios: 0 });
  const [counts, setCounts] = useState({ todos: 0, ganadores: 0, pendientes: 0, perdedores: 0, cancelados: 0 });

  const generateMockTickets = () => {
    const estados = ['Ganador', 'Pendiente', 'Perdedor', 'Cancelado'];
    const usuarios = ['agente_ext1', 'agente_ext2', 'agente_ext3', 'socio1', 'distribuidor1'];
    const mockTickets = [];

    for (let i = 1; i <= 20; i++) {
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const monto = Math.floor(Math.random() * 300) + 20;
      const premio = estado === 'Ganador' ? Math.floor(Math.random() * 3000) + 200 : 0;

      mockTickets.push({
        numero: `EXT-${String(20000 + i).padStart(6, '0')}`,
        fecha: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString(),
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        monto,
        premio,
        fechaCancelacion: estado === 'Cancelado' ? new Date(Date.now() - Math.random() * 86400000).toLocaleDateString() : null,
        estado
      });
    }
    return mockTickets;
  };

  useEffect(() => {
    const mockData = generateMockTickets();
    setTickets(mockData);

    const ganadores = mockData.filter(t => t.estado === 'Ganador').length;
    const pendientes = mockData.filter(t => t.estado === 'Pendiente').length;
    const perdedores = mockData.filter(t => t.estado === 'Perdedor').length;
    const cancelados = mockData.filter(t => t.estado === 'Cancelado').length;

    setCounts({ todos: mockData.length, ganadores, pendientes, perdedores, cancelados });
    setTotals({
      montoTotal: mockData.reduce((sum, t) => sum + t.monto, 0),
      totalPremios: mockData.reduce((sum, t) => sum + t.premio, 0)
    });

    setAgentesList([
      { id: 1, name: 'Agente Externo 1' },
      { id: 2, name: 'Agente Externo 2' },
      { id: 3, name: 'Socio Principal' }
    ]);

    setLoteriasList([
      { id: 1, name: 'Nacional 12PM' },
      { id: 2, name: 'NY 10:30AM' },
      { id: 3, name: 'Florida 1:30PM' }
    ]);

    setTiposJugadaList([
      { id: 1, name: 'Directo' },
      { id: 2, name: 'Palé' },
      { id: 3, name: 'Tripleta' }
    ]);
  }, []);

  const filteredTickets = useMemo(() => {
    let data = [...tickets];
    if (filtroEstado !== 'todos') {
      const estadoMap = { ganadores: 'Ganador', pendientes: 'Pendiente', perdedores: 'Perdedor', cancelados: 'Cancelado' };
      data = data.filter(t => t.estado === estadoMap[filtroEstado]);
    }
    if (filtroRapido) {
      const term = filtroRapido.toLowerCase();
      data = data.filter(t => t.numero.toLowerCase().includes(term) || t.usuario.toLowerCase().includes(term));
    }
    return data;
  }, [tickets, filtroEstado, filtroRapido]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const handleFiltrar = () => console.log('Filtrando...');

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-body">
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>
            Monitoreo de tickets de agentes externos
          </h3>

          <div className="row mb-3">
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha</label>
              <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
            </div>
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Agente</label>
              <select className="form-select" value={agente} onChange={(e) => setAgente(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px', color: agente ? '#333' : '#9A9A9A' }}>
                <option value="">Seleccione</option>
                {agentesList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Lotería</label>
              <select className="form-select" value={loteria} onChange={(e) => setLoteria(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px', color: loteria ? '#333' : '#9A9A9A' }}>
                <option value="">Seleccione</option>
                {loteriasList.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Tipo de jugada</label>
              <select className="form-select" value={tipoJugada} onChange={(e) => setTipoJugada(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px', color: tipoJugada ? '#333' : '#9A9A9A' }}>
                <option value="">Seleccione</option>
                {tiposJugadaList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Número</label>
              <input type="text" className="form-control" value={numero} onChange={(e) => setNumero(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
            </div>
            <div className="col-md-4">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Sólo tickets ganadores</label>
              <div className="form-check form-switch" style={{ paddingTop: '8px' }}>
                <input className="form-check-input" type="checkbox" role="switch" checked={soloGanadores}
                  onChange={(e) => setSoloGanadores(e.target.checked)} style={{ width: '50px', height: '25px', cursor: 'pointer' }} />
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <button className="btn" onClick={handleFiltrar}
              style={{ backgroundColor: '#51cbce', color: 'white', padding: '10px 60px', borderRadius: '30px', border: 'none', textTransform: 'uppercase', fontSize: '14px' }}>
              Filtrar
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '10px', display: 'block' }}>Filtrar</label>
            <div className="btn-group" role="group">
              {[
                { key: 'todos', label: 'TODOS', count: counts.todos },
                { key: 'ganadores', label: 'GANADORES', count: counts.ganadores },
                { key: 'pendientes', label: 'PENDIENTES', count: counts.pendientes },
                { key: 'perdedores', label: 'PERDEDORES', count: counts.perdedores },
                { key: 'cancelados', label: 'CANCELADO', count: counts.cancelados }
              ].map(tab => (
                <button key={tab.key} type="button"
                  className={`btn ${filtroEstado === tab.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFiltroEstado(tab.key)}
                  style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: filtroEstado === tab.key ? '#51cbce' : 'transparent',
                    borderColor: filtroEstado === tab.key ? '#51cbce' : '#DDDDDD', color: filtroEstado === tab.key ? 'white' : '#333' }}>
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ color: '#51cbce', margin: '5px 0', fontSize: '24px' }}>Monto total: {formatCurrency(totals.montoTotal)}</h3>
            <h3 style={{ color: '#51cbce', margin: '5px 0', fontSize: '24px' }}>Total de premios: {formatCurrency(totals.totalPremios)}</h3>
          </div>

          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Filtrado rápido" value={filtroRapido}
              onChange={(e) => setFiltroRapido(e.target.value)} style={{ maxWidth: '300px', height: '35px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Número</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Fecha</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Usuario</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Monto</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Premio</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Fecha de cancelación</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Estado</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#9A9A9A' }}>Mostrando 0 entradas</td></tr>
                ) : (
                  filteredTickets.map((t, i) => (
                    <tr key={i}><td>{t.numero}</td><td>{t.fecha}</td><td>{t.usuario}</td><td>{formatCurrency(t.monto)}</td>
                      <td>{formatCurrency(t.premio)}</td><td>{t.fechaCancelacion || '-'}</td>
                      <td style={{ color: t.estado === 'Ganador' ? '#28a745' : t.estado === 'Cancelado' ? '#dc3545' : '#333' }}>{t.estado}</td>
                      <td><button className="btn btn-sm btn-info"><i className="fa fa-eye"></i></button></td></tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ color: '#9A9A9A', fontSize: '12px' }}>Mostrando {filteredTickets.length} de {tickets.length} entradas</div>
        </div>
      </div>
    </div>
  );
};

export default ExternalAgentsMonitoring;
