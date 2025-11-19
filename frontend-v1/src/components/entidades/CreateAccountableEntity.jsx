import React, { useState } from 'react';

const CreateAccountableEntity = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    tipoEntidad: '',
    zona: ''
  });

  // Mockup data
  const tiposEntidad = [
    { id: 1, nombre: 'Banca' },
    { id: 2, nombre: 'Empleado' },
    { id: 3, nombre: 'Banco' },
    { id: 4, nombre: 'Zona' },
    { id: 5, nombre: 'Otro' }
  ];

  const zonas = [
    { id: 1, nombre: 'Zona Norte' },
    { id: 2, nombre: 'Zona Sur' },
    { id: 3, nombre: 'Zona Este' },
    { id: 4, nombre: 'Zona Oeste' },
    { id: 5, nombre: 'Centro' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Crear entidad:', formData);
    alert(`Entidad creada (mockup):\nNombre: ${formData.nombre}\nCódigo: ${formData.codigo}\nTipo: ${formData.tipoEntidad}\nZona: ${formData.zona}`);

    // Reset form
    setFormData({
      nombre: '',
      codigo: '',
      tipoEntidad: '',
      zona: ''
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Título */}
        <h3 style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '24px',
          fontWeight: 500,
          color: '#2c2c2c',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Crear entidad contable
        </h3>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              color: '#787878',
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            />
          </div>

          {/* Código */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              color: '#787878',
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Código
            </label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Código"
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            />
          </div>

          {/* Tipo de entidad */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              color: '#787878',
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Tipo de entidad
            </label>
            <select
              name="tipoEntidad"
              value={formData.tipoEntidad}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                backgroundColor: 'white'
              }}
            >
              <option value="">Seleccione</option>
              {tiposEntidad.map(tipo => (
                <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>
              ))}
            </select>
          </div>

          {/* Zona */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              color: '#787878',
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Zona
            </label>
            <select
              name="zona"
              value={formData.zona}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                backgroundColor: 'white'
              }}
            >
              <option value="">Seleccione</option>
              {zonas.map(zona => (
                <option key={zona.id} value={zona.nombre}>{zona.nombre}</option>
              ))}
            </select>
          </div>

          {/* Botón Crear */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#51cbce',
                color: 'white',
                border: 'none',
                padding: '10px 40px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'uppercase'
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

export default CreateAccountableEntity;
