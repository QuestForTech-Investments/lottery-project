import React, { useState } from 'react'
import ReactMultiselect from './users/ReactMultiselect'
import BranchSelector from './users/BranchSelector'
import '../assets/css/create-user.css'
import '../assets/css/branch-selector.css'

export default function TestToggleBranch() {
  const [selectedZones, setSelectedZones] = useState([1, 2]) // Initial selection for testing
  const [assignBanca, setAssignBanca] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)

  const handleZoneChange = (newZoneIds) => {
    setSelectedZones(newZoneIds)
    // Reset branch selection when zones change
    setSelectedBranch(null)
    console.log('TestToggleBranch - Zonas seleccionadas:', newZoneIds)
  }

  const handleToggleChange = (e) => {
    setAssignBanca(e.target.checked)
    // Reset branch selection when toggle changes
    if (!e.target.checked) {
      setSelectedBranch(null)
    }
    console.log('TestToggleBranch - Toggle asignar banca:', e.target.checked)
  }

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId)
    console.log('TestToggleBranch - Banca seleccionada:', branchId)
  }

  const handleSubmitTest = () => {
    const data = {
      zones: selectedZones,
      assignBanca: assignBanca,
      branchId: selectedBranch
    }
    console.log('TestToggleBranch - Datos a enviar:', data)
    alert(`Datos: Zonas: ${selectedZones.join(', ')}, Asignar Banca: ${assignBanca}, Banca ID: ${selectedBranch}`)
  }

  return (
    <div id="page-content" className="content">
      <div className="card card-task">
        <div className="card-header">
          <h3 className="header text-center">
            <span>Test Toggle + Branch Selector</span>
          </h3>
        </div>
        <div className="card-body">
          {/* Zones Selection */}
          <div className="form-group row align-items-start">
            <label htmlFor="testZoneIds" className="col-sm-2 offset-sm-2 col-form-label">
              Zonas
            </label>
            <div className="col-sm-6">
              <ReactMultiselect
                value={selectedZones}
                onChange={handleZoneChange}
                placeholder="Seleccionar zonas..."
                required={false}
              />
            </div>
          </div>

          {/* Assign Branch Toggle */}
          <div className="form-group row align-items-center">
            <label htmlFor="assignBanca" className="col-sm-2 offset-sm-2 col-form-label">
              Asignar Banca
            </label>
            <div className="col-sm-6">
              <label className="simple-toggle">
                <input
                  type="checkbox"
                  id="assignBanca"
                  name="assignBanca"
                  checked={assignBanca}
                  onChange={handleToggleChange}
                  disabled={selectedZones.length === 0}
                />
                <span className="simple-slider"></span>
              </label>
              {selectedZones.length === 0 && (
                <small className="text-muted d-block mt-1">
                  <i className="fas fa-info-circle"></i> Selecciona zonas primero para habilitar la asignación de banca
                </small>
              )}
            </div>
          </div>

          {/* Branch Selection */}
          {assignBanca && selectedZones.length > 0 && (
            <div className="form-group row align-items-start">
              <label htmlFor="branchId" className="col-sm-2 offset-sm-2 col-form-label">
                Banca <span className="text-danger">*</span>
              </label>
              <div className="col-sm-6">
                <BranchSelector
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  selectedZoneIds={selectedZones}
                  placeholder="Seleccionar banca..."
                  required={assignBanca}
                />
              </div>
            </div>
          )}

          <div className="form-group row align-items-center mt-4">
            <div className="col-sm-4 offset-sm-4">
              <button
                type="button"
                className="btn btn-round btn-block btn-info"
                onClick={handleSubmitTest}
              >
                Probar Envío
              </button>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="alert alert-info">
              <strong>Estado actual:</strong><br />
              Zonas seleccionadas: {selectedZones.length > 0 ? selectedZones.join(', ') : 'Ninguna'}<br />
              Asignar banca: {assignBanca ? 'Sí' : 'No'}<br />
              Banca seleccionada: {selectedBranch || 'Ninguna'}
            </div>
          </div>

          <div className="mt-3">
            <h5>Características del Toggle tipo iPhone:</h5>
            <ul className="list-unstyled">
              <li><i className="fas fa-check text-success"></i> <strong>Diseño moderno:</strong> Estilo iOS con gradientes y sombras</li>
              <li><i className="fas fa-check text-success"></i> <strong>Iconos intuitivos:</strong> ✗ (OFF) y ✓ (ON)</li>
              <li><i className="fas fa-check text-success"></i> <strong>Animaciones suaves:</strong> Transiciones con cubic-bezier</li>
              <li><i className="fas fa-check text-success"></i> <strong>Efecto pulso:</strong> Animación al activar</li>
              <li><i className="fas fa-check text-success"></i> <strong>Estados visuales:</strong> Hover, focus y disabled</li>
              <li><i className="fas fa-check text-success"></i> <strong>Color corporativo:</strong> Turquesa cuando está activo</li>
            </ul>
          </div>

          <div className="mt-3">
            <h5>Instrucciones de uso:</h5>
            <ol>
              <li><strong>Selecciona zonas</strong> en el multiselect</li>
              <li><strong>Activa el toggle</strong> "Asignar Banca" (se habilita cuando hay zonas)</li>
              <li><strong>Selecciona una banca</strong> del combo (solo muestra bancas de las zonas seleccionadas)</li>
              <li><strong>Cambia las zonas</strong> y verifica que el combo se actualiza</li>
              <li><strong>Desactiva el toggle</strong> y verifica que el combo desaparece</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
