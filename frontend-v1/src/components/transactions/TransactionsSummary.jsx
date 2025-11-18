import { useState, useMemo } from 'react';
import '../../assets/css/FormStyles.css';
import '../../assets/css/CreateBranchGeneral.css';

const TransactionsSummary = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedZones, setSelectedZones] = useState([]);
  const [quickFilter, setQuickFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Mockup data para la tabla principal
  const mockupData = [
    {
      id: 1,
      codigo: 'LAN-0009',
      banca: 'admin',
      zona: 'Zona Norte',
      cobros: 5000.00,
      pagos: 2000.00,
      netoFlujo: 3000.00,
      debito: 1500.00,
      credito: 4500.00,
      netoSorteo: 3000.00,
      caida: 'DIARIA'
    },
    {
      id: 2,
      codigo: 'LAN-0010',
      banca: 'LA CENTRAL 01',
      zona: 'Zona Sur',
      cobros: 7500.00,
      pagos: 3000.00,
      netoFlujo: 4500.00,
      debito: 2000.00,
      credito: 6000.00,
      netoSorteo: 4000.00,
      caida: 'MENSUAL'
    },
    {
      id: 3,
      codigo: 'LAN-0020',
      banca: 'LA ESTRELLA 02',
      zona: 'Zona Este',
      cobros: 6000.00,
      pagos: 2500.00,
      netoFlujo: 3500.00,
      debito: 1800.00,
      credito: 5200.00,
      netoSorteo: 3400.00,
      caida: 'SEMANAL'
    },
    {
      id: 4,
      codigo: 'LAN-0021',
      banca: 'LA SUERTE 03',
      zona: 'Zona Oeste',
      cobros: 8000.00,
      pagos: 3500.00,
      netoFlujo: 4500.00,
      debito: 2200.00,
      credito: 6800.00,
      netoSorteo: 4600.00,
      caida: 'DIARIA'
    },
    {
      id: 5,
      codigo: 'LAN-0022',
      banca: 'LA FORTUNA 04',
      zona: 'Zona Norte',
      cobros: 9000.00,
      pagos: 4000.00,
      netoFlujo: 5000.00,
      debito: 2500.00,
      credito: 7500.00,
      netoSorteo: 5000.00,
      caida: 'MENSUAL'
    },
  ];

  // Mockup data para la segunda tabla
  const otherTransactions = {
    retirosEfectivo: 1500.00,
    debito: 500.00,
    credito: 2000.00
  };

  // Filtrar datos
  const filteredData = useMemo(() => {
    return mockupData.filter(item => {
      const matchesQuickFilter = quickFilter === '' ||
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(quickFilter.toLowerCase())
        );
      return matchesQuickFilter;
    });
  }, [quickFilter]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Calcular totales
  const totals = useMemo(() => {
    return sortedData.reduce((acc, item) => ({
      cobros: acc.cobros + item.cobros,
      pagos: acc.pagos + item.pagos,
      netoFlujo: acc.netoFlujo + item.netoFlujo,
      debito: acc.debito + item.debito,
      credito: acc.credito + item.credito,
      netoSorteo: acc.netoSorteo + item.netoSorteo,
      caida: acc.caida + (item.caida === 'DIARIA' ? 1 : 0)
    }), {
      cobros: 0,
      pagos: 0,
      netoFlujo: 0,
      debito: 0,
      credito: 0,
      netoSorteo: 0,
      caida: 0
    });
  }, [sortedData]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleFilter = () => {
    console.log('Filtering with:', { startDate, endDate, selectedZones });
  };

  return (
    <div className="create-branch-container">
      <div className="page-title">
        <h1>Resumen de transacciones</h1>
      </div>

      {/* Filtros */}
      <div className="branch-form" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Fecha inicial</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Fecha final</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Zonas</label>
              <select
                className="form-control"
                multiple
                value={selectedZones}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions);
                  setSelectedZones(options.map(opt => opt.value));
                }}
              >
                <option value="zona-norte">Zona Norte</option>
                <option value="zona-sur">Zona Sur</option>
                <option value="zona-este">Zona Este</option>
                <option value="zona-oeste">Zona Oeste</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleFilter}
            className="btn"
            style={{
              backgroundColor: '#51cbce',
              color: 'white',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            FILTRAR
          </button>
        </div>
      </div>

      {/* Quick filter */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Filtro rápido"
          value={quickFilter}
          onChange={(e) => setQuickFilter(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <button
          className="btn btn-sm"
          style={{
            backgroundColor: '#51cbce',
            color: 'white',
            border: 'none',
            padding: '6px 12px'
          }}
        >
          <i className="fa fa-search"></i>
        </button>
      </div>

      {/* Tabla principal */}
      <div style={{ overflowX: 'auto', marginBottom: '40px' }}>
        <table className="table table-bordered table-hover">
          <thead>
            {/* Primera fila de headers - agrupados */}
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th rowSpan="2" style={{ verticalAlign: 'middle', textAlign: 'center' }}>Código</th>
              <th rowSpan="2" style={{ verticalAlign: 'middle', textAlign: 'center' }}>Banca</th>
              <th rowSpan="2" style={{ verticalAlign: 'middle', textAlign: 'center' }}>Zona</th>
              <th colSpan="3" style={{ textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Flujo de caja</th>
              <th colSpan="3" style={{ textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Resultados de Sorteo</th>
              <th rowSpan="2" style={{ verticalAlign: 'middle', textAlign: 'center' }}>Caída</th>
            </tr>
            {/* Segunda fila de headers - columnas detalladas */}
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('cobros')}>
                Cobros {getSortIcon('cobros')}
              </th>
              <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('pagos')}>
                Pagos {getSortIcon('pagos')}
              </th>
              <th style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#d1ecf1' }} onClick={() => handleSort('netoFlujo')}>
                Neto {getSortIcon('netoFlujo')}
              </th>
              <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('debito')}>
                Débito {getSortIcon('debito')}
              </th>
              <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('credito')}>
                Crédito {getSortIcon('credito')}
              </th>
              <th style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#d1ecf1' }} onClick={() => handleSort('netoSorteo')}>
                Neto {getSortIcon('netoSorteo')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No hay entradas disponibles
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr key={item.id}>
                  <td>{item.codigo}</td>
                  <td>{item.banca}</td>
                  <td>{item.zona}</td>
                  <td style={{ textAlign: 'right' }}>${item.cobros.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>${item.pagos.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: '#d1ecf1' }}>
                    ${item.netoFlujo.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>${item.debito.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>${item.credito.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: '#d1ecf1' }}>
                    ${item.netoSorteo.toFixed(2)}
                  </td>
                  <td>{item.caida}</td>
                </tr>
              ))
            )}
            {/* Fila de totales */}
            <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
              <td colSpan="3">Totales</td>
              <td style={{ textAlign: 'right' }}>${totals.cobros.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>${totals.pagos.toFixed(2)}</td>
              <td style={{ textAlign: 'right', backgroundColor: '#d1ecf1' }}>
                ${totals.netoFlujo.toFixed(2)}
              </td>
              <td style={{ textAlign: 'right' }}>${totals.debito.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>${totals.credito.toFixed(2)}</td>
              <td style={{ textAlign: 'right', backgroundColor: '#d1ecf1' }}>
                ${totals.netoSorteo.toFixed(2)}
              </td>
              <td style={{ textAlign: 'right' }}>${totals.caida.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
          Mostrando {sortedData.length} de {sortedData.length} entradas
        </div>
      </div>

      {/* Segunda tabla - Resumen otras transacciones */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#333' }}>
          Resumen otras transacciones
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-bordered">
            <thead>
              {/* Primera fila de headers */}
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th colSpan="3" style={{ textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                  Ajustes
                </th>
              </tr>
              {/* Segunda fila de headers */}
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ textAlign: 'center' }}>Retiros de efectivo</th>
                <th style={{ textAlign: 'center' }}>Débito</th>
                <th style={{ textAlign: 'center' }}>Crédito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: 'right' }}>${otherTransactions.retirosEfectivo.toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>${otherTransactions.debito.toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>${otherTransactions.credito.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsSummary;
