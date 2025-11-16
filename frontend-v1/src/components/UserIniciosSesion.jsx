import React, { useState } from 'react';

const UserIniciosSesion = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [dateError, setDateError] = useState('La fecha dada no puede estar después de la fecha de hoy');
  const [selectedZones, setSelectedZones] = useState([]);
  const [activeTab, setActiveTab] = useState('bancas');
  const [entriesPerPage, setEntriesPerPage] = useState('20');
  const [quickFilter, setQuickFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const zonas = [
    'GRUPO GUYANA (JHON)',
    'GRUPO KENDRICK TL',
    'GRUPO GILBERTO TL',
    'GRUPO GUYANA (OMAR)',
    'GRUPO GUYANA (DANI)',
    'GRUPO GUYANA (EL GUARDIA)',
    'GRUPO GUYANA (COGNON)',
    'GRUPO GUYANA (ROSA KOUROU)',
    'GUYANA (JUDELAINE)',
  ];

  // Datos de ejemplo (vacío por defecto como en la imagen)
  const logsBancas = [];
  const logsColisiones = [];

  const handleFilter = () => {
    alert('Filtro aplicado');
  };

  const handleDateChange = (e) => {
    const inputDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate > today) {
      setDateError('La fecha dada no puede estar después de la fecha de hoy');
    } else {
      setDateError('');
      setSelectedDate(e.target.value);
    }
  };

  return (
    <div className="user-inicios-sesion-container">
      <div className="user-inicios-sesion-card">
        <div className="user-inicios-sesion-card-body">
          {/* Formulario de Filtros */}
          <div className="user-inicios-sesion-filter-form">
            <div className="user-inicios-sesion-filter-row">
              {/* DatePicker */}
              <div className="user-inicios-sesion-date-picker-col">
                <label className="user-inicios-sesion-label">Fecha</label>
                <div className="user-inicios-sesion-date-picker-wrapper">
                  <svg className="user-inicios-sesion-date-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                  </svg>
                  <input
                    type="date"
                    className={`user-inicios-sesion-date-picker-input ${dateError ? 'user-inicios-sesion-error' : ''}`}
                    placeholder="Fecha"
                    value={selectedDate}
                    onChange={handleDateChange}
                  />
                </div>
                {dateError && (
                  <div className="user-inicios-sesion-error-message">{dateError}</div>
                )}
              </div>

              {/* Multiselect Zonas */}
              <div className="user-inicios-sesion-multiselect-col">
                <label className="user-inicios-sesion-label">Zonas</label>
                <div className="user-inicios-sesion-multiselect-dropdown">
                  <div 
                    className="user-inicios-sesion-multiselect-tags" 
                    onClick={() => alert('Multiselect de zonas - Todos disponibles')}
                  >
                    <span className="user-inicios-sesion-placeholder">Seleccione</span>
                  </div>
                </div>
              </div>

              {/* Botón Filtrar */}
              <div className="user-inicios-sesion-filter-button-col">
                <button 
                  type="button"
                  className="user-inicios-sesion-btn-filter"
                  onClick={handleFilter}
                >
                  Filtrar
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="user-inicios-sesion-tabs-container">
            <ul className="user-inicios-sesion-nav-tabs">
              <li className="user-inicios-sesion-nav-item">
                <a
                  className={`user-inicios-sesion-nav-link ${activeTab === 'bancas' ? 'user-inicios-sesion-active' : ''}`}
                  onClick={() => setActiveTab('bancas')}
                >
                  Bancas
                </a>
              </li>
              <li className="user-inicios-sesion-nav-item">
                <a
                  className={`user-inicios-sesion-nav-link ${activeTab === 'colision' ? 'user-inicios-sesion-active' : ''}`}
                  onClick={() => setActiveTab('colision')}
                >
                  Colisión de IPs
                </a>
              </li>
            </ul>

            <div className="user-inicios-sesion-tab-content">
              {/* Tab Bancas */}
              {activeTab === 'bancas' && (
                <div className="user-inicios-sesion-tab-pane">
                  {/* Controles de Tabla */}
                  <div className="user-inicios-sesion-table-controls">
                    <div className="user-inicios-sesion-controls-container">
                      <div className="user-inicios-sesion-page-select-wrapper">
                        <label className="user-inicios-sesion-label-small">Entradas por página</label>
                        <select 
                          className="user-inicios-sesion-select"
                          value={entriesPerPage}
                          onChange={(e) => setEntriesPerPage(e.target.value)}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                          <option value="0">Todos</option>
                        </select>
                      </div>

                      <div className="user-inicios-sesion-quick-filter-wrapper">
                        <div className="user-inicios-sesion-input-group">
                          <input 
                            type="text"
                            placeholder="Filtrado rápido"
                            className="user-inicios-sesion-input"
                            value={quickFilter}
                            onChange={(e) => setQuickFilter(e.target.value)}
                          />
                          <button 
                            type="button"
                            className="user-inicios-sesion-btn-clear"
                            style={{opacity: quickFilter ? 1 : 0.5}}
                            disabled={!quickFilter}
                            onClick={() => setQuickFilter('')}
                          >
                            <svg width="16" height="16" viewBox="0 0 640 512" fill="currentColor">
                              <path d="M576 64H205.26A63.97 63.97 0 0 0 160 82.75L9.37 233.37c-12.5 12.5-12.5 32.76 0 45.25L160 429.25c12 12 28.28 18.75 45.25 18.75H576c35.35 0 64-28.65 64-64V128c0-35.35-28.65-64-64-64zm-84.69 254.06c6.25 6.25 6.25 16.38 0 22.63l-22.62 22.62c-6.25 6.25-16.38 6.25-22.63 0L384 301.25l-62.06 62.06c-6.25 6.25-16.38 6.25-22.63 0l-22.62-22.62c-6.25-6.25-6.25-16.38 0-22.63L338.75 256l-62.06-62.06c-6.25-6.25-6.25-16.38 0-22.63l22.62-22.62c6.25-6.25 16.38-6.25 22.63 0L384 210.75l62.06-62.06c6.25-6.25 16.38-6.25 22.63 0l22.62 22.62c6.25 6.25 6.25 16.38 0 22.63L429.25 256l62.06 62.06z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabla */}
                  <div className="user-inicios-sesion-table-responsive">
                    <table className="user-inicios-sesion-table">
                      <thead className="user-inicios-sesion-thead">
                        <tr>
                          <th className="user-inicios-sesion-th">Banca</th>
                          <th className="user-inicios-sesion-th">Usuario</th>
                          <th className="user-inicios-sesion-th">Primera sesión (Web)</th>
                          <th className="user-inicios-sesion-th">Última sesión (Web)</th>
                          <th className="user-inicios-sesion-th">Primera sesión (Celular)</th>
                          <th className="user-inicios-sesion-th">Última sesión (Celular)</th>
                          <th className="user-inicios-sesion-th">Primera sesión (App)</th>
                          <th className="user-inicios-sesion-th">Última sesión (App)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logsBancas.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="user-inicios-sesion-empty-state">
                              <div className="user-inicios-sesion-empty-text">
                                No hay entradas disponibles
                              </div>
                            </td>
                          </tr>
                        ) : (
                          logsBancas.map((log, index) => (
                            <tr key={index} className={index % 2 === 0 ? "user-inicios-sesion-tr-even" : "user-inicios-sesion-tr-odd"}>
                              <td className="user-inicios-sesion-td">{log.banca}</td>
                              <td className="user-inicios-sesion-td">{log.usuario}</td>
                              <td className="user-inicios-sesion-td">{log.primeraSesionWeb}</td>
                              <td className="user-inicios-sesion-td">{log.ultimaSesionWeb}</td>
                              <td className="user-inicios-sesion-td">{log.primeraSesionCelular}</td>
                              <td className="user-inicios-sesion-td">{log.ultimaSesionCelular}</td>
                              <td className="user-inicios-sesion-td">{log.primeraSesionApp}</td>
                              <td className="user-inicios-sesion-td">{log.ultimaSesionApp}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  <div className="user-inicios-sesion-pagination-container">
                    <div className="user-inicios-sesion-pagination-info">
                      Mostrando {logsBancas.length} de {logsBancas.length} entradas
                    </div>
                    <div>
                      <ul className="user-inicios-sesion-pagination">
                        <li className="user-inicios-sesion-page-item user-inicios-sesion-page-item-disabled">
                          <span className="user-inicios-sesion-page-link">«</span>
                        </li>
                        <li className="user-inicios-sesion-page-item user-inicios-sesion-page-item-disabled">
                          <span className="user-inicios-sesion-page-link">‹</span>
                        </li>
                        <li className="user-inicios-sesion-page-item user-inicios-sesion-page-item-active">
                          <a className="user-inicios-sesion-page-link">1</a>
                        </li>
                        <li className="user-inicios-sesion-page-item user-inicios-sesion-page-item-disabled">
                          <span className="user-inicios-sesion-page-link">›</span>
                        </li>
                        <li className="user-inicios-sesion-page-item user-inicios-sesion-page-item-disabled">
                          <span className="user-inicios-sesion-page-link">»</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Colisión de IPs */}
              {activeTab === 'colision' && (
                <div className="user-inicios-sesion-tab-pane">
                  <div className="user-inicios-sesion-empty-text">
                    Contenido de Colisión de IPs
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserIniciosSesion;

















