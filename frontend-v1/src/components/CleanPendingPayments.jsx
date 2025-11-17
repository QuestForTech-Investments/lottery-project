import { useState, useEffect, useMemo } from 'react';
import api from '@services/api';
import '../assets/css/FormStyles.css';
import '../assets/css/CreateBranchGeneral.css';

const CleanPendingPayments = () => {
  const [loading, setLoading] = useState(true);
  const [bettingPools, setBettingPools] = useState([]);
  const [activeTab, setActiveTab] = useState('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'number', direction: 'asc' });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [cleanDate, setCleanDate] = useState(new Date().toISOString().split('T')[0]);
  const [cleanSummary, setCleanSummary] = useState({ tickets: 0, amount: 0 });
  const [cleaning, setCleaning] = useState(false);

  // Report tab state
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportBancaId, setReportBancaId] = useState('');
  const [reportData, setReportData] = useState([]);
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportSortConfig, setReportSortConfig] = useState({ key: 'fecha', direction: 'asc' });
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    loadBettingPools();
  }, []);

  const loadBettingPools = async () => {
    setLoading(true);
    try {
      const poolsData = await api.get('/betting-pools');
      const poolsArray = poolsData?.items || poolsData || [];
      setBettingPools(poolsArray);
    } catch (error) {
      console.error('Error loading betting pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleReportSort = (key) => {
    setReportSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleOpenModal = (pool) => {
    setSelectedPool(pool);
    setCleanDate(new Date().toISOString().split('T')[0]);
    setCleanSummary({ tickets: 0, amount: 0 });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPool(null);
  };

  const handleCleanPayments = async () => {
    if (!selectedPool) return;

    const confirmed = window.confirm(
      `¿Está seguro de limpiar ${cleanSummary.tickets} tickets pendientes por un monto de $${cleanSummary.amount.toFixed(2)}?`
    );
    if (!confirmed) return;

    setCleaning(true);
    try {
      await api.post(`/betting-pools/${selectedPool.bettingPoolId || selectedPool.id}/clean-pending-payments`, {
        untilDate: cleanDate
      });
      alert('Pendientes de pago limpiados exitosamente');
      handleCloseModal();
      loadBettingPools();
    } catch (error) {
      console.error('Error cleaning payments:', error);
      alert('Error al limpiar pendientes de pago');
    } finally {
      setCleaning(false);
    }
  };

  const handleSearchReport = async () => {
    if (!reportBancaId) {
      alert('Por favor seleccione una banca');
      return;
    }

    setLoadingReport(true);
    try {
      const data = await api.get(
        `/betting-pools/${reportBancaId}/cleaned-payments?startDate=${reportStartDate}&endDate=${reportEndDate}`
      );
      setReportData(data?.items || data || []);
    } catch (error) {
      console.error('Error loading report:', error);
      setReportData([]);
    } finally {
      setLoadingReport(false);
    }
  };

  // Filter and sort list data
  const filteredAndSortedData = useMemo(() => {
    let data = [...bettingPools];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        (pool.bettingPoolId || pool.id)?.toString().includes(term) ||
        (pool.bettingPoolName || pool.name)?.toLowerCase().includes(term) ||
        (pool.reference || '')?.toLowerCase().includes(term) ||
        (pool.userCodes?.join(', ') || '')?.toLowerCase().includes(term)
      );
    }

    data.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'number':
          aValue = a.bettingPoolId || a.id || 0;
          bValue = b.bettingPoolId || b.id || 0;
          break;
        case 'name':
          aValue = (a.bettingPoolName || a.name || '').toLowerCase();
          bValue = (b.bettingPoolName || b.name || '').toLowerCase();
          break;
        case 'reference':
          aValue = (a.reference || '').toLowerCase();
          bValue = (b.reference || '').toLowerCase();
          break;
        default:
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return data;
  }, [bettingPools, searchTerm, sortConfig]);

  // Filter report data
  const filteredReportData = useMemo(() => {
    let data = [...reportData];

    if (reportSearchTerm) {
      const term = reportSearchTerm.toLowerCase();
      data = data.filter(item =>
        item.ticketNumber?.toString().includes(term) ||
        item.usuario?.toLowerCase().includes(term)
      );
    }

    return data;
  }, [reportData, reportSearchTerm]);

  // Calculate report totals
  const reportTotals = useMemo(() => {
    return filteredReportData.reduce(
      (acc, item) => ({
        monto: acc.monto + (item.monto || 0),
        premios: acc.premios + (item.premios || 0)
      }),
      { monto: 0, premios: 0 }
    );
  }, [filteredReportData]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getReportSortIcon = (key) => {
    if (reportSortConfig.key !== key) return '↕';
    return reportSortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="create-branch-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="create-branch-container">
      <div className="branch-form">
        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'lista' ? 'active' : ''}`}
              onClick={() => setActiveTab('lista')}
            >
              Lista
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'reporte' ? 'active' : ''}`}
              onClick={() => setActiveTab('reporte')}
            >
              Reporte
            </button>
          </li>
        </ul>

        {/* Tab Lista */}
        {activeTab === 'lista' && (
          <div>
            <h3 className="mb-4">Lista de bancas</h3>

            {/* Quick Filter */}
            <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrado rápido"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '35px' }}
              />
              <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
            </div>

            {/* Table */}
            <div className="table-responsive" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
              <table className="table table-hover table-sm mb-0">
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th onClick={() => handleSort('number')} style={{ cursor: 'pointer' }}>
                      Número {getSortIcon('number')}
                    </th>
                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                      Nombre {getSortIcon('name')}
                    </th>
                    <th onClick={() => handleSort('reference')} style={{ cursor: 'pointer' }}>
                      Referencia {getSortIcon('reference')}
                    </th>
                    <th>Usuarios</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((pool) => (
                    <tr key={pool.bettingPoolId || pool.id}>
                      <td>{pool.bettingPoolId || pool.id}</td>
                      <td>{pool.bettingPoolName || pool.name}</td>
                      <td>{pool.reference || '-'}</td>
                      <td>{pool.userCodes?.join(', ') || pool.reference || '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleOpenModal(pool)}
                          title="Limpiar pendientes de pago"
                        >
                          <i className="fas fa-broom"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '15px', color: '#666', fontSize: '13px' }}>
              Mostrando {filteredAndSortedData.length} de {bettingPools.length} entradas
            </div>
          </div>
        )}

        {/* Tab Reporte */}
        {activeTab === 'reporte' && (
          <div>
            <h3 className="mb-4">Tickets pagados y limpiados</h3>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fecha inicial</label>
                <input
                  type="date"
                  className="form-control"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fecha final</label>
                <input
                  type="date"
                  className="form-control"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: '250px' }}>
                <label className="form-label">Banca</label>
                <select
                  className="form-control"
                  value={reportBancaId}
                  onChange={(e) => setReportBancaId(e.target.value)}
                >
                  <option value="">Seleccione</option>
                  {bettingPools.map((pool) => (
                    <option key={pool.bettingPoolId || pool.id} value={pool.bettingPoolId || pool.id}>
                      {pool.reference || pool.bettingPoolName || pool.name} ({pool.bettingPoolId || pool.id})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSearchReport}
                disabled={loadingReport}
              >
                {loadingReport ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {/* Quick Filter */}
            <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrado rápido"
                value={reportSearchTerm}
                onChange={(e) => setReportSearchTerm(e.target.value)}
                style={{ paddingLeft: '35px' }}
              />
              <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
            </div>

            {/* Report Table */}
            <div className="table-responsive" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
              <table className="table table-hover table-sm mb-0">
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th onClick={() => handleReportSort('fecha')} style={{ cursor: 'pointer' }}>
                      Fecha {getReportSortIcon('fecha')}
                    </th>
                    <th onClick={() => handleReportSort('ticketNumber')} style={{ cursor: 'pointer' }}>
                      Ticket # {getReportSortIcon('ticketNumber')}
                    </th>
                    <th onClick={() => handleReportSort('monto')} style={{ cursor: 'pointer' }}>
                      Monto {getReportSortIcon('monto')}
                    </th>
                    <th onClick={() => handleReportSort('premios')} style={{ cursor: 'pointer' }}>
                      Premios {getReportSortIcon('premios')}
                    </th>
                    <th onClick={() => handleReportSort('fechaPago')} style={{ cursor: 'pointer' }}>
                      Fecha de pago {getReportSortIcon('fechaPago')}
                    </th>
                    <th onClick={() => handleReportSort('usuario')} style={{ cursor: 'pointer' }}>
                      Usuario {getReportSortIcon('usuario')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReportData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                        No hay entradas disponibles
                      </td>
                    </tr>
                  ) : (
                    filteredReportData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.fecha}</td>
                        <td>{item.ticketNumber}</td>
                        <td>${(item.monto || 0).toFixed(2)}</td>
                        <td>${(item.premios || 0).toFixed(2)}</td>
                        <td>{item.fechaPago}</td>
                        <td>{item.usuario}</td>
                      </tr>
                    ))
                  )}
                  {/* Totals Row */}
                  <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                    <td><strong>Totales</strong></td>
                    <td><strong>-</strong></td>
                    <td><strong>${reportTotals.monto.toFixed(2)}</strong></td>
                    <td><strong>${reportTotals.premios.toFixed(2)}</strong></td>
                    <td><strong>-</strong></td>
                    <td><strong>-</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '15px', color: '#666', fontSize: '13px' }}>
              Mostrando {filteredReportData.length} de {reportData.length} entradas
            </div>
          </div>
        )}
      </div>

      {/* Clean Pending Payments Modal */}
      {modalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Limpiar pendientes de pago</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Nombre:</strong> {selectedPool?.bettingPoolName || selectedPool?.name}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Número:</strong> #{selectedPool?.bettingPoolId || selectedPool?.id}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={cleanDate}
                    onChange={(e) => setCleanDate(e.target.value)}
                  />
                </div>

                <p style={{ color: '#666', fontSize: '14px', marginTop: '15px' }}>
                  Se limpiaran todos los tickets pendientes de pago hasta la fecha seleccionada
                </p>

                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginTop: '15px' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Tickets:</strong> {cleanSummary.tickets}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Monto de premios a limpiar:</strong> ${cleanSummary.amount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCleanPayments}
                  disabled={cleaning}
                >
                  {cleaning ? 'Limpiando...' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanPendingPayments;
