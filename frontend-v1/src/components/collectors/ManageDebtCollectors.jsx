import React, { useState } from 'react';

const ManageDebtCollectors = () => {
  const [quickFilter, setQuickFilter] = useState('');
  const [formData, setFormData] = useState({
    usuario: '',
    bancas: '',
    zonas: '',
    bancos: ''
  });

  // Mockup data
  const [collectors, setCollectors] = useState([
    { id: 1, usuario: 'lanfranco', bancas: '', bancos: 'BANCO LA CENTRAL' },
    { id: 2, usuario: 'maria', bancas: 'LA CENTRAL 01, LA CENTRAL 02', bancos: 'BANCO POPULAR' },
    { id: 3, usuario: 'jose', bancas: 'BANCA NORTE', bancos: 'BANCO BHD' }
  ]);

  const filteredCollectors = collectors.filter(c =>
    c.usuario.toLowerCase().includes(quickFilter.toLowerCase()) ||
    c.bancas.toLowerCase().includes(quickFilter.toLowerCase()) ||
    c.bancos.toLowerCase().includes(quickFilter.toLowerCase())
  );

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgregar = () => {
    if (!formData.usuario || !formData.bancos) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const newCollector = {
      id: collectors.length + 1,
      usuario: formData.usuario,
      bancas: formData.bancas,
      bancos: formData.bancos
    };

    setCollectors([...collectors, newCollector]);

    // Reset form
    setFormData({
      usuario: '',
      bancas: '',
      zonas: '',
      bancos: ''
    });

    alert('Cobrador agregado exitosamente');
  };

  const handleEdit = (id) => {
    console.log('Edit collector:', id);
    alert(`Editar cobrador ${id} (mockup)`);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este cobrador?')) {
      setCollectors(collectors.filter(c => c.id !== id));
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '30px' }}>
        {/* Título */}
        <h3 style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '24px',
          fontWeight: 500,
          color: '#2c2c2c',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Manejo de cobradores
        </h3>

        {/* Formulario */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
          {/* Usuario */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Usuario</label>
            <select
              value={formData.usuario}
              onChange={(e) => handleFormChange('usuario', e.target.value)}
              className="form-select"
              style={{ fontSize: '14px' }}
            >
              <option value="">Seleccione</option>
              <option value="admin">admin</option>
              <option value="carlos">carlos</option>
              <option value="pedro">pedro</option>
              <option value="ana">ana</option>
            </select>
          </div>

          {/* Bancas */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Bancas</label>
            <select
              value={formData.bancas}
              onChange={(e) => handleFormChange('bancas', e.target.value)}
              className="form-select"
              style={{ fontSize: '14px' }}
            >
              <option value="">Seleccione</option>
              <option value="LA CENTRAL 01">LA CENTRAL 01</option>
              <option value="LA CENTRAL 02">LA CENTRAL 02</option>
              <option value="BANCA NORTE">BANCA NORTE</option>
              <option value="BANCA SUR">BANCA SUR</option>
            </select>
          </div>

          {/* Zonas */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Zonas</label>
            <select
              value={formData.zonas}
              onChange={(e) => handleFormChange('zonas', e.target.value)}
              className="form-select"
              style={{ fontSize: '14px' }}
            >
              <option value="">Seleccione</option>
              <option value="Zona Norte">Zona Norte</option>
              <option value="Zona Sur">Zona Sur</option>
              <option value="Zona Este">Zona Este</option>
              <option value="Zona Oeste">Zona Oeste</option>
            </select>
          </div>

          {/* Bancos */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px' }}>Bancos</label>
            <select
              value={formData.bancos}
              onChange={(e) => handleFormChange('bancos', e.target.value)}
              className="form-select"
              style={{ fontSize: '14px' }}
            >
              <option value="">Seleccione</option>
              <option value="BANCO LA CENTRAL">BANCO LA CENTRAL</option>
              <option value="BANCO POPULAR">BANCO POPULAR</option>
              <option value="BANCO BHD">BANCO BHD</option>
            </select>
          </div>
        </div>

        {/* Botón Agregar */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={handleAgregar}
            style={{
              backgroundColor: '#51cbce',
              color: 'white',
              border: 'none',
              padding: '10px 40px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#45b8bb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#51cbce'}
          >
            AGREGAR
          </button>
        </div>

        {/* Quick Filter */}
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <input
              type="text"
              placeholder="Filtrado rápido"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 35px 6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <i className="fa fa-search" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover" style={{ fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Usuario</th>
                <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Bancas</th>
                <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600 }}>Bancos</th>
                <th style={{ fontSize: '12px', color: '#787878', fontWeight: 600, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollectors.length > 0 ? (
                filteredCollectors.map((collector) => (
                  <tr key={collector.id}>
                    <td>{collector.usuario}</td>
                    <td>{collector.bancas}</td>
                    <td>{collector.bancos}</td>
                    <td style={{ textAlign: 'center' }}>
                      <i
                        className="fa fa-edit"
                        onClick={() => handleEdit(collector.id)}
                        style={{ color: '#28a745', cursor: 'pointer', marginRight: '15px' }}
                      ></i>
                      <i
                        className="fa fa-trash"
                        onClick={() => handleDelete(collector.id)}
                        style={{ color: '#dc3545', cursor: 'pointer' }}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    No hay entradas disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '10px' }}>
          Mostrando {filteredCollectors.length} de {collectors.length} entradas
        </div>
      </div>
    </div>
  );
};

export default ManageDebtCollectors;
