import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Link as MuiLink,
  Tabs,
  Tab,
} from '@mui/material';
import { getTodayDate } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  getWarnings,
  WARNING_TYPE_LABELS,
  type Warning,
  type WarningType,
  type WarningSeverity,
} from '@services/warningService';

const TICKET_TYPES: WarningType[] = [
  'TICKET_CREATED_LATE',
  'TICKET_CANCELLED_LATE',
  'TICKET_CANCELLED_AFTER_DRAW',
  'TICKET_WINNER_CANCELLED',
  'TICKET_BYPASS_VALIDATION',
];

const SEVERITY_COLORS: Record<WarningSeverity, { bg: string; text: string }> = {
  high: { bg: '#ffebee', text: '#c62828' },
  medium: { bg: '#fff3e0', text: '#e65100' },
  low: { bg: '#e3f2fd', text: '#1565c0' },
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SectionHeader: React.FC<{ title: string; count: number }> = ({ title, count }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Typography
      variant="h6"
      sx={{ color: '#2c2c2c', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}
    >
      {title}
    </Typography>
    <Chip
      label={count}
      size="small"
      sx={{
        bgcolor: count > 0 ? '#d32f2f' : '#e0e0e0',
        color: count > 0 ? 'white' : '#666',
        fontWeight: 'bold',
        height: 22,
        minWidth: 28,
      }}
    />
  </Box>
);

const renderChip = (w: Warning) => {
  const colors = SEVERITY_COLORS[w.severity] || SEVERITY_COLORS.medium;
  return (
    <Chip
      label={WARNING_TYPE_LABELS[w.warningType] || w.warningType}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.text,
        fontWeight: 500,
        fontSize: '11px',
      }}
    />
  );
};

interface ResultChangeMeta {
  drawName?: string;
  previousNumber?: string;
  newNumber?: string;
  previousAdditionalNumber?: string;
  newAdditionalNumber?: string;
}

const parseResultChangeMeta = (metadataJson?: string | null): ResultChangeMeta => {
  if (!metadataJson) return {};
  try {
    return JSON.parse(metadataJson) as ResultChangeMeta;
  } catch {
    return {};
  }
};

/** Split the main winning number into 2-digit positions (Quiniela 1ra/2da/3ra style). */
const splitWinning = (s?: string): string[] => {
  if (!s) return [];
  const trimmed = s.trim();
  if (/[,\-\s]/.test(trimmed)) {
    return trimmed.split(/[,\-\s]+/).map((n) => n.trim()).filter(Boolean);
  }
  if (/^\d+$/.test(trimmed) && trimmed.length % 2 === 0 && trimmed.length > 2) {
    const out: string[] = [];
    for (let i = 0; i < trimmed.length; i += 2) out.push(trimmed.slice(i, i + 2));
    return out;
  }
  return [trimmed];
};

/**
 * Split the additional number for US-style draws by widths.
 *  - 12 digits → cash3 (3) + play4 (4) + pick5 (5)
 *  - 7 digits  → cash3 (3) + play4 (4)
 *  - 5 digits  → pick5
 *  - 4 digits  → play4
 *  - 3 digits  → cash3
 *  - else      → keep as one number
 */
const splitAdditional = (s?: string): string[] => {
  if (!s) return [];
  const trimmed = s.trim();
  if (/[,\-\s]/.test(trimmed)) {
    return trimmed.split(/[,\-\s]+/).map((n) => n.trim()).filter(Boolean);
  }
  if (/^\d+$/.test(trimmed)) {
    switch (trimmed.length) {
      case 12:
        return [trimmed.slice(0, 3), trimmed.slice(3, 7), trimmed.slice(7)];
      case 7:
        return [trimmed.slice(0, 3), trimmed.slice(3)];
      case 5:
      case 4:
      case 3:
        return [trimmed];
      default:
        break;
    }
  }
  return [trimmed];
};

const buildPositions = (
  winning?: string,
  additional?: string
): string[] => [...splitWinning(winning), ...splitAdditional(additional)];

const renderResultDiff = (meta: ResultChangeMeta) => {
  const prev = buildPositions(meta.previousNumber, meta.previousAdditionalNumber);
  const next = buildPositions(meta.newNumber, meta.newAdditionalNumber);
  const len = Math.max(prev.length, next.length);
  if (len === 0) return <span style={{ color: '#888' }}>-</span>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, fontFamily: 'monospace' }}>
      {Array.from({ length: len }).map((_, i) => {
        const a = prev[i] ?? '—';
        const b = next[i] ?? '—';
        const changed = a !== b;
        return (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '13px',
              color: changed ? '#c62828' : '#2c2c2c',
              fontWeight: changed ? 600 : 400,
            }}
          >
            <Box component="span" sx={{ minWidth: 44, textAlign: 'right' }}>{a}</Box>
            <Box component="span" sx={{ color: changed ? '#c62828' : '#888' }}>→</Box>
            <Box component="span" sx={{ minWidth: 44 }}>{b}</Box>
          </Box>
        );
      })}
    </Box>
  );
};

const WarningsList: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<string>(getTodayDate());
  const [filter, setFilter] = useState<string>('');
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTicketClick = (w: Warning) => {
    if (!w.ticketId) return;
    const params = new URLSearchParams();
    params.set('ticketId', String(w.ticketId));
    if (w.bettingPoolId) params.set('bettingPoolId', String(w.bettingPoolId));
    if (w.ticketCreatedAt) {
      const d = new Date(w.ticketCreatedAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      params.set('date', `${yyyy}-${mm}-${dd}`);
    }
    navigate(`/tickets/monitoring?${params.toString()}`);
  };

  const loadWarnings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWarnings(date);
      setWarnings(data);
    } catch (err) {
      console.error('Error loading warnings:', err);
      setWarnings([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadWarnings();
  }, [loadWarnings]);

  const matchesFilter = (w: Warning): boolean => {
    if (!filter) return true;
    const term = filter.toLowerCase();
    return (
      (w.message || '').toLowerCase().includes(term) ||
      (w.bettingPoolName || '').toLowerCase().includes(term) ||
      (w.bettingPoolCode || '').toLowerCase().includes(term) ||
      (w.username || '').toLowerCase().includes(term) ||
      WARNING_TYPE_LABELS[w.warningType].toLowerCase().includes(term)
    );
  };

  const ticketWarnings = useMemo(
    () => warnings.filter((w) => TICKET_TYPES.includes(w.warningType) && matchesFilter(w)),
    [warnings, filter]
  );

  const resultChangeWarnings = useMemo(
    () =>
      warnings.filter(
        (w) => w.warningType === 'RESULT_CHANGED_AFTER_PRIZES' && matchesFilter(w)
      ),
    [warnings, filter]
  );

  const resultLateWarnings = useMemo(
    () =>
      warnings.filter((w) => w.warningType === 'RESULT_PUBLICATION_LATE' && matchesFilter(w)),
    [warnings, filter]
  );

  const totalTickets = warnings.filter((w) => TICKET_TYPES.includes(w.warningType)).length;
  const totalResultChanges = warnings.filter(
    (w) => w.warningType === 'RESULT_CHANGED_AFTER_PRIZES'
  ).length;
  const totalLateResults = warnings.filter(
    (w) => w.warningType === 'RESULT_PUBLICATION_LATE'
  ).length;

  const tabBadge = (count: number) => (
    <Chip
      label={count}
      size="small"
      sx={{
        ml: 1,
        bgcolor: count > 0 ? '#d32f2f' : '#e0e0e0',
        color: count > 0 ? 'white' : '#666',
        fontWeight: 'bold',
        height: 20,
        minWidth: 24,
      }}
    />
  );

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{
              color: '#2c2c2c',
              mb: 3,
              fontWeight: 500,
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Advertencias
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              type="date"
              label="Fecha"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Filtrar"
              placeholder="Banca, usuario, mensaje..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 280 }}
            />
            {loading && <CircularProgress size={24} sx={{ color: '#6366f1' }} />}
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 3,
              '& .MuiTab-root': { fontFamily: 'Montserrat, sans-serif', textTransform: 'none' },
              '& .Mui-selected': { color: '#6366f1' },
            }}
            TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Tickets
                  {tabBadge(totalTickets + totalResultChanges)}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Resultados no publicados
                  {tabBadge(totalLateResults)}
                </Box>
              }
            />
          </Tabs>

          {activeTab === 0 && (
            <>
              {/* Tickets table */}
              <SectionHeader title="Tickets" count={totalTickets} />
              <Table size="small" sx={{ mb: 4 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Banca</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ticket</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Monto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Premio</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mensaje</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticketWarnings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3, color: '#888' }}>
                        {loading ? 'Cargando...' : 'No hay advertencias de tickets'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ticketWarnings.map((w) => (
                      <TableRow key={w.warningId} hover>
                        <TableCell>{renderChip(w)}</TableCell>
                        <TableCell>{w.bettingPoolCode || w.bettingPoolName || '-'}</TableCell>
                        <TableCell>{w.username || '-'}</TableCell>
                        <TableCell>
                          {w.ticketId ? (
                            <MuiLink
                              component="button"
                              onClick={() => handleTicketClick(w)}
                              sx={{
                                color: '#6366f1',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontWeight: 500,
                                background: 'none',
                                border: 'none',
                                p: 0,
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                '&:hover': { color: '#4f46e5' },
                              }}
                            >
                              {w.ticketCode || `#${w.ticketId}`}
                            </MuiLink>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {w.ticketAmount != null ? formatCurrency(w.ticketAmount) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {w.ticketPrize != null && w.ticketPrize > 0
                            ? formatCurrency(w.ticketPrize)
                            : '-'}
                        </TableCell>
                        <TableCell>{w.message || '-'}</TableCell>
                        <TableCell>{formatDateTime(w.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Cambio de resultados table */}
              <SectionHeader title="Cambio de resultados" count={totalResultChanges} />
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sorteo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Cambios</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultChangeWarnings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#888' }}>
                        {loading ? 'Cargando...' : 'No hay cambios de resultados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    resultChangeWarnings.map((w) => {
                      const meta = parseResultChangeMeta(w.metadataJson);
                      return (
                        <TableRow key={w.warningId} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {meta.drawName || '-'}
                          </TableCell>
                          <TableCell>{w.username || '-'}</TableCell>
                          <TableCell>{renderResultDiff(meta)}</TableCell>
                          <TableCell>{formatDateTime(w.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </>
          )}

          {activeTab === 1 && (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mensaje</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultLateWarnings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: '#888' }}>
                      {loading ? 'Cargando...' : 'No hay resultados pendientes de publicar'}
                    </TableCell>
                  </TableRow>
                ) : (
                  resultLateWarnings.map((w) => (
                    <TableRow key={w.warningId} hover>
                      <TableCell>{renderChip(w)}</TableCell>
                      <TableCell>{w.message || '-'}</TableCell>
                      <TableCell>{formatDateTime(w.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default WarningsList;
