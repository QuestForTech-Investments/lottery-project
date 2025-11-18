import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/FormStyles.css';

const LoansList = () => {
  const [filters, setFilters] = useState({
    onlyActive: true,
    filterByZones: false,
    bettingPoolNumber: '',
    quickFilter: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentData, setPaymentData] = useState({
    bank: '',
    amount: ''
  });

  // Mockup data - 20 loans
  const loansData = [
    { id: 1, loanNumber: 'LP-001', totalLoaned: 5000.00, interestRate: 5.0, totalPaid: 2500.00, totalToPay: 2750.00, createdAt: '15/01/2025', lastPayment: '15/11/2025', installment: 500.00, pendingInstallments: 5, frequency: 'Semanal', paymentDay: 'Viernes', status: 'Activo', hasPending: false },
    { id: 2, loanNumber: 'LP-002', totalLoaned: 10000.00, interestRate: 6.0, totalPaid: 10600.00, totalToPay: 0.00, createdAt: '20/01/2025', lastPayment: '10/11/2025', installment: 1000.00, pendingInstallments: 0, frequency: 'Mensual', paymentDay: '15', status: 'Completo', hasPending: false },
    { id: 3, loanNumber: 'LP-003', totalLoaned: 3000.00, interestRate: 4.5, totalPaid: 0.00, totalToPay: 3135.00, createdAt: '01/02/2025', lastPayment: '-', installment: 300.00, pendingInstallments: 10, frequency: 'Semanal', paymentDay: 'Lunes', status: 'Activo', hasPending: true },
    { id: 4, loanNumber: 'LP-004', totalLoaned: 15000.00, interestRate: 7.0, totalPaid: 8000.00, totalToPay: 8050.00, createdAt: '10/02/2025', lastPayment: '12/11/2025', installment: 1500.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '10', status: 'Activo', hasPending: false },
    { id: 5, loanNumber: 'LP-005', totalLoaned: 2000.00, interestRate: 3.0, totalPaid: 2060.00, totalToPay: 0.00, createdAt: '15/02/2025', lastPayment: '01/11/2025', installment: 200.00, pendingInstallments: 0, frequency: 'Diario', paymentDay: 'Todos', status: 'Completo', hasPending: false },
    { id: 6, loanNumber: 'LP-006', totalLoaned: 8000.00, interestRate: 5.5, totalPaid: 4000.00, totalToPay: 4440.00, createdAt: '01/03/2025', lastPayment: '10/11/2025', installment: 800.00, pendingInstallments: 5, frequency: 'Semanal', paymentDay: 'Miércoles', status: 'Activo', hasPending: true },
    { id: 7, loanNumber: 'LP-007', totalLoaned: 12000.00, interestRate: 6.5, totalPaid: 0.00, totalToPay: 12780.00, createdAt: '10/03/2025', lastPayment: '-', installment: 1200.00, pendingInstallments: 10, frequency: 'Mensual', paymentDay: '20', status: 'Activo', hasPending: false },
    { id: 8, loanNumber: 'LP-008', totalLoaned: 4000.00, interestRate: 4.0, totalPaid: 4160.00, totalToPay: 0.00, createdAt: '20/03/2025', lastPayment: '05/11/2025', installment: 400.00, pendingInstallments: 0, frequency: 'Semanal', paymentDay: 'Jueves', status: 'Completo', hasPending: false },
    { id: 9, loanNumber: 'LP-009', totalLoaned: 7000.00, interestRate: 5.0, totalPaid: 3500.00, totalToPay: 3850.00, createdAt: '01/04/2025', lastPayment: '08/11/2025', installment: 700.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '5', status: 'Activo', hasPending: false },
    { id: 10, loanNumber: 'LP-010', totalLoaned: 1500.00, interestRate: 3.5, totalPaid: 1552.50, totalToPay: 0.00, createdAt: '10/04/2025', lastPayment: '30/10/2025', installment: 150.00, pendingInstallments: 0, frequency: 'Diario', paymentDay: 'Todos', status: 'Completo', hasPending: false },
    { id: 11, loanNumber: 'LP-011', totalLoaned: 20000.00, interestRate: 8.0, totalPaid: 10000.00, totalToPay: 11600.00, createdAt: '15/04/2025', lastPayment: '14/11/2025', installment: 2000.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '15', status: 'Activo', hasPending: true },
    { id: 12, loanNumber: 'LP-012', totalLoaned: 6000.00, interestRate: 4.5, totalPaid: 6270.00, totalToPay: 0.00, createdAt: '01/05/2025', lastPayment: '02/11/2025', installment: 600.00, pendingInstallments: 0, frequency: 'Semanal', paymentDay: 'Martes', status: 'Completo', hasPending: false },
    { id: 13, loanNumber: 'LP-013', totalLoaned: 9000.00, interestRate: 5.5, totalPaid: 4500.00, totalToPay: 4995.00, createdAt: '10/05/2025', lastPayment: '11/11/2025', installment: 900.00, pendingInstallments: 5, frequency: 'Semanal', paymentDay: 'Viernes', status: 'Activo', hasPending: false },
    { id: 14, loanNumber: 'LP-014', totalLoaned: 3500.00, interestRate: 4.0, totalPaid: 0.00, totalToPay: 3640.00, createdAt: '20/05/2025', lastPayment: '-', installment: 350.00, pendingInstallments: 10, frequency: 'Semanal', paymentDay: 'Lunes', status: 'Inactivo', hasPending: false },
    { id: 15, loanNumber: 'LP-015', totalLoaned: 25000.00, interestRate: 7.5, totalPaid: 12500.00, totalToPay: 14375.00, createdAt: '01/06/2025', lastPayment: '13/11/2025', installment: 2500.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '1', status: 'Activo', hasPending: true },
    { id: 16, loanNumber: 'LP-016', totalLoaned: 4500.00, interestRate: 4.5, totalPaid: 4702.50, totalToPay: 0.00, createdAt: '10/06/2025', lastPayment: '04/11/2025', installment: 450.00, pendingInstallments: 0, frequency: 'Semanal', paymentDay: 'Miércoles', status: 'Completo', hasPending: false },
    { id: 17, loanNumber: 'LP-017', totalLoaned: 11000.00, interestRate: 6.0, totalPaid: 5500.00, totalToPay: 6160.00, createdAt: '20/06/2025', lastPayment: '09/11/2025', installment: 1100.00, pendingInstallments: 5, frequency: 'Mensual', paymentDay: '20', status: 'Activo', hasPending: false },
    { id: 18, loanNumber: 'LP-018', totalLoaned: 5500.00, interestRate: 5.0, totalPaid: 0.00, totalToPay: 5775.00, createdAt: '01/07/2025', lastPayment: '-', installment: 550.00, pendingInstallments: 10, frequency: 'Semanal', paymentDay: 'Jueves', status: 'Inactivo', hasPending: false },
    { id: 19, loanNumber: 'LP-019', totalLoaned: 18000.00, interestRate: 7.0, totalPaid: 19260.00, totalToPay: 0.00, createdAt: '10/07/2025', lastPayment: '06/11/2025', installment: 1800.00, pendingInstallments: 0, frequency: 'Mensual', paymentDay: '10', status: 'Completo', hasPending: false },
    { id: 20, loanNumber: 'LP-020', totalLoaned: 7500.00, interestRate: 5.5, totalPaid: 3750.00, totalToPay: 4162.50, createdAt: '20/07/2025', lastPayment: '12/11/2025', installment: 750.00, pendingInstallments: 5, frequency: 'Semanal', paymentDay: 'Viernes', status: 'Activo', hasPending: true }
  ];

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleOpenPaymentModal = (loan) => {
    setSelectedLoan(loan);
    setPaymentData({ bank: '', amount: loan.installment.toString() });
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedLoan(null);
    setPaymentData({ bank: '', amount: '' });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    console.log('Pagar préstamo:', selectedLoan, paymentData);
    alert(`Pago registrado: $${paymentData.amount} para préstamo ${selectedLoan.loanNumber}`);
    handleClosePaymentModal();
  };

  const handleOpenDeleteModal = (loan) => {
    setSelectedLoan(loan);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedLoan(null);
  };

  const handleConfirmDelete = () => {
    console.log('Eliminar préstamo:', selectedLoan);
    alert(`Préstamo ${selectedLoan.loanNumber} eliminado exitosamente`);
    handleCloseDeleteModal();
  };

  // Apply filters
  let filteredData = loansData;

  if (filters.onlyActive) {
    filteredData = filteredData.filter(loan => loan.status !== 'Inactivo');
  }

  if (filters.quickFilter) {
    const searchLower = filters.quickFilter.toLowerCase();
    filteredData = filteredData.filter(loan =>
      loan.loanNumber.toLowerCase().includes(searchLower) ||
      loan.status.toLowerCase().includes(searchLower) ||
      loan.frequency.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  if (sortConfig.key) {
    filteredData = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Calculate totals
  const totals = filteredData.reduce((acc, loan) => ({
    totalLoaned: acc.totalLoaned + loan.totalLoaned,
    totalPaid: acc.totalPaid + loan.totalPaid,
    totalToPay: acc.totalToPay + loan.totalToPay
  }), { totalLoaned: 0, totalPaid: 0, totalToPay: 0 });

  const getStatusBadge = (status) => {
    const colors = {
      'Activo': '#28a745',
      'Completo': '#007bff',
      'Inactivo': '#dc3545'
    };
    return (
      <span style={{
        backgroundColor: colors[status] || '#6c757d',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '3px',
        fontSize: '11px',
        fontWeight: 500
      }}>
        {status}
      </span>
    );
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="card">
        <div className="card-body">
          {/* Title */}
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c2c2c' }}>
            Lista de préstamos
          </h3>

          {/* Toggle Filters */}
          <div style={{ marginBottom: '15px', display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="onlyActive"
                checked={filters.onlyActive}
                onChange={handleFilterChange}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px' }}>Sólo préstamos activos</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="filterByZones"
                checked={filters.filterByZones}
                onChange={handleFilterChange}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px' }}>Filtrar por zonas</span>
            </label>
          </div>

          {/* Tab */}
          <div style={{ marginBottom: '15px', borderBottom: '2px solid #51cbce' }}>
            <button
              style={{
                backgroundColor: '#51cbce',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0',
                fontWeight: 500
              }}
            >
              Bancas
            </button>
          </div>

          {/* Search Filters */}
          <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Numero de banca"
                name="bettingPoolNumber"
                value={filters.bettingPoolNumber}
                onChange={handleFilterChange}
              />
              <button className="btn btn-outline-secondary" type="button">
                <i className="nc-icon nc-zoom-split"></i>
              </button>
            </div>
            <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrado rápido"
                name="quickFilter"
                value={filters.quickFilter}
                onChange={handleFilterChange}
              />
              <button className="btn btn-outline-secondary" type="button">
                <i className="nc-icon nc-zoom-split"></i>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-sm">
              <thead style={{ backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th onClick={() => handleSort('loanNumber')} style={{ cursor: 'pointer' }}>#</th>
                  <th onClick={() => handleSort('totalLoaned')} style={{ cursor: 'pointer' }}>Total prestado</th>
                  <th onClick={() => handleSort('interestRate')} style={{ cursor: 'pointer' }}>Tasa de interés</th>
                  <th onClick={() => handleSort('totalPaid')} style={{ cursor: 'pointer' }}>Total pagado</th>
                  <th onClick={() => handleSort('totalToPay')} style={{ cursor: 'pointer' }}>Total a pagar</th>
                  <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>Fecha de creación</th>
                  <th onClick={() => handleSort('lastPayment')} style={{ cursor: 'pointer' }}>Último pago</th>
                  <th onClick={() => handleSort('installment')} style={{ cursor: 'pointer' }}>Cuota</th>
                  <th onClick={() => handleSort('pendingInstallments')} style={{ cursor: 'pointer' }}>Cuotas pendientes</th>
                  <th onClick={() => handleSort('frequency')} style={{ cursor: 'pointer' }}>Frecuencia</th>
                  <th onClick={() => handleSort('paymentDay')} style={{ cursor: 'pointer' }}>Día de pago</th>
                  <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Estado</th>
                  <th>Pendientes de pago</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay entradas disponibles
                    </td>
                  </tr>
                ) : (
                  filteredData.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.loanNumber}</td>
                      <td>${loan.totalLoaned.toFixed(2)}</td>
                      <td>{loan.interestRate}%</td>
                      <td>${loan.totalPaid.toFixed(2)}</td>
                      <td>${loan.totalToPay.toFixed(2)}</td>
                      <td>{loan.createdAt}</td>
                      <td>{loan.lastPayment}</td>
                      <td>${loan.installment.toFixed(2)}</td>
                      <td>{loan.pendingInstallments}</td>
                      <td>{loan.frequency}</td>
                      <td>{loan.paymentDay}</td>
                      <td>{getStatusBadge(loan.status)}</td>
                      <td>{loan.hasPending ? 'Sí' : 'No'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-sm btn-link"
                          onClick={() => handleOpenPaymentModal(loan)}
                          title="Pagar préstamo"
                          style={{ color: '#007bff', padding: '2px 6px' }}
                        >
                          <i className="nc-icon nc-alert-circle-i"></i>
                        </button>
                        <Link
                          to={`/prestamos/editar/${loan.id}`}
                          className="btn btn-sm btn-link"
                          title="Editar"
                          style={{ color: '#51cbce', padding: '2px 6px', textDecoration: 'none' }}
                        >
                          <i className="nc-icon nc-ruler-pencil"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleOpenDeleteModal(loan)}
                          title="Eliminar"
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredData.length > 0 && (
                <tfoot style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  <tr>
                    <td>Total</td>
                    <td>${totals.totalLoaned.toFixed(2)}</td>
                    <td></td>
                    <td>${totals.totalPaid.toFixed(2)}</td>
                    <td>${totals.totalToPay.toFixed(2)}</td>
                    <td colSpan="9"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '16px', color: '#6c757d', fontSize: '14px' }}>
            Mostrando {filteredData.length} de {loansData.length} entradas
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleClosePaymentModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#51cbce', color: 'white' }}>
                <h5 className="modal-title">Pagar préstamo</h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleClosePaymentModal}></button>
              </div>
              <form onSubmit={handlePayment}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Banco</label>
                    <select
                      className="form-select"
                      value={paymentData.bank}
                      onChange={(e) => setPaymentData({ ...paymentData, bank: e.target.value })}
                      required
                    >
                      <option value="">Seleccione</option>
                      <option value="Banco Popular">Banco Popular</option>
                      <option value="BanReservas">BanReservas</option>
                      <option value="Banco BHD">Banco BHD</option>
                      <option value="Banco Promerica">Banco Promerica</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Monto cuota</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Monto"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn"
                    style={{ backgroundColor: '#51cbce', color: 'white' }}
                  >
                    PAGAR
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLoan && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCloseDeleteModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-body text-center" style={{ padding: '30px' }}>
                <div style={{ fontSize: '48px', color: '#f0ad4e', marginBottom: '20px' }}>
                  <i className="nc-icon nc-simple-remove"></i>
                </div>
                <h5 style={{ marginBottom: '20px', fontSize: '18px', color: '#333' }}>
                  ¿Está seguro que desea eliminar este préstamo?
                </h5>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleConfirmDelete}
                    style={{ minWidth: '100px' }}
                  >
                    Eliminar
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCloseDeleteModal}
                    style={{ minWidth: '100px' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansList;
