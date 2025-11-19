import React, { useState } from 'react';
import '../../assets/css/FormStyles.css';

const GroupConfiguration = () => {
  const [activeMainTab, setActiveMainTab] = useState('defaults');
  const [activeSubTab, setActiveSubTab] = useState('prizes');

  // Estado para tab Premios (15 tipos principales)
  const [prizesData, setPrizesData] = useState({
    directo: { primerPago: '56', segundoPago: '12', tercerPago: '4', dobles: '56' },
    pale: { todosSecuencia: '1200', primerPago: '1200', segundoPago: '1200', tercerPago: '200' },
    tripleta: { primerPago: '10000', segundoPago: '100' },
    cash3Straight: { todosSecuencia: '700', triples: '700' },
    cash3Box: { threeWay: '232', sixWay: '116' },
    play4Straight: { todosSecuencia: '5000', dobles: '5000' },
    play4Box: { twentyFourWay: '200', twelveWay: '400', sixWay: '800', fourWay: '1200' },
    superPale: { primerPago: '2000' },
    bolita1: { primerPago: '80' },
    bolita2: { primerPago: '80' },
    singulacion1: { primerPago: '9' },
    singulacion2: { primerPago: '9' },
    singulacion3: { primerPago: '9' },
    pickTwo: { primerPago: '80', dobles: '80' },
    pick5Straight: { todosSecuencia: '30000', dobles: '30000' }
  });

  // Estado para tab Comisiones
  const [commissionsData, setCommissionsData] = useState({
    general: '',
    directo: '20',
    pale: '30',
    tripleta: '30',
    cash3Straight: '20',
    cash3Box: '20',
    play4Straight: '20',
    play4Box: '20',
    superPale: '30',
    bolita1: '20',
    bolita2: '20',
    singulacion1: '10',
    singulacion2: '10',
    singulacion3: '10',
    pickTwo: '20',
    pick5Straight: '20'
  });

  // Estado para Pie de página
  const [footerData, setFooterData] = useState({
    primerPie: 'Revise su Ticket Al Recibirlo',
    segundoPie: 'Jugadas Combinada se Paga una sola vez',
    tercerPie: 'Buena Suerte en sus Jugadas !',
    cuartoPie: 'LACENTRALRD.COM'
  });

  const handlePrizeChange = (gameType, field, value) => {
    setPrizesData(prev => ({
      ...prev,
      [gameType]: {
        ...prev[gameType],
        [field]: value
      }
    }));
  };

  const handleCommissionChange = (gameType, value) => {
    setCommissionsData(prev => ({
      ...prev,
      [gameType]: value
    }));
  };

  const handleFooterChange = (field, value) => {
    setFooterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Configuración actualizada (mockup)\\n\\nEsto enviará los datos al backend cuando esté conectado.');
  };

  const renderPrizesFields = (title, gameType, fields) => {
    return (
      <div key={gameType} style={{ marginBottom: '20px' }}>
        <h6 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#2c2c2c' }}>
          {title}
        </h6>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
          {Object.entries(fields).map(([fieldKey, fieldLabel]) => (
            <div key={fieldKey} className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ fontSize: '12px', color: '#787878', display: 'block', marginBottom: '4px' }}>
                {fieldLabel}
              </label>
              <input
                type="text"
                className="form-control"
                value={prizesData[gameType]?.[fieldKey] || ''}
                onChange={(e) => handlePrizeChange(gameType, fieldKey, e.target.value)}
                placeholder="0"
                style={{ height: '31px', fontSize: '14px', textAlign: 'right' }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCommissionField = (label, gameType) => {
    return (
      <div key={gameType} className="form-group" style={{ marginBottom: '15px' }}>
        <label className="form-label" style={{ fontSize: '12px', color: '#787878', display: 'block', marginBottom: '4px' }}>
          {label}
        </label>
        <input
          type="text"
          className="form-control"
          value={commissionsData[gameType] || ''}
          onChange={(e) => handleCommissionChange(gameType, e.target.value)}
          placeholder="0"
          style={{ height: '31px', fontSize: '14px', textAlign: 'right' }}
        />
      </div>
    );
  };

  return (
    <div className="create-branch-container" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <div className="page-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontFamily: 'Montserrat, sans-serif', color: '#2c2c2c', fontWeight: '600' }}>
          Actualizar grupo
        </h1>
      </div>

      <div className="branch-form" style={{ background: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
        {/* Tabs Principales */}
        <div className="tabs-container" style={{ borderBottom: '2px solid #51cbce', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              className={`tab ${activeMainTab === 'defaults' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('defaults')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeMainTab === 'defaults' ? '#51cbce' : 'transparent',
                color: activeMainTab === 'defaults' ? 'white' : '#51cbce',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0',
                fontWeight: '500'
              }}
            >
              Valores por defecto
            </button>
            <button
              className={`tab ${activeMainTab === 'allowed' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('allowed')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeMainTab === 'allowed' ? '#51cbce' : 'transparent',
                color: activeMainTab === 'allowed' ? 'white' : '#51cbce',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0',
                fontWeight: '500'
              }}
            >
              Valores permitidos
            </button>
            <button
              className={`tab ${activeMainTab === 'footer' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('footer')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeMainTab === 'footer' ? '#51cbce' : 'transparent',
                color: activeMainTab === 'footer' ? 'white' : '#51cbce',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0',
                fontWeight: '500'
              }}
            >
              Pie de página
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tab: Valores por defecto */}
          {activeMainTab === 'defaults' && (
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', textAlign: 'center' }}>
                Comisiones y premios por defecto
              </h4>

              {/* Sub-tabs */}
              <div className="tabs-container" style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`tab ${activeSubTab === 'prizes' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('prizes')}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: activeSubTab === 'prizes' ? '#51cbce' : '#666',
                      fontSize: '13px',
                      fontFamily: 'Montserrat, sans-serif',
                      cursor: 'pointer',
                      borderBottom: activeSubTab === 'prizes' ? '2px solid #51cbce' : 'none',
                      fontWeight: '500'
                    }}
                  >
                    Premios
                  </button>
                  <button
                    type="button"
                    className={`tab ${activeSubTab === 'commissions' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('commissions')}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: activeSubTab === 'commissions' ? '#51cbce' : '#666',
                      fontSize: '13px',
                      fontFamily: 'Montserrat, sans-serif',
                      cursor: 'pointer',
                      borderBottom: activeSubTab === 'commissions' ? '2px solid #51cbce' : 'none',
                      fontWeight: '500'
                    }}
                  >
                    Comisiones
                  </button>
                </div>
              </div>

              {/* Sub-tab: Premios */}
              {activeSubTab === 'prizes' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                  {renderPrizesFields('Directo', 'directo', { primerPago: 'Primer Pago', segundoPago: 'Segundo Pago', tercerPago: 'Tercer Pago', dobles: 'Dobles' })}
                  {renderPrizesFields('Pale', 'pale', { todosSecuencia: 'Todos en secuencia', primerPago: 'Primer Pago', segundoPago: 'Segundo Pago', tercerPago: 'Tercer Pago' })}
                  {renderPrizesFields('Tripleta', 'tripleta', { primerPago: 'Primer Pago', segundoPago: 'Segundo Pago' })}
                  {renderPrizesFields('Cash3 Straight', 'cash3Straight', { todosSecuencia: 'Todos en secuencia', triples: 'Triples' })}
                  {renderPrizesFields('Cash3 Box', 'cash3Box', { threeWay: '3-Way: 2 identicos', sixWay: '6-Way: 3 unicos' })}
                  {renderPrizesFields('Play4 Straight', 'play4Straight', { todosSecuencia: 'Todos en secuencia', dobles: 'Dobles' })}
                  {renderPrizesFields('Play4 Box', 'play4Box', { twentyFourWay: '24-Way: 4 unicos', twelveWay: '12-Way: 2 identicos', sixWay: '6-Way: 2 identicos', fourWay: '4-Way: 3 identicos' })}
                  {renderPrizesFields('Super Pale', 'superPale', { primerPago: 'Primer Pago' })}
                  {renderPrizesFields('Bolita 1', 'bolita1', { primerPago: 'Primer Pago' })}
                  {renderPrizesFields('Bolita 2', 'bolita2', { primerPago: 'Primer Pago' })}
                  {renderPrizesFields('Singulación 1', 'singulacion1', { primerPago: 'Primer Pago' })}
                  {renderPrizesFields('Singulación 2', 'singulacion2', { primerPago: 'Primer Pago' })}
                  {renderPrizesFields('Singulación 3', 'singulacion3', { primerPago: 'Primer Pago' })}
                  {renderPrizesFields('Pick Two', 'pickTwo', { primerPago: 'Primer Pago', dobles: 'Dobles' })}
                  {renderPrizesFields('Pick5 Straight', 'pick5Straight', { todosSecuencia: 'Todos en secuencia', dobles: 'Dobles' })}
                </div>
              )}

              {/* Sub-tab: Comisiones */}
              {activeSubTab === 'commissions' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  {renderCommissionField('General', 'general')}
                  {renderCommissionField('Directo', 'directo')}
                  {renderCommissionField('Pale', 'pale')}
                  {renderCommissionField('Tripleta', 'tripleta')}
                  {renderCommissionField('Cash3 Straight', 'cash3Straight')}
                  {renderCommissionField('Cash3 Box', 'cash3Box')}
                  {renderCommissionField('Play4 Straight', 'play4Straight')}
                  {renderCommissionField('Play4 Box', 'play4Box')}
                  {renderCommissionField('Super Pale', 'superPale')}
                  {renderCommissionField('Bolita 1', 'bolita1')}
                  {renderCommissionField('Bolita 2', 'bolita2')}
                  {renderCommissionField('Singulación 1', 'singulacion1')}
                  {renderCommissionField('Singulación 2', 'singulacion2')}
                  {renderCommissionField('Singulación 3', 'singulacion3')}
                  {renderCommissionField('Pick Two', 'pickTwo')}
                  {renderCommissionField('Pick5 Straight', 'pick5Straight')}
                </div>
              )}
            </div>
          )}

          {/* Tab: Valores permitidos */}
          {activeMainTab === 'allowed' && (
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', textAlign: 'center' }}>
                Valores permitidos
              </h4>
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                <p>Funcionalidad de valores permitidos (badges clickeables) pendiente de implementar.</p>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                  Esta sección permitirá configurar valores predefinidos para cada campo de premio.
                </p>
              </div>
            </div>
          )}

          {/* Tab: Pie de página */}
          {activeMainTab === 'footer' && (
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>
                Pie de página
              </h4>

              {/* Botones de atajos */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
                  {['1RA [1]', '2DA [2]', '3RA [3]', 'DOBLES [4]', 'PALE [5]', 'SUPER PALE [6]'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      style={{
                        padding: '8px 16px',
                        background: '#51cbce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                      onClick={() => alert(`Atajo: ${label}`)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                  {['TRIPLETA [7]', 'CASH 3 [8]', 'TRIPLES [9]', 'PLAY 4 [10]', 'PICK 5 [11]', 'PICK 2 [12]'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      style={{
                        padding: '8px 16px',
                        background: '#51cbce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                      onClick={() => alert(`Atajo: ${label}`)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos de pie de página */}
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label" style={{ fontSize: '12px', color: '#787878', display: 'block', marginBottom: '4px' }}>
                    Primer pie de pagina
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={footerData.primerPie}
                    onChange={(e) => handleFooterChange('primerPie', e.target.value)}
                    style={{ height: '31px', fontSize: '14px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label" style={{ fontSize: '12px', color: '#787878', display: 'block', marginBottom: '4px' }}>
                    Segundo pie de pagina
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={footerData.segundoPie}
                    onChange={(e) => handleFooterChange('segundoPie', e.target.value)}
                    style={{ height: '31px', fontSize: '14px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label" style={{ fontSize: '12px', color: '#787878', display: 'block', marginBottom: '4px' }}>
                    Tercer pie de pagina
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={footerData.tercerPie}
                    onChange={(e) => handleFooterChange('tercerPie', e.target.value)}
                    style={{ height: '31px', fontSize: '14px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label" style={{ fontSize: '12px', color: '#787878', display: 'block', marginBottom: '4px' }}>
                    Cuarto pie de pagina
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={footerData.cuartoPie}
                    onChange={(e) => handleFooterChange('cuartoPie', e.target.value)}
                    style={{ height: '31px', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botón Actualizar */}
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              type="submit"
              style={{
                background: '#51cbce',
                color: 'white',
                border: 'none',
                padding: '12px 40px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'uppercase'
              }}
            >
              ACTUALIZAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupConfiguration;
