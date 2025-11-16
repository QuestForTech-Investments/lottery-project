import React, { useState } from 'react';

function Dashboard() {
  const [activeMode, setActiveMode] = useState('cobro');
  const [selectedDraw, setSelectedDraw] = useState('DIARIA 11AM');
  const [blockedNumbers, setBlockedNumbers] = useState([]);

  const bancaCodes = ['LAN-0001', 'LAN-0010', 'LAN-0016', 'LAN-0063', 'LAN-0101'];
  const draws = ['DIARIA 11AM', 'LOTEDOM', 'LA PRIMERA', 'TEXAS DAY', 'King Lottery AM'];
  const playTypes = ['Cash3 Box', 'Bolita 2', 'Pick5 Straight', 'Directo', 'Play4 Straight'];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        {/* Grid de 4 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          
          {/* Card 1: Cobros & Pagos */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="mb-4">
              <label className="block text-center text-sm font-medium text-gray-700 mb-3">
                Cobros & pagos
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveMode('cobro')}
                  className={`flex-1 py-2 px-3 text-sm rounded border-2 transition-colors ${
                    activeMode === 'cobro'
                      ? 'bg-teal-400 text-white border-teal-400'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                  }`}
                  style={{
                    backgroundColor: activeMode === 'cobro' ? '#4dd4d4' : '#ffffff',
                    color: activeMode === 'cobro' ? '#ffffff' : '#374151',
                    borderColor: activeMode === 'cobro' ? '#4dd4d4' : '#d1d5db',
                    fontWeight: '500',
                    textTransform: 'none',
                    boxShadow: 'none',
                    outline: 'none'
                  }}
                >
                  <i className="fas fa-hand-holding-usd" style={{ transform: 'rotate(0deg)' }}></i> Cobro
                </button>
                <button
                  onClick={() => setActiveMode('pago')}
                  className={`flex-1 py-2 px-3 text-sm rounded border-2 transition-colors ${
                    activeMode === 'pago'
                      ? 'bg-teal-400 text-white border-teal-400'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                  }`}
                  style={{
                    backgroundColor: activeMode === 'pago' ? '#4dd4d4' : '#ffffff',
                    color: activeMode === 'pago' ? '#ffffff' : '#374151',
                    borderColor: activeMode === 'pago' ? '#4dd4d4' : '#d1d5db',
                    fontWeight: '500',
                    textTransform: 'none',
                    boxShadow: 'none',
                    outline: 'none'
                  }}
                >
                  <i className="fas fa-hand-holding-usd" style={{ transform: 'rotate(180deg)' }}></i> Pago
                </button>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Código de banca
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-teal-400">
                  <option>Seleccione</option>
                  {bancaCodes.map(code => (
                    <option key={code}>{code}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Banco
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-teal-400">
                  <option>Seleccione</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  className="px-8 py-2 bg-teal-400 text-white text-sm font-semibold rounded-full hover:bg-teal-500 transition-colors"
                  style={{
                    backgroundColor: '#4dd4d4',
                    color: '#ffffff',
                    fontWeight: '600',
                    textTransform: 'none',
                    boxShadow: 'none',
                    outline: 'none',
                    border: 'none'
                  }}
                >
                  <i className="nc-icon nc-simple-add"></i> Crear
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Jugadas por sorteo */}
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-center text-sm font-medium text-gray-700 mb-4">
              Jugadas por sorteo
            </label>

            <div className="mb-4">
              <label className="block text-xs text-gray-600 mb-1">
                Sorteo
              </label>
              <select
                value={selectedDraw}
                onChange={(e) => setSelectedDraw(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-teal-400"
              >
                {draws.map(draw => (
                  <option key={draw}>{draw}</option>
                ))}
              </select>
            </div>

            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 text-xs font-semibold text-center">
                <div className="p-2 border-r border-gray-200">Tipo de jugada</div>
                <div className="p-2 border-r border-gray-200">Jugada</div>
                <div className="p-2">Monto</div>
              </div>
              <div className="p-4 text-center text-sm text-gray-500">
                No se encontraron jugadas
              </div>
            </div>
          </div>

          {/* Card 3: Publicación rápida */}
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-center text-sm font-medium text-gray-700 mb-4">
              Publicación rápida de resultados
            </label>

            <div className="space-y-4">
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-teal-400">
                <option>Seleccione</option>
                <option>PANAMA DOMINGO</option>
                <option>LA CHICA</option>
                <option>PANAMA MIERCOLES</option>
                <option>TEXAS MORNING</option>
              </select>

              <div className="flex justify-center">
                <button 
                  className="w-full md:w-10/12 bg-teal-400 text-white text-sm font-semibold rounded-full hover:bg-teal-500 transition-colors"
                  style={{
                    backgroundColor: '#4dd4d4',
                    color: '#ffffff',
                    fontWeight: '600',
                    textTransform: 'none',
                    boxShadow: 'none',
                    outline: 'none',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    width: '100%'
                  }}
                >
                  <i className="nc-icon nc-send"></i> Publicar
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Bloqueo rápido */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h6 className="text-sm font-semibold text-gray-700">
                Bloqueo rápido de números
              </h6>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Sorteo
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-teal-400">
                    <option>Seleccione</option>
                    <option>Todos</option>
                    {draws.map(draw => (
                      <option key={draw}>{draw}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Tipo de jugada
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-teal-400">
                    <option>Seleccione uno...</option>
                    {playTypes.map(type => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Jugada
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
                  />
                </div>
              </div>

              <div id="numbers-container" className="mt-4 min-h-[40px]">
                {/* Contenedor para números agregados */}
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-around gap-2">
                <button 
                  className="px-4 py-1.5 bg-teal-500 text-white text-sm font-semibold rounded hover:bg-teal-600 transition-colors"
                  style={{
                    backgroundColor: '#4dd4d4',
                    color: '#ffffff',
                    fontWeight: '600',
                    textTransform: 'none',
                    boxShadow: 'none',
                    outline: 'none',
                    border: 'none'
                  }}
                >
                  <i className="nc-icon nc-simple-add"></i> Agregar
                </button>
                <button 
                  disabled
                  className="px-4 py-1.5 bg-red-300 text-white text-sm font-semibold rounded opacity-50 cursor-not-allowed"
                  style={{
                    backgroundColor: '#fca5a5',
                    color: '#ffffff',
                    fontWeight: '600',
                    textTransform: 'none',
                    boxShadow: 'none',
                    outline: 'none',
                    border: 'none',
                    opacity: '0.5'
                  }}
                >
                  <i className="nc-icon nc-lock-circle-open"></i> Bloquear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bancas vendiendo */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h4 className="text-base font-medium text-gray-700 text-center">
            Bancas vendiendo:{' '}
            Martes: <span className="text-teal-600 font-bold">72</span>, 
            Miércoles: <span className="text-teal-600 font-bold">79</span>, 
            hoy: <span className="text-teal-600 font-bold">14</span>
          </h4>
      </div>
      
        {/* Botones Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="w-full py-3 bg-teal-400 text-white font-semibold rounded-lg hover:bg-teal-500 transition-colors"
            style={{
              backgroundColor: '#4dd4d4',
              color: '#ffffff',
              fontWeight: '600',
              textTransform: 'none',
              boxShadow: 'none',
              outline: 'none',
              border: 'none'
            }}
          >
            Dashboard
          </button>
          <button 
            className="w-full py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            style={{
              backgroundColor: '#4b5563',
              color: '#ffffff',
              fontWeight: '600',
              textTransform: 'none',
              boxShadow: 'none',
              outline: 'none',
              border: 'none'
            }}
          >
            Dashboard Operativo
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

