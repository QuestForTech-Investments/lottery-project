import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import '../assets/css/CreateBranchGeneral.css';
import '../assets/css/FormStyles.css';

const TABLE_COLUMNS = [
  { key: 'ref', label: 'Número', align: 'left' },
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

// Columnas específicas para cada tab
const WINNER_COLUMNS = [
  { key: 'ref', label: 'Número', align: 'left' },
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'winnerName', label: 'Nombre ganador', align: 'left' },
  { key: 'winnerPhone', label: 'Teléfono', align: 'left' },
  { key: 'ticketNumber', label: 'Número ticket', align: 'left' },
  { key: 'winningNumber', label: 'Número ganador', align: 'center' },
  { key: 'betType', label: 'Tipo apuesta', align: 'left' },
  { key: 'prizeAmount', label: 'Monto premio', align: 'right' },
  { key: 'claimedDate', label: 'Fecha reclamo', align: 'center' },
  { key: 'status', label: 'Estado', align: 'center' }
];

const PRIZES_COLUMNS = [
  { key: 'ref', label: 'Número', align: 'left' },
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'directoPrizes', label: 'Directo', align: 'right' },
  { key: 'palePrizes', label: 'Palé', align: 'right' },
  { key: 'tripletaPrizes', label: 'Tripleta', align: 'right' },
  { key: 'pickTwoPrizes', label: 'Pick Two', align: 'right' },
  { key: 'pickThreePrizes', label: 'Pick Three', align: 'right' },
  { key: 'pickFourPrizes', label: 'Pick Four', align: 'right' },
  { key: 'otherPrizes', label: 'Otros', align: 'right' },
  { key: 'totalPrizes', label: 'Total premios', align: 'right' }
];

const COMMISSIONS_COLUMNS = [
  { key: 'ref', label: 'Número', align: 'left' },
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'directoComm', label: 'Directo', align: 'right' },
  { key: 'paleComm', label: 'Palé', align: 'right' },
  { key: 'tripletaComm', label: 'Tripleta', align: 'right' },
  { key: 'pickTwoComm', label: 'Pick Two', align: 'right' },
  { key: 'pickThreeComm', label: 'Pick Three', align: 'right' },
  { key: 'pickFourComm', label: 'Pick Four', align: 'right' },
  { key: 'otherComm', label: 'Otros', align: 'right' },
  { key: 'totalComm', label: 'Total comisiones', align: 'right' }
];

const DISCOUNTS_COLUMNS = [
  { key: 'ref', label: 'Número', align: 'left' },
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'volumeDiscount', label: 'Por volumen', align: 'right' },
  { key: 'loyaltyDiscount', label: 'Por fidelidad', align: 'right' },
  { key: 'promotionalDiscount', label: 'Promocional', align: 'right' },
  { key: 'specialDiscount', label: 'Especial', align: 'right' },
  { key: 'otherDiscount', label: 'Otros', align: 'right' },
  { key: 'totalDiscount', label: 'Total descuentos', align: 'right' }
];

const NET_COLUMNS = [
  { key: 'ref', label: 'Número', align: 'left' },
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'grossSales', label: 'Ventas brutas', align: 'right' },
  { key: 'totalCommissions', label: 'Comisiones', align: 'right' },
  { key: 'totalDiscounts', label: 'Descuentos', align: 'right' },
  { key: 'totalPrizes', label: 'Premios', align: 'right' },
  { key: 'netSales', label: 'Ventas netas', align: 'right' },
  { key: 'profit', label: 'Ganancia', align: 'right' },
  { key: 'profitMargin', label: 'Margen %', align: 'right' }
];

const TICKETS_COLUMNS = [
  { key: 'ref', label: 'Número', align: 'left' },
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'totalTickets', label: 'Total tickets', align: 'right' },
  { key: 'pendingTickets', label: 'Pendientes', align: 'right' },
  { key: 'winningTickets', label: 'Ganadores', align: 'right' },
  { key: 'losingTickets', label: 'Perdedores', align: 'right' },
  { key: 'cancelledTickets', label: 'Cancelados', align: 'right' },
  { key: 'avgTicketValue', label: 'Valor promedio', align: 'right' },
  { key: 'maxTicketValue', label: 'Valor máximo', align: 'right' }
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

      // Additional mock data for other tabs
      const directoPrizes = prizes * 0.4;
      const palePrizes = prizes * 0.25;
      const tripletaPrizes = prizes * 0.15;
      const pickTwoPrizes = prizes * 0.1;
      const pickThreePrizes = prizes * 0.05;
      const pickFourPrizes = prizes * 0.03;
      const otherPrizes = prizes * 0.02;

      const directoComm = commissions * 0.35;
      const paleComm = commissions * 0.25;
      const tripletaComm = commissions * 0.2;
      const pickTwoComm = commissions * 0.1;
      const pickThreeComm = commissions * 0.05;
      const pickFourComm = commissions * 0.03;
      const otherComm = commissions * 0.02;

      const volumeDiscount = discounts * 0.4;
      const loyaltyDiscount = discounts * 0.3;
      const promotionalDiscount = discounts * 0.2;
      const specialDiscount = discounts * 0.08;
      const otherDiscount = discounts * 0.02;

      const totalTickets = Math.floor(Math.random() * 500) + 10;
      const pendingTickets = Math.floor(totalTickets * 0.1);
      const winningTickets = Math.floor(totalTickets * 0.15);
      const cancelledTickets = Math.floor(totalTickets * 0.05);
      const losingTickets = totalTickets - pendingTickets - winningTickets - cancelledTickets;

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
        accumulatedFall,
        // Prizes breakdown
        directoPrizes,
        palePrizes,
        tripletaPrizes,
        pickTwoPrizes,
        pickThreePrizes,
        pickFourPrizes,
        otherPrizes,
        totalPrizes: prizes,
        // Commissions breakdown
        directoComm,
        paleComm,
        tripletaComm,
        pickTwoComm,
        pickThreeComm,
        pickFourComm,
        otherComm,
        totalComm: commissions,
        // Discounts breakdown
        volumeDiscount,
        loyaltyDiscount,
        promotionalDiscount,
        specialDiscount,
        otherDiscount,
        totalDiscount: discounts,
        // Net calculations
        grossSales: sales,
        totalCommissions: commissions,
        totalDiscounts: discounts,
        netSales: net,
        profit: net > 0 ? net * 0.3 : 0,
        profitMargin: sales > 0 ? ((net / sales) * 100).toFixed(2) : '0.00',
        // Tickets data
        totalTickets,
        pendingTickets,
        winningTickets,
        losingTickets,
        cancelledTickets,
        avgTicketValue: sales / (totalTickets || 1),
        maxTicketValue: Math.random() * 500 + 50,
        // Winner data (for pools with prizes)
        winnerName: prizes > 0 ? `Ganador ${poolId}` : '',
        winnerPhone: prizes > 0 ? `809-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}` : '',
        ticketNumber: prizes > 0 ? `T-${Math.floor(Math.random() * 100000)}` : '',
        winningNumber: prizes > 0 ? Math.floor(Math.random() * 100).toString().padStart(2, '0') : '',
        betType: prizes > 0 ? ['Directo', 'Palé', 'Tripleta', 'Pick Two'][Math.floor(Math.random() * 4)] : '',
        prizeAmount: prizes,
        claimedDate: prizes > 0 ? new Date().toLocaleDateString() : '',
        status: prizes > 0 ? (Math.random() > 0.3 ? 'Pagado' : 'Pendiente') : ''
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

  // Helper function to render a data table for any tab
  const renderDataTable = (columns, data, showTotals = false) => {
    const calculateColumnTotals = () => {
      const totals = {};
      columns.forEach(col => {
        if (col.align === 'right' && col.key !== 'ref') {
          const sum = data.reduce((acc, row) => {
            const value = parseFloat(row[col.key]) || 0;
            return acc + value;
          }, 0);
          totals[col.key] = sum;
        }
      });
      return totals;
    };

    const columnTotals = showTotals ? calculateColumnTotals() : {};

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered table-sm">
          <thead role="rowgroup">
            <tr role="row">
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  role="columnheader"
                  scope="col"
                  tabIndex={['code', 'ref'].includes(col.key) ? 0 : -1}
                  aria-colindex={index + 1}
                  aria-label={col.label}
                  aria-sort="none"
                  className={`text-${col.align}`}
                  style={{ cursor: 'default' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {showTotals && (
              <tr style={{ backgroundColor: '#e0f7fa' }}>
                {columns.map((col, index) => (
                  <td key={col.key} className={`text-${col.align}`} style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {index === 0 ? '-' : index === 1 ? 'TOTALES' : (
                      col.align === 'right' && columnTotals[col.key] !== undefined
                        ? (col.key === 'profitMargin'
                            ? `${(columnTotals[col.key] / (data.length || 1)).toFixed(2)}%`
                            : formatCurrency(columnTotals[col.key]))
                        : '-'
                    )}
                  </td>
                ))}
              </tr>
            )}
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center" style={{ fontSize: '12px' }}>
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.bettingPoolId || row.id || row.ref}>
                  {columns.map(col => (
                    <td key={col.key} className={`text-${col.align}`} style={{ fontSize: '12px' }}>
                      {col.align === 'right'
                        ? (col.key === 'profitMargin'
                            ? `${row[col.key]}%`
                            : formatCurrency(row[col.key]))
                        : (row[col.key] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Filter data for winner tab (only pools with prizes)
  const winnersData = useMemo(() => {
    return filteredAndSortedData.filter(pool => pool.prizes > 0);
  }, [filteredAndSortedData]);

  if (loading && bettingPools.length === 0) {
    return (
      <div className="create-branch-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border" style={{ color: '#51cbce' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-branch-container">
        <div className="branch-form">
          <h5 className="text-danger">Error: {error}</h5>
          <button
            className="btn mt-2"
            style={{ backgroundColor: '#51cbce', color: 'white' }}
            onClick={loadInitialData}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  console.log('📊 Rendering DailySales V1, pools:', filteredAndSortedData.length);

  return (
    <div className="create-branch-container">
      <div className="page-title">
        <h1>Ventas del día</h1>
      </div>

      {/* Tabs - Using V1 custom tabs */}
      <div className="tabs-container">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="branch-form">
        {activeTab === 'general' ? (
          <div className="form-tab-container">
            {/* Filters Section */}
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ width: 'auto', minWidth: 'auto', paddingRight: '10px' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '160px', height: '31px' }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="dropdown">
                <button
                  className="btn btn-sm dropdown-toggle"
                  style={{
                    backgroundColor: '#51cbce',
                    color: 'white',
                    border: 'none',
                    fontSize: '12px',
                    height: '31px'
                  }}
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
                      style={{ color: '#51cbce' }}
                      onClick={handleSelectAllZones}
                    >
                      Todas
                    </button>
                    <button
                      className="btn btn-link btn-sm p-0"
                      style={{ color: '#51cbce' }}
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
                        style={{ accentColor: '#51cbce' }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`zone-${zone.zoneId || zone.id}`}
                        style={{ fontSize: '12px' }}
                      >
                        {zone.zoneName || zone.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <select
                className="form-control"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                style={{ width: '150px', height: '31px', fontSize: '12px' }}
              >
                <option value="all">Todos</option>
                <option value="group1">Grupo 1</option>
                <option value="group2">Grupo 2</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: '#51cbce',
                  color: 'white',
                  border: 'none',
                  fontSize: '12px'
                }}
                onClick={handleViewSales}
              >
                <i className="fas fa-eye me-1"></i>
                Ver ventas
              </button>
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: '#51cbce',
                  color: 'white',
                  border: 'none',
                  fontSize: '12px'
                }}
              >
                <i className="fas fa-file-pdf me-1"></i>
                PDF
              </button>
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: '#51cbce',
                  color: 'white',
                  border: 'none',
                  fontSize: '12px'
                }}
              >
                <i className="fas fa-file-csv me-1"></i>
                CSV
              </button>
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: '#51cbce',
                  color: 'white',
                  border: 'none',
                  fontSize: '12px'
                }}
              >
                <i className="fas fa-ticket-alt me-1"></i>
                Procesar tickets de hoy
              </button>
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: '#51cbce',
                  color: 'white',
                  border: 'none',
                  fontSize: '12px'
                }}
              >
                <i className="fas fa-dollar-sign me-1"></i>
                Procesar ventas de ayer
              </button>
            </div>

            {/* Filter Toggle Buttons */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              {FILTER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: filterOption === option.value ? '#51cbce' : 'white',
                    color: filterOption === option.value ? 'white' : '#333',
                    border: '1px solid #51cbce',
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (filterOption !== option.value) {
                      e.target.style.backgroundColor = 'rgba(81, 203, 206, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterOption !== option.value) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                  onClick={() => setFilterOption(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Quick Filter */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filtrado rápido"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '300px', height: '31px', fontSize: '12px' }}
              />
            </div>

            {/* Data Table */}
            <div className="table-responsive">
              <table className="table table-striped table-hover table-bordered table-sm">
                <thead role="rowgroup">
                  <tr role="row">
                    {TABLE_COLUMNS.map((col, index) => (
                      <th
                        key={col.key}
                        role="columnheader"
                        scope="col"
                        tabIndex={['code', 'ref'].includes(col.key) ? 0 : -1}
                        aria-colindex={index + 1}
                        aria-label={['code', 'ref'].includes(col.key) ? `Click to sort ${order === 'asc' && orderBy === col.key ? 'Descending' : 'Ascending'}` : col.label}
                        aria-sort={orderBy === col.key ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
                        className={`text-${col.align}`}
                        style={{
                          cursor: ['code', 'ref'].includes(col.key) ? 'pointer' : 'default'
                        }}
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
                  <tr style={{ backgroundColor: '#e0f7fa' }}>
                    <td style={{ fontSize: '12px', fontWeight: 'bold' }}>-</td>
                    <td style={{ fontSize: '12px', fontWeight: 'bold' }}>TOTALES</td>
                    <td className="text-center" style={{ fontSize: '12px', fontWeight: 'bold' }}>-</td>
                    <td className="text-center" style={{ fontSize: '12px', fontWeight: 'bold' }}>-</td>
                    <td className="text-center" style={{ fontSize: '12px', fontWeight: 'bold' }}>-</td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold' }}>{formatCurrency(totals.total)}</td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold' }}>{formatCurrency(totals.sales)}</td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold' }}>{formatCurrency(totals.commissions)}</td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold' }}>{formatCurrency(totals.discounts)}</td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold' }}>{formatCurrency(totals.prizes)}</td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold', color: totals.net < 0 ? '#dc3545' : 'inherit' }}>
                      {formatCurrency(totals.net)}
                    </td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold' }}>{formatCurrency(totals.fall)}</td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold', color: totals.final < 0 ? '#dc3545' : 'inherit' }}>
                      {formatCurrency(totals.final)}
                    </td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold', color: totals.balance < 0 ? '#dc3545' : 'inherit' }}>
                      {formatCurrency(totals.balance)}
                    </td>
                    <td className="text-end" style={{ fontSize: '12px', fontWeight: 'bold' }}>{formatCurrency(totals.accumulatedFall)}</td>
                  </tr>
                  {filteredAndSortedData.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="text-center" style={{ fontSize: '12px' }}>
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedData.map((pool) => (
                      <tr key={pool.bettingPoolId || pool.id}>
                        <td style={{ fontSize: '12px' }}>{pool.ref}</td>
                        <td style={{ fontSize: '12px' }}>{pool.code}</td>
                        <td className="text-center" style={{ fontSize: '12px' }}>{pool.p}</td>
                        <td className="text-center" style={{ fontSize: '12px' }}>{pool.l}</td>
                        <td className="text-center" style={{ fontSize: '12px' }}>{pool.w}</td>
                        <td className="text-end" style={{ fontSize: '12px' }}>{formatCurrency(pool.total)}</td>
                        <td className="text-end" style={{ fontSize: '12px' }}>{formatCurrency(pool.sales)}</td>
                        <td className="text-end" style={{ fontSize: '12px' }}>{formatCurrency(pool.commissions)}</td>
                        <td className="text-end" style={{ fontSize: '12px' }}>{formatCurrency(pool.discounts)}</td>
                        <td className="text-end" style={{ fontSize: '12px' }}>{formatCurrency(pool.prizes)}</td>
                        <td className="text-end" style={{ fontSize: '12px', color: pool.net < 0 ? '#dc3545' : 'inherit' }}>
                          {formatCurrency(pool.net)}
                        </td>
                        <td className="text-end" style={{ fontSize: '12px' }}>{formatCurrency(pool.fall)}</td>
                        <td className="text-end" style={{ fontSize: '12px', color: pool.final < 0 ? '#dc3545' : 'inherit' }}>
                          {formatCurrency(pool.final)}
                        </td>
                        <td className="text-end" style={{ fontSize: '12px', color: pool.balance < 0 ? '#dc3545' : 'inherit' }}>
                          {formatCurrency(pool.balance)}
                        </td>
                        <td className="text-end" style={{ fontSize: '12px' }}>{formatCurrency(pool.accumulatedFall)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Entry Counter */}
            <div style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '10px' }}>
              Mostrando {filteredAndSortedData.length} de {poolsWithSalesData.length} entradas
            </div>
          </div>
        ) : activeTab === 'winner' ? (
          <div className="form-tab-container">
            <h5 style={{ color: '#51cbce', marginBottom: '20px' }}>Ganadores del día</h5>
            {renderDataTable(WINNER_COLUMNS, winnersData, false)}
            <div style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '10px' }}>
              Mostrando {winnersData.length} ganadores
            </div>
          </div>
        ) : activeTab === 'prizes' ? (
          <div className="form-tab-container">
            <h5 style={{ color: '#51cbce', marginBottom: '20px' }}>Desglose de premios por tipo de apuesta</h5>
            {renderDataTable(PRIZES_COLUMNS, filteredAndSortedData, true)}
            <div style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '10px' }}>
              Mostrando {filteredAndSortedData.length} de {poolsWithSalesData.length} entradas
            </div>
          </div>
        ) : activeTab === 'commissions' ? (
          <div className="form-tab-container">
            <h5 style={{ color: '#51cbce', marginBottom: '20px' }}>Desglose de comisiones por tipo de apuesta</h5>
            {renderDataTable(COMMISSIONS_COLUMNS, filteredAndSortedData, true)}
            <div style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '10px' }}>
              Mostrando {filteredAndSortedData.length} de {poolsWithSalesData.length} entradas
            </div>
          </div>
        ) : activeTab === 'discounts' ? (
          <div className="form-tab-container">
            <h5 style={{ color: '#51cbce', marginBottom: '20px' }}>Desglose de descuentos por categoría</h5>
            {renderDataTable(DISCOUNTS_COLUMNS, filteredAndSortedData, true)}
            <div style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '10px' }}>
              Mostrando {filteredAndSortedData.length} de {poolsWithSalesData.length} entradas
            </div>
          </div>
        ) : activeTab === 'net' ? (
          <div className="form-tab-container">
            <h5 style={{ color: '#51cbce', marginBottom: '20px' }}>Resumen de ventas netas y ganancias</h5>
            {renderDataTable(NET_COLUMNS, filteredAndSortedData, true)}
            <div style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '10px' }}>
              Mostrando {filteredAndSortedData.length} de {poolsWithSalesData.length} entradas
            </div>
          </div>
        ) : activeTab === 'tickets' ? (
          <div className="form-tab-container">
            <h5 style={{ color: '#51cbce', marginBottom: '20px' }}>Estadísticas de tickets</h5>
            {renderDataTable(TICKETS_COLUMNS, filteredAndSortedData, true)}
            <div style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '10px' }}>
              Mostrando {filteredAndSortedData.length} de {poolsWithSalesData.length} entradas
            </div>
          </div>
        ) : (
          <div className="form-tab-container text-center py-5">
            <h5 style={{ color: '#51cbce' }}>Tab "{TABS.find(t => t.id === activeTab)?.label}" - Próximamente</h5>
            <p style={{ color: '#9a9a9a', fontSize: '14px' }}>Esta funcionalidad estará disponible en una próxima actualización.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySales;
