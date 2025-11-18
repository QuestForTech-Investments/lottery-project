import React, { useState, useEffect } from 'react';
import '../assets/css/FormStyles.css';

const TicketMonitoring = () => {
  // Filter states
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [banca, setBanca] = useState('');
  const [loteria, setLoteria] = useState('');
  const [tipoJugada, setTipoJugada] = useState('');
  const [numero, setNumero] = useState('');
  const [pendientesPago, setPendientesPago] = useState(false);
  const [soloGanadores, setSoloGanadores] = useState(false);
  const [zona, setZona] = useState('');
  const [filtroRapido, setFiltroRapido] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Data states
  const [tickets, setTickets] = useState([]);
  const [loterias, setLoterias] = useState([]);
  const [tiposJugada, setTiposJugada] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [totals, setTotals] = useState({
    montoTotal: 0,
    totalPremios: 0,
    totalPendiente: 0
  });
  const [counts, setCounts] = useState({
    todos: 0,
    ganadores: 0,
    pendientes: 0,
    perdedores: 0,
    cancelados: 0
  });

  // Generate mock data
  const generateMockTickets = () => {
    const estados = ['Ganador', 'Pendiente', 'Perdedor', 'Cancelado'];
    const usuarios = ['admin', 'vendedor1', 'vendedor2', 'cajero1', 'supervisor'];
    const mockTickets = [];

    for (let i = 1; i <= 25; i++) {
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const monto = Math.floor(Math.random() * 500) + 10;
      const premio = estado === 'Ganador' ? Math.floor(Math.random() * 5000) + 100 : 0;
      const fechaCancelacion = estado === 'Cancelado'
        ? new Date(Date.now() - Math.random() * 86400000).toLocaleDateString()
        : '-';

      mockTickets.push({
        numero: `T-${String(10000 + i).padStart(6, '0')}`,
        fecha: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString(),
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        monto: monto,
        premio: premio,
        fechaCancelacion: fechaCancelacion,
        estado: estado
      });
    }

    return mockTickets;
  };

  // Load initial data
  useEffect(() => {
    // Generate mock tickets
    const mockData = generateMockTickets();
    setTickets(mockData);

    // Calculate counts by status
    const ganadores = mockData.filter(t => t.estado === 'Ganador').length;
    const pendientes = mockData.filter(t => t.estado === 'Pendiente').length;
    const perdedores = mockData.filter(t => t.estado === 'Perdedor').length;
    const cancelados = mockData.filter(t => t.estado === 'Cancelado').length;

    setCounts({
      todos: mockData.length,
      ganadores,
      pendientes,
      perdedores,
      cancelados
    });

    // Calculate totals
    const totalMonto = mockData.reduce((sum, t) => sum + t.monto, 0);
    const totalPremios = mockData.reduce((sum, t) => sum + t.premio, 0);
    const totalPendiente = mockData.filter(t => t.estado === 'Pendiente').reduce((sum, t) => sum + t.monto, 0);

    setTotals({
      montoTotal: totalMonto,
      totalPremios: totalPremios,
      totalPendiente: totalPendiente
    });

    // Mock lotteries
    setLoterias([
      { id: 1, name: 'Nacional 12PM' },
      { id: 2, name: 'Nacional 3PM' },
      { id: 3, name: 'NY 10:30AM' },
      { id: 4, name: 'Florida 1:30PM' }
    ]);

    // Mock bet types
    setTiposJugada([
      { id: 1, name: 'Directo' },
      { id: 2, name: 'Palé' },
      { id: 3, name: 'Tripleta' },
      { id: 4, name: 'Pick Two' }
    ]);

    // Mock zones
    setZonas([
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' },
      { id: 4, name: 'Zona Oeste' }
    ]);
  }, []);

  const handleFiltrar = () => {
    // Regenerate mock data with filters
    const mockData = generateMockTickets();
    setTickets(mockData);
    console.log('Filtering tickets...', { fecha, banca, loteria, tipoJugada, numero });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-body">
          {/* Title */}
          <h3 style={{
            textAlign: 'center',
            color: '#51cbce',
            marginBottom: '30px',
            fontWeight: '400'
          }}>
            Monitor de tickets
          </h3>

          {/* Filters Section */}
          <div style={{ marginBottom: '20px' }}>
            <div className="row">
              {/* Row 1: Fecha, Banca, Lotería */}
              <div className="col-md-4 mb-3">
                <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                  Fecha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    className="form-control"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    style={{
                      height: '40px',
                      borderColor: '#DDDDDD',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                  Banca
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={banca}
                  onChange={(e) => setBanca(e.target.value)}
                  placeholder=""
                  style={{
                    height: '40px',
                    borderColor: '#DDDDDD',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                  Lotería
                </label>
                <select
                  className="form-select"
                  value={loteria}
                  onChange={(e) => setLoteria(e.target.value)}
                  style={{
                    height: '40px',
                    borderColor: '#DDDDDD',
                    borderRadius: '4px',
                    color: loteria ? '#333' : '#9A9A9A'
                  }}
                >
                  <option value="">Seleccione</option>
                  {loterias.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              {/* Row 2: Tipo de jugada, Número, Toggles */}
              <div className="col-md-4 mb-3">
                <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                  Tipo de jugada
                </label>
                <select
                  className="form-select"
                  value={tipoJugada}
                  onChange={(e) => setTipoJugada(e.target.value)}
                  style={{
                    height: '40px',
                    borderColor: '#DDDDDD',
                    borderRadius: '4px',
                    color: tipoJugada ? '#333' : '#9A9A9A'
                  }}
                >
                  <option value="">Seleccione</option>
                  {tiposJugada.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                  Número
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  style={{
                    height: '40px',
                    borderColor: '#DDDDDD',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div className="col-md-2 mb-3">
                <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                  Pendientes de pago
                </label>
                <div className="form-check form-switch" style={{ paddingTop: '8px' }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={pendientesPago}
                    onChange={(e) => setPendientesPago(e.target.checked)}
                    style={{
                      width: '50px',
                      height: '25px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              <div className="col-md-2 mb-3">
                <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                  Sólo tickets ganadores
                </label>
                <div className="form-check form-switch" style={{ paddingTop: '8px' }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={soloGanadores}
                    onChange={(e) => setSoloGanadores(e.target.checked)}
                    style={{
                      width: '50px',
                      height: '25px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              {/* Row 3: Zonas */}
              <div className="col-md-12 mb-3">
                <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                  Zonas
                </label>
                <select
                  className="form-select"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  style={{
                    height: '40px',
                    borderColor: '#DDDDDD',
                    borderRadius: '4px',
                    color: zona ? '#333' : '#9A9A9A'
                  }}
                >
                  <option value="">Selecione uno...</option>
                  {zonas.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Button */}
            <div className="text-center mb-4">
              <button
                className="btn"
                onClick={handleFiltrar}
                style={{
                  backgroundColor: '#51cbce',
                  color: 'white',
                  padding: '10px 60px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '30px',
                  border: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Filtrar
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '10px', display: 'block' }}>
              Filtrar
            </label>
            <div className="btn-group" role="group">
              {[
                { key: 'todos', label: 'TODOS', count: counts.todos },
                { key: 'ganadores', label: 'GANADORES', count: counts.ganadores },
                { key: 'pendientes', label: 'PENDIENTES', count: counts.pendientes },
                { key: 'perdedores', label: 'PERDEDORES', count: counts.perdedores },
                { key: 'cancelados', label: 'CANCELADO', count: counts.cancelados }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  className={`btn ${filtroEstado === tab.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFiltroEstado(tab.key)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: '500',
                    borderRadius: tab.key === 'todos' ? '4px 0 0 4px' : tab.key === 'cancelados' ? '0 4px 4px 0' : '0',
                    backgroundColor: filtroEstado === tab.key ? '#51cbce' : 'transparent',
                    borderColor: filtroEstado === tab.key ? '#51cbce' : '#DDDDDD',
                    color: filtroEstado === tab.key ? 'white' : '#333'
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#51cbce', margin: '5px 0', fontSize: '24px' }}>
              Monto total: {formatCurrency(totals.montoTotal)}
            </h3>
            <h3 style={{ color: '#51cbce', margin: '5px 0', fontSize: '24px' }}>
              Total de premios: {formatCurrency(totals.totalPremios)}
            </h3>
            <h3 style={{ color: '#51cbce', margin: '5px 0', fontSize: '24px' }}>
              Total pendiente de pago: {formatCurrency(totals.totalPendiente)}
            </h3>
          </div>

          {/* Quick Filter and Table */}
          <div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filtro rapido"
                value={filtroRapido}
                onChange={(e) => setFiltroRapido(e.target.value)}
                style={{
                  maxWidth: '300px',
                  height: '35px',
                  borderColor: '#DDDDDD',
                  borderRadius: '4px'
                }}
              />
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
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#9A9A9A' }}>
                        Mostrando 0 entradas
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket, index) => (
                      <tr key={index}>
                        <td>{ticket.numero}</td>
                        <td>{ticket.fecha}</td>
                        <td>{ticket.usuario}</td>
                        <td>{formatCurrency(ticket.monto)}</td>
                        <td>{formatCurrency(ticket.premio)}</td>
                        <td>{ticket.fechaCancelacion || '-'}</td>
                        <td>{ticket.estado}</td>
                        <td>
                          <button className="btn btn-sm btn-info">
                            <i className="fa fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketMonitoring;
