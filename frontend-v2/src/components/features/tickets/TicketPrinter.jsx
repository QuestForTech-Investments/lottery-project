import React, { useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Printer as PrinterIcon, X as CloseIcon } from 'lucide-react';
import TicketPrintTemplate from './TicketPrintTemplate';

/**
 * Componente para manejar la impresión de tickets (Material-UI Version)
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
      const barcodeElement = document.getElementById(`barcode-${code.toLowerCase()}`);
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
      <Box sx={{ padding: 3, textAlign: 'center' }}>
        <Typography>No hay datos de ticket para mostrar</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      {/* Botones de Acción */}
      <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
        <Button
          variant="contained"
          startIcon={<PrinterIcon size={20} />}
          onClick={handlePrint}
          sx={{
            bgcolor: '#51cbce',
            '&:hover': { bgcolor: '#45b8bb' },
            marginRight: 2
          }}
        >
          IMPRIMIR TICKET
        </Button>

        <Button
          variant="outlined"
          startIcon={<CloseIcon size={20} />}
          onClick={() => window.close()}
          sx={{
            color: '#6c757d',
            borderColor: '#6c757d',
            '&:hover': {
              borderColor: '#5a6268',
              bgcolor: 'rgba(108, 117, 125, 0.04)'
            }
          }}
        >
          CERRAR
        </Button>
      </Box>

      {/* Vista Previa del Ticket */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ marginBottom: 3 }}>
          Vista Previa del Ticket
        </Typography>
        <div ref={componentRef}>
          <TicketPrintTemplate ticketData={ticketData} />
        </div>
      </Box>

      {/* Información del Ticket */}
      <Paper
        elevation={1}
        sx={{
          marginTop: 3,
          padding: 2,
          maxWidth: 400,
          margin: '20px auto',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          📋 Información del Ticket
        </Typography>

        <Box sx={{ '& > div': { marginBottom: 1, fontSize: '14px' } }}>
          <div>
            <strong>Código:</strong> {ticketData.ticketCode}
          </div>
          <div>
            <strong>Estado:</strong>{' '}
            <span
              style={{
                color: ticketData.status === 'pending' ? '#28a745' : '#6c757d',
                fontWeight: 'bold'
              }}
            >
              {ticketData.status === 'pending'
                ? 'PENDIENTE'
                : ticketData.status === 'paid'
                ? 'PAGADO'
                : 'CANCELADO'}
            </span>
          </div>
          <div>
            <strong>Total Líneas:</strong> {ticketData.lines.length}
          </div>
          <div>
            <strong>Total:</strong>{' '}
            <span style={{ fontWeight: 'bold', color: '#51cbce' }}>
              ${ticketData.grandTotal.toFixed(2)}
            </span>
          </div>
          {ticketData.customerName && (
            <div>
              <strong>Cliente:</strong> {ticketData.customerName}
            </div>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TicketPrinter;
