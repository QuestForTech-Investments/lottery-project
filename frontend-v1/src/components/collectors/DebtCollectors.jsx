import React, { useState } from 'react';

const DebtCollectors = () => {
  const [activeTab, setActiveTab] = useState('balances');
  const [quickFilter, setQuickFilter] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [statusFilters, setStatusFilters] = useState({
    aprobada: false,
    pendiente: true,
    rechazada: true
  });

  // Tab Crear form state
  const [createForm, setCreateForm] = useState({
    tipo: '',
    bancaNombre: '',
    bancaCodigo: '',
    banco: '',
    monto: '',
    notas: ''
  });

  // Mockup data - Balances
  const [balances] = useState([
    { id: 1, banca: 'LA CENTRAL 01', inicio: 5000.00, actual: 4500.00 },
    { id: 2, banca: 'LA CENTRAL 02', inicio: 3000.00, actual: 3200.00 },
    { id: 3, banca: 'BANCA NORTE', inicio: 2500.00, actual: 2100.00 },
    { id: 4, banca: 'BANCA SUR', inicio: 4000.00, actual: 4300.00 },
    { id: 5, banca: 'BANCA ESTE', inicio: 3500.00, actual: 3000.00 }
  ]);

  // Mockup data - Transacciones
  const [transactions] = useState([
    { id: 1, tipo: 'Cobro', fecha: '18/11/2025', num: 'CB-001', banca: 'LA CENTRAL 01', banco: 'BANCO POPULAR', credito: 1000.00, debito: 0, msg: 'Pago semanal', estado: 'PENDIENTE' },
    { id: 2, tipo: 'Pago', fecha: '18/11/2025', num: 'PG-001', banca: 'LA CENTRAL 02', banco: 'BANCO BHD', credito: 0, debito: 500.00, msg: 'Retiro', estado: 'PENDIENTE' },
    { id: 3, tipo: 'Cobro', fecha: '17/11/2025', num: 'CB-002', banca: 'BANCA NORTE', banco: 'BANCO POPULAR', credito: 800.00, debito: 0, msg: 'Cobro mensual', estado: 'PENDIENTE' },
    { id: 4, tipo: 'Pago', fecha: '17/11/2025', num: 'PG-002', banca: 'BANCA SUR', banco: 'BANCO LA CENTRAL', credito: 0, debito: 300.00, msg: 'Pago proveedor', estado: 'RECHAZADA' },
    { id: 5, tipo: 'Cobro', fecha: '16/11/2025', num: 'CB-003', banca: 'BANCA ESTE', banco: 'BANCO BHD', credito: 1200.00, debito: 0, msg: 'Cobro quincenal', estado: 'RECHAZADA' },
    { id: 6, tipo: 'Pago', fecha: '16/11/2025', num: 'PG-003', banca: 'LA CENTRAL 01', banco: 'BANCO POPULAR', credito: 0, debito: 600.00, msg: 'Ajuste', estado: 'RECHAZADA' },
    { id: 7, tipo: 'Cobro', fecha: '15/11/2025', num: 'CB-004', banca: 'LA CENTRAL 02', banco: 'BANCO BHD', credito: 900.00, debito: 0, msg: 'Pago de cliente', estado: 'APROBADA' },
    { id: 8, tipo: 'Pago', fecha: '15/11/2025', num: 'PG-004', banca: 'BANCA NORTE', banco: 'BANCO LA CENTRAL', credito: 0, debito: 400.00, msg: 'Comisión', estado: 'APROBADA' }
  ]);

  const filteredBalances = balances.filter(b =>
    b.banca.toLowerCase().includes(quickFilter.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = t.banca.toLowerCase().includes(quickFilter.toLowerCase()) ||
                          t.banco.toLowerCase().includes(quickFilter.toLowerCase()) ||
                          t.msg.toLowerCase().includes(quickFilter.toLowerCase());
    const matchesStatus = (
      (statusFilters.aprobada && t.estado === 'APROBADA') ||
      (statusFilters.pendiente && t.estado === 'PENDIENTE') ||
      (statusFilters.rechazada && t.estado === 'RECHAZADA')
    );
    return matchesFilter && matchesStatus;
  });

  const handleStatusChange = (status) => {
    setStatusFilters(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAgregar = () => {
    console.log('Agregar transacción:', createForm);
    alert('Transacción agregada (mockup)');
    // Reset form
    setCreateForm({
      tipo: '',
      bancaNombre: '',
      bancaCodigo: '',
      banco: '',
      monto: '',
      notas: ''
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Botón Refrescar */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => console.log('Refrescar')}
          style={{
            backgroundColor: '#51cbce',
            color: 'white',
            border: 'none',
            padding: '10px 40px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#45b8bb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#51cbce'}
        >
          REFRESCAR
        </button>
      </div>

      {/* Card Container */}
      <div style={{ backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {/* Tabs */}
        <div style={{ borderBottom: '2px solid #ddd', display: 'flex' }}>
          <button
            onClick={() => setActiveTab('balances')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === 'balances' ? '#51cbce' : 'white',
              color: activeTab === 'balances' ? 'white' : '#51cbce',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              borderBottom: activeTab === 'balances' ? 'none' : '2px solid #ddd'
            }}
          >
            Balances
          </button>
          <button
            onClick={() => setActiveTab('transacciones')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === 'transacciones' ? '#51cbce' : 'white',
              color: activeTab === 'transacciones' ? 'white' : '#51cbce',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              borderBottom: activeTab === 'transacciones' ? 'none' : '2px solid #ddd'
            }}
          >
            Transacciones
          </button>
          <button
            onClick={() => setActiveTab('crear')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === 'crear' ? '#51cbce' : 'white',
              color: activeTab === 'crear' ? 'white' : '#51cbce',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              borderBottom: activeTab === 'crear' ? 'none' : '2px solid #ddd'
            }}
          >
            Crear
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '20px' }}>
          {/* Tab Balances */}
          {activeTab === 'balances' && (
            <div>
              {/* Quick Filter */}
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                  <input
                    type="text"
                    placeholder="Filtrado rápido"
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 35px 6px 10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <i className="fa fa-search" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover" style={{ fontSize: '14px' }}>
                  <thead style={{ backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>#</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Banca</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Inicio</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Actual</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBalances.length > 0 ? (
                      filteredBalances.map((balance) => (
                        <tr key={balance.id}>
                          <td>{balance.id}</td>
                          <td>{balance.banca}</td>
                          <td>${balance.inicio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>${balance.actual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ textAlign: 'center' }}>
                            <i className="fa fa-info-circle" style={{ color: '#17a2b8', cursor: 'pointer' }}></i>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                          No hay entradas disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '10px' }}>
                Mostrando {filteredBalances.length} de {balances.length} entradas
              </div>
            </div>
          )}

          {/* Tab Transacciones */}
          {activeTab === 'transacciones' && (
            <div>
              {/* Date Filter */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Fecha</label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    width: '200px'
                  }}
                />
              </div>

              <hr />

              {/* Status Checkboxes */}
              <div style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={statusFilters.aprobada}
                    onChange={() => handleStatusChange('aprobada')}
                    style={{ accentColor: '#51cbce' }}
                  />
                  <span style={{ fontSize: '14px' }}>Aprobada</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={statusFilters.pendiente}
                    onChange={() => handleStatusChange('pendiente')}
                    style={{ accentColor: '#51cbce' }}
                  />
                  <span style={{ fontSize: '14px' }}>Pendiente</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={statusFilters.rechazada}
                    onChange={() => handleStatusChange('rechazada')}
                    style={{ accentColor: '#51cbce' }}
                  />
                  <span style={{ fontSize: '14px' }}>Rechazada</span>
                </label>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover" style={{ fontSize: '14px' }}>
                  <thead style={{ backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Tipo</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Fecha</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>#</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Banca</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Banco</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Crédito</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Débito</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Msg.</th>
                      <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Cancel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((trans) => (
                        <tr key={trans.id}>
                          <td>{trans.tipo}</td>
                          <td>{trans.fecha}</td>
                          <td>{trans.num}</td>
                          <td>{trans.banca}</td>
                          <td>{trans.banco}</td>
                          <td>${trans.credito.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>${trans.debito.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>{trans.msg}</td>
                          <td style={{ textAlign: 'center' }}>
                            <i className="fa fa-times-circle" style={{ color: '#dc3545', cursor: 'pointer' }}></i>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                          No hay entradas disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '10px' }}>
                Mostrando {filteredTransactions.length} de {transactions.length} entradas
              </div>
            </div>
          )}

          {/* Tab Crear */}
          {activeTab === 'crear' && (
            <div>
              {/* Alert (optional) */}
              <div className="alert alert-warning" role="alert" style={{ marginBottom: '20px' }}>
                <strong>Atención!</strong> Usted no tiene bancos asignados. Por favor contacte a su administrador.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Left Column */}
                <div>
                  {/* Tipo */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Tipo</label>
                    <select
                      value={createForm.tipo}
                      onChange={(e) => handleCreateFormChange('tipo', e.target.value)}
                      className="form-select"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="">Seleccione uno...</option>
                      <option value="cobro">Cobro</option>
                      <option value="pago">Pago</option>
                    </select>
                  </div>

                  {/* BANCA Section */}
                  <h6 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', marginTop: '20px' }}>BANCA</h6>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Nombre</label>
                    <input
                      type="text"
                      value={createForm.bancaNombre}
                      onChange={(e) => handleCreateFormChange('bancaNombre', e.target.value)}
                      className="form-control"
                      placeholder="Buscar banca..."
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Código</label>
                    <input
                      type="text"
                      value={createForm.bancaCodigo}
                      onChange={(e) => handleCreateFormChange('bancaCodigo', e.target.value)}
                      className="form-control"
                      placeholder="Código de banca..."
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  {/* Banco */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Banco</label>
                    <select
                      value={createForm.banco}
                      onChange={(e) => handleCreateFormChange('banco', e.target.value)}
                      className="form-select"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="">Seleccione uno...</option>
                      <option value="banco_popular">BANCO POPULAR</option>
                      <option value="banco_bhd">BANCO BHD</option>
                      <option value="banco_central">BANCO LA CENTRAL</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {/* Monto */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Monto</label>
                    <input
                      type="number"
                      value={createForm.monto}
                      onChange={(e) => handleCreateFormChange('monto', e.target.value)}
                      className="form-control"
                      placeholder="0.00"
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  {/* Notas */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Notas de la transacción</label>
                    <textarea
                      value={createForm.notas}
                      onChange={(e) => handleCreateFormChange('notas', e.target.value)}
                      className="form-control"
                      rows="5"
                      placeholder="Notas adicionales..."
                      style={{ fontSize: '14px' }}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Botón Agregar */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={handleAgregar}
                  style={{
                    backgroundColor: '#51cbce',
                    color: 'white',
                    border: 'none',
                    padding: '10px 40px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#45b8bb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#51cbce'}
                >
                  AGREGAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtCollectors;
