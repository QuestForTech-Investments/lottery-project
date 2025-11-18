import React, { useState } from 'react';

const TicketAnomalies = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [filtroTickets, setFiltroTickets] = useState('');
  const [filtroCambios, setFiltroCambios] = useState('');
  const [ticketsData, setTicketsData] = useState([]);
  const [cambiosData, setCambiosData] = useState([]);

  return (
    <div className="container-fluid" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="card">
        <div className="card-body">
          <h3 style={{ textAlign: 'center', color: '#51cbce', marginBottom: '30px', fontWeight: '400' }}>
            Anomalías
          </h3>

          <div className="row mb-4">
            <div className="col-md-6">
              <label style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Fecha</label>
              <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)}
                style={{ height: '40px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Tickets Section */}
          <h5 style={{ textAlign: 'center', color: '#333', marginBottom: '20px', fontWeight: '500' }}>Tickets</h5>
          <div className="mb-3 text-end">
            <input type="text" className="form-control d-inline-block" placeholder="Filtrado rápido" value={filtroTickets}
              onChange={(e) => setFiltroTickets(e.target.value)} style={{ maxWidth: '300px', height: '35px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
            <button className="btn btn-info ms-2" disabled style={{ padding: '5px 10px' }}><i className="fa fa-search"></i></button>
          </div>
          <div className="table-responsive mb-4">
            <table className="table table-hover">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Número ▼</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Fecha ▲</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Usuario ▲</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Monto</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Premio</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Fecha de cancelación ▲</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Estado ▲</th>
                </tr>
              </thead>
              <tbody>
                {ticketsData.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#51cbce' }}>No hay entradas disponibles</td></tr>
                ) : (
                  ticketsData.map((t, i) => (
                    <tr key={i}><td>{t.numero}</td><td>{t.fecha}</td><td>{t.usuario}</td><td>{t.monto}</td><td>{t.premio}</td><td>{t.fechaCancelacion}</td><td>{t.estado}</td></tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ color: '#9A9A9A', fontSize: '12px', marginBottom: '30px' }}>Mostrando {ticketsData.length} de {ticketsData.length} entradas</div>

          {/* Cambios de resultados Section */}
          <h5 style={{ textAlign: 'center', color: '#333', marginBottom: '20px', fontWeight: '500' }}>Cambios de resultados</h5>
          <div className="mb-3 text-end">
            <input type="text" className="form-control d-inline-block" placeholder="Filtrado rápido" value={filtroCambios}
              onChange={(e) => setFiltroCambios(e.target.value)} style={{ maxWidth: '300px', height: '35px', borderColor: '#DDDDDD', borderRadius: '4px' }} />
            <button className="btn btn-info ms-2" disabled style={{ padding: '5px 10px' }}><i className="fa fa-search"></i></button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Grupos ▲</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Sorteo ▲</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Fecha ▲</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600' }}>Cambios</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Usuario ▲</th>
                  <th style={{ color: '#9A9A9A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Última actualización ▲</th>
                </tr>
              </thead>
              <tbody>
                {cambiosData.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#51cbce' }}>No hay entradas disponibles</td></tr>
                ) : (
                  cambiosData.map((c, i) => (
                    <tr key={i}><td>{c.grupos}</td><td>{c.sorteo}</td><td>{c.fecha}</td><td>{c.cambios}</td><td>{c.usuario}</td><td>{c.ultimaActualizacion}</td></tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ color: '#9A9A9A', fontSize: '12px' }}>Mostrando {cambiosData.length} de {cambiosData.length} entradas</div>
        </div>
      </div>
    </div>
  );
};

export default TicketAnomalies;
