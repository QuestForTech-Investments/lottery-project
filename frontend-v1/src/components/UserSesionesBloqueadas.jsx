import React, { useState } from 'react';

const UserSesionesBloqueadas = () => {
  const [activeTab, setActiveTab] = useState('contrasena');
  const [entriesPerPage, setEntriesPerPage] = useState('20');
  const [quickFilter, setQuickFilter] = useState('');

  // Datos vacíos por defecto (como en la imagen)
  const bloqueadosPorContrasena = [];
  const bloqueadosPorPin = [];
  const bloqueadosIP = [];

  const getCurrentData = () => {
    switch(activeTab) {
      case 'contrasena':
        return bloqueadosPorContrasena;
      case 'pin':
        return bloqueadosPorPin;
      case 'ip':
        return bloqueadosIP;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  const renderTable = () => {
    const isIPTab = activeTab === 'ip';
    
    return (
      <div>
        {/* Controles de Tabla */}
        <div className="user-sesiones-bloqueadas-table-controls">
          <div className="user-sesiones-bloqueadas-controls-container">
            <div className="user-sesiones-bloqueadas-page-select-wrapper">
              <label className="user-sesiones-bloqueadas-label">Entradas por página</label>
              <select 
                className="user-sesiones-bloqueadas-select"
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

            <div className="user-sesiones-bloqueadas-quick-filter-wrapper">
              <div className="user-sesiones-bloqueadas-input-group">
                <input 
                  type="text"
                  placeholder="Filtrado rápido"
                  className="user-sesiones-bloqueadas-input"
                  value={quickFilter}
                  onChange={(e) => setQuickFilter(e.target.value)}
                />
                <button 
                  type="button"
                  className="user-sesiones-bloqueadas-btn-clear"
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
        <div className="user-sesiones-bloqueadas-table-responsive">
          <table className="user-sesiones-bloqueadas-table">
            <thead className="user-sesiones-bloqueadas-thead">
              <tr>
                <th className="user-sesiones-bloqueadas-th">
                  {isIPTab ? 'Dirección IP' : 'Usuario'}
                </th>
                <th className="user-sesiones-bloqueadas-th">Bloqueado en</th>
                <th className="user-sesiones-bloqueadas-th">
                  {isIPTab ? 'Usuario durante el bloqueo' : 'IP durante el bloqueo'}
                </th>
                <th className="user-sesiones-bloqueadas-th">Desbloquear</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="user-sesiones-bloqueadas-empty-state">
                    <div className="user-sesiones-bloqueadas-empty-text">
                      No hay entradas disponibles
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "user-sesiones-bloqueadas-tr-even" : "user-sesiones-bloqueadas-tr-odd"}>
                    <td className="user-sesiones-bloqueadas-td">{isIPTab ? item.ip : item.usuario}</td>
                    <td className="user-sesiones-bloqueadas-td">{item.bloqueadoEn}</td>
                    <td className="user-sesiones-bloqueadas-td">{isIPTab ? item.usuario : item.ip}</td>
                    <td className="user-sesiones-bloqueadas-td">
                      <button
                        type="button"
                        className="user-sesiones-bloqueadas-btn-unlock"
                        onClick={() => alert(`Desbloquear ${isIPTab ? item.ip : item.usuario}`)}
                      >
                        Desbloquear
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="user-sesiones-bloqueadas-pagination-container">
          <div className="user-sesiones-bloqueadas-pagination-info">
            Mostrando {currentData.length} de {currentData.length} entradas
          </div>
          <div>
            <ul className="user-sesiones-bloqueadas-pagination">
              <li className="user-sesiones-bloqueadas-page-item user-sesiones-bloqueadas-page-item-disabled">
                <span className="user-sesiones-bloqueadas-page-link">«</span>
              </li>
              <li className="user-sesiones-bloqueadas-page-item user-sesiones-bloqueadas-page-item-disabled">
                <span className="user-sesiones-bloqueadas-page-link">‹</span>
              </li>
              <li className="user-sesiones-bloqueadas-page-item user-sesiones-bloqueadas-page-item-active">
                <a className="user-sesiones-bloqueadas-page-link">1</a>
              </li>
              <li className="user-sesiones-bloqueadas-page-item user-sesiones-bloqueadas-page-item-disabled">
                <span className="user-sesiones-bloqueadas-page-link">›</span>
              </li>
              <li className="user-sesiones-bloqueadas-page-item user-sesiones-bloqueadas-page-item-disabled">
                <span className="user-sesiones-bloqueadas-page-link">»</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="user-sesiones-bloqueadas-container">
      <div className="user-sesiones-bloqueadas-card">
        <div className="user-sesiones-bloqueadas-card-body">
          {/* Tabs */}
          <div className="user-sesiones-bloqueadas-tabs-container">
            <ul className="user-sesiones-bloqueadas-nav-tabs">
              <li className="user-sesiones-bloqueadas-nav-item">
                <a
                  className={`user-sesiones-bloqueadas-nav-link ${activeTab === 'contrasena' ? 'user-sesiones-bloqueadas-active' : ''}`}
                  onClick={() => setActiveTab('contrasena')}
                >
                  Por Contraseña
                </a>
              </li>
              <li className="user-sesiones-bloqueadas-nav-item">
                <a
                  className={`user-sesiones-bloqueadas-nav-link ${activeTab === 'pin' ? 'user-sesiones-bloqueadas-active' : ''}`}
                  onClick={() => setActiveTab('pin')}
                >
                  Por Pin
                </a>
              </li>
              <li className="user-sesiones-bloqueadas-nav-item">
                <a
                  className={`user-sesiones-bloqueadas-nav-link ${activeTab === 'ip' ? 'user-sesiones-bloqueadas-active' : ''}`}
                  onClick={() => setActiveTab('ip')}
                >
                  Direcciones IP
                </a>
              </li>
            </ul>

            <div className="user-sesiones-bloqueadas-tab-content">
              {renderTable()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSesionesBloqueadas;

















