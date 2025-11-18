import React, { useState, useMemo } from 'react';
import '../../assets/css/FormStyles.css';

const TransactionGroupsList = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Mockup data - 8 transaction groups
  const mockupData = [
    {
      numero: 'TG-001',
      fecha: '18/11/2025',
      hora: '09:30:00',
      creadoPor: 'admin',
      esAutomatico: 'Sí',
      notas: 'Cobro semanal a bancas zona norte'
    },
    {
      numero: 'TG-002',
      fecha: '18/11/2025',
      hora: '10:15:00',
      creadoPor: 'supervisor',
      esAutomatico: 'No',
      notas: 'Pago manual a banco principal'
    },
    {
      numero: 'TG-003',
      fecha: '18/11/2025',
      hora: '11:00:00',
      creadoPor: 'admin',
      esAutomatico: 'Sí',
      notas: 'Transacción automática de cierre diario'
    },
    {
      numero: 'TG-004',
      fecha: '17/11/2025',
      hora: '14:30:00',
      creadoPor: 'manager',
      esAutomatico: 'No',
      notas: 'Ajuste de balances zona sur'
    },
    {
      numero: 'TG-005',
      fecha: '17/11/2025',
      hora: '16:45:00',
      creadoPor: 'admin',
      esAutomatico: 'Sí',
      notas: 'Cobro automático fin de jornada'
    },
    {
      numero: 'TG-006',
      fecha: '16/11/2025',
      hora: '09:00:00',
      creadoPor: 'supervisor',
      esAutomatico: 'No',
      notas: 'Pago a proveedor de servicios'
    },
    {
      numero: 'TG-007',
      fecha: '16/11/2025',
      hora: '12:30:00',
      creadoPor: 'admin',
      esAutomatico: 'Sí',
      notas: 'Distribución automática de premios'
    },
    {
      numero: 'TG-008',
      fecha: '15/11/2025',
      hora: '18:00:00',
      creadoPor: 'manager',
      esAutomatico: 'No',
      notas: 'Cierre manual de caja fuerte'
    }
  ];

  const handleFilter = () => {
    console.log('Filtering with dates:', startDate, endDate);
    // TODO: Implementar filtrado real cuando se conecte con API
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = mockupData;

    // Quick filter
    if (quickFilter) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(quickFilter.toLowerCase())
        )
      );
    }

    // Sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [quickFilter, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <i className="fa fa-sort" style={{ opacity: 0.3, marginLeft: '5px' }}></i>;
    }
    return sortConfig.direction === 'asc' ? (
      <i className="fa fa-sort-up" style={{ marginLeft: '5px' }}></i>
    ) : (
      <i className="fa fa-sort-down" style={{ marginLeft: '5px' }}></i>
    );
  };

  return (
    <div className="create-branch-container">
      <div className="page-title">
        <h1>Lista de grupo de transacciones</h1>
      </div>

      <div className="branch-form">
        {/* Filters Section */}
        <div style={{ marginBottom: '20px' }}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label" style={{ fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Fecha inicial
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ fontSize: '14px' }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label" style={{ fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Fecha final
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ fontSize: '14px' }}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-sm w-100"
                onClick={handleFilter}
                style={{
                  background: '#51cbce',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '6px 20px',
                  borderRadius: '4px'
                }}
              >
                FILTRAR
              </button>
            </div>
          </div>
        </div>

        {/* Create Button (Top) */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            className="btn"
            style={{
              background: '#51cbce',
              color: 'white',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              padding: '8px 30px',
              borderRadius: '4px'
            }}
          >
            CREAR
          </button>
        </div>

        {/* Quick Filter */}
        <div style={{ marginBottom: '15px' }}>
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Filtro rapido"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              style={{ fontSize: '14px' }}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              style={{ fontSize: '14px' }}
            >
              <i className="fa fa-search"></i>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-sm">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th
                  onClick={() => handleSort('numero')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Número {getSortIcon('numero')}
                </th>
                <th
                  onClick={() => handleSort('fecha')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Fecha {getSortIcon('fecha')}
                </th>
                <th
                  onClick={() => handleSort('hora')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Hora {getSortIcon('hora')}
                </th>
                <th
                  onClick={() => handleSort('creadoPor')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Creado por {getSortIcon('creadoPor')}
                </th>
                <th
                  onClick={() => handleSort('esAutomatico')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  ¿Es automático? {getSortIcon('esAutomatico')}
                </th>
                <th style={{ fontSize: '14px', fontWeight: '600' }}>
                  Notas
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', fontSize: '14px' }}>
                    No hay entradas disponibles
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '14px' }}>{item.numero}</td>
                    <td style={{ fontSize: '14px' }}>{item.fecha}</td>
                    <td style={{ fontSize: '14px' }}>{item.hora}</td>
                    <td style={{ fontSize: '14px' }}>{item.creadoPor}</td>
                    <td style={{ fontSize: '14px', textAlign: 'center' }}>
                      {item.esAutomatico === 'Sí' ? (
                        <span className="badge bg-success" style={{ fontSize: '12px' }}>Sí</span>
                      ) : (
                        <span className="badge bg-secondary" style={{ fontSize: '12px' }}>No</span>
                      )}
                    </td>
                    <td style={{ fontSize: '14px' }}>{item.notas}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          Mostrando {filteredAndSortedData.length} entradas
        </div>

        {/* Create Button (Bottom) */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="btn"
            style={{
              background: '#51cbce',
              color: 'white',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              padding: '8px 30px',
              borderRadius: '4px'
            }}
          >
            CREAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionGroupsList;
