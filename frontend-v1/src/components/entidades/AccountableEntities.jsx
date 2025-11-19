import React, { useState } from 'react';

const AccountableEntities = () => {
  const [activeTab, setActiveTab] = useState('bancas');
  const [quickFilter, setQuickFilter] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  // Mockup data - Bancas (137 total, showing first 20)
  const bancas = [
    { id: 220, nombre: 'CARIBBEAN 186', codigo: 'LAN-0186', balance: 610.26, caida: 0.00, prestamo: 0.00 },
    { id: 232, nombre: 'CARIBBEAN 198', codigo: 'LAN-0198', balance: 700.86, caida: 0.00, prestamo: 0.00 },
    { id: 10967, nombre: 'CARIBBEAN 264', codigo: 'LAN-0264', balance: 499.84, caida: 0.00, prestamo: 0.00 },
    { id: 11093, nombre: 'CARIBBEAN 278', codigo: 'LAN-0278', balance: 462.60, caida: 0.00, prestamo: 0.00 },
    { id: 11094, nombre: 'CARIBBEAN 279', codigo: 'LAN-0279', balance: 600.16, caida: 0.00, prestamo: 0.00 },
    { id: 11099, nombre: 'CARIBBEAN 284', codigo: 'LAN-0284', balance: 549.01, caida: 0.00, prestamo: 0.00 },
    { id: 11109, nombre: 'CARIBBEAN 294', codigo: 'LAN-0294', balance: 395.76, caida: 0.00, prestamo: 200.00 },
    { id: 42652, nombre: 'CARIBBEAN 380', codigo: 'LAN-0380', balance: 68.12, caida: 0.00, prestamo: 500.00 },
    { id: 90, nombre: 'LA CENTRAL 63', codigo: 'LAN-0063', balance: 930.73, caida: 0.00, prestamo: 0.00 },
    { id: 28, nombre: 'LA CENTRAL 01', codigo: 'LAN-0001', balance: 139.26, caida: 0.00, prestamo: 0.00 },
    { id: 37, nombre: 'LA CENTRAL 10', codigo: 'LAN-0010', balance: 796.85, caida: 0.00, prestamo: 0.00 },
    { id: 133, nombre: 'LA CENTRAL 101', codigo: 'LAN-0101', balance: 1492.80, caida: 0.00, prestamo: 0.00 },
    { id: 153, nombre: 'LA CENTRAL 119', codigo: 'LAN-0119', balance: 349.60, caida: 0.00, prestamo: 0.00 },
    { id: 169, nombre: 'LA CENTRAL 135', codigo: 'LAN-0135', balance: 499.20, caida: -1739.20, prestamo: 0.00 },
    { id: 180, nombre: 'LA CENTRAL 146', codigo: 'LAN-0146', balance: 825.40, caida: 0.00, prestamo: 0.00 },
    { id: 195, nombre: 'LA CENTRAL 161', codigo: 'LAN-0161', balance: 654.30, caida: 0.00, prestamo: 100.00 },
    { id: 201, nombre: 'LA CENTRAL 167', codigo: 'LAN-0167', balance: 1125.75, caida: 0.00, prestamo: 0.00 },
    { id: 215, nombre: 'LA CENTRAL 181', codigo: 'LAN-0181', balance: 432.90, caida: 0.00, prestamo: 0.00 },
    { id: 228, nombre: 'LA CENTRAL 194', codigo: 'LAN-0194', balance: 789.50, caida: 0.00, prestamo: 0.00 },
    { id: 241, nombre: 'LA CENTRAL 207', codigo: 'LAN-0207', balance: 563.25, caida: 0.00, prestamo: 0.00 }
  ];

  const empleados = []; // Empty in original
  const bancos = []; // Empty in original
  const zonas = []; // Empty in original
  const otros = []; // Empty in original

  const getCurrentData = () => {
    switch (activeTab) {
      case 'bancas': return bancas;
      case 'empleados': return empleados;
      case 'bancos': return bancos;
      case 'zonas': return zonas;
      case 'otros': return otros;
      default: return [];
    }
  };

  const filteredData = getCurrentData().filter(item => {
    const searchText = quickFilter.toLowerCase();
    return (
      item.nombre?.toLowerCase().includes(searchText) ||
      item.codigo?.toLowerCase().includes(searchText) ||
      item.zona?.toLowerCase().includes(searchText)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleEdit = (id) => {
    console.log('Edit entity:', id);
    alert(`Editar entidad ${id} (mockup)`);
  };

  const formatCurrency = (amount) => {
    const formatted = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const getColumns = () => {
    switch (activeTab) {
      case 'bancas':
        return ['nombre', 'codigo', 'balance', 'caida', 'prestamo'];
      case 'empleados':
        return ['nombre', 'codigo', 'balance', 'prestamo', 'zona'];
      case 'bancos':
      case 'zonas':
        return ['nombre', 'codigo', 'balance', 'zona'];
      case 'otros':
        return ['nombre', 'codigo'];
      default:
        return [];
    }
  };

  const getColumnLabel = (col) => {
    const labels = {
      nombre: 'Nombre',
      codigo: 'Código',
      balance: 'Balance',
      caida: 'Caída acumulada',
      prestamo: 'Préstamo',
      zona: 'Zona'
    };
    return labels[col] || col;
  };

  const getTabTitle = () => {
    const titles = {
      bancas: 'Bancas',
      empleados: 'Empleados',
      bancos: 'Bancos',
      zonas: 'Zonas',
      otros: 'Otros'
    };
    return titles[activeTab];
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
        {/* Tabs */}
        <ul className="nav nav-tabs" style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'bancas' ? 'active' : ''}`}
              onClick={() => { setActiveTab('bancas'); setQuickFilter(''); }}
              style={{
                border: 'none',
                background: activeTab === 'bancas' ? '#51cbce' : 'transparent',
                color: activeTab === 'bancas' ? 'white' : '#51cbce',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px'
              }}
            >
              Bancas
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'empleados' ? 'active' : ''}`}
              onClick={() => { setActiveTab('empleados'); setQuickFilter(''); }}
              style={{
                border: 'none',
                background: activeTab === 'empleados' ? '#51cbce' : 'transparent',
                color: activeTab === 'empleados' ? 'white' : '#51cbce',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px'
              }}
            >
              Empleados
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'bancos' ? 'active' : ''}`}
              onClick={() => { setActiveTab('bancos'); setQuickFilter(''); }}
              style={{
                border: 'none',
                background: activeTab === 'bancos' ? '#51cbce' : 'transparent',
                color: activeTab === 'bancos' ? 'white' : '#51cbce',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px'
              }}
            >
              Bancos
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'zonas' ? 'active' : ''}`}
              onClick={() => { setActiveTab('zonas'); setQuickFilter(''); }}
              style={{
                border: 'none',
                background: activeTab === 'zonas' ? '#51cbce' : 'transparent',
                color: activeTab === 'zonas' ? 'white' : '#51cbce',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px'
              }}
            >
              Zonas
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'otros' ? 'active' : ''}`}
              onClick={() => { setActiveTab('otros'); setQuickFilter(''); }}
              style={{
                border: 'none',
                background: activeTab === 'otros' ? '#51cbce' : 'transparent',
                color: activeTab === 'otros' ? 'white' : '#51cbce',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px'
              }}
            >
              Otros
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div style={{ padding: '20px 0' }}>
          {/* Título */}
          <h3 style={{
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '24px',
            fontWeight: 500,
            color: '#2c2c2c',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {getTabTitle()}
          </h3>

          {/* Quick Filter */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <input
                type="text"
                placeholder="Filtrado rápido"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 35px 6px 10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <i className="fa fa-search" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover" style={{ fontSize: '14px' }}>
              <thead style={{ backgroundColor: '#f5f5f5' }}>
                <tr>
                  {getColumns().map(col => (
                    <th
                      key={col}
                      style={{ fontSize: '12px', color: '#787878', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleSort(col)}
                    >
                      {getColumnLabel(col)} {sortBy === col && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                  ))}
                  <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length > 0 ? (
                  sortedData.map((item) => (
                    <tr key={item.id}>
                      {getColumns().map(col => (
                        <td key={col} style={{
                          color: col === 'caida' && item[col] < 0 ? '#dc3545' : '#2c2c2c'
                        }}>
                          {['balance', 'caida', 'prestamo'].includes(col)
                            ? formatCurrency(item[col])
                            : item[col]}
                        </td>
                      ))}
                      <td style={{ textAlign: 'center' }}>
                        <i
                          className="fa fa-edit"
                          onClick={() => handleEdit(item.id)}
                          style={{ color: '#51cbce', cursor: 'pointer', fontSize: '16px' }}
                        ></i>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={getColumns().length + 1} style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      No hay entradas disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '10px' }}>
            Mostrando {sortedData.length} {getCurrentData().length > sortedData.length ? `de ${getCurrentData().length}` : ''} entradas
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountableEntities;
