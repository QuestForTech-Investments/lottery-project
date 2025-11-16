import React, { useState, useEffect } from 'react'
import { mockZones } from '@/data/mockData'

/**
 * Zone Selector Component
 * Dropdown to select a zone
 * TEMPORARY: Using mock data while API endpoint is fixed
 */
const ZoneSelector = ({ value, onChange, required = false }) => {
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

  if (loading) {
    return (
      <select className="form-control" disabled>
        <option>Cargando zonas...</option>
      </select>
    )
  }

  if (error) {
    return (
      <select className="form-control" disabled>
        <option>{error}</option>
      </select>
    )
  }

  return (
    <select
      className="form-control"
      value={value || ''}
      onChange={(e) => onChange(parseInt(e.target.value) || null)}
      required={required}
    >
      <option value="">Seleccione una zona</option>
      {zones.map(zone => (
        <option key={zone.zoneId} value={zone.zoneId}>
          {zone.name || zone.zoneName}
        </option>
      ))}
    </select>
  )
}

export default ZoneSelector

