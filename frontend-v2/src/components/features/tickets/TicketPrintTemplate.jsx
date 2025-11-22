import React from 'react';
import './TicketPrint.css';

/**
 * Componente de Template de Ticket para Impresión Térmica 80mm
 * Replica el formato de LA CENTRAL (Material-UI Version)
 */
const TicketPrintTemplate = ({ ticketData }) => {
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  // Agrupar líneas por sorteo
  const groupLinesByDraw = () => {
    const grouped = {};
    ticketData.lines.forEach(line => {
      const key = `${line.lotteryName}-${line.drawName}`;
      if (!grouped[key]) {
        grouped[key] = {
          lotteryName: line.lotteryName,
          drawName: line.drawName,
          lines: [],
          total: 0
        };
      }
      grouped[key].lines.push(line);
      grouped[key].total += line.netAmount;
    });
    return Object.values(grouped);
  };

  const drawGroups = groupLinesByDraw();

  return (
    <div className="ticket-thermal" id="ticket-print">
      {/* HEADER */}
      <div className="ticket-header">
        <div className="ticket-logo">
          <div className="logo-placeholder">
            LA CENTRAL
          </div>
        </div>

        <div className="ticket-info">
          <div>POS: {ticketData.bettingPoolName || 'LA CENTRAL'} {ticketData.bettingPoolId}</div>
          <div>Ticket: {ticketData.ticketCode}</div>
          <div>Fecha: {formatDate(ticketData.createdAt)}</div>
          <div className="ticket-serial">Serial: {ticketData.barcode}</div>
        </div>
      </div>

      <div className="separator-line">================================</div>

      {/* BODY - LÍNEAS AGRUPADAS POR SORTEO */}
      {drawGroups.map((group, index) => (
        <div key={index} className="draw-section">
          <div className="draw-header">
            {group.drawName}: ${group.total.toFixed(2)}
          </div>

          <table className="lines-table">
            <thead>
              <tr>
                <th>JUGADA</th>
                <th>MONTO</th>
                <th>JUGADA</th>
                <th>MONTO</th>
              </tr>
            </thead>
            <tbody>
              {group.lines.map((line, idx) => {
                // Mostrar 2 columnas por fila
                if (idx % 2 === 0) {
                  const line1 = line;
                  const line2 = group.lines[idx + 1];

                  return (
                    <tr key={idx}>
                      <td>{line1.betNumber}</td>
                      <td>{line1.betAmount.toFixed(2)}</td>
                      <td>{line2 ? line2.betNumber : ''}</td>
                      <td>{line2 ? line2.betAmount.toFixed(2) : ''}</td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      ))}

      <div className="separator-line-bold">================================</div>

      {/* TOTAL */}
      <div className="ticket-total">
        TOTAL TICKET: ${ticketData.grandTotal.toFixed(2)}
      </div>

      <div className="separator-line">================================</div>

      {/* FOOTER - INFORMACIÓN DE PREMIOS */}
      <div className="prize-info">
        <div>1ro$56 2do$12 3ro$4 Pick2 $75</div>
        <div>Palé $1000 Pick3$600 Win4$5000</div>
        <div>Super palé$2000 Tripleta$10,000</div>
        <div>x2 $100</div>
      </div>

      {/* WEBSITE */}
      <div className="ticket-website">
        QUICKMONEYNYC.COM
      </div>

      {/* BARCODE */}
      <div className="ticket-barcode">
        <svg className="barcode-svg" id={`barcode-${ticketData.ticketCode.toLowerCase()}`}></svg>
      </div>

      {/* NOTAS ADICIONALES */}
      {ticketData.notes && (
        <div className="ticket-notes">
          <div className="separator-line">--------------------------------</div>
          <div>Notas: {ticketData.notes}</div>
        </div>
      )}

      {/* INFORMACIÓN DEL CLIENTE */}
      {(ticketData.customerName || ticketData.customerPhone) && (
        <div className="customer-info">
          <div className="separator-line">--------------------------------</div>
          {ticketData.customerName && <div>Cliente: {ticketData.customerName}</div>}
          {ticketData.customerPhone && <div>Tel: {ticketData.customerPhone}</div>}
        </div>
      )}

      {/* CAJERO */}
      <div className="cashier-info">
        <div className="separator-line">--------------------------------</div>
        <div>Cajero: {ticketData.userName}</div>
      </div>

      {/* MENSAJE FINAL */}
      <div className="ticket-footer-msg">
        <div className="separator-line">================================</div>
        <div>¡Gracias por su preferencia!</div>
        <div>Guarde este ticket</div>
      </div>
    </div>
  );
};

export default TicketPrintTemplate;
