import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSortitions, deleteSortition } from '../services/sortitionService';
import { getBranches } from '../services/branchService';
import './SorteosList.css';

/**
 * SorteosList Component
 * Displays list of betting pool draws with pagination
 */
const SorteosList = () => {
  const navigate = useNavigate();

  // Data state
  const [draws, setDraws] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Sorting state
  const [orderBy, setOrderBy] = useState('lotteryName');
  const [order, setOrder] = useState('asc');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [drawToDelete, setDrawToDelete] = useState(null);

  /**
   * Load draws and branches data
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load draws
      const drawsResponse = await getAllSortitions();  // Using legacy wrapper
      if (drawsResponse.success && drawsResponse.data) {
        setDraws(drawsResponse.data);
      } else {
        setDraws([]);
      }

      // Load branches for filter
      const branchesResponse = await getBranches({ page: 1, pageSize: 1000 });
      if (branchesResponse.data) {
        setBranches(branchesResponse.data);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al cargar los sorteos');
      console.error('Error loading draws:', err);
      setLoading(false);
    }
  }, []);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Filter draws by search text and branch
   */
  const filteredDraws = useMemo(() => {
    return draws.filter(draw => {
      // Branch filter
      const matchesBranch = !selectedBranch || draw.bettingPoolId === parseInt(selectedBranch);

      // Search filter
      const searchLower = searchText.toLowerCase();
      const matchesSearch = searchText === '' ||
        draw.lotteryName?.toLowerCase().includes(searchLower) ||
        draw.bettingPoolName?.toLowerCase().includes(searchLower) ||
        (draw.drawId || draw.sortitionId)?.toString().includes(searchLower);

      return matchesBranch && matchesSearch;
    });
  }, [draws, selectedBranch, searchText]);

  /**
   * Sort draws
   */
  const sortedDraws = useMemo(() => {
    const sorted = [...filteredDraws];

    sorted.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [filteredDraws, orderBy, order]);

  /**
   * Paginate draws
   */
  const paginatedDraws = useMemo(() => {
    if (rowsPerPage === 0) {
      return sortedDraws;
    }

    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedDraws.slice(start, end);
  }, [sortedDraws, page, rowsPerPage]);

  /**
   * Handle search change
   */
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setPage(0);
  };

  /**
   * Handle clear search
   */
  const handleClearSearch = () => {
    setSearchText('');
    setPage(0);
  };

  /**
   * Handle branch filter change
   */
  const handleBranchFilterChange = (e) => {
    setSelectedBranch(e.target.value);
    setPage(0);
  };

  /**
   * Handle rows per page change
   */
  const handleRowsPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  /**
   * Handle sort request
   */
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Handle edit sortition
   */
  const handleEdit = (sortitionId) => {
    navigate(`/sorteos/editar/${sortitionId}`);
  };

  /**
   * Handle delete draw
   */
  const handleDeleteClick = (draw) => {
    setDrawToDelete(draw);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!drawToDelete) return;

    try {
      await deleteSortition(drawToDelete.sortitionId);
      setDeleteDialogOpen(false);
      setDrawToDelete(null);
      loadData();
    } catch (err) {
      console.error('Error deleting draw:', err);
      alert(`Error al eliminar el sorteo: ${err.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDrawToDelete(null);
  };

  /**
   * Handle create new sortition
   */
  const handleCreateNew = () => {
    navigate('/sorteos/crear');
  };

  // Calculate pagination info
  const totalDraws = sortedDraws.length;
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, totalDraws);
  const totalPages = Math.ceil(totalDraws / rowsPerPage);

  /**
   * Format game types for display
   */
  const formatGameTypes = (gameTypes) => {
    if (!gameTypes || gameTypes.length === 0) return '-';
    return gameTypes.map(gt => gt.gameTypeName).join(', ');
  };

  return (
    <div className="sorteos-list-container">
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <div className="header-content">
            <h2>Gestión de Sorteos</h2>
            <button className="btn btn-primary" onClick={handleCreateNew}>
              <i className="nc-icon nc-simple-add"></i> Nuevo Sorteo
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger m-3">
            <span>{error}</span>
            <button className="btn btn-sm btn-link" onClick={loadData}>
              Reintentar
            </button>
          </div>
        )}

        {/* Toolbar with filters and search */}
        <div className="sorteos-toolbar">
          {/* Branch Filter */}
          <div className="filter-group">
            <label htmlFor="branchFilter" className="filter-label">Banca:</label>
            <select
              id="branchFilter"
              className="form-select-custom"
              value={selectedBranch}
              onChange={handleBranchFilterChange}
            >
              <option value="">Todas las bancas</option>
              {branches.map((branch) => (
                <option key={branch.bettingPoolId} value={branch.bettingPoolId}>
                  {branch.bettingPoolName}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por lotería, banca o ID..."
              value={searchText}
              onChange={handleSearchChange}
            />
            {searchText && (
              <button className="clear-btn" onClick={handleClearSearch}>
                <i className="nc-icon nc-simple-remove"></i>
              </button>
            )}
          </div>

          {/* Stats and Refresh */}
          <div className="toolbar-actions">
            {!loading && (
              <span className="sorteos-count">
                {totalDraws} de {draws.length} sorteos
              </span>
            )}
            <button
              className="btn btn-link btn-icon"
              onClick={loadData}
              disabled={loading}
              title="Actualizar lista"
            >
              <i className="nc-icon nc-refresh-69"></i>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center p-5">
            <div className="spinner-border" role="status">
              <span className="sr-only">Cargando...</span>
            </div>
            <p className="mt-3">Cargando sorteos...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('sortitionId')} style={{ cursor: 'pointer' }}>
                      ID {orderBy === 'sortitionId' && (order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('bettingPoolName')} style={{ cursor: 'pointer' }}>
                      Banca {orderBy === 'bettingPoolName' && (order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('lotteryName')} style={{ cursor: 'pointer' }}>
                      Lotería {orderBy === 'lotteryName' && (order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>
                      Tipos de Juegos
                    </th>
                    <th>
                      Estado
                    </th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDraws.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        {searchText || selectedBranch
                          ? 'No se encontraron sorteos que coincidan con los filtros'
                          : 'No hay sorteos configurados'}
                      </td>
                    </tr>
                  ) : (
                    paginatedDraws.map((draw) => (
                      <tr key={draw.bettingPoolDrawId || draw.sortitionId || draw.drawId}>
                        <td>
                          <span className="badge badge-primary">{draw.bettingPoolDrawId || draw.sortitionId}</span>
                        </td>
                        <td>
                          <strong>{draw.bettingPoolName || '-'}</strong>
                        </td>
                        <td>
                          {draw.lotteryName || '-'}
                        </td>
                        <td className="text-muted">
                          {formatGameTypes(draw.gameTypes)}
                        </td>
                        <td>
                          <span className={`badge ${draw.isActive ? 'badge-success' : 'badge-secondary'}`}>
                            {draw.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => handleEdit(draw.bettingPoolDrawId || draw.sortitionId)}
                            title="Editar sorteo"
                            style={{ color: '#51BCDA' }}
                          >
                            <i className="nc-icon nc-ruler-pencil"></i>
                          </button>
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => handleDeleteClick(draw)}
                            title="Eliminar sorteo"
                            style={{ color: '#FF7043', marginLeft: '8px' }}
                          >
                            <i className="nc-icon nc-simple-remove"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paginatedDraws.length > 0 && (
              <div className="pagination-container">
                <div className="pagination-controls">
                  {/* Rows per page selector */}
                  <div className="rows-per-page">
                    <label htmlFor="pageInput" className="pagination-label">
                      Entradas por página:
                    </label>
                    <select
                      id="pageInput"
                      name="pageInput"
                      className="form-select-custom"
                      value={rowsPerPage}
                      onChange={handleRowsPerPageChange}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="0">Todos</option>
                    </select>
                  </div>

                  {/* Page info */}
                  <div className="page-info">
                    {rowsPerPage === 0 ? (
                      <span>Mostrando {totalDraws} {totalDraws === 1 ? 'entrada' : 'entradas'}</span>
                    ) : (
                      <span>{startIndex}-{endIndex} de {totalDraws}</span>
                    )}
                  </div>

                  {/* Page navigation */}
                  {rowsPerPage !== 0 && (
                    <div className="page-navigation">
                      <button
                        className="btn btn-link btn-sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                      >
                        <i className="nc-icon nc-minimal-left"></i>
                      </button>
                      <span className="page-number">
                        Página {page + 1} de {totalPages}
                      </span>
                      <button
                        className="btn btn-link btn-sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages - 1}
                      >
                        <i className="nc-icon nc-minimal-right"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar Sorteo</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleDeleteCancel}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  ¿Está seguro que desea eliminar la configuración del sorteo "{drawToDelete?.lotteryName}"
                  en la banca "{drawToDelete?.bettingPoolName}"?
                </p>
                <p className="text-muted small">
                  Esta acción eliminará la configuración del sorteo del sistema.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDeleteCancel}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SorteosList;
