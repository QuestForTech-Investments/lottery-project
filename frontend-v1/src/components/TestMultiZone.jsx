import React, { useState } from 'react'
import MultiZoneSelector from './users/MultiZoneSelector'

/**
 * Componente de prueba para validar el MultiZoneSelector
 * Simula la funcionalidad sin depender del backend
 */
const TestMultiZone = () => {
  const [selectedZones, setSelectedZones] = useState([1, 3]) // Simular zonas pre-seleccionadas
  const [formData, setFormData] = useState({
    username: "usuario_prueba",
    zoneIds: [1, 3]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('🧪 TEST - Form submitted with zones:', formData.zoneIds)
    alert(`Zonas seleccionadas: ${formData.zoneIds.join(', ')}`)
  }

  const handleZoneChange = (zoneIds) => {
    setFormData(prev => ({
      ...prev,
      zoneIds: zoneIds
    }))
    setSelectedZones(zoneIds)
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center">🧪 Prueba del MultiZoneSelector</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Usuario simulado */}
                <div className="form-group row align-items-center mb-4">
                  <label className="col-sm-3 col-form-label">
                    Usuario:
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      readOnly
                      style={{ backgroundColor: '#e9ecef' }}
                    />
                  </div>
                </div>

                {/* MultiZoneSelector */}
                <div className="form-group row align-items-start">
                  <label className="col-sm-3 col-form-label">
                    Zonas <span className="text-danger">*</span>
                  </label>
                  <div className="col-sm-9">
                    <MultiZoneSelector
                      value={formData.zoneIds}
                      onChange={handleZoneChange}
                      required={true}
                    />
                  </div>
                </div>

                {/* Información de debug */}
                <div className="mt-4 p-3 bg-light rounded">
                  <h5>🔍 Información de Debug:</h5>
                  <p><strong>Zonas seleccionadas:</strong> {formData.zoneIds.join(', ') || 'Ninguna'}</p>
                  <p><strong>Cantidad:</strong> {formData.zoneIds.length}</p>
                  <p><strong>Datos que se enviarían:</strong></p>
                  <pre className="bg-white p-2 rounded border">
{JSON.stringify({
  username: formData.username,
  zoneIds: formData.zoneIds
}, null, 2)}
                  </pre>
                </div>

                {/* Botón de prueba */}
                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-primary btn-lg">
                    🧪 Probar Envío
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestMultiZone
