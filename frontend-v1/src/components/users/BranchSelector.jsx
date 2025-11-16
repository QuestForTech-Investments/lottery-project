import React, { useState, useEffect } from 'react'
import { mockBranches } from '@/data/mockData'
import { getAllZones } from '@/services/zoneService'

const BranchSelector = ({ 
  value, 
  onChange, 
  selectedZoneIds = [], 
  placeholder = "Seleccionar banca...",
  required = false,
  disabled = false 
}) => {
  const [branches, setBranches] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load real zones and mock branches
      const [zonesResponse] = await Promise.all([
        getAllZones(),
        // TODO: Replace with real branches API when available
        Promise.resolve({ success: true, data: mockBranches })
      ])
      
      if (zonesResponse.success && zonesResponse.data) {
        setZones(zonesResponse.data)
      }
      
      // For now, use mock branches but filter by real zone IDs
      setBranches(mockBranches)
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error al cargar los datos. Verifica que la API esté corriendo.')
      // Fallback to mock data
      setBranches(mockBranches)
    } finally {
      setLoading(false)
    }
  }

  // Filter branches by selected zones and add real zone names
  const filteredBranches = branches
    .filter(branch => selectedZoneIds.length === 0 || selectedZoneIds.includes(branch.zoneId))
    .map(branch => {
      const realZone = zones.find(zone => zone.zoneId === branch.zoneId)
      return {
        ...branch,
        zoneName: realZone ? realZone.name : branch.zoneName || `Zona ${branch.zoneId}`
      }
    })

  if (loading) {
    return (
      <div className="branch-selector-container">
        <div className="branch-selector-loading">
          <i className="fas fa-spinner fa-spin"></i> Cargando bancas...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="branch-selector-container">
        <div className="branch-selector-error">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      </div>
    )
  }

  if (selectedZoneIds.length === 0) {
    return (
      <div className="branch-selector-container">
        <div className="branch-selector-info">
          <i className="fas fa-info-circle"></i> 
          Selecciona zonas primero para ver las bancas disponibles
        </div>
      </div>
    )
  }

  return (
    <div className="branch-selector-container">
      <select
        className="form-control"
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        disabled={disabled}
        required={required}
      >
        <option value="">{placeholder}</option>
        {filteredBranches.map(branch => (
          <option key={branch.branchId} value={branch.branchId}>
            {branch.name} - {branch.zoneName}
          </option>
        ))}
      </select>
      
      {filteredBranches.length === 0 && selectedZoneIds.length > 0 && (
        <div className="branch-selector-warning">
          <i className="fas fa-exclamation-triangle"></i>
          No hay bancas disponibles en las zonas seleccionadas
        </div>
      )}
      
      {filteredBranches.length > 0 && (
        <div className="branch-selector-summary">
          <small className="text-muted">
            <i className="fas fa-info-circle"></i>
            {filteredBranches.length} banca{filteredBranches.length !== 1 ? 's' : ''} disponible{filteredBranches.length !== 1 ? 's' : ''} en las zonas seleccionadas
          </small>
        </div>
      )}
    </div>
  )
}

export default BranchSelector