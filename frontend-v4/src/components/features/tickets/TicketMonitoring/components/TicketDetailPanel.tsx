/**
 * TicketDetailPanel Component
 *
 * Side panel showing detailed ticket information including plays/lines.
 * Styled to match the original Vue.js application exactly.
 */

import { memo, useMemo, useState, useCallback, type FC } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import ticketService from '../../../../../services/ticketService';
import type { LinePrizeMultipliers } from '../../../../../services/ticketService';
import type { TicketDetailPanelProps } from '../types';
import type { MappedTicketLine } from '../../../../../services/ticketService';

// ============================================================================
// Prize Edit Modal Types
// ============================================================================

interface PrizeMultipliers {
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  doubles: number;
}

interface PrizeEditModalProps {
  open: boolean;
  betNumber: string;
  multipliers: PrizeMultipliers;
  onClose: () => void;
  onSave: (multipliers: PrizeMultipliers) => void;
}

// ============================================================================
// Style Constants - Extracted from original Vue.js app
// ============================================================================

const PANEL_STYLES = {
  container: {
    backgroundColor: '#e3e3e3',
    borderRadius: '12px',
    boxShadow: 'rgba(0, 0, 0, 0.15) 0px 6px 10px -4px',
    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
    overflow: 'hidden',
    maxHeight: 600,
    overflowY: 'auto' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 15px',
    borderBottom: '1px solid #ccc',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'rgb(37, 36, 34)',
    flex: 1,
    textAlign: 'center' as const,
  },
  closeButton: {
    backgroundColor: 'rgb(207, 207, 202)',
    width: 24,
    height: 24,
    '&:hover': {
      backgroundColor: 'rgb(180, 180, 175)',
    },
  },
  closeIcon: {
    fontSize: '14px',
    color: '#fff',
  },
  infoSection: {
    textAlign: 'center' as const,
    padding: '10px 15px',
    borderBottom: '1px solid #ccc',
  },
  infoText: {
    fontSize: '12px',
    color: 'rgb(102, 97, 91)',
    marginBottom: '4px',
  },
  legendTitle: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'rgb(37, 36, 34)',
    textAlign: 'center' as const,
    marginBottom: '8px',
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 0,
    marginBottom: '12px',
  },
  legendItem: {
    padding: '4px 15px',
    fontSize: '12px',
    color: 'rgb(37, 36, 34)',
    textAlign: 'center' as const,
  },
  totalsLine: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'rgb(37, 36, 34)',
    padding: '10px 15px',
    borderBottom: '1px solid #ccc',
  },
  lotteryHeader: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'rgb(102, 97, 91)',
    padding: '8px 8px 0 8px',
    borderBottom: '1px solid #ccc',
    backgroundColor: '#e3e3e3',
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: 'transparent',
    borderBottom: '1px solid #ccc',
  },
  tableHeaderCell: {
    fontSize: '11.2px',
    fontWeight: 400,
    color: 'rgb(37, 36, 34)',
    padding: '6px 5px',
    textAlign: 'center' as const,
    flex: 1,
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: '12px',
    color: 'rgb(37, 36, 34)',
    padding: '6px 5px',
    textAlign: 'center' as const,
    flex: 1,
  },
};

// Row background colors based on status
const ROW_COLORS = {
  winner: 'rgb(153, 221, 255)',      // Light blue
  loserEven: 'rgb(255, 152, 146)',   // Salmon
  loserOdd: 'rgb(255, 176, 164)',    // Lighter salmon
  pending: 'rgb(167, 164, 166)',     // Gray
};

// Legend colors
const LEGEND_COLORS = {
  ganadora: 'rgb(153, 221, 255)',    // Light blue
  perdedora: 'rgb(255, 152, 146)',   // Salmon
  pendiente: 'rgb(167, 164, 166)',   // Gray
};

// Default prize multipliers (typical values from original app)
const DEFAULT_MULTIPLIERS: PrizeMultipliers = {
  firstPrize: 56,
  secondPrize: 12,
  thirdPrize: 4,
  doubles: 56,
};

// ============================================================================
// Prize Edit Modal Component
// ============================================================================

const PrizeEditModal: FC<PrizeEditModalProps> = memo(({
  open,
  betNumber,
  multipliers,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PrizeMultipliers>(multipliers);

  const handleChange = useCallback((field: keyof PrizeMultipliers) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10) || 0;
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(formData);
    onClose();
  }, [formData, onSave, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px' }}>
        Modificar premios de jugadas ({betNumber})
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            backgroundColor: '#f0ad4e',
            color: '#fff',
            '& .MuiAlert-icon': { color: '#fff' },
          }}
        >
          IMPORTANTE: para hacer efectivos los cambios a los premios de jugadas deberá re-procesar las ventas.
        </Alert>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Primer Pago"
            type="number"
            value={formData.firstPrize}
            onChange={handleChange('firstPrize')}
            size="small"
            fullWidth
          />
          <TextField
            label="Segundo Pago"
            type="number"
            value={formData.secondPrize}
            onChange={handleChange('secondPrize')}
            size="small"
            fullWidth
          />
          <TextField
            label="Tercer Pago"
            type="number"
            value={formData.thirdPrize}
            onChange={handleChange('thirdPrize')}
            size="small"
            fullWidth
          />
          <TextField
            label="Dobles"
            type="number"
            value={formData.doubles}
            onChange={handleChange('doubles')}
            size="small"
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            bgcolor: '#666',
            color: '#fff',
            '&:hover': { bgcolor: '#555' },
            textTransform: 'uppercase',
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          sx={{
            bgcolor: '#51cbce',
            color: '#fff',
            '&:hover': { bgcolor: '#45b8bb' },
            textTransform: 'uppercase',
          }}
        >
          Actualizar jugada
        </Button>
      </DialogActions>
    </Dialog>
  );
});

PrizeEditModal.displayName = 'PrizeEditModal';

// ============================================================================
// Helper Components
// ============================================================================

interface PlayRowProps {
  line: MappedTicketLine;
  index: number;
  isWinner: boolean;
  isPending: boolean;
  onEditPrize: (betNumber: string) => void;
}

const PlayRow: FC<PlayRowProps> = memo(({ line, index, isWinner, isPending, onEditPrize }) => {
  const backgroundColor = useMemo(() => {
    if (isWinner) return ROW_COLORS.winner;
    if (isPending) return ROW_COLORS.pending;
    return index % 2 === 0 ? ROW_COLORS.loserEven : ROW_COLORS.loserOdd;
  }, [isWinner, isPending, index]);

  const handleEditClick = useCallback(() => {
    onEditPrize(line.betNumber);
  }, [onEditPrize, line.betNumber]);

  return (
    <Box sx={{ ...PANEL_STYLES.tableRow, backgroundColor }}>
      <Typography sx={PANEL_STYLES.tableCell}>{line.betNumber}</Typography>
      <Typography sx={PANEL_STYLES.tableCell}>{line.betTypeName || '-'}</Typography>
      <Typography sx={PANEL_STYLES.tableCell}>{formatCurrency(line.betAmount)}</Typography>
      <Box sx={{ ...PANEL_STYLES.tableCell, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Typography component="span">
          {line.prizeAmount > 0 ? formatCurrency(line.prizeAmount) : '-'}
        </Typography>
        <IconButton
          size="small"
          onClick={handleEditClick}
          sx={{
            p: 0.25,
            color: 'rgb(102, 97, 91)',
            '&:hover': { color: 'rgb(37, 36, 34)' },
          }}
        >
          <EditIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
      <Typography sx={PANEL_STYLES.tableCell}>
        {/* Pagado icon placeholder - would be a check/x icon */}
        -
      </Typography>
    </Box>
  );
});

PlayRow.displayName = 'PlayRow';

// ============================================================================
// Main Component
// ============================================================================

const TicketDetailPanel: FC<TicketDetailPanelProps> = memo(({ ticket, onClose }) => {
  // Modal state for prize editing
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [selectedBetNumber, setSelectedBetNumber] = useState('');

  // Group lines by draw/lottery
  const linesByDraw = useMemo(() => {
    if (!ticket.lines || ticket.lines.length === 0) return new Map<string, MappedTicketLine[]>();

    const grouped = new Map<string, MappedTicketLine[]>();
    for (const line of ticket.lines) {
      const drawName = line.drawName || 'Sin Sorteo';
      const existing = grouped.get(drawName) || [];
      grouped.set(drawName, [...existing, line]);
    }
    return grouped;
  }, [ticket.lines]);

  // Calculate totals from lines
  const { totalMonto, totalPremios, totalPendiente } = useMemo(() => {
    if (!ticket.lines) return { totalMonto: ticket.monto, totalPremios: ticket.premio, totalPendiente: 0 };

    const monto = ticket.lines.reduce((sum, line) => sum + line.betAmount, 0);
    const premios = ticket.lines.reduce((sum, line) => sum + line.prizeAmount, 0);
    // Pending is the prize amount for lines with prize > 0 but ticket not paid
    const pendiente = ticket.estado === 'Ganador' || ticket.estado === 'Pendiente' ? premios : 0;

    return { totalMonto: monto || ticket.monto, totalPremios: premios || ticket.premio, totalPendiente: pendiente };
  }, [ticket]);

  // Handle opening prize edit modal
  const handleEditPrize = useCallback((betNumber: string) => {
    setSelectedBetNumber(betNumber);
    setPrizeModalOpen(true);
  }, []);

  // Handle closing prize edit modal
  const handleClosePrizeModal = useCallback(() => {
    setPrizeModalOpen(false);
    setSelectedBetNumber('');
  }, []);

  // Handle saving prize multipliers
  const handleSavePrizeMultipliers = useCallback(async (multipliers: PrizeMultipliers) => {
    try {
      // Find the line to get its ID
      const line = ticket.lines?.find(l => l.betNumber === selectedBetNumber);
      const lineId = line?.drawId || 0; // Using drawId as a proxy for lineId

      const apiMultipliers: LinePrizeMultipliers = {
        firstPrize: multipliers.firstPrize,
        secondPrize: multipliers.secondPrize,
        thirdPrize: multipliers.thirdPrize,
        doubles: multipliers.doubles,
      };

      const result = await ticketService.updateLinePrizeMultipliers(
        ticket.id,
        lineId,
        selectedBetNumber,
        apiMultipliers
      );

      if (result.success) {
        // Show success feedback (could add a snackbar in the future)
        console.log('Prize multipliers updated:', result.message);
      }
    } catch (error) {
      console.error('Error saving prize multipliers:', error);
      // Could show error feedback (snackbar) in the future
    } finally {
      handleClosePrizeModal();
    }
  }, [ticket.id, ticket.lines, selectedBetNumber, handleClosePrizeModal]);

  return (
    <Box sx={PANEL_STYLES.container}>
      {/* Header with ticket number and close button */}
      <Box sx={PANEL_STYLES.header}>
        <Box sx={{ width: 24 }} /> {/* Spacer for centering */}
        <Typography sx={PANEL_STYLES.headerTitle}>
          {ticket.id}-{ticket.numero}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={PANEL_STYLES.closeButton}>
          <CloseIcon sx={PANEL_STYLES.closeIcon} />
        </IconButton>
      </Box>

      {/* Info section */}
      <Box sx={PANEL_STYLES.infoSection}>
        <Typography sx={PANEL_STYLES.infoText}>
          (Número Mágico: {ticket.numero.replace(/-/g, '').toUpperCase()})
        </Typography>
        <Typography sx={PANEL_STYLES.infoText}>
          Fecha de primera jugada: {ticket.fecha}
        </Typography>
        <Typography sx={PANEL_STYLES.infoText}>
          Fecha de impresión: {ticket.fecha}
        </Typography>
      </Box>

      {/* Legend */}
      <Box sx={{ padding: '10px 15px' }}>
        <Typography sx={PANEL_STYLES.legendTitle}>Leyenda</Typography>
        <Box sx={PANEL_STYLES.legendContainer}>
          <Box sx={{ ...PANEL_STYLES.legendItem, backgroundColor: LEGEND_COLORS.ganadora }}>
            Ganadora
          </Box>
          <Box sx={{ ...PANEL_STYLES.legendItem, backgroundColor: LEGEND_COLORS.perdedora }}>
            Perdedora
          </Box>
          <Box sx={{ ...PANEL_STYLES.legendItem, backgroundColor: LEGEND_COLORS.pendiente }}>
            Pendiente
          </Box>
        </Box>
      </Box>

      {/* Totals line */}
      <Typography sx={PANEL_STYLES.totalsLine}>
        Jugadas (Monto: {formatCurrency(totalMonto)}) (Pendientes de pago: {formatCurrency(totalPendiente)}) (Total de premios: {formatCurrency(totalPremios)})
      </Typography>

      {/* Plays grouped by lottery/draw */}
      {linesByDraw.size > 0 ? (
        Array.from(linesByDraw.entries()).map(([drawName, lines]) => (
          <Box key={drawName}>
            {/* Lottery header */}
            <Typography sx={PANEL_STYLES.lotteryHeader}>{drawName}</Typography>

            {/* Table header - only show for first lottery */}
            {Array.from(linesByDraw.keys())[0] === drawName && (
              <Box sx={PANEL_STYLES.tableHeader}>
                <Typography sx={PANEL_STYLES.tableHeaderCell}>Jugada</Typography>
                <Typography sx={PANEL_STYLES.tableHeaderCell}>Tipo de jugada</Typography>
                <Typography sx={PANEL_STYLES.tableHeaderCell}>Monto</Typography>
                <Typography sx={PANEL_STYLES.tableHeaderCell}>Premio</Typography>
                <Typography sx={PANEL_STYLES.tableHeaderCell}>Pagado</Typography>
              </Box>
            )}

            {/* Play rows */}
            {lines.map((line, index) => (
              <PlayRow
                key={`${drawName}-${line.betNumber}-${index}`}
                line={line}
                index={index}
                isWinner={line.prizeAmount > 0}
                isPending={ticket.estado === 'Pendiente'}
                onEditPrize={handleEditPrize}
              />
            ))}
          </Box>
        ))
      ) : (
        // Fallback when no lines data - show ticket info
        <Box sx={{ padding: '20px 15px', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '14px', color: 'rgb(102, 97, 91)', mb: 2 }}>
            Información del Ticket
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '12px', color: 'rgb(102, 97, 91)' }}>Usuario</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{ticket.usuario}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: 'rgb(102, 97, 91)' }}>Estado</Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color:
                    ticket.estado === 'Ganador' ? 'success.main' :
                    ticket.estado === 'Cancelado' ? 'error.main' :
                    ticket.estado === 'Perdedor' ? 'rgb(255, 152, 146)' : 'inherit',
                }}
              >
                {ticket.estado}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box>
              <Typography sx={{ fontSize: '12px', color: 'rgb(102, 97, 91)' }}>Monto</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'primary.main' }}>
                {formatCurrency(ticket.monto)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: 'rgb(102, 97, 91)' }}>Premio</Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: ticket.premio > 0 ? 'success.main' : 'inherit',
                }}
              >
                {formatCurrency(ticket.premio)}
              </Typography>
            </Box>
          </Box>
          {ticket.fechaCancelacion && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '12px', color: 'rgb(102, 97, 91)' }}>
                Fecha de Cancelación
              </Typography>
              <Typography sx={{ fontSize: '14px', color: 'error.main' }}>
                {ticket.fechaCancelacion}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Prize Edit Modal */}
      <PrizeEditModal
        open={prizeModalOpen}
        betNumber={selectedBetNumber}
        multipliers={DEFAULT_MULTIPLIERS}
        onClose={handleClosePrizeModal}
        onSave={handleSavePrizeMultipliers}
      />
    </Box>
  );
});

TicketDetailPanel.displayName = 'TicketDetailPanel';

export default TicketDetailPanel;
