import { useState, useEffect, useMemo } from 'react';
import api from '@services/api';
import '../assets/css/FormStyles.css';
import '../assets/css/CreateBranchGeneral.css';

const BancaAccess = () => {
  const [loading, setLoading] = useState(true);
  const [bettingPools, setBettingPools] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'number', direction: 'asc' });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [modalData, setModalData] = useState({
    fallPercentage: '',
    deactivationBalance: '',
    dailySaleLimit: '',
    dailyBalanceLimit: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [zonesData, poolsData] = await Promise.all([
        api.get('/zones'),
        api.get('/betting-pools')
      ]);

      const zonesArray = zonesData?.items || zonesData || [];
      const poolsArray = poolsData?.items || poolsData || [];

      setZones(zonesArray);
      setSelectedZones(zonesArray.map(z => z.zoneId || z.id));
      setBettingPools(poolsArray);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  const handleZoneToggle = (zoneId) => {
    setSelectedZones(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleOpenModal = (pool) => {
    setSelectedPool(pool);
    setModalData({
      fallPercentage: pool.fallPercentage || '10',
      deactivationBalance: pool.deactivationBalance || '9999999',
      dailySaleLimit: pool.dailySaleLimit || '99999999',
      dailyBalanceLimit: pool.dailyBalanceLimit || ''
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPool(null);
  };

  const handleModalInputChange = (field, value) => {
    setModalData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveModal = async () => {
    if (!selectedPool) return;

    setSaving(true);
    try {
      await api.patch(`/betting-pools/${selectedPool.bettingPoolId || selectedPool.id}/access-config`, {
        fallPercentage: parseFloat(modalData.fallPercentage) || 0,
        deactivationBalance: parseFloat(modalData.deactivationBalance) || 0,
        dailySaleLimit: parseFloat(modalData.dailySaleLimit) || 0,
        dailyBalanceLimit: parseFloat(modalData.dailyBalanceLimit) || 0
      });
      alert('Configuración actualizada exitosamente');
      handleCloseModal();
      handleRefresh();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al actualizar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let data = [...bettingPools];

    // Filter by selected zones
    if (selectedZones.length > 0 && selectedZones.length < zones.length) {
      data = data.filter(pool => {
        const poolZoneId = pool.zoneId || pool.zone?.id;
        return selectedZones.includes(poolZoneId);
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        (pool.bettingPoolId || pool.id)?.toString().includes(term) ||
        (pool.bettingPoolName || pool.name)?.toLowerCase().includes(term) ||
        (pool.reference || '')?.toLowerCase().includes(term) ||
        (pool.zoneName || pool.zone?.name || '')?.toLowerCase().includes(term)
      );
    }

    // Sort
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
        case 'zone':
          aValue = (a.zoneName || a.zone?.name || '').toLowerCase();
          bValue = (b.zoneName || b.zone?.name || '').toLowerCase();
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
  }, [bettingPools, selectedZones, zones, searchTerm, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
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
      <div className="page-title">
        <h1>Lista de bancas</h1>
      </div>

      <div className="branch-form">
        {/* Filters Section */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Zone Multi-Select Dropdown */}
          <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
            <label className="form-label" style={{ width: 'auto', marginRight: '10px' }}>Zonas</label>
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ fontSize: '14px' }}
              >
                {selectedZones.length} seleccionadas
              </button>
              <ul className="dropdown-menu" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {zones.map(zone => (
                  <li key={zone.zoneId || zone.id}>
                    <label className="dropdown-item" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedZones.includes(zone.zoneId || zone.id)}
                        onChange={() => handleZoneToggle(zone.zoneId || zone.id)}
                        style={{ marginRight: '8px' }}
                      />
                      {zone.zoneName || zone.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleRefresh}
            style={{ fontSize: '14px' }}
          >
            <i className="fas fa-sync-alt" style={{ marginRight: '5px' }}></i>
            Refrescar
          </button>

          {/* Quick Filter */}
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Filtrado rápido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '14px', paddingLeft: '35px' }}
            />
            <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
          <table className="table table-hover table-sm mb-0">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th onClick={() => handleSort('number')} style={{ cursor: 'pointer' }}>
                  Número {getSortIcon('number')}
                </th>
                <th>Usuarios</th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Nombre {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('reference')} style={{ cursor: 'pointer' }}>
                  Referencia {getSortIcon('reference')}
                </th>
                <th onClick={() => handleSort('zone')} style={{ cursor: 'pointer' }}>
                  Zona {getSortIcon('zone')}
                </th>
                <th>Activa</th>
                <th>Configuraciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((pool) => (
                <tr key={pool.bettingPoolId || pool.id}>
                  <td>{pool.bettingPoolId || pool.id}</td>
                  <td>{pool.userCodes?.join(', ') || pool.reference || '-'}</td>
                  <td>{pool.bettingPoolName || pool.name}</td>
                  <td>{pool.reference || '-'}</td>
                  <td>{pool.zoneName || pool.zone?.name || '-'}</td>
                  <td>
                    {pool.isActive || pool.active ? (
                      <i className="fas fa-check-circle text-success"></i>
                    ) : (
                      <i className="fas fa-times-circle text-danger"></i>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-info"
                      onClick={() => handleOpenModal(pool)}
                      style={{ padding: '2px 8px' }}
                    >
                      <i className="fas fa-cog"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Entry Count */}
        <div style={{ marginTop: '15px', color: '#666', fontSize: '13px' }}>
          Mostrando {filteredAndSortedData.length} de {bettingPools.length} entradas
        </div>
      </div>

      {/* Configuration Modal */}
      {modalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Actualizar banca</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                {/* Tab */}
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <a className="nav-link active" href="#">
                      <i className="fas fa-cog" style={{ marginRight: '5px' }}></i>
                      Configuraciones
                    </a>
                  </li>
                </ul>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedPool?.bettingPoolName || selectedPool?.name || ''}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Porcentaje de caída</label>
                    <input
                      type="number"
                      className="form-control"
                      value={modalData.fallPercentage}
                      onChange={(e) => handleModalInputChange('fallPercentage', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Balance de desactivación</label>
                    <input
                      type="number"
                      className="form-control"
                      value={modalData.deactivationBalance}
                      onChange={(e) => handleModalInputChange('deactivationBalance', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Límite de venta diaria</label>
                    <input
                      type="number"
                      className="form-control"
                      value={modalData.dailySaleLimit}
                      onChange={(e) => handleModalInputChange('dailySaleLimit', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Balance límite al día</label>
                    <input
                      type="number"
                      className="form-control"
                      value={modalData.dailyBalanceLimit}
                      onChange={(e) => handleModalInputChange('dailyBalanceLimit', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveModal}
                  disabled={saving}
                >
                  {saving ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BancaAccess;
