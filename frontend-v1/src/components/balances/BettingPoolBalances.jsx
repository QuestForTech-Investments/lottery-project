import React, { useState, useMemo, useCallback } from 'react';
import '../../assets/css/balances.css';

// Mock data
const MOCK_DATA = [
  { id: 1, numero: 1, nombre: 'LA CENTRAL 01', usuarios: '001', referencia: 'GILBERTO ISLA GORDA TL', zona: 'GRUPO GILBERTO TL', balance: 112.66, prestamos: 0.00 },
  { id: 2, numero: 10, nombre: 'LA CENTRAL 10', usuarios: '010', referencia: 'GILBERTO TL', zona: 'GRUPO GILBERTO TL', balance: 447.61, prestamos: 0.00 },
  { id: 3, numero: 16, nombre: 'LA CENTRAL 16', usuarios: '016', referencia: 'CHINO TL', zona: 'GRUPO KENDRICK TL', balance: 1476.36, prestamos: 0.00 },
  { id: 4, numero: 63, nombre: 'LA CENTRAL 63', usuarios: '063', referencia: 'NELL TL', zona: 'GRUPO KENDRICK TL', balance: 744.92, prestamos: 0.00 },
  { id: 5, numero: 101, nombre: 'LA CENTRAL 101', usuarios: '101', referencia: 'FELO TL', zona: 'GRUPO KENDRICK TL', balance: 1052.00, prestamos: 0.00 },
  { id: 6, numero: 119, nombre: 'LA CENTRAL 119', usuarios: '119', referencia: 'EUDDY (GF)', zona: 'GRUPO GUYANA (DANI)', balance: 0.00, prestamos: 0.00 },
  { id: 7, numero: 135, nombre: 'LA CENTRAL 135', usuarios: '135', referencia: 'MORENA D (GF)', zona: 'GRUPO GUYANA (DANI)', balance: 498.40, prestamos: 0.00 },
  { id: 8, numero: 150, nombre: 'LA CENTRAL 150', usuarios: '150', referencia: 'DANNY (GF)', zona: 'GRUPO GUYANA (DANI)', balance: 141.23, prestamos: 0.00 },
  { id: 9, numero: 186, nombre: 'CARIBBEAN 186', usuarios: '186', referencia: 'BOB BALATA GF)', zona: 'GRUPO GUYANA (OMAR)', balance: -595.06, prestamos: 100.00 },
  { id: 10, numero: 198, nombre: 'CARIBBEAN 198', usuarios: '198', referencia: 'LISSET (GF)', zona: 'GRUPO GUYANA (OMAR)', balance: 700.86, prestamos: 0.00 },
];

const MOCK_ZONES = [
  { id: 1, name: 'GRUPO GILBERTO TL' },
  { id: 2, name: 'GRUPO KENDRICK TL' },
  { id: 3, name: 'GRUPO GUYANA (DANI)' },
  { id: 4, name: 'GRUPO GUYANA (OMAR)' },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const BettingPoolBalances = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedZones, setSelectedZones] = useState(MOCK_ZONES.map(z => z.id));
  const [balanceType, setBalanceType] = useState('all');
  const [quickFilter, setQuickFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [data] = useState(MOCK_DATA);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleZoneToggle = useCallback((zoneId) => {
    setSelectedZones(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing...', { selectedDate, selectedZones, balanceType });
  }, [selectedDate, selectedZones, balanceType]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handlePdf = useCallback(() => {
    console.log('Exporting PDF...');
  }, []);

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by zones
    if (selectedZones.length > 0 && selectedZones.length < MOCK_ZONES.length) {
      const zoneNames = MOCK_ZONES.filter(z => selectedZones.includes(z.id)).map(z => z.name);
      result = result.filter(item => zoneNames.includes(item.zona));
    }

    // Filter by balance type
    if (balanceType === 'positive') {
      result = result.filter(item => item.balance > 0);
    } else if (balanceType === 'negative') {
      result = result.filter(item => item.balance < 0);
    }

    // Quick filter
    if (quickFilter) {
      const search = quickFilter.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(search)
        )
      );
    }

    // Sorting
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return sortConfig.direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [data, selectedZones, balanceType, quickFilter, sortConfig]);

  const totals = useMemo(() => ({
    balance: filteredData.reduce((sum, item) => sum + item.balance, 0),
    prestamos: filteredData.reduce((sum, item) => sum + item.prestamos, 0),
  }), [filteredData]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <i className="fas fa-sort"></i>;
    return sortConfig.direction === 'asc'
      ? <i className="fas fa-sort-up"></i>
      : <i className="fas fa-sort-down"></i>;
  };

  return (
    <div className="container-fluid balances-container">
      <div className="row">
        <div className="col-12">
          <div className="card balances-card">
            <div className="card-body">
              <h4 className="card-title text-center mb-4">Balances de bancas</h4>

              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Zonas</label>
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-secondary dropdown-toggle w-100"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      {selectedZones.length} seleccionadas
                    </button>
                    <ul className="dropdown-menu w-100">
                      {MOCK_ZONES.map(zone => (
                        <li key={zone.id}>
                          <label className="dropdown-item">
                            <input
                              type="checkbox"
                              checked={selectedZones.includes(zone.id)}
                              onChange={() => handleZoneToggle(zone.id)}
                              className="form-check-input me-2"
                            />
                            {zone.name}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Balance Type */}
              <div className="mb-4">
                <label className="form-label">Balances a incluir</label>
                <div className="btn-group">
                  <button
                    className={`btn ${balanceType === 'all' ? 'btn-balance-active' : 'btn-outline-secondary'}`}
                    onClick={() => setBalanceType('all')}
                  >
                    TODOS
                  </button>
                  <button
                    className={`btn ${balanceType === 'positive' ? 'btn-balance-active' : 'btn-outline-secondary'}`}
                    onClick={() => setBalanceType('positive')}
                  >
                    POSITIVOS
                  </button>
                  <button
                    className={`btn ${balanceType === 'negative' ? 'btn-balance-active' : 'btn-outline-secondary'}`}
                    onClick={() => setBalanceType('negative')}
                  >
                    NEGATIVOS
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-3">
                <button className="btn btn-action me-2" onClick={handleRefresh}>
                  <i className="fas fa-sync-alt me-1"></i> REFRESCAR
                </button>
                <button className="btn btn-action me-2" onClick={handlePrint}>
                  <i className="fas fa-print me-1"></i> IMPRIMIR
                </button>
                <button className="btn btn-action" onClick={handlePdf}>
                  <i className="fas fa-file-pdf me-1"></i> PDF
                </button>
              </div>

              {/* Quick Filter */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filtro rápido"
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-striped table-balances">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('numero')} className="sortable">
                        Número {getSortIcon('numero')}
                      </th>
                      <th onClick={() => handleSort('nombre')} className="sortable">
                        Nombre {getSortIcon('nombre')}
                      </th>
                      <th onClick={() => handleSort('usuarios')} className="sortable">
                        Usuarios {getSortIcon('usuarios')}
                      </th>
                      <th onClick={() => handleSort('referencia')} className="sortable">
                        Referencia {getSortIcon('referencia')}
                      </th>
                      <th onClick={() => handleSort('zona')} className="sortable">
                        Zona {getSortIcon('zona')}
                      </th>
                      <th onClick={() => handleSort('balance')} className="sortable text-end">
                        Balance {getSortIcon('balance')}
                      </th>
                      <th onClick={() => handleSort('prestamos')} className="sortable text-end">
                        Préstamos {getSortIcon('prestamos')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          No hay entradas disponibles
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => (
                        <tr key={item.id}>
                          <td>{item.numero}</td>
                          <td>{item.nombre}</td>
                          <td>{item.usuarios}</td>
                          <td>{item.referencia}</td>
                          <td>{item.zona}</td>
                          <td className={`text-end ${item.balance < 0 ? 'balance-negative' : item.balance > 0 ? 'balance-positive' : ''}`}>
                            {formatCurrency(item.balance)}
                          </td>
                          <td className="text-end">{formatCurrency(item.prestamos)}</td>
                        </tr>
                      ))
                    )}
                    {filteredData.length > 0 && (
                      <tr className="table-info fw-bold">
                        <td>Totales</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td className="text-end">{formatCurrency(totals.balance)}</td>
                        <td className="text-end">{formatCurrency(totals.prestamos)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-muted">
                Mostrando {filteredData.length} entradas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingPoolBalances;
