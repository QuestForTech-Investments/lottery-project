import React, { useState, useMemo, useCallback } from 'react';
import '../../assets/css/balances.css';

// Mock data
const MOCK_DATA = [
  { id: 1, nombre: 'BANCO POPULAR', codigo: 'BP001', zona: 'ZONA NORTE', balance: 15250.50 },
  { id: 2, nombre: 'BANCO BHD LEON', codigo: 'BHD002', zona: 'ZONA NORTE', balance: 8730.25 },
  { id: 3, nombre: 'BANCO RESERVAS', codigo: 'BR003', zona: 'ZONA SUR', balance: -2450.00 },
  { id: 4, nombre: 'BANCO SANTA CRUZ', codigo: 'BSC004', zona: 'ZONA SUR', balance: 12100.75 },
  { id: 5, nombre: 'BANCO CARIBE', codigo: 'BC005', zona: 'ZONA ESTE', balance: 5680.30 },
  { id: 6, nombre: 'BANCO PROMERICA', codigo: 'BPR006', zona: 'ZONA ESTE', balance: -890.45 },
  { id: 7, nombre: 'BANCO LOPEZ DE HARO', codigo: 'BLH007', zona: 'ZONA OESTE', balance: 22340.80 },
  { id: 8, nombre: 'BANCO VIMENCA', codigo: 'BV008', zona: 'ZONA OESTE', balance: 0.00 },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const BankBalances = () => {
  const [quickFilter, setQuickFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [data] = useState(MOCK_DATA);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const filteredData = useMemo(() => {
    let result = data;

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
  }, [data, quickFilter, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / pageSize) || 1;
  }, [filteredData.length, pageSize]);

  const totals = useMemo(() => ({
    balance: filteredData.reduce((sum, item) => sum + item.balance, 0),
  }), [filteredData]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <i className="fas fa-sort"></i>;
    return sortConfig.direction === 'asc'
      ? <i className="fas fa-sort-up"></i>
      : <i className="fas fa-sort-down"></i>;
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  return (
    <div className="container-fluid balances-container">
      <div className="row">
        <div className="col-12">
          <div className="card balances-card">
            <div className="card-body">
              <h4 className="card-title text-center mb-4">Balances de bancos</h4>

              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label">Entradas por página</label>
                  <select
                    className="form-select"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="1000">Todos</option>
                  </select>
                </div>
                <div className="col-md-4 offset-md-4">
                  <label className="form-label">Filtrado rápido</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filtrado rápido"
                    value={quickFilter}
                    onChange={(e) => {
                      setQuickFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-striped table-balances">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('nombre')} className="sortable">
                        Nombre {getSortIcon('nombre')}
                      </th>
                      <th onClick={() => handleSort('codigo')} className="sortable">
                        Código {getSortIcon('codigo')}
                      </th>
                      <th onClick={() => handleSort('zona')} className="sortable">
                        Zona {getSortIcon('zona')}
                      </th>
                      <th onClick={() => handleSort('balance')} className="sortable text-end">
                        Balance {getSortIcon('balance')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No hay entradas disponibles
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => (
                        <tr key={item.id}>
                          <td>{item.nombre}</td>
                          <td>{item.codigo}</td>
                          <td>{item.zona}</td>
                          <td className={`text-end ${item.balance < 0 ? 'balance-negative' : item.balance > 0 ? 'balance-positive' : ''}`}>
                            {formatCurrency(item.balance)}
                          </td>
                        </tr>
                      ))
                    )}
                    {paginatedData.length > 0 && (
                      <tr className="table-info fw-bold">
                        <td>Totales</td>
                        <td>-</td>
                        <td>-</td>
                        <td className="text-end">{formatCurrency(totals.balance)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  Mostrando {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length} entradas
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(1)}>«</button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>‹</button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>›</button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(totalPages)}>»</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankBalances;
