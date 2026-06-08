/**
 * TicketDetailPanel Component
 *
 * Side panel showing detailed ticket information. Redesigned as a card with
 * a clean header, status chip, meta key/values, quick-stat chips, and a
 * proper MUI Table for plays — replacing the legacy Vue-mimicking grey UI.
 */

import { memo, useMemo, useState, useCallback, type FC, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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
  Chip,
  Stack,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Divider,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import ticketService from '../../../../../services/ticketService';
import type { LinePrizeMultipliers } from '../../../../../services/ticketService';
import type { TicketDetailPanelProps } from '../types';
import type { MappedTicketLine } from '../../../../../services/ticketService';

// ============================================================================
// Prize Edit Modal (unchanged behavior, kept inline for cohesion)
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

const DEFAULT_MULTIPLIERS: PrizeMultipliers = {
  firstPrize: 56,
  secondPrize: 12,
  thirdPrize: 4,
  doubles: 56,
};

const PrizeEditModal: FC<PrizeEditModalProps> = memo(({
  open,
  betNumber,
  multipliers,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
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
      <DialogTitle sx={{ fontSize: '16px' }}>
        {t('tickets.detail.modifyPrizes', { number: betNumber })}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('tickets.detail.prizeChangeWarning')}
        </Alert>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField label={t('tickets.detail.firstPrize')} type="number" value={formData.firstPrize} onChange={handleChange('firstPrize')} size="small" fullWidth />
          <TextField label={t('tickets.detail.secondPrize')} type="number" value={formData.secondPrize} onChange={handleChange('secondPrize')} size="small" fullWidth />
          <TextField label={t('tickets.detail.thirdPrize')} type="number" value={formData.thirdPrize} onChange={handleChange('thirdPrize')} size="small" fullWidth />
          <TextField label={t('tickets.detail.doubles')} type="number" value={formData.doubles} onChange={handleChange('doubles')} size="small" fullWidth />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">{t('common.cancel')}</Button>
        <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
          {t('tickets.detail.updatePlay')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

PrizeEditModal.displayName = 'PrizeEditModal';

// ============================================================================
// Style + color tokens
// ============================================================================

// Vivid gradient backgrounds + white text for the header status chip so the
// outcome of the ticket pops at first glance. Cancelled uses red too (per
// product feedback) since a cancellation is effectively a "not valid" state
// — visually grouping with Loser is clearer than a neutral grey.
interface StatusStyle {
  bg: string;
  /** Solid color used in non-gradient contexts (e.g. text tint). */
  tint: string;
  label: string;
  icon: 'trophy' | 'clock' | 'cancel' | 'check';
  shadow: string;
}
const STATUS_THEME: Record<string, StatusStyle> = {
  Ganador:   { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', tint: '#047857', label: 'ticketStatus.winner',    icon: 'trophy', shadow: 'rgba(16, 185, 129, 0.35)' },
  Pendiente: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', tint: '#b45309', label: 'ticketStatus.pending',   icon: 'clock',  shadow: 'rgba(245, 158, 11, 0.35)' },
  Perdedor:  { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', tint: '#b91c1c', label: 'ticketStatus.loser',     icon: 'cancel', shadow: 'rgba(239, 68, 68, 0.35)' },
  Cancelado: { bg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', tint: '#be123c', label: 'ticketStatus.cancelled', icon: 'cancel', shadow: 'rgba(244, 63, 94, 0.35)' },
  Pagado:    { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', tint: '#1d4ed8', label: 'ticketStatus.paid',      icon: 'check',  shadow: 'rgba(59, 130, 246, 0.35)' },
};

const STATUS_ICONS: Record<StatusStyle['icon'], ReactNode> = {
  trophy: <EmojiEventsOutlinedIcon sx={{ fontSize: 14 }} />,
  clock:  <ScheduleIcon            sx={{ fontSize: 14 }} />,
  cancel: <CancelIcon              sx={{ fontSize: 14 }} />,
  check:  <CheckCircleOutlineIcon  sx={{ fontSize: 14 }} />,
};

// Left-border accent + saturated row tint per play state. Brighter than
// the original pastels so winners / losers / pending pop at a glance.
const ROW_THEME = {
  winner:    { accent: '#047857', bg: '#a7f3d0' }, // emerald-200 over emerald-700 stripe
  loser:     { accent: '#b91c1c', bg: '#fecaca' }, // red-200 over red-700 stripe
  pending:   { accent: '#475569', bg: '#cbd5e1' }, // slate-300 over slate-600 stripe
  cancelled: { accent: '#64748b', bg: '#e2e8f0' }, // softer slate, same family
};

// ============================================================================
// Sub-components
// ============================================================================

const MetaRow: FC<{ icon: ReactNode; label: string; value: ReactNode }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
    <Box sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography sx={{ fontSize: '0.78rem', color: '#64748b', minWidth: 90 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 500, fontFamily: 'monospace' }}>{value}</Typography>
  </Box>
);

const QuickStat: FC<{ label: string; value: string; tint?: string }> = ({ label, value, tint = '#64748b' }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      px: 1.25,
      py: 1,
      borderRadius: '10px',
      border: '1px solid #e6e8ec',
      backgroundColor: '#fff',
      // Reserve a 2-line height for the label so single-word and two-word
      // labels (e.g. "Pending Payment") line up vertically across all
      // sibling QuickStats.
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1.1, mb: 0.4, minHeight: '1.72em' }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: tint, lineHeight: 1.1 }} noWrap>
      {value}
    </Typography>
  </Box>
);

interface PlayRowProps {
  line: MappedTicketLine;
  isWinner: boolean;
  isPending: boolean;
  isCancelled?: boolean;
  onEditPrize: (betNumber: string) => void;
  isOutOfScheduleSale?: boolean;
  isPreviousDay?: boolean;
  isFutureDay?: boolean;
}

const formatBetNumber = (num: string, betTypeName?: string): string => {
  if (num.length <= 2) return num;
  const name = (betTypeName || '').toUpperCase();
  if (name.includes('PAL') || name.includes('TRIPLETA') || name.includes('SUPER PAL')) {
    return num.match(/.{1,2}/g)?.join('-') || num;
  }
  return num;
};

const PlayRow: FC<PlayRowProps> = memo(({ line, isWinner, isPending, isCancelled, onEditPrize, isOutOfScheduleSale, isPreviousDay, isFutureDay }) => {
  const theme = isCancelled ? ROW_THEME.cancelled
    : isWinner ? ROW_THEME.winner
    : isPending ? ROW_THEME.pending
    : ROW_THEME.loser;

  const handleEditClick = useCallback(() => {
    onEditPrize(line.betNumber);
  }, [onEditPrize, line.betNumber]);

  return (
    <TableRow
      sx={{
        backgroundColor: theme.bg,
        // Accent stripe on the left edge encodes status without colorizing
        // the whole row.
        boxShadow: `inset 3px 0 0 ${theme.accent}`,
        '& td': { fontSize: '0.78rem', py: 0.6, color: '#1e293b' },
      }}
    >
      <TableCell sx={{ pl: 1.5 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
          <Typography component="span" sx={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>
            {formatBetNumber(line.betNumber, line.betTypeName)}
          </Typography>
          {isOutOfScheduleSale && (
            <Tooltip title="Fuera de horario" arrow>
              <ScheduleIcon sx={{ fontSize: 14, color: '#e53935' }} />
            </Tooltip>
          )}
          {isPreviousDay && (
            <Tooltip title="Venta del día anterior" arrow>
              <ArrowBackIcon sx={{ fontSize: 14, color: '#ff9800' }} />
            </Tooltip>
          )}
          {isFutureDay && (
            <Tooltip title="Venta futura" arrow>
              <ArrowForwardIcon sx={{ fontSize: 14, color: '#2196f3' }} />
            </Tooltip>
          )}
        </Box>
      </TableCell>
      <TableCell>{line.betTypeName || '-'}</TableCell>
      <TableCell align="right">{formatCurrency(line.betAmount)}</TableCell>
      <TableCell align="right">
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
          <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: isWinner ? 700 : 400, color: isWinner ? '#047857' : 'inherit' }}>
            {line.prizeAmount > 0 ? formatCurrency(line.prizeAmount) : '—'}
          </Typography>
          <IconButton size="small" onClick={handleEditClick} sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#475569' } }}>
            <EditIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Box>
      </TableCell>
      <TableCell align="center">—</TableCell>
    </TableRow>
  );
});

PlayRow.displayName = 'PlayRow';

// ============================================================================
// Main Component
// ============================================================================

const TicketDetailPanel: FC<TicketDetailPanelProps> = memo(({ ticket, onClose, onPrev, onNext, positionLabel }) => {
  const { t } = useTranslation();
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [selectedBetNumber, setSelectedBetNumber] = useState('');

  // Group lines by draw/lottery for the per-draw sub-tables.
  const linesByDraw = useMemo(() => {
    if (!ticket.lines || ticket.lines.length === 0) return new Map<string, MappedTicketLine[]>();
    const grouped = new Map<string, MappedTicketLine[]>();
    for (const line of ticket.lines) {
      const drawName = line.drawName || t('tickets.detail.noDraw');
      const existing = grouped.get(drawName) || [];
      grouped.set(drawName, [...existing, line]);
    }
    return grouped;
  }, [ticket.lines, t]);

  // Roll-up stats from lines; fall back to ticket-level fields when lines
  // weren't loaded (slim mode).
  const { totalMonto, totalPremios, totalPendiente, playCount } = useMemo(() => {
    if (!ticket.lines || ticket.lines.length === 0) {
      return { totalMonto: ticket.monto, totalPremios: ticket.premio, totalPendiente: 0, playCount: 0 };
    }
    const monto = ticket.lines.reduce((sum, line) => sum + line.betAmount, 0);
    const premios = ticket.lines.reduce((sum, line) => sum + line.prizeAmount, 0);
    const pendiente = ticket.estado === 'Ganador' || ticket.estado === 'Pendiente' ? premios : 0;
    return { totalMonto: monto || ticket.monto, totalPremios: premios || ticket.premio, totalPendiente: pendiente, playCount: ticket.lines.length };
  }, [ticket]);

  const handleEditPrize = useCallback((betNumber: string) => {
    setSelectedBetNumber(betNumber);
    setPrizeModalOpen(true);
  }, []);

  const handleClosePrizeModal = useCallback(() => {
    setPrizeModalOpen(false);
    setSelectedBetNumber('');
  }, []);

  const handleSavePrizeMultipliers = useCallback(async (multipliers: PrizeMultipliers) => {
    try {
      const line = ticket.lines?.find(l => l.betNumber === selectedBetNumber);
      const lineId = line?.drawId || 0;
      const apiMultipliers: LinePrizeMultipliers = {
        firstPrize: multipliers.firstPrize,
        secondPrize: multipliers.secondPrize,
        thirdPrize: multipliers.thirdPrize,
        doubles: multipliers.doubles,
      };
      const result = await ticketService.updateLinePrizeMultipliers(ticket.id, lineId, selectedBetNumber, apiMultipliers);
      if (result.success) console.log('Prize multipliers updated:', result.message);
    } catch (error) {
      console.error('Error saving prize multipliers:', error);
    } finally {
      handleClosePrizeModal();
    }
  }, [ticket.id, ticket.lines, selectedBetNumber, handleClosePrizeModal]);

  const statusInfo = STATUS_THEME[ticket.estado];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid #e6e8ec',
        backgroundColor: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Header — ticket code + status chip + close */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <ConfirmationNumberOutlinedIcon sx={{ color: '#6366f1', fontSize: 22 }} />
        <Typography sx={{ flex: 1, fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#1e293b', minWidth: 0 }} noWrap>
          {ticket.id}-{ticket.numero}
        </Typography>

        {/* Prev / position / Next — only render when handlers are supplied
            so the panel still works in isolation (e.g. embedded views). */}
        {(onPrev || onNext) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mr: 0.5 }}>
            <Tooltip title={t('common.previous', { defaultValue: 'Anterior' })} arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={onPrev}
                  disabled={!onPrev}
                  sx={{
                    color: '#475569',
                    bgcolor: '#f1f5f9',
                    width: 28,
                    height: 28,
                    '&:hover': { bgcolor: '#e2e8f0', color: '#1e293b' },
                    '&.Mui-disabled': { bgcolor: '#f8fafc', color: '#cbd5e1' },
                  }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {positionLabel && (
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#64748b',
                  px: 0.5,
                  minWidth: 36,
                  textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {positionLabel}
              </Typography>
            )}
            <Tooltip title={t('common.next', { defaultValue: 'Siguiente' })} arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={onNext}
                  disabled={!onNext}
                  sx={{
                    color: '#475569',
                    bgcolor: '#f1f5f9',
                    width: 28,
                    height: 28,
                    '&:hover': { bgcolor: '#e2e8f0', color: '#1e293b' },
                    '&.Mui-disabled': { bgcolor: '#f8fafc', color: '#cbd5e1' },
                  }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}

        {statusInfo && (
          <Chip
            icon={STATUS_ICONS[statusInfo.icon] as React.ReactElement}
            label={t(statusInfo.label)}
            size="small"
            sx={{
              height: 26,
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#fff',
              background: statusInfo.bg,
              border: 'none',
              boxShadow: `0 2px 6px ${statusInfo.shadow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
              '& .MuiChip-icon': { color: '#fff', ml: 0.75, mr: -0.25 },
              '& .MuiChip-label': { px: 1.1 },
            }}
          />
        )}
        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Meta info */}
      <Box sx={{ px: 2, py: 1.25 }}>
        <MetaRow
          icon={<TagOutlinedIcon sx={{ fontSize: 16 }} />}
          label={t('tickets.detail.magicNumber')}
          value={ticket.numero.replace(/-/g, '').toUpperCase()}
        />
        <MetaRow
          icon={<AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />}
          label={t('tickets.detail.firstPlayDate')}
          value={ticket.fecha}
        />
        <MetaRow
          icon={<PrintOutlinedIcon sx={{ fontSize: 16 }} />}
          label={t('tickets.detail.printDate')}
          value={ticket.fecha}
        />
      </Box>

      {/* Cancelled-out-of-time banner */}
      {ticket.isCancelledOutOfTime && (
        <Box sx={{ mx: 2, mb: 1.5 }}>
          <Alert
            icon={<CancelIcon fontSize="small" />}
            severity="warning"
            sx={{ py: 0.5, '& .MuiAlert-message': { fontSize: '0.78rem', fontWeight: 600 } }}
          >
            {t('tickets.monitoring.cancelledOutOfTime')}
          </Alert>
        </Box>
      )}

      {/* Quick stats — 4 mini cards */}
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Stack direction="row" spacing={1}>
          <QuickStat label={t('common.plays')} value={String(playCount)} tint="#6366f1" />
          <QuickStat label={t('common.amount')} value={formatCurrency(totalMonto)} tint="#1e293b" />
          <QuickStat label={t('common.prize')} value={formatCurrency(totalPremios)} tint={totalPremios > 0 ? '#10b981' : '#1e293b'} />
          <QuickStat label={t('tickets.detail.pendingPayment')} value={formatCurrency(totalPendiente)} tint={totalPendiente > 0 ? '#f59e0b' : '#1e293b'} />
        </Stack>
        {ticket.descuento > 0 && (
          <Typography sx={{ mt: 1, fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
            {t('tickets.detail.discount')}: <strong>{formatCurrency(ticket.descuento)}</strong>
          </Typography>
        )}
      </Box>

      {/* Legend — 3 equal-width vivid cards (winner / loser / pending). */}
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Stack direction="row" spacing={1}>
          {[
            { label: t('tickets.detail.winningPlay'), icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 16 }} />, bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
            { label: t('tickets.detail.losingPlay'),  icon: <CancelIcon            sx={{ fontSize: 16 }} />, bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
            { label: t('ticketStatus.pending'),       icon: <ScheduleIcon          sx={{ fontSize: 16 }} />, bg: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.6,
                px: 1,
                py: 0.85,
                borderRadius: '10px',
                background: item.bg,
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                boxShadow: '0 1px 3px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              {item.icon}
              <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</Box>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* Plays per draw */}
      {linesByDraw.size > 0 ? (
        Array.from(linesByDraw.entries()).map(([drawName, lines]) => (
          <Box key={drawName}>
            <Box sx={{ px: 2, py: 1, backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', borderTop: '1px solid #f1f5f9' }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569' }}>
                {drawName}
              </Typography>
            </Box>
            {/* Horizontal scroll when the detail panel gets narrow — keeps
                the rightmost columns (Prize, Paid) reachable instead of
                clipping under the Card's overflow: hidden. */}
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 380, '& th': { fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#64748b', py: 0.75, borderBottom: '1px solid #f1f5f9' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 1.5 }}>{t('common.play')}</TableCell>
                    <TableCell>{t('tickets.plays.playType')}</TableCell>
                    <TableCell align="right">{t('common.amount')}</TableCell>
                    <TableCell align="right">{t('common.prize')}</TableCell>
                    <TableCell align="center">{t('ticketStatus.paid')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((line, index) => (
                    <PlayRow
                      key={`${drawName}-${line.betNumber}-${index}`}
                      line={line}
                      isWinner={line.prizeAmount > 0}
                      isPending={line.lineStatus === 'pending' || (!line.lineStatus && ticket.estado === 'Pendiente')}
                      isCancelled={ticket.estado === 'Cancelado'}
                      onEditPrize={handleEditPrize}
                      isOutOfScheduleSale={line.isOutOfScheduleSale}
                      isPreviousDay={ticket.isPreviousDay}
                      isFutureDay={ticket.isFutureDay}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      ) : (
        // Slim mode — no lines loaded, show summary cards
        <Box sx={{ px: 2, py: 2.5 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 1.5, textAlign: 'center' }}>
            {t('tickets.detail.ticketInfo')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <QuickStat label={t('common.user')} value={ticket.usuario || '-'} />
            <QuickStat
              label={t('common.status')}
              value={statusInfo ? t(statusInfo.label) : ticket.estado}
              tint={statusInfo?.tint}
            />
          </Stack>
          {ticket.fechaCancelacion && (
            <Box sx={{ mt: 1.5, p: 1.25, borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#9f1239', letterSpacing: '0.05em', mb: 0.3 }}>
                {t('tickets.anomalies.cancellationDate')}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#7f1d1d', fontFamily: 'monospace' }}>
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
    </Card>
  );
});

TicketDetailPanel.displayName = 'TicketDetailPanel';

export default TicketDetailPanel;
