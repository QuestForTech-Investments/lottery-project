import React, { useState, useEffect } from 'react'
import { mockZones } from '@/data/mockData'

/**
 * Multi Zone Selector Component
 * Checkbox list to select multiple zones
 * TEMPORARY: Using mock data while API endpoint is fixed
 */
const MultiZoneSelector = ({ value = [], onChange, required = false }) => {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadZones()
  }, [])

  const loadZones = async () => {
    try {
      setLoading(true)
      // TEMPORARY: Using mock data instead of API
      // TODO: Replace with API call when /api/zones endpoint is fixed
      // const response = await zoneService.getActiveZones()
      setZones(mockZones)
    } catch (err) {
      console.error('Error loading zones:', err)
      setError('Error al cargar las zonas')
    } finally {
      setLoading(false)
    }
  }

  const handleZoneChange = (zoneId, checked) => {
    if (checked) {
      // Add zone to selection
      const newValue = [...value, zoneId]
      onChange(newValue)
    } else {
      // Remove zone from selection
      const newValue = value.filter(id => id !== zoneId)
      onChange(newValue)
    }
  }

  const isZoneSelected = (zoneId) => {
    return value.includes(zoneId)
  }

  if (loading) {
    return (
      <div className="form-control" style={{ padding: '10px', backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <span className="ml-2">Cargando zonas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle"></i> {error}
      </div>
    )
  }

  return (
    <div className="multi-zone-selector">
      <div className="form-control" style={{ 
        minHeight: '120px', 
        maxHeight: '200px', 
        overflowY: 'auto',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ced4da'
      }}>
        {zones.length === 0 ? (
          <div className="text-center text-muted">
            <i className="fas fa-info-circle"></i> No hay zonas disponibles
          </div>
        ) : (
          <div className="row">
            {zones.map(zone => (
              <div key={zone.zoneId} className="col-md-6 col-lg-4 mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`zone-${zone.zoneId}`}
                    checked={isZoneSelected(zone.zoneId)}
                    onChange={(e) => handleZoneChange(zone.zoneId, e.target.checked)}
                  />
                  <label 
                    className="form-check-label" 
                    htmlFor={`zone-${zone.zoneId}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <strong>{zone.name || zone.zoneName}</strong>
                    {zone.description && (
                      <small className="d-block text-muted">{zone.description}</small>
                    )}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Selected zones summary */}
      {value.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">
            <i className="fas fa-check-circle text-success"></i> 
            {' '}Zonas seleccionadas: <strong>{value.length}</strong>
            {value.length > 0 && (
              <span className="ml-2">
                ({zones.filter(z => value.includes(z.zoneId)).map(z => z.name || z.zoneName).join(', ')})
              </span>
            )}
          </small>
        </div>
      )}
      
      {/* Required indicator - DISABLED: Zones are now optional */}
      {/* {required && value.length === 0 && (
        <div className="text-danger mt-1">
          <small><i className="fas fa-exclamation-circle"></i> Debe seleccionar al menos una zona</small>
        </div>
      )} */}
    </div>
  )
}

export default MultiZoneSelector
