import React, { useState, useRef, useEffect } from 'react'
import { getActiveZones } from '@/services/zoneService'
import '../../assets/css/react-multiselect.css'

const ReactMultiselect = ({ 
  value = [], 
  onChange, 
  placeholder = "Seleccionar zonas...",
  required = false,
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadZones()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadZones = async () => {
    try {
      setLoading(true)
      setError(null)

      // Using real API data
      const response = await getActiveZones()

      console.log('🔵 ZONES API Response:', response)

      if (response.success && response.data) {
        // Transform API data to match expected format
        const transformedZones = response.data.map(zone => ({
          zoneId: zone.zoneId,
          zoneName: zone.zoneName,
          countryName: zone.countryName,
          isActive: zone.isActive
        }))
        console.log('🔵 Transformed zones:', transformedZones)
        setZones(transformedZones)
      } else {
        console.error('🔴 No success or no data:', response)
        setError('No se pudieron cargar las zonas')
      }
    } catch (err) {
      console.error('🔴 Error loading zones:', err)
      setError('Error al cargar las zonas. Verifica que la API esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  const filteredZones = zones.filter(zone =>
    (zone.zoneName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (zone.countryName || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedZones = zones.filter(zone => value.includes(zone.zoneId))

  const handleToggleZone = (zoneId) => {
    let newValue
    if (value.includes(zoneId)) {
      newValue = value.filter(id => id !== zoneId)
    } else {
      newValue = [...value, zoneId]
    }
    onChange(newValue)
  }

  const handleRemoveZone = (zoneId, e) => {
    e.stopPropagation()
    const newValue = value.filter(id => id !== zoneId)
    onChange(newValue)
  }

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const handleSelectAll = () => {
    const allZoneIds = filteredZones.map(zone => zone.zoneId)
    onChange(allZoneIds)
  }

  const handleClearAll = () => {
    onChange([])
  }

  const isAllSelected = filteredZones.length > 0 && filteredZones.every(zone => value.includes(zone.zoneId))
  const isSomeSelected = filteredZones.some(zone => value.includes(zone.zoneId))

  if (loading) {
    return (
      <div className="react-multiselect-container">
        <div className="react-multiselect-loading">
          <i className="fas fa-spinner fa-spin"></i> Cargando zonas...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="react-multiselect-container">
        <div className="react-multiselect-error">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="react-multiselect-container" ref={dropdownRef}>
      <div 
        className={`react-multiselect ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={handleToggleDropdown}
      >
        {/* Selected zones as tags */}
        <div className="react-multiselect__tags">
          {selectedZones.map(zone => (
            <span key={zone.zoneId} className="react-multiselect__tag">
              <span className="react-multiselect__tag-text">
                {zone.zoneName}
              </span>
              <button
                type="button"
                className="react-multiselect__tag-remove"
                onClick={(e) => handleRemoveZone(zone.zoneId, e)}
                disabled={disabled}
              >
                <i className="fas fa-times"></i>
              </button>
            </span>
          ))}
          
          {/* Search input */}
          <input
            ref={inputRef}
            type="text"
            className="react-multiselect__input"
            placeholder={selectedZones.length === 0 ? placeholder : ''}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>

        {/* Dropdown arrow */}
        <div className="react-multiselect__arrow">
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </div>
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div className="react-multiselect__content">
          {/* Action buttons */}
          {filteredZones.length > 0 && (
            <div className="react-multiselect__actions">
              <button
                type="button"
                className="react-multiselect__action-btn"
                onClick={handleSelectAll}
                disabled={isAllSelected}
              >
                <i className="fas fa-check-double"></i>
                {isAllSelected ? 'Todas seleccionadas' : 'Seleccionar todas'}
              </button>
              <button
                type="button"
                className="react-multiselect__action-btn"
                onClick={handleClearAll}
                disabled={!isSomeSelected}
              >
                <i className="fas fa-times"></i>
                Limpiar todo
              </button>
            </div>
          )}

          {filteredZones.length === 0 ? (
            <div className="react-multiselect__no-options">
              <i className="fas fa-search"></i>
              {searchTerm ? 'No se encontraron zonas' : 'No hay zonas disponibles'}
            </div>
          ) : (
            <ul className="react-multiselect__options">
              {filteredZones.map(zone => (
                <li
                  key={zone.zoneId}
                  className={`react-multiselect__option ${
                    value.includes(zone.zoneId) ? 'is-selected' : ''
                  }`}
                  onClick={() => handleToggleZone(zone.zoneId)}
                >
                  <div className="react-multiselect__option-content">
                    <div className="react-multiselect__option-title">
                      {zone.zoneName}
                    </div>
                    {zone.countryName && (
                      <div className="react-multiselect__option-description">
                        {zone.countryName}
                      </div>
                    )}
                  </div>
                  {value.includes(zone.zoneId) && (
                    <div className="react-multiselect__option-check">
                      <i className="fas fa-check"></i>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Summary */}
      {value.length > 0 && (
        <div className="react-multiselect__summary">
          <small className="text-muted">
            <i className="fas fa-info-circle"></i> 
            {value.length} zona{value.length !== 1 ? 's' : ''} seleccionada{value.length !== 1 ? 's' : ''}
          </small>
        </div>
      )}
    </div>
  )
}

export default ReactMultiselect
