import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const BettingPoolsWithoutSales = () => {
  console.log('📊 BettingPoolsWithoutSales V1 component mounted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bettingPools, setBettingPools] = useState([]);
  const [zones, setZones] = useState([]);

  // Filter state
  const [daysWithoutSales, setDaysWithoutSales] = useState(7);
  const [selectedZones, setSelectedZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [orderBy, setOrderBy] = useState('number');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Loading initial data...');
      const [poolsData, zonesData] = await Promise.all([
        api.get('/betting-pools'),
        api.get('/zones')
      ]);

      const poolsArray = poolsData?.items || poolsData || [];
      const zonesArray = zonesData?.items || zonesData || [];

      console.log('📊 Pools:', poolsArray.length, 'Zones:', zonesArray.length);

      setBettingPools(poolsArray);
      setZones(zonesArray);

      // Select all zones by default
      const allZoneIds = zonesArray.map(z => z.zoneId || z.id);
      setSelectedZones(allZoneIds);
    } catch (err) {
      console.error('📊 Error loading data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
      console.log('📊 Loading complete');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Searching with days:', daysWithoutSales, 'zones:', selectedZones);
      // TODO: Call actual API endpoint when available
      setLoading(false);
    } catch (err) {
      console.error('📊 Error searching:', err);
      setError(err.message || 'Error searching');
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    alert('Exportar a PDF - Funcionalidad pendiente');
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleZoneToggle = (zoneId) => {
    setSelectedZones(prev => {
      if (prev.includes(zoneId)) {
        return prev.filter(id => id !== zoneId);
      } else {
        return [...prev, zoneId];
      }
    });
  };

  const handleSelectAllZones = () => {
    const allZoneIds = zones.map(z => z.zoneId || z.id);
    setSelectedZones(allZoneIds);
  };

  const handleDeselectAllZones = () => {
    setSelectedZones([]);
  };

  // Generate mock "days without sales" data for demo purposes
  const poolsWithDaysData = useMemo(() => {
    return bettingPools.map(pool => {
      const daysNoSales = Math.floor(Math.random() * daysWithoutSales) + 1;
      const lastSaleDate = new Date();
      lastSaleDate.setDate(lastSaleDate.getDate() - daysNoSales);

      return {
        ...pool,
        daysWithoutSales: daysNoSales,
        lastSaleDate: lastSaleDate.toISOString().split('T')[0],
        zoneName: pool.zoneName || pool.zone?.name || 'Sin zona'
      };
    });
  }, [bettingPools, daysWithoutSales]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = [...poolsWithDaysData];

    // Filter by selected zones
    if (selectedZones.length > 0 && selectedZones.length < zones.length) {
      data = data.filter(pool =>
        selectedZones.includes(pool.zoneId || pool.zone?.id)
      );
    }

    // Filter by days
    data = data.filter(pool => pool.daysWithoutSales <= daysWithoutSales);

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        (pool.bettingPoolId || pool.id)?.toString().includes(term) ||
        (pool.bettingPoolName || pool.name)?.toLowerCase().includes(term) ||
        (pool.reference || '')?.toLowerCase().includes(term) ||
        pool.zoneName?.toLowerCase().includes(term)
      );
    }

    // Sort
    data.sort((a, b) => {
      let aValue, bValue;

      switch (orderBy) {
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
        case 'days':
          aValue = a.daysWithoutSales || 0;
          bValue = b.daysWithoutSales || 0;
          break;
        case 'lastSale':
          aValue = a.lastSaleDate || '';
          bValue = b.lastSaleDate || '';
          break;
        case 'zone':
          aValue = (a.zoneName || '').toLowerCase();
          bValue = (b.zoneName || '').toLowerCase();
          break;
        case 'balance':
          aValue = a.balance || 0;
          bValue = b.balance || 0;
          break;
        default:
          aValue = a[orderBy];
          bValue = b[orderBy];
      }

      if (typeof aValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return data;
  }, [poolsWithDaysData, selectedZones, zones.length, daysWithoutSales, searchTerm, orderBy, order]);

  const getSortIcon = (column) => {
    if (orderBy !== column) return '↕';
    return order === 'asc' ? '↑' : '↓';
  };

  if (loading && bettingPools.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="card">
          <div className="card-body">
            <h5 className="text-danger">Error: {error}</h5>
            <button className="btn btn-primary mt-2" onClick={loadInitialData}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('📊 Rendering BettingPoolsWithoutSales V1, pools:', filteredAndSortedData.length);

  return (
    <div className="container-fluid p-4">
      <div className="card">
        <div className="card-body">
          <h3 className="card-title mb-4">Lista de bancas sin ventas</h3>

          {/* Filters Section */}
          <div className="row mb-4 align-items-center">
            <div className="col-auto">
              <div className="d-flex align-items-center gap-2">
                <span>En los últimos</span>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  style={{ width: '80px' }}
                  value={daysWithoutSales}
                  onChange={(e) => setDaysWithoutSales(parseInt(e.target.value) || 7)}
                  min="1"
                  max="365"
                />
                <span>Días</span>
              </div>
            </div>

            <div className="col-auto">
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Zonas ({selectedZones.length} seleccionadas)
                </button>
                <div className="dropdown-menu p-3" style={{ minWidth: '250px', maxHeight: '300px', overflowY: 'auto' }}>
                  <div className="mb-2">
                    <button
                      className="btn btn-link btn-sm p-0 me-2"
                      onClick={handleSelectAllZones}
                    >
                      Seleccionar todas
                    </button>
                    <button
                      className="btn btn-link btn-sm p-0"
                      onClick={handleDeselectAllZones}
                    >
                      Deseleccionar todas
                    </button>
                  </div>
                  {zones.map((zone) => (
                    <div key={zone.zoneId || zone.id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`zone-${zone.zoneId || zone.id}`}
                        checked={selectedZones.includes(zone.zoneId || zone.id)}
                        onChange={() => handleZoneToggle(zone.zoneId || zone.id)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`zone-${zone.zoneId || zone.id}`}
                      >
                        {zone.zoneName || zone.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-auto">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSearch}
                disabled={loading}
              >
                <i className="fas fa-eye me-1"></i>
                Ver ventas
              </button>
            </div>

            <div className="col-auto">
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleExportPdf}
              >
                <i className="fas fa-file-pdf me-1"></i>
                PDF
              </button>
            </div>
          </div>

          {/* Quick Filter */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Filtrado rápido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px' }}
            />
          </div>

          {/* Data Table */}
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered">
              <thead className="table-light">
                <tr>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('number')}
                  >
                    Número {getSortIcon('number')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('name')}
                  >
                    Nombre {getSortIcon('name')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('reference')}
                  >
                    Referencia {getSortIcon('reference')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('days')}
                  >
                    Días {getSortIcon('days')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('lastSale')}
                  >
                    Última venta {getSortIcon('lastSale')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('zone')}
                  >
                    Zona {getSortIcon('zone')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('balance')}
                  >
                    Balance {getSortIcon('balance')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No hay bancas sin ventas en el período seleccionado
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData.map((pool) => (
                    <tr key={pool.bettingPoolId || pool.id}>
                      <td>{pool.bettingPoolId || pool.id}</td>
                      <td>{pool.bettingPoolName || pool.name}</td>
                      <td>{pool.reference || '-'}</td>
                      <td>{pool.daysWithoutSales}</td>
                      <td>{pool.lastSaleDate}</td>
                      <td>{pool.zoneName}</td>
                      <td>
                        ${(pool.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Entry Counter */}
          <div className="text-muted small">
            Mostrando {filteredAndSortedData.length} de {filteredAndSortedData.length} entradas
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingPoolsWithoutSales;
