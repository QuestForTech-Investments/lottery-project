import React, { useState, useEffect } from 'react';
import '../../assets/css/FormStyles.css';
import '../../assets/css/CreateBranchGeneral.css';

const ExcessesReport = () => {
  const [selectedDraws, setSelectedDraws] = useState([]);
  const [selectedBetTypes, setSelectedBetTypes] = useState([]);
  const [quickFilter, setQuickFilter] = useState('');
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Mockup data - Lista de sorteos
  const availableDraws = [
    { id: 1, name: 'Anguila 10am' },
    { id: 2, name: 'NY 12pm' },
    { id: 3, name: 'FL 1pm' },
    { id: 4, name: 'GA 7pm' },
    { id: 5, name: 'REAL' },
    { id: 6, name: 'GANA MAS' },
    { id: 7, name: 'LA PRIMERA' },
    { id: 8, name: 'LA SUERTE' },
    { id: 9, name: 'LOTEDOM' },
    { id: 10, name: 'NACIONAL' },
    { id: 0, name: 'General' }
  ];

  // Mockup data - Lista de tipos de jugada
  const availableBetTypes = [
    { id: 1, name: 'Directo' },
    { id: 2, name: 'Pale' },
    { id: 3, name: 'Tripleta' },
    { id: 4, name: 'Cash3 Straight' },
    { id: 5, name: 'Cash3 Box' },
    { id: 6, name: 'Play4 Straight' },
    { id: 7, name: 'Play4 Box' },
    { id: 8, name: 'Super Pale' },
    { id: 9, name: 'Pick Two' },
    { id: 10, name: 'Pick5 Straight' },
    { id: 11, name: 'Pick5 Box' },
    { id: 12, name: 'Bolita 1' },
    { id: 13, name: 'Bolita 2' }
  ];

  // Mockup data - Datos del reporte
  const mockReportData = [
    { id: 1, draw: 'Anguila 10am', betType: 'Directo', excess: 1000.00, date: '18/11/2025', user: 'admin' },
    { id: 2, draw: 'Anguila 10am', betType: 'Pale', excess: 500.00, date: '18/11/2025', user: 'admin' },
    { id: 3, draw: 'General', betType: 'Directo', excess: 1000.00, date: '17/11/2025', user: 'admin' },
    { id: 4, draw: 'NY 12pm', betType: 'Tripleta', excess: 300.00, date: '17/11/2025', user: 'admin' },
    { id: 5, draw: 'FL 1pm', betType: 'Pick Two', excess: 80.00, date: '16/11/2025', user: 'admin' },
    { id: 6, draw: 'GA 7pm', betType: 'Cash3 Box', excess: 150.00, date: '16/11/2025', user: 'admin' },
    { id: 7, draw: 'General', betType: 'Pale', excess: 500.00, date: '15/11/2025', user: 'admin' },
    { id: 8, draw: 'Anguila 10am', betType: 'Super Pale', excess: 250.00, date: '15/11/2025', user: 'admin' }
  ];

  useEffect(() => {
    // Inicializar con todos seleccionados
    setSelectedDraws(availableDraws.map(d => d.id));
    setSelectedBetTypes(availableBetTypes.map(bt => bt.id));
  }, []);

  const handleRefresh = () => {
    // Filtrar datos basado en las selecciones
    let filtered = mockReportData;

    if (selectedDraws.length > 0 && selectedDraws.length < availableDraws.length) {
      const selectedDrawNames = availableDraws
        .filter(d => selectedDraws.includes(d.id))
        .map(d => d.name);
      filtered = filtered.filter(item => selectedDrawNames.includes(item.draw));
    }

    if (selectedBetTypes.length > 0 && selectedBetTypes.length < availableBetTypes.length) {
      const selectedBetTypeNames = availableBetTypes
        .filter(bt => selectedBetTypes.includes(bt.id))
        .map(bt => bt.name);
      filtered = filtered.filter(item => selectedBetTypeNames.includes(item.betType));
    }

    setReportData(filtered);
    setFilteredData(filtered);
  };

  // Aplicar quick filter
  useEffect(() => {
    if (quickFilter === '') {
      setFilteredData(reportData);
    } else {
      const filtered = reportData.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(quickFilter.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [quickFilter, reportData]);

  const handleDrawSelection = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(parseInt(options[i].value));
      }
    }
    setSelectedDraws(selected);
  };

  const handleBetTypeSelection = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(parseInt(options[i].value));
      }
    }
    setSelectedBetTypes(selected);
  };

  return (
    <div className="create-branch-container">
      <div className="page-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#2c2c2c', fontWeight: '600', fontSize: '24px' }}>
          Reporte de excedentes
        </h3>
      </div>

      <div className="branch-form" style={{ padding: '30px' }}>
        {/* Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Multi-select Sorteo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              fontSize: '12px',
              color: 'rgb(120, 120, 120)',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Sorteo
            </label>
            <select
              multiple
              className="form-control"
              value={selectedDraws.map(String)}
              onChange={handleDrawSelection}
              style={{
                fontSize: '14px',
                height: '120px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {availableDraws.map(draw => (
                <option key={draw.id} value={draw.id}>{draw.name}</option>
              ))}
            </select>
            <small style={{ fontSize: '12px', color: '#6c757d' }}>
              {selectedDraws.length} seleccionada{selectedDraws.length !== 1 ? 's' : ''}
            </small>
          </div>

          {/* Multi-select Tipo de jugada */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              fontSize: '12px',
              color: 'rgb(120, 120, 120)',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Tipo de jugada
            </label>
            <select
              multiple
              className="form-control"
              value={selectedBetTypes.map(String)}
              onChange={handleBetTypeSelection}
              style={{
                fontSize: '14px',
                height: '120px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {availableBetTypes.map(betType => (
                <option key={betType.id} value={betType.id}>{betType.name}</option>
              ))}
            </select>
            <small style={{ fontSize: '12px', color: '#6c757d' }}>
              {selectedBetTypes.length} seleccionada{selectedBetTypes.length !== 1 ? 's' : ''}
            </small>
          </div>
        </div>

        {/* Botón REFRESCAR */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={handleRefresh}
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
            REFRESCAR
          </button>
        </div>

        {/* Quick filter */}
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Filtrado rápido"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              style={{
                fontSize: '14px',
                height: '31px',
                paddingRight: '35px'
              }}
            />
            <i className="fa fa-search" style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#51cbce',
              pointerEvents: 'none'
            }}></i>
          </div>
        </div>

        {/* Tabla de reporte */}
        {filteredData.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-striped" style={{ width: '100%' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    Sorteo
                  </th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    Tipo de jugada
                  </th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600', textAlign: 'right', cursor: 'pointer' }}>
                    Excedente
                  </th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    Fecha de creación
                  </th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    Usuario
                  </th>
                  <th style={{ padding: '12px', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: '10px', fontSize: '14px' }}>{item.draw}</td>
                    <td style={{ padding: '10px', fontSize: '14px' }}>{item.betType}</td>
                    <td style={{ padding: '10px', fontSize: '14px', textAlign: 'right' }}>
                      ${item.excess.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px', fontSize: '14px' }}>{item.date}</td>
                    <td style={{ padding: '10px', fontSize: '14px' }}>{item.user}</td>
                    <td style={{ padding: '10px', fontSize: '14px', textAlign: 'center' }}>
                      <button
                        className="btn btn-sm btn-info"
                        style={{ marginRight: '5px', fontSize: '12px' }}
                      >
                        <i className="fa fa-info-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ marginRight: '5px', fontSize: '12px' }}
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        style={{ fontSize: '12px' }}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer con contador */}
            <div style={{
              marginTop: '15px',
              fontSize: '14px',
              color: '#6c757d',
              textAlign: 'left'
            }}>
              Mostrando {filteredData.length} de {reportData.length} entradas
            </div>
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
            No hay entradas disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcessesReport;
