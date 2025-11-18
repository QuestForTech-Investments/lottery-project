import React, { useState, useEffect } from 'react';
import '../../assets/css/FormStyles.css';
import '../../assets/css/CreateBranchGeneral.css';

const ManageExcesses = () => {
  // Dropdown de sorteos
  const [selectedDraw, setSelectedDraw] = useState('General');

  // 25 campos numéricos para los diferentes tipos de excedentes
  const [excessValues, setExcessValues] = useState({
    general: '',
    directo: '',
    pale: '',
    cash3Straight: '',
    cash3Box: '',
    play4Straight: '',
    play4Box: '',
    superPale: '',
    bolita1: '',
    bolita2: '',
    singulacion1: '',
    singulacion2: '',
    singulacion3: '',
    pick5Straight: '',
    pick5Box: '',
    pickTwo: '',
    cash3FrontStraight: '',
    cash3FrontBox: '',
    cash3BackStraight: '',
    cash3BackBox: '',
    pickTwoFront: '',
    pickTwoBack: '',
    pickTwoMiddle: '',
    panama: '',
    tripleta: ''
  });

  // Lista de excedentes guardados
  const [savedExcesses, setSavedExcesses] = useState([]);

  // Mockup data de sorteos
  const draws = [
    { id: 0, name: 'General' },
    { id: 1, name: 'Anguila 10am' },
    { id: 2, name: 'NY 12pm' },
    { id: 3, name: 'FL 1pm' },
    { id: 4, name: 'GA 7pm' },
    { id: 5, name: 'REAL' },
    { id: 6, name: 'GANA MAS' },
    { id: 7, name: 'LA PRIMERA' }
  ];

  // Mapeo de campos para mostrar en UI
  const fieldLabels = {
    general: 'General',
    directo: 'Directo',
    pale: 'Pale',
    cash3Straight: 'Cash3 Straight',
    cash3Box: 'Cash3 Box',
    play4Straight: 'Play4 Straight',
    play4Box: 'Play4 Box',
    superPale: 'Super Pale',
    bolita1: 'Bolita 1',
    bolita2: 'Bolita 2',
    singulacion1: 'Singulación 1',
    singulacion2: 'Singulación 2',
    singulacion3: 'Singulación 3',
    pick5Straight: 'Pick5 Straight',
    pick5Box: 'Pick5 Box',
    pickTwo: 'Pick Two',
    cash3FrontStraight: 'Cash3 Front Straight',
    cash3FrontBox: 'Cash3 Front Box',
    cash3BackStraight: 'Cash3 Back Straight',
    cash3BackBox: 'Cash3 Back Box',
    pickTwoFront: 'Pick Two Front',
    pickTwoBack: 'Pick Two Back',
    pickTwoMiddle: 'Pick Two Middle',
    panama: 'Panamá',
    tripleta: 'Tripleta'
  };

  const handleFieldChange = (fieldName, value) => {
    // Solo permitir números y decimales
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setExcessValues(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  };

  const handleClearAll = () => {
    const emptyValues = Object.keys(excessValues).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setExcessValues(emptyValues);
  };

  const handleCreate = () => {
    // Recopilar solo campos con valores
    const filledFields = Object.entries(excessValues)
      .filter(([key, value]) => value !== '')
      .map(([key, value]) => ({
        draw: selectedDraw,
        betType: fieldLabels[key],
        excess: parseFloat(value),
        date: new Date().toLocaleDateString('es-DO'),
        user: 'admin'
      }));

    if (filledFields.length === 0) {
      alert('Debe ingresar al menos un valor de excedente');
      return;
    }

    // Agregar a la lista de guardados
    const newExcesses = filledFields.map((field, index) => ({
      id: savedExcesses.length + index + 1,
      ...field
    }));

    setSavedExcesses([...newExcesses, ...savedExcesses]);

    // Limpiar formulario después de crear
    handleClearAll();

    alert(`${filledFields.length} excedente(s) creado(s) exitosamente`);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este excedente?')) {
      setSavedExcesses(savedExcesses.filter(item => item.id !== id));
    }
  };

  // Organizar campos en grupos de 3 para el grid
  const fieldKeys = Object.keys(excessValues);
  const fieldRows = [];
  for (let i = 0; i < fieldKeys.length; i += 3) {
    fieldRows.push(fieldKeys.slice(i, i + 3));
  }

  return (
    <div className="create-branch-container">
      <div className="page-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#2c2c2c', fontWeight: '600', fontSize: '24px' }}>
          Manejar excedentes
        </h3>
      </div>

      <div className="branch-form" style={{ padding: '30px' }}>
        {/* Filtro de Sorteo y Botón Borrar Todo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
            <label style={{
              fontSize: '12px',
              color: 'rgb(120, 120, 120)',
              width: '80px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Sorteo
            </label>
            <select
              className="form-control"
              value={selectedDraw}
              onChange={(e) => setSelectedDraw(e.target.value)}
              style={{
                width: '300px',
                fontSize: '14px',
                height: '31px'
              }}
            >
              {draws.map(draw => (
                <option key={draw.id} value={draw.name}>{draw.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearAll}
            style={{
              background: '#51cbce',
              border: 'none',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            BORRAR TODO
          </button>
        </div>

        {/* Formulario de 25 campos en grid de 3 columnas */}
        <div style={{
          background: '#f5f5f5',
          padding: '25px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {fieldRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '12px'
              }}
            >
              {row.map(fieldKey => (
                <div key={fieldKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{
                    fontSize: '12px',
                    color: 'rgb(120, 120, 120)',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {fieldLabels[fieldKey]}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={excessValues[fieldKey]}
                    onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                    placeholder="0.00"
                    style={{
                      fontSize: '14px',
                      height: '31px',
                      textAlign: 'right'
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Botón CREAR */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '30px' }}>
          <button
            onClick={handleCreate}
            style={{
              background: '#51cbce',
              border: 'none',
              color: 'white',
              padding: '10px 30px',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            CREAR
          </button>
        </div>

        {/* Título de la tabla */}
        <div className="page-title" style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
          <h3 style={{ color: '#2c2c2c', fontWeight: '600', fontSize: '24px' }}>
            Lista de excedentes
          </h3>
        </div>

        {/* Tabla de excedentes guardados */}
        {savedExcesses.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-striped" style={{ width: '100%', marginTop: '15px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600' }}>#</th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600' }}>Sorteo</th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600' }}>Tipo de jugada</th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600', textAlign: 'right' }}>Excedente</th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600' }}>Fecha</th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600' }}>Usuario</th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {savedExcesses.map((item, index) => (
                  <tr key={item.id}>
                    <td style={{ padding: '10px', fontSize: '14px' }}>{index + 1}</td>
                    <td style={{ padding: '10px', fontSize: '14px' }}>{item.draw}</td>
                    <td style={{ padding: '10px', fontSize: '14px' }}>{item.betType}</td>
                    <td style={{ padding: '10px', fontSize: '14px', textAlign: 'right' }}>
                      ${item.excess.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px', fontSize: '14px' }}>{item.date}</td>
                    <td style={{ padding: '10px', fontSize: '14px' }}>{item.user}</td>
                    <td style={{ padding: '10px', fontSize: '14px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-sm btn-danger"
                        style={{ fontSize: '12px' }}
                      >
                        <i className="fa fa-trash"></i> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6c757d',
            fontSize: '14px',
            background: '#f8f9fa',
            borderRadius: '4px'
          }}>
            No hay excedentes creados aún
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageExcesses;
