import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const HotNumbers = () => {
  const [activeTab, setActiveTab] = useState('numeros');
  const [selectedNumbers, setSelectedNumbers] = useState([10, 22]);

  const numbers = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));

  const toggleNumber = (num) => {
    setSelectedNumbers(prev => prev.includes(parseInt(num)) ? prev.filter(n => n !== parseInt(num)) : [...prev, parseInt(num)]);
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '500', color: '#2c2c2c' }}>Números calientes</h3>
      </div>

      <div className="card" style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="card-body" style={{ padding: '0' }}>
          <ul className="nav nav-tabs" style={{ borderBottom: '2px solid #51cbce' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'numeros' ? 'active' : ''}`}
                onClick={() => setActiveTab('numeros')}
                style={{
                  fontSize: '14px',
                  color: activeTab === 'numeros' ? 'white' : '#51cbce',
                  background: activeTab === 'numeros' ? '#51cbce' : 'transparent',
                  border: 'none',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                Números calientes
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'limites' ? 'active' : ''}`}
                onClick={() => setActiveTab('limites')}
                style={{
                  fontSize: '14px',
                  color: activeTab === 'limites' ? 'white' : '#51cbce',
                  background: activeTab === 'limites' ? '#51cbce' : 'transparent',
                  border: 'none',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                Límites
              </button>
            </li>
          </ul>

          <div style={{ padding: '30px' }}>
            {activeTab === 'numeros' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px' }}>
                {numbers.map(num => (
                  <div
                    key={num}
                    className="form-check"
                    style={{
                      textAlign: 'center',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      background: selectedNumbers.includes(parseInt(num)) ? '#51cbce' : 'white',
                      color: selectedNumbers.includes(parseInt(num)) ? 'white' : '#333',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleNumber(num)}
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedNumbers.includes(parseInt(num))}
                      onChange={() => {}}
                      style={{ marginRight: '5px' }}
                    />
                    <label style={{ fontSize: '14px', margin: 0, cursor: 'pointer' }}>{num}</label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'limites' && (
              <div>
                <div className="table-responsive mb-4">
                  <table className="table table-bordered">
                    <thead style={{ background: '#f5f5f5' }}>
                      <tr>
                        <th style={{ fontSize: '12px' }}>Sorteos</th>
                        <th style={{ fontSize: '12px' }}>Directo</th>
                        <th style={{ fontSize: '12px' }}>Pale 1 caliente</th>
                        <th style={{ fontSize: '12px' }}>Pale 2 caliente</th>
                        <th style={{ fontSize: '12px' }}>Tripleta 1 caliente</th>
                        <th style={{ fontSize: '12px' }}>Tripleta 2 caliente</th>
                        <th style={{ fontSize: '12px' }}>Tripleta 3 caliente</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', fontSize: '13px', color: '#999', padding: '20px' }}>
                          No hay información disponible
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => alert('Límites guardados')}
                  className="btn"
                  style={{
                    background: '#51cbce',
                    color: 'white',
                    fontSize: '14px',
                    padding: '10px 40px',
                    border: 'none',
                    borderRadius: '4px',
                    display: 'block',
                    margin: '0 auto'
                  }}
                >
                  GUARDAR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotNumbers;
