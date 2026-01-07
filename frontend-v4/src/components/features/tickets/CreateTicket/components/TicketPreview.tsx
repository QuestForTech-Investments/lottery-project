/**
 * TicketPreview Component
 *
 * Live preview of the ticket being created.
 */

import { memo, type FC } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import TicketPrintTemplate from '../../TicketPrintTemplate';
import type { TicketPreviewProps } from '../types';
import { PREVIEW_CONTAINER_STYLE, PREVIEW_PAPER_STYLE, SECTION_TITLE_STYLE } from '../constants';

const TicketPreview: FC<TicketPreviewProps> = memo(({
  mockTicketData,
  linesCount,
  totals,
  customerName,
}) => (
  <Box sx={PREVIEW_CONTAINER_STYLE}>
    <Paper sx={PREVIEW_PAPER_STYLE}>
      <Typography variant="h6" sx={SECTION_TITLE_STYLE}>
        Vista Previa del Ticket
      </Typography>

      {mockTicketData ? (
        <Box>
          <TicketPrintTemplate ticketData={mockTicketData} />
          <Paper sx={{
            marginTop: 2,
            padding: 1.5,
            bgcolor: '#f8f9fa',
            fontSize: '12px',
            textAlign: 'left'
          }}>
            <div><strong>Lineas:</strong> {linesCount}</div>
            <div><strong>Total:</strong> ${totals.grandTotal}</div>
            {customerName && <div><strong>Cliente:</strong> {customerName}</div>}
          </Paper>
        </Box>
      ) : (
        <Box sx={{ padding: 5, color: '#999' }}>
          <Typography variant="h1" sx={{ fontSize: '48px' }}>Ticket</Typography>
          <Typography>Agrega lineas para ver</Typography>
          <Typography>la vista previa del ticket</Typography>
        </Box>
      )}
    </Paper>
  </Box>
));

TicketPreview.displayName = 'TicketPreview';

export default TicketPreview;
