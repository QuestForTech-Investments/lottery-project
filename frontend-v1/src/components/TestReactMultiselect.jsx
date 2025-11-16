import React, { useState } from 'react'
import ReactMultiselect from './users/ReactMultiselect'

export default function TestReactMultiselect() {
  const [selectedZones, setSelectedZones] = useState([1, 3]) // Initial selection for testing

  const handleZoneChange = (newZoneIds) => {
    setSelectedZones(newZoneIds)
    console.log('TestReactMultiselect - Zonas seleccionadas:', newZoneIds)
  }

  const handleSubmitTest = () => {
    console.log('TestReactMultiselect - Datos a enviar:', { zoneIds: selectedZones })
    alert(`Zonas a enviar: ${selectedZones.join(', ')}`)
  }

  const handleClearAll = () => {
    setSelectedZones([])
  }

  const handleSelectAll = () => {
    // Mock zones IDs for testing
    setSelectedZones([1, 2, 3, 4, 5])
  }

  return (
    <div id="page-content" className="content">
      <div className="card card-task">
        <div className="card-header">
          <h3 className="header text-center">
            <span>Test React Multiselect (Vue Multiselect Style)</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="form-group row align-items-start">
            <label htmlFor="testZoneIds" className="col-sm-2 offset-sm-2 col-form-label">
              Zonas de Prueba
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

          <div className="form-group row align-items-center mt-4">
            <div className="col-sm-2 offset-sm-2">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleSelectAll}
              >
                Seleccionar Todas
              </button>
            </div>
            <div className="col-sm-2">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleClearAll}
              >
                Limpiar Todo
              </button>
            </div>
            <div className="col-sm-2">
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
              <small>Total: {selectedZones.length} zona{selectedZones.length !== 1 ? 's' : ''}</small>
            </div>
          </div>

          <div className="mt-3">
            <h5>Características del componente:</h5>
            <ul className="list-unstyled">
              <li><i className="fas fa-check text-success"></i> <strong>Tags visuales:</strong> Muestra las zonas seleccionadas como tags</li>
              <li><i className="fas fa-check text-success"></i> <strong>Búsqueda:</strong> Puedes buscar zonas escribiendo</li>
              <li><i className="fas fa-check text-success"></i> <strong>Dropdown:</strong> Lista desplegable con opciones</li>
              <li><i className="fas fa-check text-success"></i> <strong>Eliminar tags:</strong> Click en la X para quitar zonas</li>
              <li><i className="fas fa-check text-success"></i> <strong>Seleccionar todas:</strong> Botón para seleccionar todas las zonas filtradas</li>
              <li><i className="fas fa-check text-success"></i> <strong>Limpiar todo:</strong> Botón para deseleccionar todas las zonas</li>
              <li><i className="fas fa-check text-success"></i> <strong>Estados inteligentes:</strong> Los botones se deshabilitan cuando no aplican</li>
              <li><i className="fas fa-check text-success"></i> <strong>Responsive:</strong> Se adapta a diferentes tamaños de pantalla</li>
              <li><i className="fas fa-check text-success"></i> <strong>Accesibilidad:</strong> Navegación con teclado</li>
            </ul>
          </div>

          <div className="mt-3">
            <h5>Instrucciones de uso:</h5>
            <ol>
              <li><strong>Hacer clic en el campo</strong> para abrir el dropdown</li>
              <li><strong>Escribir</strong> para buscar zonas específicas</li>
              <li><strong>Hacer clic en "Seleccionar todas"</strong> para seleccionar todas las zonas visibles</li>
              <li><strong>Hacer clic en "Limpiar todo"</strong> para deseleccionar todas</li>
              <li><strong>Hacer clic en una zona</strong> para seleccionarla/deseleccionarla individualmente</li>
              <li><strong>Hacer clic en la X</strong> de un tag para eliminarlo</li>
              <li><strong>Presionar Escape</strong> para cerrar el dropdown</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
