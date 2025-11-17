import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const WEEKDAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const DaysWithoutSalesReport = () => {
  console.log('📅 DaysWithoutSalesReport V1 component mounted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bettingPools, setBettingPools] = useState([]);
  const [zones, setZones] = useState([]);

  // Filter state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedZones, setSelectedZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [orderBy, setOrderBy] = useState('code');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📅 Loading initial data...');
      const [poolsData, zonesData] = await Promise.all([
        api.get('/betting-pools'),
        api.get('/zones')
      ]);

      const poolsArray = poolsData?.items || poolsData || [];
      const zonesArray = zonesData?.items || zonesData || [];

      console.log('📅 Pools:', poolsArray.length, 'Zones:', zonesArray.length);

      setBettingPools(poolsArray);
      setZones(zonesArray);

      // Select all zones by default
      const allZoneIds = zonesArray.map(z => z.zoneId || z.id);
      setSelectedZones(allZoneIds);
    } catch (err) {
      console.error('📅 Error loading data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
      console.log('📅 Loading complete');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📅 Searching with date:', selectedDate, 'zones:', selectedZones);
      // TODO: Call actual API endpoint when available
      setLoading(false);
    } catch (err) {
      console.error('📅 Error searching:', err);
      setError(err.message || 'Error searching');
      setLoading(false);
    }
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

  // Generate mock weekly sales data for demo purposes
  const poolsWithWeeklyData = useMemo(() => {
    return bettingPools.map(pool => {
      // Generate random sales for each day of the week
      const weeklySales = {};
      WEEKDAYS.forEach(day => {
        // 30% chance of no sales, otherwise random amount
        const hasSales = Math.random() > 0.3;
        weeklySales[day.key] = hasSales ? Math.floor(Math.random() * 1000) + Math.random() * 100 : 0;
      });

      // Generate pool code like "LAN-0001"
      const poolId = pool.bettingPoolId || pool.id || 0;
      const code = `LAN-${poolId.toString().padStart(4, '0')}`;

      return {
        ...pool,
        code,
        poolName: pool.bettingPoolName || pool.name || 'Sin nombre',
        ...weeklySales
      };
    });
  }, [bettingPools]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = [...poolsWithWeeklyData];

    // Filter by selected zones
    if (selectedZones.length > 0 && selectedZones.length < zones.length) {
      data = data.filter(pool =>
        selectedZones.includes(pool.zoneId || pool.zone?.id)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        pool.code?.toLowerCase().includes(term) ||
        pool.poolName?.toLowerCase().includes(term)
      );
    }

    // Sort
    data.sort((a, b) => {
      let aValue, bValue;

      switch (orderBy) {
        case 'code':
          aValue = (a.code || '').toLowerCase();
          bValue = (b.code || '').toLowerCase();
          break;
        case 'name':
          aValue = (a.poolName || '').toLowerCase();
          bValue = (b.poolName || '').toLowerCase();
          break;
        default:
          aValue = a[orderBy] || 0;
          bValue = b[orderBy] || 0;
      }

      if (typeof aValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return data;
  }, [poolsWithWeeklyData, selectedZones, zones.length, searchTerm, orderBy, order]);

  const formatCurrency = (value) => {
    return `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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

  console.log('📅 Rendering DaysWithoutSalesReport V1, pools:', filteredAndSortedData.length);

  return (
    <div className="container-fluid p-4">
      <div className="card">
        <div className="card-body">
          <h3 className="card-title mb-4">Bancas con dias sin vender</h3>

          {/* Filters Section */}
          <div className="row mb-4 align-items-center">
            <div className="col-auto">
              <div className="d-flex align-items-center gap-2">
                <label className="form-label mb-0">Fecha</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  style={{ width: '160px' }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
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
                    onClick={() => handleSort('code')}
                  >
                    Código {getSortIcon('code')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('name')}
                  >
                    Nombre {getSortIcon('name')}
                  </th>
                  {WEEKDAYS.map(day => (
                    <th key={day.key} className="text-end">
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No hay datos disponibles
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData.map((pool) => (
                    <tr key={pool.bettingPoolId || pool.id}>
                      <td>{pool.code}</td>
                      <td>{pool.poolName}</td>
                      {WEEKDAYS.map(day => (
                        <td
                          key={day.key}
                          className="text-end"
                          style={{
                            color: pool[day.key] === 0 ? '#dc3545' : 'inherit',
                            fontWeight: pool[day.key] === 0 ? 'bold' : 'normal'
                          }}
                        >
                          {formatCurrency(pool[day.key])}
                        </td>
                      ))}
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

export default DaysWithoutSalesReport;
