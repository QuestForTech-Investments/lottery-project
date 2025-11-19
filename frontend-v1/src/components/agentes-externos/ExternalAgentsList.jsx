import React, { useState, useMemo } from 'react';

/**
 * ExternalAgentsList Component (Bootstrap V1)
 *
 * Lista y CRUD de agentes externos
 * Estructura basada en otros componentes de lista de la aplicación
 */
const ExternalAgentsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Mockup data - 10 agentes externos
  const [agents] = useState([
    { id: 1, nombre: 'Agente Norte 1', codigo: 'AN001', contacto: 'Juan Pérez', telefono: '555-0101', email: 'juan@norte1.com', comision: 15.00, activo: true },
    { id: 2, nombre: 'Agente Sur 2', codigo: 'AS002', contacto: 'María García', telefono: '555-0102', email: 'maria@sur2.com', comision: 12.50, activo: true },
    { id: 3, nombre: 'Agente Este 3', codigo: 'AE003', contacto: 'Carlos López', telefono: '555-0103', email: 'carlos@este3.com', comision: 10.00, activo: true },
    { id: 4, nombre: 'Agente Oeste 4', codigo: 'AO004', contacto: 'Ana Martínez', telefono: '555-0104', email: 'ana@oeste4.com', comision: 13.00, activo: false },
    { id: 5, nombre: 'Agente Central 5', codigo: 'AC005', contacto: 'Luis Rodríguez', telefono: '555-0105', email: 'luis@central5.com', comision: 11.50, activo: true },
    { id: 6, nombre: 'Agente Premium 6', codigo: 'AP006', contacto: 'Sofia Hernández', telefono: '555-0106', email: 'sofia@premium6.com', comision: 18.00, activo: true },
    { id: 7, nombre: 'Agente Express 7', codigo: 'AX007', contacto: 'Miguel Torres', telefono: '555-0107', email: 'miguel@express7.com', comision: 14.00, activo: true },
    { id: 8, nombre: 'Agente Rápido 8', codigo: 'AR008', contacto: 'Laura Díaz', telefono: '555-0108', email: 'laura@rapido8.com', comision: 9.50, activo: false },
    { id: 9, nombre: 'Agente Plus 9', codigo: 'AP009', contacto: 'Pedro Ramírez', telefono: '555-0109', email: 'pedro@plus9.com', comision: 16.00, activo: true },
    { id: 10, nombre: 'Agente Gold 10', codigo: 'AG010', contacto: 'Carmen Flores', telefono: '555-0110', email: 'carmen@gold10.com', comision: 20.00, activo: true }
  ]);

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = [...agents];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [agents, searchTerm, sortConfig]);

  const handleEdit = (id) => {
    console.log('Editar agente:', id);
    alert(`Editar agente #${id} (mockup)`);
  };

  const handleDelete = (id) => {
    console.log('Eliminar agente:', id);
    if (window.confirm('¿Está seguro de eliminar este agente externo?')) {
      alert(`Agente #${id} eliminado (mockup)`);
    }
  };

  const handleInfo = (id) => {
    const agent = agents.find(a => a.id === id);
    alert(`Información del agente:\n\nNombre: ${agent.nombre}\nCódigo: ${agent.codigo}\nContacto: ${agent.contacto}\nTeléfono: ${agent.telefono}\nEmail: ${agent.email}\nComisión: ${agent.comision}%\nEstado: ${agent.activo ? 'Activo' : 'Inactivo'}`);
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
          Lista de agentes externos
        </h3>

        {/* Filtro rápido */}
        <div className="mb-4" style={{ maxWidth: '400px' }}>
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
                  onClick={() => handleSort('codigo')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Código {sortConfig.key === 'codigo' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('contacto')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Contacto {sortConfig.key === 'contacto' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th>Teléfono</th>
                <th>Email</th>
                <th
                  onClick={() => handleSort('comision')}
                  style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                >
                  Comisión (%) {sortConfig.key === 'comision' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
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
              {filteredAndSortedAgents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center" style={{ padding: '40px', color: '#999' }}>
                    No se encontraron agentes externos
                  </td>
                </tr>
              ) : (
                filteredAndSortedAgents.map((agent) => (
                  <tr key={agent.id}>
                    <td>{agent.id}</td>
                    <td>{agent.nombre}</td>
                    <td><strong>{agent.codigo}</strong></td>
                    <td>{agent.contacto}</td>
                    <td>{agent.telefono}</td>
                    <td style={{ fontSize: '13px' }}>{agent.email}</td>
                    <td style={{ textAlign: 'right' }}>{agent.comision.toFixed(2)}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: agent.activo ? '#28a745' : '#dc3545',
                          color: 'white',
                          padding: '4px 12px',
                          fontSize: '12px',
                          borderRadius: '12px'
                        }}
                      >
                        {agent.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() => handleInfo(agent.id)}
                        title="Ver información"
                        style={{ fontSize: '12px' }}
                      >
                        <i className="fa fa-info-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-primary me-1"
                        onClick={() => handleEdit(agent.id)}
                        title="Editar"
                        style={{ fontSize: '12px' }}
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(agent.id)}
                        title="Eliminar"
                        style={{ fontSize: '12px' }}
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
          Mostrando {filteredAndSortedAgents.length} de {agents.length} entradas
        </div>
      </div>
    </div>
  );
};

export default ExternalAgentsList;
