import React, { useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';
import TicketPrintTemplate from './TicketPrintTemplate';

/**
 * Componente para manejar la impresión de tickets
 * Incluye:
 * - Vista previa del ticket
 * - Generación de código de barras
 * - Funcionalidad de impresión
 */
const TicketPrinter = ({ ticketData, onAfterPrint }) => {
  const componentRef = useRef();

  // Generar código de barras cuando se monta el componente
  useEffect(() => {
    if (ticketData && ticketData.ticketCode) {
      generateBarcode(ticketData.ticketCode);
    }
  }, [ticketData]);

  // Generar código de barras con JsBarcode
  const generateBarcode = (code) => {
    try {
      const barcodeElement = document.getElementById(`barcode-${code}`);
      if (barcodeElement) {
        JsBarcode(barcodeElement, code, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: false,
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000'
        });
      }
    } catch (error) {
      console.error('Error generando código de barras:', error);
    }
  };

  // Configurar impresión
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Ticket_${ticketData.ticketCode}`,
    onAfterPrint: () => {
      if (onAfterPrint) {
        onAfterPrint();
      }
    },
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `
  });

  // Imprimir automáticamente si se recibe la prop autoPrint
  useEffect(() => {
    if (ticketData && ticketData.autoPrint) {
      // Esperar a que se genere el barcode
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [ticketData]);

  if (!ticketData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No hay datos de ticket para mostrar</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Botones de Acción */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={handlePrint}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#51cbce',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🖨️ IMPRIMIR TICKET
        </button>

        <button
          onClick={() => window.close()}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ✖ CERRAR
        </button>
      </div>

      {/* Vista Previa del Ticket */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '20px' }}>Vista Previa del Ticket</h3>
        <div ref={componentRef}>
          <TicketPrintTemplate ticketData={ticketData} />
        </div>
      </div>

      {/* Información del Ticket */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        maxWidth: '400px',
        margin: '20px auto'
      }}>
        <h4 style={{ marginTop: 0 }}>📋 Información del Ticket</h4>
        <table style={{ width: '100%', fontSize: '13px' }}>
          <tbody>
            <tr>
              <td><strong>Código:</strong></td>
              <td>{ticketData.ticketCode}</td>
            </tr>
            <tr>
              <td><strong>Estado:</strong></td>
              <td style={{
                color: ticketData.status === 'pending' ? '#28a745' : '#6c757d',
                fontWeight: 'bold'
              }}>
                {ticketData.status === 'pending' ? 'PENDIENTE' :
                 ticketData.status === 'paid' ? 'PAGADO' : 'CANCELADO'}
              </td>
            </tr>
            <tr>
              <td><strong>Total Líneas:</strong></td>
              <td>{ticketData.lines.length}</td>
            </tr>
            <tr>
              <td><strong>Total:</strong></td>
              <td style={{ fontWeight: 'bold', color: '#51cbce' }}>
                ${ticketData.grandTotal.toFixed(2)}
              </td>
            </tr>
            {ticketData.customerName && (
              <tr>
                <td><strong>Cliente:</strong></td>
                <td>{ticketData.customerName}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketPrinter;
