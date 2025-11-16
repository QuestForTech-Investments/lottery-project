import React, { useState } from 'react';

const BloqueoRapidoCard = () => {
  const [blockedNumbers, setBlockedNumbers] = useState([]);

  const draws = ['DIARIA 11AM', 'LOTEDOM', 'LA PRIMERA', 'TEXAS DAY', 'King Lottery AM'];
  const playTypes = ['Cash3 Box', 'Bolita 2', 'Pick5 Straight', 'Directo', 'Play4 Straight'];

  return (
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
          <button className="px-4 py-1.5 bg-teal-500 text-white text-sm font-semibold rounded hover:bg-teal-600 transition-colors">
            Agregar
          </button>
          <button 
            disabled
            className="px-4 py-1.5 bg-red-300 text-white text-sm font-semibold rounded opacity-50 cursor-not-allowed"
          >
            Bloquear
          </button>
        </div>
      </div>
    </div>
  );
};

export default BloqueoRapidoCard;
