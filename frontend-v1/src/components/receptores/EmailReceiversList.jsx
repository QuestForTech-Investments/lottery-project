import React, { useState, useMemo } from 'react';

/**
 * EmailReceiversList Component (Bootstrap V1)
 *
 * Lista de receptores de correo con funcionalidad CRUD
 */
const EmailReceiversList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Mockup data - 10 receptores de correo
  const [receivers] = useState([
    { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@empresa.com', tipoNotificacion: 'Reportes diarios', activo: true },
    { id: 2, nombre: 'María García', email: 'maria.garcia@empresa.com', tipoNotificacion: 'Alertas de ventas', activo: true },
    { id: 3, nombre: 'Carlos López', email: 'carlos.lopez@empresa.com', tipoNotificacion: 'Notificaciones de premios', activo: true },
    { id: 4, nombre: 'Ana Martínez', email: 'ana.martinez@empresa.com', tipoNotificacion: 'Resumen semanal', activo: false },
    { id: 5, nombre: 'Luis Rodríguez', email: 'luis.rodriguez@empresa.com', tipoNotificacion: 'Alertas de sistema', activo: true },
    { id: 6, nombre: 'Sofia Hernández', email: 'sofia.hernandez@empresa.com', tipoNotificacion: 'Todas las notificaciones', activo: true },
    { id: 7, nombre: 'Miguel Torres', email: 'miguel.torres@empresa.com', tipoNotificacion: 'Reportes diarios', activo: true },
    { id: 8, nombre: 'Laura Díaz', email: 'laura.diaz@empresa.com', tipoNotificacion: 'Alertas de ventas', activo: false },
    { id: 9, nombre: 'Pedro Ramírez', email: 'pedro.ramirez@empresa.com', tipoNotificacion: 'Resumen semanal', activo: true },
    { id: 10, nombre: 'Carmen Flores', email: 'carmen.flores@empresa.com', tipoNotificacion: 'Todas las notificaciones', activo: true }
  ]);

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort receivers
  const filteredAndSortedReceivers = useMemo(() => {
    let filtered = [...receivers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(receiver =>
        receiver.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receiver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receiver.tipoNotificacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [receivers, searchTerm, sortConfig]);

  const handleEdit = (id) => {
    console.log('Editar receptor:', id);
    alert(`Editar receptor #${id} (mockup)`);
  };

  const handleDelete = (id) => {
    console.log('Eliminar receptor:', id);
    if (window.confirm('¿Está seguro de eliminar este receptor de correo?')) {
      alert(`Receptor #${id} eliminado (mockup)`);
    }
  };

  const handleInfo = (id) => {
    const receiver = receivers.find(r => r.id === id);
    alert(`Información del receptor:\n\nNombre: ${receiver.nombre}\nEmail: ${receiver.email}\nTipo de notificación: ${receiver.tipoNotificacion}\nEstado: ${receiver.activo ? 'Activo' : 'Inactivo'}`);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '1400px',
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
          Lista de receptores de correo
        </h3>

        {/* Filtro rápido */}
        <div className="mb-3" style={{ maxWidth: '400px' }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Filtrado rápido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
            />
            <span className="input-group-text" style={{ backgroundColor: 'white' }}>
              <i className="fa fa-search" style={{ color: '#999' }}></i>
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="table table-hover" style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  # {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('nombre')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Nombre {sortConfig.key === 'nombre' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('email')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Correo electrónico {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('tipoNotificacion')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Tipo de notificación {sortConfig.key === 'tipoNotificacion' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('activo')}
                  style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
                >
                  Estado {sortConfig.key === 'activo' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedReceivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: '40px', color: '#999' }}>
                    No se encontraron receptores de correo
                  </td>
                </tr>
              ) : (
                filteredAndSortedReceivers.map((receiver) => (
                  <tr key={receiver.id}>
                    <td>{receiver.id}</td>
                    <td>{receiver.nombre}</td>
                    <td style={{ fontSize: '13px' }}>{receiver.email}</td>
                    <td>{receiver.tipoNotificacion}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className={`badge ${receiver.activo ? 'bg-success' : 'bg-danger'}`}
                        style={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {receiver.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleInfo(receiver.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#17a2b8',
                          marginRight: '5px'
                        }}
                        title="Ver información"
                      >
                        <i className="fa fa-info-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleEdit(receiver.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#007bff',
                          marginRight: '5px'
                        }}
                        title="Editar"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDelete(receiver.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#dc3545'
                        }}
                        title="Eliminar"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '20px',
          paddingTop: '15px',
          borderTop: '1px solid #dee2e6',
          fontSize: '14px',
          color: '#666',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Mostrando {filteredAndSortedReceivers.length} de {receivers.length} entradas
        </div>
      </div>
    </div>
  );
};

export default EmailReceiversList;
