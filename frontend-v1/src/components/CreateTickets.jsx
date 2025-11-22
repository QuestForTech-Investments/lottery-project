import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TicketPrinter from './tickets/TicketPrinter';
import TicketPrintTemplate from './tickets/TicketPrintTemplate';
import JsBarcode from 'jsbarcode';
import '../assets/css/FormStyles.css';

/**
 * Componente para Crear Tickets
 * Replica el flujo de la cajera para crear tickets de lotería
 * Incluye vista previa del ticket en tiempo real
 */
const CreateTickets = () => {
  const navigate = useNavigate();

  // Estados para parámetros
  const [draws, setDraws] = useState([]);
  const [betTypes, setBetTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [selectedDraw, setSelectedDraw] = useState('');
  const [betNumber, setBetNumber] = useState('');
  const [selectedBetType, setSelectedBetType] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [multiplier, setMultiplier] = useState('1.00');

  // Estados para datos adicionales
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [globalMultiplier, setGlobalMultiplier] = useState('1.00');
  const [globalDiscount, setGlobalDiscount] = useState('0.00');

  // Estado de líneas del ticket
  const [lines, setLines] = useState([]);

  // Estado para ticket creado
  const [createdTicket, setCreatedTicket] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);

  // Estado para totales calculados
  const [totals, setTotals] = useState({
    totalBet: 0,
    totalCommission: 0,
    grandTotal: 0
  });

  // Cargar parámetros al montar
  useEffect(() => {
    loadParams();
  }, []);

  // Recalcular totales cuando cambien las líneas
  useEffect(() => {
    calculateTotals();
  }, [lines, globalDiscount, globalMultiplier]);

  // Generar código de barras para vista previa
  useEffect(() => {
    if (lines.length > 0) {
      generatePreviewBarcode();
    }
  }, [lines]);

  // Generar ticket mock para vista previa
  const generateMockTicket = () => {
    if (lines.length === 0) {
      return null;
    }

    const mockTicket = {
      ticketId: 0,
      ticketCode: 'PREVIEW-TICKET',
      barcode: 'PREVIEW-TICKET',
      status: 'pending',
      bettingPoolId: 9,
      bettingPoolName: 'admin',
      userId: 11,
      userName: 'Cajero',
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      totalBetAmount: parseFloat(totals.totalBet) || 0,
      totalDiscount: 0,
      totalCommission: parseFloat(totals.totalCommission) || 0,
      totalNet: parseFloat(totals.grandTotal) || 0,
      grandTotal: parseFloat(totals.grandTotal) || 0,
      createdAt: new Date().toISOString(),
      notes: notes || '',
      lines: lines.map((line, index) => ({
        lineId: index + 1,
        lineNumber: index + 1,
        lotteryId: 0,
        lotteryName: line.lotteryName,
        drawId: line.drawId,
        drawName: line.drawName,
        drawDate: new Date().toISOString().split('T')[0],
        drawTime: '12:00:00',
        betNumber: line.betNumber,
        betTypeId: line.betTypeId,
        betTypeName: line.betTypeName,
        betAmount: line.betAmount,
        multiplier: line.multiplier,
        subtotal: line.betAmount * line.multiplier,
        totalWithMultiplier: line.betAmount * line.multiplier * (parseFloat(globalMultiplier) || 1),
        discountAmount: 0,
        commissionPercentage: 10.00,
        commissionAmount: (line.betAmount * line.multiplier * 0.10),
        netAmount: line.betAmount * line.multiplier * 0.90,
        isWinner: false,
        prizeAmount: 0.00
      }))
    };

    return mockTicket;
  };

  // Generar barcode para vista previa
  const generatePreviewBarcode = () => {
    try {
      setTimeout(() => {
        const barcodeElement = document.getElementById('barcode-preview-ticket');
        if (barcodeElement && lines.length > 0) {
          JsBarcode(barcodeElement, 'PREVIEW', {
            format: 'CODE128',
            width: 2,
            height: 50,
            displayValue: false,
            margin: 0,
            background: '#ffffff',
            lineColor: '#000000'
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error generando barcode preview:', error);
    }
  };

  const loadParams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await api.get('/tickets/params/create', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDraws(response.draws || []);
      setBetTypes(response.betTypes || []);
    } catch (error) {
      console.error('Error cargando parámetros:', error);
      alert('Error al cargar parámetros de creación');
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const calculateTotals = () => {
    const discount = parseFloat(globalDiscount) || 0;
    const multiplier = parseFloat(globalMultiplier) || 1;
    const commissionRate = 0.10; // 10%

    let totalBet = 0;
    let totalCommission = 0;

    lines.forEach(line => {
      const amount = line.betAmount * line.multiplier * multiplier;
      const discountAmount = amount * (discount / 100);
      const afterDiscount = amount - discountAmount;
      const commission = afterDiscount * commissionRate;

      totalBet += amount;
      totalCommission += commission;
    });

    const grandTotal = totalBet - totalCommission - (totalBet * (discount / 100));

    setTotals({
      totalBet: totalBet.toFixed(2),
      totalCommission: totalCommission.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    });
  };

  // Agregar línea
  const handleAddLine = () => {
    if (!selectedDraw || !betNumber || !selectedBetType || !betAmount) {
      alert('Por favor complete todos los campos de la línea');
      return;
    }

    const draw = draws.find(d => d.drawId === parseInt(selectedDraw));
    const betType = betTypes.find(bt => bt.betTypeId === parseInt(selectedBetType));

    if (!draw || !betType) {
      alert('Sorteo o tipo de apuesta no válidos');
      return;
    }

    const newLine = {
      drawId: draw.drawId,
      drawName: draw.drawName,
      lotteryName: draw.lotteryName,
      betNumber: betNumber,
      betTypeId: betType.betTypeId,
      betTypeName: betType.betTypeName,
      betAmount: parseFloat(betAmount),
      multiplier: parseFloat(multiplier) || 1.00
    };

    setLines([...lines, newLine]);

    // Limpiar campos de línea
    setBetNumber('');
    setBetAmount('');
  };

  // Eliminar línea
  const handleRemoveLine = (index) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  // Crear ticket
  const handleCreateTicket = async () => {
    if (lines.length === 0) {
      alert('Debe agregar al menos una línea al ticket');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const userId = parseInt(localStorage.getItem('userId') || '11');
      const bettingPoolId = parseInt(localStorage.getItem('bettingPoolId') || '9');

      const payload = {
        bettingPoolId,
        userId,
        lines: lines.map(line => ({
          drawId: line.drawId,
          betNumber: line.betNumber,
          betTypeId: line.betTypeId,
          betAmount: line.betAmount,
          multiplier: line.multiplier
        })),
        globalMultiplier: parseFloat(globalMultiplier) || 1.00,
        globalDiscount: parseFloat(globalDiscount) || 0.00,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        notes: notes || null
      };

      const response = await api.post('/tickets', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Ticket creado:', response);

      setCreatedTicket(response);
      setShowPrintView(true);

      // Opcionalmente limpiar formulario
      // resetForm();
    } catch (error) {
      console.error('Error creando ticket:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al crear ticket';
      alert(`Error: ${errorMsg}`);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setLines([]);
    setSelectedDraw('');
    setBetNumber('');
    setSelectedBetType('');
    setBetAmount('');
    setMultiplier('1.00');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setGlobalMultiplier('1.00');
    setGlobalDiscount('0.00');
    setCreatedTicket(null);
    setShowPrintView(false);
  };

  // Vista de impresión
  if (showPrintView && createdTicket) {
    return (
      <div>
        <TicketPrinter
          ticketData={createdTicket}
          onAfterPrint={() => {
            // Después de imprimir, preguntar si quiere crear otro ticket
            const createAnother = window.confirm('¿Desea crear otro ticket?');
            if (createAnother) {
              resetForm();
            } else {
              navigate('/tickets/list');
            }
          }}
        />
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando parámetros...</div>;
  }

  // Generar ticket mock para vista previa
  const mockTicketData = generateMockTicket();

  return (
    <div className="create-branch-container">
      <div className="page-title">
        <h1>🎫 Crear Ticket</h1>
      </div>

      {/* LAYOUT DE DOS COLUMNAS */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="branch-form" style={{ flex: '1', minWidth: '500px' }}>
        {/* SECCIÓN 1: AGREGAR LÍNEA */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#51cbce' }}>➕ Agregar Línea</h3>

          <div className="form-group">
            <label className="form-label">Sorteo:</label>
            <select
              className="form-control"
              value={selectedDraw}
              onChange={(e) => setSelectedDraw(e.target.value)}
            >
              <option value="">Seleccione sorteo...</option>
              {draws.map(draw => (
                <option key={draw.drawId} value={draw.drawId}>
                  {draw.lotteryName} - {draw.drawName} ({draw.drawTime})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Número:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: 25, 123, etc."
              value={betNumber}
              onChange={(e) => setBetNumber(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Jugada:</label>
            <select
              className="form-control"
              value={selectedBetType}
              onChange={(e) => setSelectedBetType(e.target.value)}
            >
              <option value="">Seleccione tipo...</option>
              {betTypes.map(bt => (
                <option key={bt.betTypeId} value={bt.betTypeId}>
                  {bt.betTypeName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monto:</label>
            <input
              type="number"
              className="form-control"
              placeholder="$0.00"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Multiplicador:</label>
            <input
              type="number"
              className="form-control"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              min="1"
              max="100"
              step="0.01"
            />
          </div>

          <button
            onClick={handleAddLine}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ➕ AGREGAR LÍNEA
          </button>
        </div>

        {/* SECCIÓN 2: LÍNEAS AGREGADAS */}
        {lines.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#51cbce' }}>📋 Líneas del Ticket ({lines.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ backgroundColor: '#51cbce', color: '#fff' }}>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Sorteo</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Número</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Tipo</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Monto</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Mult.</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{index + 1}</td>
                    <td style={{ padding: '8px' }}>{line.lotteryName} - {line.drawName}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{line.betNumber}</td>
                    <td style={{ padding: '8px' }}>{line.betTypeName}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>${line.betAmount.toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{line.multiplier}x</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveLine(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SECCIÓN 3: DATOS ADICIONALES */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#51cbce' }}>📝 Datos Adicionales (Opcional)</h3>

          <div className="form-group">
            <label className="form-label">Nombre del Cliente:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Juan Pérez"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono:</label>
            <input
              type="tel"
              className="form-control"
              placeholder="809-555-1234"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Multiplicador Global:</label>
            <input
              type="number"
              className="form-control"
              value={globalMultiplier}
              onChange={(e) => setGlobalMultiplier(e.target.value)}
              min="1"
              max="100"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descuento Global (%):</label>
            <input
              type="number"
              className="form-control"
              value={globalDiscount}
              onChange={(e) => setGlobalDiscount(e.target.value)}
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notas:</label>
            <textarea
              className="form-control"
              placeholder="Notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        {/* SECCIÓN 4: RESUMEN Y CREAR */}
        <div style={{
          backgroundColor: '#e9ecef',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#51cbce' }}>💰 Resumen del Ticket</h3>

          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '5px 0' }}><strong>Total Líneas:</strong></td>
                <td style={{ textAlign: 'right' }}>{lines.length}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0' }}><strong>Total Apostado:</strong></td>
                <td style={{ textAlign: 'right' }}>${totals.totalBet}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0' }}><strong>Comisión (10%):</strong></td>
                <td style={{ textAlign: 'right', color: '#dc3545' }}>-${totals.totalCommission}</td>
              </tr>
              <tr style={{ borderTop: '2px solid #51cbce' }}>
                <td style={{ padding: '10px 0', fontSize: '16px' }}><strong>TOTAL A COBRAR:</strong></td>
                <td style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#51cbce' }}>
                  ${totals.grandTotal}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleCreateTicket}
              disabled={lines.length === 0}
              style={{
                padding: '15px 40px',
                backgroundColor: lines.length > 0 ? '#51cbce' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: lines.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                marginRight: '10px'
              }}
            >
              🎫 CREAR TICKET
            </button>

            <button
              onClick={resetForm}
              style={{
                padding: '15px 40px',
                backgroundColor: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🔄 LIMPIAR
            </button>
          </div>
        </div>
        </div>

        {/* COLUMNA DERECHA: VISTA PREVIA DEL TICKET */}
        <div style={{
          flex: '0 0 350px',
          position: 'sticky',
          top: '20px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: '#fff',
            border: '2px dashed #51cbce',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              color: '#51cbce',
              fontSize: '16px'
            }}>
              📋 Vista Previa del Ticket
            </h3>

            {mockTicketData ? (
              <div>
                <TicketPrintTemplate ticketData={mockTicketData} />
                <div style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '12px',
                  textAlign: 'left'
                }}>
                  <div><strong>Líneas:</strong> {lines.length}</div>
                  <div><strong>Total:</strong> ${totals.grandTotal}</div>
                  {customerName && <div><strong>Cliente:</strong> {customerName}</div>}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                color: '#999',
                fontSize: '14px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎫</div>
                <div>Agrega líneas para ver</div>
                <div>la vista previa del ticket</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTickets;
