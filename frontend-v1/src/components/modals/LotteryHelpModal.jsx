import React, { useState } from 'react';

export default function LotteryHelpModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('teclas');

  if (!isOpen) return null;

  const shortcuts = [
    { key: '↑', function: '(Arriba) Limpiar campos de jugada y Monto.' },
    { key: 'L', function: '(Ele) Cancelar el ticket y limpiar la pantalla.' },
    { key: '/', function: '(Slash) Cambiar de lotería.' },
    { key: '*', function: '(Asterisco) Imprimir el ticket.' },
    { key: 'c', function: 'Duplicar ticket.' },
    { key: 'P', function: 'Marcar ticket como pagado.' },
    { key: 'q', function: 'Sólo para Cash 3 y Play 4. Digitar la jugada seguida de q (Ej.: 123q) para generar todas la combinaciones del número.' },
    { key: '.', function: '(Punto) sólo para Directo, Palé y Tripleta. Digitar la jugada seguida de un punto (Ej.: 1234.) para generar todas las combinaciones del número.' },
    { key: 'd', function: 'Sólo para Directo. Ingresar una jugada inicial de dos dígitos iguales seguidos de la letra d y luego dos dígitos iguales para la jugada final (Ej.: 33d66) para generar una secuencia de pares iguales desde la jugada inicial has la jugada final.' },
    { key: '-10', function: 'Sólo Para Cash 3. Ingresar una jugada de tres dígitos seguidos de -10 (Ej.: 123-10) para generar todas las combinaciones que contienen los últimos dos dígitos aumentando en 100 cada valor.' },
    { key: '+xyz', function: 'Sólo Para Cash 3 Straight. Ingresar una jugada de tres dígitos seguido del signo + y otra jugada de tres dígitos (Ej.: 345+348) para generar una secuencia de straight: 345, 346, 347.' }
  ];

  const gameInstructions = [
    {
      title: 'Para jugar Directo',
      steps: [
        'Ingresar en la jugada un número de dos dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pale',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Tripleta',
      steps: [
        'Ingresar en la jugada un número de seis dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Straight',
      steps: [
        'Ingresar en la jugada un número de tres dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Box',
      steps: [
        'Ingresar en la jugada un número de tres dígitos seguido del signo + (Ej.: 123+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Play4 Straight',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos seguido del signo - (Ej.: 1234-) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Play4 Box',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos seguido del signo + (Ej.: 1234+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Super Pale',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Bolita',
      steps: [
        'Ingresar en la jugada un número de dos dígitos seguido del signo de +, seguido del rango (1 o 2) (Ej.: 12+1) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Singulación',
      steps: [
        'Ingresar en la jugada un número de un dígitos seguido del signo de -, seguido del rango (1, 2 o 3) (Ex.: 1-2) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick5 Straight',
      steps: [
        'Ingresar en la jugada un número de cinco dígitos seguido del signo - (Ej.: 12345-) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick5 Box',
      steps: [
        'Ingresar en la jugada un número de cinco dígitos seguido del signo + (Ej.: 12345+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick Two',
      steps: [
        'Ingresar en la jugada un número de dos dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Front Straight',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra F y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Front Box',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra F seguido del signo + (Ej.: 123F+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Back Straight',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra B y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Back Box',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra B seguido del signo + (Ej.: 123B+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick Two Front',
      steps: [
        'Ingresar en la jugada un número de dos dígitos, la letra F y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick Two Back',
      steps: [
        'Ingresar en la jugada un número de dos dígitos, la letra B y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick Two Middle',
      steps: [
        'Ingresar en la jugada un número de dos dígitos seguido del signo de - y el rango (3) (Ej.: 10-3) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Panamá',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos seguido del signo - (Ej.: 1234-) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    }
  ];

  const primaryColor = '#51cbce';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Ayuda</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('teclas')}
              className="px-4 py-2 text-sm font-medium transition-colors border-b-2"
              style={activeTab === 'teclas' ? { 
                color: '#000', 
                borderColor: primaryColor 
              } : { 
                color: primaryColor, 
                borderColor: 'transparent' 
              }}
            >
              Teclas
            </button>
            <button
              onClick={() => setActiveTab('jugar')}
              className="px-4 py-2 text-sm font-medium transition-colors border-b-2"
              style={activeTab === 'jugar' ? { 
                color: '#000', 
                borderColor: primaryColor 
              } : { 
                color: primaryColor, 
                borderColor: 'transparent' 
              }}
            >
              ¿Cómo jugar?
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4" style={{ height: '500px', overflowY: 'auto' }}>
          {activeTab === 'teclas' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                      Tecla
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                      Función
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shortcuts.map((shortcut, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td 
                        className="border border-gray-300 px-3 py-2 font-mono font-semibold" 
                        style={{ color: primaryColor }}
                      >
                        {shortcut.key}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-gray-700">
                        {shortcut.function}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'jugar' && (
            <div className="space-y-5">
              {gameInstructions.map((game, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    {game.title}
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {game.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-gray-700">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="text-white transition-all uppercase"
            style={{ 
              backgroundColor: primaryColor,
              fontSize: '.65em',
              lineHeight: '1.35em',
              padding: '5px 22px',
              borderRadius: '3px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#45b8bb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}













