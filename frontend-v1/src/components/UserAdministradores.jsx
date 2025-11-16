import React, { useState } from 'react';
import PasswordModal from './modals/PasswordModal';

const UserAdministradores = () => {
  const [entriesPerPage, setEntriesPerPage] = useState('20');
  const [quickFilter, setQuickFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');

  const administradores = [
    { username: 'la', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'juanpaulino', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'jose', requiereCambio: false, tieneRestablecimiento: true },
    { username: 'cecilia', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'dl', requiereCambio: true, tieneRestablecimiento: false },
    { username: 'rg', requiereCambio: true, tieneRestablecimiento: false },
    { username: 'gf', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'jm', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'sairy', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'ag', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'yd', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'daysi', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'afj', requiereCambio: false, tieneRestablecimiento: true },
    { username: 'wandy', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'cintia', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'felix', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'oliver', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'cb', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'bola', requiereCambio: false, tieneRestablecimiento: true },
    { username: 'genesis', requiereCambio: true, tieneRestablecimiento: false },
  ];

  const filteredAdministradores = administradores.filter(admin => 
    admin.username.toLowerCase().includes(quickFilter.toLowerCase())
  );

  const itemsPerPage = entriesPerPage === '0' ? filteredAdministradores.length : parseInt(entriesPerPage);
  const totalPages = Math.ceil(filteredAdministradores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedAdministradores = filteredAdministradores.slice(startIndex, startIndex + itemsPerPage);

  const handlePassword = (username) => {
    setSelectedUsername(username);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUsername('');
  };

  return (
    <div className="user-administradores-container">
      <div className="user-administradores-card">
        <div className="user-administradores-card-header">
          <h3 className="user-administradores-header-text">Administradores</h3>
        </div>

        <div className="user-administradores-card-body">
          {/* Controles de Tabla */}
          <div className="user-administradores-table-controls">
            <div className="user-administradores-controls-container">
              <div className="user-administradores-page-select-wrapper">
                <label className="user-administradores-label">Entradas por página</label>
                <select 
                  className="user-administradores-select"
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="0">Todos</option>
                </select>
              </div>

              <div className="user-administradores-quick-filter-wrapper">
                <div className="user-administradores-input-group">
                  <input 
                    type="text"
                    placeholder="Filtrado rápido"
                    className="user-administradores-input"
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                  />
                  <button 
                    type="button"
                    className="user-administradores-btn-clear"
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
          <div className="user-administradores-table-responsive">
            <table className="user-administradores-table">
              <thead className="user-administradores-thead">
                <tr>
                  <th className="user-administradores-th">Nombre de usuario</th>
                  <th className="user-administradores-th">Requiere cambio de contraseña</th>
                  <th className="user-administradores-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedAdministradores.map((admin, index) => (
                  <tr key={admin.username} className={index % 2 === 0 ? "user-administradores-tr-even" : "user-administradores-tr-odd"}>
                    <td className="user-administradores-td">{admin.username}</td>
                    <td className="user-administradores-td">
                      {admin.requiereCambio && (
                        <svg width="16" height="16" viewBox="0 0 512 512" fill="#28a745">
                          <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/>
                        </svg>
                      )}
                    </td>
                    <td className="user-administradores-td">
                      <div className="user-administradores-actions-container">
                        <button 
                          type="button"
                          className="user-administradores-btn-action"
                          onClick={() => handlePassword(admin.username)}
                        >
                          <svg width="14" height="14" viewBox="0 0 512 512" fill="white">
                            <path d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z"/>
                          </svg>
                        </button>
                        
                        {admin.tieneRestablecimiento && (
                          <button 
                            type="button"
                            className="user-administradores-btn-reset"
                            onClick={() => alert(`Restablecer contraseña para ${admin.username}`)}
                          >
                            <svg width="14" height="14" viewBox="0 0 512 512" fill="white" style={{marginRight: '5px'}}>
                              <path d="M440.65 12.57l4 82.77A247.16 247.16 0 0 0 255.83 8C134.73 8 33.91 94.92 12.29 209.82A12 12 0 0 0 24.09 224h49.05a12 12 0 0 0 11.67-9.26 175.91 175.91 0 0 1 317-56.94l-101.46-4.86a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12H500a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12h-47.37a12 12 0 0 0-11.98 12.57zM255.83 432a175.61 175.61 0 0 1-146-77.8l101.8 4.87a12 12 0 0 0 12.57-12v-47.4a12 12 0 0 0-12-12H12a12 12 0 0 0-12 12V500a12 12 0 0 0 12 12h47.35a12 12 0 0 0 12-12.6l-4.15-82.57A247.17 247.17 0 0 0 255.83 504c121.11 0 221.93-86.92 243.55-201.82a12 12 0 0 0-11.8-14.18h-49.05a12 12 0 0 0-11.67 9.26A175.86 175.86 0 0 1 255.83 432z"/>
                            </svg>
                            Restablecer Contraseña
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="user-administradores-pagination-container">
            <div className="user-administradores-pagination-info">
              Mostrando {filteredAdministradores.length} de {administradores.length} entradas
            </div>
            <div>
              <ul className="user-administradores-pagination">
                <li className={`user-administradores-page-item ${currentPage === 1 ? 'user-administradores-page-item-disabled' : ''}`}>
                  <a 
                    className="user-administradores-page-link"
                    onClick={() => currentPage > 1 && setCurrentPage(1)}
                  >«</a>
                </li>
                <li className={`user-administradores-page-item ${currentPage === 1 ? 'user-administradores-page-item-disabled' : ''}`}>
                  <a 
                    className="user-administradores-page-link"
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  >‹</a>
                </li>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <li 
                      key={pageNum}
                      className={`user-administradores-page-item ${currentPage === pageNum ? 'user-administradores-page-item-active' : ''}`}
                    >
                      <a 
                        className="user-administradores-page-link"
                        onClick={() => setCurrentPage(pageNum)}
                      >{pageNum}</a>
                    </li>
                  );
                })}
                <li className={`user-administradores-page-item ${currentPage === totalPages ? 'user-administradores-page-item-disabled' : ''}`}>
                  <a 
                    className="user-administradores-page-link"
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  >›</a>
                </li>
                <li className={`user-administradores-page-item ${currentPage === totalPages ? 'user-administradores-page-item-disabled' : ''}`}>
                  <a 
                    className="user-administradores-page-link"
                    onClick={() => currentPage < totalPages && setCurrentPage(totalPages)}
                  >»</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de contraseña */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        username={selectedUsername}
      />
    </div>
  );
};

export default UserAdministradores;

















