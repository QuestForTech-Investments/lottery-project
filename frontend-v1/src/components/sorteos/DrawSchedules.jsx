import React, { useState } from 'react';

const DrawSchedules = () => {
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('10:00');

  // Mockup data - 34+ draws with timezones
  const draws = [
    { id: 1, name: 'Anguila Quiniela', timezone: 'America/Santo_Domingo' },
    { id: 2, name: 'California AM', timezone: 'America/New_York' },
    { id: 3, name: 'California PM', timezone: 'America/New_York' },
    { id: 4, name: 'Chicago', timezone: 'America/New_York' },
    { id: 5, name: 'Connecticut', timezone: 'America/New_York' },
    { id: 6, name: 'Delaware', timezone: 'America/New_York' },
    { id: 7, name: 'Diaria Honduras', timezone: 'America/Tegucigalpa' },
    { id: 8, name: 'Florida', timezone: 'America/New_York' },
    { id: 9, name: 'Florida 6x1', timezone: 'America/New_York' },
    { id: 10, name: 'Florida Pick2', timezone: 'America/New_York' },
    { id: 11, name: 'Georgia', timezone: 'America/New_York' },
    { id: 12, name: 'Indiana', timezone: 'America/New_York' },
    { id: 13, name: 'King Lottery', timezone: 'America/Santo_Domingo' },
    { id: 14, name: 'L.E. Puerto Rico', timezone: 'America/Santo_Domingo' },
    { id: 15, name: 'La Chica', timezone: 'America/Tegucigalpa' },
    { id: 16, name: 'La Primera', timezone: 'America/Santo_Domingo' },
    { id: 17, name: 'La Suerte Dominicana', timezone: 'America/Santo_Domingo' },
    { id: 18, name: 'Lotedom', timezone: 'America/Santo_Domingo' },
    { id: 19, name: 'Loteka', timezone: 'America/Santo_Domingo' },
    { id: 20, name: 'Loteria Nacional', timezone: 'America/Santo_Domingo' },
    { id: 21, name: 'Loteria Real', timezone: 'America/Santo_Domingo' },
    { id: 22, name: 'Maryland', timezone: 'America/New_York' },
    { id: 23, name: 'Massachusetts', timezone: 'America/New_York' },
    { id: 24, name: 'New Jersey', timezone: 'America/New_York' },
    { id: 25, name: 'New York', timezone: 'America/New_York' },
    { id: 26, name: 'New York 6x1', timezone: 'America/New_York' },
    { id: 27, name: 'North Carolina', timezone: 'America/New_York' },
    { id: 28, name: 'Panama LNB', timezone: 'America/Panama' },
    { id: 29, name: 'Pennsylvania', timezone: 'America/New_York' },
    { id: 30, name: 'Quiniela Pale', timezone: 'America/Santo_Domingo' },
    { id: 31, name: 'South Carolina', timezone: 'America/New_York' },
    { id: 32, name: 'Super Pale (RD)', timezone: 'America/Santo_Domingo' },
    { id: 33, name: 'Super Pale (USA)', timezone: 'America/New_York' },
    { id: 34, name: 'Texas', timezone: 'America/New_York' },
    { id: 35, name: 'Virginia', timezone: 'America/New_York' }
  ];

  const handleDrawClick = (draw) => {
    setSelectedDraw(draw);
    setShowModal(true);
  };

  const handleSaveSchedule = () => {
    console.log('Saving schedule for:', selectedDraw?.name, 'at', scheduleTime);
    alert(`Horario guardado para ${selectedDraw?.name}: ${scheduleTime} (mockup)`);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDraw(null);
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
          Horarios de sorteos
        </h3>

        {/* Botones de Sorteos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {draws.map(draw => (
            <button
              key={draw.id}
              onClick={() => handleDrawClick(draw)}
              style={{
                width: '100%',
                backgroundColor: '#51cbce',
                color: 'white',
                border: 'none',
                padding: '15px',
                textTransform: 'uppercase',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#45b8bb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#51cbce'}
            >
              {draw.name.toUpperCase()} ({draw.timezone.toUpperCase()})
            </button>
          ))}
        </div>
      </div>

      {/* Modal de Configuración de Horario */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              width: '500px',
              maxWidth: '90%',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontSize: '20px', fontFamily: 'Montserrat, sans-serif', color: '#2c2c2c' }}>
                Configurar Horario
              </h4>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px', fontFamily: 'Montserrat, sans-serif' }}>
                  Sorteo
                </label>
                <input
                  type="text"
                  value={selectedDraw?.name || ''}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: '#f5f5f5'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px', fontFamily: 'Montserrat, sans-serif' }}>
                  Zona Horaria
                </label>
                <input
                  type="text"
                  value={selectedDraw?.timezone || ''}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: '#f5f5f5'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#787878', marginBottom: '5px', fontFamily: 'Montserrat, sans-serif' }}>
                  Hora del Sorteo
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '8px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: '#666'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSchedule}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  cursor: 'pointer',
                  backgroundColor: '#51cbce',
                  color: 'white'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#45b8bb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#51cbce'}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawSchedules;
