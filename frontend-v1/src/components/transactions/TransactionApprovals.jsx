import React, { useState, useMemo } from 'react';
import '../../assets/css/FormStyles.css';

const TransactionApprovals = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [quickFilter, setQuickFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedCollector, setSelectedCollector] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Mockup data - 8 transaction approvals
  const mockupData = [
    {
      id: 1,
      cobrador: 'Juan Pérez',
      revisadoPor: 'admin',
      tipo: 'COBRO',
      fecha: '18/11/2025',
      numero: 'TA-001',
      banca: 'LA CENTRAL 01',
      zonaPrimaria: 'Zona Norte',
      banco: 'Banco Principal',
      credito: 5000.00,
      debito: 0.00,
      balance: 5000.00,
      estado: 'PENDIENTE'
    },
    {
      id: 2,
      cobrador: 'María González',
      revisadoPor: 'supervisor',
      tipo: 'PAGO',
      fecha: '18/11/2025',
      numero: 'TA-002',
      banca: 'LA ESTRELLA 02',
      zonaPrimaria: 'Zona Sur',
      banco: 'Banco Secundario',
      credito: 0.00,
      debito: 3000.00,
      balance: -3000.00,
      estado: 'APROBADO'
    },
    {
      id: 3,
      cobrador: 'Carlos Rodríguez',
      revisadoPor: null,
      tipo: 'COBRO',
      fecha: '18/11/2025',
      numero: 'TA-003',
      banca: 'LA SUERTE 03',
      zonaPrimaria: 'Zona Este',
      banco: 'Banco Principal',
      credito: 7500.00,
      debito: 0.00,
      balance: 7500.00,
      estado: 'PENDIENTE'
    },
    {
      id: 4,
      cobrador: 'Ana Martínez',
      revisadoPor: 'admin',
      tipo: 'PAGO',
      fecha: '17/11/2025',
      numero: 'TA-004',
      banca: 'LA FORTUNA 04',
      zonaPrimaria: 'Zona Oeste',
      banco: 'Banco Secundario',
      credito: 0.00,
      debito: 4500.00,
      balance: -4500.00,
      estado: 'RECHAZADO'
    },
    {
      id: 5,
      cobrador: 'Luis Fernández',
      revisadoPor: 'manager',
      tipo: 'COBRO',
      fecha: '17/11/2025',
      numero: 'TA-005',
      banca: 'LA VICTORIA 05',
      zonaPrimaria: 'Zona Norte',
      banco: 'Banco Principal',
      credito: 6000.00,
      debito: 0.00,
      balance: 6000.00,
      estado: 'APROBADO'
    },
    {
      id: 6,
      cobrador: 'Sofía Torres',
      revisadoPor: null,
      tipo: 'PAGO',
      fecha: '16/11/2025',
      numero: 'TA-006',
      banca: 'LA ESPERANZA 06',
      zonaPrimaria: 'Zona Sur',
      banco: 'Banco Secundario',
      credito: 0.00,
      debito: 2500.00,
      balance: -2500.00,
      estado: 'PENDIENTE'
    },
    {
      id: 7,
      cobrador: 'Miguel Ángel',
      revisadoPor: 'supervisor',
      tipo: 'COBRO',
      fecha: '16/11/2025',
      numero: 'TA-007',
      banca: 'LA BENDICIÓN 07',
      zonaPrimaria: 'Zona Este',
      banco: 'Banco Principal',
      credito: 8000.00,
      debito: 0.00,
      balance: 8000.00,
      estado: 'APROBADO'
    },
    {
      id: 8,
      cobrador: 'Patricia Ruiz',
      revisadoPor: 'admin',
      tipo: 'PAGO',
      fecha: '15/11/2025',
      numero: 'TA-008',
      banca: 'LA PROVIDENCIA 08',
      zonaPrimaria: 'Zona Oeste',
      banco: 'Banco Secundario',
      credito: 0.00,
      debito: 5500.00,
      balance: -5500.00,
      estado: 'RECHAZADO'
    }
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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

  const getEstadoBadge = (estado) => {
    const badges = {
      'PENDIENTE': 'warning',
      'APROBADO': 'success',
      'RECHAZADO': 'danger'
    };
    return badges[estado] || 'secondary';
  };

  const handleApprove = (id) => {
    console.log('Aprobar transacción:', id);
    // TODO: Implementar cuando se conecte con API
  };

  const handleReject = (id) => {
    console.log('Rechazar transacción:', id);
    // TODO: Implementar cuando se conecte con API
  };

  return (
    <div className="create-branch-container">
      <div className="page-title">
        <h1>Lista de aprobaciones</h1>
      </div>

      <div className="branch-form">
        {/* Filters Toggle Button */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            className="btn"
            onClick={() => setShowFilters(!showFilters)}
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
            FILTROS
          </button>
        </div>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px',
            background: '#f9f9f9'
          }}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600' }}>
                  Fecha inicial
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">
                    <i className="fa fa-calendar"></i>
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600' }}>
                  Fecha final
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">
                    <i className="fa fa-calendar"></i>
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600' }}>
                  Zona
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Todas las zonas</option>
                  <option value="norte">Zona Norte</option>
                  <option value="sur">Zona Sur</option>
                  <option value="este">Zona Este</option>
                  <option value="oeste">Zona Oeste</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600' }}>
                  Banco
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Todos los bancos</option>
                  <option value="principal">Banco Principal</option>
                  <option value="secundario">Banco Secundario</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600' }}>
                  Cobrador
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nombre del cobrador"
                  value={selectedCollector}
                  onChange={(e) => setSelectedCollector(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600' }}>
                  Tipo
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Todos</option>
                  <option value="COBRO">COBRO</option>
                  <option value="PAGO">PAGO</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button
                className="btn"
                style={{
                  background: '#51cbce',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '6px 25px',
                  borderRadius: '4px'
                }}
              >
                FILTRAR
              </button>
            </div>
          </div>
        )}

        {/* Quick Filter */}
        <div style={{ marginBottom: '15px' }}>
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Filtrado rápido"
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
                  onClick={() => handleSort('cobrador')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Cobrador {getSortIcon('cobrador')}
                </th>
                <th
                  onClick={() => handleSort('revisadoPor')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Revisado por {getSortIcon('revisadoPor')}
                </th>
                <th
                  onClick={() => handleSort('tipo')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Tipo {getSortIcon('tipo')}
                </th>
                <th
                  onClick={() => handleSort('fecha')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Fecha {getSortIcon('fecha')}
                </th>
                <th
                  onClick={() => handleSort('numero')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  # {getSortIcon('numero')}
                </th>
                <th
                  onClick={() => handleSort('banca')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Banca {getSortIcon('banca')}
                </th>
                <th
                  onClick={() => handleSort('zonaPrimaria')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Zona primaria {getSortIcon('zonaPrimaria')}
                </th>
                <th
                  onClick={() => handleSort('banco')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Banco {getSortIcon('banco')}
                </th>
                <th
                  onClick={() => handleSort('credito')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}
                >
                  Crédito {getSortIcon('credito')}
                </th>
                <th
                  onClick={() => handleSort('debito')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}
                >
                  Débito {getSortIcon('debito')}
                </th>
                <th
                  onClick={() => handleSort('balance')}
                  style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}
                >
                  Balance {getSortIcon('balance')}
                </th>
                <th style={{ fontSize: '14px', fontWeight: '600', width: '140px', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '20px', fontSize: '14px' }}>
                    No hay entradas disponibles
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontSize: '14px' }}>{item.cobrador}</td>
                    <td style={{ fontSize: '14px' }}>{item.revisadoPor || '-'}</td>
                    <td style={{ fontSize: '14px' }}>
                      <span className={`badge bg-${item.tipo === 'COBRO' ? 'info' : 'warning'}`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td style={{ fontSize: '14px' }}>{item.fecha}</td>
                    <td style={{ fontSize: '14px' }}>{item.numero}</td>
                    <td style={{ fontSize: '14px' }}>{item.banca}</td>
                    <td style={{ fontSize: '14px' }}>{item.zonaPrimaria}</td>
                    <td style={{ fontSize: '14px' }}>{item.banco}</td>
                    <td style={{ fontSize: '14px', textAlign: 'right' }}>
                      ${item.credito.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '14px', textAlign: 'right' }}>
                      ${item.debito.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '14px', textAlign: 'right', fontWeight: '600' }}>
                      ${item.balance.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.estado === 'PENDIENTE' ? (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(item.id)}
                            title="Aprobar"
                            style={{ marginRight: '5px', fontSize: '12px', padding: '2px 8px' }}
                          >
                            <i className="fa fa-check"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleReject(item.id)}
                            title="Rechazar"
                            style={{ fontSize: '12px', padding: '2px 8px' }}
                          >
                            <i className="fa fa-times"></i>
                          </button>
                        </>
                      ) : (
                        <span className={`badge bg-${getEstadoBadge(item.estado)}`}>
                          {item.estado}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          Mostrando {filteredAndSortedData.length} de {mockupData.length} entradas
        </div>
      </div>
    </div>
  );
};

export default TransactionApprovals;
