import React, { useState } from 'react';
import '../../assets/css/FormStyles.css';

const ExpenseCategories = () => {
  const [activeTab, setActiveTab] = useState('parent');
  const [quickFilter, setQuickFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Mockup data - Parent categories
  const parentCategoriesData = [
    { id: 1, nombre: 'DIETA' },
    { id: 2, nombre: 'EQUIPOS' },
    { id: 3, nombre: 'MATERIAL GASTABLE' },
    { id: 4, nombre: 'RENTA' },
    { id: 5, nombre: 'SALARIO' },
    { id: 6, nombre: 'SERVICIOS' },
    { id: 7, nombre: 'TRANSPORTE' }
  ];

  // Mockup data - Child categories
  const childCategoriesData = [
    { id: 1, nombre: 'Almuerzos', parentId: 1 },
    { id: 2, nombre: 'Cenas', parentId: 1 },
    { id: 3, nombre: 'Computadoras', parentId: 2 },
    { id: 4, nombre: 'Impresoras', parentId: 2 },
    { id: 5, nombre: 'Papel', parentId: 3 },
    { id: 6, nombre: 'Tinta', parentId: 3 },
    { id: 7, nombre: 'Local comercial', parentId: 4 },
    { id: 8, nombre: 'Bodega', parentId: 4 }
  ];

  const currentData = activeTab === 'parent' ? parentCategoriesData : childCategoriesData;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (category) => {
    console.log('Editar categoría:', category);
    // TODO: Implementar modal de edición
  };

  const handleDelete = (category) => {
    console.log('Eliminar categoría:', category);
    // TODO: Implementar confirmación de eliminación
  };

  const handleCreate = () => {
    console.log('Crear nueva categoría');
    // TODO: Implementar modal de creación
  };

  // Filter and sort data
  let filteredData = currentData;

  if (quickFilter) {
    filteredData = currentData.filter((item) =>
      item.nombre.toLowerCase().includes(quickFilter.toLowerCase())
    );
  }

  if (sortConfig.key) {
    filteredData = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="card">
        <div className="card-body">
          {/* Title */}
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c2c2c' }}>
            Lista de Categorías de gastos
          </h3>

          {/* Tabs */}
          <ul className="nav nav-tabs" style={{ marginBottom: '20px' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'parent' ? 'active' : ''}`}
                onClick={() => setActiveTab('parent')}
                style={{
                  backgroundColor: activeTab === 'parent' ? '#51cbce' : 'transparent',
                  color: activeTab === 'parent' ? 'white' : '#51cbce',
                  border: '1px solid #51cbce',
                  cursor: 'pointer'
                }}
              >
                Categorias padre
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'child' ? 'active' : ''}`}
                onClick={() => setActiveTab('child')}
                style={{
                  backgroundColor: activeTab === 'child' ? '#51cbce' : 'transparent',
                  color: activeTab === 'child' ? 'white' : '#51cbce',
                  border: '1px solid #51cbce',
                  cursor: 'pointer'
                }}
              >
                Categorias hijo
              </button>
            </li>
          </ul>

          {/* Quick Filter */}
          <div className="mb-3" style={{ maxWidth: '300px' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text">
                <i className="nc-icon nc-zoom-split"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrado rápido"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-sm">
              <thead style={{ backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th
                    onClick={() => handleSort('nombre')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Nombre{' '}
                    {sortConfig.key === 'nombre' && (
                      <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay entradas disponibles
                    </td>
                  </tr>
                ) : (
                  filteredData.map((category) => (
                    <tr key={category.id}>
                      <td>{category.nombre}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-sm btn-link"
                          onClick={() => handleEdit(category)}
                          title="Editar"
                          style={{ color: '#51cbce', marginRight: '8px', padding: '2px 6px' }}
                        >
                          <i className="nc-icon nc-ruler-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(category)}
                          title="Eliminar"
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                        >
                          <i className="nc-icon nc-simple-remove" style={{ marginRight: '4px' }}></i>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Create Button */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              className="btn btn-info"
              onClick={handleCreate}
              style={{
                backgroundColor: '#51cbce',
                borderColor: '#51cbce',
                color: 'white',
                padding: '8px 24px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              CREAR CATEGORÍA
            </button>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '16px', color: '#6c757d', fontSize: '14px' }}>
            Mostrando {filteredData.length} de {currentData.length} entradas
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategories;
