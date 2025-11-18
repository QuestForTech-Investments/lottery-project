import { useState } from 'react';

/**
 * CreateTransactionModal - Modal for creating collections/payments transactions
 * Replica of Vue.js modal: https://la-numbers.apk.lol/#/simplified-accountable-transaction-groups
 * Bootstrap modal implementation
 */
const CreateTransactionModal = ({ show, onClose }) => {
  const [type, setType] = useState('');
  const [bettingPoolName, setBettingPoolName] = useState('');
  const [bettingPoolCode, setBettingPoolCode] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceInitialBalance, setSourceInitialBalance] = useState('0.00');
  const [sourceFinalBalance, setSourceFinalBalance] = useState('0.00');
  const [destInitialBalance, setDestInitialBalance] = useState('0.00');
  const [destFinalBalance, setDestFinalBalance] = useState('0.00');
  const [transactionNotes, setTransactionNotes] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [transactions, setTransactions] = useState([]);

  const handleSubmit = () => {
    console.log('Registering transaction...');
    // TODO: API call to create transaction
    onClose();
  };

  const calculateTotals = () => {
    return {
      debit: transactions.reduce((sum, t) => sum + (parseFloat(t.debit) || 0), 0),
      credit: transactions.reduce((sum, t) => sum + (parseFloat(t.credit) || 0), 0)
    };
  };

  const totals = calculateTotals();

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}
        tabIndex="-1"
      >
        <div className="modal-dialog" style={{ maxWidth: '800px', margin: '1.75rem auto' }}>
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
              <h5 className="modal-title" style={{ fontSize: '18px', fontWeight: 500 }}>
                Crear Transacciones
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body" style={{ padding: '20px' }}>
              {/* Two columns layout */}
              <div className="row">
                {/* Left Column */}
                <div className="col-md-6">
                  {/* Type */}
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Tipo
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      style={{ fontSize: '13px' }}
                    >
                      <option value="">Selecione uno...</option>
                      <option value="cobro">Cobro</option>
                      <option value="pago">Pago</option>
                    </select>
                  </div>

                  {/* Banca section */}
                  <h6 style={{ fontSize: '14px', fontWeight: 600, marginTop: '20px', marginBottom: '15px' }}>
                    BANCA
                  </h6>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '13px' }}>
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={bettingPoolName}
                      onChange={(e) => setBettingPoolName(e.target.value)}
                      style={{ fontSize: '13px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '13px' }}>
                      Código
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={bettingPoolCode}
                      onChange={(e) => setBettingPoolCode(e.target.value)}
                      style={{ fontSize: '13px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '13px' }}>
                      Monto
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-md-6">
                  {/* Entidad fuente */}
                  <h6 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: '#999', textTransform: 'uppercase' }}>
                    Entidad fuente
                  </h6>
                  <div className="row mb-2">
                    <div className="col-6">
                      <label className="form-label" style={{ fontSize: '12px', color: '#666' }}>
                        Balance inicial
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={sourceInitialBalance}
                        disabled
                        style={{ fontSize: '13px', backgroundColor: '#f5f5f5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label" style={{ fontSize: '12px', color: '#666' }}>
                        Balance final
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={sourceFinalBalance}
                        disabled
                        style={{ fontSize: '13px', backgroundColor: '#f5f5f5' }}
                      />
                    </div>
                  </div>

                  <hr style={{ margin: '15px 0' }} />

                  {/* Entidad destino */}
                  <h6 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: '#999', textTransform: 'uppercase' }}>
                    Entidad destino
                  </h6>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label" style={{ fontSize: '12px', color: '#666' }}>
                        Balance inicial
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={destInitialBalance}
                        disabled
                        style={{ fontSize: '13px', backgroundColor: '#f5f5f5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label" style={{ fontSize: '12px', color: '#666' }}>
                        Balance final
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={destFinalBalance}
                        disabled
                        style={{ fontSize: '13px', backgroundColor: '#f5f5f5' }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '13px' }}>
                      Notas de la transacción
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      value={transactionNotes}
                      onChange={(e) => setTransactionNotes(e.target.value)}
                      style={{ fontSize: '13px' }}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Transaction table */}
              <div className="table-responsive mt-4">
                <table className="table table-bordered table-sm" style={{ fontSize: '13px' }}>
                  <thead style={{ backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th style={{ fontWeight: 600 }}>Tipo</th>
                      <th style={{ fontWeight: 600 }}>Entidad</th>
                      <th style={{ fontWeight: 600 }}>Débito</th>
                      <th style={{ fontWeight: 600 }}>Crédito</th>
                      <th style={{ fontWeight: 600 }}>Balance inicial</th>
                      <th style={{ fontWeight: 600 }}>Balance final</th>
                      <th style={{ fontWeight: 600 }}>Notas</th>
                      <th style={{ fontWeight: 600, textAlign: 'center' }}>
                        <i className="fa fa-cog"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                          <div
                            className="alert alert-info mb-0"
                            style={{ backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', color: '#0c5460' }}
                          >
                            No hay información disponible
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td>{transaction.type}</td>
                          <td>{transaction.entity}</td>
                          <td>${parseFloat(transaction.debit || 0).toFixed(2)}</td>
                          <td>${parseFloat(transaction.credit || 0).toFixed(2)}</td>
                          <td>${parseFloat(transaction.initialBalance || 0).toFixed(2)}</td>
                          <td>${parseFloat(transaction.finalBalance || 0).toFixed(2)}</td>
                          <td>{transaction.notes}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button className="btn btn-sm btn-light">
                              <i className="fa fa-ellipsis-v"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                    {/* Totals row */}
                    <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 600 }}>
                      <td>Totales</td>
                      <td></td>
                      <td>${totals.debit.toFixed(2)}</td>
                      <td>${totals.credit.toFixed(2)}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* General notes */}
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Notas
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows="3"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  style={{ fontSize: '13px' }}
                ></textarea>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '15px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ fontSize: '13px', padding: '8px 20px', textTransform: 'uppercase' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleSubmit}
                style={{
                  backgroundColor: '#51cbce',
                  borderColor: '#51cbce',
                  color: 'white',
                  fontSize: '13px',
                  padding: '8px 20px',
                  textTransform: 'uppercase'
                }}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTransactionModal;
