import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * CollectionsPaymentsList
 * Lista de cobros y pagos registrados en el sistema
 * Based on Vue.js app analysis - Collections/Payments list page
 */
const CollectionsPaymentsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all', // 'all', 'collection', 'payment'
    bettingPoolCode: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Verify exact endpoint from original app
      // For now, using mock data until API endpoint is confirmed

      // Mock data for demonstration
      const mockData = [
        {
          id: 1,
          type: 'collection',
          bettingPoolCode: 'LAN-0001',
          bettingPoolName: 'Banca Central',
          bankName: 'Banco Popular',
          amount: 5000.00,
          createdAt: '2025-11-18T10:30:00',
          createdBy: 'admin'
        },
        {
          id: 2,
          type: 'payment',
          bettingPoolCode: 'LAN-0010',
          bettingPoolName: 'Banca Norte',
          bankName: 'Banco BHD',
          amount: 3000.00,
          createdAt: '2025-11-18T11:15:00',
          createdBy: 'admin'
        },
        {
          id: 3,
          type: 'collection',
          bettingPoolCode: 'LAN-0016',
          bettingPoolName: 'Banca Sur',
          bankName: 'Banco Popular',
          amount: 7500.00,
          createdAt: '2025-11-18T12:00:00',
          createdBy: 'admin'
        }
      ];

      setTransactions(mockData);
    } catch (err) {
      console.error('Error loading collections/payments:', err);
      setError('Error al cargar los cobros y pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredTransactions = transactions.filter(t => {
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.bettingPoolCode && !t.bettingPoolCode.includes(filters.bettingPoolCode)) return false;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((sum, t) => {
      return sum + (t.type === 'collection' ? t.amount : -t.amount);
    }, 0);
  };

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">Cobros & Pagos - Lista</h4>
        </div>
        <div className="card-body">
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '12px', color: '#888' }}>
                Fecha inicio
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '12px', color: '#888' }}>
                Fecha fin
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '12px', color: '#888' }}>
                Tipo
              </label>
              <select
                className="form-select form-select-sm"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="collection">Cobros</option>
                <option value="payment">Pagos</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '12px', color: '#888' }}>
                Código de banca
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Filtrar por código..."
                value={filters.bettingPoolCode}
                onChange={(e) => handleFilterChange('bettingPoolCode', e.target.value)}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-12">
              <button
                className="btn btn-sm me-2"
                style={{
                  backgroundColor: '#51cbce',
                  borderColor: '#51cbce',
                  color: 'white'
                }}
                onClick={loadTransactions}
              >
                <i className="nc-icon nc-refresh-69"></i> Refrescar
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <>
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th style={{ fontSize: '12px' }}>Tipo</th>
                      <th style={{ fontSize: '12px' }}>Fecha</th>
                      <th style={{ fontSize: '12px' }}>Código Banca</th>
                      <th style={{ fontSize: '12px' }}>Nombre Banca</th>
                      <th style={{ fontSize: '12px' }}>Banco</th>
                      <th style={{ fontSize: '12px', textAlign: 'right' }}>Monto</th>
                      <th style={{ fontSize: '12px' }}>Creado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4" style={{ fontSize: '14px', color: '#888' }}>
                          No se encontraron transacciones
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td style={{ fontSize: '12px' }}>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: transaction.type === 'collection' ? '#28a745' : '#dc3545',
                                color: 'white',
                                fontSize: '10px'
                              }}
                            >
                              {transaction.type === 'collection' ? 'COBRO' : 'PAGO'}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px' }}>{formatDate(transaction.createdAt)}</td>
                          <td style={{ fontSize: '12px' }}>{transaction.bettingPoolCode}</td>
                          <td style={{ fontSize: '12px' }}>{transaction.bettingPoolName}</td>
                          <td style={{ fontSize: '12px' }}>{transaction.bankName || '-'}</td>
                          <td
                            style={{
                              fontSize: '12px',
                              textAlign: 'right',
                              fontWeight: 'bold',
                              color: transaction.type === 'collection' ? '#28a745' : '#dc3545'
                            }}
                          >
                            {transaction.type === 'collection' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td style={{ fontSize: '12px' }}>{transaction.createdBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredTransactions.length > 0 && (
                    <tfoot>
                      <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                        <td colSpan="5" style={{ fontSize: '12px', textAlign: 'right' }}>
                          TOTAL:
                        </td>
                        <td
                          style={{
                            fontSize: '14px',
                            textAlign: 'right',
                            color: getTotalAmount() >= 0 ? '#28a745' : '#dc3545'
                          }}
                        >
                          {formatCurrency(getTotalAmount())}
                        </td>
                        <td></td>
                      </tr>
                      <tr style={{ fontSize: '11px', color: '#888' }}>
                        <td colSpan="7" style={{ textAlign: 'right' }}>
                          {filteredTransactions.length} transaccion(es)
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionsPaymentsList;
