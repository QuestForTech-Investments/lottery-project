import { useState, useEffect } from 'react';
import api from '../../services/api';

/**
 * CollectionsPaymentsWidget
 * Widget for creating collections (cobros) and payments (pagos) from dashboard
 * Based on Vue.js app analysis - Dashboard widget implementation
 * Replicated to match exact styling from original app
 */
const CollectionsPaymentsWidget = () => {
  // State
  const [type, setType] = useState('collection'); // 'collection' | 'payment'
  const [bettingPoolCode, setBettingPoolCode] = useState('');
  const [bankId, setBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [bettingPools, setBettingPools] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load betting pools on mount
  useEffect(() => {
    loadBettingPools();
    loadBanks();
  }, []);

  const loadBettingPools = async () => {
    try {
      const response = await api.get('/betting-pools', {
        params: { pageSize: 1000 }
      });

      const pools = response.items || response || [];
      setBettingPools(pools);
    } catch (err) {
      console.error('Error loading betting pools:', err);
      setError('Error al cargar las bancas');
    }
  };

  const loadBanks = async () => {
    try {
      const response = await api.get('/banks');
      const banksList = response.items || response || [];
      setBanks(banksList);
    } catch (err) {
      console.error('Error loading banks:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!bettingPoolCode || !amount) {
      setError('Por favor complete los campos requeridos');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = type === 'collection' ? '/collections' : '/payments';

      await api.post(endpoint, {
        bettingPoolCode,
        bankId: bankId || null,
        amount: parseFloat(amount)
      });

      setSuccess(`${type === 'collection' ? 'Cobro' : 'Pago'} creado exitosamente`);

      // Reset form
      setBettingPoolCode('');
      setBankId('');
      setAmount('');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err.response?.data?.message || 'Error al crear la transacción');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="card">
      <div className="card-body">
        {/* Title - matching original style */}
        <div
          className="text-center mb-3"
          style={{
            fontSize: '14px',
            color: '#999',
            fontWeight: '400'
          }}
        >
          Cobros & pagos
        </div>

        {/* Type selector - matching original style */}
        <div className="d-flex gap-0 mb-3">
          <button
            type="button"
            className="btn flex-fill"
            onClick={() => handleTypeChange('collection')}
            style={{
              backgroundColor: type === 'collection' ? '#51cbce' : '#fff',
              borderColor: type === 'collection' ? '#51cbce' : '#ddd',
              color: type === 'collection' ? '#fff' : '#999',
              border: '1px solid',
              borderRadius: '4px 0 0 4px',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            <i className="fa fa-hand-holding-usd me-1"></i> COBRO
          </button>
          <button
            type="button"
            className="btn flex-fill"
            onClick={() => handleTypeChange('payment')}
            style={{
              backgroundColor: type === 'payment' ? '#51cbce' : '#fff',
              borderColor: type === 'payment' ? '#51cbce' : '#ddd',
              color: type === 'payment' ? '#fff' : '#999',
              border: '1px solid',
              borderRadius: '0 4px 4px 0',
              borderLeft: 'none',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            <i className="fa fa-question-circle me-1"></i> PAGO
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Código de banca - Horizontal layout */}
          <div className="row mb-2 align-items-center">
            <div className="col-auto" style={{ width: '110px' }}>
              <label
                className="form-label mb-0"
                style={{
                  fontSize: '12px',
                  color: '#888'
                }}
              >
                Código de banca
              </label>
            </div>
            <div className="col">
              <select
                className="form-select form-select-sm"
                value={bettingPoolCode}
                onChange={(e) => setBettingPoolCode(e.target.value)}
                required
                style={{
                  fontSize: '13px',
                  color: '#666',
                  borderColor: '#ddd'
                }}
              >
                <option value="">Seleccione</option>
                {bettingPools.map((pool) => (
                  <option key={pool.bettingPoolId || pool.id} value={pool.bettingPoolCode || pool.code}>
                    {pool.bettingPoolCode || pool.code} - {pool.bettingPoolName || pool.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Banco - Horizontal layout */}
          <div className="row mb-2 align-items-center">
            <div className="col-auto" style={{ width: '110px' }}>
              <label
                className="form-label mb-0"
                style={{
                  fontSize: '12px',
                  color: '#888'
                }}
              >
                Banco
              </label>
            </div>
            <div className="col">
              <select
                className="form-select form-select-sm"
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                style={{
                  fontSize: '13px',
                  color: '#666',
                  borderColor: '#ddd'
                }}
              >
                <option value="">Seleccione</option>
                {banks.map((bank) => (
                  <option key={bank.bankId || bank.id} value={bank.bankId || bank.id}>
                    {bank.bankName || bank.name}
                  </option>
                ))}
              </select>
              {banks.length === 0 && (
                <div>
                  <small className="text-muted">No hay bancos disponibles</small>
                </div>
              )}
            </div>
          </div>

          {/* Monto - Horizontal layout */}
          <div className="row mb-3 align-items-center">
            <div className="col-auto" style={{ width: '110px' }}>
              <label
                className="form-label mb-0"
                style={{
                  fontSize: '12px',
                  color: '#888'
                }}
              >
                Monto
              </label>
            </div>
            <div className="col">
              <input
                type="number"
                className="form-control form-control-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                style={{
                  fontSize: '13px',
                  color: '#666',
                  borderColor: '#ddd'
                }}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-danger alert-sm py-2 mb-3" role="alert" style={{ fontSize: '12px' }}>
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="alert alert-success alert-sm py-2 mb-3" role="alert" style={{ fontSize: '12px' }}>
              {success}
            </div>
          )}

          {/* Submit button - matching original pill shape */}
          <div className="text-center">
            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{
                backgroundColor: '#51cbce',
                borderColor: '#51cbce',
                color: 'white',
                padding: '10px 40px',
                borderRadius: '25px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'uppercase',
                minWidth: '150px'
              }}
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionsPaymentsWidget;
