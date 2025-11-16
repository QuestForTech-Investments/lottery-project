import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services';
import * as logger from '@/utils/logger';
import PasswordModal from "./modals/PasswordModal";

export default function UserList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userFilter, setUserFilter] = useState("");
  const [quickFilter, setQuickFilter] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState("");

  // Load users from API on component mount and when returning to this page
  useEffect(() => {
    loadUsers();
    
    // Also reload when window gains focus (user returns from another tab/page)
    const handleFocus = () => {
      logger.info('USER_LIST', 'Page focused, reloading users...');
      loadUsers();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('USER_LIST', 'Loading users from API...');
      
      const response = await userService.getAllUsers({
        page: 1,
        pageSize: 1000 // Get all users
      });
      
      if (response.success && response.data) {
        setUsers(response.data);
        logger.success('USER_LIST', `✅ Loaded ${response.data.length} users`);
      } else {
        setError('No se pudieron cargar los usuarios');
        logger.warning('USER_LIST', 'API response success=false');
      }
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
      logger.error('USER_LIST', 'Failed to load users', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const searchText = `${user.username} ${user.fullName || ''} ${user.email || ''}`.toLowerCase();
    const matchesUserFilter = searchText.includes(userFilter.toLowerCase());
    const matchesQuickFilter = searchText.includes(quickFilter.toLowerCase());
    return matchesUserFilter && matchesQuickFilter;
  });

  const handleEdit = (userId) => {
    logger.info('USER_LIST', `Editing user ID: ${userId}`);
    navigate(`/usuarios/editar/${userId}`);
  };

  const handlePassword = (username) => {
    setSelectedUsername(username);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUsername("");
  };

  const handleRefresh = () => {
    loadUsers();
  };

  return (
    <div id="page-content" className="content">
      <div>
        <div className="card card-task">
          <div className="card-header">
            <h3 className="header text-center">
              <span>Lista de usuarios</span>
            </h3>
          </div>
          
          <div className="card-body">
            {/* Loading state */}
            {loading && (
              <div className="text-center mb-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Cargando usuarios...</span>
                </div>
                <p className="mt-2">Cargando usuarios desde la API...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
                <button 
                  className="btn btn-sm btn-primary ml-3"
                  onClick={handleRefresh}
                >
                  🔄 Reintentar
                </button>
              </div>
            )}

            {/* Refresh button */}
            {!loading && !error && (
              <div className="mb-3 text-right">
                <button 
                  className="btn btn-sm btn-info"
                  onClick={handleRefresh}
                >
                  🔄 Actualizar Lista
                </button>
              </div>
            )}

            {/* Filtros */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="filter-label">Filtrado por usuario</label>
                  <input
                    type="search"
                    className="form-control search-input"
                    placeholder="Buscar..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="filter-label">Filtro rápido</label>
                  <input
                    type="search"
                    className="form-control search-input"
                    placeholder="Buscar..."
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="user-table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th className="sortable">
                      Usuario
                      <i className="fas fa-sort sort-icon"></i>
                    </th>
                    <th>Estado</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && !loading ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.userId}>
                        <td>{user.userId}</td>
                        <td className="username-cell">{user.username}</td>
                        <td>
                          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-secondary'}`}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="actions-cell">
                          <button
                            className="btn btn-action btn-password"
                            onClick={() => handlePassword(user.username)}
                            title="Cambiar contraseña"
                          >
                            <i className="fas fa-key"></i>
                          </button>
                          <button
                            className="btn btn-action btn-edit"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEdit(user.userId);
                            }}
                            title="Editar usuario"
                            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Contador de entradas */}
            <div className="entries-count">
              Mostrando {filteredUsers.length} entradas
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
}
