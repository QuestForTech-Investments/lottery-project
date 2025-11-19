import React, { useState } from 'react';

/**
 * CreateEmailReceiver Component (Bootstrap V1)
 *
 * Formulario para crear un nuevo receptor de correo
 */
const CreateEmailReceiver = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    tipoNotificacion: '',
    activo: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Crear receptor de correo:', formData);
    alert(`Receptor de correo creado (mockup)\n\nNombre: ${formData.nombre}\nEmail: ${formData.email}\nTipo de notificación: ${formData.tipoNotificacion}\nActivo: ${formData.activo ? 'Sí' : 'No'}`);

    // Reset form
    setFormData({
      nombre: '',
      email: '',
      tipoNotificacion: '',
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
        {/* Título */}
        <h3 style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '24px',
          color: '#2c2c2c'
        }}>
          Crear receptor de correo
        </h3>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Nombre
            </label>
            <input
              type="text"
              className="form-control"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Nombre del receptor"
              required
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
              required
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Tipo de notificación */}
          <div className="mb-3">
            <label htmlFor="tipoNotificacion" className="form-label" style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}>
              Tipo de notificación
            </label>
            <select
              className="form-select"
              id="tipoNotificacion"
              name="tipoNotificacion"
              value={formData.tipoNotificacion}
              onChange={handleInputChange}
              required
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            >
              <option value="">Seleccione</option>
              <option value="Reportes diarios">Reportes diarios</option>
              <option value="Alertas de ventas">Alertas de ventas</option>
              <option value="Notificaciones de premios">Notificaciones de premios</option>
              <option value="Resumen semanal">Resumen semanal</option>
              <option value="Alertas de sistema">Alertas de sistema</option>
              <option value="Todas">Todas las notificaciones</option>
            </select>
          </div>

          {/* Activo */}
          <div className="mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="activo" style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                Receptor activo
              </label>
            </div>
          </div>

          {/* Botón Crear */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              className="btn"
              style={{
                backgroundColor: '#51cbce',
                color: 'white',
                border: 'none',
                padding: '10px 30px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500,
                borderRadius: '4px',
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

export default CreateEmailReceiver;
