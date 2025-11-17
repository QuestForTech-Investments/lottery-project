import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const TABLE_COLUMNS = [
  { key: 'ref', label: 'Ref.', align: 'left' },
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'p', label: 'P', align: 'center' },
  { key: 'l', label: 'L', align: 'center' },
  { key: 'w', label: 'W', align: 'center' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'sales', label: 'Venta', align: 'right' },
  { key: 'commissions', label: 'Comisiones', align: 'right' },
  { key: 'discounts', label: 'Descuentos', align: 'right' },
  { key: 'prizes', label: 'Premios', align: 'right' },
  { key: 'net', label: 'Neto', align: 'right' },
  { key: 'fall', label: 'Caída', align: 'right' },
  { key: 'final', label: 'Final', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'accumulatedFall', label: 'Caida acumulada', align: 'right' }
];

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'winner', label: 'Ganador' },
  { id: 'prizes', label: 'Premios' },
  { id: 'commissions', label: 'Comisiones' },
  { id: 'discounts', label: 'Descuentos' },
  { id: 'net', label: 'Neto' },
  { id: 'tickets', label: 'Tickets' }
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'with-sales', label: 'Con ventas' },
  { value: 'with-prizes', label: 'Con premios' },
  { value: 'pending-tickets', label: 'Con tickets pendientes' },
  { value: 'negative-net', label: 'Con ventas netas negativas' },
  { value: 'positive-net', label: 'Con ventas netas positivas' }
];

const DailySales = () => {
  console.log('📊 DailySales V1 component mounted');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bettingPools, setBettingPools] = useState([]);
  const [zones, setZones] = useState([]);

  // Tab state
  const [activeTab, setActiveTab] = useState('general');

  // Filter state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [filterOption, setFilterOption] = useState('all');
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

  const handleViewSales = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Loading sales for date:', selectedDate);
      // TODO: Call actual API endpoint when available
      setLoading(false);
    } catch (err) {
      console.error('📊 Error loading sales:', err);
      setError(err.message || 'Error loading sales');
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

  // Generate mock sales data
  const poolsWithSalesData = useMemo(() => {
    return bettingPools.map(pool => {
      const poolId = pool.bettingPoolId || pool.id || 0;
      const code = `LAN-${poolId.toString().padStart(4, '0')}`;

      // Generate random sales data
      const sales = Math.random() > 0.2 ? Math.floor(Math.random() * 10000) + Math.random() * 100 : 0;
      const commissions = sales * 0.1;
      const discounts = sales * 0.05;
      const prizes = Math.random() > 0.5 ? Math.floor(Math.random() * 5000) : 0;
      const net = sales - commissions - discounts - prizes;
      const fall = Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0;
      const final = net - fall;
      const balance = Math.floor(Math.random() * 20000) - 10000;
      const accumulatedFall = fall * (1 + Math.random());

      return {
        ...pool,
        ref: poolId,
        code,
        p: Math.random() > 0.5 ? '✓' : '',
        l: Math.random() > 0.5 ? '✓' : '',
        w: Math.random() > 0.5 ? '✓' : '',
        total: sales + commissions,
        sales,
        commissions,
        discounts,
        prizes,
        net,
        fall,
        final,
        balance,
        accumulatedFall
      };
    });
  }, [bettingPools]);

  // Calculate totals
  const totals = useMemo(() => {
    const result = {
      total: 0,
      sales: 0,
      commissions: 0,
      discounts: 0,
      prizes: 0,
      net: 0,
      fall: 0,
      final: 0,
      balance: 0,
      accumulatedFall: 0
    };

    poolsWithSalesData.forEach(pool => {
      result.total += pool.total || 0;
      result.sales += pool.sales || 0;
      result.commissions += pool.commissions || 0;
      result.discounts += pool.discounts || 0;
      result.prizes += pool.prizes || 0;
      result.net += pool.net || 0;
      result.fall += pool.fall || 0;
      result.final += pool.final || 0;
      result.balance += pool.balance || 0;
      result.accumulatedFall += pool.accumulatedFall || 0;
    });

    return result;
  }, [poolsWithSalesData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = [...poolsWithSalesData];

    // Filter by selected zones
    if (selectedZones.length > 0 && selectedZones.length < zones.length) {
      data = data.filter(pool =>
        selectedZones.includes(pool.zoneId || pool.zone?.id)
      );
    }

    // Filter by filter option
    switch (filterOption) {
      case 'with-sales':
        data = data.filter(pool => pool.sales > 0);
        break;
      case 'with-prizes':
        data = data.filter(pool => pool.prizes > 0);
        break;
      case 'pending-tickets':
        data = data.filter(pool => pool.p === '✓');
        break;
      case 'negative-net':
        data = data.filter(pool => pool.net < 0);
        break;
      case 'positive-net':
        data = data.filter(pool => pool.net > 0);
        break;
      default:
        break;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        pool.code?.toLowerCase().includes(term) ||
        pool.bettingPoolName?.toLowerCase().includes(term)
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
        case 'ref':
          aValue = a.ref || 0;
          bValue = b.ref || 0;
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
  }, [poolsWithSalesData, selectedZones, zones.length, filterOption, searchTerm, orderBy, order]);

  const formatCurrency = (value) => {
    const num = value || 0;
    const formatted = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return num < 0 ? `-$${formatted}` : `$${formatted}`;
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

  console.log('📊 Rendering DailySales V1, pools:', filteredAndSortedData.length);

  return (
    <div className="container-fluid p-4">
      <div className="card">
        <div className="card-body">
          <h3 className="card-title mb-4">Ventas del día</h3>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            {TABS.map(tab => (
              <li key={tab.id} className="nav-item">
                <button
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          {activeTab === 'general' ? (
            <>
              {/* Filters Section */}
              <div className="row mb-3 align-items-center g-2">
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
                      Zonas ({selectedZones.length})
                    </button>
                    <div className="dropdown-menu p-3" style={{ minWidth: '250px', maxHeight: '300px', overflowY: 'auto' }}>
                      <div className="mb-2">
                        <button
                          className="btn btn-link btn-sm p-0 me-2"
                          onClick={handleSelectAllZones}
                        >
                          Todas
                        </button>
                        <button
                          className="btn btn-link btn-sm p-0"
                          onClick={handleDeselectAllZones}
                        >
                          Ninguna
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
                  <select
                    className="form-select form-select-sm"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    style={{ width: '150px' }}
                  >
                    <option value="all">Todos</option>
                    <option value="group1">Grupo 1</option>
                    <option value="group2">Grupo 2</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row mb-3 g-2">
                <div className="col-auto">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleViewSales}
                    disabled={loading}
                  >
                    <i className="fas fa-eye me-1"></i>
                    Ver ventas
                  </button>
                </div>
                <div className="col-auto">
                  <button className="btn btn-outline-secondary btn-sm" disabled>
                    <i className="fas fa-file-pdf me-1"></i>
                    PDF
                  </button>
                </div>
                <div className="col-auto">
                  <button className="btn btn-outline-secondary btn-sm" disabled>
                    <i className="fas fa-file-csv me-1"></i>
                    CSV
                  </button>
                </div>
                <div className="col-auto">
                  <button className="btn btn-outline-secondary btn-sm" disabled>
                    <i className="fas fa-ticket-alt me-1"></i>
                    Procesar tickets
                  </button>
                </div>
                <div className="col-auto">
                  <button className="btn btn-outline-secondary btn-sm" disabled>
                    <i className="fas fa-dollar-sign me-1"></i>
                    Procesar ventas
                  </button>
                </div>
              </div>

              {/* Radio Filter Options */}
              <div className="mb-3">
                {FILTER_OPTIONS.map(option => (
                  <div key={option.value} className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="filterOption"
                      id={`filter-${option.value}`}
                      value={option.value}
                      checked={filterOption === option.value}
                      onChange={(e) => setFilterOption(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor={`filter-${option.value}`}>
                      {option.label}
                    </label>
                  </div>
                ))}
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
                <table className="table table-striped table-hover table-bordered table-sm">
                  <thead className="table-light">
                    <tr>
                      {TABLE_COLUMNS.map(col => (
                        <th
                          key={col.key}
                          className={`text-${col.align}`}
                          style={{ cursor: ['code', 'ref'].includes(col.key) ? 'pointer' : 'default' }}
                          onClick={() => ['code', 'ref'].includes(col.key) && handleSort(col.key)}
                        >
                          {col.label}
                          {['code', 'ref'].includes(col.key) && ` ${getSortIcon(col.key)}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Totals Row */}
                    <tr className="table-info fw-bold">
                      <td>-</td>
                      <td>TOTALES</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-end">{formatCurrency(totals.total)}</td>
                      <td className="text-end">{formatCurrency(totals.sales)}</td>
                      <td className="text-end">{formatCurrency(totals.commissions)}</td>
                      <td className="text-end">{formatCurrency(totals.discounts)}</td>
                      <td className="text-end">{formatCurrency(totals.prizes)}</td>
                      <td className="text-end" style={{ color: totals.net < 0 ? '#dc3545' : 'inherit' }}>
                        {formatCurrency(totals.net)}
                      </td>
                      <td className="text-end">{formatCurrency(totals.fall)}</td>
                      <td className="text-end" style={{ color: totals.final < 0 ? '#dc3545' : 'inherit' }}>
                        {formatCurrency(totals.final)}
                      </td>
                      <td className="text-end" style={{ color: totals.balance < 0 ? '#dc3545' : 'inherit' }}>
                        {formatCurrency(totals.balance)}
                      </td>
                      <td className="text-end">{formatCurrency(totals.accumulatedFall)}</td>
                    </tr>
                    {filteredAndSortedData.length === 0 ? (
                      <tr>
                        <td colSpan={15} className="text-center">
                          No hay datos disponibles
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedData.map((pool) => (
                        <tr key={pool.bettingPoolId || pool.id}>
                          <td>{pool.ref}</td>
                          <td>{pool.code}</td>
                          <td className="text-center">{pool.p}</td>
                          <td className="text-center">{pool.l}</td>
                          <td className="text-center">{pool.w}</td>
                          <td className="text-end">{formatCurrency(pool.total)}</td>
                          <td className="text-end">{formatCurrency(pool.sales)}</td>
                          <td className="text-end">{formatCurrency(pool.commissions)}</td>
                          <td className="text-end">{formatCurrency(pool.discounts)}</td>
                          <td className="text-end">{formatCurrency(pool.prizes)}</td>
                          <td className="text-end" style={{ color: pool.net < 0 ? '#dc3545' : 'inherit' }}>
                            {formatCurrency(pool.net)}
                          </td>
                          <td className="text-end">{formatCurrency(pool.fall)}</td>
                          <td className="text-end" style={{ color: pool.final < 0 ? '#dc3545' : 'inherit' }}>
                            {formatCurrency(pool.final)}
                          </td>
                          <td className="text-end" style={{ color: pool.balance < 0 ? '#dc3545' : 'inherit' }}>
                            {formatCurrency(pool.balance)}
                          </td>
                          <td className="text-end">{formatCurrency(pool.accumulatedFall)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Entry Counter */}
              <div className="text-muted small">
                Mostrando {filteredAndSortedData.length} de {poolsWithSalesData.length} entradas
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <h5 className="text-muted">Tab "{TABS.find(t => t.id === activeTab)?.label}" - Próximamente</h5>
              <p className="text-muted">Esta funcionalidad estará disponible en una próxima actualización.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySales;
