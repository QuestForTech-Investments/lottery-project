import { useState } from 'react';
import CreateTransactionModal from './modals/CreateTransactionModal';

// Mock data for development
const MOCK_TRANSACTIONS = [
  {
    id: 1,
    numero: 'CP-001',
    fecha: '18/11/2025',
    hora: '09:30:00',
    creadoPor: 'admin',
    notas: 'Cobro banca LA CENTRAL 01'
  },
  {
    id: 2,
    numero: 'CP-002',
    fecha: '18/11/2025',
    hora: '10:15:00',
    creadoPor: 'admin',
    notas: 'Pago a LA CENTRAL 10'
  },
  {
    id: 3,
    numero: 'CP-003',
    fecha: '18/11/2025',
    hora: '11:00:00',
    creadoPor: 'supervisor',
    notas: 'Cobro banca LA CENTRAL 16'
  },
  {
    id: 4,
    numero: 'CP-004',
    fecha: '18/11/2025',
    hora: '12:30:00',
    creadoPor: 'admin',
    notas: 'Pago mensual CARIBBEAN 186'
  },
  {
    id: 5,
    numero: 'CP-005',
    fecha: '18/11/2025',
    hora: '14:00:00',
    creadoPor: 'supervisor',
    notas: 'Cobro semanal grupo Guyana'
  },
  {
    id: 6,
    numero: 'CP-006',
    fecha: '17/11/2025',
    hora: '16:45:00',
    creadoPor: 'admin',
    notas: 'Pago comisiones LA CENTRAL 63'
  },
  {
    id: 7,
    numero: 'CP-007',
    fecha: '17/11/2025',
    hora: '17:30:00',
    creadoPor: 'supervisor',
    notas: 'Cobro balance negativo LA CENTRAL 101'
  },
  {
    id: 8,
    numero: 'CP-008',
    fecha: '17/11/2025',
    hora: '18:00:00',
    creadoPor: 'admin',
    notas: 'Pago premios CARIBBEAN 198'
  }
];

/**
 * CollectionsPaymentsList
 * EXACT replica of Vue.js app: https://la-numbers.apk.lol/#/simplified-accountable-transaction-groups
 * Lista de cobros y pagos registrados en el sistema
 */
const CollectionsPaymentsList = () => {
  const [startDate, setStartDate] = useState('11/18/2025');
  const [endDate, setEndDate] = useState('11/18/2025');
  const [quickFilter, setQuickFilter] = useState('');
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleFilter = () => {
    console.log('Filtering...', { startDate, endDate });
    // TODO: Call API endpoint when confirmed
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="container-fluid p-4">
      {/* Title */}
      <h3 className="mb-4" style={{ textAlign: 'center', fontSize: '24px', fontWeight: 500 }}>
        Cobros y pagos
      </h3>

      {/* White card container */}
      <div className="card">
        <div className="card-body">
          {/* Filters Row */}
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Fecha inicial
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white" style={{ border: '1px solid #ddd' }}>
                  <i className="fa fa-calendar"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ border: '1px solid #ddd', fontSize: '13px' }}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Fecha final
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white" style={{ border: '1px solid #ddd' }}>
                  <i className="fa fa-calendar"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ border: '1px solid #ddd', fontSize: '13px' }}
                />
              </div>
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-sm w-100"
                onClick={handleFilter}
                style={{
                  backgroundColor: '#51cbce',
                  borderColor: '#51cbce',
                  color: 'white',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  padding: '6px 16px'
                }}
              >
                Filtrar
              </button>
            </div>
          </div>

          {/* Quick Filter and Table */}
          <div className="row">
            <div className="col-12">
              {/* Quick Filter - Right aligned */}
              <div className="d-flex justify-content-end mb-3">
                <div className="input-group" style={{ maxWidth: '300px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Filtrado rápido"
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                    style={{ border: '1px solid #ddd', fontSize: '13px' }}
                  />
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: '#9ed4e5',
                      borderColor: '#9ed4e5',
                      color: 'white'
                    }}
                  >
                    <i className="fa fa-search"></i>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover" style={{ fontSize: '13px' }}>
                  <thead style={{ backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th
                        onClick={() => handleSort('numero')}
                        style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                      >
                        Número
                        {sortColumn === 'numero' && (
                          <i className={`fa fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th style={{ fontSize: '13px', fontWeight: 600 }}>Fecha</th>
                      <th style={{ fontSize: '13px', fontWeight: 600 }}>Hora</th>
                      <th style={{ fontSize: '13px', fontWeight: 600 }}>Creado por</th>
                      <th style={{ fontSize: '13px', fontWeight: 600 }}>Notas</th>
                      <th style={{ fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                        <i className="fa fa-cog"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div
                            className="alert alert-info mb-0"
                            role="alert"
                            style={{ backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', color: '#0c5460' }}
                          >
                            No hay entradas disponibles
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td>{transaction.numero}</td>
                          <td>{transaction.fecha}</td>
                          <td>{transaction.hora}</td>
                          <td>{transaction.creadoPor}</td>
                          <td>{transaction.notas}</td>
                          <td className="text-center">
                            <button className="btn btn-sm btn-light">
                              <i className="fa fa-ellipsis-v"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div style={{ fontSize: '13px', color: '#666' }}>
                  Mostrando {transactions.length} de {transactions.length} entradas
                </div>
              </div>

              {/* Create Button - Centered */}
              <div className="text-center mt-4">
                <button
                  className="btn"
                  onClick={handleCreate}
                  style={{
                    backgroundColor: '#51cbce',
                    borderColor: '#51cbce',
                    color: 'white',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '13px',
                    padding: '10px 40px',
                    minWidth: '120px'
                  }}
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default CollectionsPaymentsList;
