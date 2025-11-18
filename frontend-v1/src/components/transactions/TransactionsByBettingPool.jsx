import { useState } from 'react';

/**
 * TransactionsByBettingPool
 * Route: /accountable-transactions/betting-pool
 * Original: https://la-numbers.apk.lol/#/accountable-transactions/betting-pool
 *
 * Simple view with date filters and betting pool selector.
 * After clicking "VER VENTAS", displays transactions/sales for selected pool.
 */
const TransactionsByBettingPool = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBettingPool, setSelectedBettingPool] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  // Mock betting pools for development
  const bettingPools = [
    { id: 1, codigo: 'BC001', nombre: 'LA CENTRAL 01' },
    { id: 2, codigo: 'BC002', nombre: 'LA CENTRAL 10' },
    { id: 3, codigo: 'BC003', nombre: 'LA CENTRAL 16' },
    { id: 4, codigo: 'BC004', nombre: 'CARIBBEAN 186' },
    { id: 5, codigo: 'BC005', nombre: 'CARIBBEAN 198' }
  ];

  const handleViewSales = () => {
    if (!selectedBettingPool) {
      alert('Por favor seleccione una banca');
      return;
    }

    if (!startDate || !endDate) {
      alert('Por favor seleccione las fechas');
      return;
    }

    // Mock results - in real app, this would be an API call
    const pool = bettingPools.find(p => p.id === parseInt(selectedBettingPool));
    setResults({
      bettingPool: pool,
      transactions: [
        {
          id: 1,
          fecha: startDate,
          hora: '09:30:00',
          tipo: 'Venta',
          monto: 500.00,
          descripcion: 'Venta de tickets - ANGUILA 10AM'
        },
        {
          id: 2,
          fecha: startDate,
          hora: '14:15:00',
          tipo: 'Venta',
          monto: 750.00,
          descripcion: 'Venta de tickets - NEW YORK DAY'
        },
        {
          id: 3,
          fecha: startDate,
          hora: '18:45:00',
          tipo: 'Cobro',
          monto: 1200.00,
          descripcion: 'Cobro balance negativo'
        }
      ],
      totales: {
        ventas: 1250.00,
        cobros: 1200.00,
        balance: 50.00
      }
    });
    setShowResults(true);
  };

  return (
    <div className="container-fluid p-4">
      {/* Filters Card */}
      <div className="card">
        <div className="card-body" style={{ padding: '40px' }}>
          <div className="row g-4">
            {/* Fecha inicial */}
            <div className="col-md-4">
              <label
                className="form-label"
                style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'block' }}
              >
                Fecha inicial
              </label>
              <div className="input-group">
                <span
                  className="input-group-text bg-white"
                  style={{ border: '1px solid #ddd', borderRight: 'none' }}
                >
                  <i className="fa fa-calendar" style={{ color: '#999' }}></i>
                </span>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    padding: '8px 12px'
                  }}
                />
              </div>
            </div>

            {/* Fecha final */}
            <div className="col-md-4">
              <label
                className="form-label"
                style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'block' }}
              >
                Fecha final
              </label>
              <div className="input-group">
                <span
                  className="input-group-text bg-white"
                  style={{ border: '1px solid #ddd', borderRight: 'none' }}
                >
                  <i className="fa fa-calendar" style={{ color: '#999' }}></i>
                </span>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    padding: '8px 12px'
                  }}
                />
              </div>
            </div>

            {/* Banca */}
            <div className="col-md-4">
              <label
                className="form-label"
                style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'block' }}
              >
                Banca
              </label>
              <select
                className="form-select"
                value={selectedBettingPool}
                onChange={(e) => setSelectedBettingPool(e.target.value)}
                style={{
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  padding: '8px 12px'
                }}
              >
                <option value="">Seleccione una banca</option>
                {bettingPools.map(pool => (
                  <option key={pool.id} value={pool.id}>
                    {pool.codigo} - {pool.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* VER VENTAS Button */}
          <div className="text-center mt-4">
            <button
              className="btn"
              onClick={handleViewSales}
              style={{
                backgroundColor: '#51cbce',
                borderColor: '#51cbce',
                color: 'white',
                fontWeight: 500,
                textTransform: 'uppercase',
                fontSize: '14px',
                padding: '12px 48px',
                minWidth: '200px',
                borderRadius: '4px'
              }}
            >
              Ver Ventas
            </button>
          </div>
        </div>
      </div>

      {/* Results Table (shown after clicking VER VENTAS) */}
      {showResults && results && (
        <div className="card mt-4">
          <div className="card-body">
            {/* Header with betting pool info */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>
                Transacciones - {results.bettingPool.nombre}
              </h5>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {startDate} al {endDate}
              </span>
            </div>

            {/* Transactions Table */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover" style={{ fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#f5f5f5' }}>
                  <tr>
                    <th style={{ fontSize: '13px', fontWeight: 600 }}>Fecha</th>
                    <th style={{ fontSize: '13px', fontWeight: 600 }}>Hora</th>
                    <th style={{ fontSize: '13px', fontWeight: 600 }}>Tipo</th>
                    <th style={{ fontSize: '13px', fontWeight: 600 }}>Descripción</th>
                    <th style={{ fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {results.transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{transaction.fecha}</td>
                      <td>{transaction.hora}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: transaction.tipo === 'Venta' ? '#28a745' : '#51cbce',
                            color: 'white',
                            fontSize: '11px',
                            padding: '4px 8px'
                          }}
                        >
                          {transaction.tipo}
                        </span>
                      </td>
                      <td>{transaction.descripcion}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        ${transaction.monto.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ backgroundColor: '#f9f9f9', fontWeight: 600 }}>
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'right', fontSize: '13px' }}>
                      Totales:
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '13px' }}>
                      ${results.totales.balance.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary Cards */}
            <div className="row mt-3">
              <div className="col-md-4">
                <div className="card" style={{ backgroundColor: '#e8f5e9', border: 'none' }}>
                  <div className="card-body text-center">
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      Total Ventas
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#28a745' }}>
                      ${results.totales.ventas.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card" style={{ backgroundColor: '#e1f5fe', border: 'none' }}>
                  <div className="card-body text-center">
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      Total Cobros
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#51cbce' }}>
                      ${results.totales.cobros.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card" style={{ backgroundColor: '#fff3e0', border: 'none' }}>
                  <div className="card-body text-center">
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      Balance
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#ff9800' }}>
                      ${results.totales.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsByBettingPool;
