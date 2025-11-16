import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllZones } from '@services/zoneService'
import './ManageZones.css'

/**
 * ManageZones Component
 * Form to manage all zones - assign betting pools and users with tabs
 * Uses tabs to show one zone at a time with multiselect buttons
 */
const ManageZones = () => {
  const navigate = useNavigate()

  // Loading state
  const [loading, setLoading] = useState(true)
  const [zones, setZones] = useState([])
  const [activeTab, setActiveTab] = useState(0)

  // Ref for tabs container
  const tabsContainerRef = useRef(null)

  // Search state
  const [searchText, setSearchText] = useState('')

  // Selections state - object with zoneId as key
  const [zoneSelections, setZoneSelections] = useState({})

  // UI state
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [saving, setSaving] = useState(false)

  // Mock data for betting pools (bancas)
  const mockBettingPools = Array.from({ length: 600 }, (_, i) => ({
    id: i + 1,
    name: `(${i + 1})LA CENTRAL ${String(i + 1).padStart(2, '0')}`
  }))

  // Mock data for users
  const mockUsers = [
    'AFJ', 'AG', 'ALEX', 'ALMIRENA', 'BAL', 'BB', 'BOLA', 'CABINA', 'CARITO1', 'CARITO2',
    'CAESBE', 'CARLITO', 'CARMEN', 'CB', 'CECILIA', 'CHUCHI', 'CHYNA', 'CLARIANA', 'COLLADO',
    'COOKIE', 'DAIBER', 'DUKO', 'EMER', 'ENLA', 'EJ', 'EDDY', 'ELVIA', 'ENITH', 'EM',
    'EMMANUEL', 'ELI', 'EUD', 'FELIX', 'FRANCIS', 'GENESIS', 'GERALDINE', 'GERMAN', 'GRIMALDI',
    'GT', 'GTL', 'HECTOR', 'HR', 'ISMELYNY', 'JAELIS', 'JAMES', 'JAVIER', 'JG', 'JK',
    'JM', 'JONATHAN', 'JONATHAN02', 'JORGE', 'JUAN', 'JUAMPALINO', 'KATY', 'KATYROD', 'LA',
    'LAE', 'LAMPPRIANGO', 'LAMPRIANOS21', 'LEISY', 'LIZEET', 'LOVERA', 'LP', 'LEJA', 'LUPE',
    'MELMA', 'MELVINED', 'MERCURY', 'MF', 'MHIDE', 'MIRIAN', 'MK', 'MORENA', 'MORENO',
    'MS', 'MUSELY', 'NEGRO', 'OLIVER', 'OMAR', 'POST', 'PRESTIGE', 'PRILLADA', 'RC',
    'RD', 'SAMY', 'STEVEN', 'SUSANA', 'TXA', 'YANDY', 'WALBRIN', 'WHIFER', 'WNW',
    'YE', 'YULIANA', 'YASMI', 'YO', 'YOEL', 'YOMENNY'
  ].map((username, idx) => ({
    id: idx + 1,
    username
  }))

  /**
   * Load zones data on mount
   */
  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoading(true)
        const response = await getAllZones({
          page: 1,
          pageSize: 1000
        })

        const zonesData = response.success ? response.data : response
        setZones(zonesData || [])

        // Initialize selections for each zone
        const initialSelections = {}
        zonesData.forEach(zone => {
          // TODO: Load actual selected items from API
          // For now, use empty arrays or mock data
          initialSelections[zone.zoneId] = {
            bettingPools: [],
            users: []
          }
        })
        setZoneSelections(initialSelections)

        setLoading(false)
      } catch (err) {
        setError(`Error al cargar las zonas: ${err.message}`)
        setTimeout(() => setError(null), 5000)
        setLoading(false)
      }
    }

    loadZones()
  }, [])

  /**
   * Handle betting pool button click
   */
  const handleBettingPoolToggle = (zoneId, poolId) => {
    setZoneSelections(prev => {
      const zoneData = prev[zoneId] || { bettingPools: [], users: [] }
      const bettingPools = zoneData.bettingPools || []

      const newBettingPools = bettingPools.includes(poolId)
        ? bettingPools.filter(id => id !== poolId)
        : [...bettingPools, poolId]

      return {
        ...prev,
        [zoneId]: {
          ...zoneData,
          bettingPools: newBettingPools
        }
      }
    })
  }

  /**
   * Handle user button click
   */
  const handleUserToggle = (zoneId, userId) => {
    setZoneSelections(prev => {
      const zoneData = prev[zoneId] || { bettingPools: [], users: [] }
      const users = zoneData.users || []

      const newUsers = users.includes(userId)
        ? users.filter(id => id !== userId)
        : [...users, userId]

      return {
        ...prev,
        [zoneId]: {
          ...zoneData,
          users: newUsers
        }
      }
    })
  }

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      // TODO: Replace with actual API call
      console.log('Zone Selections:', zoneSelections)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccessMessage('Cambios guardados exitosamente')
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)

      setSaving(false)
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios')
      setTimeout(() => setError(null), 5000)
      setSaving(false)
    }
  }

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    navigate('/zones/list')
  }

  /**
   * Scroll tabs left
   */
  const scrollTabsLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      })
    }
  }

  /**
   * Scroll tabs right
   */
  const scrollTabsRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      })
    }
  }

  /**
   * Filter zones based on search text
   */
  const filteredZones = zones.filter(zone =>
    zone.zoneName.toLowerCase().includes(searchText.toLowerCase()) ||
    zone.zoneId.toString().includes(searchText)
  )

  /**
   * Handle search text change
   */
  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
    // Reset to first tab when searching
    if (activeTab >= filteredZones.length) {
      setActiveTab(0)
    }
  }

  /**
   * Clear search
   */
  const handleClearSearch = () => {
    setSearchText('')
    setActiveTab(0)
  }

  // Show loading state while fetching zones
  if (loading) {
    return (
      <div className="manage-zones-container">
        <div className="card">
          <div className="card-body text-center p-5">
            <div className="spinner-border" role="status">
              <span className="sr-only">Cargando...</span>
            </div>
            <p className="mt-3">Cargando zonas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (zones.length === 0) {
    return (
      <div className="manage-zones-container">
        <div className="card">
          <div className="card-body text-center p-5">
            <p>No hay zonas disponibles</p>
            <button className="btn btn-secondary btn-round" onClick={handleCancel}>
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentZone = filteredZones[activeTab]
  const currentSelections = zoneSelections[currentZone?.zoneId] || { bettingPools: [], users: [] }

  return (
    <div className="manage-zones-container">
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <h2>Manejar Zonas</h2>
          <p className="text-muted mb-0">Asigna bancas y usuarios a cada zona</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success m-3" role="alert">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-danger m-3" role="alert">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="card-body pb-0">
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className="form-group mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="nc-icon nc-zoom-split"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar zona por nombre o ID..."
                    value={searchText}
                    onChange={handleSearchChange}
                  />
                  {searchText && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleClearSearch}
                    >
                      <i className="nc-icon nc-simple-remove"></i>
                    </button>
                  )}
                </div>
                {searchText && (
                  <small className="text-muted">
                    {filteredZones.length} zona{filteredZones.length !== 1 ? 's' : ''} encontrada{filteredZones.length !== 1 ? 's' : ''}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="zones-tabs-wrapper">
          <button
            type="button"
            className="tab-scroll-button left"
            onClick={scrollTabsLeft}
            aria-label="Scroll tabs left"
          >
            <i className="nc-icon nc-minimal-left"></i>
          </button>

          <div className="zones-tabs-container" ref={tabsContainerRef}>
            <div className="zones-tabs">
              {filteredZones.length === 0 ? (
                <div className="p-3 text-center text-muted w-100">
                  No se encontraron zonas que coincidan con "{searchText}"
                </div>
              ) : (
                filteredZones.map((zone, index) => (
                  <button
                    key={zone.zoneId}
                    className={`zone-tab ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                    type="button"
                  >
                    {zone.zoneName}
                  </button>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            className="tab-scroll-button right"
            onClick={scrollTabsRight}
            aria-label="Scroll tabs right"
          >
            <i className="nc-icon nc-minimal-right"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="manage-zones-form">
          {filteredZones.length === 0 ? (
            <div className="card-body text-center p-5">
              <p className="text-muted">No se encontraron zonas que coincidan con su búsqueda.</p>
              <button
                type="button"
                className="btn btn-outline-secondary btn-round"
                onClick={handleClearSearch}
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
          <div className="card-body">
            {/* Betting Pools Section */}
            <div className="section-container mb-4">
              <div className="section-header">
                <h5>Bancas</h5>
              </div>

              <div className="multiselect-buttons-container">
                {mockBettingPools.map((pool) => (
                  <button
                    key={pool.id}
                    type="button"
                    className={`multiselect-btn ${
                      currentSelections.bettingPools.includes(pool.id) ? 'selected' : ''
                    }`}
                    onClick={() => handleBettingPoolToggle(currentZone.zoneId, pool.id)}
                  >
                    {pool.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Section */}
            <div className="section-container mb-4">
              <div className="section-header">
                <h5>Usuarios</h5>
              </div>

              <div className="multiselect-buttons-container">
                {mockUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`multiselect-btn ${
                      currentSelections.users.includes(user.id) ? 'selected' : ''
                    }`}
                    onClick={() => handleUserToggle(currentZone.zoneId, user.id)}
                  >
                    {user.username}
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Submit Button */}
          {filteredZones.length > 0 && (
          <div className="card-footer">
            <div className="row">
              <div className="col-md-4 offset-md-4">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-round btn-block"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-round btn-block btn-info form-button"
                    disabled={saving}
                  >
                    {saving ? 'Guardando cambios...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ManageZones
