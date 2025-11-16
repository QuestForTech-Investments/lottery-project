import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllZones, deactivateZone } from '@services/zoneService'
import './ZonesList.css'

/**
 * ZonesList Component
 * Displays list of zones with enhanced pagination
 * Implements "Entradas por página" selector with options: 5, 10, 20, 50, 100, Todos
 */
const ZonesList = () => {
  const navigate = useNavigate()

  // Data state
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter state
  const [searchText, setSearchText] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20) // Default from JSON: 20

  // Sorting state
  const [orderBy, setOrderBy] = useState('zoneName')
  const [order, setOrder] = useState('asc')

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [zoneToDelete, setZoneToDelete] = useState(null)

  /**
   * Load zones data
   */
  const loadZones = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getAllZones({
        page: 1,
        pageSize: 1000 // Load all zones for client-side filtering
      })

      if (response.success && response.data) {
        setZones(response.data)
      } else {
        setZones([])
      }

      setLoading(false)
    } catch (err) {
      setError(err.message || 'Error al cargar las zonas')
      console.error('Error loading zones:', err)
      setLoading(false)
    }
  }, [])

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadZones()
  }, [loadZones])

  /**
   * Filter zones by search text and active status
   */
  const filteredZones = useMemo(() => {
    return zones.filter(zone => {
      // Active filter
      const matchesActive = !showActiveOnly || zone.isActive

      // Search filter
      const searchLower = searchText.toLowerCase()
      const matchesSearch = searchText === '' ||
        zone.zoneName?.toLowerCase().includes(searchLower) ||
        zone.description?.toLowerCase().includes(searchLower) ||
        zone.zoneId?.toString().includes(searchLower)

      return matchesActive && matchesSearch
    })
  }, [zones, showActiveOnly, searchText])

  /**
   * Sort zones
   */
  const sortedZones = useMemo(() => {
    const sorted = [...filteredZones]

    sorted.sort((a, b) => {
      let aValue = a[orderBy]
      let bValue = b[orderBy]

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue?.toLowerCase()
      }

      // Handle null/undefined values
      if (aValue == null) aValue = ''
      if (bValue == null) bValue = ''

      if (order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    return sorted
  }, [filteredZones, orderBy, order])

  /**
   * Paginate zones
   */
  const paginatedZones = useMemo(() => {
    // If rowsPerPage is 0, show all zones
    if (rowsPerPage === 0) {
      return sortedZones
    }

    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return sortedZones.slice(start, end)
  }, [sortedZones, page, rowsPerPage])

  /**
   * Handle search change
   */
  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
    setPage(0)
  }

  /**
   * Handle clear search
   */
  const handleClearSearch = () => {
    setSearchText('')
    setPage(0)
  }

  /**
   * Handle active filter toggle
   */
  const handleActiveFilterToggle = () => {
    setShowActiveOnly(!showActiveOnly)
    setPage(0)
  }

  /**
   * Handle rows per page change
   */
  const handleRowsPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10)
    setRowsPerPage(value)
    setPage(0)
  }

  /**
   * Handle sort request
   */
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  /**
   * Handle edit zone
   */
  const handleEdit = (zoneId) => {
    navigate(`/zones/edit/${zoneId}`)
  }


  /**
   * Handle delete zone
   */
  const handleDeleteClick = (zone) => {
    setZoneToDelete(zone)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!zoneToDelete) return

    try {
      await deactivateZone(zoneToDelete.zoneId)
      setDeleteDialogOpen(false)
      setZoneToDelete(null)
      loadZones()
    } catch (err) {
      console.error('Error deleting zone:', err)
      alert(`Error al eliminar la zona: ${err.message}`)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setZoneToDelete(null)
  }

  /**
   * Handle create new zone
   */
  const handleCreateNew = () => {
    navigate('/zones/new')
  }

  // Calculate pagination info
  const totalZones = sortedZones.length
  const startIndex = page * rowsPerPage + 1
  const endIndex = Math.min((page + 1) * rowsPerPage, totalZones)
  const totalPages = Math.ceil(totalZones / rowsPerPage)

  return (
    <div className="zones-list-container">
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <div className="header-content">
            <h2>Gestión de Zonas</h2>
            <button className="btn btn-primary" onClick={handleCreateNew}>
              <i className="nc-icon nc-simple-add"></i> Nueva Zona
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger m-3">
            <span>{error}</span>
            <button className="btn btn-sm btn-link" onClick={loadZones}>
              Reintentar
            </button>
          </div>
        )}

        {/* Toolbar with filters and search */}
        <div className="zones-toolbar">
          {/* Active Filter */}
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="activeFilter"
              checked={showActiveOnly}
              onChange={handleActiveFilterToggle}
            />
            <label className="form-check-label" htmlFor="activeFilter">
              Solo activas
            </label>
          </div>

          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, descripción o ID..."
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
              <span className="zones-count">
                {totalZones} de {zones.length} zonas
              </span>
            )}
            <button
              className="btn btn-link btn-icon"
              onClick={loadZones}
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
            <p className="mt-3">Cargando zonas...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('zoneId')} style={{ cursor: 'pointer' }}>
                      ID {orderBy === 'zoneId' && (order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('zoneName')} style={{ cursor: 'pointer' }}>
                      Nombre {orderBy === 'zoneName' && (order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                      Descripción {orderBy === 'description' && (order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('isActive')} style={{ cursor: 'pointer' }}>
                      Estado {orderBy === 'isActive' && (order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedZones.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        {searchText || showActiveOnly
                          ? 'No se encontraron zonas que coincidan con los filtros'
                          : 'No hay zonas disponibles'}
                      </td>
                    </tr>
                  ) : (
                    paginatedZones.map((zone) => (
                      <tr key={zone.zoneId}>
                        <td>
                          <span className="badge badge-primary">{zone.zoneId}</span>
                        </td>
                        <td>
                          <strong>{zone.zoneName}</strong>
                        </td>
                        <td className="text-muted">
                          {zone.description || '-'}
                        </td>
                        <td>
                          <span className={`badge ${zone.isActive ? 'badge-success' : 'badge-secondary'}`}>
                            {zone.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => handleEdit(zone.zoneId)}
                            title="Editar zona"
                            style={{ color: '#51BCDA' }}
                          >
                            <i className="nc-icon nc-ruler-pencil"></i>
                          </button>
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => handleDeleteClick(zone)}
                            title="Eliminar zona"
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
            {paginatedZones.length > 0 && (
              <div className="pagination-container">
                <div className="pagination-controls">
                  {/* Rows per page selector - matching provided JSON structure */}
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
                      <span>Mostrando {totalZones} {totalZones === 1 ? 'entrada' : 'entradas'}</span>
                    ) : (
                      <span>{startIndex}-{endIndex} de {totalZones}</span>
                    )}
                  </div>

                  {/* Page navigation - only show if not showing all */}
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
                <h5 className="modal-title">Eliminar Zona</h5>
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
                  ¿Está seguro que desea eliminar la zona "{zoneToDelete?.zoneName}"?
                </p>
                <p className="text-muted small">
                  Esta acción desactivará la zona en el sistema.
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
  )
}

export default ZonesList
