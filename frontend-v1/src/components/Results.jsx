import React, { useState } from 'react';
import '../assets/css/results.css';

const Results = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSorteo, setSelectedSorteo] = useState('');
  const [quickResult1, setQuickResult1] = useState('');
  const [quickResult2, setQuickResult2] = useState('');
  const [activeTab, setActiveTab] = useState('manage');
  const [logsFilterDate, setLogsFilterDate] = useState('');
  const [logsQuickFilter, setLogsQuickFilter] = useState('');

  // Sample logs data - would come from API
  const [logsData] = useState([]);

  // Sample results data - would come from API
  const [resultsData, setResultsData] = useState([
    { id: 970, name: 'Anguila 10am', num1: '89', num2: '21', num3: '72', cash3: '', play4: '', pick5: '' },
    { id: 9, name: 'REAL', num1: '34', num2: '89', num3: '88', cash3: '', play4: '', pick5: '' },
    { id: 6, name: 'GANA MAS', num1: '65', num2: '77', num3: '10', cash3: '', play4: '', pick5: '' },
    { id: 1, name: 'LA PRIMERA', num1: '18', num2: '86', num3: '87', cash3: '', play4: '', pick5: '' },
    { id: 211, name: 'LA SUERTE', num1: '95', num2: '40', num3: '00', cash3: '', play4: '', pick5: '' },
    { id: 277, name: 'LOTEDOM', num1: '17', num2: '64', num3: '17', cash3: '', play4: '', pick5: '' },
    { id: 61, name: 'TEXAS MORNING', num1: '99', num2: '09', num3: '76', cash3: '728', play4: '0996', pick5: '' },
    { id: 62, name: 'TEXAS DAY', num1: '61', num2: '97', num3: '56', cash3: '061', play4: '8756', pick5: '' },
    { id: 63, name: 'TEXAS EVENING', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 64, name: 'TEXAS NIGHT', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 541, name: 'King Lottery AM', num1: '48', num2: '01', num3: '19', cash3: '948', play4: '8118', pick5: '64961' },
    { id: 673, name: 'Anguila 1pm', num1: '12', num2: '28', num3: '51', cash3: '', play4: '', pick5: '' },
    { id: 2, name: 'NEW YORK DAY', num1: '88', num2: '22', num3: '81', cash3: '444', play4: '2784', pick5: '44889' },
    { id: 4, name: 'FLORIDA AM', num1: '37', num2: '90', num3: '73', cash3: '137', play4: '9073', pick5: '63572' },
    { id: 34, name: 'INDIANA MIDDAY', num1: '12', num2: '11', num3: '51', cash3: '412', play4: '1101', pick5: '' },
    { id: 13, name: 'GEORGIA MID AM', num1: '17', num2: '23', num3: '72', cash3: '817', play4: '2572', pick5: '98013' },
    { id: 16, name: 'NEW JERSEY AM', num1: '89', num2: '87', num3: '59', cash3: '889', play4: '8759', pick5: '69687' },
    { id: 607, name: 'L.E. PUERTO RICO 2PM', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 38, name: 'DIARIA 11AM', num1: '12', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 18, name: 'CONNECTICUT AM', num1: '82', num2: '19', num3: '42', cash3: '482', play4: '1042', pick5: '48210' },
    { id: 30, name: 'PENN MIDDAY', num1: '13', num2: '82', num3: '60', cash3: '713', play4: '8100', pick5: '63069' },
    { id: 376, name: 'NY AM 6x1', num1: '', num2: '', num3: '', cash3: '448', play4: '2784', pick5: '' },
    { id: 411, name: 'FL AM 6X1', num1: '', num2: '', num3: '', cash3: '137', play4: '9073', pick5: '' },
    { id: 75, name: 'MARYLAND MIDDAY', num1: '79', num2: '52', num3: '12', cash3: '379', play4: '5212', pick5: '52387' },
    { id: 65, name: 'VIRGINIA AM', num1: '16', num2: '03', num3: '95', cash3: '616', play4: '0395', pick5: '' },
    { id: 609, name: 'DELAWARE AM', num1: '55', num2: '78', num3: '83', cash3: '055', play4: '7883', pick5: '' },
    { id: 1036, name: 'LA CHICA', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 73, name: 'SOUTH CAROLINA AM', num1: '48', num2: '83', num3: '77', cash3: '548', play4: '8577', pick5: '' },
    { id: 20, name: 'CALIFORNIA AM', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 82, name: 'MASS AM', num1: '11', num2: '17', num3: '11', cash3: '717', play4: '1711', pick5: '' },
    { id: 244, name: 'NORTH CAROLINA AM', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 24, name: 'CHICAGO AM', num1: '10', num2: '85', num3: '46', cash3: '610', play4: '8546', pick5: '61085' },
  ]);

  const sorteosList = [
    'CALIFORNIA AM', 'NEW YORK DAY', 'FLORIDA AM', 'TEXAS MORNING', 'TEXAS DAY',
    'TEXAS EVENING', 'TEXAS NIGHT', 'INDIANA MIDDAY', 'GEORGIA MID AM', 'NEW JERSEY AM'
  ];

  const handlePublishResult = () => {
    if (!selectedSorteo) {
      alert('Seleccione un sorteo');
      return;
    }
    console.log('Publishing result:', { sorteo: selectedSorteo, num1: quickResult1, num2: quickResult2 });
    alert(`Resultado publicado para ${selectedSorteo}`);
    setQuickResult1('');
    setQuickResult2('');
  };

  const handlePublishAllResults = () => {
    console.log('Publishing all results for date:', selectedDate);
    alert('Todos los resultados han sido publicados');
  };

  const handleUnlockResults = () => {
    console.log('Unlocking results for date:', selectedDate);
    alert('Resultados desbloqueados');
  };

  const handleViewDetails = (sorteoId) => {
    console.log('Viewing details for sorteo:', sorteoId);
    alert(`Ver detalles del sorteo ${sorteoId}`);
  };

  const handleEditResult = (sorteoId) => {
    console.log('Editing result for sorteo:', sorteoId);
    alert(`Editar resultado del sorteo ${sorteoId}`);
  };

  const handleDeleteResult = (sorteoId) => {
    if (window.confirm('¿Está seguro de eliminar este resultado?')) {
      console.log('Deleting result for sorteo:', sorteoId);
      alert(`Resultado eliminado para sorteo ${sorteoId}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="container-fluid results-container">
      <div className="row">
        <div className="col-12">
          <div className="card results-card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage')}
                  >
                    Manejar resultados
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                  >
                    Logs de resultados
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {activeTab === 'manage' && (
                <>
              <h4 className="card-title text-center mb-4">Manejar resultados</h4>

              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Sorteo</label>
                  <select
                    className="form-select"
                    value={selectedSorteo}
                    onChange={(e) => setSelectedSorteo(e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {sorteosList.map((sorteo) => (
                      <option key={sorteo} value={sorteo}>{sorteo}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Result Input */}
              {selectedSorteo && (
                <div className="quick-result-section mb-4">
                  <div className="quick-result-header">
                    <span className="sorteo-name">{selectedSorteo}</span>
                  </div>
                  <div className="quick-result-inputs">
                    <div className="input-group">
                      <span className="input-group-text">1ro</span>
                      <input
                        type="text"
                        className="form-control"
                        value={quickResult1}
                        onChange={(e) => setQuickResult1(e.target.value)}
                        maxLength="2"
                      />
                    </div>
                    <div className="input-group">
                      <span className="input-group-text">Cash 3</span>
                      <input
                        type="text"
                        className="form-control"
                        value={quickResult2}
                        onChange={(e) => setQuickResult2(e.target.value)}
                        maxLength="3"
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-publish mt-3"
                    onClick={handlePublishResult}
                  >
                    PUBLICAR RESULTADO
                  </button>
                </div>
              )}

              {/* Results Table Section */}
              <div className="results-table-section">
                <h5 className="results-date-title">
                  Resultados {formatDate(selectedDate)}
                </h5>

                <div className="results-actions mb-3">
                  <button
                    className="btn btn-publish-all"
                    onClick={handlePublishAllResults}
                  >
                    <i className="fas fa-upload"></i> PUBLICAR RESULTADOS
                  </button>
                  <button
                    className="btn btn-unlock"
                    onClick={handleUnlockResults}
                  >
                    <i className="fas fa-unlock"></i> DESBLOQUEAR
                  </button>
                  <button className="btn btn-settings">
                    <i className="fas fa-cog"></i>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-results">
                    <thead>
                      <tr>
                        <th className="col-sorteo">Sorteos</th>
                        <th className="col-num green">1ra</th>
                        <th className="col-num green">2da</th>
                        <th className="col-num gray">3ra</th>
                        <th className="col-num gray">Cash 3</th>
                        <th className="col-num gray">Play 4</th>
                        <th className="col-num gray">Pick five</th>
                        <th className="col-details">Detalles</th>
                        <th className="col-actions"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsData.map((result) => (
                        <tr key={result.id}>
                          <td className="sorteo-name">{result.name}</td>
                          <td className="num-cell green">{result.num1}</td>
                          <td className="num-cell green">{result.num2}</td>
                          <td className="num-cell gray">{result.num3}</td>
                          <td className="num-cell gray">{result.cash3}</td>
                          <td className="num-cell gray">{result.play4}</td>
                          <td className="num-cell gray">{result.pick5}</td>
                          <td className="details-cell">
                            <button
                              className="btn btn-details"
                              onClick={() => handleViewDetails(result.id)}
                            >
                              VER
                            </button>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="btn btn-edit"
                              onClick={() => handleEditResult(result.id)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-delete"
                              onClick={() => handleDeleteResult(result.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
                </>
              )}

              {activeTab === 'logs' && (
                <>
                  <h4 className="card-title text-center mb-4">Logs de resultados</h4>

                  {/* Date Filter */}
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Fecha</label>
                      <input
                        type="date"
                        className="form-control"
                        value={logsFilterDate}
                        onChange={(e) => setLogsFilterDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Quick Filter */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Filtrado rápido"
                        value={logsQuickFilter}
                        onChange={(e) => setLogsQuickFilter(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Logs Table */}
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th className="sortable">Sorteo <i className="fas fa-sort"></i></th>
                          <th className="sortable">Usuario <i className="fas fa-sort"></i></th>
                          <th className="sortable">Fecha de resultado <i className="fas fa-sort"></i></th>
                          <th className="sortable">Fecha de registro <i className="fas fa-sort"></i></th>
                          <th>Números</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logsData.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">
                              No hay entradas disponibles
                            </td>
                          </tr>
                        ) : (
                          logsData.map((log, index) => (
                            <tr key={index}>
                              <td>{log.sorteo}</td>
                              <td>{log.usuario}</td>
                              <td>{log.fechaResultado}</td>
                              <td>{log.fechaRegistro}</td>
                              <td>{log.numeros}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-muted">
                    Mostrando {logsData.length} de {logsData.length} entradas
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
