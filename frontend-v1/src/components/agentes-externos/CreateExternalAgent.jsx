import React, { useState } from 'react';

/**
 * CreateExternalAgent Component (Bootstrap V1)
 *
 * Formulario para crear un nuevo agente externo
 * Basado en la estructura típica de la aplicación
 */
const CreateExternalAgent = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    contacto: '',
    telefono: '',
    email: '',
    comision: '',
    activo: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Crear agente externo:', formData);
    alert(`Agente externo creado (mockup)\nNombre: ${formData.nombre}\nCódigo: ${formData.codigo}\nContacto: ${formData.contacto}`);
    // Reset form
    setFormData({
      nombre: '',
      codigo: '',
      contacto: '',
      telefono: '',
      email: '',
      comision: '',
      activo: true
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        <h3 style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '24px',
          color: '#2c2c2c'
        }}>
          Crear agente externo
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Nombre *
            </label>
            <input
              type="text"
              className="form-control"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre del agente externo"
              required
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Código */}
          <div className="mb-3">
            <label htmlFor="codigo" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Código *
            </label>
            <input
              type="text"
              className="form-control"
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Código único del agente"
              required
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Contacto */}
          <div className="mb-3">
            <label htmlFor="contacto" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Nombre de contacto *
            </label>
            <input
              type="text"
              className="form-control"
              id="contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              placeholder="Persona de contacto"
              required
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Teléfono */}
          <div className="mb-3">
            <label htmlFor="telefono" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Teléfono
            </label>
            <input
              type="tel"
              className="form-control"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Número de teléfono"
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Comisión */}
          <div className="mb-3">
            <label htmlFor="comision" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Comisión (%)
            </label>
            <input
              type="number"
              className="form-control"
              id="comision"
              name="comision"
              value={formData.comision}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="100"
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Activo */}
          <div className="mb-4 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="activo" style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
              Activo
            </label>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="btn"
              style={{
                backgroundColor: '#51cbce',
                color: 'white',
                border: 'none',
                padding: '10px 40px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500,
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'none'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#45b8bb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#51cbce'}
            >
              CREAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExternalAgent;
