import React, { useState, useMemo } from 'react';
import '../../assets/css/FormStyles.css';

const TransactionsList = () => {
  const [quickFilter, setQuickFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState('');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Mockup data - 5 transactions (double-entry accounting)
  const mockupData = [
    {
      id: 1,
      concepto: 'Cobro de banca LA CENTRAL 01',
      fecha: '18/11/2025',
      hora: '09:30',
      creadoPor: 'admin',
      entidad1: 'LA CENTRAL 01',
      entidad2: 'Caja Principal',
      saldoInicialEntidad1: 10000.00,
      saldoInicialEntidad2: 50000.00,
      debito: 5000.00,
      credito: 5000.00,
      saldoFinalEntidad1: 5000.00,
      saldoFinalEntidad2: 55000.00,
      notas: 'Cobro de ventas del día'
    },
    {
      id: 2,
      concepto: 'Pago a Banco Principal',
      fecha: '18/11/2025',
      hora: '10:15',
      creadoPor: 'supervisor',
      entidad1: 'Caja Principal',
      entidad2: 'Banco Principal',
      saldoInicialEntidad1: 55000.00,
      saldoInicialEntidad2: 20000.00,
      debito: 3000.00,
      credito: 3000.00,
      saldoFinalEntidad1: 52000.00,
      saldoFinalEntidad2: 23000.00,
      notas: 'Pago de facturas'
    },
    {
      id: 3,
      concepto: 'Cobro de banca LA ESTRELLA 02',
      fecha: '18/11/2025',
      hora: '11:00',
      creadoPor: 'admin',
      entidad1: 'LA ESTRELLA 02',
      entidad2: 'Caja Principal',
      saldoInicialEntidad1: 8000.00,
      saldoInicialEntidad2: 52000.00,
      debito: 7500.00,
      credito: 7500.00,
      saldoFinalEntidad1: 500.00,
      saldoFinalEntidad2: 59500.00,
      notas: 'Cobro de ventas semanales'
    },
    {
      id: 4,
      concepto: 'Transferencia entre bancos',
      fecha: '17/11/2025',
      hora: '14:30',
      creadoPor: 'manager',
      entidad1: 'Banco Principal',
      entidad2: 'Banco Secundario',
      saldoInicialEntidad1: 23000.00,
      saldoInicialEntidad2: 15000.00,
      debito: 4500.00,
      credito: 4500.00,
      saldoFinalEntidad1: 18500.00,
      saldoFinalEntidad2: 19500.00,
      notas: 'Ajuste de saldos'
    },
    {
      id: 5,
      concepto: 'Cobro de banca LA SUERTE 03',
      fecha: '17/11/2025',
      hora: '16:45',
      creadoPor: 'admin',
      entidad1: 'LA SUERTE 03',
      entidad2: 'Caja Principal',
      saldoInicialEntidad1: 12000.00,
      saldoInicialEntidad2: 59500.00,
      debito: 6000.00,
      credito: 6000.00,
      saldoFinalEntidad1: 6000.00,
      saldoFinalEntidad2: 65500.00,
      notas: ''
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

  const handleFilter = () => {
    console.log('Filtering with:', {
      startDate,
      endDate,
      selectedEntityType,
      selectedEntity,
      selectedTransactionType,
      selectedCreatedBy,
      showNotes
    });
    // TODO: Implementar filtrado real cuando se conecte con API
  };

  const handleExportCSV = () => {
    console.log('Exporting to CSV...');
    // TODO: Implementar export CSV
  };

  const handleExportPDF = () => {
    console.log('Exporting to PDF...');
    // TODO: Implementar export PDF
  };

  return (
    <div className="create-branch-container">
      <div className="page-title">
        <h1>Lista de transacciones</h1>
      </div>

      <div className="branch-form">
        {/* Filters Section - Matches original Vue.js app */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px',
          background: '#f9f9f9'
        }}>
          {/* First Row: Dates */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', color: '#999' }}>
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

            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', color: '#999' }}>
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
          </div>

          {/* Second Row: Entity filters */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', color: '#999' }}>
                Tipo de entidad
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                style={{ fontSize: '14px', color: '#999' }}
              >
                <option value="">Seleccione</option>
                <option value="BANCA">Banca</option>
                <option value="BANCO">Banco</option>
                <option value="CAJA">Caja</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', color: '#999' }}>
                Entidad
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                style={{ fontSize: '14px', color: '#999' }}
              >
                <option value="">Seleccione</option>
                <option value="LA CENTRAL 01">LA CENTRAL 01</option>
                <option value="LA ESTRELLA 02">LA ESTRELLA 02</option>
                <option value="LA SUERTE 03">LA SUERTE 03</option>
                <option value="Banco Principal">Banco Principal</option>
                <option value="Banco Secundario">Banco Secundario</option>
                <option value="Caja Principal">Caja Principal</option>
              </select>
            </div>
          </div>

          {/* Third Row: Transaction type and Created by */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', color: '#999' }}>
                Tipo de transacción
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedTransactionType}
                onChange={(e) => setSelectedTransactionType(e.target.value)}
                style={{ fontSize: '14px', color: '#999' }}
              >
                <option value="">Seleccione</option>
                <option value="COBRO">Cobro</option>
                <option value="PAGO">Pago</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="AJUSTE">Ajuste</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', color: '#999' }}>
                Creado por
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedCreatedBy}
                onChange={(e) => setSelectedCreatedBy(e.target.value)}
                style={{ fontSize: '14px', color: '#999' }}
              >
                <option value="">Seleccione</option>
                <option value="admin">admin</option>
                <option value="supervisor">supervisor</option>
                <option value="manager">manager</option>
              </select>
            </div>
          </div>

          {/* Show Notes Toggle */}
          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="showNotesCheck"
                checked={showNotes}
                onChange={(e) => setShowNotes(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showNotesCheck" style={{ fontSize: '13px', color: '#999' }}>
                Mostrar notas
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              className="btn"
              onClick={handleFilter}
              style={{
                background: '#51cbce',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                padding: '8px 25px',
                borderRadius: '4px'
              }}
            >
              FILTRAR
            </button>
            <button
              className="btn"
              onClick={handleExportCSV}
              style={{
                background: '#51cbce',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                padding: '8px 25px',
                borderRadius: '4px'
              }}
            >
              CSV
            </button>
            <button
              className="btn"
              onClick={handleExportPDF}
              style={{
                background: '#51cbce',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                padding: '8px 25px',
                borderRadius: '4px'
              }}
            >
              PDF
            </button>
          </div>
        </div>

        {/* Quick Filter */}
        <div style={{ marginBottom: '15px' }}>
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Filtro rápido"
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

        {/* Table - Matches original Vue.js structure with 2 entities */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-sm">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th
                  onClick={() => handleSort('concepto')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', minWidth: '200px' }}
                >
                  Concepto {getSortIcon('concepto')}
                </th>
                <th
                  onClick={() => handleSort('fecha')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
                  Fecha {getSortIcon('fecha')}
                </th>
                <th
                  onClick={() => handleSort('hora')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  Hora {getSortIcon('hora')}
                </th>
                <th
                  onClick={() => handleSort('creadoPor')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
                  Creado por {getSortIcon('creadoPor')}
                </th>
                <th
                  onClick={() => handleSort('entidad1')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
                  Entidad #1 {getSortIcon('entidad1')}
                </th>
                <th
                  onClick={() => handleSort('entidad2')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
                  Entidad #2 {getSortIcon('entidad2')}
                </th>
                <th
                  onClick={() => handleSort('saldoInicialEntidad1')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}
                >
                  Saldo inicial de Entidad #1 {getSortIcon('saldoInicialEntidad1')}
                </th>
                <th
                  onClick={() => handleSort('saldoInicialEntidad2')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}
                >
                  Saldo inicial de Entidad #2 {getSortIcon('saldoInicialEntidad2')}
                </th>
                <th
                  onClick={() => handleSort('debito')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', textAlign: 'right' }}
                >
                  Débito {getSortIcon('debito')}
                </th>
                <th
                  onClick={() => handleSort('credito')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', textAlign: 'right' }}
                >
                  Crédito {getSortIcon('credito')}
                </th>
                <th
                  onClick={() => handleSort('saldoFinalEntidad1')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}
                >
                  Saldo final de Entidad #1 {getSortIcon('saldoFinalEntidad1')}
                </th>
                <th
                  onClick={() => handleSort('saldoFinalEntidad2')}
                  style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}
                >
                  Saldo final de Entidad #2 {getSortIcon('saldoFinalEntidad2')}
                </th>
                {showNotes && (
                  <th style={{ fontSize: '13px', fontWeight: '600', minWidth: '150px' }}>
                    Notas
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan={showNotes ? "13" : "12"} style={{ textAlign: 'center', padding: '20px', fontSize: '14px' }}>
                    No hay entradas disponibles
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontSize: '13px' }}>{item.concepto}</td>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{item.fecha}</td>
                    <td style={{ fontSize: '13px' }}>{item.hora}</td>
                    <td style={{ fontSize: '13px' }}>{item.creadoPor}</td>
                    <td style={{ fontSize: '13px' }}>{item.entidad1}</td>
                    <td style={{ fontSize: '13px' }}>{item.entidad2}</td>
                    <td style={{ fontSize: '13px', textAlign: 'right' }}>
                      ${item.saldoInicialEntidad1.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '13px', textAlign: 'right' }}>
                      ${item.saldoInicialEntidad2.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '13px', textAlign: 'right', color: '#dc3545' }}>
                      ${item.debito.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '13px', textAlign: 'right', color: '#28a745' }}>
                      ${item.credito.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '13px', textAlign: 'right', fontWeight: '600' }}>
                      ${item.saldoFinalEntidad1.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '13px', textAlign: 'right', fontWeight: '600' }}>
                      ${item.saldoFinalEntidad2.toFixed(2)}
                    </td>
                    {showNotes && (
                      <td style={{ fontSize: '13px', color: '#666' }}>
                        {item.notas}
                      </td>
                    )}
                  </tr>
                ))
              )}
              {/* Totals Row */}
              <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                <td colSpan={showNotes ? "9" : "8"} style={{ fontSize: '13px' }}>Totales</td>
                <td style={{ fontSize: '13px', textAlign: 'right', color: '#dc3545' }}>
                  ${filteredAndSortedData.reduce((sum, item) => sum + item.debito, 0).toFixed(2)}
                </td>
                <td style={{ fontSize: '13px', textAlign: 'right', color: '#28a745' }}>
                  ${filteredAndSortedData.reduce((sum, item) => sum + item.credito, 0).toFixed(2)}
                </td>
                <td colSpan={showNotes ? "3" : "2"}></td>
              </tr>
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

export default TransactionsList;
