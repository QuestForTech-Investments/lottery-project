import { useState, useEffect } from 'react';
import api from '../../services/api';

/**
 * CollectionsPaymentsWidget
 * Widget for creating collections (cobros) and payments (pagos) from dashboard
 * Based on Vue.js app analysis - Dashboard widget implementation
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
      // TODO: Verify exact endpoint from original app
      const response = await api.get('/banks');
      const banksList = response.items || response || [];
      setBanks(banksList);
    } catch (err) {
      console.error('Error loading banks:', err);
      // Don't show error if banks endpoint doesn't exist yet
      // setError('Error al cargar los bancos');
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
      // TODO: Verify exact endpoint from original app
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
        <h6 className="card-title mb-3">Cobros & pagos</h6>

        {/* Type selector - Radio style buttons */}
        <div className="btn-group w-100 mb-3" role="group">
          <button
            type="button"
            className={`btn ${type === 'collection' ? 'btn-info' : 'btn-outline-secondary'}`}
            onClick={() => handleTypeChange('collection')}
            style={{
              backgroundColor: type === 'collection' ? '#51cbce' : 'transparent',
              borderColor: '#51cbce',
              color: type === 'collection' ? 'white' : '#51cbce'
            }}
          >
            💰 COBRO
          </button>
          <button
            type="button"
            className={`btn ${type === 'payment' ? 'btn-info' : 'btn-outline-secondary'}`}
            onClick={() => handleTypeChange('payment')}
            style={{
              backgroundColor: type === 'payment' ? '#51cbce' : 'transparent',
              borderColor: '#51cbce',
              color: type === 'payment' ? 'white' : '#51cbce'
            }}
          >
            💸 PAGO
          </button>
        </div>

        <hr />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Código de banca */}
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '12px', color: '#888' }}>
              Código de banca
            </label>
            <select
              className="form-select form-select-sm"
              value={bettingPoolCode}
              onChange={(e) => setBettingPoolCode(e.target.value)}
              required
            >
              <option value="">Seleccione</option>
              {bettingPools.map((pool) => (
                <option key={pool.bettingPoolId || pool.id} value={pool.bettingPoolCode || pool.code}>
                  {pool.bettingPoolCode || pool.code} - {pool.bettingPoolName || pool.name}
                </option>
              ))}
            </select>
          </div>

          {/* Banco */}
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '12px', color: '#888' }}>
              Banco
            </label>
            <select
              className="form-select form-select-sm"
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
            >
              <option value="">Seleccione</option>
              {banks.map((bank) => (
                <option key={bank.bankId || bank.id} value={bank.bankId || bank.id}>
                  {bank.bankName || bank.name}
                </option>
              ))}
            </select>
            {banks.length === 0 && (
              <small className="text-muted">No hay bancos disponibles</small>
            )}
          </div>

          {/* Monto */}
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '12px', color: '#888' }}>
              Monto
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-danger alert-sm py-2" role="alert">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="alert alert-success alert-sm py-2" role="alert">
              {success}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-sm w-100"
            disabled={loading}
            style={{
              backgroundColor: '#51cbce',
              borderColor: '#51cbce',
              color: 'white'
            }}
          >
            {loading ? 'Creando...' : 'Crear'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CollectionsPaymentsWidget;
